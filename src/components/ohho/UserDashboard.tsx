"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Receipt,
  ShoppingBag,
  Coins,
  Clock,
  CheckCircle2,
  Bike,
  MapPin,
  Download,
  Loader2,
  Star,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "@/components/ohho/AuthProvider";
import { cn } from "@/lib/utils";

type OrderItem = {
  id: string;
  itemId: string;
  name: string;
  emoji: string;
  image: string;
  price: number;
  qty: number;
};

type Order = {
  id: string;
  orderId: string;
  invoiceNumber: string | null;
  status: string;
  mode: string;
  total: number;
  subtotal: number;
  deliveryFee: number;
  taxes: number;
  paymentMethod: string;
  paymentStatus: string;
  address: string | null;
  progress: number;
  createdAt: string;
  items: OrderItem[];
};

const STATUS_META: Record<string, { label: string; color: string; icon: any }> = {
  PREPARING: { label: "Preparing", color: "#ff6a00", icon: Clock },
  PICKED: { label: "Picked up", color: "#ffc107", icon: Bike },
  ENROUTE: { label: "On the way", color: "#ff8c00", icon: Bike },
  NEAR: { label: "Near you", color: "#ffd54f", icon: MapPin },
  ARRIVED: { label: "Delivered", color: "#10b981", icon: CheckCircle2 },
  CANCELLED: { label: "Cancelled", color: "#d92626", icon: X },
};

function downloadInvoice(order: Order, userName: string, userEmail: string) {
  const itemsHtml = order.items
    .map(
      (it) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #eee">${it.emoji || ""} ${it.name}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${it.qty}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">₹${it.price}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">₹${it.price * it.qty}</td>
      </tr>`
    )
    .join("");
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Invoice ${order.invoiceNumber}</title>
  <style>
    body { font-family: -apple-system, system-ui, sans-serif; background: #f5e6cc; padding: 40px; color: #0e0a04; }
    .card { max-width: 720px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 12px 40px rgba(14,10,4,0.15); }
    .head { background: linear-gradient(135deg, #ff6a00, #d92626); color: #fff; padding: 28px 32px; }
    .head h1 { margin: 0; font-size: 28px; letter-spacing: 0.04em; }
    .head .sub { opacity: 0.85; font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase; margin-top: 4px; }
    .body { padding: 24px 32px; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th { background: #faf3e6; padding: 10px 8px; text-align: left; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: #6b5b3a; }
    td { font-size: 14px; }
    .totals { margin-top: 16px; }
    .totals div { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
    .totals .grand { border-top: 2px solid #0e0a04; padding-top: 12px; margin-top: 8px; font-size: 18px; font-weight: bold; }
    .meta { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 16px; margin-bottom: 16px; font-size: 13px; color: #6b5b3a; }
    .meta b { color: #0e0a04; }
    .foot { padding: 16px 32px 28px; text-align: center; font-size: 11px; color: #999; border-top: 1px solid #eee; }
  </style></head>
  <body>
    <div class="card">
      <div class="head">
        <h1>OHHO BURGERS</h1>
        <div class="sub">Live Premium · Tax Invoice</div>
      </div>
      <div class="body">
        <div class="meta">
          <div>
            <div><b>Invoice #:</b> ${order.invoiceNumber || "—"}</div>
            <div><b>Order #:</b> ${order.orderId}</div>
            <div><b>Date:</b> ${new Date(order.createdAt).toLocaleString("en-IN")}</div>
          </div>
          <div>
            <div><b>Bill to:</b> ${userName}</div>
            <div>${userEmail}</div>
            ${order.address ? `<div>${order.address}</div>` : ""}
          </div>
        </div>
        <table>
          <thead><tr><th>Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Price</th><th style="text-align:right">Total</th></tr></thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <div class="totals">
          <div><span>Subtotal</span><span>₹${order.subtotal}</span></div>
          <div><span>Delivery fee</span><span>₹${order.deliveryFee}</span></div>
          <div><span>Taxes &amp; charges</span><span>₹${order.taxes}</span></div>
          <div class="grand"><span>Total Paid</span><span>₹${order.total}</span></div>
        </div>
        <div style="margin-top:16px;font-size:12px;color:#6b5b3a">
          Payment: <b>${order.paymentMethod.toUpperCase()}</b> · Status: <b>${order.paymentStatus}</b> · Mode: <b>${order.mode}</b>
        </div>
      </div>
      <div class="foot">
        OHHO Food Ventures · www.ohhofoods.com · @ohhofoodventures<br/>
        Thank you for ordering with OHHO BURGERS. Live Premium.
      </div>
    </div>
  </body></html>`;
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `OHHO-Invoice-${order.invoiceNumber || order.orderId}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function UserDashboard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"active" | "past">("past");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      setOrders(data.orders || []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  const active = orders.filter((o) => o.status !== "ARRIVED" && o.status !== "CANCELLED");
  const past = orders.filter((o) => o.status === "ARRIVED" || o.status === "CANCELLED");

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] bg-ohho-black/85 backdrop-blur-md flex justify-end"
          onClick={onClose}
        >
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 280 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl h-full bg-ohho-black-light border-l border-ohho-gold/20 flex flex-col"
          >
            {/* Header */}
            <div className="p-5 border-b border-ohho-gold/15 flex items-start justify-between">
              <div>
                <div className="font-display text-2xl text-ohho-cream">{user?.name}</div>
                <div className="text-xs text-ohho-cream-dim">{user?.email}</div>
                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-ohho-gold/10 border border-ohho-gold/30 text-ohho-gold text-xs font-semibold">
                  <Coins className="h-3 w-3" />
                  {user?.loyaltyPoints || 0} loyalty points
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="h-9 w-9 grid place-items-center rounded-md border border-ohho-gold/20 text-ohho-cream hover:bg-ohho-orange/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="px-5 pt-4 flex gap-2">
              <button
                onClick={() => setTab("active")}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-semibold border transition-all",
                  tab === "active"
                    ? "bg-ohho-orange text-ohho-black border-ohho-orange"
                    : "text-ohho-cream-dim border-ohho-gold/20 hover:border-ohho-gold/50"
                )}
              >
                Active ({active.length})
              </button>
              <button
                onClick={() => setTab("past")}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-semibold border transition-all",
                  tab === "past"
                    ? "bg-ohho-orange text-ohho-black border-ohho-orange"
                    : "text-ohho-cream-dim border-ohho-gold/20 hover:border-ohho-gold/50"
                )}
              >
                Past Orders ({past.length})
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto ohho-scroll p-5 space-y-3">
              {loading ? (
                <div className="text-center py-20 text-ohho-cream-dim">
                  <Loader2 className="h-8 w-8 mx-auto animate-spin mb-3" />
                  Loading orders…
                </div>
              ) : (tab === "active" ? active : past).length === 0 ? (
                <div className="text-center py-20">
                  <ShoppingBag className="h-12 w-12 mx-auto text-ohho-cream-dim/40 mb-3" />
                  <div className="font-display text-xl text-ohho-cream mb-1">
                    {tab === "active" ? "No active orders" : "No past orders yet"}
                  </div>
                  <div className="text-sm text-ohho-cream-dim">
                    {tab === "active"
                      ? "Place an order to see it tracked live here."
                      : "Your past orders and invoices will appear here."}
                  </div>
                </div>
              ) : (
                (tab === "active" ? active : past).map((order) => {
                  const meta = STATUS_META[order.status] || STATUS_META.PREPARING;
                  const Icon = meta.icon;
                  return (
                    <div
                      key={order.id}
                      className="rounded-xl glass-card p-4"
                    >
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <div className="font-display text-lg text-ohho-cream">
                            {order.orderId}
                          </div>
                          <div className="text-[11px] text-ohho-cream-dim mt-0.5">
                            {new Date(order.createdAt).toLocaleString("en-IN")}
                          </div>
                        </div>
                        <div
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border"
                          style={{
                            color: meta.color,
                            borderColor: `${meta.color}55`,
                            background: `${meta.color}15`,
                          }}
                        >
                          <Icon className="h-3 w-3" />
                          {meta.label}
                        </div>
                      </div>

                      {/* Progress bar for active */}
                      {tab === "active" && (
                        <div className="mt-3">
                          <div className="h-1.5 rounded-full bg-ohho-cream/10 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-ohho-orange to-ohho-gold transition-all"
                              style={{ width: `${Math.max(5, order.progress * 100)}%` }}
                            />
                          </div>
                          <div className="mt-1 text-[11px] text-ohho-cream-dim flex justify-between">
                            <span>{Math.round(order.progress * 100)}% complete</span>
                            <a href="#track" onClick={onClose} className="text-ohho-gold hover:underline">
                              View live →
                            </a>
                          </div>
                        </div>
                      )}

                      {/* Items */}
                      <div className="mt-3 space-y-1">
                        {order.items.map((it) => (
                          <div
                            key={it.id}
                            className="flex items-center justify-between text-sm text-ohho-cream/80"
                          >
                            <span className="truncate">
                              {it.emoji} {it.name} × {it.qty}
                            </span>
                            <span className="text-ohho-cream-dim text-xs ml-2">
                              ₹{it.price * it.qty}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Footer */}
                      <div className="mt-3 pt-3 border-t border-ohho-gold/10 flex items-center justify-between gap-3">
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-ohho-cream-dim">
                            Total · {order.mode}
                          </div>
                          <div className="font-display text-ohho-gold text-xl">
                            ₹{order.total}
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            downloadInvoice(order, user?.name || "Customer", user?.email || "")
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-ohho-gold/15 text-ohho-gold border border-ohho-gold/30 hover:bg-ohho-gold/25 text-xs font-semibold"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Invoice
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Loyalty hint footer */}
            <div className="p-5 border-t border-ohho-gold/15">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-ohho-orange/10 to-ohho-gold/10 border border-ohho-gold/20">
                <TrendingUp className="h-5 w-5 text-ohho-gold flex-shrink-0" />
                <div className="text-xs text-ohho-cream/80">
                  You&apos;ve earned <strong className="text-ohho-gold">{user?.loyaltyPoints || 0} pts</strong>.
                  Every ₹10 spent = 1 pt. Redeem points for free items — see OHHO Rewards below.
                </div>
              </div>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
