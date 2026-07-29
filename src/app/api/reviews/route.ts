import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";

// GET /api/reviews?itemId=xxx — get reviews for an item (or all)
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const itemId = url.searchParams.get("itemId");
    const limit = Number(url.searchParams.get("limit") || 20);
    const where = itemId ? { itemId: String(itemId) } : {};
    const reviews = await db.review.findMany({
      where,
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return NextResponse.json({ reviews });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}

// POST /api/reviews — submit a review for an order
export async function POST(req: NextRequest) {
  try {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const user = await verifySession(token);
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const body = await req.json();
    const { orderId, rating, text, itemId, itemName } = body || {};
    if (!orderId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "orderId and rating (1-5) required" }, { status: 400 });
    }

    // Verify the order belongs to the user and is delivered
    const order = await db.order.findUnique({ where: { id: String(orderId) } });
    if (!order || order.userId !== user.id) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (order.status !== "ARRIVED") {
      return NextResponse.json({ error: "Order must be delivered before review" }, { status: 400 });
    }
    if (order.rated) {
      return NextResponse.json({ error: "Order already reviewed" }, { status: 400 });
    }

    const review = await db.review.create({
      data: {
        orderId: order.id,
        userId: user.id,
        rating: Number(rating),
        text: text ? String(text) : null,
        itemId: itemId ? String(itemId) : null,
        itemName: itemName ? String(itemName) : null,
      },
    });

    await db.order.update({ where: { id: order.id }, data: { rated: true } });

    // Award 10 loyalty points for reviewing
    await db.user.update({
      where: { id: user.id },
      data: { loyaltyPoints: { increment: 10 } },
    });

    return NextResponse.json({ review, earnedPoints: 10 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
