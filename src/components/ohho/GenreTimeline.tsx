"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Clock, ChevronRight, Loader2 } from "lucide-react";
import { useTimelineEras, useMenuItems } from "@/hooks/use-content";
import { useNav } from "@/components/ohho/nav-context";
import { cn } from "@/lib/utils";

export function GenreTimeline() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const { navigate } = useNav();
  const { eras: categories, loading } = useTimelineEras();
  const { items: menuItems } = useMenuItems();
  const [progress, setProgress] = useState(0);
  const [activeIdx, setActiveIdx] = useState(0);

  const updateProgress = useCallback(() => {
    rafRef.current = null;
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const p = max <= 0 ? 0 : el.scrollLeft / max;
    const cardWidth = el.scrollWidth / Math.max(1, categories.length);
    const idx = Math.min(
      Math.max(0, categories.length - 1),
      Math.max(0, Math.round(el.scrollLeft / cardWidth))
    );
    setProgress(p);
    setActiveIdx(idx);
  }, [categories.length]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = () => {
      if (rafRef.current == null) rafRef.current = requestAnimationFrame(updateProgress);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    const raf = requestAnimationFrame(updateProgress);
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [updateProgress]);

  const scrollByCards = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const cardWidth = el.scrollWidth / categories.length;
    el.scrollBy({ left: dir * cardWidth, behavior: "smooth" });
  };

  if (loading || categories.length === 0) {
    return (
      <section id="timeline" className="relative py-16 sm:py-20 bg-ohho-black-light overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12 text-center py-20 text-ohho-cream-dim">
          <Loader2 className="h-8 w-8 mx-auto animate-spin mb-3" />
          Loading timeline…
        </div>
      </section>
    );
  }

  const active = categories[activeIdx];
  const activeItems = menuItems.filter((m: any) => m.category === active.category);

  return (
    <section
      id="timeline"
      className="relative py-16 sm:py-20 bg-ohho-black-light overflow-hidden"
    >
      {/* Ambient color glow that follows active era */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 h-96 w-[80%] rounded-full blur-3xl opacity-25 transition-all duration-700 pointer-events-none"
        style={{ background: active.color }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-ohho-gold/10 border border-ohho-gold/30 text-ohho-gold text-xs font-semibold tracking-wider uppercase">
              <Clock className="h-3.5 w-3.5" />
              The Menu Story — Horizontal Scroll Timeline
            </div>
            <h2 className="mt-5 font-display text-3xl sm:text-5xl lg:text-6xl text-ohho-cream leading-[0.95]">
              Six genres. <span className="text-gradient-ohho">Six chapters.</span>
            </h2>
            <p className="mt-4 text-ohho-cream/75 text-base sm:text-lg leading-relaxed">
              From the first burger in Kairana ({categories[0].year}) to the latest add-on line ({categories[categories.length - 1].year}).
              Scroll horizontally to walk through OHHO&apos;s menu story — each chapter
              is a genre, each genre is an era.
            </p>
          </div>

          {/* Nav arrows + counter */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wider text-ohho-cream-dim">
                Chapter
              </div>
              <div className="font-display text-2xl text-ohho-cream">
                <span style={{ color: active.color }}>{activeIdx + 1}</span>
                <span className="text-ohho-cream-dim"> / {categories.length}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => scrollByCards(-1)}
                disabled={activeIdx === 0}
                aria-label="Previous chapter"
                className="h-12 w-12 grid place-items-center rounded-full border border-ohho-gold/30 text-ohho-cream hover:bg-ohho-orange/15 hover:border-ohho-orange disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => scrollByCards(1)}
                disabled={activeIdx === categories.length - 1}
                aria-label="Next chapter"
                className="h-12 w-12 grid place-items-center rounded-full border border-ohho-gold/30 text-ohho-cream hover:bg-ohho-orange/15 hover:border-ohho-orange disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Top progress rail with markers */}
        <div className="mt-8 relative">
          <div className="relative h-1 rounded-full bg-ohho-cream/10">
            <div
              className="absolute left-0 top-0 h-full rounded-full transition-all duration-300"
              style={{
                width: `${Math.max(8, progress * 100)}%`,
                background: `linear-gradient(90deg, ${categories[0].color}, ${active.color})`,
              }}
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
                  aria-label={`Go to ${c.label} chapter`}
                >
                  <div
                    className={cn(
                      "h-4 w-4 rounded-full border-2 transition-all",
                      reached ? "scale-110" : "bg-ohho-black"
                    )}
                    style={{
                      borderColor: reached ? c.color : "rgba(245,230,204,0.3)",
                      background: reached ? c.color : "rgba(14,10,4,1)",
                    }}
                  />
                  <div
                    className={cn(
                      "absolute top-6 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-wider whitespace-nowrap transition-colors",
                      i === activeIdx ? "font-bold" : ""
                    )}
                    style={{ color: i === activeIdx ? c.color : "rgba(201,184,144,0.6)" }}
                  >
                    {c.year}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Horizontal scroll cards */}
        <div
          ref={scrollerRef}
          className="mt-12 sm:mt-16 flex gap-4 sm:gap-6 overflow-x-auto snap-x-mandatory ohho-scroll ohho-scroll-x pb-6 px-1 scroll-pl-1"
          style={{ scrollbarWidth: "thin" }}
        >
          {categories.map((cat, i) => {
            const items = menuItems.filter((m) => m.category === cat.category);
            const isActive = i === activeIdx;
            const heroItem = items[0];
            return (
              <article
                key={cat.category}
                className="snap-center flex-shrink-0 w-[88vw] sm:w-[560px] lg:w-[640px] relative"
              >
                <div
                  className={cn(
                    "relative rounded-2xl overflow-hidden glass-card transition-all duration-500",
                    isActive ? "scale-100 opacity-100" : "scale-[0.97] opacity-70"
                  )}
                >
                  {/* Hero image area */}
                  <div className="relative h-56 sm:h-64 overflow-hidden">
                    {heroItem && (
                      <img
                        src={heroItem.image}
                        alt={cat.label}
                        className={cn(
                          "h-full w-full object-cover transition-transform duration-700",
                          isActive ? "scale-100" : "scale-105"
                        )}
                      />
                    )}
                    {/* Overlay gradient with category color tint */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background: `linear-gradient(135deg, ${cat.color}55 0%, ${cat.color}22 40%, rgba(14,10,4,0.85) 100%)`,
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ohho-black-light via-transparent to-transparent" />

                    {/* Year + era badge */}
                    <div className="absolute top-5 left-5">
                      <div
                        className="font-display text-5xl sm:text-6xl leading-none"
                        style={{ color: "#fff", textShadow: `0 0 30px ${cat.color}` }}
                      >
                        {cat.year}
                      </div>
                      <div className="mt-1 text-[11px] uppercase tracking-[0.3em] text-ohho-cream/85">
                        {cat.era}
                      </div>
                    </div>

                    {/* Emoji icon */}
                    <div
                      className="absolute top-5 right-5 h-16 w-16 rounded-2xl grid place-items-center text-4xl"
                      style={{
                        background: `${cat.color}22`,
                        border: `1px solid ${cat.color}55`,
                        backdropFilter: "blur(8px)",
                      }}
                    >
                      {cat.emoji}
                    </div>

                    {/* Category title at bottom of image */}
                    <div className="absolute bottom-5 left-5 right-5">
                      <div className="font-display text-3xl sm:text-4xl text-ohho-cream">
                        {cat.label}
                      </div>
                      <div className="text-sm text-ohho-cream/85 italic">
                        {cat.tagline}
                      </div>
                    </div>
                  </div>

                  {/* Era blurb */}
                  <div className="p-6 pt-5">
                    <p className="text-ohho-cream/80 leading-relaxed text-sm">
                      {cat.blurb}
                    </p>

                    {/* Items grid */}
                    <div className="mt-5 grid grid-cols-2 gap-2">
                      {items.slice(0, 4).map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-2 p-2 rounded-lg bg-ohho-black/40 border border-ohho-gold/10"
                        >
                          <div className="h-10 w-10 rounded-md overflow-hidden flex-shrink-0 bg-ohho-black">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[12px] font-semibold text-ohho-cream truncate">
                              {item.emoji} {item.name}
                            </div>
                            <div className="text-[10px] text-ohho-gold">
                              ₹{item.price} · {item.prepTime}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Footer with item count */}
                    <div className="mt-4 pt-4 border-t border-ohho-gold/10 flex items-center justify-between text-[11px]">
                      <span className="text-ohho-cream-dim">
                        {items.length} item{items.length !== 1 ? "s" : ""} in this chapter
                      </span>
                      <button
                        onClick={() => navigate("menu")}
                        className="inline-flex items-center gap-1 font-semibold hover:underline"
                        style={{ color: cat.color }}
                      >
                        View in menu <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* Side ribbon */}
                  <div
                    className="absolute top-0 bottom-0 left-0 w-1.5"
                    style={{ background: cat.color }}
                  />
                </div>
              </article>
            );
          })}
        </div>

        {/* Scroll hint */}
        <div className="mt-2 flex items-center justify-center gap-2 text-xs text-ohho-cream-dim">
          <ArrowLeft className="h-3.5 w-3.5 animate-pulse" />
          Drag, scroll, or use arrows to traverse the chapters
          <ArrowRight className="h-3.5 w-3.5 animate-pulse" />
        </div>

        {/* Active era deep-dive panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4 }}
            className="mt-8 p-5 sm:p-6 rounded-2xl glass-card"
          >
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="text-2xl">{active.emoji}</span>
              <h3 className="font-display text-2xl text-ohho-cream">
                {active.year} · {active.label}
              </h3>
              <span
                className="ml-auto px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                style={{
                  background: `${active.color}22`,
                  color: active.color,
                  border: `1px solid ${active.color}55`,
                }}
              >
                Chapter {activeIdx + 1} of {categories.length}
              </span>
            </div>
            <p className="text-ohho-cream/75 leading-relaxed text-sm sm:text-base">
              {active.blurb}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {activeItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigate("menu")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-ohho-gold/20 text-ohho-cream hover:bg-ohho-gold/10 hover:border-ohho-gold/50 transition-all"
                >
                  <span>{item.emoji}</span>
                  {item.name}
                  <span className="text-ohho-gold">₹{item.price}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
