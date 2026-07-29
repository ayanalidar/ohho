"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Receipt, ShoppingBag, Coins, Clock, CheckCircle2, Bike, MapPin,
  Download, Loader2, Star, TrendingUp, Wallet, Plus, Trash2, Copy, Gift,
  RefreshCw, Send, User,
} from "lucide-react";
import { useAuth } from "@/components/ohho/AuthProvider";
import { useCart } from "@/store/cart";
import { menuItems } from "@/data/menu";
import { useOrderSocket } from "@/hooks/use-order-socket";
import { cn } from "@/lib/utils";

type OrderItem = {
  id: string; itemId: string; name: string; emoji: string; image: string;
  price: number; qty: number;
};
type Order = {
  id: string; orderId: string; invoiceNumber: string | null;
  status: string; mode: string; total: number; subtotal: number;
  deliveryFee: number; taxes: number; walletDebit: number;
  paymentMethod: string; paymentStatus: string; address: string | null;
  progress: number; createdAt: string; notes: string | null; rated: boolean;
  items: OrderItem[];
};

type Tab = "orders" | "addresses" | "wallet" | "refer";

const STATUS_META: Record<string, { label: string; color: string; icon: any }> = {
  PREPARING: { label: "Preparing", color: "#ff6a00", icon: Clock },
  PICKED: { label: "Picked up", color: "#ffc107", icon: Bike },
  ENROUTE: { label: "On the way", color: "#ff8c00", icon: Bike },
  NEAR: { label: "Near you", color: "#ffd54f", icon: MapPin },
  ARRIVED: { label: "Delivered", color: "#10b981", icon: CheckCircle2 },
  CANCELLED: { label: "Cancelled", color: "#d92626", icon: X },
};

function downloadInvoice(order: Order, userName: string, userEmail: string) {
  const itemsHtml = order.items.map((it) => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #eee">${it.emoji || ""} ${it.name}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${it.qty}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">₹${it.price}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">₹${it.price * it.qty}</td>
    </tr>`).join("");
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Invoice ${order.invoiceNumber}</title>
  <style>
    body { font-family: -apple-system, system-ui, sans-serif; background: #f5e6cc; padding: 40px; color: #0e0a04; }
    .card { max-width: 720px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 12px 40px rgba(14,10,4,0.15); }
    .head { background: linear-gradient(135deg, #ff6a00, #d92626); color: #fff; padding: 28px 32px; display:flex; align-items:center; justify-content:space-between; gap:16px; }
    .head .brand { display:flex; align-items:center; gap:14px; }
    .head .brand-mark { width:48px; height:48px; border-radius:10px; background:#fff; display:grid; place-items:center; font-size:24px; font-weight:900; color:#ff6a00; letter-spacing:-0.02em; }
    .head h1 { margin: 0; font-size: 24px; letter-spacing: 0.04em; }
    .head .sub { opacity: 0.85; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; margin-top: 4px; }
    .head .invoice-tag { text-align:right; font-size:11px; opacity:0.9; letter-spacing:0.1em; text-transform:uppercase; }
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
        <div class="brand">
          <div class="brand-mark">O</div>
          <div>
            <h1>OHHO BURGERS</h1>
            <div class="sub">Live Premium · Tax Invoice</div>
          </div>
        </div>
        <div class="invoice-tag">
          <div><b>Invoice</b></div>
          <div>${order.invoiceNumber || "—"}</div>
        </div>
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
          ${order.walletDebit > 0 ? `<div><span>Wallet debit</span><span>−₹${(order.walletDebit / 100).toFixed(2)}</span></div>` : ""}
          <div class="grand"><span>Total Paid</span><span>₹${order.total}</span></div>
        </div>
        ${order.notes ? `<div style="margin-top:12px;padding:8px;background:#faf3e6;border-radius:6px;font-size:12px"><b>Notes:</b> ${order.notes}</div>` : ""}
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
  const { user, refresh } = useAuth();
  const { add } = useCart();
  const [tab, setTab] = useState<Tab>("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersTab, setOrdersTab] = useState<"active" | "past">("past");
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [wallet, setWallet] = useState<any>(null);
  const [referral, setReferral] = useState<any>(null);
  const [ratingOrder, setRatingOrder] = useState<Order | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [ordersRes, addrRes, walletRes, refRes] = await Promise.all([
        fetch("/api/orders"),
        fetch("/api/addresses"),
        fetch("/api/wallet"),
        fetch("/api/referral"),
      ]);
      const ordersData = await ordersRes.json();
      const addrData = await addrRes.json();
      const walletData = await walletRes.json();
      const refData = await refRes.json();
      setOrders(ordersData.orders || []);
      setAddresses(addrData.addresses || []);
      setWallet(walletData);
      setReferral(refData);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  const active = orders.filter((o) => o.status !== "ARRIVED" && o.status !== "CANCELLED");
  const past = orders.filter((o) => o.status === "ARRIVED" || o.status === "CANCELLED");

  // Subscribe to real-time updates for the most recent active order
  const latestActiveOrderId = active[0]?.orderId || null;
  const { lastUpdate, connected } = useOrderSocket(latestActiveOrderId);

  // When a WS update comes in, update the order in state
  useEffect(() => {
    if (lastUpdate) {
      setOrders((cur) =>
        cur.map((o) =>
          o.orderId === lastUpdate.orderId
            ? { ...o, status: lastUpdate.status, progress: lastUpdate.progress }
            : o
        )
      );
    }
  }, [lastUpdate]);

  const reorder = (order: Order) => {
    order.items.forEach((it) => {
      const menuItem = menuItems.find((m) => m.id === it.itemId);
      if (menuItem) add(menuItem, it.qty);
    });
    onClose();
  };

  const submitRating = async (orderId: string, rating: number, text: string) => {
    try {
      await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, rating, text }),
      });
      setRatingOrder(null);
      await refresh();
      load();
    } catch {
      // ignore
    }
  };

  const reloadWallet = async (amount: number) => {
    try {
      await fetch("/api/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountRupees: amount }),
      });
      await refresh();
      load();
    } catch {
      // ignore
    }
  };

  const copyReferralCode = () => {
    if (user?.referralCode) {
      navigator.clipboard.writeText(user.referralCode);
    }
  };

  return (
    <>
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
                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-ohho-gold/10 border border-ohho-gold/30 text-ohho-gold text-xs font-semibold">
                      <Coins className="h-3 w-3" /> {user?.loyaltyPoints || 0} pts
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-ohho-orange/10 border border-ohho-orange/30 text-ohho-orange text-xs font-semibold">
                      <Wallet className="h-3 w-3" /> ₹{wallet ? (wallet.balanceRupees).toFixed(2) : "0.00"}
                    </span>
                  </div>
                </div>
                <button onClick={onClose} aria-label="Close" className="h-9 w-9 grid place-items-center rounded-md border border-ohho-gold/20 text-ohho-cream hover:bg-ohho-orange/10">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Tab nav */}
              <div className="px-5 pt-4 flex gap-1.5 border-b border-ohho-gold/10 pb-3 overflow-x-auto ohho-scroll-x">
                {[
                  { id: "orders", label: "Orders", icon: ShoppingBag },
                  { id: "addresses", label: "Addresses", icon: MapPin },
                  { id: "wallet", label: "Wallet", icon: Wallet },
                  { id: "refer", label: "Refer & Earn", icon: Gift },
                ].map((t) => {
                  const Icon = t.icon;
                  return (
                    <button key={t.id} onClick={() => setTab(t.id as Tab)} className={cn("inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-semibold border transition-all whitespace-nowrap", tab === t.id ? "bg-ohho-orange text-ohho-black border-ohho-orange" : "text-ohho-cream-dim border-ohho-gold/20 hover:border-ohho-gold/50")}>
                      <Icon className="h-4 w-4" /> {t.label}
                    </button>
                  );
                })}
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto ohho-scroll p-5">
                {loading ? (
                  <div className="text-center py-20 text-ohho-cream-dim">
                    <Loader2 className="h-8 w-8 mx-auto animate-spin mb-3" /> Loading…
                  </div>
                ) : tab === "orders" ? (
                  <OrdersTab
                    ordersTab={ordersTab} setOrdersTab={setOrdersTab}
                    active={active} past={past} user={user}
                    connected={connected}
                    onReorder={reorder} onRate={(o) => setRatingOrder(o)}
                    onInvoice={(o) => downloadInvoice(o, user?.name || "Customer", user?.email || "")}
                  />
                ) : tab === "addresses" ? (
                  <AddressesTab addresses={addresses} onRefresh={load} />
                ) : tab === "wallet" ? (
                  <WalletTab wallet={wallet} onReload={reloadWallet} />
                ) : (
                  <ReferTab referral={referral} user={user} onCopy={copyReferralCode} />
                )}
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rating modal */}
      <RatingModal order={ratingOrder} onClose={() => setRatingOrder(null)} onSubmit={submitRating} />
    </>
  );
}

function OrdersTab({ ordersTab, setOrdersTab, active, past, user, connected, onReorder, onRate, onInvoice }: any) {
  const latestActive = active[0];
  return (
    <div>
      <div className="flex gap-2 mb-4 items-center">
        <button onClick={() => setOrdersTab("active")} className={cn("px-4 py-2 rounded-md text-sm font-semibold border", ordersTab === "active" ? "bg-ohho-orange text-ohho-black border-ohho-orange" : "text-ohho-cream-dim border-ohho-gold/20")}>
          Active ({active.length})
        </button>
        <button onClick={() => setOrdersTab("past")} className={cn("px-4 py-2 rounded-md text-sm font-semibold border", ordersTab === "past" ? "bg-ohho-orange text-ohho-black border-ohho-orange" : "text-ohho-cream-dim border-ohho-gold/20")}>
          Past ({past.length})
        </button>
        {active.length > 0 && (
          <span className={cn("ml-auto inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold border", connected ? "bg-ohho-gold/10 text-ohho-gold border-ohho-gold/30" : "bg-ohho-cream/5 text-ohho-cream-dim border-ohho-cream/20")}>
            <span className={cn("h-1.5 w-1.5 rounded-full", connected ? "bg-ohho-gold animate-pulse" : "bg-ohho-cream-dim")} />
            {connected ? "LIVE" : "Connecting…"}
          </span>
        )}
      </div>

      {/* Live tracker for the most recent active order */}
      {ordersTab === "active" && latestActive && (
        <LiveOrderTracker order={latestActive} />
      )}

      {(ordersTab === "active" ? active : past).length === 0 ? (
        <div className="text-center py-16">
          <ShoppingBag className="h-12 w-12 mx-auto text-ohho-cream-dim/40 mb-3" />
          <div className="font-display text-lg text-ohho-cream">No {ordersTab} orders</div>
        </div>
      ) : (
        <div className="space-y-3">
          {(ordersTab === "active" ? active : past).map((order: Order) => {
            const meta = STATUS_META[order.status] || STATUS_META.PREPARING;
            const Icon = meta.icon;
            return (
              <div key={order.id} className="rounded-xl glass-card p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <div className="font-display text-lg text-ohho-cream">{order.orderId}</div>
                    <div className="text-[11px] text-ohho-cream-dim mt-0.5">{new Date(order.createdAt).toLocaleString("en-IN")}</div>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border" style={{ color: meta.color, borderColor: `${meta.color}55`, background: `${meta.color}15` }}>
                    <Icon className="h-3 w-3" /> {meta.label}
                  </div>
                </div>
                <div className="mt-2 space-y-1">
                  {order.items.map((it) => (
                    <div key={it.id} className="flex items-center justify-between text-sm text-ohho-cream/80">
                      <span className="truncate">{it.emoji} {it.name} × {it.qty}</span>
                      <span className="text-ohho-cream-dim text-xs ml-2">₹{it.price * it.qty}</span>
                    </div>
                  ))}
                </div>
                {order.notes && (
                  <div className="mt-2 text-[11px] text-ohho-cream-dim italic">Note: {order.notes}</div>
                )}
                <div className="mt-3 pt-3 border-t border-ohho-gold/10 flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-ohho-cream-dim">Total · {order.mode}</div>
                    <div className="font-display text-ohho-gold text-xl">₹{order.total}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {order.status === "ARRIVED" && !order.rated && (
                      <button onClick={() => onRate(order)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-ohho-gold/15 text-ohho-gold border border-ohho-gold/30 hover:bg-ohho-gold/25 text-xs font-semibold">
                        <Star className="h-3.5 w-3.5" /> Rate
                      </button>
                    )}
                    <button onClick={() => onReorder(order)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-ohho-orange/15 text-ohho-orange border border-ohho-orange/30 hover:bg-ohho-orange/25 text-xs font-semibold">
                      <RefreshCw className="h-3.5 w-3.5" /> Reorder
                    </button>
                    <button onClick={() => onInvoice(order)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-ohho-cream/10 text-ohho-cream border border-ohho-cream/20 hover:bg-ohho-cream/20 text-xs font-semibold">
                      <Download className="h-3.5 w-3.5" /> Invoice
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AddressesTab({ addresses, onRefresh }: { addresses: any[]; onRefresh: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [label, setLabel] = useState("");
  const [line, setLine] = useState("");
  const [pincode, setPincode] = useState("");

  const save = async () => {
    if (!label || !line) return;
    await fetch("/api/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label, line, pincode }),
    });
    setLabel(""); setLine(""); setPincode(""); setShowForm(false);
    onRefresh();
  };

  const remove = async (id: string) => {
    await fetch(`/api/addresses?id=${id}`, { method: "DELETE" });
    onRefresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="font-display text-xl text-ohho-cream">Saved addresses</div>
        <button onClick={() => setShowForm((v) => !v)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-ohho-orange/15 text-ohho-orange border border-ohho-orange/30 text-xs font-semibold hover:bg-ohho-orange/25">
          <Plus className="h-3.5 w-3.5" /> Add new
        </button>
      </div>
      {showForm && (
        <div className="mb-4 p-4 rounded-xl glass-card space-y-2">
          <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Label (Home, Work, Other)" className="w-full px-3 py-2 rounded-md bg-ohho-black/60 border border-ohho-gold/15 text-ohho-cream text-sm focus:outline-none focus:border-ohho-orange/50" />
          <textarea value={line} onChange={(e) => setLine(e.target.value)} placeholder="Full address" rows={2} className="w-full px-3 py-2 rounded-md bg-ohho-black/60 border border-ohho-gold/15 text-ohho-cream text-sm focus:outline-none focus:border-ohho-orange/50 resize-none" />
          <input value={pincode} onChange={(e) => setPincode(e.target.value)} placeholder="Pincode" className="w-full px-3 py-2 rounded-md bg-ohho-black/60 border border-ohho-gold/15 text-ohho-cream text-sm focus:outline-none focus:border-ohho-orange/50" />
          <button onClick={save} className="w-full py-2 rounded-md bg-gradient-to-r from-ohho-orange to-ohho-orange-deep text-ohho-black font-bold text-sm">Save address</button>
        </div>
      )}
      {addresses.length === 0 ? (
        <div className="text-center py-12 text-ohho-cream-dim">
          <MapPin className="h-10 w-10 mx-auto mb-3 opacity-40" />
          No saved addresses yet.
        </div>
      ) : (
        <div className="space-y-2">
          {addresses.map((a) => (
            <div key={a.id} className="p-3 rounded-lg glass-card flex items-start gap-3">
              <div className="h-9 w-9 rounded-md bg-ohho-orange/15 border border-ohho-orange/30 grid place-items-center flex-shrink-0">
                <MapPin className="h-4 w-4 text-ohho-orange" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-ohho-cream text-sm">{a.label}</div>
                <div className="text-xs text-ohho-cream-dim">{a.line}</div>
                {a.pincode && <div className="text-[11px] text-ohho-cream-dim mt-0.5">Pincode: {a.pincode}</div>}
              </div>
              <button onClick={() => remove(a.id)} className="text-ohho-cream-dim hover:text-ohho-red" aria-label="Remove">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function WalletTab({ wallet, onReload }: { wallet: any; onReload: (n: number) => void }) {
  const RELOAD_OPTIONS = [200, 500, 1000, 2000];
  return (
    <div>
      <div className="glass-card rounded-2xl p-6 text-center">
        <div className="text-[10px] uppercase tracking-wider text-ohho-cream-dim">Wallet balance</div>
        <div className="font-display text-5xl text-ohho-gold mt-2">₹{wallet ? wallet.balanceRupees.toFixed(2) : "0.00"}</div>
        <div className="text-xs text-ohho-cream-dim mt-1">{wallet?.upiId ? `Linked UPI: ${wallet.upiId}` : "No UPI linked"}</div>
      </div>
      <div className="mt-5">
        <div className="font-display text-lg text-ohho-cream mb-3">Reload wallet</div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {RELOAD_OPTIONS.map((amt) => (
            <button key={amt} onClick={() => onReload(amt)} className="p-3 rounded-lg glass-card hover:border-ohho-gold/50 text-left">
              <div className="font-display text-xl text-ohho-gold">₹{amt}</div>
              <div className="text-[10px] text-ohho-cream-dim">
                {amt >= 500 ? `+₹${Math.round(amt * 0.10)} bonus (10%)` : amt >= 200 ? `+₹${Math.round(amt * 0.05)} bonus (5%)` : "No bonus"}
              </div>
            </button>
          ))}
        </div>
        <div className="text-[11px] text-ohho-cream-dim flex items-start gap-1.5">
          <Gift className="h-3 w-3 text-ohho-gold mt-0.5 flex-shrink-0" />
          Reload ₹500+ for 10% bonus, ₹200+ for 5% bonus. Use wallet at checkout for 1-click payment.
        </div>
      </div>
      {wallet && wallet.transactions.length > 0 && (
        <div className="mt-5">
          <div className="font-display text-lg text-ohho-cream mb-3">Transaction history</div>
          <div className="space-y-2">
            {wallet.transactions.map((t: any, i: number) => (
              <div key={i} className="p-3 rounded-lg glass-card flex items-center justify-between">
                <div>
                  <div className="text-sm text-ohho-cream">Order {t.orderId}</div>
                  <div className="text-[11px] text-ohho-cream-dim">{new Date(t.date).toLocaleString("en-IN")}</div>
                </div>
                <div className="font-display text-ohho-red">−₹{(t.amount / 100).toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ReferTab({ referral, user, onCopy }: { referral: any; user: any; onCopy: () => void }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { onCopy(); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <div>
      <div className="glass-card rounded-2xl p-6 text-center">
        <div className="h-14 w-14 mx-auto rounded-full bg-gradient-to-br from-ohho-orange to-ohho-red grid place-items-center">
          <Gift className="h-7 w-7 text-ohho-black" />
        </div>
        <div className="font-display text-2xl text-ohho-cream mt-3">Refer &amp; Earn</div>
        <p className="text-sm text-ohho-cream-dim mt-1">Give 100 pts, get 100 pts. When your friend places their first order, you both get 100 more.</p>
      </div>

      <div className="mt-5 glass-card rounded-2xl p-5">
        <div className="text-[10px] uppercase tracking-wider text-ohho-cream-dim mb-1">Your referral code</div>
        <div className="flex items-center gap-2">
          <div className="flex-1 font-mono font-bold text-lg text-ohho-gold tracking-wider bg-ohho-black/50 px-3 py-2 rounded-md border border-ohho-gold/20">
            {user?.referralCode || "—"}
          </div>
          <button onClick={copy} className="px-3 py-2 rounded-md bg-ohho-orange/15 text-ohho-orange border border-ohho-orange/30 hover:bg-ohho-orange/25 text-sm font-semibold inline-flex items-center gap-1.5">
            {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <div className="mt-2 text-[11px] text-ohho-cream-dim">
          Share this code. Friends enter it at signup. Both of you get 100 pts instantly.
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        <div className="glass-card rounded-xl p-4 text-center">
          <div className="font-display text-2xl text-ohho-gold">{referral?.totalReferrals || 0}</div>
          <div className="text-[10px] uppercase tracking-wider text-ohho-cream-dim mt-1">Total referrals</div>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <div className="font-display text-2xl text-ohho-orange">{referral?.completedReferrals || 0}</div>
          <div className="text-[10px] uppercase tracking-wider text-ohho-cream-dim mt-1">First orders</div>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <div className="font-display text-2xl text-ohho-gold">{referral?.pointsEarned || 0}</div>
          <div className="text-[10px] uppercase tracking-wider text-ohho-cream-dim mt-1">Points earned</div>
        </div>
      </div>

      {referral?.referrals?.length > 0 && (
        <div className="mt-5">
          <div className="font-display text-lg text-ohho-cream mb-3">Your referrals</div>
          <div className="space-y-2">
            {referral.referrals.map((r: any, i: number) => (
              <div key={i} className="p-3 rounded-lg glass-card flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-ohho-orange/15 grid place-items-center">
                    <User className="h-4 w-4 text-ohho-orange" />
                  </div>
                  <div>
                    <div className="text-sm text-ohho-cream">{r.name}</div>
                    <div className="text-[11px] text-ohho-cream-dim">{r.email} · {new Date(r.joinedAt).toLocaleDateString("en-IN")}</div>
                  </div>
                </div>
                <div className="text-xs text-ohho-gold font-semibold">+100 pts</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function LiveOrderTracker({ order }: { order: Order }) {
  const STAGES = [
    { id: "PREPARING", label: "Preparing", icon: Clock, color: "#ff6a00" },
    { id: "PICKED", label: "Picked up", icon: Bike, color: "#ffc107" },
    { id: "ENROUTE", label: "On the way", icon: Bike, color: "#ff8c00" },
    { id: "NEAR", label: "Near you", icon: MapPin, color: "#ffd54f" },
    { id: "ARRIVED", label: "Delivered", icon: CheckCircle2, color: "#10b981" },
  ];
  const stageIdx = STAGES.findIndex(s => s.id === order.status);
  const eta = Math.max(0, Math.round((1 - order.progress) * 25)); // rough ETA in min

  return (
    <div className="mb-4 rounded-2xl glass-card p-5 border border-ohho-orange/30">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-ohho-cream-dim">Tracking live</div>
          <div className="font-display text-lg text-ohho-cream">{order.orderId}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-wider text-ohho-cream-dim">ETA</div>
          <div className="font-display text-xl text-ohho-gold">{eta > 0 ? `${eta} min` : "Arrived!"}</div>
        </div>
      </div>

      {/* Stage timeline */}
      <div className="flex items-center gap-1">
        {STAGES.map((s, i) => {
          const Icon = s.icon;
          const done = i <= stageIdx;
          const current = i === stageIdx;
          return (
            <div key={s.id} className="flex-1 flex flex-col items-center gap-1.5">
              <div
                className={cn("h-9 w-9 rounded-full grid place-items-center transition-all", current && "scale-110")}
                style={{
                  background: done ? `${s.color}22` : "rgba(245,230,204,0.05)",
                  border: `2px solid ${done ? s.color : "rgba(245,230,204,0.15)"}`,
                }}
              >
                <Icon className="h-4 w-4" style={{ color: done ? s.color : "rgba(245,230,204,0.3)" }} />
              </div>
              <div className={cn("text-[9px] text-center leading-tight", done ? "text-ohho-cream" : "text-ohho-cream-dim")}>
                {s.label}
              </div>
              {i < STAGES.length - 1 && (
                <div className={cn("absolute h-0.5 transition-colors", done ? "bg-ohho-orange" : "bg-ohho-cream/10")} style={{ width: "100%", left: "50%", top: "18px", zIndex: -1 }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="mt-4">
        <div className="flex justify-between text-[10px] text-ohho-cream-dim mb-1">
          <span>Progress</span>
          <span>{Math.round(order.progress * 100)}%</span>
        </div>
        <div className="h-2 rounded-full bg-ohho-cream/10 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-ohho-orange to-ohho-gold transition-all duration-500"
            style={{ width: `${Math.max(5, order.progress * 100)}%` }}
          />
        </div>
      </div>

      {/* Rider info if past PREPARING */}
      {order.status !== "PREPARING" && order.status !== "ARRIVED" && (
        <div className="mt-4 p-3 rounded-lg bg-ohho-black/40 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-ohho-orange to-ohho-red grid place-items-center text-xl">🛵</div>
          <div>
            <div className="text-sm text-ohho-cream font-semibold">Imran K.</div>
            <div className="text-[11px] text-ohho-cream-dim">⭐ 4.9 · Honda Activa</div>
          </div>
        </div>
      )}
    </div>
  );
}

function RatingModal({ order, onClose, onSubmit }: { order: Order | null; onClose: () => void; onSubmit: (orderId: string, rating: number, text: string) => void }) {
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  if (!order) return null;
  return (
    <AnimatePresence>
      {order && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[90] grid place-items-center p-4 bg-ohho-black/85 backdrop-blur-md" onClick={onClose}>
          <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 16 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl bg-ohho-black-light border border-ohho-gold/25 shadow-2xl p-6">
            <div className="text-center">
              <div className="font-display text-xl text-ohho-cream">Rate your order</div>
              <div className="text-xs text-ohho-cream-dim mt-1">{order.orderId}</div>
            </div>
            <div className="mt-5 flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => setRating(n)} className="p-1">
                  <Star className={cn("h-8 w-8 transition-all", n <= rating ? "text-ohho-gold fill-ohho-gold scale-110" : "text-ohho-cream/20")} />
                </button>
              ))}
            </div>
            <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="How was your meal? (optional)" rows={3} className="mt-4 w-full px-3 py-2.5 rounded-md bg-ohho-black/60 border border-ohho-gold/15 text-ohho-cream text-sm placeholder:text-ohho-cream-dim/50 focus:outline-none focus:border-ohho-orange/50 resize-none" />
            <div className="mt-3 flex gap-2">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-md border border-ohho-gold/30 text-ohho-cream text-sm font-semibold hover:bg-ohho-gold/10">Cancel</button>
              <button onClick={() => onSubmit(order.id, rating, text)} className="flex-1 py-2.5 rounded-md bg-gradient-to-r from-ohho-orange to-ohho-orange-deep text-ohho-black font-bold text-sm hover:shadow-lg hover:shadow-ohho-orange/40 inline-flex items-center justify-center gap-1.5">
                <Send className="h-4 w-4" /> Submit (+10 pts)
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
