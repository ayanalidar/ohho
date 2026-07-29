import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";

// GET — list all catering packages (public)
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const adminView = url.searchParams.get("admin") === "1";
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    const user = token ? await verifySession(token) : null;
    const where = adminView && user?.role === "ADMIN" ? {} : { available: true };
    const packages = await db.cateringPackage.findMany({
      where,
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json({ packages: packages.map(p => ({ ...p, items: JSON.parse(p.items) })) });
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
    const { name, pax, price, items, note, color, sortOrder, available } = body || {};
    if (!name || !price) return NextResponse.json({ error: "name, price required" }, { status: 400 });
    const pkg = await db.cateringPackage.create({
      data: {
        name: String(name),
        pax: String(pax || ""),
        price: String(price),
        items: JSON.stringify(items || []),
        note: note ? String(note) : null,
        color: String(color || "#ff6a00"),
        sortOrder: Number(sortOrder || 0),
        available: available !== false,
      },
    });
    return NextResponse.json({ package: pkg });
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
    for (const key of ["name", "pax", "price", "note", "color"]) {
      if (updates[key] !== undefined) data[key] = String(updates[key]);
    }
    if (updates.items !== undefined) data.items = JSON.stringify(updates.items);
    if (updates.sortOrder !== undefined) data.sortOrder = Number(updates.sortOrder);
    if (updates.available !== undefined) data.available = Boolean(updates.available);
    const pkg = await db.cateringPackage.update({ where: { id: String(id) }, data });
    return NextResponse.json({ package: pkg });
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
    await db.cateringPackage.delete({ where: { id: String(id) } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
