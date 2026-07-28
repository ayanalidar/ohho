"use client";

import { Phone, Mail, Globe, Instagram, MapPin, Flame } from "lucide-react";
import { contactInfo, testedLocations } from "@/data/menu";
import { useNav } from "@/components/ohho/nav-context";

export function Footer() {
  const { navigate } = useNav();
  return (
    <footer className="relative bg-ohho-black-light border-t border-ohho-gold/15 pt-16 pb-8 grain">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        {/* Top: brand + contact + presence */}
        <div className="grid lg:grid-cols-12 gap-10">
          {/* Brand block */}
          <div className="lg:col-span-4">
            <img
              src="/ohho-images/ohho-logo-full.png"
              alt="OHHO BURGERS — Live Premium"
              className="h-14 w-auto object-contain mb-5"
            />
            <p className="text-sm text-ohho-cream/70 leading-relaxed max-w-md">
              A new-age premium QSR brand by{" "}
              <span className="text-ohho-gold font-semibold">
                OHHO Food Ventures
              </span>
              . From Shamli &amp; Kairana to Pan-India — burgers, pizzas,
              sandwiches &amp; shakes, delivered fresh and tracked live.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-ohho-orange/10 border border-ohho-orange/30 text-ohho-orange text-xs font-semibold uppercase tracking-wider">
              <Flame className="h-3.5 w-3.5" />
              India&apos;s Fastest-Growing Premium QSR Franchise
            </div>
          </div>

          {/* Contact */}
          <div className="lg:col-span-3">
            <div className="text-[10px] uppercase tracking-[0.3em] text-ohho-gold font-semibold mb-4">
              Get in touch
            </div>
            <ul className="space-y-3 text-sm">
              {contactInfo.phones.map((p) => (
                <li key={p}>
                  <a
                    href={`tel:${p.replace(/\s+/g, "")}`}
                    className="flex items-center gap-2 text-ohho-cream/80 hover:text-ohho-gold transition-colors"
                  >
                    <Phone className="h-3.5 w-3.5 text-ohho-orange" />
                    {p}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="flex items-center gap-2 text-ohho-cream/80 hover:text-ohho-gold transition-colors"
                >
                  <Mail className="h-3.5 w-3.5 text-ohho-orange" />
                  {contactInfo.email}
                </a>
              </li>
              <li>
                <a
                  href={`https://${contactInfo.website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-ohho-cream/80 hover:text-ohho-gold transition-colors"
                >
                  <Globe className="h-3.5 w-3.5 text-ohho-orange" />
                  {contactInfo.website}
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com/ohhofoodventures"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-ohho-cream/80 hover:text-ohho-gold transition-colors"
                >
                  <Instagram className="h-3.5 w-3.5 text-ohho-orange" />
                  {contactInfo.instagram}
                </a>
              </li>
              <li className="flex items-start gap-2 text-ohho-cream/80">
                <MapPin className="h-3.5 w-3.5 text-ohho-orange flex-shrink-0 mt-0.5" />
                <span>{contactInfo.origin}</span>
              </li>
            </ul>
          </div>

          {/* Quick links */}
          <div className="lg:col-span-2">
            <div className="text-[10px] uppercase tracking-[0.3em] text-ohho-gold font-semibold mb-4">
              Explore
            </div>
            <ul className="space-y-2 text-sm">
              {[
                ["home", "Home"],
                ["company", "Company"],
                ["menu", "Menu"],
                ["order", "Order Online"],
                ["timeline", "Genre Timeline"],
                ["tour", "3D Tour"],
                ["track", "Track Order"],
                ["rewards", "Rewards"],
              ].map(([target, label]) => (
                <li key={target}>
                  <button
                    onClick={() => navigate(target)}
                    className="text-ohho-cream/70 hover:text-ohho-gold transition-colors text-left"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Presence */}
          <div className="lg:col-span-3">
            <div className="text-[10px] uppercase tracking-[0.3em] text-ohho-gold font-semibold mb-4">
              Tested locations — operational
            </div>
            <ul className="space-y-2 text-sm">
              {testedLocations.map((l) => (
                <li
                  key={l.city}
                  className="flex items-center justify-between text-ohho-cream/70"
                >
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 text-ohho-orange" />
                    {l.city}
                  </span>
                  <span className="text-ohho-cream-dim text-xs">
                    ⭐ {l.rating} · {l.customers.toLocaleString()}+ served
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 text-xs text-ohho-cream-dim">
              2 carts live · 10,000+ happy customers · 80% retention.
            </div>
          </div>
        </div>

        {/* Middle: careers / franchise strip */}
        <div className="mt-12 pt-8 border-t border-ohho-gold/10 grid sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl glass-card">
            <div className="font-display text-lg text-ohho-cream">Franchise</div>
            <div className="text-xs text-ohho-cream-dim mt-1">
              ₹1.5–3.5L fee · 4–8% royalty · 50–150 sq. ft. · 45-day setup
            </div>
            <button
              onClick={() => navigate("company")}
              className="mt-2 inline-flex text-xs text-ohho-gold hover:underline"
            >
              Become a Franchisee →
            </button>
          </div>
          <div className="p-4 rounded-xl glass-card">
            <div className="font-display text-lg text-ohho-cream">Careers</div>
            <div className="text-xs text-ohho-cream-dim mt-1">
              Head Chef · Kitchen Helper · Delivery Executive
            </div>
            <a
              href="mailto:sales@ohhofoods.com"
              className="mt-2 inline-flex text-xs text-ohho-gold hover:underline"
            >
              Apply now →
            </a>
          </div>
          <div className="p-4 rounded-xl glass-card">
            <div className="font-display text-lg text-ohho-cream">Support</div>
            <div className="text-xs text-ohho-cream-dim mt-1">
              24/7 · We respond within 24 hours
            </div>
            <a
              href="tel:+917006712347"
              className="mt-2 inline-flex text-xs text-ohho-gold hover:underline"
            >
              Call us →
            </a>
          </div>
        </div>

        {/* Bottom: copyright */}
        <div className="mt-10 pt-6 border-t border-ohho-gold/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ohho-cream-dim">
          <div>
            © 2025 OHHO Food Ventures · OHHO Burgers · All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span>Data sourced from www.ohhofoods.com</span>
            <span>·</span>
            <span>Live Premium.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
