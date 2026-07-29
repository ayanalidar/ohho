import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";

// GET — list all franchise leads (admin only)
export async function GET() {
  try {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await verifySession(token);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const leads = await db.franchiseLead.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ leads });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}

// POST — submit a new franchise application (open to all, even non-logged-in)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, city, locationType, investment, timeline, message } = body || {};
    if (!name || !email || !phone || !city) {
      return NextResponse.json({ error: "name, email, phone, city are required" }, { status: 400 });
    }
    // Attach userId if logged in
    let userId: string | null = null;
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (token) {
      const u = await verifySession(token);
      if (u) userId = u.id;
    }
    const lead = await db.franchiseLead.create({
      data: {
        name: String(name),
        email: String(email),
        phone: String(phone),
        city: String(city),
        locationType: String(locationType || "other"),
        investment: String(investment || "1.5-3L"),
        timeline: String(timeline || "exploring"),
        message: message ? String(message) : null,
        userId,
      },
    });
    return NextResponse.json({ ok: true, lead });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
