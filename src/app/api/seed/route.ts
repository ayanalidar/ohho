import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { signSession, SESSION_COOKIE, SESSION_MAX_AGE, type SessionUser } from "@/lib/auth";
import bcrypt from "bcryptjs";

function genReferralCode(name: string) {
  return "OHHO-" + name.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 6) + Math.floor(Math.random() * 90 + 10);
}

// GET /api/seed — one-time setup: creates admin user, sample customer, sample orders
export async function GET() {
  try {
    // 1. Create admin
    const adminEmail = "admin@ohhofoods.com";
    let admin = await db.user.findUnique({ where: { email: adminEmail } });
    if (!admin) {
      admin = await db.user.create({
        data: {
          email: adminEmail,
          name: "OHHO Admin",
          passwordHash: await bcrypt.hash("admin123", 10),
          phone: "+91 7006712347",
          role: "ADMIN",
          loyaltyPoints: 0,
          walletBalance: 0,
          referralCode: genReferralCode("OHHOADMIN"),
        },
      });
    }

    // 2. Create demo customer
    const custEmail = "demo@ohhofoods.com";
    let cust = await db.user.findUnique({ where: { email: custEmail } });
    if (!cust) {
      cust = await db.user.create({
        data: {
          email: custEmail,
          name: "Demo Customer",
          passwordHash: await bcrypt.hash("demo123", 10),
          phone: "+91 9650443642",
          role: "CUSTOMER",
          loyaltyPoints: 437,
          walletBalance: 55000, // ₹550 in paise
          referralCode: genReferralCode("DemoCustomer"),
          addresses: JSON.stringify([
            { id: "addr1", label: "Home", line: "12 Shamli Rd, Kairana, UP 247774", pincode: "247774" },
            { id: "addr2", label: "Work", line: "Shop 4, Main Market, Shamli, UP 247774", pincode: "247774" },
          ]),
        },
      });
    } else {
      // Ensure loyaltyPoints are set
      if (cust.loyaltyPoints === 0) {
        cust = await db.user.update({
          where: { id: cust.id },
          data: { loyaltyPoints: 437 },
        });
      }
    }

    // 3. Create a few demo past orders for the demo customer (only if none exist)
    const existingOrders = await db.order.count({ where: { userId: cust.id } });
    if (existingOrders === 0) {
      const sampleItems = [
        { itemId: "ohho-special-chicken-burger", name: "OHHO Special Chicken Burger", emoji: "🔥", image: "/ohho-images/ohho-special-chicken-burger.png", price: 170, qty: 1 },
        { itemId: "cold-coffee", name: "Cold Coffee", emoji: "☕", image: "/ohho-images/cold-coffee.png", price: 89, qty: 1 },
        { itemId: "crispy-chicken-bucket-half", name: "Crispy Chicken Bucket (Half)", emoji: "🍗", image: "/ohho-images/crispy-chicken-bucket-half.png", price: 149, qty: 1 },
      ];

      const now = Date.now();
      const orders = [
        { daysAgo: 18, status: "ARRIVED", progress: 1, items: sampleItems.slice(0, 2), subtotal: 259, mode: "delivery" },
        { daysAgo: 11, status: "ARRIVED", progress: 1, items: [sampleItems[2], sampleItems[1]], subtotal: 238, mode: "delivery" },
        { daysAgo: 4, status: "ARRIVED", progress: 1, items: sampleItems, subtotal: 408, mode: "pickup" },
      ];

      for (const o of orders) {
        const subtotal = o.subtotal;
        const deliveryFee = o.mode === "delivery" ? (subtotal > 400 ? 0 : 39) : 0;
        const taxes = Math.round(subtotal * 0.05);
        const total = subtotal + deliveryFee + taxes;
        const seq = Math.floor(Math.random() * 90000) + 10000;
        await db.order.create({
          data: {
            orderId: `OHHO-${Math.random().toString(36).slice(2, 7).toUpperCase()}-${seq}`,
            userId: cust.id,
            subtotal,
            deliveryFee,
            taxes,
            total,
            mode: o.mode,
            status: o.status,
            address: o.mode === "delivery" ? "12 Shamli Rd, Kairana, UP 247774" : null,
            paymentMethod: "upi",
            paymentStatus: "PAID",
            etaSeconds: 1500,
            progress: o.progress,
            invoiceNumber: `INV-${new Date(now - o.daysAgo * 86400000).getFullYear()}${String(new Date(now - o.daysAgo * 86400000).getMonth() + 1).padStart(2, "0")}-${seq}`,
            createdAt: new Date(now - o.daysAgo * 86400000),
            items: { create: o.items },
          },
        });
      }
    }

    // 4. Return admin session token so the user can log in immediately
    const sessionUser: SessionUser = {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: "ADMIN",
      loyaltyPoints: admin.loyaltyPoints,
      walletBalance: admin.walletBalance,
      referralCode: admin.referralCode,
      phone: admin.phone,
    };
    const token = await signSession(sessionUser);
    const res = NextResponse.json({
      ok: true,
      admin: { email: adminEmail, password: "admin123" },
      demoCustomer: { email: custEmail, password: "demo123" },
      message: "Seed complete. Use these credentials to test admin & user flows.",
    });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    });
    return res;
  } catch (e: any) {
    console.error("seed error", e);
    return NextResponse.json({ error: e?.message || "Seed failed" }, { status: 500 });
  }
}
