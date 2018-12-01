---
---

var DYNAMIC_CACHE = 'effyviolet-dynamic-cache-{{ site.time | date: "%s" }}';
var STATIC_CACHE = 'effyviolet-static-cache-{{ site.time | date: "%s" }}';

// listen for outgoing network request
self.addEventListener('fetch', function (event) {
    // try to find response object in the cache
    // associated with current request
    event.respondWith(
        caches.open(STATIC_CACHE).then(function (cache) {
            return cache.match(event.request).then(function (response) {
                if (response) return response;

                return fetch(event.request).catch(console.warn).then(function (networkResponse) {
                    if (!networkResponse || (networkResponse.status !== 200 && !networkResponse.ok)) {
                        return caches.open(DYNAMIC_CACHE).then(function (dynCache) {
                            return dynCache.match(event.request);
                        }).then(function (dynResponse) {
                            if (dynResponse) return dynResponse;
                            else return networkResponse;
                        });
                    }
                    if (event.request.method === 'GET') {
                        var cachedResponse = networkResponse.clone();
                        caches.open(DYNAMIC_CACHE).then(function (dynCache) {
                            dynCache.put(event.request, cachedResponse);
                        });
                    }
                    return networkResponse;
                });
            });
        })
    );
});

self.addEventListener('activate', function (event) {
    console.log('service worker activate');
    var cacheWhitelist = [STATIC_CACHE, DYNAMIC_CACHE];

    event.waitUntil(
        caches.keys().then(function (keyList) {
            return Promise.all(keyList.map(function (key) {
                if (cacheWhitelist.indexOf(key) === -1) {
                    return caches.delete(key);
                }
            }));
        })
    );
});

self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(STATIC_CACHE).then(function (cache) {
            return cache.addAll(
                [
                    {% for page in site.pages %}
                    "{{ page.url }}",{% endfor %}
                    "https://cdn.polyfill.io/v2/polyfill.min.js"
                ]
            );
        })
    );
});

