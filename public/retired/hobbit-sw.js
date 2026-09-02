const TARGET_ORIGIN = "https://limited.orfeasa.com";

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.mode !== "navigate") return;
  const source = new URL(event.request.url);
  event.respondWith(Response.redirect(`${TARGET_ORIGIN}${source.pathname}${source.search}`, 302));
});
