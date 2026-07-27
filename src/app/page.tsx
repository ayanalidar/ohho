"use client";

import { useState } from "react";
import { AuthProvider } from "@/components/ohho/AuthProvider";
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

export default function Home() {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [userDashOpen, setUserDashOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  const openAuth = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  return (
    <AuthProvider>
      <main className="min-h-screen bg-ohho-black text-ohho-cream flex flex-col">
        <Nav
          onOpenAuth={openAuth}
          onOpenUserDash={() => setUserDashOpen(true)}
          onOpenAdmin={() => setAdminOpen(true)}
        />
        <HeroSpotlight />
        <AboutVentures />
        <MenuMagnifier />
        <GenreTimeline />
        <VirtualTour3D />
        <OrderingPlatform onRequireAuth={() => openAuth("signup")} />
        <DeliveryTracker />
        <RewardsSection />
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
    </AuthProvider>
  );
}
