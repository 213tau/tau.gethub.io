const CACHE_NAME = 'pwa-fs-cache-v1';
const FILES_TO_CACHE = [
  './',
  './index.html',
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

  if (event.request.method === 'POST' && url.pathname.endsWith('/share-target.html')) {
    event.respondWith(
      (async () => {
        const formData = await event.request.formData();
        const file = formData.get('image');
        const imageUrl = URL.createObjectURL(file);
        return Response.redirect(`/share-target.html?image=${encodeURIComponent(imageUrl)}`, 303);
      })()
    );
  }
});
