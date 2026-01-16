import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 1. 파이어베이스 설정
const firebaseConfig = {
    apiKey: "AIzaSyBjzTIUtmGRVPXRy8Qppta1O2C1FjAvmeE",
    authDomain: "dazzle-map-dd970.firebaseapp.com",
    projectId: "dazzle-map-dd970",
    storageBucket: "dazzle-map-dd970.firebasestorage.app",
    messagingSenderId: "786425160276",
    appId: "1:786425160276:web:aa7ba3c32268cf9a3643c1",
    measurementId: "G-DVWDHQVJJL"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// 2. 지도 초기화
export function initMap() {
    return new naver.maps.Map('map', {
        center: new naver.maps.LatLng(35.8693, 128.5955), // 반월당 기준
        zoom: 16,
        zoomControl: false,
        mapTypeControl: false
    });
}

// 🔥 [색상 팔레트] (중복 선언 오류 해결됨!)
const categoryColors = {
    "한식": "#e74c3c",       // 빨강
    "중식": "#f39c12",       // 주황
    "일식": "#3498db",       // 파랑
    "양식": "#2ecc71",       // 초록
    "분식": "#e67e22",       // 당근색
    "고기/구이": "#d35400",  // 진한 주황
    "회/해산물": "#1abc9c",  // 민트
    "아시안": "#16a085",     // 짙은 민트
    "술집": "#9b59b6",       // 보라
    "카페/디저트": "#e056fd",// 핑크
    "빵집": "#fd79a8",       // 연핑크
    "패스트푸드": "#f1c40f", // 노랑
    "포장/배달": "#95a5a6",  // 회색
    "default": "#34495e"     // 기본값 (진한 남색)
};

// 3. 마커 생성 함수 (🔥 불꽃 중앙 상단 배치 적용됨)
export function createMarker(map, shopList, onClick) {
    if (!shopList || shopList.length === 0) return null;

    var mainShop = shopList[0];
    var categoryName = Array.isArray(mainShop.category) ? mainShop.category[0] : (mainShop.category || '맛집');
    var pointColor = categoryColors[categoryName] || categoryColors["default"];

    // 겹친 가게 뱃지
    var badgeHtml = shopList.length > 1 ? `<span class="count-badge" style="background:${pointColor}">+${shopList.length - 1}</span>` : '';

    // 🔥 [디자인 변경] 핫플인지 확인
    var isHot = mainShop.isHot === true;
    
    // 핫플이면 CSS 클래스 추가
    var hotClass = isHot ? 'hot-marker' : '';

    // 🔥 [핵심] 불꽃 아이콘 (CSS로 위치 잡음)
    var fireIconHtml = isHot ? `<div class="hot-fire-crown">🔥</div>` : '';

    var contentHtml = `
        <div class="marker-label ${hotClass}" style="
            border: 2px solid ${pointColor}; 
            will-change: transform; 
            transform: translate(-50%, -100%);">
            
            ${fireIconHtml}

            <span class="overlay-badge" style="color: ${pointColor};">${categoryName}</span>
            <span class="overlay-name">${mainShop.name} ${badgeHtml}</span>
            
            <div style="
                position: absolute; bottom: -8px; left: 50%; transform: translateX(-50%);
                width: 0; height: 0; 
                border-left: 6px solid transparent;
                border-right: 6px solid transparent;
                border-top: 8px solid ${pointColor};">
            </div>
        </div>
    `;

    var marker = new naver.maps.Marker({
        position: new naver.maps.LatLng(mainShop.lat, mainShop.lng),
        map: map,
        icon: {
            content: contentHtml,
            size: new naver.maps.Size(0, 0),
            anchor: new naver.maps.Point(0, 0)
        },
        // 핫플이면 다른 마커보다 무조건 위에 보이게 (Z-index 높임)
        zIndex: isHot ? 9999 : 100 
    });

    if (onClick) {
        naver.maps.Event.addListener(marker, 'click', function(e) {
            onClick(shopList); 
        });
    }

    return marker;
}