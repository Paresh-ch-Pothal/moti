/* ============================================================
   Divine Motivation — Service Worker
   Caches the app shell + background images for offline use.
   Strategy:
     - App shell (HTML, CSS, JS, manifest, icons): cache-first
     - Background images: stale-while-revalidate
     - Fonts (Google): network-first, fallback to cache
   ============================================================ */

const VERSION = 'divine-motivation-v1.0.0';
const SHELL_CACHE = `${VERSION}-shell`;
const IMG_CACHE = `${VERSION}-images`;
const FONT_CACHE = `${VERSION}-fonts`;

// App shell — core files (relative to sw scope)
const APP_SHELL = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-192.png',
  './icons/maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon.ico',
  // Background images
  './images/krishna-flute.jpg',
  './images/krishna-aura.jpg',
  './images/krishna-crown.jpg',
  './images/krishna-peacock.jpg',
  './images/shiva-meditation.jpg',
  './images/shiva-himalaya.jpg',
  './images/shiva-trident.jpg',
  './images/shiva-kailash.jpg'
];

// Google Fonts CSS + font files (cached on first request)
const FONT_PATTERN = /^https:\/\/fonts\.(googleapis|gstatic)\.com\//;

/* ---------- Install: pre-cache shell ---------- */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
      .catch((err) => console.warn('SW install partial failure:', err))
  );
});

/* ---------- Activate: clean old caches ---------- */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => ![SHELL_CACHE, IMG_CACHE, FONT_CACHE].includes(key))
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

/* ---------- Fetch: routing ---------- */
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Only handle GET
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Skip cross-origin non-font requests (let browser handle)
  if (url.origin !== self.location.origin && !FONT_PATTERN.test(req.url)) {
    return;
  }

  // Google Fonts: network-first (so updated CSS/font files are picked up),
  // fallback to cache when offline.
  if (FONT_PATTERN.test(req.url)) {
    event.respondWith(networkFirst(req, FONT_CACHE));
    return;
  }

  // Background images: stale-while-revalidate
  if (url.pathname.startsWith('/images/') || url.pathname.includes('/images/')) {
    event.respondWith(staleWhileRevalidate(req, IMG_CACHE));
    return;
  }

  // Icons
  if (url.pathname.startsWith('/icons/')) {
    event.respondWith(cacheFirst(req, SHELL_CACHE));
    return;
  }

  // App shell (HTML, CSS, JS, manifest): cache-first with network fallback
  // For navigation requests, fall back to cached index.html when offline.
  if (req.mode === 'navigate') {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).catch(() => caches.match('./index.html'));
      })
    );
    return;
  }

  // Default same-origin GETs: cache-first
  event.respondWith(cacheFirst(req, SHELL_CACHE));
});

/* ---------- Strategies ---------- */
async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  if (cached) return cached;
  try {
    const res = await fetch(req);
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  } catch (err) {
    // No cache, no network — last resort: empty response
    return new Response('', { status: 504, statusText: 'Offline' });
  }
}

async function networkFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const res = await fetch(req);
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  } catch (err) {
    const cached = await cache.match(req);
    if (cached) return cached;
    throw err;
  }
}

async function staleWhileRevalidate(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  const fetchPromise = fetch(req)
    .then((res) => {
      if (res && res.ok) cache.put(req, res.clone());
      return res;
    })
    .catch(() => cached);
  return cached || fetchPromise;
}

/* ---------- Allow page to trigger skipWaiting ---------- */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
