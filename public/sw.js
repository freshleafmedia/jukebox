const CACHE_NAME = 'jukebox-offline-v1';
const OFFLINE_URL = '/offline.html';
const OFFLINE_ASSETS = [
    OFFLINE_URL,
    '/assets/images/jukebox.png',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_ASSETS)),
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => Promise.all(
            keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)),
        )),
    );
});

self.addEventListener('fetch', (event) => {
    const isNavigation = event.request.mode === 'navigate';
    const isOfflineAsset = OFFLINE_ASSETS.includes(new URL(event.request.url).pathname);

    if (!isNavigation && !isOfflineAsset) {
        return;
    }

    event.respondWith(
        fetch(event.request).catch(() => caches.match(isNavigation ? OFFLINE_URL : event.request)),
    );
});
