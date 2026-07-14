const CACHE_NAME = 'genfu-exam-app-v2'
const BASE_PATH = new URL(self.registration.scope).pathname.replace(/\/$/, '')
const scopedPath = path => `${BASE_PATH}${path}`
const APP_SHELL = [scopedPath('/'), scopedPath('/index.html'), scopedPath('/manifest.webmanifest'), scopedPath('/pwa-icon.svg')]

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  )
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  if (request.method !== 'GET' || url.origin !== self.location.origin) {
    return
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match(scopedPath('/index.html')))
    )
    return
  }

  event.respondWith(
    caches.match(request).then(cached => cached || fetch(request))
  )
})
