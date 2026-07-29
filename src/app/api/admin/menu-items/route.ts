import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";

// GET — list all menu items (public, for menu display)
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const adminView = url.searchParams.get("admin") === "1";
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    const user = token ? await verifySession(token) : null;

    const where = adminView && user?.role === "ADMIN" ? {} : { available: true };
    const items = await db.menuItem.findMany({
      where,
      orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
    });
    return NextResponse.json({ items: items.map(i => ({ ...i, ingredients: JSON.parse(i.ingredients) })) });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}

// POST — create new menu item (admin only)
export async function POST(req: NextRequest) {
  try {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await verifySession(token);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const body = await req.json();
    const { name, emoji, description, ingredients, image, category, price, kcal, prepTime, spice, tag, isAddOn, signature, available, sortOrder } = body || {};
    if (!name || !category || !price) {
      return NextResponse.json({ error: "name, category, price required" }, { status: 400 });
    }
    const slug = String(name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Math.random().toString(36).slice(2, 5);
    const item = await db.menuItem.create({
      data: {
        slug,
        name: String(name),
        emoji: String(emoji || "🍽️"),
        description: String(description || ""),
        ingredients: JSON.stringify(ingredients || []),
        image: String(image || "/ohho-images/placeholder.png"),
        category: String(category),
        price: Number(price),
        kcal: Number(kcal || 0),
        prepTime: String(prepTime || "5 min"),
        spice: Number(spice || 0),
        tag: tag ? String(tag) : null,
        isAddOn: Boolean(isAddOn),
        signature: Boolean(signature),
        available: available !== false,
        sortOrder: Number(sortOrder || 0),
      },
    });
    return NextResponse.json({ item });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}

// PATCH — update menu item (admin only)
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
    for (const key of ["name", "emoji", "description", "image", "category", "prepTime", "tag"]) {
      if (updates[key] !== undefined) data[key] = String(updates[key]);
    }
    for (const key of ["price", "kcal", "spice", "sortOrder"]) {
      if (updates[key] !== undefined) data[key] = Number(updates[key]);
    }
    for (const key of ["isAddOn", "signature", "available"]) {
      if (updates[key] !== undefined) data[key] = Boolean(updates[key]);
    }
    if (updates.ingredients !== undefined) data.ingredients = JSON.stringify(updates.ingredients);
    const item = await db.menuItem.update({ where: { id: String(id) }, data });
    return NextResponse.json({ item });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}

// DELETE — delete menu item (admin only)
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
    await db.menuItem.delete({ where: { id: String(id) } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
