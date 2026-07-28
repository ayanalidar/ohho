"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Flame, Clock, Star, ShoppingCart } from "lucide-react";
import { menuItems, type MenuItem } from "@/data/menu";
import { useCart } from "@/store/cart";
import { useNav } from "@/components/ohho/nav-context";
import { cn } from "@/lib/utils";

export function MenuMagnifier() {
  const [activeTag, setActiveTag] = useState<string>("All");
  const add = useCart((s) => s.add);
  const { navigate } = useNav();

  const tags = useMemo(() => ["All", "Signature", "Bestseller", "Trending", "Veg", "Spicy"], []);
  const filtered = useMemo(() => {
    if (activeTag === "All") return menuItems;
    if (activeTag === "Veg") return menuItems.filter((m) => m.tag === "Veg");
    if (activeTag === "Spicy") return menuItems.filter((m) => m.spice >= 3);
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
              Full Menu
            </div>
            <h2 className="mt-5 font-display text-4xl sm:text-6xl text-ohho-cream leading-[0.95]">
              The Menu, <span className="text-gradient-ohho">end to end.</span>
            </h2>
            <p className="mt-4 text-ohho-cream/75 text-lg leading-relaxed">
              Burgers, pizzas, sandwiches, buckets, sips &amp; add-ons — every
              item, every price. Tap <strong className="text-ohho-gold">Add</strong> to
              drop it in your cart, then head to Order Online to check out.
            </p>
          </div>

          {/* Tag filter */}
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <button
                key={t}
                onClick={() => setActiveTag(t)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-semibold border transition-colors",
                  activeTag === t
                    ? "bg-ohho-orange text-ohho-black border-ohho-orange"
                    : "bg-transparent text-ohho-cream-dim border-ohho-gold/20 hover:border-ohho-gold/50 hover:text-ohho-gold"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Grid — clean static cards, no magnifier */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item, i) => (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.35, delay: (i % 3) * 0.05 }}
              className="glass-card glass-card-hover rounded-2xl p-5 flex flex-col"
            >
              <div className="mb-4 aspect-[4/3] overflow-hidden rounded-lg bg-ohho-black-light">
                <img
                  src={item.image}
                  alt={item.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
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
                    {item.spice > 0 && (
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
                    )}
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
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 text-xs text-ohho-cream-dim">
          <span className="inline-flex items-center gap-2">
            <Star className="h-3.5 w-3.5 text-ohho-gold" />
            Tap Add to drop items in your cart.
          </span>
          <button
            onClick={() => navigate("order")}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-ohho-orange/15 text-ohho-orange border border-ohho-orange/30 font-semibold hover:bg-ohho-orange/25 transition-colors"
          >
            Go to Order Online →
          </button>
        </div>
      </div>
    </section>
  );
}
