const CACHE_NAME = 'yc-universal-shell-v2';
const scopeUrl = self.registration.scope;
const TAILWIND_CDN = 'https://cdn.tailwindcss.com';
const APP_SHELL = [
  new URL('./', scopeUrl).href,
  new URL('./index.html', scopeUrl).href,
  new URL('./manifest.json', scopeUrl).href,
  new URL('./icons/icon-192.svg', scopeUrl).href,
  new URL('./icons/icon-512.svg', scopeUrl).href,
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(APP_SHELL);
    // Tailwind is loaded from its CDN by index.html; cache its opaque script
    // response after the first online install so the UI can render offline.
    try {
      const response = await fetch(new Request(TAILWIND_CDN, { mode: 'no-cors' }));
      await cache.put(TAILWIND_CDN, response);
    } catch (error) {
      console.warn('[YC Universal] Tailwind CDN could not be cached:', error);
    }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;
  if (url.pathname.includes('/api-proxy') || url.pathname.includes('/ws-proxy')) return;

  if (url.href === TAILWIND_CDN) {
    event.respondWith(
      caches.match(TAILWIND_CDN).then((cached) => cached || fetch(request).then((response) => {
        caches.open(CACHE_NAME).then((cache) => cache.put(TAILWIND_CDN, response.clone()));
        return response;
      }))
    );
    return;
  }

  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(async () => (await caches.match(request)) || caches.match(new URL('./', scopeUrl).href))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});
