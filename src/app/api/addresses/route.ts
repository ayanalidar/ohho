import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";

// GET — list current user's saved addresses
export async function GET() {
  try {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const user = await verifySession(token);
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const dbUser = await db.user.findUnique({ where: { id: user.id }, select: { addresses: true } });
    const addresses = dbUser?.addresses ? JSON.parse(dbUser.addresses) : [];
    return NextResponse.json({ addresses });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}

// POST — add a new address
export async function POST(req: NextRequest) {
  try {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const user = await verifySession(token);
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const body = await req.json();
    const { label, line, pincode, lat, lng } = body || {};
    if (!label || !line) {
      return NextResponse.json({ error: "label and line required" }, { status: 400 });
    }
    const dbUser = await db.user.findUnique({ where: { id: user.id }, select: { addresses: true } });
    const addresses = dbUser?.addresses ? JSON.parse(dbUser.addresses) : [];
    const newAddr = {
      id: "addr_" + Date.now().toString(36),
      label: String(label),
      line: String(line),
      pincode: pincode ? String(pincode) : "",
      lat: lat || null,
      lng: lng || null,
    };
    addresses.push(newAddr);
    await db.user.update({ where: { id: user.id }, data: { addresses: JSON.stringify(addresses) } });
    return NextResponse.json({ address: newAddr, addresses });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}

// DELETE — remove an address by id
export async function DELETE(req: NextRequest) {
  try {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const user = await verifySession(token);
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const dbUser = await db.user.findUnique({ where: { id: user.id }, select: { addresses: true } });
    const addresses = dbUser?.addresses ? JSON.parse(dbUser.addresses) : [];
    const filtered = addresses.filter((a: any) => a.id !== id);
    await db.user.update({ where: { id: user.id }, data: { addresses: JSON.stringify(filtered) } });
    return NextResponse.json({ addresses: filtered });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
