"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { AuthProvider } from "@/components/ohho/AuthProvider";
import { NavContext, type NavTarget } from "@/components/ohho/nav-context";
import { Nav } from "@/components/ohho/Nav";
import { HeroSpotlight } from "@/components/ohho/HeroSpotlight";
import { GenreTimeline } from "@/components/ohho/GenreTimeline";
import { OrderingPlatform } from "@/components/ohho/OrderingPlatform";
import { LiveKitchenView } from "@/components/ohho/LiveKitchenView";
import { RewardsSection } from "@/components/ohho/RewardsSection";
import { Footer } from "@/components/ohho/Footer";
import { StandalonePageBar } from "@/components/ohho/StandalonePageBar";
import {
  TodaySpecialBanner, LiveOrderTicker, LocationPicker,
  AchievementBadges, CustomerPhotoWall, CountdownTimer,
} from "@/components/ohho/HomeFeatures";
import { AnimatePresence, motion } from "framer-motion";

// Lazy-load heavy components that aren't needed on initial render
const VirtualTour3D = dynamic(() => import("@/components/ohho/VirtualTour3D").then(m => m.VirtualTour3D), {
  ssr: false,
  loading: () => (
    <div className="py-20 text-center text-ohho-cream-dim">
      <div className="h-16 w-16 mx-auto rounded-full border-2 border-ohho-gold/30 border-t-ohho-orange animate-spin mb-3" />
      Loading 3D tour…
    </div>
  ),
});
const AboutVentures = dynamic(() => import("@/components/ohho/AboutVentures").then(m => m.AboutVentures));
const MenuMagnifier = dynamic(() => import("@/components/ohho/MenuMagnifier").then(m => m.MenuMagnifier));
const FranchiseTab = dynamic(() => import("@/components/ohho/FranchiseTab").then(m => m.FranchiseTab));
const CateringTab = dynamic(() => import("@/components/ohho/CateringTab").then(m => m.CateringTab));
const AuthModal = dynamic(() => import("@/components/ohho/AuthModal").then(m => m.AuthModal), { ssr: false });
const UserDashboard = dynamic(() => import("@/components/ohho/UserDashboard").then(m => m.UserDashboard), { ssr: false });
const AdminPanel = dynamic(() => import("@/components/ohho/AdminPanel").then(m => m.AdminPanel), { ssr: false });

type View = "home" | "company" | "menu" | "order" | "franchise" | "catering";

const VIEWS: View[] = ["home", "company", "menu", "order", "franchise", "catering"];

export default function Home() {
  const [view, setView] = useState<View>("home");
  const [pendingScroll, setPendingScroll] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [userDashOpen, setUserDashOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  const openAuth = useCallback((mode: "login" | "signup") => {
    setAuthMode(mode);
    setAuthOpen(true);
  }, []);

  const navigate = useCallback((target: NavTarget) => {
    if (VIEWS.includes(target as View)) {
      setView(target as View);
      setPendingScroll(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      if (view !== "home") {
        setView("home");
        setPendingScroll(target);
      } else {
        document.getElementById(target)?.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [view]);

  useEffect(() => {
    if (view === "home" && pendingScroll) {
      const t = setTimeout(() => {
        document.getElementById(pendingScroll)?.scrollIntoView({ behavior: "smooth" });
        setPendingScroll(null);
      }, 150);
      return () => clearTimeout(t);
    }
  }, [view, pendingScroll]);

  return (
    <AuthProvider>
      <NavContext.Provider value={{ navigate, currentView: view }}>
        <main className="min-h-screen bg-ohho-black text-ohho-cream flex flex-col">
          <Nav
            onOpenAuth={openAuth}
            onOpenUserDash={() => setUserDashOpen(true)}
            onOpenAdmin={() => setAdminOpen(true)}
          />

          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-1"
            >
              {view === "home" && (
                <>
                  <TodaySpecialBanner />
                  <HeroSpotlight />
                  <LiveOrderTicker />
                  <LocationPicker />
                  <AchievementBadges />
                  <GenreTimeline />
                  <CustomerPhotoWall />
                  <LiveKitchenView />
                  <CountdownTimer />
                  <RewardsSection />
                </>
              )}

              {view === "company" && (
                <div className="pt-[72px]">
                  <StandalonePageBar title="Company" subtitle="OHHO Food Ventures · Operator-first QSR brand" />
                  <AboutVentures />
                </div>
              )}

              {view === "menu" && (
                <div className="pt-[72px]">
                  <StandalonePageBar title="Menu" subtitle="Hover any dish for 4× magnifier detail" />
                  <MenuMagnifier />
                </div>
              )}

              {view === "order" && (
                <div className="pt-[72px]">
                  <StandalonePageBar title="Order Online" subtitle="Build your cart, check out, track live" />
                  <OrderingPlatform onRequireAuth={() => openAuth("signup")} />
                </div>
              )}

              {view === "franchise" && (
                <>
                  <FranchiseTab />
                  <VirtualTour3D />
                </>
              )}

              {view === "catering" && <CateringTab />}
            </motion.div>
          </AnimatePresence>

          <Footer />

          {/* Modals & overlays */}
          <AuthModal
            open={authOpen}
            onClose={() => setAuthOpen(false)}
            defaultMode={authMode}
          />
          <UserDashboard
            open={userDashOpen}
            onClose={() => setUserDashOpen(false)}
          />
          <AdminPanel open={adminOpen} onClose={() => setAdminOpen(false)} />
        </main>
      </NavContext.Provider>
    </AuthProvider>
  );
}
