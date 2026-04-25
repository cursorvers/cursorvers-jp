// Service Worker for Cursorvers.edu PWA (hosted at cursorvers.jp)
const CACHE_NAME = 'cursorvers-jp-v1';
const urlsToCache = [
  './',
  './index.html',
  './services.html',
  './community.html',
  './icon-192.png',
  './icon-512.png',
  './icon-180.png',
  './icon-152.png',
  './icon-120.png',
  './icon-76.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  // Bypass SW cache for /tools/* (GuideScope SPA uses hashed assets, self-versioning)
  if (url.pathname.startsWith('/tools/')) {
    return;
  }
  // Bypass SW cache for video/audio assets (iOS Safari AVPlayer is path-keyed; double-caching breaks file rename hot-swap).
  // See media-asset-policy lint R3 and .claude/CLAUDE.md "メディア資産デプロイ — iOS Safari cache 落とし穴".
  if (/\.(mp4|webm|mov|m4v|ogv|m4a|mp3)$/i.test(url.pathname)) {
    return;
  }
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        return fetch(event.request).then((response) => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
  );
});
