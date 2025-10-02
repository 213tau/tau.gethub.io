const CACHE_NAME = 'pwa-fs-cache-v1';
const FILES_TO_CACHE = [
  './',
  './index.html',
  './share-target.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) =>
      Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Handle share-target POST
  if (event.request.method === 'POST' && url.pathname.endsWith('/share-target.html')) {
    event.respondWith(
      (async () => {
        const formData = await event.request.formData();
        const file = formData.get('image');
        const imageUrl = URL.createObjectURL(file);
        return Response.redirect(`/share-target.html?image=${encodeURIComponent(imageUrl)}`, 303);
      })()
    );
    return;
  }

  // Handle GET requests: use cache first, fallback to network
  if (event.request.method === 'GET') {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        return cachedResponse || fetch(event.request).then(response => {
          // Optionally cache new responses
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, response.clone());
            return response;
          });
        }).catch(() => {
          // Optional: fallback to index.html if offline
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
      })
    );
  }
});



