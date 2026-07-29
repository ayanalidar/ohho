"use client";

import { useEffect, useState } from "react";

// Types matching the DB models
export type DbMenuItem = {
  id: string;
  slug: string;
  name: string;
  emoji: string;
  description: string;
  ingredients: string[];
  image: string;
  category: string;
  price: number;
  kcal: number;
  prepTime: string;
  spice: number;
  tag: string | null;
  isAddOn: boolean;
  signature: boolean;
  available: boolean;
  sortOrder: number;
};

export type DbTimelineEra = {
  id: string;
  category: string;
  label: string;
  emoji: string;
  color: string;
  tagline: string;
  year: string;
  era: string;
  blurb: string;
  sortOrder: number;
};

export type DbCateringPackage = {
  id: string;
  name: string;
  pax: string;
  price: string;
  items: string[];
  note: string | null;
  color: string;
  sortOrder: number;
  available: boolean;
};

export type DbLocation = {
  id: string;
  slug: string;
  name: string;
  city: string;
  area: string;
  status: string;
  rating: number;
  customers: number;
  deliveryRadiusKm: number;
  prepTimeExtra: string;
  image: string;
  active: boolean;
  _count?: { users: number };
};

// Fallback static data (used while fetching or if API fails)
// This ensures the site never shows empty content
import { menuItems as staticMenu, categories as staticCategories } from "@/data/menu";

export function useMenuItems() {
  const [items, setItems] = useState<DbMenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/menu-items")
      .then(r => r.json())
      .then(d => {
        if (d.items && d.items.length > 0) {
          setItems(d.items);
        } else {
          // Fallback to static data
          setItems(staticMenu as any);
        }
      })
      .catch(() => setItems(staticMenu as any))
      .finally(() => setLoading(false));
  }, []);

  return { items, loading };
}

export function useTimelineEras() {
  const [eras, setEras] = useState<DbTimelineEra[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/timeline")
      .then(r => r.json())
      .then(d => {
        if (d.eras && d.eras.length > 0) {
          setEras(d.eras);
        } else {
          // Fallback to static categories
          setEras(staticCategories.map((c: any) => ({
            id: c.id,
            category: c.id,
            label: c.label,
            emoji: c.emoji,
            color: c.color,
            tagline: c.tagline,
            year: c.year || "2024",
            era: c.era || "Era",
            blurb: c.blurb || "",
            sortOrder: 0,
          })));
        }
      })
      .catch(() => setLoading(false))
      .finally(() => setLoading(false));
  }, []);

  return { eras, loading };
}

export function useCateringPackages() {
  const [packages, setPackages] = useState<DbCateringPackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/catering-packages")
      .then(r => r.json())
      .then(d => {
        if (d.packages && d.packages.length > 0) {
          setPackages(d.packages);
        }
      })
      .catch(() => setLoading(false))
      .finally(() => setLoading(false));
  }, []);

  return { packages, loading };
}

export function useLocations() {
  const [locations, setLocations] = useState<DbLocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/locations")
      .then(r => r.json())
      .then(d => {
        if (d.locations && d.locations.length > 0) {
          setLocations(d.locations.filter((l: DbLocation) => l.active));
        }
      })
      .catch(() => setLoading(false))
      .finally(() => setLoading(false));
  }, []);

  return { locations, loading };
}
