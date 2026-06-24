const CACHE_NAME = 'framework-boilerplate-v2.2';
const REPO_NAME = '/Boilerplate';

const ASSETS = [
  `${REPO_NAME}/`,
  `${REPO_NAME}/index.html`,
  `${REPO_NAME}/manifest.json`
];

// Install event
self.addEventListener('install', (event) => {
  self.skipWaiting(); 
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
});

// Fetch event: STRICT SCOPED NETWORK FIRST with immediate cache fallback
self.addEventListener('fetch', (event) => {
  const requestUrl = event.request.url;

  // Strict local boundary check: Origin matching AND explicit namespace isolation
  if (requestUrl.includes(self.location.origin) && requestUrl.includes(REPO_NAME)) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request).then((response) => {
          // Fall back to specific namespaced index if individual asset is missing offline
          return response || caches.match(`${REPO_NAME}/index.html`);
        });
      })
    );
  }
});
