"use client";

import { useEffect, useState } from "react";

// Cache the content fetch so all components share one request
let contentCache: Record<string, string> | null = null;
let fetchPromise: Promise<Record<string, string>> | null = null;

async function fetchContent(): Promise<Record<string, string>> {
  if (contentCache) return contentCache;
  if (fetchPromise) return fetchPromise;
  fetchPromise = fetch("/api/site-content")
    .then(r => r.json())
    .then(d => {
      contentCache = d.content || {};
      return contentCache;
    })
    .catch(() => ({}));
  return fetchPromise;
}

export function useSiteContent() {
  const [content, setContent] = useState<Record<string, string>>(contentCache || {});

  useEffect(() => {
    if (contentCache) return;
    fetchContent().then(c => setContent(c));
  }, []);

  // Helper: get value by key, fallback to default
  const get = (key: string, fallback: string): string => {
    return content[key] ?? fallback;
  };

  return { content, get };
}

// Admin: refresh cache after edits
export function refreshContentCache() {
  contentCache = null;
  fetchPromise = null;
}
