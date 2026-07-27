"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  Flame,
  MapPin,
  ShoppingBag,
  Truck,
  CreditCard,
  Wallet,
  Banknote,
  Sparkles,
} from "lucide-react";
import { menuItems, categories } from "@/data/menu";
import { useCart, cartSubtotal, cartCount } from "@/store/cart";
import { cn } from "@/lib/utils";

const PAYMENT_METHODS = [
  { id: "upi", label: "UPI / Wallet", icon: Wallet },
  { id: "card", label: "Credit / Debit", icon: CreditCard },
  { id: "cod", label: "Cash on Delivery", icon: Banknote },
];

export function OrderingPlatform() {
  const [cat, setCat] = useState<string>("Burgers");
  const [placed, setPlaced] = useState<{ orderId: string } | null>(null);
  const [pay, setPay] = useState("upi");
  const [mode, setMode] = useState<"delivery" | "pickup">("delivery");

  const { lines, add, setQty, remove, clear } = useCart();
  const subtotal = cartSubtotal(lines);
  const count = cartCount(lines);
  const deliveryFee = mode === "delivery" && subtotal > 0 ? (subtotal > 400 ? 0 : 39) : 0;
  const taxes = Math.round(subtotal * 0.05);
  const total = subtotal + deliveryFee + taxes;

  const items = useMemo(
    () => menuItems.filter((m) => m.category === cat),
    [cat]
  );

  const placeOrder = () => {
    if (lines.length === 0) return;
    const orderId =
      "OHHO-" +
      Math.random().toString(36).slice(2, 7).toUpperCase() +
      "-" +
      Date.now().toString(36).slice(-4).toUpperCase();
    setPlaced({ orderId });
    clear();
  };

  return (
    <section
      id="order"
      className="relative py-24 sm:py-32 bg-gradient-to-b from-ohho-black-light via-ohho-black to-ohho-black-light overflow-hidden"
    >
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 h-72 w-[80%] rounded-full bg-ohho-orange/8 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-12">
        {/* Header */}
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-ohho-orange/10 border border-ohho-orange/30 text-ohho-orange text-xs font-semibold tracking-wider uppercase">
            <ShoppingBag className="h-3.5 w-3.5" />
            Online Ordering Platform
          </div>
          <h2 className="mt-5 font-display text-4xl sm:text-6xl text-ohho-cream leading-[0.95]">
            Build your order, <span className="text-gradient-ohho">check out.</span>
          </h2>
          <p className="mt-4 text-ohho-cream/75 text-lg leading-relaxed">
            Pick a category, add to cart, choose delivery or pickup, pay your
            way. Once placed, your order goes live in the delivery tracker below
            — watch it move, in real time.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {placed ? (
            /* ---------- Order placed confirmation ---------- */
            <motion.div
              key="placed"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="mt-12 glass-card rounded-2xl p-8 sm:p-12 text-center max-w-2xl mx-auto"
            >
              <div className="h-20 w-20 mx-auto rounded-full bg-ohho-orange/15 border-2 border-ohho-orange grid place-items-center">
                <CheckCircle2 className="h-10 w-10 text-ohho-orange" />
              </div>
              <h3 className="mt-6 font-display text-3xl sm:text-4xl text-ohho-cream">
                Order placed!
              </h3>
              <p className="mt-3 text-ohho-cream/75">
                Your OHHO BURGERS order is now in the kitchen. Track it in
                real-time — from grill to your door.
              </p>
              <div className="mt-6 inline-flex flex-col items-center px-6 py-3 rounded-xl bg-ohho-black/60 border border-ohho-gold/25">
                <div className="text-[10px] uppercase tracking-[0.3em] text-ohho-cream-dim">
                  Order ID
                </div>
                <div className="font-display text-2xl text-ohho-gold tracking-wider mt-1">
                  {placed.orderId}
                </div>
              </div>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="#track"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-gradient-to-r from-ohho-orange to-ohho-orange-deep text-ohho-black font-bold hover:shadow-xl hover:shadow-ohho-orange/40 transition-shadow"
                >
                  <Truck className="h-4 w-4" />
                  Track your order
                </a>
                <button
                  onClick={() => setPlaced(null)}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md border border-ohho-gold/30 text-ohho-cream font-semibold hover:bg-ohho-gold/10"
                >
                  Place another order
                </button>
              </div>
            </motion.div>
          ) : (
            /* ---------- Active order builder ---------- */
            <motion.div
              key="builder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-10 grid lg:grid-cols-12 gap-6"
            >
              {/* Left: menu */}
              <div className="lg:col-span-8">
                {/* Category tabs */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setCat(c.id)}
                      className={cn(
                        "inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold border transition-all",
                        cat === c.id
                          ? "bg-ohho-orange text-ohho-black border-ohho-orange shadow-lg shadow-ohho-orange/30"
                          : "bg-ohho-black/40 text-ohho-cream-dim border-ohho-gold/20 hover:border-ohho-gold/60 hover:text-ohho-gold"
                      )}
                    >
                      <span>{c.emoji}</span>
                      {c.label}
                    </button>
                  ))}
                </div>

                {/* Items */}
                <div className="grid sm:grid-cols-2 gap-4">
                  {items.map((item) => {
                    const inCart = lines.find((l) => l.item.id === item.id);
                    return (
                      <div
                        key={item.id}
                        className="glass-card glass-card-hover rounded-xl p-4 flex gap-4"
                      >
                        <div className="h-24 w-24 rounded-lg overflow-hidden flex-shrink-0 bg-ohho-black">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-ohho-cream text-sm leading-tight">
                              {item.emoji} {item.name}
                            </h3>
                            <div className="font-display text-ohho-gold text-lg whitespace-nowrap">
                              ₹{item.price}
                            </div>
                          </div>
                          <div className="mt-1 flex items-center gap-3 text-[11px] text-ohho-cream-dim">
                            <span className="inline-flex items-center gap-0.5">
                              <Clock className="h-3 w-3" />
                              {item.prepTime}
                            </span>
                            <span>{item.kcal} kcal</span>
                            <span className="inline-flex items-center gap-0.5">
                              {Array.from({ length: 3 }).map((_, s) => (
                                <Flame
                                  key={s}
                                  className={cn(
                                    "h-2.5 w-2.5",
                                    s < item.spice
                                      ? "text-ohho-red fill-ohho-red/50"
                                      : "text-ohho-cream/15"
                                  )}
                                />
                              ))}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-ohho-cream/65 line-clamp-2">
                            {item.description}
                          </p>

                          <div className="mt-auto pt-2">
                            {inCart ? (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setQty(item.id, inCart.qty - 1)}
                                  className="h-7 w-7 grid place-items-center rounded bg-ohho-orange/15 text-ohho-orange hover:bg-ohho-orange/25 font-bold"
                                >
                                  −
                                </button>
                                <span className="text-sm text-ohho-cream w-6 text-center font-semibold">
                                  {inCart.qty}
                                </span>
                                <button
                                  onClick={() => setQty(item.id, inCart.qty + 1)}
                                  className="h-7 w-7 grid place-items-center rounded bg-ohho-orange/15 text-ohho-orange hover:bg-ohho-orange/25 font-bold"
                                >
                                  +
                                </button>
                                <span className="ml-auto text-xs text-ohho-gold">
                                  ₹{inCart.qty * item.price}
                                </span>
                              </div>
                            ) : (
                              <button
                                onClick={() => add(item)}
                                className="w-full py-2 rounded-md bg-ohho-orange/15 text-ohho-orange font-semibold text-sm hover:bg-ohho-orange hover:text-ohho-black transition-colors border border-ohho-orange/30"
                              >
                                + Add to order
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right: cart summary + checkout */}
              <div className="lg:col-span-4">
                <div className="glass-card rounded-2xl p-5 lg:sticky lg:top-24">
                  <div className="flex items-center justify-between">
                    <div className="font-display text-2xl text-ohho-cream">
                      Your Order
                    </div>
                    {count > 0 && (
                      <button
                        onClick={clear}
                        className="text-xs text-ohho-cream-dim hover:text-ohho-red"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="mt-1 text-xs text-ohho-cream-dim">
                    {count} item{count !== 1 ? "s" : ""} · Live Premium
                  </div>

                  {/* Line items */}
                  <div className="mt-4 space-y-2 max-h-64 overflow-y-auto ohho-scroll pr-1">
                    {lines.length === 0 ? (
                      <div className="text-center py-8 text-ohho-cream-dim text-sm">
                        <Sparkles className="h-8 w-8 mx-auto mb-2 text-ohho-gold/50" />
                        Add items from the menu to start your order.
                      </div>
                    ) : (
                      lines.map((line) => (
                        <div
                          key={line.item.id}
                          className="flex items-center gap-2 p-2 rounded-lg bg-ohho-black/40 text-sm"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="text-ohho-cream truncate">
                              {line.item.emoji} {line.item.name}
                            </div>
                            <div className="text-xs text-ohho-cream-dim">
                              ₹{line.item.price} × {line.qty}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setQty(line.item.id, line.qty - 1)}
                              className="h-6 w-6 grid place-items-center rounded bg-ohho-orange/15 text-ohho-orange hover:bg-ohho-orange/25"
                            >
                              −
                            </button>
                            <span className="w-5 text-center text-ohho-cream text-xs">
                              {line.qty}
                            </span>
                            <button
                              onClick={() => setQty(line.item.id, line.qty + 1)}
                              className="h-6 w-6 grid place-items-center rounded bg-ohho-orange/15 text-ohho-orange hover:bg-ohho-orange/25"
                            >
                              +
                            </button>
                          </div>
                          <div className="font-display text-ohho-gold text-sm w-14 text-right">
                            ₹{line.item.price * line.qty}
                          </div>
                          <button
                            onClick={() => remove(line.item.id)}
                            className="text-ohho-cream-dim hover:text-ohho-red text-xs"
                            aria-label="Remove"
                          >
                            ✕
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Mode toggle */}
                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setMode("delivery")}
                      className={cn(
                        "py-2 rounded-md text-xs font-semibold border transition-all",
                        mode === "delivery"
                          ? "bg-ohho-orange/20 text-ohho-orange border-ohho-orange"
                          : "bg-transparent text-ohho-cream-dim border-ohho-gold/20"
                      )}
                    >
                      <Truck className="h-3.5 w-3.5 inline mr-1" />
                      Delivery
                    </button>
                    <button
                      onClick={() => setMode("pickup")}
                      className={cn(
                        "py-2 rounded-md text-xs font-semibold border transition-all",
                        mode === "pickup"
                          ? "bg-ohho-orange/20 text-ohho-orange border-ohho-orange"
                          : "bg-transparent text-ohho-cream-dim border-ohho-gold/20"
                      )}
                    >
                      <MapPin className="h-3.5 w-3.5 inline mr-1" />
                      Pickup
                    </button>
                  </div>

                  {/* Address (delivery only) */}
                  {mode === "delivery" && (
                    <div className="mt-3">
                      <label className="text-[10px] uppercase tracking-wider text-ohho-cream-dim">
                        Delivery address
                      </label>
                      <textarea
                        placeholder="Flat / House no, street, area, city, pincode"
                        className="mt-1 w-full p-3 rounded-md bg-ohho-black/60 border border-ohho-gold/15 text-ohho-cream text-sm placeholder:text-ohho-cream-dim/50 focus:outline-none focus:border-ohho-orange/50 min-h-72px resize-none"
                        rows={3}
                      />
                    </div>
                  )}

                  {/* Payment */}
                  <div className="mt-4">
                    <div className="text-[10px] uppercase tracking-wider text-ohho-cream-dim mb-1.5">
                      Payment method
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {PAYMENT_METHODS.map((m) => {
                        const Icon = m.icon;
                        return (
                          <button
                            key={m.id}
                            onClick={() => setPay(m.id)}
                            className={cn(
                              "p-2 rounded-md text-[10px] font-semibold border transition-all flex flex-col items-center gap-1",
                              pay === m.id
                                ? "bg-ohho-orange/20 text-ohho-orange border-ohho-orange"
                                : "bg-transparent text-ohho-cream-dim border-ohho-gold/20 hover:border-ohho-gold/50"
                            )}
                          >
                            <Icon className="h-3.5 w-3.5" />
                            {m.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="mt-5 pt-4 border-t border-ohho-gold/10 space-y-1.5 text-sm">
                    <div className="flex justify-between text-ohho-cream-dim">
                      <span>Subtotal</span>
                      <span>₹{subtotal}</span>
                    </div>
                    {mode === "delivery" && (
                      <div className="flex justify-between text-ohho-cream-dim">
                        <span>Delivery {deliveryFee === 0 && "(free over ₹400)"}</span>
                        <span>{deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-ohho-cream-dim">
                      <span>Taxes &amp; charges (5%)</span>
                      <span>₹{taxes}</span>
                    </div>
                    <div className="flex justify-between font-display text-xl text-ohho-gold pt-2 border-t border-ohho-gold/10 mt-2">
                      <span>Total</span>
                      <span>₹{total}</span>
                    </div>
                  </div>

                  <button
                    disabled={lines.length === 0}
                    onClick={placeOrder}
                    className={cn(
                      "mt-5 w-full py-3.5 rounded-md font-bold transition-all",
                      lines.length === 0
                        ? "bg-ohho-cream/10 text-ohho-cream-dim cursor-not-allowed"
                        : "bg-gradient-to-r from-ohho-orange to-ohho-orange-deep text-ohho-black hover:shadow-xl hover:shadow-ohho-orange/40"
                    )}
                  >
                    {lines.length === 0
                      ? "Add items to continue"
                      : `Place order · ₹${total}`}
                  </button>

                  <div className="mt-3 text-center text-[11px] text-ohho-cream-dim">
                    🔒 Demo checkout — no real payment is processed.
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
