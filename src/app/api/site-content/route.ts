import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";

// GET — all site content (public). Returns key-value map.
export async function GET() {
  try {
    const contents = await db.siteContent.findMany();
    const map: Record<string, string> = {};
    for (const c of contents) map[c.key] = c.value;
    return NextResponse.json({ content: map, items: contents });
  } catch (e: any) {
    return NextResponse.json({ content: {}, items: [], error: e?.message }, { status: 500 });
  }
}

// POST — upsert a content value (admin only)
export async function POST(req: NextRequest) {
  try {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await verifySession(token);
    if (!user || user.role === "CUSTOMER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const body = await req.json();
    const { key, value, type, label, page, section } = body || {};
    if (!key || value === undefined) return NextResponse.json({ error: "key, value required" }, { status: 400 });
    const item = await db.siteContent.upsert({
      where: { key: String(key) },
      create: { key: String(key), value: String(value), type: String(type || "text"), label: String(label || key), page: String(page || "home"), section: String(section || "general") },
      update: { value: String(value) },
    });
    return NextResponse.json({ item });
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
    if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    await db.siteContent.delete({ where: { id: String(id) } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
