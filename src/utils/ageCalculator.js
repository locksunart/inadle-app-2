/**
 * 생년월을 기준으로 개월 수와 연령을 계산하는 유틸리티
 */

/**
 * 생년월로부터 현재까지의 개월 수 계산
 * @param {number} birthYear - 출생 연도
 * @param {number} birthMonth - 출생 월
 * @returns {number} - 개월 수
 */
export const calculateMonths = (birthYear, birthMonth) => {
  if (!birthYear || !birthMonth) return 0;
  
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  
  const yearDiff = currentYear - birthYear;
  const monthDiff = currentMonth - birthMonth;
  
  const totalMonths = yearDiff * 12 + monthDiff;
  
  return Math.max(0, totalMonths);
};

/**
 * 개월 수를 기준으로 연령 표시 문자열 생성
 * @param {number} months - 개월 수
 * @returns {string} - 연령 표시 문자열
 */
export const getAgeDisplay = (months) => {
  if (months < 24) {
    return `${months}개월`;
  } else {
    const years = Math.floor(months / 12);
    return `만 ${years}세`;
  }
};

/**
 * 생년월을 기준으로 연령 표시 문자열 생성
 * @param {string} birthDate - 생년-월 (YYYY-MM 형식)
 * @returns {string} - 연령 표시 문자열
 */
export const getAgeFromBirthDate = (birthDate) => {
  if (!birthDate) return '';
  
  const [year, month] = birthDate.split('-').map(Number);
  const months = calculateMonths(year, month);
  return getAgeDisplay(months);
};

/**
 * 개월 수로 연령대 그룹 반환
 * @param {number} months - 개월 수
 * @returns {string} - 연령대 그룹 키
 */
export const getAgeGroup = (months) => {
  if (months <= 12) return '0-12';
  if (months <= 24) return '13-24';
  if (months <= 48) return '25-48';
  if (months <= 72) return '49-72';
  if (months <= 84) return '73-84';
  return '85+';
};

/**
 * 아이들의 연령에서 가장 어린 아이 기준 개월 수 반환
 * @param {Array} children - 아이들 배열
 * @returns {number} - 가장 어린 아이의 개월 수
 */
export const getYoungestChildMonths = (children) => {
  if (!children || children.length === 0) return null;
  
  const monthsArray = children.map(child => 
    calculateMonths(child.birth_year, child.birth_month)
  );
  
  return Math.min(...monthsArray);
};

/**
 * 생년월 유효성 검사
 * @param {number} year - 연도
 * @param {number} month - 월
 * @returns {boolean} - 유효한 년월인지 여부
 */
export const isValidBirthDate = (year, month) => {
  if (!year || !month) return false;
  
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  
  // 미래 년월인지 확인
  if (year > currentYear || (year === currentYear && month > currentMonth)) {
    return false;
  }
  
  // 너무 오래된 년월인지 확인 (20년 전까지만)
  if (year < currentYear - 20) {
    return false;
  }
  
  // 월 범위 확인
  if (month < 1 || month > 12) {
    return false;
  }
  
  return true;
};
