import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";

// GET /api/admin/stats — admin dashboard stats
export async function GET() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await verifySession(token);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [totalOrders, totalUsers, totalCustomers, totalAdmins, revenueAgg, activeOrdersAgg] = await Promise.all([
    db.order.count(),
    db.user.count(),
    db.user.count({ where: { role: "CUSTOMER" } }),
    db.user.count({ where: { role: "ADMIN" } }),
    db.order.aggregate({ _sum: { total: true } }),
    db.order.count({ where: { status: { not: "ARRIVED" } } }),
  ]);

  // Last 7 days revenue
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentOrders = await db.order.findMany({
    where: { createdAt: { gte: sevenDaysAgo } },
    select: { total: true, createdAt: true, status: true },
    orderBy: { createdAt: "asc" },
  });
  const daily: { date: string; revenue: number; orders: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const dayStr = d.toISOString().slice(0, 10);
    const dayOrders = recentOrders.filter(
      (o) => o.createdAt.toISOString().slice(0, 10) === dayStr
    );
    daily.push({
      date: dayStr,
      revenue: dayOrders.reduce((n, o) => n + o.total, 0),
      orders: dayOrders.length,
    });
  }

  // Top items by order count
  const allItems = await db.orderItem.findMany({
    select: { name: true, emoji: true, qty: true, price: true },
  });
  const itemMap = new Map<string, { name: string; emoji: string; qty: number; revenue: number }>();
  for (const it of allItems) {
    const cur = itemMap.get(it.name) || { name: it.name, emoji: it.emoji, qty: 0, revenue: 0 };
    cur.qty += it.qty;
    cur.revenue += it.qty * it.price;
    itemMap.set(it.name, cur);
  }
  const topItems = Array.from(itemMap.values())
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  return NextResponse.json({
    totalOrders,
    totalUsers,
    totalCustomers,
    totalAdmins,
    totalRevenue: revenueAgg._sum.total || 0,
    activeOrders: activeOrdersAgg,
    avgOrderValue: totalOrders > 0 ? Math.round((revenueAgg._sum.total || 0) / totalOrders) : 0,
    daily,
    topItems,
  });
}
