// OHHO BURGERS service worker — app-shell cache + runtime cache for images/static
const CACHE_VERSION = "ohho-v1";
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const IMG_CACHE = `${CACHE_VERSION}-img`;

const SHELL_ASSETS = [
  "/",
  "/manifest.json",
  "/ohho-images/ohho-logo-full.png",
  "/ohho-images/ohho-logo.png",
  "/ohho-images/favicon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => !k.startsWith(CACHE_VERSION))
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Network-first for HTML navigations (so users always get fresh content),
// cache-first for images and static assets.
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Skip cross-origin requests (e.g. analytics, fonts from CDNs)
  if (url.origin !== self.location.origin) return;

  // Skip Next.js dev HMR / API routes
  if (url.pathname.startsWith("/_next/webpack-hmr")) return;
  if (url.pathname.startsWith("/api/")) return;

  // Navigations → network-first, fallback to cache
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(SHELL_CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((c) => c || caches.match("/")))
    );
    return;
  }

  // Images → cache-first, then network (and cache the response)
  if (req.destination === "image" || url.pathname.startsWith("/ohho-images/")) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(IMG_CACHE).then((c) => c.put(req, copy));
          }
          return res;
        });
      })
    );
    return;
  }

  // Static assets (_next/static, fonts, etc.) → stale-while-revalidate
  if (url.pathname.startsWith("/_next/static/") || req.destination === "style" || req.destination === "script" || req.destination === "font") {
    event.respondWith(
      caches.match(req).then((cached) => {
        const fetchPromise = fetch(req).then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(SHELL_CACHE).then((c) => c.put(req, copy));
          }
          return res;
        }).catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }
});
