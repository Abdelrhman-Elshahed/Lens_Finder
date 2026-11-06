/* ELSHAHED Optics service worker.
   Change the version number below whenever you replace the logo or icon,
   so phones download the new files. index.html updates by itself when online. */
var CACHE = 'elshahed-v1';
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

  /* opening the app: try the network first (so updates arrive), fall back to the saved copy offline */
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(function (res) {
        if (res && res.ok) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put('index.html', copy); }); }
        return res;
      }).catch(function () { return caches.match('index.html'); })
    );
    return;
  }

  /* everything else (logo, icon, manifest): saved copy first */
  e.respondWith(
    caches.match(req).then(function (hit) {
      return hit || fetch(req).then(function (res) {
        if (res && res.ok) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); }
        return res;
      });
    })
  );
});
