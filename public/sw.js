/*
 * AccentAI Service Worker
 * - Pre-caches the app shell for offline use
 * - Network-first for navigation requests (fresh HTML when online, cache when offline)
 * - Cache-first for static assets (icons, fonts, images)
 * - Stale-while-revalidate for Next.js static chunks
 *
 * Installed as /sw.js (root scope). Registered client-side from the app shell.
 */

const VERSION = "accentai-v1";
const APP_SHELL_CACHE = `${VERSION}-shell`;
const STATIC_CACHE = `${VERSION}-static`;
const RUNTIME_CACHE = `${VERSION}-runtime`;

// Minimal app shell — the HTML document. Next.js chunks are cached on demand.
const APP_SHELL = ["/", "/manifest.webmanifest", "/offline"];

// Assets that match these patterns are static and safe to cache-first.
const STATIC_PATTERNS = [
  /\/icons\//,
  /\/_next\/static\//,
  /\/_next\/image\?url=/,
  /\/vowels\//,
  /\/fonts\.googleapis\.com/,
  /\/fonts\.gstatic\.com/,
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(APP_SHELL_CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
      .catch(() => {
        // If pre-cache fails (e.g. /offline not present), don't block install.
      })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !key.startsWith(VERSION))
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle GET requests.
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Same-origin only — let cross-origin (analytics, etc.) pass through.
  if (url.origin !== self.location.origin) return;

  // Navigation requests: network-first, fall back to cached shell when offline.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(APP_SHELL_CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() =>
          caches
            .match(request)
            .then((cached) => cached || caches.match("/"))
        )
    );
    return;
  }

  // Static assets: cache-first.
  if (STATIC_PATTERNS.some((re) => re.test(url.pathname))) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            const copy = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
            return response;
          })
      )
    );
    return;
  }

  // Everything else (Next.js chunks, API): stale-while-revalidate.
  event.respondWith(
    caches.open(RUNTIME_CACHE).then((cache) =>
      cache.match(request).then((cached) => {
        const network = fetch(request)
          .then((response) => {
            // Only cache successful, same-origin responses.
            if (response && response.status === 200 && response.type === "basic") {
              cache.put(request, response.clone());
            }
            return response;
          })
          .catch(() => cached);
        return cached || network;
      })
    )
  );
});
