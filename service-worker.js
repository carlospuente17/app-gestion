/**
 * Service Worker para PWA
 * Maneja caché offline y actualizaciones
 */

const CACHE_NAME = 'tasks-app-v1.1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './js/app.js',
  './js/storage.js',
  './js/ui.js',
  './assets/styles/styles.css',
  './assets/images/profile.png',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png'
];

// Instalar el service worker y cachear archivos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache).catch(error => {
          console.warn('Error al cachear algunos archivos:', error);
          // No fallar si no se pueden cachear todos los archivos
          return Promise.resolve();
        });
      })
  );
  self.skipWaiting();
});

// Activar el service worker y limpiar cachés antiguos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Estrategia de caché: Network first, fallback to cache
self.addEventListener('fetch', event => {
  // Solo cachear peticiones GET
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Si la respuesta es válida, guardarla en caché
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(event.request, responseToCache);
          });

        return response;
      })
      .catch(() => {
        // Si falla la red, intentar obtener del caché
        return caches.match(event.request)
          .then(response => {
            return response || caches.match('./index.html');
          });
      })
  );
});
