"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bike,
  Phone,
  Star,
  MapPin,
  Navigation,
  Clock,
  CheckCircle2,
  Radio,
  Home,
  Store,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Stage = "preparing" | "picked" | "enroute" | "near" | "arrived";

const STAGES: { id: Stage; label: string; sub: string; threshold: number }[] = [
  { id: "preparing", label: "Preparing", sub: "In the kitchen", threshold: 0 },
  { id: "picked", label: "Picked up", sub: "Rider has your order", threshold: 0.22 },
  { id: "enroute", label: "On the way", sub: "Riding to you", threshold: 0.42 },
  { id: "near", label: "Near you", sub: "Almost there", threshold: 0.82 },
  { id: "arrived", label: "Arrived", sub: "Enjoy your meal!", threshold: 1.0 },
];

const DEMO_ORDER_ID = "OHHO-7K3M2-9BXQ";
const TOTAL_SECONDS = 90; // demo: 90s end-to-end

export function DeliveryTracker() {
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(0);
  const [progress, setProgress] = useState(0); // 0..1
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);

  // Measure path length on mount
  useEffect(() => {
    const p = pathRef.current;
    if (!p) return;
    const update = () => setPathLength(p.getTotalLength());
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Tick progress every second
  useEffect(() => {
    if (paused) return;
    if (progress >= 1) return;
    const t = setInterval(() => {
      setElapsed((e) => e + 1);
      setProgress((p) => Math.min(1, p + 1 / TOTAL_SECONDS));
    }, 1000);
    return () => clearInterval(t);
  }, [paused, progress]);

  const stage: Stage = useMemo(() => {
    let s: Stage = "preparing";
    for (const st of STAGES) {
      if (progress >= st.threshold) s = st.id;
    }
    return s;
  }, [progress]);

  const stageIdx = STAGES.findIndex((s) => s.id === stage);
  const etaSec = Math.max(0, TOTAL_SECONDS - elapsed);
  const etaMin = Math.floor(etaSec / 60);
  const etaS = etaSec % 60;

  // Rider position on the path — updated via effect, never read ref during render
  const [rider, setRider] = useState({ x: 0, y: 0, angle: 0 });
  useEffect(() => {
    const p = pathRef.current;
    if (!p || pathLength === 0) return;
    const pt = p.getPointAtLength(progress * pathLength);
    const ahead = p.getPointAtLength(Math.min(pathLength, progress * pathLength + 1));
    const angle = (Math.atan2(ahead.y - pt.y, ahead.x - pt.x) * 180) / Math.PI;
    setRider({ x: pt.x, y: pt.y, angle });
  }, [progress, pathLength]);

  const restart = () => {
    setProgress(0);
    setElapsed(0);
    setPaused(false);
  };

  return (
    <section
      id="track"
      className="relative py-24 sm:py-32 bg-ohho-black grain overflow-hidden"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-ohho-red/15 border border-ohho-red/40 text-ohho-red text-xs font-semibold tracking-wider uppercase">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-ohho-red opacity-75 ohho-ping" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-ohho-red" />
              </span>
              Real-Time Delivery Tracking
            </div>
            <h2 className="mt-5 font-display text-4xl sm:text-6xl text-ohho-cream leading-[0.95]">
              Watch your <span className="text-gradient-ohho">burger ride.</span>
            </h2>
            <p className="mt-4 text-ohho-cream/75 text-lg leading-relaxed">
              Once your order leaves the kitchen, follow the rider live — every
              turn, every block, every second. From cart to door, on a live map.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPaused((p) => !p)}
              className="px-4 py-2.5 rounded-md border border-ohho-gold/30 text-ohho-cream font-semibold text-sm hover:bg-ohho-orange/10"
            >
              {paused ? "▶ Resume" : "⏸ Pause"}
            </button>
            <button
              onClick={restart}
              className="px-4 py-2.5 rounded-md border border-ohho-gold/30 text-ohho-cream font-semibold text-sm hover:bg-ohho-orange/10"
            >
              ↻ Restart demo
            </button>
          </div>
        </div>

        <div className="mt-10 grid lg:grid-cols-12 gap-6">
          {/* Map */}
          <div className="lg:col-span-8">
            <div className="relative rounded-2xl overflow-hidden border border-ohho-gold/20 bg-[#0a0703] aspect-[16/10]">
              {/* Map SVG */}
              <svg
                viewBox="0 0 800 500"
                className="absolute inset-0 h-full w-full"
                preserveAspectRatio="xMidYMid slice"
              >
                {/* Background grid */}
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,193,7,0.04)" strokeWidth="1" />
                  </pattern>
                  <linearGradient id="routeGrad" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0%" stopColor="#ff6a00" />
                    <stop offset="100%" stopColor="#ffc107" />
                  </linearGradient>
                </defs>
                <rect width="800" height="500" fill="url(#grid)" />

                {/* Faux roads */}
                <path d="M 0 120 L 800 140" stroke="rgba(255,193,7,0.08)" strokeWidth="22" fill="none" />
                <path d="M 0 300 L 800 280" stroke="rgba(255,193,7,0.08)" strokeWidth="22" fill="none" />
                <path d="M 200 0 L 220 500" stroke="rgba(255,193,7,0.08)" strokeWidth="22" fill="none" />
                <path d="M 540 0 L 560 500" stroke="rgba(255,193,7,0.08)" strokeWidth="22" fill="none" />

                {/* Faux blocks */}
                {[
                  [40, 30, 120, 70],
                  [240, 30, 260, 70],
                  [580, 30, 180, 70],
                  [40, 170, 120, 100],
                  [240, 170, 260, 100],
                  [580, 170, 180, 100],
                  [40, 340, 120, 130],
                  [240, 340, 260, 130],
                  [580, 340, 180, 130],
                ].map(([x, y, w, h], i) => (
                  <rect
                    key={i}
                    x={x}
                    y={y}
                    width={w}
                    height={h}
                    fill="rgba(255, 106, 0, 0.025)"
                    stroke="rgba(255, 193, 7, 0.06)"
                  />
                ))}

                {/* Travelled portion of the route */}
                <path
                  ref={pathRef}
                  d="M 90 90 C 200 90, 240 180, 340 220 S 500 320, 580 360 S 660 410, 720 430"
                  fill="none"
                  stroke="url(#routeGrad)"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={`${progress * 1000} 9999`}
                  style={{ filter: "drop-shadow(0 0 8px rgba(255,106,0,0.5))" }}
                />
                {/* Remaining portion (dimmer) */}
                <path
                  d="M 90 90 C 200 90, 240 180, 340 220 S 500 320, 580 360 S 660 410, 720 430"
                  fill="none"
                  stroke="rgba(255, 193, 7, 0.18)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="6 8"
                />

                {/* Restaurant marker */}
                <g transform="translate(90, 90)">
                  <circle r="22" fill="rgba(255, 106, 0, 0.15)" />
                  <circle r="14" fill="#ff6a00" stroke="#ffc107" strokeWidth="2" />
                  <text textAnchor="middle" y="5" fontSize="14" fill="#0e0a04" fontWeight="bold">
                    🍔
                  </text>
                </g>

                {/* Customer marker */}
                <g transform="translate(720, 430)">
                  <circle r="22" fill="rgba(255, 193, 7, 0.15)" />
                  <circle r="14" fill="#ffc107" stroke="#ff6a00" strokeWidth="2" />
                  <text textAnchor="middle" y="5" fontSize="14" fill="#0e0a04" fontWeight="bold">
                    🏠
                  </text>
                </g>

                {/* Rider marker */}
                {pathLength > 0 && (
                  <g
                    transform={`translate(${rider.x}, ${rider.y}) rotate(${rider.angle})`}
                    style={{ transition: "transform 1s linear" }}
                  >
                    <circle r="20" fill="rgba(217, 38, 38, 0.2)">
                      <animate attributeName="r" values="18;26;18" dur="1.6s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.6;0;0.6" dur="1.6s" repeatCount="indefinite" />
                    </circle>
                    <circle r="14" fill="#0e0a04" stroke="#d92626" strokeWidth="3" />
                    <text
                      textAnchor="middle"
                      y="5"
                      fontSize="14"
                      transform={`rotate(${-rider.angle})`}
                    >
                      🛵
                    </text>
                  </g>
                )}

                {/* Landmarks */}
                <text x="100" y="60" fontSize="11" fill="#ffc107" opacity="0.8">
                  ● OHHO Cart — Kairana
                </text>
                <text x="600" y="465" fontSize="11" fill="#ffc107" opacity="0.8">
                  ● Your address
                </text>
              </svg>

              {/* Live overlay badge */}
              <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-ohho-red/20 backdrop-blur border border-ohho-red/40 text-ohho-red text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Radio className="h-3.5 w-3.5" />
                Live
              </div>

              {/* ETA badge */}
              <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-ohho-black/70 backdrop-blur border border-ohho-gold/30 text-ohho-cream text-sm font-bold flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-ohho-gold" />
                ETA {etaMin}:{String(etaS).padStart(2, "0")}
              </div>

              {/* Bottom status bar */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-ohho-black via-ohho-black/85 to-transparent">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "h-2.5 w-2.5 rounded-full",
                      stage === "arrived" ? "bg-ohho-gold" : "bg-ohho-orange"
                    )}
                  >
                    {stage !== "arrived" && (
                      <span className="block h-full w-full rounded-full ohho-ping" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-ohho-cream font-semibold text-sm">
                      {STAGES[stageIdx].label}
                    </div>
                    <div className="text-ohho-cream-dim text-xs">
                      {STAGES[stageIdx].sub}
                    </div>
                  </div>
                  <div className="text-ohho-gold font-display text-2xl">
                    {Math.round(progress * 100)}%
                  </div>
                </div>
                {/* Progress bar */}
                <div className="mt-2 h-1.5 rounded-full bg-ohho-cream/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-ohho-orange to-ohho-gold transition-[width] duration-1000 ease-linear"
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Stage timeline below map */}
            <div className="mt-4 grid grid-cols-5 gap-2">
              {STAGES.map((s, i) => {
                const done = i <= stageIdx;
                const Icon =
                  s.id === "preparing"
                    ? Store
                    : s.id === "picked"
                    ? Bike
                    : s.id === "enroute"
                    ? Navigation
                    : s.id === "near"
                    ? MapPin
                    : CheckCircle2;
                return (
                  <div
                    key={s.id}
                    className={cn(
                      "p-2 rounded-lg border text-center transition-all",
                      done
                        ? "border-ohho-orange/40 bg-ohho-orange/5"
                        : "border-ohho-gold/10 bg-ohho-black/30 opacity-50"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 mx-auto",
                        done ? "text-ohho-orange" : "text-ohho-cream-dim"
                      )}
                    />
                    <div
                      className={cn(
                        "text-[10px] font-semibold mt-1",
                        done ? "text-ohho-cream" : "text-ohho-cream-dim"
                      )}
                    >
                      {s.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: rider card */}
          <div className="lg:col-span-4 space-y-4">
            {/* Order summary */}
            <div className="glass-card rounded-2xl p-5">
              <div className="text-[10px] uppercase tracking-wider text-ohho-cream-dim">
                Order
              </div>
              <div className="font-display text-xl text-ohho-cream">
                {DEMO_ORDER_ID}
              </div>
              <div className="mt-3 space-y-1.5 text-sm">
                <div className="flex justify-between text-ohho-cream-dim">
                  <span>1× OHHO Special Burger</span>
                  <span>₹219</span>
                </div>
                <div className="flex justify-between text-ohho-cream-dim">
                  <span>1× Craft Cold Coffee</span>
                  <span>₹129</span>
                </div>
                <div className="flex justify-between text-ohho-cream-dim">
                  <span>1× Spring Potato</span>
                  <span>₹89</span>
                </div>
                <div className="flex justify-between font-semibold text-ohho-cream pt-2 border-t border-ohho-gold/10">
                  <span>Total</span>
                  <span className="text-ohho-gold">₹437</span>
                </div>
              </div>
            </div>

            {/* Rider card */}
            <AnimatePresence mode="wait">
              {stage === "preparing" ? (
                <motion.div
                  key="prep"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="glass-card rounded-2xl p-5"
                >
                  <div className="font-display text-2xl text-ohho-cream">
                    Assigning rider…
                  </div>
                  <p className="mt-2 text-sm text-ohho-cream/70">
                    Your order is in the kitchen. The nearest OHHO rider will
                    be assigned the moment it&apos;s ready for pickup.
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-ohho-gold text-xs">
                    <Store className="h-4 w-4" />
                    OHHO Cart — Kairana Market Area
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="rider"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="glass-card rounded-2xl p-5"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-ohho-orange to-ohho-red grid place-items-center text-3xl">
                      🧑‍🍳
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-display text-xl text-ohho-cream">
                        Imran K.
                      </div>
                      <div className="text-xs text-ohho-cream-dim flex items-center gap-2 mt-0.5">
                        <Star className="h-3 w-3 text-ohho-gold fill-ohho-gold" />
                        4.9 · 1,240 deliveries
                      </div>
                      <div className="text-xs text-ohho-cream-dim mt-0.5">
                        🛵 Honda Activa · UP 32 AB 7821
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button className="py-2.5 rounded-md bg-ohho-orange/15 text-ohho-orange font-semibold text-sm border border-ohho-orange/30 hover:bg-ohho-orange/25">
                      <Phone className="h-4 w-4 inline mr-1.5" />
                      Call
                    </button>
                    <button className="py-2.5 rounded-md bg-ohho-gold/15 text-ohho-gold font-semibold text-sm border border-ohho-gold/30 hover:bg-ohho-gold/25">
                      💬 Chat
                    </button>
                  </div>

                  <div className="mt-4 pt-4 border-t border-ohho-gold/10 space-y-2 text-sm">
                    <div className="flex items-start gap-2 text-ohho-cream-dim">
                      <Store className="h-4 w-4 text-ohho-orange flex-shrink-0 mt-0.5" />
                      <span>
                        Picked up from <strong className="text-ohho-cream">OHHO Cart</strong>, Kairana Market
                      </span>
                    </div>
                    <div className="flex items-start gap-2 text-ohho-cream-dim">
                      <Home className="h-4 w-4 text-ohho-gold flex-shrink-0 mt-0.5" />
                      <span>
                        Delivering to <strong className="text-ohho-cream">your address</strong>, Shamli Rd
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Live updates feed */}
            <div className="glass-card rounded-2xl p-5">
              <div className="text-[10px] uppercase tracking-wider text-ohho-cream-dim mb-3">
                Live updates
              </div>
              <div className="space-y-3">
                {STAGES.slice(0, stageIdx + 1)
                  .reverse()
                  .map((s, i) => (
                    <div key={s.id} className="flex items-start gap-3">
                      <div
                        className={cn(
                          "h-2 w-2 rounded-full mt-1.5 flex-shrink-0",
                          i === 0 ? "bg-ohho-orange" : "bg-ohho-gold/40"
                        )}
                      />
                      <div>
                        <div className="text-sm text-ohho-cream font-medium">
                          {s.label}
                        </div>
                        <div className="text-[11px] text-ohho-cream-dim">
                          {s.sub} ·{" "}
                          {String(
                            Math.max(0, elapsed - i * 18)
                          )}
                          s ago
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
