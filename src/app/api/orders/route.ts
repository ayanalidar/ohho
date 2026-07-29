import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifySession, SESSION_COOKIE, signSession } from "@/lib/auth";
import type { SessionUser } from "@/lib/auth";

function genOrderId() {
  return (
    "OHHO-" +
    Math.random().toString(36).slice(2, 7).toUpperCase() +
    "-" +
    Date.now().toString(36).slice(-4).toUpperCase()
  );
}

function genInvoiceNumber() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const seq = String(Math.floor(Math.random() * 90000) + 10000);
  return `INV-${y}${m}-${seq}`;
}

export async function GET(req: NextRequest) {
  try {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const user = await verifySession(token);
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const url = new URL(req.url);
    const all = url.searchParams.get("all") === "1";
    if (all && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const where = all ? {} : { userId: user.id };
    const orders = await db.order.findMany({
      where,
      include: { items: true, review: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ orders });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const user = await verifySession(token);
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const body = await req.json();
    const {
      items,
      subtotal,
      deliveryFee,
      taxes,
      total,
      mode,
      address,
      paymentMethod,
      notes,
      locationId,
      useWallet,
    } = body || {};

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }
    if (!subtotal || !total) {
      return NextResponse.json({ error: "Missing totals" }, { status: 400 });
    }

    // Handle wallet debit
    let walletDebit = 0;
    let finalTotal = Number(total);
    let updatedWalletBalance = user.walletBalance;
    if (useWallet && user.walletBalance > 0) {
      walletDebit = Math.min(user.walletBalance, Math.round(Number(total) * 100));
      finalTotal = Number(total) - walletDebit / 100;
      updatedWalletBalance = user.walletBalance - walletDebit;
    }

    const order = await db.order.create({
      data: {
        orderId: genOrderId(),
        userId: user.id,
        subtotal: Number(subtotal),
        deliveryFee: Number(deliveryFee || 0),
        taxes: Number(taxes || 0),
        walletDebit,
        total: Math.round(finalTotal * 100) / 100,
        mode: String(mode || "delivery"),
        status: "PREPARING",
        address: address ? String(address) : null,
        paymentMethod: String(paymentMethod || "upi"),
        paymentStatus: "PAID",
        invoiceNumber: genInvoiceNumber(),
        etaSeconds: 1500,
        progress: 0,
        notes: notes ? String(notes) : null,
        locationId: locationId ? String(locationId) : null,
        items: {
          create: items.map((it: any) => ({
            itemId: String(it.itemId),
            name: String(it.name),
            emoji: String(it.emoji || ""),
            image: String(it.image || ""),
            price: Number(it.price),
            qty: Number(it.qty),
            addOns: it.addOns ? JSON.stringify(it.addOns) : null,
          })),
        },
      },
      include: { items: true },
    });

    // Debit wallet if used
    if (walletDebit > 0) {
      await db.user.update({
        where: { id: user.id },
        data: { walletBalance: updatedWalletBalance },
      });
    }

    // Award loyalty points: 1 point per ₹10 spent (basic tier)
    const earnedPoints = Math.floor(finalTotal / 10);
    if (earnedPoints > 0) {
      await db.user.update({
        where: { id: user.id },
        data: { loyaltyPoints: { increment: earnedPoints } },
      });
    }

    // If this is the user's first order AND they were referred, double the referrer bonus
    const userOrdersCount = await db.order.count({ where: { userId: user.id } });
    if (userOrdersCount === 1 && user.referralCode) {
      // Wait — referralCode is the user's OWN code. We need referredBy.
      // Fetch from DB since SessionUser doesn't carry referredBy
      const dbUser = await db.user.findUnique({ where: { id: user.id }, select: { referredBy: true } });
      if (dbUser?.referredBy) {
        const referrer = await db.user.findUnique({ where: { referralCode: dbUser.referredBy } });
        if (referrer) {
          await db.user.update({
            where: { id: referrer.id },
            data: { loyaltyPoints: { increment: 100 } },
          });
          await db.referralRedemption.create({
            data: {
              referrerId: referrer.id,
              refereeId: user.id,
              code: dbUser.referredBy,
              orderId: order.id,
              rewardGiven: true,
            },
          });
        }
      }
    }

    // Re-sign session with updated wallet balance + loyalty points
    const freshUser = await db.user.findUnique({
      where: { id: user.id },
      select: { walletBalance: true, loyaltyPoints: true, role: true, name: true, email: true, referralCode: true, phone: true },
    });
    if (freshUser) {
      const sessionUser: SessionUser = {
        id: user.id,
        email: freshUser.email,
        name: freshUser.name,
        role: freshUser.role as "CUSTOMER" | "ADMIN",
        loyaltyPoints: freshUser.loyaltyPoints,
        walletBalance: freshUser.walletBalance,
        referralCode: freshUser.referralCode,
        phone: freshUser.phone,
      };
      const newToken = await signSession(sessionUser);
      const res = NextResponse.json({
        order,
        earnedPoints,
        walletUsed: walletDebit / 100,
        newWalletBalance: freshUser.walletBalance / 100,
        sessionUser,
      });
      res.cookies.set(SESSION_COOKIE, newToken, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
      });
      return res;
    }

    return NextResponse.json({ order, earnedPoints, walletUsed: walletDebit / 100 });
  } catch (e: any) {
    console.error("create order error", e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
