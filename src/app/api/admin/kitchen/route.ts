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
    // Admin sees all active orders, operator sees only their location's, customer sees their own
    let where: any = {};
    if (user.role === "OPERATOR" && user.locationId) {
      where = { locationId: user.locationId, status: { notIn: ["ARRIVED", "CANCELLED"] } };
    } else if (user.role === "ADMIN") {
      where = { status: { notIn: ["ARRIVED", "CANCELLED"] } };
    } else {
      where = { userId: user.id, status: { notIn: ["ARRIVED", "CANCELLED"] } };
    }
    const activeOrders = await db.order.findMany({
      where,
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
