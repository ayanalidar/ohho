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
  Loader2,
  X,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
} from "lucide-react";
import { menuItems, categories, type MenuItem, ohhoLocations } from "@/data/menu";
import { useCart, cartSubtotal, cartCount } from "@/store/cart";
import { useAuth } from "@/components/ohho/AuthProvider";
import { useNav } from "@/components/ohho/nav-context";
import { cn } from "@/lib/utils";

const PAYMENT_METHODS = [
  { id: "upi", label: "UPI / QR", icon: Wallet },
  { id: "wallet", label: "OHHO Wallet", icon: Wallet },
  { id: "card", label: "Credit / Debit", icon: CreditCard },
  { id: "cod", label: "Cash on Delivery", icon: Banknote },
];

type Placed = { orderId: string; invoiceNumber: string; earnedPoints: number };

export function OrderingPlatform({ onRequireAuth }: { onRequireAuth: () => void }) {
  const [cat, setCat] = useState<string>("Burgers");
  const [placed, setPlaced] = useState<Placed | null>(null);
  const [pay, setPay] = useState("upi");
  const [mode, setMode] = useState<"delivery" | "pickup">("delivery");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [locationId, setLocationId] = useState<string>(ohhoLocations[0]?.id || "kairana");
  const [useWallet, setUseWallet] = useState(false);
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [upiData, setUpiData] = useState<any>(null);
  const [placing, setPlacing] = useState(false);
  const [addOnModal, setAddOnModal] = useState<MenuItem | null>(null);
  const [selectedAddOns, setSelectedAddOns] = useState<Record<string, string[]>>({});

  const { lines, add, setQty, remove, clear, close: closeCart } = useCart();
  const { user, refresh } = useAuth();
  const { navigate } = useNav();
  const subtotal = cartSubtotal(lines);
  const count = cartCount(lines);
  const deliveryFee = mode === "delivery" && subtotal > 0 ? (subtotal > 400 ? 0 : 39) : 0;
  const taxes = Math.round(subtotal * 0.05);
  const grossTotal = subtotal + deliveryFee + taxes;
  const walletBalanceRupees = user ? user.walletBalance / 100 : 0;
  const walletDebit = useWallet ? Math.min(walletBalanceRupees, grossTotal) : 0;
  const total = grossTotal - walletDebit;

  const items = useMemo(
    () => menuItems.filter((m) => m.category === cat && !m.isAddOn),
    [cat]
  );
  const addOns = useMemo(() => menuItems.filter((m) => m.isAddOn), []);

  const placeOrder = async () => {
    if (lines.length === 0) return;
    if (!user) {
      onRequireAuth();
      return;
    }
    if (mode === "delivery" && !address.trim()) {
      return;
    }
    // For UPI payment: show QR modal first, create order after "I've Paid" confirmation
    if (pay === "upi" && !showUpiModal) {
      // Close cart drawer so it doesn't cover the UPI modal
      closeCart();
      // Fetch UPI intent + QR
      try {
        const tempOrderId = "OHHO-PREVIEW-" + Date.now().toString(36).toUpperCase();
        const res = await fetch(`/api/upi-payment?amount=${total}&orderId=${tempOrderId}`);
        const data = await res.json();
        setUpiData(data);
        setShowUpiModal(true);
        return; // wait for user to confirm payment
      } catch (e: any) {
        alert("Failed to generate UPI QR: " + e.message);
        return;
      }
    }
    setPlacing(true);
    try {
      const payload = {
        items: lines.map((l) => ({
          itemId: l.item.id,
          name: l.item.name,
          emoji: l.item.emoji,
          image: l.item.image,
          price: l.item.price,
          qty: l.qty,
          addOns: selectedAddOns[l.item.id] || [],
        })),
        subtotal,
        deliveryFee,
        taxes,
        total,
        mode,
        address: mode === "delivery" ? address : null,
        paymentMethod: pay,
        notes: notes || null,
        locationId,
        useWallet,
      };
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to place order");
      setPlaced({
        orderId: data.order.orderId,
        invoiceNumber: data.order.invoiceNumber || "—",
        earnedPoints: data.earnedPoints || 0,
      });
      setShowUpiModal(false);
      setUpiData(null);
      clear();
      await refresh(); // refresh session to update wallet balance + loyalty points
    } catch (e: any) {
      alert(e?.message || "Failed to place order");
    } finally {
      setPlacing(false);
    }
  };

  const toggleAddOn = (itemId: string, addOnId: string) => {
    setSelectedAddOns((s) => {
      const cur = s[itemId] || [];
      return {
        ...s,
        [itemId]: cur.includes(addOnId)
          ? cur.filter((x) => x !== addOnId)
          : [...cur, addOnId],
      };
    });
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
            Pick a category, add to cart, customize with add-ons, choose delivery
            or pickup, pay your way. Orders save to your account — track them
            live and download invoices from your dashboard.
          </p>
        </div>

        {/* Auth hint */}
        {!user && (
          <div className="mt-6 p-3 rounded-xl bg-ohho-gold/8 border border-ohho-gold/25 text-sm text-ohho-cream/80 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-ohho-gold flex-shrink-0" />
            <span>
              <strong className="text-ohho-gold">Sign in</strong> to place orders,
              track them live, and earn loyalty points. Demo:{" "}
              <code className="text-ohho-cream">demo@ohhofoods.com</code> / <code className="text-ohho-cream">demo123</code>
            </span>
          </div>
        )}

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
                real-time — from grill to your door. We&apos;ve also added{" "}
                <strong className="text-ohho-gold">{placed.earnedPoints} loyalty points</strong> to your account.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3 max-w-md mx-auto">
                <div className="px-4 py-3 rounded-xl bg-ohho-black/60 border border-ohho-gold/25">
                  <div className="text-[10px] uppercase tracking-[0.3em] text-ohho-cream-dim">
                    Order ID
                  </div>
                  <div className="font-display text-lg text-ohho-gold tracking-wider mt-1 break-all">
                    {placed.orderId}
                  </div>
                </div>
                <div className="px-4 py-3 rounded-xl bg-ohho-black/60 border border-ohho-gold/25">
                  <div className="text-[10px] uppercase tracking-[0.3em] text-ohho-cream-dim">
                    Invoice #
                  </div>
                  <div className="font-display text-lg text-ohho-gold tracking-wider mt-1">
                    {placed.invoiceNumber}
                  </div>
                </div>
              </div>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => navigate("track")}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-gradient-to-r from-ohho-orange to-ohho-orange-deep text-ohho-black font-bold hover:shadow-xl hover:shadow-ohho-orange/40 transition-shadow"
                >
                  <Truck className="h-4 w-4" />
                  Track your order
                </button>
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
                  {categories.filter(c => c.id !== "Add-ons").map((c) => (
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
                    const itemAddOns = selectedAddOns[item.id] || [];
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
                            {item.spice > 0 && (
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
                            )}
                          </div>
                          <p className="mt-1 text-xs text-ohho-cream/65 line-clamp-2">
                            {item.description}
                          </p>

                          {itemAddOns.length > 0 && (
                            <div className="mt-1 text-[10px] text-ohho-gold">
                              +{itemAddOns.length} add-on{itemAddOns.length !== 1 ? "s" : ""} selected
                            </div>
                          )}

                          <div className="mt-auto pt-2 flex items-center gap-2">
                            {inCart ? (
                              <>
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
                                </div>
                                <button
                                  onClick={() => setAddOnModal(item)}
                                  className="ml-auto text-[11px] text-ohho-gold hover:underline"
                                >
                                  + Add-ons
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => add(item)}
                                  className="flex-1 py-2 rounded-md bg-ohho-orange/15 text-ohho-orange font-semibold text-sm hover:bg-ohho-orange hover:text-ohho-black transition-colors border border-ohho-orange/30"
                                >
                                  + Add to order
                                </button>
                                <button
                                  onClick={() => setAddOnModal(item)}
                                  className="px-2 py-2 rounded-md text-[11px] text-ohho-cream-dim hover:text-ohho-gold border border-ohho-gold/15"
                                  aria-label="Customize with add-ons"
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add-ons strip */}
                <div className="mt-8 p-4 rounded-xl glass-card">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="font-display text-lg text-ohho-cream">
                        ✨ Make it louder — Add-ons
                      </div>
                      <div className="text-xs text-ohho-cream-dim">
                        Extra cheese, extra patty, extra dips. Tap any item&apos;s + to customize.
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {addOns.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => add(a)}
                        className="p-3 rounded-lg bg-ohho-black/40 border border-ohho-gold/10 hover:border-ohho-gold/40 text-left transition-colors"
                      >
                        <div className="text-2xl">{a.emoji}</div>
                        <div className="text-xs font-semibold text-ohho-cream mt-1">
                          {a.name}
                        </div>
                        <div className="text-[11px] text-ohho-gold">+₹{a.price}</div>
                      </button>
                    ))}
                  </div>
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
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Location selector */}
                  <div className="mt-5">
                    <label className="text-[10px] uppercase tracking-wider text-ohho-cream-dim mb-1.5 flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> Order from
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {ohhoLocations.map((loc) => (
                        <button
                          key={loc.id}
                          onClick={() => setLocationId(loc.id)}
                          className={cn(
                            "p-2 rounded-md text-[11px] font-semibold border transition-all text-left",
                            locationId === loc.id
                              ? "bg-ohho-orange/20 text-ohho-orange border-ohho-orange"
                              : "bg-transparent text-ohho-cream-dim border-ohho-gold/20 hover:border-ohho-gold/50"
                          )}
                        >
                          <div className="font-bold truncate">{loc.city}</div>
                          <div className="text-[9px] opacity-80">{loc.area.split(" — ")[0]}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Mode toggle */}
                  <div className="mt-4 grid grid-cols-2 gap-2">
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
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Flat / House no, street, area, city, pincode"
                        className="mt-1 w-full p-3 rounded-md bg-ohho-black/60 border border-ohho-gold/15 text-ohho-cream text-sm placeholder:text-ohho-cream-dim/50 focus:outline-none focus:border-ohho-orange/50 resize-none"
                        rows={3}
                      />
                    </div>
                  )}

                  {/* Order notes */}
                  <div className="mt-3">
                    <label className="text-[10px] uppercase tracking-wider text-ohho-cream-dim">
                      Special instructions (optional)
                    </label>
                    <input
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. less spicy, extra crispy, no onions"
                      className="mt-1 w-full px-3 py-2.5 rounded-md bg-ohho-black/60 border border-ohho-gold/15 text-ohho-cream text-sm placeholder:text-ohho-cream-dim/50 focus:outline-none focus:border-ohho-orange/50"
                    />
                  </div>

                  {/* Wallet toggle */}
                  {user && user.walletBalance > 0 && (
                    <div className="mt-3 p-3 rounded-lg bg-ohho-gold/8 border border-ohho-gold/20 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-ohho-cream">Use OHHO Wallet</div>
                        <div className="text-[10px] text-ohho-cream-dim">
                          Balance: ₹{walletBalanceRupees.toFixed(2)} · Save ₹{walletDebit.toFixed(2)}
                        </div>
                      </div>
                      <button
                        onClick={() => setUseWallet((v) => !v)}
                        className={cn(
                          "relative h-6 w-11 rounded-full transition-colors flex-shrink-0",
                          useWallet ? "bg-ohho-orange" : "bg-ohho-cream/20"
                        )}
                        aria-label="Toggle wallet"
                      >
                        <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform", useWallet ? "translate-x-5" : "translate-x-0.5")} />
                      </button>
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

                  {/* Loyalty hint */}
                  {user && (
                    <div className="mt-3 p-2 rounded-md bg-ohho-gold/8 border border-ohho-gold/15 text-[11px] text-ohho-cream/80">
                      You&apos;ll earn <strong className="text-ohho-gold">{Math.floor(total / 10)} loyalty pts</strong> on this order.
                    </div>
                  )}

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
                    {walletDebit > 0 && (
                      <div className="flex justify-between text-ohho-gold">
                        <span>Wallet debit</span>
                        <span>−₹{walletDebit.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-display text-xl text-ohho-gold pt-2 border-t border-ohho-gold/10 mt-2">
                      <span>Total {walletDebit > 0 && "due"}</span>
                      <span>₹{total.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    disabled={lines.length === 0 || placing}
                    onClick={placeOrder}
                    className={cn(
                      "mt-5 w-full py-3.5 rounded-md font-bold transition-all flex items-center justify-center gap-2",
                      lines.length === 0 || placing
                        ? "bg-ohho-cream/10 text-ohho-cream-dim cursor-not-allowed"
                        : "bg-gradient-to-r from-ohho-orange to-ohho-orange-deep text-ohho-black hover:shadow-xl hover:shadow-ohho-orange/40"
                    )}
                  >
                    {placing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Placing order…
                      </>
                    ) : lines.length === 0 ? (
                      "Add items to continue"
                    ) : !user ? (
                      <>
                        Sign in to place order · ₹{total}
                        <ArrowRight className="h-4 w-4" />
                      </>
                    ) : (
                      `Place order · ₹${total}`
                    )}
                  </button>

                  {!user && lines.length > 0 && (
                    <div className="mt-2 text-center text-[11px] text-ohho-cream-dim">
                      Account required to track orders &amp; earn points.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add-ons modal */}
      <AnimatePresence>
        {addOnModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] grid place-items-center p-4 bg-ohho-black/80 backdrop-blur-md"
            onClick={() => setAddOnModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 16 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl bg-ohho-black-light border border-ohho-gold/25 shadow-2xl p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="font-display text-xl text-ohho-cream">
                    Customize: {addOnModal.name}
                  </div>
                  <div className="text-xs text-ohho-cream-dim mt-0.5">
                    Add extras to make it louder.
                  </div>
                </div>
                <button
                  onClick={() => setAddOnModal(null)}
                  className="h-8 w-8 grid place-items-center rounded-md text-ohho-cream-dim hover:bg-ohho-orange/10 hover:text-ohho-cream"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2">
                {addOns.map((a) => {
                  const selected = (selectedAddOns[addOnModal.id] || []).includes(a.id);
                  return (
                    <button
                      key={a.id}
                      onClick={() => toggleAddOn(addOnModal.id, a.id)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-lg border transition-all",
                        selected
                          ? "bg-ohho-orange/15 border-ohho-orange"
                          : "bg-ohho-black/40 border-ohho-gold/10 hover:border-ohho-gold/40"
                      )}
                    >
                      <div className="h-12 w-12 rounded-md overflow-hidden bg-ohho-black flex-shrink-0">
                        <img src={a.image} alt={a.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-sm font-semibold text-ohho-cream">
                          {a.emoji} {a.name}
                        </div>
                        <div className="text-xs text-ohho-cream-dim line-clamp-1">
                          {a.description}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-display text-ohho-gold">+₹{a.price}</div>
                        <div
                          className={cn(
                            "mt-1 h-5 w-5 rounded-full border-2 ml-auto grid place-items-center",
                            selected
                              ? "bg-ohho-orange border-ohho-orange"
                              : "border-ohho-cream-dim/40"
                          )}
                        >
                          {selected && <CheckCircle2 className="h-3 w-3 text-ohho-black" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setAddOnModal(null)}
                className="mt-5 w-full py-3 rounded-md bg-gradient-to-r from-ohho-orange to-ohho-orange-deep text-ohho-black font-bold hover:shadow-lg hover:shadow-ohho-orange/40 transition-shadow"
              >
                Done
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* UPI QR Payment Modal */}
      <AnimatePresence>
        {showUpiModal && upiData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] grid place-items-center p-4 bg-ohho-black/85 backdrop-blur-md"
            onClick={() => { setShowUpiModal(false); setUpiData(null); }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 16 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl bg-ohho-black-light border border-ohho-gold/25 shadow-2xl p-6"
            >
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ohho-orange/15 border border-ohho-orange/40 text-ohho-orange text-[10px] font-bold uppercase tracking-wider">
                  UPI Payment
                </div>
                <div className="mt-4 font-display text-3xl text-ohho-gold">₹{total.toFixed(2)}</div>
                <div className="text-xs text-ohho-cream-dim mt-1">Scan to pay {upiData.merchantName}</div>
                <div className="text-[10px] text-ohho-cream-dim mt-0.5">UPI: {upiData.merchantUpi}</div>
              </div>

              {/* QR code */}
              <div className="mt-5 grid place-items-center">
                <div className="bg-white p-3 rounded-xl">
                  <img
                    src={upiData.qrImageUrl}
                    alt="UPI QR code"
                    className="h-48 w-48"
                  />
                </div>
              </div>

              {/* UPI app deep-links */}
              <div className="mt-5">
                <div className="text-[10px] uppercase tracking-wider text-ohho-cream-dim mb-2 text-center">
                  Or pay with an app
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {upiData.upiApps?.map((app: any) => (
                    <a
                      key={app.id}
                      href={app.intent}
                      className="p-2 rounded-lg bg-ohho-black/50 border border-ohho-gold/15 hover:border-ohho-gold/40 text-center transition-colors"
                    >
                      <div className="text-xl mb-0.5">
                        {app.id === "gpay" ? "🟢" : app.id === "phonepe" ? "🟣" : app.id === "paytm" ? "🔵" : "🟦"}
                      </div>
                      <div className="text-[9px] font-semibold text-ohho-cream">{app.name}</div>
                    </a>
                  ))}
                </div>
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  onClick={() => { setShowUpiModal(false); setUpiData(null); }}
                  className="flex-1 py-2.5 rounded-md border border-ohho-gold/30 text-ohho-cream text-sm font-semibold hover:bg-ohho-gold/10"
                >
                  Cancel
                </button>
                <button
                  onClick={placeOrder}
                  disabled={placing}
                  className="flex-1 py-2.5 rounded-md bg-gradient-to-r from-ohho-orange to-ohho-orange-deep text-ohho-black font-bold text-sm hover:shadow-lg hover:shadow-ohho-orange/40 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {placing ? <><Loader2 className="h-4 w-4 animate-spin" /> Placing…</> : "I've Paid — Place Order"}
                </button>
              </div>
              <div className="mt-3 text-center text-[10px] text-ohho-cream-dim">
                Tap an app above to open it with amount pre-filled. After paying, tap &quot;I&apos;ve Paid&quot;.
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
