const CACHE_NAME = 'haspataal-cache-v1';
const PRECACHE_ASSETS = [
  '/',
  '/logo.svg',
  '/favicon.ico',
  '/forms/opd-triage-v1.json',
  '/manifest.json'
];

// Install Event - Pre-cache essential files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching offline assets');
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event - Serve cached assets when offline, update in background
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // Skip non-GET requests or browser extension requests (chrome-extension://)
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  // Handle static assets & Next.js chunks (Stale-While-Revalidate)
  if (
    requestUrl.pathname.startsWith('/_next/') ||
    requestUrl.pathname.startsWith('/static/') ||
    requestUrl.pathname.startsWith('/forms/') ||
    PRECACHE_ASSETS.includes(requestUrl.pathname)
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          const fetchedResponse = fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse.status === 200) {
                cache.put(event.request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(() => {
              // Ignore network failure when fetching in background
            });

          return cachedResponse || fetchedResponse;
        });
      })
    );
    return;
  }

  // Default: Network-First with Cache Fallback for general routes
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Only cache valid GET responses
        if (networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If offline and request is an HTML page, return a fallback if available
          if (event.request.headers.get('accept').includes('text/html')) {
            return caches.match('/');
          }
          return new Response('Offline: Network connection failed.', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({ 'Content-Type': 'text/plain' })
          });
        });
      })
  );
});
