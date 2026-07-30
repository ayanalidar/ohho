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
  Star,
  Building2,
  PartyPopper,
  Phone,
  Mail,
  Utensils,
  MapPin,
  Camera,
  Plus,
  Settings,
} from "lucide-react";
import { useAuth } from "@/components/ohho/AuthProvider";
import { cn } from "@/lib/utils";
import { MenuItemsView, type MenuItem } from "./admin/MenuItemsView";
import { TimelineView, type TimelineEra } from "./admin/TimelineView";
import { CateringPackagesView, type CateringPackage } from "./admin/CateringPackagesView";
import { LocationsView, type Location } from "./admin/LocationsView";

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
  const { user } = useAuth();
  const isOperator = user?.role === "OPERATOR";
  const [tab, setTab] = useState<"dashboard" | "orders" | "users" | "reviews" | "franchise" | "catering" | "menu-items" | "timeline" | "catering-packages" | "locations" | "cart-photos" | "site-content">("dashboard");
  const [stats, setStats] = useState<Stats | null>(null);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [franchiseLeads, setFranchiseLeads] = useState<any[]>([]);
  const [cateringInquiries, setCateringInquiries] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [timelineEras, setTimelineEras] = useState<TimelineEra[]>([]);
  const [cateringPackages, setCateringPackages] = useState<CateringPackage[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [cartPhotos, setCartPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadCartPhotos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/cart-photos?admin=1");
      const data = await res.json();
      setCartPhotos(data.photos || []);
    } catch { setCartPhotos([]); }
    finally { setLoading(false); }
  }, []);

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

  const loadReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reviews");
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch { setReviews([]); }
    finally { setLoading(false); }
  }, []);

  const loadFranchise = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/franchise");
      const data = await res.json();
      setFranchiseLeads(data.leads || []);
    } catch { setFranchiseLeads([]); }
    finally { setLoading(false); }
  }, []);

  const loadCatering = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/catering");
      const data = await res.json();
      setCateringInquiries(data.inquiries || []);
    } catch { setCateringInquiries([]); }
    finally { setLoading(false); }
  }, []);

  const loadMenuItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/menu-items?admin=1");
      const data = await res.json();
      setMenuItems(data.items || []);
    } catch { setMenuItems([]); }
    finally { setLoading(false); }
  }, []);

  const loadTimeline = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/timeline");
      const data = await res.json();
      setTimelineEras(data.eras || []);
    } catch { setTimelineEras([]); }
    finally { setLoading(false); }
  }, []);

  const loadCateringPackages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/catering-packages?admin=1");
      const data = await res.json();
      setCateringPackages(data.packages || []);
    } catch { setCateringPackages([]); }
    finally { setLoading(false); }
  }, []);

  const loadLocations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/locations");
      const data = await res.json();
      setLocations(data.locations || []);
    } catch { setLocations([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (!open) return;
    if (tab === "dashboard") loadStats();
    if (tab === "orders") loadOrders();
    if (tab === "users") loadUsers();
    if (tab === "reviews") loadReviews();
    if (tab === "franchise") loadFranchise();
    if (tab === "catering") loadCatering();
    if (tab === "menu-items") loadMenuItems();
    if (tab === "timeline") loadTimeline();
    if (tab === "catering-packages") loadCateringPackages();
    if (tab === "locations") loadLocations();
    if (tab === "cart-photos") loadCartPhotos();
  }, [open, tab, loadStats, loadOrders, loadUsers, loadReviews, loadFranchise, loadCatering, loadMenuItems, loadTimeline, loadCateringPackages, loadLocations, loadCartPhotos]);

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
                  {isOperator ? "Operator" : "Admin"}
                </div>
                <div className="font-display text-2xl text-ohho-cream">{isOperator ? "Location Panel" : "OHHO Control Panel"}</div>
                <div className="text-xs text-ohho-cream-dim">{isOperator ? "Your location · Orders · Kitchen" : "Orders · Users · Live stats"}</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (tab === "dashboard") loadStats();
                    if (tab === "orders") loadOrders();
                    if (tab === "users") loadUsers();
                    if (tab === "reviews") loadReviews();
                    if (tab === "franchise") loadFranchise();
                    if (tab === "catering") loadCatering();
                    if (tab === "menu-items") loadMenuItems();
                    if (tab === "timeline") loadTimeline();
                    if (tab === "catering-packages") loadCateringPackages();
                    if (tab === "locations") loadLocations();
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
            <div className="px-5 pt-4 flex gap-2 border-b border-ohho-gold/10 pb-4 overflow-x-auto ohho-scroll-x">
              {[
                { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, adminOnly: false },
                { id: "orders", label: "Orders", icon: ShoppingBag, adminOnly: false },
                { id: "users", label: "Users", icon: Users, adminOnly: true },
                { id: "reviews", label: "Reviews", icon: Star, adminOnly: true },
                { id: "franchise", label: "Franchise", icon: Building2, adminOnly: true },
                { id: "catering", label: "Catering", icon: PartyPopper, adminOnly: true },
                { id: "menu-items", label: "Menu Items", icon: Utensils, adminOnly: true },
                { id: "timeline", label: "Timeline", icon: Clock, adminOnly: true },
                { id: "catering-packages", label: "Catering Pkg", icon: PartyPopper, adminOnly: true },
                { id: "locations", label: "Locations", icon: MapPin, adminOnly: false },
                { id: "cart-photos", label: "Cart Photos", icon: Camera, adminOnly: true },
                { id: "site-content", label: "Site Content", icon: Settings, adminOnly: true },
              ].filter(t => !isOperator || !t.adminOnly).map((t) => {
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
              ) : tab === "users" ? (
                <UsersView users={users} />
              ) : tab === "reviews" ? (
                <ReviewsView reviews={reviews} />
              ) : tab === "franchise" ? (
                <FranchiseLeadsView leads={franchiseLeads} />
              ) : tab === "catering" ? (
                <CateringView inquiries={cateringInquiries} />
              ) : tab === "menu-items" ? (
                <MenuItemsView items={menuItems} />
              ) : tab === "timeline" ? (
                <TimelineView eras={timelineEras} />
              ) : tab === "catering-packages" ? (
                <CateringPackagesView packages={cateringPackages} />
              ) : tab === "locations" ? (
                <LocationsView locations={locations} />
              ) : tab === "cart-photos" ? (
                <CartPhotosView photos={cartPhotos} onRefresh={loadCartPhotos} />
              ) : (
                <SiteContentView />
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
                  "px-2.5 py-1.5 min-h-[36px] rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all",
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

function ReviewsView({ reviews }: { reviews: any[] }) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-20 text-ohho-cream-dim">
        <Star className="h-12 w-12 mx-auto text-ohho-cream-dim/40 mb-3" />
        No reviews yet.
      </div>
    );
  }
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  return (
    <div className="space-y-3">
      <div className="glass-card rounded-xl p-4 flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-ohho-cream-dim">Average rating</div>
          <div className="font-display text-3xl text-ohho-gold">{avg.toFixed(2)} ★</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-wider text-ohho-cream-dim">Total reviews</div>
          <div className="font-display text-3xl text-ohho-cream">{reviews.length}</div>
        </div>
      </div>
      {reviews.map((r) => (
        <div key={r.id} className="glass-card rounded-xl p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-semibold text-ohho-cream">{r.user?.name || "Anonymous"}</div>
              <div className="text-[11px] text-ohho-cream-dim">{new Date(r.createdAt).toLocaleString("en-IN")} · Order {r.order?.orderId}</div>
            </div>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={cn("h-3.5 w-3.5", i < r.rating ? "text-ohho-gold fill-ohho-gold" : "text-ohho-cream/15")} />
              ))}
            </div>
          </div>
          {r.text && <p className="mt-2 text-sm text-ohho-cream/80 italic">&ldquo;{r.text}&rdquo;</p>}
          {r.itemName && <div className="mt-1 text-[11px] text-ohho-gold">Reviewing: {r.itemName}</div>}
        </div>
      ))}
    </div>
  );
}

function FranchiseLeadsView({ leads }: { leads: any[] }) {
  if (leads.length === 0) {
    return (
      <div className="text-center py-20 text-ohho-cream-dim">
        <Building2 className="h-12 w-12 mx-auto text-ohho-cream-dim/40 mb-3" />
        No franchise applications yet.
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {leads.map((l) => (
        <div key={l.id} className="glass-card rounded-xl p-4">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <div className="font-display text-lg text-ohho-cream">{l.name}</div>
              <div className="text-xs text-ohho-cream-dim">{l.email} · {l.phone}</div>
            </div>
            <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
              l.status === "NEW" ? "bg-ohho-orange/15 text-ohho-orange border-ohho-orange/40" :
              l.status === "CONTACTED" ? "bg-ohho-gold/15 text-ohho-gold border-ohho-gold/40" :
              l.status === "QUALIFIED" ? "bg-ohho-green/15 text-ohho-green border-ohho-green/40" :
              "bg-ohho-cream/10 text-ohho-cream-dim border-ohho-cream/20"
            )}>{l.status}</span>
          </div>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div><span className="text-ohho-cream-dim">City:</span> <span className="text-ohho-cream">{l.city}</span></div>
            <div><span className="text-ohho-cream-dim">Type:</span> <span className="text-ohho-cream">{l.locationType}</span></div>
            <div><span className="text-ohho-cream-dim">Investment:</span> <span className="text-ohho-cream">{l.investment}</span></div>
            <div><span className="text-ohho-cream-dim">Timeline:</span> <span className="text-ohho-cream">{l.timeline}</span></div>
          </div>
          {l.message && <div className="mt-2 text-xs text-ohho-cream/70 italic">&ldquo;{l.message}&rdquo;</div>}
          <div className="mt-2 text-[11px] text-ohho-cream-dim">{new Date(l.createdAt).toLocaleString("en-IN")}</div>
          <div className="mt-3 flex gap-2">
            <a href={`tel:${l.phone}`} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-ohho-orange/15 text-ohho-orange border border-ohho-orange/30 text-xs font-semibold"><Phone className="h-3 w-3" /> Call</a>
            <a href={`mailto:${l.email}`} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-ohho-gold/15 text-ohho-gold border border-ohho-gold/30 text-xs font-semibold"><Mail className="h-3 w-3" /> Email</a>
          </div>
        </div>
      ))}
    </div>
  );
}

function CateringView({ inquiries }: { inquiries: any[] }) {
  if (inquiries.length === 0) {
    return (
      <div className="text-center py-20 text-ohho-cream-dim">
        <PartyPopper className="h-12 w-12 mx-auto text-ohho-cream-dim/40 mb-3" />
        No catering inquiries yet.
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {inquiries.map((i) => (
        <div key={i.id} className="glass-card rounded-xl p-4">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <div className="font-display text-lg text-ohho-cream">{i.name}</div>
              <div className="text-xs text-ohho-cream-dim">{i.email} · {i.phone}</div>
            </div>
            <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
              i.status === "NEW" ? "bg-ohho-orange/15 text-ohho-orange border-ohho-orange/40" :
              i.status === "QUOTED" ? "bg-ohho-gold/15 text-ohho-gold border-ohho-gold/40" :
              i.status === "CONFIRMED" ? "bg-ohho-green/15 text-ohho-green border-ohho-green/40" :
              "bg-ohho-cream/10 text-ohho-cream-dim border-ohho-cream/20"
            )}>{i.status}</span>
          </div>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div><span className="text-ohho-cream-dim">Event:</span> <span className="text-ohho-cream">{i.eventType}</span></div>
            <div><span className="text-ohho-cream-dim">Date:</span> <span className="text-ohho-cream">{i.eventDate}</span></div>
            <div><span className="text-ohho-cream-dim">Guests:</span> <span className="text-ohho-cream">{i.guestCount}</span></div>
            <div><span className="text-ohho-cream-dim">Budget:</span> <span className="text-ohho-cream">{i.budget}</span></div>
          </div>
          {i.message && <div className="mt-2 text-xs text-ohho-cream/70 italic">&ldquo;{i.message}&rdquo;</div>}
          <div className="mt-2 text-[11px] text-ohho-cream-dim">{new Date(i.createdAt).toLocaleString("en-IN")}</div>
          <div className="mt-3 flex gap-2">
            <a href={`tel:${i.phone}`} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-ohho-orange/15 text-ohho-orange border border-ohho-orange/30 text-xs font-semibold"><Phone className="h-3 w-3" /> Call</a>
            <a href={`mailto:${i.email}`} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-ohho-gold/15 text-ohho-gold border border-ohho-gold/30 text-xs font-semibold"><Mail className="h-3 w-3" /> Email</a>
          </div>
        </div>
      ))}
    </div>
  );
}

function CartPhotosView({ photos, onRefresh }: { photos: any[]; onRefresh: () => void }) {
  const [editing, setEditing] = useState<any | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", image: "", category: "cart", sortOrder: 0, active: true });

  const save = async (photo: any) => {
    if (photo.id) {
      await fetch("/api/admin/cart-photos", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(photo) });
    } else {
      await fetch("/api/admin/cart-photos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(photo) });
    }
    setEditing(null); setAdding(false); onRefresh();
  };
  const remove = async (id: string) => { if (!confirm("Delete?")) return; await fetch(`/api/admin/cart-photos?id=${id}`, { method: "DELETE" }); onRefresh(); };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="font-display text-xl text-ohho-cream">Cart Photos</div>
        <button onClick={() => { setAdding(true); setEditing({ title: "", description: "", image: "", category: "cart", sortOrder: 0, active: true }); }} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-ohho-orange/15 text-ohho-orange border border-ohho-orange/30 text-xs font-semibold hover:bg-ohho-orange/25"><Plus className="h-3.5 w-3.5" /> Add Photo</button>
      </div>
      {adding && editing && (
        <div className="mb-4 p-4 rounded-xl glass-card space-y-2">
          <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} placeholder="Title" className="w-full px-2 py-1.5 rounded bg-ohho-black/60 border border-ohho-gold/15 text-ohho-cream text-xs" />
          <input value={editing.image} onChange={(e) => setEditing({ ...editing, image: e.target.value })} placeholder="Image URL" className="w-full px-2 py-1.5 rounded bg-ohho-black/60 border border-ohho-gold/15 text-ohho-cream text-xs" />
          <input value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} placeholder="Description (optional)" className="w-full px-2 py-1.5 rounded bg-ohho-black/60 border border-ohho-gold/15 text-ohho-cream text-xs" />
          <div className="flex gap-2">
            <button onClick={() => save(editing)} className="flex-1 py-1.5 rounded bg-ohho-orange text-ohho-black text-xs font-bold">Save</button>
            <button onClick={() => { setAdding(false); setEditing(null); }} className="flex-1 py-1.5 rounded border border-ohho-gold/20 text-ohho-cream text-xs">Cancel</button>
          </div>
        </div>
      )}
      {photos.length === 0 && !adding ? (
        <div className="text-center py-12 text-ohho-cream-dim"><Camera className="h-10 w-10 mx-auto opacity-40 mb-3" />No cart photos yet.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {photos.map((p) => (
            <div key={p.id} className="glass-card rounded-xl overflow-hidden">
              <img src={p.image} alt={p.title} className="w-full h-32 object-cover" />
              <div className="p-3">
                <div className="text-sm font-semibold text-ohho-cream truncate">{p.title}</div>
                <div className="mt-2 flex gap-1">
                  <button onClick={() => setEditing(p)} className="flex-1 py-1 rounded text-[10px] bg-ohho-orange/15 text-ohho-orange">Edit</button>
                  <button onClick={() => remove(p.id)} className="flex-1 py-1 rounded text-[10px] bg-ohho-red/15 text-ohho-red">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {editing && !adding && (
        <div className="fixed inset-0 z-[90] bg-ohho-black/80 grid place-items-center p-4" onClick={() => setEditing(null)}>
          <div className="glass-card rounded-xl p-4 max-w-sm w-full space-y-2" onClick={(e) => e.stopPropagation()}>
            <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} placeholder="Title" className="w-full px-2 py-1.5 rounded bg-ohho-black/60 border border-ohho-gold/15 text-ohho-cream text-xs" />
            <input value={editing.image} onChange={(e) => setEditing({ ...editing, image: e.target.value })} placeholder="Image URL" className="w-full px-2 py-1.5 rounded bg-ohho-black/60 border border-ohho-gold/15 text-ohho-cream text-xs" />
            <input value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} placeholder="Description" className="w-full px-2 py-1.5 rounded bg-ohho-black/60 border border-ohho-gold/15 text-ohho-cream text-xs" />
            <div className="flex gap-2">
              <button onClick={() => save(editing)} className="flex-1 py-1.5 rounded bg-ohho-orange text-ohho-black text-xs font-bold">Save</button>
              <button onClick={() => setEditing(null)} className="flex-1 py-1.5 rounded border border-ohho-gold/20 text-ohho-cream text-xs">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SiteContentView() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/site-content");
      const data = await res.json();
      setItems(data.items || []);
      const editMap: Record<string, string> = {};
      for (const i of data.items || []) editMap[i.key] = i.value;
      setEditing(editMap);
    } catch { setItems([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async (key: string) => {
    const item = items.find(i => i.key === key);
    await fetch("/api/site-content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value: editing[key], type: item?.type, label: item?.label, page: item?.page, section: item?.section }),
    });
  };

  const pages = ["all", "home", "company", "menu", "order", "franchise", "catering", "global"];
  const filtered = filter === "all" ? items : items.filter(i => i.page === filter);

  if (loading) return <div className="text-center py-20 text-ohho-cream-dim"><Loader2 className="h-8 w-8 mx-auto animate-spin" /></div>;

  return (
    <div>
      <div className="font-display text-xl text-ohho-cream mb-2">Site Content (CMS)</div>
      <p className="text-xs text-ohho-cream-dim mb-4">Edit any text on the website. Changes appear instantly after save.</p>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {pages.map(p => (
          <button key={p} onClick={() => setFilter(p)} className={cn("px-3 py-1.5 rounded-full text-xs font-semibold border", filter === p ? "bg-ohho-orange text-ohho-black border-ohho-orange" : "text-ohho-cream-dim border-ohho-gold/20")}>
            {p === "all" ? "All Pages" : p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {filtered.map((item) => (
          <div key={item.id} className="glass-card rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs font-semibold text-ohho-gold">{item.label}</div>
              <div className="text-[9px] text-ohho-cream-dim">{item.page} · {item.section}</div>
            </div>
            {item.type === "textarea" ? (
              <textarea
                value={editing[item.key] ?? ""}
                onChange={(e) => setEditing({ ...editing, [item.key]: e.target.value })}
                rows={2}
                className="w-full px-2 py-1.5 rounded bg-ohho-black/60 border border-ohho-gold/15 text-ohho-cream text-xs resize-none focus:outline-none focus:border-ohho-orange/50"
              />
            ) : (
              <input
                value={editing[item.key] ?? ""}
                onChange={(e) => setEditing({ ...editing, [item.key]: e.target.value })}
                className="w-full px-2 py-1.5 rounded bg-ohho-black/60 border border-ohho-gold/15 text-ohho-cream text-xs focus:outline-none focus:border-ohho-orange/50"
              />
            )}
            <button
              onClick={() => save(item.key)}
              className="mt-1.5 px-3 py-1 rounded bg-ohho-orange/15 text-ohho-orange border border-ohho-orange/30 text-[10px] font-semibold hover:bg-ohho-orange/25"
            >
              Save
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
