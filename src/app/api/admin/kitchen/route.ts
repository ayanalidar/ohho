import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";

// GET /api/admin/kitchen — live kitchen pipeline (all active orders grouped by status)
export async function GET() {
  try {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await verifySession(token);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // Both admin (all) and customer (own active orders) can view
    const where = user.role === "ADMIN" ? {} : { userId: user.id };
    const activeOrders = await db.order.findMany({
      where: { ...where, status: { notIn: ["ARRIVED", "CANCELLED"] } },
      include: {
        items: true,
        user: { select: { name: true, email: true, phone: true } },
      },
      orderBy: { createdAt: "asc" },
    });
    const grouped = {
      PREPARING: activeOrders.filter((o) => o.status === "PREPARING"),
      PICKED: activeOrders.filter((o) => o.status === "PICKED"),
      ENROUTE: activeOrders.filter((o) => o.status === "ENROUTE"),
      NEAR: activeOrders.filter((o) => o.status === "NEAR"),
    };
    return NextResponse.json({
      pipeline: grouped,
      totalActive: activeOrders.length,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
