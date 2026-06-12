const CACHE_NAME = "vocab-app-v1";

const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./css/app.css",
  "./icons/icon-180.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./js/app.js",
  "./js/audio.js",
  "./js/store.js",
  "./js/srs.js",
  "./js/ui.js",
  "./js/data/words-cet4.js",
  "./js/data/words-cet6.js",
  "./js/data/words-ielts.js",
  "./js/pages/home.js",
  "./js/pages/study.js",
  "./js/pages/quiz.js",
  "./js/pages/wordbook.js",
  "./js/pages/word-detail.js",
  "./js/pages/profile.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request).catch(() => {
        if (event.request.mode === "navigate") {
          return caches.match("./index.html");
        }
        return Response.error();
      });
    })
  );
});
