self.addEventListener('install', function(event) {
    console.log('Worker: installing v13');
    event.waitUntil(
        caches.open('offline').then(function(cache) {
            fetch('/offline.html').then(function(response) {
                return cache.put('offline.html', response);
            });
        })
    );
});

self.addEventListener('activate', function(event) {
    console.log('Worker: activating v13');
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        fetch(event.request)
        .catch(function(e) {
                console.log('Worker: fetch failed, responding with offline page...');
                var offlinePage = caches.match('offline.html');
                return offlinePage;
        })
    );
});