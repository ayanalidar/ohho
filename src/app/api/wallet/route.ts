import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifySession, SESSION_COOKIE, signSession } from "@/lib/auth";
import type { SessionUser } from "@/lib/auth";

// GET — wallet balance + transaction history (simplified — no separate tx table, use orders)
export async function GET() {
  try {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const user = await verifySession(token);
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const dbUser = await db.user.findUnique({
      where: { id: user.id },
      select: { walletBalance: true, upiId: true },
    });
    // Get orders that used wallet debit for history
    const walletOrders = await db.order.findMany({
      where: { userId: user.id, walletDebit: { gt: 0 } },
      select: { orderId: true, walletDebit: true, total: true, createdAt: true, status: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    return NextResponse.json({
      balance: dbUser?.walletBalance || 0,
      balanceRupees: (dbUser?.walletBalance || 0) / 100,
      upiId: dbUser?.upiId || null,
      transactions: walletOrders.map((o) => ({
        type: "debit",
        amount: o.walletDebit,
        orderId: o.orderId,
        date: o.createdAt,
        status: o.status,
      })),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}

// POST — reload wallet (simulated — in production this would call Razorpay/UPI gateway)
export async function POST(req: NextRequest) {
  try {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const user = await verifySession(token);
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const body = await req.json();
    const { amountRupees } = body || {};
    const amount = Number(amountRupees);
    if (!amount || amount < 100) {
      return NextResponse.json({ error: "Minimum reload ₹100" }, { status: 400 });
    }
    // Bonus: 10% on reloads ≥ ₹500, 5% on ≥ ₹200
    let bonus = 0;
    if (amount >= 500) bonus = Math.round(amount * 0.10);
    else if (amount >= 200) bonus = Math.round(amount * 0.05);
    const totalPaise = (amount + bonus) * 100;
    await db.user.update({
      where: { id: user.id },
      data: { walletBalance: { increment: totalPaise } },
    });
    // Re-sign session with new balance
    const dbUser = await db.user.findUnique({
      where: { id: user.id },
      select: { walletBalance: true, loyaltyPoints: true, role: true, name: true, email: true, referralCode: true, phone: true },
    });
    const sessionUser: SessionUser = {
      id: user.id,
      email: dbUser!.email,
      name: dbUser!.name,
      role: dbUser!.role as "CUSTOMER" | "ADMIN",
      loyaltyPoints: dbUser!.loyaltyPoints,
      walletBalance: dbUser!.walletBalance,
      referralCode: dbUser!.referralCode,
      phone: dbUser!.phone,
    };
    const newToken = await signSession(sessionUser);
    const res = NextResponse.json({
      ok: true,
      added: totalPaise / 100,
      bonus,
      newBalance: dbUser!.walletBalance / 100,
    });
    res.cookies.set(SESSION_COOKIE, newToken, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });
    return res;
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
