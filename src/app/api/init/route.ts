import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/init — returns ALL data needed for initial page render in ONE request
// Optimized: uses parallel Promise.all with the default db client (transaction pooler)
// to minimize total round-trips. Each query runs independently.
export async function GET() {
  try {
    const [
      menuItems,
      timelineEras,
      locations,
      cateringPackages,
      todaySpecial,
      siteContent,
      recentOrders,
    ] = await Promise.all([
      db.menuItem.findMany({
        where: { available: true },
        orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
      }),
      db.timelineEra.findMany({ orderBy: { sortOrder: "asc" } }),
      db.location.findMany({ where: { active: true }, orderBy: { createdAt: "asc" } }),
      db.cateringPackage.findMany({ where: { available: true }, orderBy: { sortOrder: "asc" } }),
      db.todaySpecial.findFirst({ where: { active: true }, orderBy: { updatedAt: "desc" } }),
      db.siteContent.findMany(),
      db.order.findMany({
        where: { status: { notIn: ["CANCELLED"] } },
        include: {
          items: { select: { name: true, emoji: true, qty: true } },
          user: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
    ]);

    const contentMap: Record<string, string> = {};
    for (const c of siteContent) contentMap[c.key] = c.value;

    const recent = recentOrders.map((o) => ({
      orderId: o.orderId,
      firstName: (o.user?.name || "Customer").split(" ")[0],
      items: o.items.map((it) => `${it.emoji} ${it.name}`),
      total: o.total,
      mode: o.mode,
      timeAgo: getRelativeTime(o.createdAt),
    }));

    // Set cache headers for CDN caching (30s)
    const res = NextResponse.json({
      menuItems: menuItems.map(i => ({ ...i, ingredients: JSON.parse(i.ingredients) })),
      timelineEras,
      locations,
      cateringPackages: cateringPackages.map(p => ({ ...p, items: JSON.parse(p.items) })),
      todaySpecial,
      siteContent: contentMap,
      siteContentItems: siteContent,
      recentOrders: recent,
    });
    res.headers.set('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
    return res;
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}

function getRelativeTime(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
