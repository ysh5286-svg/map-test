const CACHE_NAME = 'dazzle-map-v2.4'; // 버전 업데이트 시 같이수정 >> index >> navigator.serviceWorker.register('./sw.js?v=2.2') 

const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './common.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  'https://code.jquery.com/jquery-3.7.1.min.js',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap'
];

self.addEventListener('install', (event) => {
  // 🔥 [중요] 대기 중인 서비스 워커를 즉시 활성화하도록 강제함 (skipWaiting)
  self.skipWaiting(); 

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('서비스 워커: 파일 캐싱 시작');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // 네이버 지도, 파이어베이스 등 외부 API는 캐시 제외
  if (url.includes('naver') || 
      url.includes('firestore') || 
      url.includes('googleapis') || 
      url.includes('gstatic')) {
    return; 
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
        // 🔥 [중요] 새 서비스 워커가 즉시 페이지를 제어하도록 설정 (clients.claim)
        return self.clients.claim();
    })
  );
});