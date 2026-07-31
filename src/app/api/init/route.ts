import { NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';

// GET /api/init — returns ALL data needed for initial page render in ONE request
// Uses a dedicated PrismaClient with session pooler (port 5432) for faster queries.
// The session pooler doesn't have pgbouncer overhead but limits connections.
// Since this is one function = one connection, it's safe.
export async function GET() {
  // Create a one-off client using the session pooler URL (no pgbouncer)
  // This is faster than the transaction pooler for multiple sequential queries
  const baseUrl = process.env.DATABASE_URL || '';
  // Strip pgbouncer params and use port 5432 (session mode)
  const sessionUrl = baseUrl
    .replace(':6543', ':5432')
    .replace(/[\?&]pgbouncer=true/, '')
    .replace(/[\?&]connection_limit=\d+/, '')
    .replace(/[\?&]pool_timeout=\d+/, '')
    .replace(/&&/g, '&')
    .replace(/\?&/, '?')
    .replace(/&$/, '');

  let client: PrismaClient;
  try {
    client = new PrismaClient({
      log: ['error'],
      datasources: { db: { url: sessionUrl } },
    });
  } catch {
    // Fallback to default client
    const { db } = await import('@/lib/db');
    client = db as any;
  }

  try {
    // Run queries sequentially (faster with session pooler than Promise.all)
    const menuItems = await client.menuItem.findMany({
      where: { available: true },
      orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
    });
    const timelineEras = await client.timelineEra.findMany({ orderBy: { sortOrder: "asc" } });
    const locations = await client.location.findMany({ where: { active: true }, orderBy: { createdAt: "asc" } });
    const cateringPackages = await client.cateringPackage.findMany({ where: { available: true }, orderBy: { sortOrder: "asc" } });
    const todaySpecial = await client.todaySpecial.findFirst({ where: { active: true }, orderBy: { updatedAt: "desc" } });
    const siteContent = await client.siteContent.findMany();
    const recentOrders = await client.order.findMany({
      where: { status: { notIn: ["CANCELLED"] } },
      include: {
        items: { select: { name: true, emoji: true, qty: true } },
        user: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

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
    return NextResponse.json({ error: e?.message }, { status: 500 });
  } finally {
    // Disconnect the one-off client
    if (client) {
      try { await client.$disconnect(); } catch {}
    }
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
