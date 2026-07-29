import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";

// GET /api/admin/reviews — all reviews for admin moderation
export async function GET() {
  try {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await verifySession(token);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const reviews = await db.review.findMany({
      include: {
        user: { select: { name: true, email: true } },
        order: { select: { orderId: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    const avgRating = reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;
    return NextResponse.json({ reviews, avgRating, total: reviews.length });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
