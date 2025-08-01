// 거리 계산 유틸리티 함수

/**
 * 두 지점 간의 거리를 계산합니다 (Haversine formula)
 * @param {number} lat1 - 시작 지점 위도
 * @param {number} lon1 - 시작 지점 경도
 * @param {number} lat2 - 도착 지점 위도
 * @param {number} lon2 - 도착 지점 경도
 * @returns {number} 거리 (km)
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // 지구 반지름 (km)
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // 소수점 1자리
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

/**
 * 거리를 기반으로 예상 이동 시간을 계산합니다
 * @param {number} distance - 거리 (km)
 * @param {string} mode - 이동 수단 ('car', 'transit', 'walk')
 * @returns {number} 예상 시간 (분)
 */
export function estimateTravelTime(distance, mode = 'car') {
  const speeds = {
    car: 30,     // 시내 평균 30km/h
    transit: 25, // 대중교통 평균 25km/h (대기시간 포함)
    walk: 4      // 도보 평균 4km/h
  };
  
  const speed = speeds[mode] || speeds.car;
  const timeInHours = distance / speed;
  const timeInMinutes = Math.ceil(timeInHours * 60);
  
  return timeInMinutes;
}

/**
 * 거리를 사용자 친화적인 문자열로 변환
 * @param {number} distance - 거리 (km)
 * @returns {string} 표시용 문자열
 */
export function formatDistance(distance) {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  }
  return `${distance}km`;
}

/**
 * 시간을 사용자 친화적인 문자열로 변환
 * @param {number} minutes - 시간 (분)
 * @returns {string} 표시용 문자열
 */
export function formatTravelTime(minutes) {
  if (minutes < 60) {
    return `${minutes}분`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}시간 ${mins}분` : `${hours}시간`;
}

/**
 * 현재 위치 가져오기
 * @returns {Promise<{lat: number, lng: number}>}
 */
export function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('브라우저가 위치 서비스를 지원하지 않습니다.'));
      return;
    }
    
    console.log('Getting current location...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('Position received:', {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        console.error('Geolocation error:', error);
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  });
}

/**
 * 주소를 좌표로 변환 (Kakao API 사용 시)
 * 실제 구현 시에는 Kakao Maps API 키가 필요합니다
 */
export async function geocodeAddress(address) {
  // 임시로 대전 주요 지역의 좌표를 반환
  const locations = {
    '유성구': { lat: 36.3621, lng: 127.3563 },
    '서구': { lat: 36.3546, lng: 127.3835 },
    '중구': { lat: 36.3253, lng: 127.4217 },
    '동구': { lat: 36.3370, lng: 127.4548 },
    '대덕구': { lat: 36.4466, lng: 127.4188 }
  };
  
  for (const [key, coords] of Object.entries(locations)) {
    if (address.includes(key)) {
      return coords;
    }
  }
  
  // 기본값: 대전 시청
  return { lat: 36.3504, lng: 127.3845 };
}

/**
 * 대전 주요 지역 목록
 */
export const DAEJEON_REGIONS = [
  { name: '유성구', lat: 36.3621, lng: 127.3563 },
  { name: '서구', lat: 36.3546, lng: 127.3835 },
  { name: '중구', lat: 36.3253, lng: 127.4217 },
  { name: '동구', lat: 36.3370, lng: 127.4548 },
  { name: '대덕구', lat: 36.4466, lng: 127.4188 }
];

/**
 * 주요 랜드마크 목록 (빠른 선택용)
 */
export const DAEJEON_LANDMARKS = [
  { name: '대전역', address: '대전 동구 중앙로 215', lat: 36.3320, lng: 127.4349 },
  { name: '유성온천역', address: '대전 유성구 온천로 104', lat: 36.3550, lng: 127.3380 },
  { name: '대전시청', address: '대전 서구 둔산로 100', lat: 36.3504, lng: 127.3845 },
  { name: '충남대학교', address: '대전 유성구 대학로 99', lat: 36.3699, lng: 127.3438 },
  { name: 'KAIST', address: '대전 유성구 대학로 291', lat: 36.3721, lng: 127.3604 }
];