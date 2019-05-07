const CACHE_NAME = 'my-site-cache-v2';
const urlsToCache = [
  'index.html',
  'manifest.webmanifest',
  './js/drawings.js',
  './js/N-spa.js',
  './js/directions.js',
  './js/map.js',
  './assets/img/icon/64.png',
  './assets/img/icon/128.png',
  './assets/img/icon/192.png',
  './assets/img/icon/256.png',
  './assets/img/icon/512.png',
  './assets/img/icon/1024.png'
];

self.addEventListener('install', function(event) {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
      caches.match(event.request)
        .then(function(response) {
          // Cache hit - return response
          if (response) {
            return response;
          }
          return fetch(event.request);
        }
      )
    );
  });
