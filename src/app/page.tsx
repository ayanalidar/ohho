import { Nav } from "@/components/ohho/Nav";
import { HeroSpotlight } from "@/components/ohho/HeroSpotlight";
import { AboutVentures } from "@/components/ohho/AboutVentures";
import { MenuMagnifier } from "@/components/ohho/MenuMagnifier";
import { GenreTimeline } from "@/components/ohho/GenreTimeline";
import { VirtualTour3D } from "@/components/ohho/VirtualTour3D";
import { OrderingPlatform } from "@/components/ohho/OrderingPlatform";
import { DeliveryTracker } from "@/components/ohho/DeliveryTracker";
import { AudioGuide } from "@/components/ohho/AudioGuide";
import { Footer } from "@/components/ohho/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-ohho-black text-ohho-cream flex flex-col">
      <Nav />
      <HeroSpotlight />
      <AboutVentures />
      <MenuMagnifier />
      <GenreTimeline />
      <VirtualTour3D />
      <OrderingPlatform />
      <DeliveryTracker />
      <AudioGuide />
      <Footer />
    </main>
  );
}
