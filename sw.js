/* ELSHAHED Optics service worker.
   Everything is loaded from the network first, so changes (including the app name
   in manifest.webmanifest) arrive as soon as the phone is online.
   The saved copy is only used when there is no internet. */
var CACHE = 'elshahed-v2';
var FILES = ['./', 'index.html', 'manifest.webmanifest', 'elshahed_icon.png', 'elshahed_logo2.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (c) { return c.addAll(FILES); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== self.location.origin) return;

  e.respondWith(
    fetch(req, { cache: 'no-cache' }).then(function (res) {
      if (res && res.ok) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req.mode === 'navigate' ? 'index.html' : req, copy); });
      }
      return res;
    }).catch(function () {
      return caches.match(req.mode === 'navigate' ? 'index.html' : req);
    })
  );
});
