// Halcyon Row service worker: makes the game playable offline.
// Story mode needs no network at all. AI calls are never cached or intercepted.
// Portrait refresh, September 2026: reinstall so existing players get the new art.

const PREFIX = 'halcyon-';
const DEV_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    let files = ['./', 'index.html'];
    let version = 'fallback';
    try {
      const res = await fetch('precache.json', { cache: 'no-store' });
      if (res.ok) ({ files, version } = await res.json());
    } catch { /* first run offline is not possible anyway; use the fallback list */ }
    const cache = await caches.open(PREFIX + version);
    await cache.addAll(files.map((f) => new Request(f, { cache: 'reload' })));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // The newest cache is whichever one holds index.html most recently added.
    const names = (await caches.keys()).filter((n) => n.startsWith(PREFIX));
    let newest = null;
    try {
      const res = await fetch('precache.json', { cache: 'no-store' });
      if (res.ok) newest = PREFIX + (await res.json()).version;
    } catch { /* offline: keep everything */ }
    if (newest) await Promise.all(names.filter((n) => n !== newest).map((n) => caches.delete(n)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;       // AI providers and anything else: straight to network
  if (url.pathname.includes('/api/')) return;            // local AI proxy: never cache
  if (DEV_HOSTS.has(url.hostname)) {
    // Local development: always try the network so edits show up.
    event.respondWith(fetch(req).catch(() => caches.match(req, { ignoreSearch: true })));
    return;
  }
  event.respondWith((async () => {
    const hit = await caches.match(req, { ignoreSearch: true });
    if (hit) return hit;
    try {
      return await fetch(req);
    } catch {
      if (req.mode === 'navigate') return (await caches.match('index.html')) || Response.error();
      return Response.error();
    }
  })());
});
