const cacheList = ['/', '/img/*', '/manifest.json', '/logo192.png', '/logo512.png', '/favicon.ico', '/static/js/bundle.js']

self.addEventListener('install', function(e){
    e.waitUntil(
        caches.open("snsCache")
        .then(cache => cache.addAll(cacheList))
    )
})

// self.addEventListener('fetch', function(e){
//     if( e.request.method != "POST"){
//         e.respondWith(handleRequest(e.request))    
//     }
// })

const handleRequest = async function(req){
        const cache = await caches.open('snsCache');
        const cacheRes = await cache.match(req);
        if(cacheRes){
            return cacheRes
        }
        const networkRes = await fetch(req);
        cache.put(req, networkRes.clone());
        return networkRes;
}