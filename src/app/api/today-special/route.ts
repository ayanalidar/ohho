import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";

// GET — active today's special (public)
export async function GET() {
  try {
    const special = await db.todaySpecial.findFirst({
      where: { active: true },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json({ special });
  } catch (e: any) {
    return NextResponse.json({ special: null, error: e?.message }, { status: 500 });
  }
}

// POST — create (admin only)
export async function POST(req: NextRequest) {
  try {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await verifySession(token);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const body = await req.json();
    const { title, description, code, badge, active } = body || {};
    if (!title) return NextResponse.json({ error: "title required" }, { status: 400 });
    // Deactivate all existing
    await db.todaySpecial.updateMany({ where: { active: true }, data: { active: false } });
    const special = await db.todaySpecial.create({
      data: {
        title: String(title),
        description: String(description || ""),
        code: code ? String(code) : null,
        badge: String(badge || "🔥 Today's Special"),
        active: active !== false,
      },
    });
    return NextResponse.json({ special });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}

// PATCH — update (admin only)
export async function PATCH(req: NextRequest) {
  try {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await verifySession(token);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const body = await req.json();
    const { id, ...updates } = body || {};
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const data: any = {};
    for (const key of ["title", "description", "code", "badge"]) {
      if (updates[key] !== undefined) data[key] = String(updates[key]);
    }
    if (updates.active !== undefined) data.active = Boolean(updates.active);
    const special = await db.todaySpecial.update({ where: { id: String(id) }, data });
    return NextResponse.json({ special });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
