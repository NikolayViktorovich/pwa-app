const CACHE_NAME = 'kaban-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://telegram.org/js/telegram-web-app.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener('fetch', (e) => {
  e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
});