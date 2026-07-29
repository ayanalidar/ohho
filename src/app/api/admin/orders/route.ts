import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";

// GET /api/admin/orders — list all orders (admin sees all, operator sees own location)
export async function GET(req: NextRequest) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await verifySession(token);
  if (!user || user.role === "CUSTOMER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  // Operators only see their location's orders
  const where = user.role === "OPERATOR" && user.locationId ? { locationId: user.locationId } : {};
  const orders = await db.order.findMany({
    where,
    include: { items: true, user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ orders });
}

// PATCH /api/admin/orders — update order status + broadcast via WebSocket
export async function PATCH(req: NextRequest) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await verifySession(token);
  if (!user || user.role === "CUSTOMER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  const { orderId, status, progress } = body || {};
  if (!orderId || !status) {
    return NextResponse.json({ error: "Missing orderId or status" }, { status: 400 });
  }
  const updated = await db.order.update({
    where: { id: String(orderId) },
    data: {
      status: String(status),
      progress: typeof progress === "number" ? Number(progress) : undefined,
    },
  });

  // Broadcast the status update via the order-sync WebSocket service
  // (fire-and-forget — don't block the response on the socket call)
  try {
    const io = await import("socket.io-client").then((m) => m.io);
    const socket = io("http://localhost:3003/", { path: "/", transports: ["websocket"] });
    socket.emit("order:status", {
      orderId: updated.orderId,
      status: updated.status,
      progress: updated.progress,
    });
    setTimeout(() => socket.disconnect(), 500);
  } catch (e) {
    // WebSocket broadcast failure is non-fatal
    console.warn("Failed to broadcast order status via WS:", e);
  }

  return NextResponse.json({ order: updated });
}
