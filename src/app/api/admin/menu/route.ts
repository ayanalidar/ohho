import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";

// In-memory sold-out set (would be a DB table in production)
// Keyed by menu item id. Resets on server restart.
const soldOut = new Set<string>();

// GET — list of sold-out item ids
export async function GET() {
  return NextResponse.json({ soldOut: Array.from(soldOut) });
}

// PATCH — toggle sold-out status (admin only)
export async function PATCH(req: NextRequest) {
  try {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await verifySession(token);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const body = await req.json();
    const { itemId, soldOut: isSoldOut } = body || {};
    if (!itemId) return NextResponse.json({ error: "itemId required" }, { status: 400 });
    if (isSoldOut) {
      soldOut.add(String(itemId));
    } else {
      soldOut.delete(String(itemId));
    }
    return NextResponse.json({ itemId, soldOut: Array.from(soldOut) });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
