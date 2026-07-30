import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const adminView = url.searchParams.get("admin") === "1";
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    const user = token ? await verifySession(token) : null;
    const where = adminView && user?.role === "ADMIN" ? {} : { active: true };
    const photos = await db.cartPhoto.findMany({ where, orderBy: { sortOrder: "asc" } });
    return NextResponse.json({ photos });
  } catch (e: any) {
    return NextResponse.json({ photos: [], error: e?.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await verifySession(token);
    if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const body = await req.json();
    const { title, description, image, category, sortOrder, active } = body || {};
    if (!title || !image) return NextResponse.json({ error: "title, image required" }, { status: 400 });
    const photo = await db.cartPhoto.create({
      data: { title: String(title), description: description ? String(description) : null, image: String(image), category: String(category || "cart"), sortOrder: Number(sortOrder || 0), active: active !== false },
    });
    return NextResponse.json({ photo });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await verifySession(token);
    if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const body = await req.json();
    const { id, ...updates } = body || {};
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const data: any = {};
    for (const key of ["title", "description", "image", "category"]) {
      if (updates[key] !== undefined) data[key] = String(updates[key]);
    }
    if (updates.sortOrder !== undefined) data.sortOrder = Number(updates.sortOrder);
    if (updates.active !== undefined) data.active = Boolean(updates.active);
    const photo = await db.cartPhoto.update({ where: { id: String(id) }, data });
    return NextResponse.json({ photo });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await verifySession(token);
    if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    await db.cartPhoto.delete({ where: { id: String(id) } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
