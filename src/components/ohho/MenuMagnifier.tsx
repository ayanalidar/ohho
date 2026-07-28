"use client";

import { useCallback, useRef, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Plus, Flame, Clock, Star, ShoppingCart } from "lucide-react";
import { menuItems, type MenuItem } from "@/data/menu";
import { useCart } from "@/store/cart";
import { useNav } from "@/components/ohho/nav-context";
import { cn } from "@/lib/utils";

const ZOOM = 4; // 4x magnifier
const LENS_SIZE = 180; // px diameter

function MagnifierImage({ item }: { item: MenuItem }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [lens, setLens] = useState<{
    show: boolean;
    x: number;
    y: number;
    bgWidth: number;
  }>({ show: false, x: 0, y: 0, bgWidth: 0 });
  const [imgLoaded, setImgLoaded] = useState(false);

  const onMove = useCallback((e: React.MouseEvent) => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setLens({ show: true, x, y, bgWidth: rect.width * ZOOM });
  }, []);

  const onLeave = useCallback(() => setLens((s) => ({ ...s, show: false })), []);

  // Background position inside the lens so the lens shows the 4x-zoomed area under cursor
  const bgX = -(lens.x * ZOOM - LENS_SIZE / 2);
  const bgY = -(lens.y * ZOOM - LENS_SIZE / 2);

  return (
    <div
      ref={wrapRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="relative aspect-[4/3] overflow-hidden rounded-lg bg-ohho-black-light cursor-zoom-in group/img"
    >
      <img
        src={item.image}
        alt={item.name}
        onLoad={() => setImgLoaded(true)}
        className={cn(
          "h-full w-full object-cover transition-all duration-700",
          imgLoaded ? "opacity-100" : "opacity-0",
          lens.show ? "scale-[1.04]" : "scale-100"
        )}
        draggable={false}
      />

      {/* Magnifier lens */}
      <div
        className="absolute pointer-events-none rounded-full transition-opacity duration-200"
        style={{
          width: LENS_SIZE,
          height: LENS_SIZE,
          left: 0,
          top: 0,
          transform: `translate(${lens.x - LENS_SIZE / 2}px, ${lens.y - LENS_SIZE / 2}px)`,
          opacity: lens.show ? 1 : 0,
          backgroundImage: `url(${item.image})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: `${bgX}px ${bgY}px`,
          backgroundSize: `${lens.bgWidth}px auto`,
          boxShadow: "0 0 0 3px rgba(255, 193, 7, 0.85), 0 0 0 6px rgba(14, 10, 4, 0.85), 0 14px 50px rgba(0,0,0,0.6)",
          backgroundColor: "#0e0a04",
        }}
      >
        {/* inner ring */}
        <div className="absolute inset-2 rounded-full border border-ohho-gold/30" />
        {/* crosshair */}
        <div className="absolute inset-0 grid place-items-center">
          <div className="h-3 w-3 rounded-full border border-ohho-gold/70 bg-ohho-orange/30 backdrop-blur-sm" />
        </div>
        {/* "4×" label */}
        <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-ohho-orange text-ohho-black text-[10px] font-bold tracking-wider">
          4× ZOOM
        </div>
      </div>

      {/* Top-right chip when not hovering */}
      <div
        className={cn(
          "absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase transition-opacity duration-200",
          "bg-ohho-black/70 backdrop-blur text-ohho-gold border border-ohho-gold/30",
          lens.show ? "opacity-0" : "opacity-100"
        )}
      >
        Hover × 4
      </div>
    </div>
  );
}

export function MenuMagnifier() {
  const [activeTag, setActiveTag] = useState<string>("All");
  const add = useCart((s) => s.add);
  const { navigate } = useNav();

  const tags = useMemo(() => ["All", "Signature", "Bestseller", "Trending"], []);
  const filtered = useMemo(() => {
    if (activeTag === "All") return menuItems;
    return menuItems.filter((m) => m.tag === activeTag);
  }, [activeTag]);

  return (
    <section
      id="menu"
      className="relative py-24 sm:py-32 bg-gradient-to-b from-ohho-black via-ohho-black-light to-ohho-black overflow-hidden"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-ohho-orange/10 border border-ohho-orange/30 text-ohho-orange text-xs font-semibold tracking-wider uppercase">
              <Plus className="h-3.5 w-3.5" />
              Follow-Cursor Magnifier
            </div>
            <h2 className="mt-5 font-display text-4xl sm:text-6xl text-ohho-cream leading-[0.95]">
              The Menu, <span className="text-gradient-ohho">up close.</span>
            </h2>
            <p className="mt-4 text-ohho-cream/75 text-lg leading-relaxed">
              Hover any dish to trigger the 4× magnifier — every crispy edge,
              every molten center, every drizzle of sauce. We don&apos;t hide
              what we serve. We zoom in on it.
            </p>
          </div>

          {/* Tag filter */}
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <button
                key={t}
                onClick={() => setActiveTag(t)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-semibold border transition-all",
                  activeTag === t
                    ? "bg-ohho-orange text-ohho-black border-ohho-orange shadow-lg shadow-ohho-orange/30"
                    : "bg-transparent text-ohho-cream-dim border-ohho-gold/20 hover:border-ohho-gold/50 hover:text-ohho-gold"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item, i) => (
            <motion.article
              key={item.id}
              layout
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.06 }}
              className="glass-card glass-card-hover rounded-2xl p-5 flex flex-col"
            >
              <div className="mb-4">
                <MagnifierImage item={item} />
              </div>

              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{item.emoji}</span>
                    <h3 className="font-display text-xl text-ohho-cream leading-tight truncate">
                      {item.name}
                    </h3>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-ohho-cream-dim">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {item.prepTime}
                    </span>
                    <span>{item.kcal} kcal</span>
                    <span className="inline-flex items-center gap-0.5">
                      {Array.from({ length: 3 }).map((_, s) => (
                        <Flame
                          key={s}
                          className={cn(
                            "h-3 w-3",
                            s < item.spice ? "text-ohho-red fill-ohho-red/50" : "text-ohho-cream/15"
                          )}
                        />
                      ))}
                    </span>
                  </div>
                </div>
                {item.tag && (
                  <span className="px-2 py-0.5 rounded-full bg-ohho-gold/15 text-ohho-gold text-[10px] font-bold uppercase tracking-wider whitespace-nowrap border border-ohho-gold/30">
                    {item.tag}
                  </span>
                )}
              </div>

              <p className="mt-3 text-sm text-ohho-cream/70 leading-relaxed line-clamp-2">
                {item.description}
              </p>

              {/* Ingredient chips */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {item.ingredients.slice(0, 4).map((ing) => (
                  <span
                    key={ing}
                    className="px-2 py-0.5 rounded text-[10px] text-ohho-cream-dim bg-ohho-black/40 border border-ohho-gold/10"
                  >
                    {ing}
                  </span>
                ))}
                {item.ingredients.length > 4 && (
                  <span className="px-2 py-0.5 rounded text-[10px] text-ohho-cream-dim bg-ohho-black/40">
                    +{item.ingredients.length - 4} more
                  </span>
                )}
              </div>

              {/* Footer: price + add */}
              <div className="mt-auto pt-5 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-ohho-cream-dim">
                    Price
                  </div>
                  <div className="font-display text-2xl text-ohho-gold">
                    ₹{item.price}
                  </div>
                </div>
                <button
                  onClick={() => add(item)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-gradient-to-r from-ohho-orange to-ohho-orange-deep text-ohho-black font-bold text-sm hover:shadow-lg hover:shadow-ohho-orange/40 transition-shadow"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Add
                </button>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Hint footer */}
        <div className="mt-10 flex items-center justify-center gap-2 text-xs text-ohho-cream-dim">
          <Star className="h-3.5 w-3.5 text-ohho-gold" />
          Hover any dish image to trigger the 4× follow-cursor magnifier lens.
        </div>
      </div>
    </section>
  );
}
