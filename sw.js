const CACHE_NAME = 'dazzle-map-v1.6'; // 버전 조금 올림 (새로 적용되라고)

// 🔥 캐시할 파일 목록 (외부 라이브러리도 포함해야 빨라짐)
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './common.js',
  './manifest.json',
  './icon-192.png',  // 🔥 추가됨
  './icon-512.png',  // 🔥 추가됨
  'https://code.jquery.com/jquery-3.7.1.min.js',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap'
];

// 1. 설치: 파일들을 미리 다운받아 저장
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('서비스 워커: 파일 캐싱 시작');
        return cache.addAll(urlsToCache);
      })
  );
});

// 2. 요청 처리 (핵심 로직 변경)
self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // ⛔️ 지도 API, 파이어베이스 DB 데이터는 캐시 금지 (항상 실시간)
  if (url.includes('naver') || 
      url.includes('firestore') || 
      url.includes('googleapis') || 
      url.includes('gstatic')) {
    return; // 그냥 네트워크로 가라 (이벤트 종료)
  }

  // ✅ 나머지는 캐시 우선 (Cache First)
  // "저장된 거 있으면 바로 보여주고, 없으면 그때 인터넷 써라"
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 캐시에 있으면 그거 리턴, 없으면 네트워크 요청
        return response || fetch(event.request);
      })
  );
});

// 3. 활성화: 구버전 캐시 청소
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
    })
  );
});