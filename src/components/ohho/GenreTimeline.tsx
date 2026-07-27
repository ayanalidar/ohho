"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import { categories, menuItems } from "@/data/menu";
import { cn } from "@/lib/utils";

const ERA_META: Record<
  string,
  { year: string; era: string; blurb: string }
> = {
  Burgers: {
    year: "2019",
    era: "The Origin Era",
    blurb:
      "Where it all started — a single cart in Kairana, a perfectly crispy chicken patty, and a queue that didn't end. The burger built the brand.",
  },
  Sandwiches: {
    year: "2020",
    era: "The Brioche Era",
    blurb:
      "Customers asked for portable. We answered with flame-grilled stacks on thick brioche — a secret glaze made in batches of 20 litres, never more, never less.",
  },
  Pizzas: {
    year: "2022",
    era: "The Stone Era",
    blurb:
      "Compact stone-bake ovens engineered into 50 sq. ft. carts. A pizza, in 12 minutes, that competes with the chains — at half the price-point, twice the cheese.",
  },
  Snacks: {
    year: "2023",
    era: "The Skewer Era",
    blurb:
      "Spring Potato became our most-Instagrammed item in three weeks. We learned: a snack isn't a side, it's a hook. The cart got a second queue.",
  },
  Shakes: {
    year: "2024",
    era: "The Fuel Era",
    blurb:
      "Energy without compromise. Pure Boost, Prime Boost, Fusion Fuel — three power shakes engineered with our dietitians. The cart became a day-part brand.",
  },
};

export function GenreTimeline() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0); // 0..1
  const [activeIdx, setActiveIdx] = useState(0);

  const updateProgress = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const p = max <= 0 ? 0 : el.scrollLeft / max;
    setProgress(p);
    // active index = nearest card
    const cardWidth = el.scrollWidth / categories.length;
    const idx = Math.min(
      categories.length - 1,
      Math.max(0, Math.round(el.scrollLeft / cardWidth))
    );
    setActiveIdx(idx);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateProgress, { passive: true });
    // Defer the initial sync to avoid setState-in-effect cascading renders
    const raf = requestAnimationFrame(updateProgress);
    return () => {
      el.removeEventListener("scroll", updateProgress);
      cancelAnimationFrame(raf);
    };
  }, [updateProgress]);

  const scrollByCards = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const cardWidth = el.scrollWidth / categories.length;
    el.scrollBy({ left: dir * cardWidth, behavior: "smooth" });
  };

  return (
    <section
      id="timeline"
      className="relative py-24 sm:py-32 bg-ohho-black-light overflow-hidden"
    >
      {/* Section header */}
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-ohho-gold/10 border border-ohho-gold/30 text-ohho-gold text-xs font-semibold tracking-wider uppercase">
              <Clock className="h-3.5 w-3.5" />
              Horizontal Scroll Genre Timeline
            </div>
            <h2 className="mt-5 font-display text-4xl sm:text-6xl text-ohho-cream leading-[0.95]">
              Five genres. <span className="text-gradient-ohho">Five eras.</span>
            </h2>
            <p className="mt-4 text-ohho-cream/75 text-lg leading-relaxed">
              Scroll horizontally through the OHHO menu, era by era — each
              category is a chapter in the brand&apos;s story. From the first
              burger to the latest power shake.
            </p>
          </div>

          {/* Nav arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollByCards(-1)}
              disabled={activeIdx === 0}
              aria-label="Previous era"
              className="h-12 w-12 grid place-items-center rounded-full border border-ohho-gold/30 text-ohho-cream hover:bg-ohho-orange/15 hover:border-ohho-orange disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scrollByCards(1)}
              disabled={activeIdx === categories.length - 1}
              aria-label="Next era"
              className="h-12 w-12 grid place-items-center rounded-full border border-ohho-gold/30 text-ohho-cream hover:bg-ohho-orange/15 hover:border-ohho-orange disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Top progress rail */}
      <div className="mx-auto max-w-7xl px-6 lg:px-12 mt-10">
        <div className="relative h-1 rounded-full bg-ohho-cream/10">
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-ohho-orange via-ohho-gold to-ohho-orange transition-[width] duration-150"
            style={{ width: `${Math.max(8, progress * 100)}%` }}
          />
          {categories.map((c, i) => {
            const pos = (i / (categories.length - 1)) * 100;
            const reached = i <= activeIdx;
            return (
              <button
                key={c.id}
                onClick={() => {
                  const el = scrollerRef.current;
                  if (!el) return;
                  const cardWidth = el.scrollWidth / categories.length;
                  el.scrollTo({ left: cardWidth * i, behavior: "smooth" });
                }}
                className="absolute -top-1.5 -translate-x-1/2 group"
                style={{ left: `${pos}%` }}
                aria-label={`Go to ${c.label} era`}
              >
                <div
                  className={cn(
                    "h-4 w-4 rounded-full border-2 transition-all",
                    reached
                      ? "bg-ohho-orange border-ohho-gold scale-110"
                      : "bg-ohho-black border-ohho-cream/30 group-hover:border-ohho-gold"
                  )}
                />
                <div
                  className={cn(
                    "absolute top-6 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-wider whitespace-nowrap transition-colors",
                    i === activeIdx ? "text-ohho-gold" : "text-ohho-cream-dim"
                  )}
                >
                  {c.emoji}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Horizontal scroll cards */}
      <div
        ref={scrollerRef}
        className="mt-16 flex gap-6 overflow-x-auto snap-x-mandatory ohho-scroll ohho-scroll-x pb-6 px-6 lg:px-12 scroll-pl-6 lg:scroll-pl-12"
        style={{ scrollbarWidth: "thin" }}
      >
        {categories.map((cat, i) => {
          const items = menuItems.filter((m) => m.category === cat.id);
          const meta = ERA_META[cat.id];
          const isActive = i === activeIdx;
          return (
            <article
              key={cat.id}
              className="snap-center flex-shrink-0 w-[88vw] sm:w-[560px] lg:w-[640px] relative"
            >
              <div
                className={cn(
                  "relative rounded-2xl overflow-hidden glass-card transition-all duration-500",
                  isActive ? "scale-100 opacity-100" : "scale-[0.97] opacity-80"
                )}
              >
                {/* Era header */}
                <div
                  className="relative h-44 sm:h-52 p-6 flex flex-col justify-between"
                  style={{
                    background: `linear-gradient(135deg, ${cat.color}33 0%, transparent 60%), rgba(14,10,4,0.9)`,
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div
                        className="font-display text-5xl sm:text-6xl leading-none"
                        style={{ color: cat.color }}
                      >
                        {meta.year}
                      </div>
                      <div className="mt-1 text-xs uppercase tracking-[0.3em] text-ohho-cream-dim">
                        {meta.era}
                      </div>
                    </div>
                    <div
                      className="h-16 w-16 rounded-2xl grid place-items-center text-4xl"
                      style={{
                        background: `${cat.color}22`,
                        border: `1px solid ${cat.color}55`,
                      }}
                    >
                      {cat.emoji}
                    </div>
                  </div>
                  <div>
                    <div
                      className="font-display text-3xl sm:text-4xl text-ohho-cream"
                    >
                      {cat.label}
                    </div>
                    <div className="text-sm text-ohho-cream/70 italic">
                      {cat.tagline}
                    </div>
                  </div>

                  {/* Era number tag */}
                  <div className="absolute top-6 right-1/2 translate-x-32 sm:translate-x-44 hidden">
                    {i + 1}/{categories.length}
                  </div>
                </div>

                {/* Era blurb */}
                <div className="p-6 pt-5">
                  <p className="text-ohho-cream/80 leading-relaxed">
                    {meta.blurb}
                  </p>

                  {/* Items in this era */}
                  <div className="mt-5 space-y-2">
                    <div className="text-xs uppercase tracking-wider text-ohho-cream-dim mb-2">
                      Signature items in this era
                    </div>
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-ohho-orange/5 transition-colors"
                      >
                        <div className="h-12 w-12 rounded-md overflow-hidden flex-shrink-0 bg-ohho-black">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-ohho-cream truncate">
                            {item.emoji} {item.name}
                          </div>
                          <div className="text-xs text-ohho-cream-dim truncate">
                            {item.prepTime} · {item.kcal} kcal
                          </div>
                        </div>
                        <div className="font-display text-ohho-gold text-lg">
                          ₹{item.price}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Side ribbon */}
                <div
                  className="absolute top-0 bottom-0 left-0 w-1.5"
                  style={{ background: cat.color }}
                />
              </div>

              {/* Era counter below card */}
              <div className="mt-3 text-center text-xs text-ohho-cream-dim">
                Era {i + 1} of {categories.length} ·{" "}
                <span style={{ color: cat.color }}>{cat.label}</span>
              </div>
            </article>
          );
        })}
      </div>

      {/* Scroll hint */}
      <div className="mx-auto max-w-7xl px-6 lg:px-12 mt-2 flex items-center justify-center gap-2 text-xs text-ohho-cream-dim">
        <ArrowLeft className="h-3.5 w-3.5 animate-pulse" />
        Drag or scroll horizontally to traverse the eras
        <ArrowRight className="h-3.5 w-3.5 animate-pulse" />
      </div>
    </section>
  );
}
