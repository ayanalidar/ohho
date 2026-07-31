"use client";

import { useEffect, useState } from "react";
import { useInitData } from "@/hooks/use-init-data";

// These hooks now use the batched /api/init endpoint instead of individual API calls.
// This reduces DB connections from 6+ to 1 on initial page load.

export function useMenuItems() {
  const data = useInitData();
  const items = data?.menuItems || [];
  return { items, loading: !data };
}

export function useTimelineEras() {
  const data = useInitData();
  const eras = data?.timelineEras || [];
  return { eras, loading: !data };
}

export function useCateringPackages() {
  const data = useInitData();
  const packages = data?.cateringPackages || [];
  return { packages, loading: !data };
}

export function useLocations() {
  const data = useInitData();
  const locations = (data?.locations || []).filter((l: any) => l.active);
  return { locations, loading: !data };
}
