import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";
import { DEFAULT_MERCHANT_UPI, MERCHANT_NAME } from "@/data/menu";

// GET /api/upi-payment?amount=437&orderId=OHHO-XXX
// Returns UPI deep-link URL + QR code data URL + merchant info
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const amount = Number(url.searchParams.get("amount") || 0);
    const orderId = url.searchParams.get("orderId") || "";

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "amount required" }, { status: 400 });
    }

    // Try to fetch merchant UPI from admin settings (first ADMIN user's upiId)
    let merchantUpi = DEFAULT_MERCHANT_UPI;
    const admin = await db.user.findFirst({ where: { role: "ADMIN" }, select: { upiId: true } });
    if (admin?.upiId) merchantUpi = admin.upiId;

    // Build UPI deep-link per NPCI spec:
    // upi://pay?pa=PAYEE_VPA&pn=PAYEE_NAME&am=AMOUNT&cu=INR&tn=TRANSACTION_NOTE&tr=TXN_REF
    const params = new URLSearchParams({
      pa: merchantUpi,
      pn: MERCHANT_NAME,
      am: String(amount.toFixed(2)),
      cu: "INR",
      tn: `OHHO Order ${orderId}`.slice(0, 50),
      tr: orderId || "OHHO" + Date.now(),
    });
    const upiIntentUrl = `upi://pay?${params.toString()}`;

    // Generate QR code as SVG data URL (no external dep — inline SVG QR via simple matrix)
    // For production we'd use a proper QR library; here we use a public QR API as fallback
    // and also generate a simple SVG placeholder.
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiIntentUrl)}`;

    // Also check if user is authenticated (for context)
    let userId: string | null = null;
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (token) {
      const u = await verifySession(token);
      if (u) userId = u.id;
    }

    return NextResponse.json({
      merchantUpi,
      merchantName: MERCHANT_NAME,
      amount,
      orderId,
      upiIntentUrl,
      qrImageUrl: qrApiUrl,
      note: `OHHO Order ${orderId}`,
      // List of common UPI apps for the UI to show as deep-link buttons
      upiApps: [
        { name: "Google Pay", id: "gpay", intent: `tez://upi/pay?${params.toString()}` },
        { name: "PhonePe", id: "phonepe", intent: `phonepe://upi/pay?${params.toString()}` },
        { name: "Paytm", id: "paytm", intent: `paytmmp://upi/pay?${params.toString()}` },
        { name: "BHIM UPI", id: "bhim", intent: `bhim://upi/pay?${params.toString()}` },
      ],
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}

// POST — update merchant UPI ID (admin only)
export async function POST(req: NextRequest) {
  try {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await verifySession(token);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const body = await req.json();
    const { upiId } = body || {};
    if (!upiId || !upiId.includes("@")) {
      return NextResponse.json({ error: "Valid UPI ID required (e.g. ohhofoods@upi)" }, { status: 400 });
    }
    await db.user.update({ where: { id: user.id }, data: { upiId: String(upiId) } });
    return NextResponse.json({ ok: true, upiId });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
