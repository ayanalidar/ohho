"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Package, Bike, MapPin, CheckCircle2, Clock, Radio, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { useKitchenSocket } from "@/hooks/use-order-socket";
import { cn } from "@/lib/utils";

type PipelineOrder = {
  id: string;
  orderId: string;
  status: string;
  total: number;
  mode: string;
  progress: number;
  createdAt: string;
  items: { id: string; name: string; emoji: string; qty: number }[];
  user: { name: string; email: string; phone: string | null };
};

const STAGES = [
  { id: "PREPARING", label: "On the Grill", icon: Flame, color: "#ff6a00", desc: "Being cooked" },
  { id: "PICKED", label: "Packed & Picked", icon: Package, color: "#ffc107", desc: "Rider picked up" },
  { id: "ENROUTE", label: "En Route", icon: Bike, color: "#ff8c00", desc: "On the way" },
  { id: "NEAR", label: "Near You", icon: MapPin, color: "#ffd54f", desc: "Almost there" },
];

export function LiveKitchenView() {
  const [pipeline, setPipeline] = useState<Record<string, PipelineOrder[]>>({
    PREPARING: [], PICKED: [], ENROUTE: [], NEAR: [],
  });
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<number>(Date.now());
  const { events, connected } = useKitchenSocket();

  const load = async () => {
    try {
      const res = await fetch("/api/admin/kitchen");
      const data = await res.json();
      if (data.pipeline) setPipeline(data.pipeline);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setLastRefresh(Date.now());
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 30000); // poll every 30s as fallback (was 15s)
    return () => clearInterval(t);
  }, []);

  // When a socket event comes in, refresh from server to get authoritative state
  useEffect(() => {
    if (events.length > 0) {
      load();
    }
  }, [events.length]);

  const totalActive = Object.values(pipeline).reduce((n, arr) => n + arr.length, 0);

  return (
    <section
      id="track"
      className="relative py-16 sm:py-20 bg-ohho-black grain overflow-hidden"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-ohho-red/15 border border-ohho-red/40 text-ohho-red text-xs font-semibold tracking-wider uppercase">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-ohho-red opacity-75 ohho-ping" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-ohho-red" />
              </span>
              Live Kitchen — Real-Time Pipeline
            </div>
            <h2 className="mt-5 font-display text-3xl sm:text-5xl lg:text-6xl text-ohho-cream leading-[0.95]">
              From grill to <span className="text-gradient-ohho">your door.</span>
            </h2>
            <p className="mt-4 text-ohho-cream/75 text-base sm:text-lg leading-relaxed">
              Watch every active OHHO order move through the pipeline in real time.
              When an admin updates a status, the order jumps to its next stage —
              no refresh needed.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border", connected ? "bg-ohho-gold/10 text-ohho-gold border-ohho-gold/30" : "bg-ohho-cream/5 text-ohho-cream-dim border-ohho-cream/20")}>
              {connected ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
              {connected ? "Live (WebSocket)" : "Polling (15s)"}
            </div>
            <button onClick={load} className="h-10 w-10 grid place-items-center rounded-md border border-ohho-gold/20 text-ohho-cream hover:bg-ohho-orange/10" aria-label="Refresh">
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </button>
          </div>
        </div>

        {/* Stats strip */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="glass-card rounded-xl p-4">
            <div className="text-[10px] uppercase tracking-wider text-ohho-cream-dim">Active orders</div>
            <div className="font-display text-3xl text-ohho-orange mt-1">{totalActive}</div>
          </div>
          {STAGES.map((s) => {
            const Icon = s.icon;
            const count = pipeline[s.id]?.length || 0;
            return (
              <div key={s.id} className="glass-card rounded-xl p-4">
                <Icon className="h-5 w-5 mb-1" style={{ color: s.color }} />
                <div className="font-display text-2xl text-ohho-cream">{count}</div>
                <div className="text-[10px] uppercase tracking-wider text-ohho-cream-dim mt-0.5">{s.label}</div>
              </div>
            );
          })}
        </div>

        {/* Pipeline columns */}
        {loading ? (
          <div className="mt-8 text-center py-16 sm:py-20 text-ohho-cream-dim">
            <Clock className="h-10 w-10 mx-auto animate-pulse mb-3" />
            Loading pipeline…
          </div>
        ) : totalActive === 0 ? (
          <div className="mt-8 text-center py-16 sm:py-20 glass-card rounded-2xl">
            <CheckCircle2 className="h-12 w-12 mx-auto text-ohho-gold/50 mb-3" />
            <div className="font-display text-xl text-ohho-cream">All caught up!</div>
            <div className="text-sm text-ohho-cream-dim mt-1">No active orders right now. Place an order to see the pipeline in action.</div>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {STAGES.map((stage) => {
              const Icon = stage.icon;
              const orders = pipeline[stage.id] || [];
              return (
                <div key={stage.id} className="glass-card rounded-2xl p-4">
                  <div className="flex items-center gap-2 pb-3 border-b" style={{ borderColor: `${stage.color}33` }}>
                    <div className="h-8 w-8 rounded-lg grid place-items-center" style={{ background: `${stage.color}22`, border: `1px solid ${stage.color}55` }}>
                      <Icon className="h-4 w-4" style={{ color: stage.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-display text-sm text-ohho-cream truncate">{stage.label}</div>
                      <div className="text-[10px] text-ohho-cream-dim">{stage.desc}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: `${stage.color}22`, color: stage.color }}>
                      {orders.length}
                    </span>
                  </div>
                  <div className="mt-3 space-y-2 min-h-[100px]">
                    <AnimatePresence>
                      {orders.length === 0 ? (
                        <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-6 text-xs text-ohho-cream-dim">
                          No orders
                        </motion.div>
                      ) : (
                        orders.map((order) => (
                          <motion.div
                            key={order.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="p-3 rounded-lg bg-ohho-black/50 border border-ohho-gold/10"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="font-mono text-[11px] text-ohho-gold truncate">{order.orderId}</div>
                              <div className="text-[10px] text-ohho-cream-dim">
                                {new Date(order.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                              </div>
                            </div>
                            <div className="text-[11px] text-ohho-cream/70 mt-1 truncate">
                              {order.items.map((it) => `${it.emoji} ${it.name} ×${it.qty}`).join(", ")}
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-[10px] text-ohho-cream-dim">{order.user.name}</span>
                              <span className="font-display text-sm text-ohho-gold">₹{order.total}</span>
                            </div>
                            <div className="mt-1.5">
                              <div className="h-1 rounded-full bg-ohho-cream/10 overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${Math.max(5, order.progress * 100)}%`, background: stage.color }} />
                              </div>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Demo note */}
        <div className="mt-6 sm:mt-8 p-4 rounded-xl glass-card flex items-start gap-3">
          <Radio className="h-5 w-5 text-ohho-gold flex-shrink-0 mt-0.5" />
          <div className="text-sm text-ohho-cream/70">
            <strong className="text-ohho-gold">Live demo:</strong> Open the admin panel (login as <code className="text-ohho-cream">admin@ohhofoods.com</code> / <code className="text-ohho-cream">admin123</code>), go to Orders tab, and change any order&apos;s status — this pipeline updates instantly via WebSocket (no page refresh).
          </div>
        </div>
      </div>
    </section>
  );
}
