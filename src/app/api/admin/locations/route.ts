import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";

// GET — list all locations (public)
export async function GET() {
  try {
    const locations = await db.location.findMany({
      orderBy: { createdAt: "asc" },
      include: { _count: { select: { users: true } } },
    });
    return NextResponse.json({ locations });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}

// POST — create (admin or operator)
export async function POST(req: NextRequest) {
  try {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await verifySession(token);
    if (!user || user.role === "CUSTOMER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const body = await req.json();
    const { slug, name, city, area, status, rating, customers, deliveryRadiusKm, prepTimeExtra, image, active } = body || {};
    if (!slug || !name || !city) return NextResponse.json({ error: "slug, name, city required" }, { status: 400 });
    const existing = await db.location.findUnique({ where: { slug: String(slug) } });
    if (existing) return NextResponse.json({ error: "Location with this slug already exists" }, { status: 409 });
    const loc = await db.location.create({
      data: {
        slug: String(slug),
        name: String(name),
        city: String(city),
        area: String(area || ""),
        status: String(status || "operational"),
        rating: Number(rating || 4.8),
        customers: Number(customers || 0),
        deliveryRadiusKm: Number(deliveryRadiusKm || 5),
        prepTimeExtra: String(prepTimeExtra || "0 min"),
        image: String(image || "/ohho-images/ohho-cart-1.png"),
        active: active !== false,
      },
    });
    return NextResponse.json({ location: loc });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}

// PATCH — update (admin or operator of that location)
export async function PATCH(req: NextRequest) {
  try {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await verifySession(token);
    if (!user || user.role === "CUSTOMER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const body = await req.json();
    const { id, ...updates } = body || {};
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    // Operators can only edit their own location
    if (user.role === "OPERATOR") {
      const loc = await db.location.findUnique({ where: { id: String(id) } });
      if (!loc || loc.id !== user.locationId) {
        return NextResponse.json({ error: "Can only edit your own location" }, { status: 403 });
      }
    }
    const data: any = {};
    for (const key of ["slug", "name", "city", "area", "status", "prepTimeExtra", "image"]) {
      if (updates[key] !== undefined) data[key] = String(updates[key]);
    }
    for (const key of ["rating", "customers", "deliveryRadiusKm"]) {
      if (updates[key] !== undefined) data[key] = Number(updates[key]);
    }
    if (updates.active !== undefined) data.active = Boolean(updates.active);
    const loc = await db.location.update({ where: { id: String(id) }, data });
    return NextResponse.json({ location: loc });
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
    await db.location.delete({ where: { id: String(id) } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
