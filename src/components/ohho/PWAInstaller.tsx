"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Smartphone } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "ohho-pwa-install-dismissed";
const DISMISS_TTL = 1000 * 60 * 60 * 24 * 7; // 7 days

export function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  // Detect if already installed (standalone display mode) — lazy init, no effect setState
  const [installed, setInstalled] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-ignore - iOS Safari
      window.navigator.standalone === true
    );
  });

  // Register service worker on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return; // skip in dev to avoid HMR conflicts
    navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.warn("SW registration failed:", err);
    });
  }, []);

  // Capture beforeinstallprompt
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Check if user previously dismissed recently
      try {
        const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0);
        if (Date.now() - dismissedAt < DISMISS_TTL) return;
      } catch {}
      // Show banner after a short delay
      const t = setTimeout(() => setShowBanner(true), 3500);
      return () => clearTimeout(t);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // Detect successful install
  useEffect(() => {
    const handler = () => {
      setInstalled(true);
      setShowBanner(false);
      setDeferredPrompt(null);
    };
    window.addEventListener("appinstalled", handler);
    return () => window.removeEventListener("appinstalled", handler);
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setInstalled(true);
    }
    setShowBanner(false);
    setDeferredPrompt(null);
  };

  const dismiss = () => {
    setShowBanner(false);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {}
  };

  if (installed) return null;

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 80 }}
          transition={{ type: "spring", damping: 25, stiffness: 280 }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-[70] rounded-2xl glass-card border border-ohho-gold/30 shadow-2xl p-4 flex items-center gap-3"
        >
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-ohho-orange to-ohho-red grid place-items-center flex-shrink-0">
            <Smartphone className="h-6 w-6 text-ohho-black" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-display text-base text-ohho-cream leading-tight">
              Install OHHO BURGERS
            </div>
            <div className="text-[11px] text-ohho-cream-dim mt-0.5">
              Add to your home screen for faster access &amp; offline menu.
            </div>
          </div>
          <button
            onClick={install}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-gradient-to-r from-ohho-orange to-ohho-orange-deep text-ohho-black font-bold text-xs whitespace-nowrap hover:shadow-lg hover:shadow-ohho-orange/40 transition-shadow"
          >
            <Download className="h-3.5 w-3.5" />
            Install
          </button>
          <button
            onClick={dismiss}
            aria-label="Dismiss"
            className="h-7 w-7 grid place-items-center rounded-md text-ohho-cream-dim hover:text-ohho-cream hover:bg-ohho-orange/10 flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
