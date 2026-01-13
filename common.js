import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 1. 파이어베이스 설정 (기존과 동일)
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

// 2. 지도 초기화 (기존과 동일)
export function initMap() {
    return new naver.maps.Map('map', {
        center: new naver.maps.LatLng(35.8693, 128.5955), // 반월당 기준
        zoom: 16,
        zoomControl: false,
        mapTypeControl: false
    });
}

// 🔥 [NEW] 업종별 색상 팔레트
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

// 3. 마커 생성 함수 (색상 적용)
export function createMarker(map, shopList, onClick) {
    if (!shopList || shopList.length === 0) return null;

    // 대표 가게 정보
    var mainShop = shopList[0];
    var categoryName = Array.isArray(mainShop.category) ? mainShop.category[0] : (mainShop.category || '맛집');
    
    // 🔥 색상 결정 (팔레트에 없으면 기본값 사용)
    var pointColor = categoryColors[categoryName] || categoryColors["default"];

    // 겹친 가게 뱃지 (+N)
    var badgeHtml = shopList.length > 1 ? `<span class="count-badge" style="background:${pointColor}">+${shopList.length - 1}</span>` : '';

    // 🔥 마커 HTML (테두리와 글자색에 pointColor 적용)
    // hover시 색상 반전 효과를 위해 CSS transition 추가
    var contentHtml = `
        <div class="marker-label" style="border: 2px solid ${pointColor};">
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
            anchor: new naver.maps.Point(0, 0) // 중심점 잡기
        }
    });

if (onClick) {
        naver.maps.Event.addListener(marker, 'click', function(e) {
            onClick(shopList); 
        });
    }

    return marker;
}