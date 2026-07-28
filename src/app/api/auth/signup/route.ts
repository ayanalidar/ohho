import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { signSession, SESSION_COOKIE, SESSION_MAX_AGE, type SessionUser } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name, phone } = body || {};
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
    const user = await db.user.create({
      data: {
        email: String(email).toLowerCase(),
        name: String(name),
        passwordHash,
        phone: phone ? String(phone) : null,
        role: "CUSTOMER",
        loyaltyPoints: 0,
      },
    });

    const sessionUser: SessionUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: "CUSTOMER",
      loyaltyPoints: 0,
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
    console.error("signup error", e);
    return NextResponse.json({ error: e?.message || "Signup failed" }, { status: 500 });
  }
}
