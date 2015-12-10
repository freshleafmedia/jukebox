self.addEventListener('install', function(event) {
    console.log('installing v7');
    event.waitUntil(
        caches.open('offline').then(function(cache) {
            return cache.add('offline.html');
        })
    );
});

self.addEventListener('activate', function(event) {
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        fetch(event.request)
        .catch(function(e) {
            caches.open('offline').then(function(cache){
                return cache.match('offline.html');
            });
        })
    );
});