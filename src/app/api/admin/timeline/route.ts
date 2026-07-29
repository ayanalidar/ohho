import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";

// GET — list all timeline eras (public)
export async function GET() {
  try {
    const eras = await db.timelineEra.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json({ eras });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
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
    const { category, label, emoji, color, tagline, year, era, blurb, sortOrder } = body || {};
    if (!category || !label) return NextResponse.json({ error: "category, label required" }, { status: 400 });
    const existing = await db.timelineEra.findUnique({ where: { category: String(category) } });
    if (existing) return NextResponse.json({ error: "Era with this category already exists" }, { status: 409 });
    const e = await db.timelineEra.create({
      data: {
        category: String(category),
        label: String(label),
        emoji: String(emoji || "✨"),
        color: String(color || "#ff6a00"),
        tagline: String(tagline || ""),
        year: String(year || "2024"),
        era: String(era || "New Era"),
        blurb: String(blurb || ""),
        sortOrder: Number(sortOrder || 0),
      },
    });
    return NextResponse.json({ era: e });
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
    for (const key of ["category", "label", "emoji", "color", "tagline", "year", "era", "blurb"]) {
      if (updates[key] !== undefined) data[key] = String(updates[key]);
    }
    if (updates.sortOrder !== undefined) data.sortOrder = Number(updates.sortOrder);
    const e = await db.timelineEra.update({ where: { id: String(id) }, data });
    return NextResponse.json({ era: e });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}

// DELETE (admin only)
export async function DELETE(req: NextRequest) {
  try {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await verifySession(token);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    await db.timelineEra.delete({ where: { id: String(id) } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
