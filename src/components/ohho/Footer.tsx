"use client";

import { Phone, Mail, Globe, Instagram, MapPin, Flame } from "lucide-react";
import { contactInfo, presenceHubs } from "@/data/menu";

export function Footer() {
  return (
    <footer className="relative bg-ohho-black-light border-t border-ohho-gold/15 pt-16 pb-8 grain">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        {/* Top: brand + contact + presence */}
        <div className="grid lg:grid-cols-12 gap-10">
          {/* Brand block */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-md bg-gradient-to-br from-ohho-orange to-ohho-red grid place-items-center font-display text-ohho-black text-2xl leading-none">
                O
              </div>
              <div className="leading-none">
                <div className="font-display text-2xl tracking-wider text-ohho-cream">
                  OHHO BURGERS
                </div>
                <div className="text-[10px] tracking-[0.35em] text-ohho-gold/80 uppercase mt-0.5">
                  Live Premium
                </div>
              </div>
            </div>
            <p className="mt-5 text-sm text-ohho-cream/70 leading-relaxed max-w-md">
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
                ["#hero", "Home"],
                ["#about", "OHHO Food Ventures"],
                ["#menu", "Menu"],
                ["#timeline", "Genre Timeline"],
                ["#tour", "3D Tour"],
                ["#order", "Order Online"],
                ["#track", "Track Order"],
                ["#audio", "Audio Guide"],
              ].map(([href, label]) => (
                <li key={href}>
                  <a
                    href={href}
                    className="text-ohho-cream/70 hover:text-ohho-gold transition-colors"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Presence */}
          <div className="lg:col-span-3">
            <div className="text-[10px] uppercase tracking-[0.3em] text-ohho-gold font-semibold mb-4">
              Presence — 48+ outlets
            </div>
            <ul className="space-y-2 text-sm">
              {presenceHubs.slice(0, 6).map((h) => (
                <li
                  key={h.city}
                  className="flex items-center justify-between text-ohho-cream/70"
                >
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 text-ohho-orange" />
                    {h.city}
                  </span>
                  <span className="text-ohho-cream-dim text-xs">
                    {h.outlets} outlets · ⭐ {h.rating}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 text-xs text-ohho-cream-dim">
              Plus Shamli, Kairana &amp; 12 more cities.
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
            <a
              href="#about"
              className="mt-2 inline-flex text-xs text-ohho-gold hover:underline"
            >
              Become a Franchisee →
            </a>
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
