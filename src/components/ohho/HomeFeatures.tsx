"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame, MapPin, X, Gift, Sparkles, Bike, Clock, Star, ShoppingBag,
  ChevronRight, Award, Lock, Instagram,
} from "lucide-react";
import { useAuth } from "@/components/ohho/AuthProvider";
import { useNav } from "@/components/ohho/nav-context";
import { useInitData } from "@/hooks/use-init-data";
import { cn } from "@/lib/utils";

// ─── 1. Animated Counter ──────────────────────────────
export function AnimatedCounter({
  value, suffix = "", duration = 2000, className,
}: { value: number; suffix?: string; duration?: number; className?: string }) {
  const [display, setDisplay] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    let startTime: number | null = null;
    const animate = (t: number) => {
      if (startTime === null) startTime = t;
      const progress = Math.min((t - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setDisplay(Math.floor(eased * value));
      if (progress < 1) requestAnimationFrame(animate);
      else setDisplay(value);
    };
    // Small delay so it animates after the hero entrance
    const timeout = setTimeout(() => requestAnimationFrame(animate), 400);
    return () => clearTimeout(timeout);
  }, [value, duration]);

  return (
    <span className={className}>
      {display.toLocaleString("en-IN")}{suffix}
    </span>
  );
}

// ─── 2. Live Order Ticker ─────────────────────────────
export function LiveOrderTicker() {
  const { data } = useInitData();
  const orders = data?.recentOrders || [];

  // Refresh every 60s (was 20s — too frequent for serverless)
  const [refreshed, setRefreshed] = useState<any[]>([]);
  useEffect(() => {
    if (!data) return;
    // Use initial data from batched fetch
    const t = setInterval(() => {
      fetch("/api/recent-orders").then(r => r.json()).then(d => setRefreshed(d.orders || [])).catch(() => {});
    }, 60000);
    return () => clearInterval(t);
  }, [data]);

  // Use refreshed data if available, otherwise initial batched data
  const displayOrders = refreshed.length > 0 ? refreshed : orders;

  if (displayOrders.length === 0) return null;
  const items = [...displayOrders, ...displayOrders];

  return (
    <div className="relative overflow-hidden bg-ohho-black-light border-y border-ohho-gold/10 py-2.5">
      <div className="flex ohho-marquee gap-8 whitespace-nowrap">
        {items.map((o, i) => (
          <div key={i} className="inline-flex items-center gap-2 text-xs text-ohho-cream/70 flex-shrink-0">
            <span className="h-1.5 w-1.5 rounded-full bg-ohho-orange animate-pulse" />
            <span className="text-ohho-gold font-semibold">{o.firstName}</span>
            <span>ordered</span>
            <span className="text-ohho-cream">{o.items.slice(0, 2).join(", ")}</span>
            {o.items.length > 2 && <span className="text-ohho-cream-dim">+{o.items.length - 2} more</span>}
            <span className="text-ohho-cream-dim">· {o.timeAgo}</span>
            <span className="text-ohho-gold">₹{o.total}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 3. Today's Special Banner ────────────────────────
export function TodaySpecialBanner() {
  const { data } = useInitData();
  const special = data?.todaySpecial;
  const [dismissed, setDismissed] = useState(false);

  if (!special || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="relative bg-gradient-to-r from-ohho-orange to-ohho-orange-deep text-ohho-black overflow-hidden"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12 py-2.5 flex items-center justify-center gap-3 text-center">
          <Flame className="h-4 w-4 flex-shrink-0 hidden sm:block" />
          <div className="flex-1 min-w-0">
            <span className="font-bold text-sm sm:text-base">{special.title}</span>
            <span className="hidden sm:inline text-xs opacity-80 ml-2">{special.description}</span>
          </div>
          {special.code && (
            <button
              onClick={() => { navigator.clipboard.writeText(special.code); }}
              className="px-2.5 py-1 rounded-md bg-ohho-black/20 text-ohho-black font-bold text-xs border border-ohho-black/30 hover:bg-ohho-black/30 transition-colors whitespace-nowrap"
            >
              Code: {special.code} · Tap to copy
            </button>
          )}
          <button
            onClick={() => setDismissed(true)}
            className="h-6 w-6 grid place-items-center rounded-md hover:bg-ohho-black/20 flex-shrink-0"
            aria-label="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── 4. Customer Photo Wall ───────────────────────────
const PHOTO_WALL_ITEMS = [
  { name: "Aarav S.", city: "Kairana", image: "/ohho-images/ohho-special-chicken-burger.png", text: "Best burger in town!" },
  { name: "Meera J.", city: "Shamli", image: "/ohho-images/fire-pizza.png", text: "Fire Pizza lives up to its name 🔥" },
  { name: "Rohit K.", city: "Kairana", image: "/ohho-images/crispy-chicken-bucket-full.png", text: "Friday night ritual" },
  { name: "Sana P.", city: "Shamli", image: "/ohho-images/ohho-special-chicken-pizza.png", text: "Worth every rupee" },
  { name: "Vikram R.", city: "Kairana", image: "/ohho-images/cold-coffee.png", text: "Liquid dessert 😍" },
  { name: "Priya M.", city: "Shamli", image: "/ohho-images/ohho-special-chicken-sandwich.png", text: "The glaze is unreal" },
  { name: "Arjun T.", city: "Kairana", image: "/ohho-images/crispy-chicken-burger.png", text: "Same quality every time" },
  { name: "Fatima A.", city: "Shamli", image: "/ohho-images/veg-supreme-pizza.png", text: "Even the veg pizza slaps" },
];

export function CustomerPhotoWall() {
  const { navigate } = useNav();
  return (
    <section className="relative py-12 sm:py-16 bg-ohho-black overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-ohho-gold/10 border border-ohho-gold/30 text-ohho-gold text-xs font-semibold tracking-wider uppercase">
            <Instagram className="h-3.5 w-3.5" />
            Wall of Love
          </div>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl text-ohho-cream">
            Real customers. <span className="text-gradient-ohho">Real bites.</span>
          </h2>
          <p className="mt-2 text-sm text-ohho-cream-dim">Tag @ohhofoodventures to be featured here.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
          {PHOTO_WALL_ITEMS.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.35, delay: (i % 4) * 0.05 }}
              className="group relative aspect-square rounded-xl overflow-hidden glass-card cursor-pointer"
              onClick={() => navigate("menu")}
            >
              <img
                src={item.image}
                alt={item.text}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ohho-black via-ohho-black/20 to-transparent opacity-80" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <div className="text-[10px] text-ohho-gold font-semibold">{item.name} · {item.city}</div>
                <div className="text-[11px] text-ohho-cream line-clamp-2 mt-0.5">{item.text}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <a
            href="https://instagram.com/ohhofoodventures"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-ohho-gold/15 text-ohho-gold border border-ohho-gold/30 text-sm font-semibold hover:bg-ohho-gold/25 transition-colors"
          >
            <Instagram className="h-4 w-4" />
            Follow @ohhofoodventures
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── 5. Location Picker ───────────────────────────────
export function LocationPicker() {
  const { navigate } = useNav();
  const { data } = useInitData();
  const locations = data?.locations || [];
  const [pincode, setPincode] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const checkPincode = () => {
    if (!pincode.trim()) return;
    // Simple mock: 247774 = Kairana, 247772 = Shamli, anything else = coming soon
    const pin = pincode.trim();
    if (pin === "247774") setResult("kairana");
    else if (pin === "247772") setResult("shamli");
    else setResult("coming-soon");
  };

  const activeLocations = locations.filter((l: any) => l.status === "operational");
  const comingSoonLocations = locations.filter((l: any) => l.status === "coming-soon");

  return (
    <section className="relative py-8 sm:py-10 bg-ohho-black-light">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-12">
        <div className="glass-card rounded-2xl p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-ohho-orange" />
            <h3 className="font-display text-lg sm:text-xl text-ohho-cream">Which OHHO cart is nearest you?</h3>
          </div>

          <div className="flex gap-2">
            <input
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && checkPincode()}
              placeholder="Enter your pincode (e.g. 247774)"
              className="flex-1 px-3 py-2.5 rounded-md bg-ohho-black/60 border border-ohho-gold/15 text-ohho-cream text-sm placeholder:text-ohho-cream-dim/50 focus:outline-none focus:border-ohho-orange/50"
            />
            <button
              onClick={checkPincode}
              className="px-4 py-2.5 rounded-md bg-gradient-to-r from-ohho-orange to-ohho-orange-deep text-ohho-black font-bold text-sm hover:shadow-lg hover:shadow-ohho-orange/40 transition-shadow whitespace-nowrap"
            >
              Check
            </button>
          </div>

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "mt-3 p-3 rounded-lg text-sm",
                result === "coming-soon"
                  ? "bg-ohho-gold/10 border border-ohho-gold/30 text-ohho-gold"
                  : "bg-ohho-green/10 border border-ohho-green/30 text-ohho-green"
              )}
            >
              {result === "coming-soon" ? (
                <>🚀 We&apos;re not in your area yet — but we&apos;re expanding! Check back soon.</>
              ) : (
                <>✅ Great news! OHHO Cart — {result === "kairana" ? "Kairana" : "Shamli"} delivers to you. <button onClick={() => navigate("order")} className="underline font-bold">Order now →</button></>
              )}
            </motion.div>
          )}

          {/* Location chips */}
          <div className="mt-4 flex flex-wrap gap-2">
            {activeLocations.map((loc: any) => (
              <div key={loc.slug} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-ohho-green/10 border border-ohho-green/30 text-ohho-green text-xs font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-ohho-green animate-pulse" />
                {loc.city} — Open
              </div>
            ))}
            {comingSoonLocations.map((loc: any) => (
              <div key={loc.slug} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-ohho-gold/10 border border-ohho-gold/30 text-ohho-gold text-xs font-semibold">
                <Clock className="h-3 w-3" />
                {loc.city} — Coming Soon
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── 6. Achievement Badges ────────────────────────────
export function AchievementBadges() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetch("/api/achievements").then(r => r.json()).then(d => setData(d)).catch(() => {});
    }
  }, [user]);

  if (!user || !data) return null;

  const unlocked = data.allAchievements?.filter((a: any) => a.unlocked) || [];
  const locked = data.allAchievements?.filter((a: any) => !a.unlocked).slice(0, 4) || [];
  const all = [...unlocked, ...locked];

  if (all.length === 0) return null;

  return (
    <section className="relative py-8 sm:py-10 bg-ohho-black">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-12">
        <div className="glass-card rounded-2xl p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Award className="h-5 w-5 text-ohho-gold" />
            <h3 className="font-display text-lg sm:text-xl text-ohho-cream">Your Achievements</h3>
            <span className="ml-auto text-xs text-ohho-cream-dim">{unlocked.length} / {data.allAchievements?.length || 0} unlocked</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-3">
            {all.map((a: any, i: number) => (
              <motion.div
                key={a.slug}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
                className={cn(
                  "flex flex-col items-center text-center p-3 rounded-xl border transition-all",
                  a.unlocked
                    ? "bg-ohho-gold/10 border-ohho-gold/30 hover:border-ohho-gold/60"
                    : "bg-ohho-black/40 border-ohho-cream/10 opacity-50"
                )}
              >
                <div className="text-2xl sm:text-3xl mb-1">{a.unlocked ? a.icon : "🔒"}</div>
                <div className={cn("text-[10px] font-bold leading-tight", a.unlocked ? "text-ohho-gold" : "text-ohho-cream-dim")}>
                  {a.name}
                </div>
                <div className="text-[9px] text-ohho-cream-dim mt-0.5 hidden sm:block">{a.description}</div>
              </motion.div>
            ))}
          </div>

          {unlocked.length === 0 && (
            <div className="text-center text-xs text-ohho-cream-dim mt-3">
              Place your first order to start unlocking badges!
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── 7. Countdown Timer ───────────────────────────────
export function CountdownTimer() {
  const { data } = useInitData();
  const locations = data?.locations || [];
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const targetRef = useRef<number | null>(null);

  const upcoming = locations.filter((l: any) => l.status === "coming-soon" && l.opensOn);

  useEffect(() => {
    if (upcoming.length === 0) return;
    targetRef.current = new Date(upcoming[0].opensOn).getTime();
    const tick = () => {
      if (targetRef.current === null) return;
      const diff = targetRef.current - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [upcoming.length > 0]);

  if (upcoming.length === 0) return null;
  const loc = upcoming[0];

  return (
    <section className="relative py-8 sm:py-10 bg-gradient-to-r from-ohho-black via-ohho-black-light to-ohho-black overflow-hidden">
      <div className="absolute inset-0 grain" />
      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-12">
        <div className="glass-card rounded-2xl p-5 sm:p-8 text-center border border-ohho-orange/20">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-ohho-orange/10 border border-ohho-orange/30 text-ohho-orange text-xs font-semibold tracking-wider uppercase mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            Next Launch
          </div>
          <h3 className="font-display text-2xl sm:text-3xl text-ohho-cream">
            OHHO Cart opens in <span className="text-gradient-ohho">{loc.city}</span> in
          </h3>

          <div className="mt-5 flex items-center justify-center gap-3 sm:gap-4">
            {[
              { label: "Days", value: timeLeft.days },
              { label: "Hours", value: timeLeft.hours },
              { label: "Mins", value: timeLeft.minutes },
              { label: "Secs", value: timeLeft.seconds },
            ].map((unit) => (
              <div key={unit.label} className="flex flex-col items-center">
                <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl bg-ohho-black/60 border border-ohho-gold/20 grid place-items-center font-display text-2xl sm:text-4xl text-ohho-gold">
                  {String(unit.value).padStart(2, "0")}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-ohho-cream-dim mt-1.5">{unit.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-5 text-sm text-ohho-cream/70">{loc.area}</div>
        </div>
      </div>
    </section>
  );
}
