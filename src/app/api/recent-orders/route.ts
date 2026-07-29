import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/recent-orders — public, returns last 12 orders (first name + item summary)
export async function GET() {
  try {
    const orders = await db.order.findMany({
      where: { status: { notIn: ["CANCELLED"] } },
      include: {
        items: { select: { name: true, emoji: true, qty: true } },
        user: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 12,
    });
    const recent = orders.map((o) => ({
      orderId: o.orderId,
      customerName: o.user?.name || "Customer",
      firstName: (o.user?.name || "Customer").split(" ")[0],
      items: o.items.map((it) => `${it.emoji} ${it.name}`),
      total: o.total,
      mode: o.mode,
      timeAgo: getRelativeTime(o.createdAt),
    }));
    return NextResponse.json({ orders: recent });
  } catch (e: any) {
    return NextResponse.json({ orders: [], error: e?.message }, { status: 500 });
  }
}

function getRelativeTime(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
