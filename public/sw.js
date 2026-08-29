// Lightweight Service Worker for Smart Typing Pro
const CACHE_NAME = 'smarttypingpro-v1';

// Static assets to pre-cache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  '/robots.txt',
  '/sitemap.xml'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[SW] Pre-caching non-fatal asset issue:', err);
      });
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Network-first strategy for navigation and HTML, stale-while-revalidate for static assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-GET requests or chrome-extension/external API schemes
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // Bypass Google Analytics and external tracker calls from SW caching
  if (url.hostname.includes('google-analytics') || url.hostname.includes('googletagmanager')) {
    return;
  }

  // Navigation requests (HTML pages) -> Network first with cache fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) return cachedResponse;
          const rootCached = await caches.match('/');
          if (rootCached) return rootCached;
          return new Response('Offline - Smart Typing Pro is cached for practice.', {
            headers: { 'Content-Type': 'text/plain' }
          });
        })
    );
    return;
  }

  // Static assets (CSS, JS, Fonts, Images, SVG) -> Stale-while-revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => {
          // If offline and not in cache, fallback gracefully
          return cachedResponse;
        });

      return cachedResponse || fetchPromise;
    })
  );
});
