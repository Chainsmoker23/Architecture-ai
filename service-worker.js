
// A simple, no-op service worker that exists to make the app installable.
self.addEventListener('install', (event) => {
  // console.log('Service Worker: Installing...');
});

self.addEventListener('fetch', (event) => {
  // This service worker doesn't intercept any fetches.
  // It's just here to meet the PWA installability criteria.
  return;
});
