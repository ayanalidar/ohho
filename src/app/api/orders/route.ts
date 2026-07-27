import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";

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
      include: { items: true },
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
    const { items, subtotal, deliveryFee, taxes, total, mode, address, paymentMethod, notes } = body || {};

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }
    if (!subtotal || !total) {
      return NextResponse.json({ error: "Missing totals" }, { status: 400 });
    }

    const order = await db.order.create({
      data: {
        orderId: genOrderId(),
        userId: user.id,
        subtotal: Number(subtotal),
        deliveryFee: Number(deliveryFee || 0),
        taxes: Number(taxes || 0),
        total: Number(total),
        mode: String(mode || "delivery"),
        status: "PREPARING",
        address: address ? String(address) : null,
        paymentMethod: String(paymentMethod || "upi"),
        paymentStatus: "PAID",
        invoiceNumber: genInvoiceNumber(),
        etaSeconds: 1500,
        progress: 0,
        notes: notes ? String(notes) : null,
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

    // Award loyalty points: 1 point per ₹10 spent (basic tier)
    const earnedPoints = Math.floor(Number(total) / 10);
    if (earnedPoints > 0) {
      await db.user.update({
        where: { id: user.id },
        data: { loyaltyPoints: { increment: earnedPoints } },
      });
    }

    return NextResponse.json({ order, earnedPoints });
  } catch (e: any) {
    console.error("create order error", e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
