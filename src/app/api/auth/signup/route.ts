import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { signSession, SESSION_COOKIE, SESSION_MAX_AGE, type SessionUser } from "@/lib/auth";
import bcrypt from "bcryptjs";

function genReferralCode(name: string) {
  return "OHHO-" + name.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 6) + Math.floor(Math.random() * 90 + 10);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name, phone, referralCode } = body || {};
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required." },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }
    const existing = await db.user.findUnique({ where: { email: String(email).toLowerCase() } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }
    const passwordHash = await bcrypt.hash(String(password), 10);

    // Validate referral code if provided
    let referredBy: string | null = null;
    if (referralCode) {
      const referrer = await db.user.findUnique({ where: { referralCode: String(referralCode).toUpperCase() } });
      if (referrer) referredBy = referrer.referralCode;
    }

    // Generate a unique referral code for the new user
    let userCode = genReferralCode(String(name));
    while (await db.user.findUnique({ where: { referralCode: userCode } })) {
      userCode = genReferralCode(String(name));
    }

    const user = await db.user.create({
      data: {
        email: String(email).toLowerCase(),
        name: String(name),
        passwordHash,
        phone: phone ? String(phone) : null,
        role: "CUSTOMER",
        loyaltyPoints: referredBy ? 100 : 0, // signup bonus if referred
        walletBalance: 0,
        referralCode: userCode,
        referredBy,
      },
    });

    // If referred, award the referrer too (100 pts on signup, will be doubled on first order)
    if (referredBy) {
      await db.user.updateMany({
        where: { referralCode: referredBy },
        data: { loyaltyPoints: { increment: 100 } },
      });
    }

    const sessionUser: SessionUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: "CUSTOMER",
      loyaltyPoints: user.loyaltyPoints,
      walletBalance: user.walletBalance,
      referralCode: user.referralCode,
      phone: user.phone,
    };
    const token = await signSession(sessionUser);
    const res = NextResponse.json({ user: sessionUser, referralCode: userCode, referredBy });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    });
    return res;
  } catch (e: any) {
    console.error("signup error", e);
    return NextResponse.json({ error: e?.message || "Signup failed" }, { status: 500 });
  }
}
