import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/init — returns ALL data needed for initial page render in ONE request
// This replaces 6-8 separate API calls with a single batched call, dramatically
// reducing DB connections and page load time on Vercel serverless.
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
        select: {
          id: true, slug: true, name: true, emoji: true, description: true,
          ingredients: true, image: true, category: true, price: true,
          kcal: true, prepTime: true, spice: true, tag: true,
          isAddOn: true, signature: true, available: true, sortOrder: true,
        },
      }),
      db.timelineEra.findMany({ orderBy: { sortOrder: "asc" } }),
      db.location.findMany({
        where: { active: true },
        orderBy: { createdAt: "asc" },
      }),
      db.cateringPackage.findMany({
        where: { available: true },
        orderBy: { sortOrder: "asc" },
      }),
      db.todaySpecial.findFirst({
        where: { active: true },
        orderBy: { updatedAt: "desc" },
      }),
      db.siteContent.findMany(),
      db.order.findMany({
        where: { status: { notIn: ["CANCELLED"] } },
        include: {
          items: { select: { name: true, emoji: true, qty: true } },
          user: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

    // Build site content map
    const contentMap: Record<string, string> = {};
    for (const c of siteContent) contentMap[c.key] = c.value;

    // Format recent orders
    const recent = recentOrders.map((o) => ({
      orderId: o.orderId,
      firstName: (o.user?.name || "Customer").split(" ")[0],
      items: o.items.map((it) => `${it.emoji} ${it.name}`),
      total: o.total,
      mode: o.mode,
      timeAgo: getRelativeTime(o.createdAt),
    }));

    return NextResponse.json({
      menuItems: menuItems.map(i => ({ ...i, ingredients: JSON.parse(i.ingredients) })),
      timelineEras,
      locations,
      cateringPackages: cateringPackages.map(p => ({ ...p, items: JSON.parse(p.items) })),
      todaySpecial,
      siteContent: contentMap,
      siteContentItems: siteContent,
      recentOrders: recent,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message, stack: e?.stack?.slice(0, 200) }, { status: 500 });
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
