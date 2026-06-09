// Force update: change this version number every time you deploy
const CACHE_VERSION = 'fintrack-v3';
const BASE = '/Fintrack';

self.addEventListener('install', () => {
  // Skip waiting immediately — don't hold onto old SW
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  // Delete ALL old caches on activate
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Network first — always try to get fresh from server
  // Fall back to cache ONLY if truly offline
  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Save a fresh copy in cache
        const clone = res.clone();
        caches.open(CACHE_VERSION).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
