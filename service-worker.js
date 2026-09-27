// Network first with a cache fallback, so deploys reach installed phones on their
// next open. Bumping CACHE_NAME is only needed to purge the offline cache (e.g. an
// asset was removed), not to ship an ordinary change.
const CACHE_NAME = "simple-tip-v10";
const NETWORK_TIMEOUT_MS = 2000;
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./calc.js",
  "./manifest.webmanifest",
  "./icons/icon.svg",
  "./icons/portfolio-favicon.png",
];

self.addEventListener("install", (event) => {
  // cache: "reload" skips the HTTP cache so a new version never precaches stale files.
  const requests = ASSETS.map((url) => new Request(url, { cache: "reload" }));
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(requests))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  // Leave cross-origin requests (e.g. the about sheet favicon) to the browser.
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;

  // cache: "no-cache" revalidates against GitHub Pages' 10 minute max-age, so a
  // fresh deploy is picked up right away (unchanged files come back as a cheap 304).
  const network = fetch(request, { cache: "no-cache" });

  // Keep the offline copy current. This is attached before the response is handed
  // to the page, so the clone happens while the body is still unread.
  event.waitUntil(
    network
      .then((response) => {
        if (!response.ok) return;
        const copy = response.clone();
        return caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
      })
      .catch(() => {})
  );

  event.respondWith(networkWithTimeout(request, network));
});

// Network first, but a weak signal must not stall the app at the table: after
// NETWORK_TIMEOUT_MS the cached copy wins if there is one.
function networkWithTimeout(request, network) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      fromCache(request).then((cached) => cached && resolve(cached));
    }, NETWORK_TIMEOUT_MS);

    network.then(
      (response) => {
        clearTimeout(timer);
        resolve(response);
      },
      () => {
        clearTimeout(timer);
        fromCache(request).then((cached) => resolve(cached || Response.error()));
      }
    );
  });
}

function fromCache(request) {
  return caches
    .match(request)
    .then((cached) => cached || (request.mode === "navigate" ? caches.match("./index.html") : undefined));
}
