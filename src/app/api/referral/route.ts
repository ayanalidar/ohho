import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";

// GET — current user's referral info + redemptions
export async function GET() {
  try {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const user = await verifySession(token);
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    // People who used this user's code
    const referrals = await db.user.findMany({
      where: { referredBy: user.referralCode },
      select: { name: true, email: true, createdAt: true, loyaltyPoints: true },
      take: 50,
    });
    // Total points earned from referrals (100 per signup + 100 per first order)
    const redemptionCount = await db.referralRedemption.count({
      where: { referrerId: user.id },
    });

    return NextResponse.json({
      referralCode: user.referralCode,
      referralLink: `${typeof window !== "undefined" ? window.location.origin : "https://www.ohhofoods.com"}/?ref=${user.referralCode}`,
      totalReferrals: referrals.length,
      completedReferrals: redemptionCount,
      referrals: referrals.map((r) => ({
        name: r.name,
        email: r.email.replace(/(.{2}).*(@.*)/, "$1***$2"),
        joinedAt: r.createdAt,
      })),
      pointsEarned: referrals.length * 100 + redemptionCount * 100,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
