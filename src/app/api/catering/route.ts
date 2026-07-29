import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";

// GET — list all catering inquiries (admin only)
export async function GET() {
  try {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await verifySession(token);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const inquiries = await db.cateringInquiry.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ inquiries });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}

// POST — submit a catering inquiry
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, eventType, eventDate, guestCount, budget, message } = body || {};
    if (!name || !email || !phone || !eventDate || !guestCount) {
      return NextResponse.json({ error: "name, email, phone, eventDate, guestCount required" }, { status: 400 });
    }
    let userId: string | null = null;
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (token) {
      const u = await verifySession(token);
      if (u) userId = u.id;
    }
    const inquiry = await db.cateringInquiry.create({
      data: {
        name: String(name),
        email: String(email),
        phone: String(phone),
        eventType: String(eventType || "other"),
        eventDate: String(eventDate),
        guestCount: Number(guestCount),
        budget: String(budget || "5-10k"),
        message: message ? String(message) : null,
        userId,
      },
    });
    return NextResponse.json({ ok: true, inquiry });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
