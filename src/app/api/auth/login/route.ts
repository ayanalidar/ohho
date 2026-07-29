import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { signSession, SESSION_COOKIE, SESSION_MAX_AGE, type SessionUser } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body || {};
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }
    const user = await db.user.findUnique({
      where: { email: String(email).toLowerCase() },
    });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }
    const ok = await bcrypt.compare(String(password), user.passwordHash);
    if (!ok) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }
    const sessionUser: SessionUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as "CUSTOMER" | "ADMIN",
      loyaltyPoints: user.loyaltyPoints,
      walletBalance: user.walletBalance,
      referralCode: user.referralCode,
      phone: user.phone,
    };
    const token = await signSession(sessionUser);
    const res = NextResponse.json({ user: sessionUser });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    });
    return res;
  } catch (e: any) {
    console.error("login error", e);
    return NextResponse.json({ error: e?.message || "Login failed" }, { status: 500 });
  }
}
