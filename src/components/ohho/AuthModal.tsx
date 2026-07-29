"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, User as UserIcon, Phone, Loader2, Sparkles } from "lucide-react";
import { useAuth } from "@/components/ohho/AuthProvider";
import { cn } from "@/lib/utils";

type Mode = "login" | "signup";

export function AuthModal({
  open,
  onClose,
  defaultMode = "login",
}: {
  open: boolean;
  onClose: () => void;
  defaultMode?: Mode;
}) {
  const { refresh } = useAuth();
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setMode(defaultMode);
      setError(null);
      // Pre-fill referral code from URL ?ref= param
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const ref = params.get("ref");
        if (ref) setReferralCode(ref.toUpperCase());
      }
    }
  }, [open, defaultMode]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const endpoint = mode === "signup" ? "/api/auth/signup" : "/api/auth/login";
      const body =
        mode === "signup"
          ? { email, password, name, phone, referralCode }
          : { email, password };
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
      } else {
        await refresh();
        onClose();
      }
    } catch (e: any) {
      setError(e?.message || "Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] grid place-items-center p-4 bg-ohho-black/80 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 16 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 16 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-2xl bg-ohho-black-light border border-ohho-gold/25 shadow-2xl p-6 sm:p-8"
          >
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-4 right-4 h-8 w-8 grid place-items-center rounded-md text-ohho-cream-dim hover:bg-ohho-orange/10 hover:text-ohho-cream"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header */}
            <div className="text-center">
              <img
                src="/ohho-images/ohho-logo-full.png"
                alt="OHHO BURGERS"
                className="h-14 w-auto mx-auto object-contain"
              />
              <h2 className="mt-4 font-display text-2xl text-ohho-cream">
                {mode === "signup" ? "Create your account" : "Welcome back"}
              </h2>
              <p className="mt-1 text-sm text-ohho-cream-dim">
                {mode === "signup"
                  ? "Order, track, earn loyalty points."
                  : "Sign in to track orders & view invoices."}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={submit} className="mt-6 space-y-3">
              {mode === "signup" && (
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-ohho-cream-dim">
                    Full name
                  </label>
                  <div className="mt-1 relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ohho-cream-dim" />
                    <input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Aarav Sharma"
                      className="w-full pl-10 pr-3 py-2.5 rounded-md bg-ohho-black/60 border border-ohho-gold/15 text-ohho-cream placeholder:text-ohho-cream-dim/50 focus:outline-none focus:border-ohho-orange/50 text-sm"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-[11px] uppercase tracking-wider text-ohho-cream-dim">
                  Email
                </label>
                <div className="mt-1 relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ohho-cream-dim" />
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="w-full pl-10 pr-3 py-2.5 rounded-md bg-ohho-black/60 border border-ohho-gold/15 text-ohho-cream placeholder:text-ohho-cream-dim/50 focus:outline-none focus:border-ohho-orange/50 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-ohho-cream-dim">
                  Password
                </label>
                <div className="mt-1 relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ohho-cream-dim" />
                  <input
                    required
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3 py-2.5 rounded-md bg-ohho-black/60 border border-ohho-gold/15 text-ohho-cream placeholder:text-ohho-cream-dim/50 focus:outline-none focus:border-ohho-orange/50 text-sm"
                  />
                </div>
              </div>

              {mode === "signup" && (
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-ohho-cream-dim">
                    Phone (optional)
                  </label>
                  <div className="mt-1 relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ohho-cream-dim" />
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 90000 00000"
                      className="w-full pl-10 pr-3 py-2.5 rounded-md bg-ohho-black/60 border border-ohho-gold/15 text-ohho-cream placeholder:text-ohho-cream-dim/50 focus:outline-none focus:border-ohho-orange/50 text-sm"
                    />
                  </div>
                </div>
              )}

              {mode === "signup" && (
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-ohho-cream-dim">
                    Referral code (optional — both get 100 pts)
                  </label>
                  <input
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    placeholder="OHHO-XXXXXX"
                    className="mt-1 w-full px-3 py-2.5 rounded-md bg-ohho-black/60 border border-ohho-gold/15 text-ohho-cream placeholder:text-ohho-cream-dim/50 focus:outline-none focus:border-ohho-orange/50 text-sm font-mono"
                  />
                </div>
              )}

              {error && (
                <div className="text-sm text-ohho-red bg-ohho-red/10 border border-ohho-red/30 rounded-md px-3 py-2">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={cn(
                  "w-full py-3 rounded-md font-bold transition-all flex items-center justify-center gap-2",
                  loading
                    ? "bg-ohho-cream/10 text-ohho-cream-dim cursor-wait"
                    : "bg-gradient-to-r from-ohho-orange to-ohho-orange-deep text-ohho-black hover:shadow-lg hover:shadow-ohho-orange/40"
                )}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Please wait…
                  </>
                ) : mode === "signup" ? (
                  "Create account"
                ) : (
                  "Sign in"
                )}
              </button>
            </form>

            {/* Toggle mode */}
            <div className="mt-5 text-center text-sm text-ohho-cream-dim">
              {mode === "signup" ? (
                <>
                  Already have an account?{" "}
                  <button
                    onClick={() => setMode("login")}
                    className="text-ohho-gold hover:underline font-semibold"
                  >
                    Sign in
                  </button>
                </>
              ) : (
                <>
                  New to OHHO?{" "}
                  <button
                    onClick={() => setMode("signup")}
                    className="text-ohho-gold hover:underline font-semibold"
                  >
                    Create an account
                  </button>
                </>
              )}
            </div>

            {/* Demo credentials hint */}
            <div className="mt-4 p-3 rounded-md bg-ohho-gold/5 border border-ohho-gold/15 text-[11px] text-ohho-cream-dim flex items-start gap-2">
              <Sparkles className="h-3.5 w-3.5 text-ohho-gold flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-ohho-gold font-semibold mb-0.5">Demo logins</div>
                Customer: <code className="text-ohho-cream">demo@ohhofoods.com</code> / <code className="text-ohho-cream">demo123</code>
                <br />
                Admin: <code className="text-ohho-cream">admin@ohhofoods.com</code> / <code className="text-ohho-cream">admin123</code>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
