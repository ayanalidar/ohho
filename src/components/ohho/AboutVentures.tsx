"use client";

import { motion } from "framer-motion";
import {
  Target,
  Wrench,
  Settings,
  Trophy,
  Handshake,
  Sparkles,
} from "lucide-react";
import { ventureStages, ohhoStats } from "@/data/menu";

const ICONS: Record<string, React.ElementType> = {
  Target,
  Wrench,
  Settings,
  Trophy,
  Handshake,
};

export function AboutVentures() {
  return (
    <section
      id="about"
      className="relative py-24 sm:py-32 bg-ohho-black grain overflow-hidden"
    >
      {/* Background flourishes */}
      <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-ohho-orange/10 blur-3xl" />
      <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-ohho-gold/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-12">
        {/* Section header */}
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
            <h2 className="mt-5 font-display text-4xl sm:text-6xl text-ohho-cream leading-[0.95]">
              OHHO <span className="text-gradient-ohho">FOOD VENTURES</span>
            </h2>
            <p className="mt-5 text-ohho-cream/80 text-lg leading-relaxed">
              A fast-food brand that doesn&apos;t just sell burgers — it builds
              the carts, runs the operations, proves the model, and only then
              hands the location to a franchise partner. We manufacture premium
              food carts and package proven locations for passive income.
            </p>
          </motion.div>
        </div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          {ohhoStats.map((s) => (
            <div
              key={s.label}
              className="glass-card rounded-xl p-5 text-center"
            >
              <div className="font-display text-4xl sm:text-5xl text-ohho-gold ohho-glow">
                {s.value}
                <span className="text-ohho-orange">{s.suffix}</span>
              </div>
              <div className="mt-2 text-xs uppercase tracking-wider text-ohho-cream-dim">
                {s.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* The 5-stage model */}
        <div className="mt-20 grid lg:grid-cols-12 gap-10">
          {/* Left intro */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-4 lg:sticky lg:top-28 lg:self-start"
          >
            <div className="text-xs tracking-[0.3em] uppercase text-ohho-orange font-semibold">
              The OHHO Model
            </div>
            <h3 className="mt-3 font-display text-3xl sm:text-4xl text-ohho-cream leading-tight">
              Five stages from{" "}
              <span className="text-gradient-ohho">cart to franchise</span>.
            </h3>
            <p className="mt-5 text-ohho-cream/75 leading-relaxed">
              We are not a franchise-first brand. We are an{" "}
              <span className="text-ohho-gold font-semibold">operator-first</span>{" "}
              brand that opens franchises only after a location has proven
              itself on our own books. Every territory a partner inherits is
              already a winner — verified unit economics, tuned SOPs, a brand
              the local crowd already recognises.
            </p>
            <div className="mt-6 p-5 rounded-xl glass-card">
              <div className="text-ohho-gold font-semibold text-sm">
                💼 Passive income, on a proven model.
              </div>
              <div className="mt-2 text-ohho-cream/70 text-sm">
                You bring capital + local presence. We keep the engine running —
                supply chain, marketing, tech, ops. Royalty 4–8%. Setup in 45
                days. 50–150 sq. ft. is all you need.
              </div>
            </div>
          </motion.div>

          {/* Right timeline */}
          <div className="lg:col-span-8 relative">
            {/* Vertical rail */}
            <div className="absolute left-[27px] top-2 bottom-2 w-px bg-gradient-to-b from-ohho-orange via-ohho-gold to-ohho-red/40" />

            <ol className="space-y-6">
              {ventureStages.map((stage, i) => {
                const Icon = ICONS[stage.icon] ?? Target;
                return (
                  <motion.li
                    key={stage.id}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.55, delay: i * 0.06 }}
                    className="relative pl-20"
                  >
                    {/* Node */}
                    <div
                      className="absolute left-0 top-0 h-14 w-14 rounded-xl grid place-items-center border-2"
                      style={{
                        backgroundColor: "rgba(14, 10, 4, 0.9)",
                        borderColor: stage.color,
                        boxShadow: `0 0 0 4px rgba(14,10,4,1), 0 0 24px -2px ${stage.color}55`,
                      }}
                    >
                      <Icon
                        className="h-6 w-6"
                        style={{ color: stage.color }}
                      />
                    </div>

                    <div className="glass-card glass-card-hover rounded-xl p-6">
                      <div className="flex items-baseline gap-3 flex-wrap">
                        <span
                          className="font-display text-3xl leading-none"
                          style={{ color: stage.color }}
                        >
                          0{stage.id}
                        </span>
                        <h4 className="font-display text-2xl text-ohho-cream">
                          {stage.title}
                        </h4>
                        <span className="ml-auto text-xs uppercase tracking-wider text-ohho-cream-dim">
                          {stage.short}
                        </span>
                      </div>
                      <p className="mt-4 text-ohho-cream/80 leading-relaxed">
                        {stage.body}
                      </p>
                    </div>
                  </motion.li>
                );
              })}
            </ol>
          </div>
        </div>

        {/* Closing line */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mt-16 p-8 sm:p-10 rounded-2xl bg-gradient-to-br from-ohho-orange/15 via-ohho-black-light to-ohho-black border border-ohho-orange/25 text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between gap-6"
        >
          <div>
            <div className="font-display text-2xl sm:text-3xl text-ohho-cream">
              Ready to start your OHHO journey?
            </div>
            <div className="mt-2 text-ohho-cream/70">
              From Shamli &amp; Kairana to Pan-India — proven territories, ready
              to hand over.
            </div>
          </div>
          <a
            href="#order"
            className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-gradient-to-r from-ohho-orange to-ohho-orange-deep text-ohho-black font-bold whitespace-nowrap hover:shadow-xl hover:shadow-ohho-orange/40 transition-shadow"
          >
            Become a Franchisee →
          </a>
        </motion.div>
      </div>
    </section>
  );
}
