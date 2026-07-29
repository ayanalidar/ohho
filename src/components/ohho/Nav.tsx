"use client";

import { useEffect, useState } from "react";
import { Menu, ShoppingBag, X, Plus, Minus, Trash2, User, LogOut, LayoutDashboard, ShieldCheck, ChevronDown } from "lucide-react";
import { useCart, cartCount, cartSubtotal } from "@/store/cart";
import { useAuth } from "@/components/ohho/AuthProvider";
import { useNav } from "@/components/ohho/nav-context";
import { cn } from "@/lib/utils";

const NAV_TABS = [
  { view: "home", label: "Home" },
  { view: "company", label: "Company" },
  { view: "menu", label: "Menu" },
  { view: "order", label: "Order Online" },
  { view: "franchise", label: "Franchise" },
  { view: "catering", label: "Catering" },
] as const;

const NAV_SCROLL = [
  { target: "timeline", label: "Timeline" },
  { target: "tour", label: "3D Tour" },
  { target: "track", label: "Track" },
  { target: "rewards", label: "Rewards" },
] as const;

export function Nav({
  onOpenAuth,
  onOpenUserDash,
  onOpenAdmin,
}: {
  onOpenAuth: (mode: "login" | "signup") => void;
  onOpenUserDash: () => void;
  onOpenAdmin: () => void;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { lines, isOpen, open, close, setQty, remove } = useCart();
  const { user, signOut } = useAuth();
  const { navigate, currentView } = useNav();
  const count = cartCount(lines);
  const subtotal = cartSubtotal(lines);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-50 transition-all duration-500",
          scrolled
            ? "bg-ohho-black/90 backdrop-blur-xl border-b border-ohho-gold/15 py-2.5"
            : "bg-ohho-black/60 backdrop-blur-md py-3"
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Logo */}
          <button
            onClick={() => navigate("home")}
            className="flex items-center gap-2.5 group flex-shrink-0"
          >
            <img
              src="/ohho-images/ohho-logo-full.png"
              alt="OHHO BURGERS — Live Premium"
              className="h-9 sm:h-11 w-auto object-contain transition-opacity group-hover:opacity-90"
            />
          </button>

          {/* Desktop nav — tabs + scroll links */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {NAV_TABS.map((t) => (
              <button
                key={t.view}
                onClick={() => navigate(t.view)}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  currentView === t.view
                    ? "text-ohho-gold bg-ohho-gold/10"
                    : "text-ohho-cream/80 hover:text-ohho-gold hover:bg-ohho-gold/5"
                )}
              >
                {t.label}
              </button>
            ))}
            <span className="w-px h-5 bg-ohho-gold/20 mx-1" />
            {NAV_SCROLL.map((l) => (
              <button
                key={l.target}
                onClick={() => navigate(l.target)}
                className="px-3 py-2 text-sm text-ohho-cream/70 hover:text-ohho-gold hover:bg-ohho-gold/5 rounded-md transition-colors"
              >
                {l.label}
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Cart */}
            <button
              onClick={open}
              aria-label="Open cart"
              className="relative h-10 w-10 grid place-items-center rounded-md bg-ohho-orange/10 hover:bg-ohho-orange/20 border border-ohho-orange/30 text-ohho-orange transition-colors"
            >
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -top-2 -right-2 h-5 min-w-5 px-1 grid place-items-center rounded-full bg-ohho-orange text-ohho-black text-[11px] font-bold">
                  {count}
                </span>
              )}
            </button>

            {/* Auth area */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="h-10 inline-flex items-center gap-1.5 pl-1.5 pr-2.5 rounded-md bg-ohho-gold/10 border border-ohho-gold/30 text-ohho-cream hover:bg-ohho-gold/20"
                >
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-ohho-orange to-ohho-red grid place-items-center text-ohho-black font-bold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown className={cn("h-3.5 w-3.5 text-ohho-cream-dim transition-transform", userMenuOpen && "rotate-180")} />
                </button>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-12 z-50 w-64 rounded-xl glass-card p-2 shadow-2xl">
                      <div className="p-3 border-b border-ohho-gold/10">
                        <div className="font-display text-ohho-cream">{user.name}</div>
                        <div className="text-[11px] text-ohho-cream-dim truncate">{user.email}</div>
                        <div className="mt-2 text-[11px] text-ohho-gold font-semibold">
                          {user.loyaltyPoints} loyalty pts
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          setTimeout(() => onOpenUserDash(), 50);
                        }}
                        className="w-full mt-1 flex items-center gap-2 px-3 py-2 rounded-md text-sm text-ohho-cream hover:bg-ohho-orange/10 text-left"
                      >
                        <LayoutDashboard className="h-4 w-4 text-ohho-orange" />
                        My Orders &amp; Invoices
                      </button>
                      {(user.role === "ADMIN" || user.role === "OPERATOR") && (
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            setTimeout(() => onOpenAdmin(), 50);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-ohho-cream hover:bg-ohho-red/10 text-left"
                        >
                          <ShieldCheck className="h-4 w-4 text-ohho-red" />
                          {user.role === "ADMIN" ? "Admin Panel" : "Location Panel"}
                        </button>
                      )}
                      <button
                        onClick={async () => {
                          setUserMenuOpen(false);
                          await signOut();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-ohho-cream-dim hover:bg-ohho-cream/5 text-left"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={() => onOpenAuth("login")}
                className="hidden sm:inline-flex h-10 items-center gap-1.5 px-3 rounded-md bg-ohho-black/40 backdrop-blur border border-ohho-gold/30 text-ohho-cream font-semibold text-sm hover:bg-ohho-gold/10"
              >
                <User className="h-4 w-4" />
                Sign in
              </button>
            )}

            <button
              onClick={() => navigate("order")}
              className="hidden sm:inline-flex h-10 items-center px-3 lg:px-4 rounded-md bg-gradient-to-r from-ohho-orange to-ohho-orange-deep text-ohho-black font-semibold text-sm hover:shadow-lg hover:shadow-ohho-orange/40 transition-shadow"
            >
              Order Now
            </button>

            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
              className="lg:hidden h-10 w-10 grid place-items-center rounded-md border border-ohho-gold/20 text-ohho-cream"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden mx-4 mt-3 rounded-xl glass-card p-3">
            {NAV_TABS.map((t) => (
              <button
                key={t.view}
                onClick={() => {
                  navigate(t.view);
                  setMobileOpen(false);
                }}
                className={cn(
                  "block w-full px-4 py-3 rounded-md text-left font-medium",
                  currentView === t.view
                    ? "text-ohho-gold bg-ohho-gold/10"
                    : "text-ohho-cream hover:bg-ohho-orange/10"
                )}
              >
                {t.label}
              </button>
            ))}
            <div className="my-2 ohho-divider" />
            {NAV_SCROLL.map((l) => (
              <button
                key={l.target}
                onClick={() => {
                  navigate(l.target);
                  setMobileOpen(false);
                }}
                className="block w-full px-4 py-3 rounded-md text-left text-ohho-cream/70 hover:bg-ohho-orange/10 hover:text-ohho-gold"
              >
                {l.label}
              </button>
            ))}
            {!user && (
              <button
                onClick={() => {
                  setMobileOpen(false);
                  onOpenAuth("login");
                }}
                className="block w-full mt-2 px-4 py-3 rounded-md bg-ohho-gold/15 text-ohho-gold font-semibold text-left"
              >
                Sign in / Create account
              </button>
            )}
            <button
              onClick={() => {
                navigate("order");
                setMobileOpen(false);
              }}
              className="block w-full mt-2 px-4 py-3 rounded-md bg-gradient-to-r from-ohho-orange to-ohho-orange-deep text-ohho-black font-semibold text-center"
            >
              Order Now
            </button>
          </div>
        )}
      </header>

      {/* Cart drawer */}
      <div
        className={cn(
          "fixed inset-0 z-[60] transition-all duration-300",
          isOpen ? "pointer-events-auto" : "pointer-events-none"
        )}
        aria-hidden={!isOpen}
      >
        <div
          className={cn(
            "absolute inset-0 bg-ohho-black/70 backdrop-blur-sm transition-opacity duration-300",
            isOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={close}
        />
        <aside
          className={cn(
            "absolute right-0 top-0 h-full w-full max-w-md bg-ohho-black-light border-l border-ohho-gold/20 shadow-2xl flex flex-col transition-transform duration-300",
            isOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="flex items-center justify-between p-5 border-b border-ohho-gold/15">
            <div>
              <div className="font-display text-2xl text-ohho-cream">Your Order</div>
              <div className="text-xs text-ohho-cream-dim">OHHO BURGERS · Live Premium</div>
            </div>
            <button
              onClick={close}
              className="h-9 w-9 grid place-items-center rounded-md border border-ohho-gold/20 text-ohho-cream hover:bg-ohho-orange/10"
              aria-label="Close cart"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto ohho-scroll p-5 space-y-3">
            {lines.length === 0 && (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">🍔</div>
                <div className="font-display text-xl text-ohho-cream mb-1">Cart is empty</div>
                <div className="text-sm text-ohho-cream-dim mb-4">
                  Add a Crispy Chicken Burger to get started.
                </div>
                <button
                  onClick={() => {
                    close();
                    navigate("menu");
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-ohho-orange/15 text-ohho-orange border border-ohho-orange/30 text-sm font-semibold hover:bg-ohho-orange/25"
                >
                  Browse Menu
                </button>
              </div>
            )}

            {lines.map((line) => (
              <div
                key={line.item.id}
                className="flex gap-3 p-3 rounded-lg bg-ohho-black/40 border border-ohho-gold/10"
              >
                <div className="h-16 w-16 rounded-md overflow-hidden bg-ohho-black flex-shrink-0">
                  <img
                    src={line.item.image}
                    alt={line.item.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-ohho-cream text-sm leading-tight truncate">
                    {line.item.name}
                  </div>
                  <div className="text-xs text-ohho-gold mt-0.5">₹{line.item.price}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => setQty(line.item.id, line.qty - 1)}
                      className="h-6 w-6 grid place-items-center rounded bg-ohho-orange/15 text-ohho-orange hover:bg-ohho-orange/25"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="text-sm text-ohho-cream w-6 text-center font-semibold">
                      {line.qty}
                    </span>
                    <button
                      onClick={() => setQty(line.item.id, line.qty + 1)}
                      className="h-6 w-6 grid place-items-center rounded bg-ohho-orange/15 text-ohho-orange hover:bg-ohho-orange/25"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => remove(line.item.id)}
                      className="ml-auto h-6 w-6 grid place-items-center rounded text-ohho-red/70 hover:text-ohho-red hover:bg-ohho-red/10"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className="font-display text-ohho-gold text-lg self-center">
                  ₹{line.item.price * line.qty}
                </div>
              </div>
            ))}
          </div>

          {lines.length > 0 && (
            <div className="p-5 border-t border-ohho-gold/15 space-y-3">
              <div className="flex items-center justify-between text-ohho-cream">
                <span className="text-sm text-ohho-cream-dim">Subtotal</span>
                <span className="font-display text-2xl text-ohho-gold">₹{subtotal}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-ohho-cream-dim">
                <span>Delivery (added at checkout)</span>
                <span>Calculated next</span>
              </div>
              <button
                onClick={() => {
                  close();
                  navigate("order");
                }}
                className="block w-full py-3 rounded-md bg-gradient-to-r from-ohho-orange to-ohho-orange-deep text-ohho-black font-bold text-center hover:shadow-lg hover:shadow-ohho-orange/40 transition-shadow"
              >
                Checkout →
              </button>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
