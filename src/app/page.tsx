"use client";

import { useEffect, useState, useCallback } from "react";
import { AuthProvider } from "@/components/ohho/AuthProvider";
import { NavContext, type NavTarget } from "@/components/ohho/nav-context";
import { Nav } from "@/components/ohho/Nav";
import { HeroSpotlight } from "@/components/ohho/HeroSpotlight";
import { AboutVentures } from "@/components/ohho/AboutVentures";
import { MenuMagnifier } from "@/components/ohho/MenuMagnifier";
import { GenreTimeline } from "@/components/ohho/GenreTimeline";
import { VirtualTour3D } from "@/components/ohho/VirtualTour3D";
import { OrderingPlatform } from "@/components/ohho/OrderingPlatform";
import { DeliveryTracker } from "@/components/ohho/DeliveryTracker";
import { RewardsSection } from "@/components/ohho/RewardsSection";
import { Footer } from "@/components/ohho/Footer";
import { AuthModal } from "@/components/ohho/AuthModal";
import { UserDashboard } from "@/components/ohho/UserDashboard";
import { AdminPanel } from "@/components/ohho/AdminPanel";
import { StandalonePageBar } from "@/components/ohho/StandalonePageBar";
import { AnimatePresence, motion } from "framer-motion";

type View = "home" | "company" | "menu" | "order";

const VIEWS: View[] = ["home", "company", "menu", "order"];

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
      // scroll target on home
      if (view !== "home") {
        setView("home");
        setPendingScroll(target);
      } else {
        document.getElementById(target)?.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [view]);

  // After switching to home for a scroll target, perform the scroll
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
                  <HeroSpotlight />
                  <GenreTimeline />
                  <VirtualTour3D />
                  <DeliveryTracker />
                  <RewardsSection />
                </>
              )}

              {view === "company" && (
                <div className="pt-[72px]">
                  <StandalonePageBar
                    title="Company"
                    subtitle="OHHO Food Ventures · Operator-first QSR brand"
                  />
                  <AboutVentures />
                </div>
              )}

              {view === "menu" && (
                <div className="pt-[72px]">
                  <StandalonePageBar
                    title="Menu"
                    subtitle="Hover any dish for 4× magnifier detail"
                  />
                  <MenuMagnifier />
                </div>
              )}

              {view === "order" && (
                <div className="pt-[72px]">
                  <StandalonePageBar
                    title="Order Online"
                    subtitle="Build your cart, check out, track live"
                  />
                  <OrderingPlatform onRequireAuth={() => openAuth("signup")} />
                </div>
              )}
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
