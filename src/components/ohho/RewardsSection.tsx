"use client";

import { motion } from "framer-motion";
import { Crown, Star, Gift, TrendingUp, Sparkles, Quote } from "lucide-react";
import { rewardTiers, customerStories } from "@/data/menu";
import { useNav } from "@/components/ohho/nav-context";

const RING_SIZE = 160;
const RING_STROKE = 6;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRC = 2 * Math.PI * RING_RADIUS;

// Tier thresholds (in points) — for the ring fill visualization
const TIER_THRESHOLDS: Record<string, number> = {
  bronze: 500,
  silver: 2000,
  gold: 5000,
  black: 10000,
};

function TierRing({ tier, index }: { tier: typeof rewardTiers[number]; index: number }) {
  const max = TIER_THRESHOLDS[tier.id] || 1000;
  // For visual: each tier ring fills based on its position in the journey
  // bronze = 25%, silver = 50%, gold = 80%, black = 100% (capped full)
  const fillPercents: Record<string, number> = {
    bronze: 0.25,
    silver: 0.5,
    gold: 0.8,
    black: 1.0,
  };
  const fill = fillPercents[tier.id] || 0.5;
  void max;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="glass-card glass-card-hover rounded-2xl p-6 flex flex-col items-center text-center relative overflow-hidden"
    >
      {/* Tier color glow */}
      <div
        className="absolute -top-12 left-1/2 -translate-x-1/2 h-32 w-32 rounded-full blur-3xl opacity-30 pointer-events-none"
        style={{ background: tier.color }}
      />

      {/* Circular progress ring */}
      <div className="relative" style={{ width: RING_SIZE, height: RING_SIZE }}>
        <svg
          width={RING_SIZE}
          height={RING_SIZE}
          className="-rotate-90 absolute inset-0"
        >
          {/* Track */}
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            fill="none"
            stroke="rgba(245, 230, 204, 0.06)"
            strokeWidth={RING_STROKE}
          />
          {/* Progress */}
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            fill="none"
            stroke={tier.color}
            strokeWidth={RING_STROKE}
            strokeLinecap="round"
            strokeDasharray={RING_CIRC}
            strokeDashoffset={RING_CIRC * (1 - fill)}
            style={{ filter: `drop-shadow(0 0 8px ${tier.color}88)` }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 grid place-items-center flex-col">
          <div className="text-4xl">{tier.icon}</div>
          <div
            className="font-display text-lg mt-1"
            style={{ color: tier.color }}
          >
            {tier.name}
          </div>
        </div>
      </div>

      {/* Threshold */}
      <div className="mt-4 text-[11px] uppercase tracking-wider text-ohho-cream-dim">
        {tier.threshold}
      </div>

      {/* Perks */}
      <ul className="mt-4 space-y-1.5 text-left w-full">
        {tier.perks.map((perk) => (
          <li
            key={perk}
            className="flex items-start gap-2 text-[12px] text-ohho-cream/75"
          >
            <Star
              className="h-3 w-3 mt-0.5 flex-shrink-0"
              style={{ color: tier.color, fill: `${tier.color}55` }}
            />
            {perk}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

export function RewardsSection() {
  const { navigate } = useNav();
  return (
    <section
      id="rewards"
      className="relative py-16 sm:py-20 bg-gradient-to-b from-ohho-black via-ohho-black-light to-ohho-black overflow-hidden"
    >
      <div className="absolute -top-32 right-0 h-96 w-96 rounded-full bg-ohho-orange/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 left-0 h-96 w-96 rounded-full bg-ohho-gold/10 blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
        {/* Header */}
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-ohho-gold/10 border border-ohho-gold/30 text-ohho-gold text-xs font-semibold tracking-wider uppercase">
            <Crown className="h-3.5 w-3.5" />
            OHHO Rewards · Loyalty Program
          </div>
          <h2 className="mt-5 font-display text-3xl sm:text-5xl lg:text-6xl text-ohho-cream leading-[0.95]">
            Eat. Earn. <span className="text-gradient-ohho">Climb tiers.</span>
          </h2>
          <p className="mt-4 text-ohho-cream/75 text-base sm:text-lg leading-relaxed">
            Every ₹10 you spend earns 1 OHHO point. Climb through four tiers —
            Bronze to OHHO Black — and unlock real, repeat-customer perks.
            Our retention rate is <strong className="text-ohho-gold">80%</strong> for a reason.
          </p>
        </div>

        {/* Stats strip — retention proof */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          {[
            { label: "Happy Customers", value: "10,000+", icon: Sparkles },
            { label: "Retention Rate", value: "80%", icon: TrendingUp },
            { label: "Tested Locations", value: "2 live", icon: Star },
            { label: "Avg Orders / Customer", value: "14+", icon: Gift },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="glass-card rounded-xl p-4">
                <Icon className="h-5 w-5 text-ohho-gold mb-2" />
                <div className="font-display text-2xl text-ohho-cream">
                  {s.value}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-ohho-cream-dim mt-0.5">
                  {s.label}
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Tier cards */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {rewardTiers.map((tier, i) => (
            <TierRing key={tier.id} tier={tier} index={i} />
          ))}
        </div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mt-12 p-5 sm:p-8 rounded-2xl glass-card"
        >
          <div className="font-display text-xl sm:text-2xl text-ohho-cream mb-5 sm:mb-6">
            How OHHO Rewards works
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
            {[
              { step: "01", title: "Order anything", body: "Every ₹10 in your cart earns 1 OHHO point. Burgers, pizzas, sips, add-ons — all count.", icon: "🍔" },
              { step: "02", title: "Climb tiers automatically", body: "Hit 500 pts → Silver. 2,000 → Gold. 5,000+ → OHHO Black (invite-only). Perks compound.", icon: "📈" },
              { step: "03", title: "Redeem for free items", body: "200 pts = free Extra Cheese. 500 pts = free Cold Coffee. 1,500 pts = free OHHO Special Burger.", icon: "🎁" },
            ].map((s) => (
              <div key={s.step}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="font-display text-3xl text-gradient-ohho">
                    {s.step}
                  </div>
                  <div className="text-3xl">{s.icon}</div>
                </div>
                <div className="font-semibold text-ohho-cream">{s.title}</div>
                <div className="text-sm text-ohho-cream/70 mt-1 leading-relaxed">
                  {s.body}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Customer stories — retention proof */}
        <div className="mt-12">
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-ohho-orange/10 border border-ohho-orange/30 text-ohho-orange text-xs font-semibold tracking-wider uppercase">
              <Quote className="h-3.5 w-3.5" />
              Why customers stay
            </div>
            <h3 className="mt-4 font-display text-2xl sm:text-3xl lg:text-4xl text-ohho-cream">
              Real stories. Real retention.
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {customerStories.map((s, i) => (
              <motion.div
                key={s.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.45, delay: i * 0.06 }}
                className="glass-card glass-card-hover rounded-xl p-5 flex flex-col"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-ohho-orange to-ohho-red grid place-items-center font-bold text-ohho-black text-sm">
                    {s.initials}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-ohho-cream text-sm truncate">
                      {s.name}
                    </div>
                    <div className="text-[11px] text-ohho-cream-dim">
                      {s.location} · {s.orders} orders
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-0.5 mb-2">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star
                      key={j}
                      className={cn(
                        "h-3.5 w-3.5",
                        j < s.rating ? "text-ohho-gold fill-ohho-gold" : "text-ohho-cream/15"
                      )}
                    />
                  ))}
                </div>
                <p className="text-sm text-ohho-cream/75 leading-relaxed flex-1">
                  &ldquo;{s.text}&rdquo;
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="mt-12 p-5 sm:p-8 lg:p-10 rounded-2xl bg-gradient-to-br from-ohho-orange/15 via-ohho-black-light to-ohho-black border border-ohho-orange/25 flex flex-col sm:flex-row items-center justify-between gap-5 sm:gap-6"
        >
          <div>
            <div className="font-display text-xl sm:text-2xl lg:text-3xl text-ohho-cream">
              Sign up. Start earning today.
            </div>
            <div className="mt-2 text-ohho-cream/70 text-sm sm:text-base">
              Create an account, place your first order, and you&apos;re already
              in the Bronze tier — earning points on every bite.
            </div>
          </div>
          <button
            onClick={() => navigate("order")}
            className="inline-flex items-center justify-center h-12 px-6 rounded-md bg-gradient-to-r from-ohho-orange to-ohho-orange-deep text-ohho-black font-bold whitespace-nowrap hover:shadow-xl hover:shadow-ohho-orange/40 transition-shadow flex-shrink-0"
          >
            Start earning →
          </button>
        </motion.div>
      </div>
    </section>
  );
}

function cn(...args: any[]) {
  return args.filter(Boolean).join(" ");
}
