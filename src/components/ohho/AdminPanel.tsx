"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  LayoutDashboard,
  ShoppingBag,
  Users,
  IndianRupee,
  TrendingUp,
  Clock,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

type AdminOrder = {
  id: string;
  orderId: string;
  invoiceNumber: string | null;
  status: string;
  mode: string;
  total: number;
  subtotal: number;
  progress: number;
  paymentMethod: string;
  createdAt: string;
  items: { id: string; name: string; emoji: string; qty: number; price: number }[];
  user: { id: string; name: string; email: string };
};

type AdminUser = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: string;
  loyaltyPoints: number;
  createdAt: string;
  _count: { orders: number };
};

type Stats = {
  totalOrders: number;
  totalUsers: number;
  totalCustomers: number;
  totalAdmins: number;
  totalRevenue: number;
  activeOrders: number;
  avgOrderValue: number;
  daily: { date: string; revenue: number; orders: number }[];
  topItems: { name: string; emoji: string; qty: number; revenue: number }[];
};

const STATUSES = ["PREPARING", "PICKED", "ENROUTE", "NEAR", "ARRIVED", "CANCELLED"];

const STATUS_COLOR: Record<string, string> = {
  PREPARING: "#ff6a00",
  PICKED: "#ffc107",
  ENROUTE: "#ff8c00",
  NEAR: "#ffd54f",
  ARRIVED: "#10b981",
  CANCELLED: "#d92626",
};

export function AdminPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<"dashboard" | "orders" | "users">("dashboard");
  const [stats, setStats] = useState<Stats | null>(null);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);

  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      setStats(data);
    } catch {
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      setOrders(data.orders || []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setUsers(data.users || []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    if (tab === "dashboard") loadStats();
    if (tab === "orders") loadOrders();
    if (tab === "users") loadUsers();
  }, [open, tab, loadStats, loadOrders, loadUsers]);

  const updateOrderStatus = async (orderId: string, status: string) => {
    const progress =
      status === "PREPARING" ? 0.1 :
      status === "PICKED" ? 0.3 :
      status === "ENROUTE" ? 0.6 :
      status === "NEAR" ? 0.85 :
      status === "ARRIVED" ? 1 :
      0;
    setOrders((cur) =>
      cur.map((o) => (o.id === orderId ? { ...o, status, progress } : o))
    );
    await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status, progress }),
    });
  };

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
            className="w-full max-w-4xl h-full bg-ohho-black-light border-l border-ohho-gold/20 flex flex-col"
          >
            {/* Header */}
            <div className="p-5 border-b border-ohho-gold/15 flex items-start justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-ohho-red/15 border border-ohho-red/40 text-ohho-red text-[10px] font-bold uppercase tracking-wider mb-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-ohho-red ohho-ping" />
                  Admin
                </div>
                <div className="font-display text-2xl text-ohho-cream">OHHO Control Panel</div>
                <div className="text-xs text-ohho-cream-dim">Orders · Users · Live stats</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (tab === "dashboard") loadStats();
                    if (tab === "orders") loadOrders();
                    if (tab === "users") loadUsers();
                  }}
                  className="h-9 w-9 grid place-items-center rounded-md border border-ohho-gold/20 text-ohho-cream hover:bg-ohho-orange/10"
                  aria-label="Refresh"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="h-9 w-9 grid place-items-center rounded-md border border-ohho-gold/20 text-ohho-cream hover:bg-ohho-orange/10"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="px-5 pt-4 flex gap-2 border-b border-ohho-gold/10 pb-4">
              {[
                { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
                { id: "orders", label: "Orders", icon: ShoppingBag },
                { id: "users", label: "Users", icon: Users },
              ].map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id as any)}
                    className={cn(
                      "inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold border transition-all",
                      tab === t.id
                        ? "bg-ohho-orange text-ohho-black border-ohho-orange"
                        : "text-ohho-cream-dim border-ohho-gold/20 hover:border-ohho-gold/50"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {t.label}
                  </button>
                );
              })}
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto ohho-scroll p-5">
              {loading ? (
                <div className="text-center py-20 text-ohho-cream-dim">
                  <Loader2 className="h-8 w-8 mx-auto animate-spin mb-3" />
                  Loading…
                </div>
              ) : tab === "dashboard" ? (
                <DashboardView stats={stats} />
              ) : tab === "orders" ? (
                <OrdersView orders={orders} onStatusChange={updateOrderStatus} />
              ) : (
                <UsersView users={users} />
              )}
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DashboardView({ stats }: { stats: Stats | null }) {
  if (!stats) return <div className="text-ohho-cream-dim text-center py-12">No stats available.</div>;

  const maxRevenue = Math.max(...stats.daily.map((d) => d.revenue), 1);

  return (
    <div className="space-y-5">
      {/* Top stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Revenue", value: `₹${stats.totalRevenue.toLocaleString()}`, icon: IndianRupee, color: "#ff6a00" },
          { label: "Total Orders", value: stats.totalOrders, icon: ShoppingBag, color: "#ffc107" },
          { label: "Active Orders", value: stats.activeOrders, icon: Clock, color: "#d92626" },
          { label: "Customers", value: stats.totalCustomers, icon: Users, color: "#ff8c00" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="glass-card rounded-xl p-4">
              <Icon className="h-5 w-5 mb-2" style={{ color: s.color }} />
              <div className="font-display text-2xl text-ohho-cream">{s.value}</div>
              <div className="text-[10px] uppercase tracking-wider text-ohho-cream-dim mt-0.5">
                {s.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Avg order value */}
      <div className="glass-card rounded-xl p-5 flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-ohho-cream-dim">
            Average Order Value
          </div>
          <div className="font-display text-3xl text-ohho-gold">₹{stats.avgOrderValue}</div>
        </div>
        <TrendingUp className="h-10 w-10 text-ohho-orange/40" />
      </div>

      {/* Last 7 days revenue */}
      <div className="glass-card rounded-xl p-5">
        <div className="font-display text-lg text-ohho-cream mb-4">Revenue · Last 7 days</div>
        <div className="flex items-end justify-between gap-2 h-40">
          {stats.daily.map((d) => (
            <div key={d.date} className="flex-1 flex flex-col items-center justify-end gap-2">
              <div className="text-[10px] text-ohho-gold font-mono">
                {d.revenue > 0 ? `₹${d.revenue}` : "—"}
              </div>
              <div
                className="w-full rounded-t-md bg-gradient-to-t from-ohho-orange to-ohho-gold transition-all"
                style={{ height: `${(d.revenue / maxRevenue) * 100}%`, minHeight: d.revenue > 0 ? "8px" : "2px" }}
              />
              <div className="text-[10px] text-ohho-cream-dim">
                {new Date(d.date).toLocaleDateString("en-IN", { weekday: "short" })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top items */}
      <div className="glass-card rounded-xl p-5">
        <div className="font-display text-lg text-ohho-cream mb-4">Top Items · All-time</div>
        {stats.topItems.length === 0 ? (
          <div className="text-sm text-ohho-cream-dim text-center py-6">No items sold yet.</div>
        ) : (
          <div className="space-y-2">
            {stats.topItems.map((it, i) => (
              <div key={it.name} className="flex items-center gap-3 p-2 rounded-lg bg-ohho-black/40">
                <div className="font-display text-ohho-cream-dim text-sm w-6">#{i + 1}</div>
                <div className="text-xl">{it.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-ohho-cream truncate">{it.name}</div>
                  <div className="text-[11px] text-ohho-cream-dim">
                    {it.qty} sold · ₹{it.revenue} revenue
                  </div>
                </div>
                <div className="font-display text-ohho-gold">₹{it.revenue}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function OrdersView({
  orders,
  onStatusChange,
}: {
  orders: AdminOrder[];
  onStatusChange: (orderId: string, status: string) => void;
}) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-20 text-ohho-cream-dim">
        <ShoppingBag className="h-12 w-12 mx-auto text-ohho-cream-dim/40 mb-3" />
        No orders yet. Place a test order from the customer side.
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <div key={order.id} className="glass-card rounded-xl p-4">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <div className="font-display text-lg text-ohho-cream">{order.orderId}</div>
              <div className="text-[11px] text-ohho-cream-dim mt-0.5">
                {new Date(order.createdAt).toLocaleString("en-IN")} · {order.user.name} ·{" "}
                {order.user.email}
              </div>
            </div>
            <div className="font-display text-ohho-gold text-xl">₹{order.total}</div>
          </div>

          <div className="mt-2 text-sm text-ohho-cream/70">
            {order.items.map((it, i) => (
              <span key={it.id}>
                {i > 0 && " · "}
                {it.emoji} {it.name} × {it.qty}
              </span>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider text-ohho-cream-dim mr-1">
              Status:
            </span>
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => onStatusChange(order.id, s)}
                className={cn(
                  "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all",
                  order.status === s
                    ? "text-ohho-black"
                    : "text-ohho-cream-dim border-ohho-gold/20 hover:border-ohho-gold/50"
                )}
                style={
                  order.status === s
                    ? { background: STATUS_COLOR[s], borderColor: STATUS_COLOR[s] }
                    : undefined
                }
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function UsersView({ users }: { users: AdminUser[] }) {
  if (users.length === 0) {
    return (
      <div className="text-center py-20 text-ohho-cream-dim">
        <Users className="h-12 w-12 mx-auto text-ohho-cream-dim/40 mb-3" />
        No users yet.
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {users.map((u) => (
        <div key={u.id} className="glass-card rounded-xl p-4 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-ohho-orange to-ohho-red grid place-items-center font-display text-ohho-black text-xl flex-shrink-0">
            {u.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-ohho-cream truncate">{u.name}</span>
              {u.role === "ADMIN" && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-ohho-red/15 text-ohho-red border border-ohho-red/30">
                  Admin
                </span>
              )}
            </div>
            <div className="text-xs text-ohho-cream-dim truncate">{u.email}</div>
            <div className="text-[11px] text-ohho-cream-dim mt-0.5">
              {u._count.orders} order{u._count.orders !== 1 ? "s" : ""} · {u.loyaltyPoints} pts ·{" "}
              {u.phone || "no phone"}
            </div>
          </div>
          <div className="text-[10px] text-ohho-cream-dim whitespace-nowrap">
            {new Date(u.createdAt).toLocaleDateString("en-IN")}
          </div>
        </div>
      ))}
    </div>
  );
}
