"use client";

import { useEffect, useState } from "react";

// Cache the init data so all components share one fetch
let initCache: any = null;
let initPromise: Promise<any> | null = null;

export function useInitData() {
  const [data, setData] = useState<any>(initCache || {});

  useEffect(() => {
    if (initCache) return;
    if (!initPromise) {
      initPromise = fetch("/api/init")
        .then(r => r.json())
        .then(d => {
          initCache = d;
          return d;
        })
        .catch(() => ({}));
    }
    initPromise.then(d => setData(d));
  }, []);

  return { data };
}

export function refreshInitCache() {
  initCache = null;
  initPromise = null;
}
