"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  Crown,
  Settings,
  Maximize,
  Smartphone,
  Leaf,
  Users,
  Sparkles,
  MapPin,
  Star,
  Store,
  Sandwich,
  Pizza,
  Drumstick,
  Coffee,
  Rocket,
  ArrowRight,
} from "lucide-react";
import { testedLocations } from "@/data/menu";
import { useNav } from "@/components/ohho/nav-context";

// ─── Stats ───────────────────────────────────────────────
const STATS = [
  { value: 2, suffix: "", label: "Locations Tested" },
  { value: 10000, suffix: "+", label: "Happy Customers" },
  { value: 80, suffix: "%", label: "Retention Rate" },
  { value: 45, suffix: " days", label: "Setup Time" },
];

// ─── Brand values ────────────────────────────────────────
const BRAND_VALUES = [
  {
    icon: Crown,
    title: "Premium Quality",
    body: "Every ingredient sourced, every recipe tested, every patty hand-checked.",
    color: "#ffc107",
  },
  {
    icon: Settings,
    title: "Operator-First",
    body: "We run the cart ourselves before any franchisee touches it.",
    color: "#ff6a00",
  },
  {
    icon: Maximize,
    title: "Compact Format",
    body: "50–150 sq. ft. is all you need. High ROI per square foot.",
    color: "#d92626",
  },
  {
    icon: Smartphone,
    title: "Tech-Driven",
    body: "POS, live tracking, loyalty program — built in-house.",
    color: "#ff8c00",
  },
  {
    icon: Leaf,
    title: "Local Sourcing",
    body: "Ingredients sourced from local suppliers. Fresh, never frozen.",
    color: "#10b981",
  },
  {
    icon: Users,
    title: "Community",
    body: "We hire locally, we serve locally, we grow locally.",
    color: "#ffd54f",
  },
];

// ─── Brand timeline ──────────────────────────────────────
const BRAND_TIMELINE = [
  { year: "2019", label: "First cart opens in Kairana", icon: Store },
  { year: "2020", label: "Sandwich line launches", icon: Sandwich },
  { year: "2021", label: "Pizza ovens engineered into carts", icon: Pizza },
  { year: "2022", label: "Bucket format introduced", icon: Drumstick },
  { year: "2023", label: "Cold coffee / Sips line", icon: Coffee },
  { year: "2024", label: "Add-ons + tech platform", icon: Smartphone },
  { year: "2025", label: "Franchise expansion begins", icon: Rocket },
];

// ─── Count-up number (animates when scrolled into view) ──
function CountUp({
  end,
  suffix = "",
  duration = 1.8,
}: {
  end: number;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf: number;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / (duration * 1000));
      // easeOutExpo — fast start, gentle settle
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setCount(Math.floor(eased * end));
      if (t < 1) raf = requestAnimationFrame(tick);
      else setCount(end);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, end, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

export function AboutVentures() {
  const { navigate } = useNav();
  return (
    <section
      id="about"
      className="relative py-16 sm:py-20 bg-ohho-black grain overflow-hidden"
    >
      {/* Background flourishes */}
      <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-ohho-orange/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-ohho-gold/10 blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
        {/* ───── 1. Brand story hero ─────────────────────────── */}
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-ohho-gold/10 border border-ohho-gold/30 text-ohho-gold text-xs font-semibold tracking-wider uppercase">
              <Sparkles className="h-3.5 w-3.5" />
              About the Company
            </div>
            <h2 className="mt-5 font-display text-4xl sm:text-5xl lg:text-6xl text-ohho-cream leading-[0.9] sm:leading-[0.95]">
              OHHO <span className="text-gradient-ohho">FOOD VENTURES</span>
            </h2>
            <div className="mt-3 inline-flex items-center gap-2 text-ohho-orange font-display text-base sm:text-lg uppercase tracking-[0.3em]">
              Live Premium.
            </div>
            <p className="mt-5 text-ohho-cream/80 text-base sm:text-lg leading-relaxed">
              A new-age premium QSR brand born in Shamli &amp; Kairana — we
              manufacture our own carts, run them ourselves, and only hand
              proven territories to franchise partners. Compact format,
              premium product, operator-first ethos.
            </p>
          </motion.div>
        </div>

        {/* ───── 2. Animated stats counter ──────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-10 sm:mt-12 grid grid-cols-2 lg:grid-cols-4 gap-3"
        >
          {STATS.map((s) => (
            <div
              key={s.label}
              className="glass-card rounded-xl p-4 sm:p-5 text-center"
            >
              <div className="font-display text-3xl sm:text-4xl lg:text-5xl text-ohho-gold ohho-glow tabular-nums">
                <CountUp end={s.value} suffix={s.suffix} />
              </div>
              <div className="mt-2 text-[10px] sm:text-xs uppercase tracking-wider text-ohho-cream-dim">
                {s.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* ───── 3. Brand values grid ───────────────────────── */}
        <div className="mt-14 sm:mt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-xs tracking-[0.3em] uppercase text-ohho-gold font-semibold">
              What we stand for
            </div>
            <h3 className="mt-2 font-display text-2xl sm:text-3xl text-ohho-cream">
              Six values, <span className="text-gradient-ohho">one promise.</span>
            </h3>
          </motion.div>

          <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {BRAND_VALUES.map((v, i) => {
              const Icon = v.icon;
              return (
                <motion.div
                  key={v.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.45, delay: i * 0.06 }}
                  className="glass-card glass-card-hover rounded-2xl p-5 sm:p-6 flex flex-col"
                >
                  <div
                    className="h-12 w-12 rounded-xl grid place-items-center mb-4 flex-shrink-0"
                    style={{
                      background: `${v.color}22`,
                      border: `1px solid ${v.color}55`,
                    }}
                  >
                    <Icon className="h-6 w-6" style={{ color: v.color }} />
                  </div>
                  <div className="font-display text-lg sm:text-xl text-ohho-cream">
                    {v.title}
                  </div>
                  <p className="mt-2 text-sm text-ohho-cream/70 leading-relaxed">
                    {v.body}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ───── 4. Tested locations showcase ───────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mt-14 sm:mt-16"
        >
          <div className="text-xs tracking-[0.3em] uppercase text-ohho-gold font-semibold">
            Proven on the ground
          </div>
          <h3 className="mt-2 font-display text-2xl sm:text-3xl text-ohho-cream">
            2 locations tested.{" "}
            <span className="text-gradient-ohho">10,000+ served.</span>
          </h3>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {testedLocations.map((loc) => (
              <div
                key={loc.city}
                className="glass-card glass-card-hover rounded-2xl overflow-hidden flex flex-col"
              >
                <div className="relative h-40 sm:h-44 overflow-hidden">
                  <img
                    src={loc.image}
                    alt={`OHHO cart in ${loc.city}`}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ohho-black-light via-transparent to-transparent" />
                  <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-ohho-orange/90 text-ohho-black text-[10px] font-bold uppercase tracking-wider">
                    <span className="h-1.5 w-1.5 rounded-full bg-ohho-black" />
                    {loc.status}
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="font-display text-xl sm:text-2xl text-ohho-cream">
                      {loc.city}
                    </div>
                    <div className="text-xs text-ohho-cream/80 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {loc.area}
                    </div>
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <p className="text-sm text-ohho-cream/75 leading-relaxed flex-1">
                    {loc.note}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1 text-ohho-gold">
                      <Star className="h-3.5 w-3.5 fill-ohho-gold" />
                      {loc.rating} rating
                    </span>
                    <span className="text-ohho-cream-dim">
                      {loc.customers.toLocaleString()}+ customers
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ───── 5. Brand timeline (horizontal) ─────────────── */}
        <div className="mt-14 sm:mt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-xs tracking-[0.3em] uppercase text-ohho-gold font-semibold">
              The journey
            </div>
            <h3 className="mt-2 font-display text-2xl sm:text-3xl text-ohho-cream">
              Six years. <span className="text-gradient-ohho">Seven chapters.</span>
            </h3>
          </motion.div>

          {/* Horizontal scroll on mobile, full-width on desktop */}
          <div className="mt-8 -mx-4 sm:mx-0 px-4 sm:px-0 overflow-x-auto ohho-scroll ohho-scroll-x pb-4">
            <div className="relative min-w-[760px] sm:min-w-full">
              {/* Horizontal rail */}
              <div className="absolute left-0 right-0 top-6 h-px bg-gradient-to-r from-ohho-orange via-ohho-gold to-ohho-red/40" />
              <ol className="relative grid grid-cols-7 gap-2">
                {BRAND_TIMELINE.map((m, i) => {
                  const Icon = m.icon;
                  return (
                    <motion.li
                      key={m.year}
                      initial={{ opacity: 0, y: 18 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-30px" }}
                      transition={{ duration: 0.4, delay: i * 0.05 }}
                      className="flex flex-col items-center text-center px-1"
                    >
                      {/* Node */}
                      <div
                        className="relative h-12 w-12 rounded-full grid place-items-center border-2 border-ohho-gold/50 bg-ohho-black-light flex-shrink-0"
                        style={{ boxShadow: "0 0 0 4px rgba(14,10,4,1)" }}
                      >
                        <Icon className="h-5 w-5 text-ohho-gold" />
                      </div>
                      <div className="mt-3 font-display text-base sm:text-lg lg:text-xl text-ohho-orange">
                        {m.year}
                      </div>
                      <div className="mt-1 text-[10px] sm:text-xs text-ohho-cream/75 leading-tight max-w-[120px]">
                        {m.label}
                      </div>
                    </motion.li>
                  );
                })}
              </ol>
            </div>
          </div>
        </div>

        {/* ───── 6. Closing CTA ─────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mt-14 sm:mt-16 p-6 sm:p-10 rounded-2xl bg-gradient-to-br from-ohho-orange/15 via-ohho-black-light to-ohho-black border border-ohho-orange/25 text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between gap-6"
        >
          <div>
            <div className="font-display text-2xl sm:text-3xl text-ohho-cream">
              Want to own an OHHO cart?
            </div>
            <div className="mt-2 text-ohho-cream/70 text-sm sm:text-base">
              View our franchise packages, ROI calculator, and apply — proven
              territories, ready to hand over.
            </div>
          </div>
          <button
            onClick={() => navigate("franchise")}
            className="inline-flex items-center justify-center gap-2 px-6 h-12 rounded-md bg-gradient-to-r from-ohho-orange to-ohho-orange-deep text-ohho-black font-bold whitespace-nowrap hover:shadow-xl hover:shadow-ohho-orange/40 transition-shadow flex-shrink-0"
          >
            Explore Franchise
            <ArrowRight className="h-4 w-4" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
