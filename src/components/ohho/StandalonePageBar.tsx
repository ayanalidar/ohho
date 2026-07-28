"use client";

import { ArrowLeft, Home } from "lucide-react";
import { useNav } from "@/components/ohho/nav-context";

export function StandalonePageBar({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const { navigate } = useNav();
  return (
    <div className="sticky top-[64px] z-30 bg-ohho-black-light/90 backdrop-blur-md border-b border-ohho-gold/15">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        <button
          onClick={() => navigate("home")}
          className="inline-flex items-center gap-1.5 text-sm text-ohho-cream-dim hover:text-ohho-gold transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          Home
        </button>
        <div className="text-center min-w-0">
          <div className="font-display text-lg sm:text-xl text-ohho-cream leading-none">
            {title}
          </div>
          {subtitle && (
            <div className="text-[11px] text-ohho-cream-dim mt-0.5 truncate hidden sm:block">
              {subtitle}
            </div>
          )}
        </div>
        <div className="w-16 flex justify-end">
          <button
            onClick={() => navigate("home")}
            aria-label="Home"
            className="h-8 w-8 grid place-items-center rounded-md text-ohho-cream-dim hover:text-ohho-gold hover:bg-ohho-orange/10"
          >
            <Home className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
