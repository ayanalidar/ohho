import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifySession, SESSION_COOKIE, type SessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (!token) return NextResponse.json({ user: null });
    const payload = await verifySession(token);
    if (!payload) return NextResponse.json({ user: null });
    // Refresh loyalty points from DB
    const dbUser = await db.user.findUnique({
      where: { id: payload.id },
      select: { loyaltyPoints: true, role: true, name: true, email: true },
    });
    if (!dbUser) return NextResponse.json({ user: null });
    const user: SessionUser = {
      id: payload.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role as "CUSTOMER" | "ADMIN",
      loyaltyPoints: dbUser.loyaltyPoints,
    };
    return NextResponse.json({ user });
  } catch (e: any) {
    return NextResponse.json({ user: null, error: e?.message }, { status: 500 });
  }
}
