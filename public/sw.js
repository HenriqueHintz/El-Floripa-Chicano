// El Chicano PWA Service Worker v1.0.0
// High-performance caching strategy:
// - Cache-First for static font assets (woff2/ttf)
// - Stale-While-Revalidate for Google Fonts and local static assets
// - Network-First for HTML page navigation
// - Network-Only for dynamic /api/ routes (Cloudflare Workers & D1)

const CACHE_NAME = 'elchicano-pwa-v1';

const STATIC_PRECACHE = [
  '/',
  '/favicon.svg',
  '/favicon-32x32.png',
  '/icon-192.png',
  '/icon-512.png',
  '/site.webmanifest',
  '/images/logos/hero.webp',
  '/images/logos/hero-mobile.webp'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_PRECACHE).catch(() => {
          // Graceful fallback: individual missing files do not break SW installation
        });
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // 1. Bypass API endpoints, non-GET methods, and admin actions (Network-Only)
  if (
    request.method !== 'GET' ||
    url.pathname.startsWith('/api/') ||
    url.origin.includes('workers.dev')
  ) {
    return;
  }

  // 2. Google Fonts & Static Font Files (Stale-While-Revalidate)
  if (url.origin.includes('fonts.googleapis.com') || url.origin.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          const fetchPromise = fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                cache.put(request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(() => cachedResponse);

          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // 3. Navigation requests (HTML document) - Network-First with offline cache fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => cached || caches.match('/'));
        })
    );
    return;
  }

  // 4. Static Local Assets (Images, Icons, CSS/JS chunks) - Stale-While-Revalidate
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const clone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
  }
});
