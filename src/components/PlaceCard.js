import React from 'react';
import { FaMapMarkerAlt, FaStar, FaParking, FaBaby, FaCheck, FaCar, FaBlog } from 'react-icons/fa';
import { getAgeDisplay, calculateMonths } from '../utils/ageCalculator';
import { formatDistance, formatTravelTime } from '../utils/locationCalculator';
import './PlaceCard.css';

function PlaceCard({ place, onClick, userProfile }) {
  // 카테고리별 이모지
  const getCategoryEmoji = (category) => {
    const emojis = {
      '도서관': '📚',
      '박물관': '🏛️',
      '미술관': '🎨',
      '과학관': '🔬',
      '체육시설': '⚽',
      '공원': '🌳',
      '카페': '☕',
      '실내놀이터': '🏠'
    };
    return emojis[category] || '📍';
  };

  // 연령별 적합도 가져오기
  const getAgeRecommendation = () => {
    if (!place.place_age_suitability) return null;

    const ageGroups = [
      { key: 'age_0_12_months', label: '0-12개월', order: 0 },
      { key: 'age_13_24_months', label: '1-2세', order: 1 },
      { key: 'age_25_48_months', label: '2-4세', order: 2 },
      { key: 'age_49_72_months', label: '4-6세', order: 3 },
      { key: 'age_73_84_months', label: '6-7세', order: 4 },
      { key: 'age_over_84_months', label: '7세+', order: 5 }
    ];

    // 4점 이상인 연령대만 필터링
    const recommendedAges = ageGroups
      .filter(group => {
        const score = place.place_age_suitability[group.key];
        return score && score >= 4.0;
      })
      .sort((a, b) => a.order - b.order);

    return recommendedAges;
  };

  // 예상 평점 계산
  const getExpectedRating = () => {
    if (!place.place_age_suitability) return 3.5;

    // 자녀 정보가 있으면 해당 연령 기준
    if (userProfile?.user_children && userProfile.user_children.length > 0) {
      let totalRating = 0;
      let count = 0;

      userProfile.user_children.forEach(child => {
        const months = calculateMonths(child.birth_year, child.birth_month);
        let ageKey;

        if (months <= 12) ageKey = 'age_0_12_months';
        else if (months <= 24) ageKey = 'age_13_24_months';
        else if (months <= 48) ageKey = 'age_25_48_months';
        else if (months <= 72) ageKey = 'age_49_72_months';
        else if (months <= 84) ageKey = 'age_73_84_months';
        else ageKey = 'age_over_84_months';

        const rating = place.place_age_suitability[ageKey];
        if (rating) {
          totalRating += rating;
          count++;
        }
      });

      return count > 0 ? (totalRating / count).toFixed(1) : 3.5;
    }

    // 자녀 정보가 없으면 전체 평균
    const ratings = [
      place.place_age_suitability.age_0_12_months,
      place.place_age_suitability.age_13_24_months,
      place.place_age_suitability.age_25_48_months,
      place.place_age_suitability.age_49_72_months,
      place.place_age_suitability.age_73_84_months,
      place.place_age_suitability.age_over_84_months
    ].filter(r => r && r > 0);

    const avg = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
    return avg ? avg.toFixed(1) : 3.5;
  };

  // 부모 에너지 표시
  const getParentEnergyDisplay = () => {
    if (!place.place_filter_scores) return null;
    
    const score = place.place_filter_scores.parent_energy_required;
    if (score >= 4.5) return { text: '매우 편함', color: '#4CAF50' };
    if (score >= 3.5) return { text: '편함', color: '#8BC34A' };
    if (score >= 2.5) return { text: '보통', color: '#FFC107' };
    if (score >= 1.5) return { text: '활동적', color: '#FF9800' };
    return { text: '매우 활동적', color: '#F44336' };
  };

  // 아이 에너지 표시
  const getChildEnergyDisplay = () => {
    if (!place.place_filter_scores) return null;
    
    const score = place.place_filter_scores.child_energy_consumption;
    if (score >= 4.5) return { text: '조용한 활동', emoji: '😌' };
    if (score >= 3.5) return { text: '가벼운 활동', emoji: '🙂' };
    if (score >= 2.5) return { text: '적당한 활동', emoji: '😊' };
    if (score >= 1.5) return { text: '활발한 활동', emoji: '🤸' };
    return { text: '매우 활발', emoji: '🏃' };
  };

  const expectedRating = getExpectedRating();
  const recommendedAges = getAgeRecommendation();
  const parentEnergy = getParentEnergyDisplay();
  const childEnergy = getChildEnergyDisplay();
  const amenities = place.place_amenities;

  return (
    <div className="place-card" onClick={onClick}>
      <div className="place-card-header">
        <div className="place-category">
          <span className="category-emoji">{getCategoryEmoji(place.category)}</span>
          <span className="category-name">{place.category}</span>
        </div>
        <div className="expected-rating">
          <FaStar className="rating-star" />
          <span>{expectedRating}</span>
        </div>
      </div>

      <h3 className="place-name">{place.name}</h3>
      
      <div className="place-location">
        <FaMapMarkerAlt />
        <span>{place.region}</span>
        {place.distance_km && (
          <>
            <span className="dot-separator">·</span>
            <FaCar className="car-icon" />
            <span>{formatTravelTime(place.travel_time_car)}</span>
          </>
        )}
      </div>

      {/* 연령 추천 */}
      {recommendedAges && recommendedAges.length > 0 && (
        <div className="age-recommendation">
          <span className="age-label">추천 연령:</span>
          {recommendedAges.slice(0, 3).map((age, index) => (
            <span key={index} className="age-chip">{age.label}</span>
          ))}
        </div>
      )}

      {/* 에너지 레벨 표시 */}
      <div className="energy-levels">
        {parentEnergy && (
          <div className="energy-item parent-energy">
            <span className="energy-label">부모:</span>
            <span className="energy-value" style={{ color: parentEnergy.color }}>
              {parentEnergy.text}
            </span>
          </div>
        )}
        {childEnergy && (
          <div className="energy-item child-energy">
            <span className="energy-label">아이:</span>
            <span className="energy-value">
              {childEnergy.emoji} {childEnergy.text}
            </span>
          </div>
        )}
      </div>

      {/* 소셜 인사이트 */}
      {place.place_blog_mentions && place.place_blog_mentions.length > 0 && (
        <div className="social-insights">
          <FaBlog className="blog-icon" />
          <span>{place.place_blog_mentions.length}개 블로그 리뷰</span>
        </div>
      )}

      {/* 주요 특징 */}
      {place.place_details?.features && place.place_details.features.length > 0 && (
        <div className="place-features">
          {place.place_details.features.slice(0, 3).map((feature, index) => (
            <span key={index} className="feature-tag">
              <FaCheck size={10} /> {feature}
            </span>
          ))}
        </div>
      )}

      {/* 편의시설 */}
      <div className="place-amenities">
        {amenities?.parking_available && (
          <span className="amenity-icon" title="주차 가능">
            <FaParking />
          </span>
        )}
        {amenities?.nursing_room && (
          <span className="amenity-icon" title="수유실">
            <FaBaby />
          </span>
        )}
        {place.place_details?.is_free && (
          <span className="free-badge">무료</span>
        )}
      </div>
    </div>
  );
}

export default PlaceCard;