import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";

// Achievement definitions — computed dynamically from user data
const ACHIEVEMENT_DEFS = [
  { slug: "first-order", name: "First Bite", description: "Placed your first OHHO order", icon: "🍔", condition: (ctx: any) => ctx.orderCount >= 1 },
  { slug: "five-orders", name: "Regular", description: "Placed 5 orders", icon: "⭐", condition: (ctx: any) => ctx.orderCount >= 5 },
  { slug: "ten-orders", name: "OHHO Loyalist", description: "Placed 10 orders", icon: "👑", condition: (ctx: any) => ctx.orderCount >= 10 },
  { slug: "first-review", name: "Food Critic", description: "Left your first review", icon: "✍️", condition: (ctx: any) => ctx.reviewCount >= 1 },
  { slug: "three-reviews", name: "Voice of OHHO", description: "Left 3 reviews", icon: "🎤", condition: (ctx: any) => ctx.reviewCount >= 3 },
  { slug: "referral-master", name: "Connector", description: "Referred 3 friends", icon: "🤝", condition: (ctx: any) => ctx.referralCount >= 3 },
  { slug: "wallet-pro", name: "Prepaid Pro", description: "Reloaded your wallet", icon: "💳", condition: (ctx: any) => ctx.walletReloaded },
  { slug: "big-spender", name: "Feast Mode", description: "Single order over ₹500", icon: "🪣", condition: (ctx: any) => ctx.maxOrderTotal >= 500 },
  { slug: "bronze-tier", name: "Bronze Tier", description: "Earned 100+ loyalty points", icon: "🥉", condition: (ctx: any) => ctx.loyaltyPoints >= 100 },
  { slug: "silver-tier", name: "Silver Tier", description: "Earned 500+ loyalty points", icon: "🥈", condition: (ctx: any) => ctx.loyaltyPoints >= 500 },
  { slug: "gold-tier", name: "Gold Tier", description: "Earned 2000+ loyalty points", icon: "🥇", condition: (ctx: any) => ctx.loyaltyPoints >= 2000 },
  { slug: "pizza-lover", name: "Pizza Lover", description: "Ordered 3+ pizzas", icon: "🍕", condition: (ctx: any) => ctx.pizzaCount >= 3 },
  { slug: "burger-lover", name: "Burger Lover", description: "Ordered 3+ burgers", icon: "🍔", condition: (ctx: any) => ctx.burgerCount >= 3 },
  { slug: "sip-master", name: "Sip Master", description: "Ordered 3+ sips", icon: "🥤", condition: (ctx: any) => ctx.sipCount >= 3 },
];

// GET /api/achievements — returns user's unlocked achievements + all available
export async function GET() {
  try {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (!token) return NextResponse.json({ achievements: [], allAchievements: ACHIEVEMENT_DEFS, unlockedSlugs: [] });
    const user = await verifySession(token);
    if (!user) return NextResponse.json({ achievements: [], allAchievements: ACHIEVEMENT_DEFS, unlockedSlugs: [] });

    // Compute context
    const orderCount = await db.order.count({ where: { userId: user.id } });
    const reviewCount = await db.review.count({ where: { userId: user.id } });
    const referralCount = await db.referralRedemption.count({ where: { referrerId: user.id } });
    const maxOrderAgg = await db.order.aggregate({ where: { userId: user.id }, _max: { total: true } });
    const maxOrderTotal = maxOrderAgg._max.total || 0;

    // Count pizzas, burgers, sips ordered
    const allItems = await db.orderItem.findMany({
      where: { order: { userId: user.id } },
      select: { itemId: true, qty: true },
    });
    let pizzaCount = 0, burgerCount = 0, sipCount = 0;
    for (const it of allItems) {
      if (it.itemId.includes("pizza")) pizzaCount += it.qty;
      if (it.itemId.includes("burger")) burgerCount += it.qty;
      if (it.itemId.includes("cold-coffee") || it.itemId.includes("shake") || it.itemId.includes("sip")) sipCount += it.qty;
    }

    // Check wallet reload (walletDebit > 0 means they used wallet, but reload is different — check if walletBalance > initial 0)
    const dbUser = await db.user.findUnique({ where: { id: user.id }, select: { walletBalance: true, loyaltyPoints: true } });
    const walletReloaded = (dbUser?.walletBalance || 0) > 0 || orderCount > 0; // simplified

    const ctx = {
      orderCount,
      reviewCount,
      referralCount,
      maxOrderTotal,
      pizzaCount,
      burgerCount,
      sipCount,
      walletReloaded,
      loyaltyPoints: dbUser?.loyaltyPoints || 0,
    };

    // Check which achievements should be unlocked
    const shouldUnlock = ACHIEVEMENT_DEFS.filter((a) => a.condition(ctx));

    // Upsert achievements
    for (const a of shouldUnlock) {
      await db.userAchievement.upsert({
        where: { userId_slug: { userId: user.id, slug: a.slug } },
        create: { userId: user.id, slug: a.slug, name: a.name, description: a.description, icon: a.icon },
        update: {},
      });
    }

    // Fetch all unlocked
    const unlocked = await db.userAchievement.findMany({
      where: { userId: user.id },
      orderBy: { unlockedAt: "desc" },
    });

    const unlockedSlugs = unlocked.map((a) => a.slug);
    const allAchievements = ACHIEVEMENT_DEFS.map((a) => ({
      ...a,
      unlocked: unlockedSlugs.includes(a.slug),
    }));

    return NextResponse.json({
      achievements: unlocked,
      allAchievements,
      unlockedSlugs,
      stats: ctx,
    });
  } catch (e: any) {
    return NextResponse.json({ achievements: [], allAchievements: ACHIEVEMENT_DEFS, error: e?.message }, { status: 500 });
  }
}
