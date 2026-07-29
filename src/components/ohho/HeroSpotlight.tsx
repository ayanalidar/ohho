"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Flame, MapPin, Star, Truck } from "lucide-react";
import { ohhoStats } from "@/data/menu";
import { useNav } from "@/components/ohho/nav-context";
import { AnimatedCounter } from "@/components/ohho/HomeFeatures";

// Hero images cycle — AI-generated premium OHHO food photography
const HERO_IMAGES = [
  "/ohho-images/ohho-special-chicken-burger.png",
  "/ohho-images/ohho-special-chicken-pizza.png",
  "/ohho-images/ohho-special-chicken-sandwich.png",
  "/ohho-images/cold-coffee.png",
];

const HERO_INTERVAL_MS = 4200;

export function HeroSpotlight() {
  const { navigate } = useNav();
  const [idx, setIdx] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);       // spotlight background layer
  const crosshairRef = useRef<HTMLDivElement>(null); // crosshair element
  const rafRef = useRef<number | null>(null);      // rAF throttle
  const posRef = useRef({ x: 0.5, y: 0.45 });

  // cross-fade timer
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % HERO_IMAGES.length), HERO_INTERVAL_MS);
    return () => clearInterval(t);
  }, []);

  // spotlight follow cursor — uses refs + rAF, NO React state updates
  useEffect(() => {
    const el = heroRef.current;
    const bg = bgRef.current;
    const cross = crosshairRef.current;
    if (!el || !bg || !cross) return;

    const apply = () => {
      rafRef.current = null;
      const { x, y } = posRef.current;
      const px = `${x * 100}%`;
      const py = `${y * 100}%`;
      bg.style.background = `radial-gradient(circle 380px at ${px} ${py},
        rgba(255, 193, 7, 0.22) 0%,
        rgba(255, 106, 0, 0.12) 25%,
        transparent 65%)`;
      bg.style.opacity = "1";
      cross.style.left = px;
      cross.style.top = py;
      cross.style.opacity = "0.9";
    };

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      posRef.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      };
      if (rafRef.current == null) rafRef.current = requestAnimationFrame(apply);
    };
    const onLeave = () => {
      bg.style.opacity = "0.35";
      cross.style.opacity = "0";
    };

    el.addEventListener("mousemove", onMove, { passive: true });
    el.addEventListener("mouseleave", onLeave, { passive: true });
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <section
      id="hero"
      ref={heroRef}
      className="relative min-h-[100svh] w-full overflow-hidden grain"
      style={{ background: "#0e0a04" }}
    >
      {/* Cross-fading hero image layer */}
      <div className="absolute inset-0">
        <AnimatePresence mode="sync">
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 1.12 }}
            animate={{ opacity: 0.55, scale: 1 }}
            exit={{ opacity: 0, scale: 1 }}
            transition={{ opacity: { duration: 1.4, ease: "easeInOut" }, scale: { duration: 6, ease: "easeOut" } }}
            className="absolute inset-0"
          >
            <img
              src={HERO_IMAGES[idx]}
              alt={`OHHO signature dish ${idx + 1}`}
              className="h-full w-full object-cover"
            />
          </motion.div>
        </AnimatePresence>

        {/* Heavy gradient overlay for legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-ohho-black/80 via-ohho-black/55 to-ohho-black" />
        <div className="absolute inset-0 bg-gradient-to-r from-ohho-black/90 via-transparent to-ohho-black/60" />

        {/* Spotlight overlay (the bright "spotlight" following cursor) — driven by refs, no re-render */}
        <div
          ref={bgRef}
          className="absolute inset-0 pointer-events-none transition-opacity duration-500"
          style={{
            opacity: 0.35,
            background: `radial-gradient(circle 380px at 50% 45%,
              rgba(255, 193, 7, 0.22) 0%,
              rgba(255, 106, 0, 0.12) 25%,
              transparent 65%)`,
            mixBlendMode: "screen",
          }}
        />

        {/* Animated crosshair indicator at spotlight center — driven by refs */}
        <div
          ref={crosshairRef}
          className="absolute pointer-events-none transition-opacity duration-300"
          style={{
            left: "50%",
            top: "45%",
            opacity: 0,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div className="h-16 w-16 rounded-full border border-ohho-gold/40" />
          <div className="absolute inset-0 grid place-items-center">
            <div className="h-1.5 w-1.5 rounded-full bg-ohho-gold" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-[100svh] flex flex-col">
        {/* Top eyebrow */}
        <div className="pt-24 sm:pt-28 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-ohho-orange/10 border border-ohho-orange/30 text-ohho-orange text-xs font-semibold tracking-wider uppercase"
          >
            <Flame className="h-3.5 w-3.5" />
            India&apos;s Fastest-Growing Premium QSR
          </motion.div>
        </div>

        {/* Main brand display */}
        <div className="flex-1 flex items-center px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto w-full">
          <div className="w-full">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.7 }}
            >
              <div className="text-ohho-cream-dim text-sm tracking-[0.4em] uppercase mb-3">
                By OHHO Food Ventures
              </div>
              <h1 className="font-display leading-[0.85] tracking-tight">
                <span className="block text-ohho-cream text-[clamp(3rem,12vw,11rem)]">
                  OHHO
                </span>
                <span className="block text-gradient-ohho text-[clamp(3rem,12vw,11rem)]">
                  BURGERS
                </span>
              </h1>
              <p className="mt-5 sm:mt-6 text-ohho-cream/85 text-base sm:text-xl max-w-2xl font-light">
                <span className="font-semibold text-ohho-gold">Live Premium.</span>{" "}
                Chicken burgers, pizzas, sandwiches &amp; shakes — built for India,
                engineered for fast returns, delivered to your door with live
                tracking.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.7 }}
              className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4"
            >
              <button
                onClick={() => navigate("order")}
                className="inline-flex items-center justify-center gap-2 h-12 px-6 sm:px-7 rounded-md bg-gradient-to-r from-ohho-orange to-ohho-orange-deep text-ohho-black font-bold tracking-wide hover:shadow-2xl hover:shadow-ohho-orange/50 transition-shadow"
              >
                Order Now
                <span className="text-base">→</span>
              </button>
              <button
                onClick={() => navigate("menu")}
                className="inline-flex items-center justify-center gap-2 h-12 px-6 sm:px-7 rounded-md bg-ohho-black/40 backdrop-blur border border-ohho-gold/30 text-ohho-cream font-semibold hover:bg-ohho-gold/10 hover:border-ohho-gold/60 transition-colors"
              >
                Explore Menu
              </button>
              <button
                onClick={() => navigate("company")}
                className="inline-flex items-center justify-center gap-2 h-12 px-6 sm:px-7 rounded-md text-ohho-cream-dim hover:text-ohho-gold transition-colors font-medium"
              >
                About the Company
              </button>
            </motion.div>

            {/* Live mini-stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75, duration: 0.7 }}
              className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl"
            >
              {ohhoStats.map((s) => (
                <div
                  key={s.label}
                  className="glass-card rounded-lg px-4 py-3"
                >
                  <div className="font-display text-2xl sm:text-3xl text-ohho-gold">
                    <AnimatedCounter value={s.value} suffix={s.suffix} />
                  </div>
                  <div className="text-[11px] uppercase tracking-wider text-ohho-cream-dim mt-1">
                    {s.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Bottom strip — trust badges + scroll cue */}
        <div className="px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto w-full pb-6 sm:pb-8">
          <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 pt-5 sm:pt-6 border-t border-ohho-gold/10">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-ohho-cream-dim">
              <span className="inline-flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 text-ohho-gold fill-ohho-gold" />
                4.8 avg · 100K+ orders
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Truck className="h-3.5 w-3.5 text-ohho-orange" />
                Real-time delivery tracking
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-ohho-orange" />
                48+ outlets · 18+ cities
              </span>
            </div>
            <button
              onClick={() => navigate("company")}
              className="inline-flex items-center gap-1.5 text-xs text-ohho-cream-dim hover:text-ohho-gold transition-colors"
            >
              <ChevronDown className="h-3.5 w-3.5 animate-bounce" />
              Scroll to explore
            </button>
          </div>
        </div>
      </div>

      {/* Image index dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {HERO_IMAGES.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            aria-label={`Show hero image ${i + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === idx ? "w-8 bg-ohho-orange" : "w-2 bg-ohho-cream/30"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
