import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaFilter, FaMapMarkerAlt, FaTimes } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { dbHelpers } from '../services/supabase';
import { getAgeFromBirthDate } from '../utils/ageCalculator';
import { formatDistance, formatTravelTime } from '../utils/locationCalculator';
import PlaceCard from '../components/PlaceCard';
import LocationSetModal from '../components/LocationSetModal';
import './Home.css';

function Home() {
  const { user, userProfile, updateProfile } = useAuth();
  const navigate = useNavigate();
  
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEnergy, setSelectedEnergy] = useState('보통');
  const [selectedCondition, setSelectedCondition] = useState('보통');
  const [showDetailFilter, setShowDetailFilter] = useState(false);
  
  console.log('Home render:', { loading, placesCount: places.length });
  
  // 상세 필터 상태
  const [filters, setFilters] = useState({
    environment: '모두',
    parking: '상관없음',
    travelTime: '30분 이내', // 문자열로 변경
    cost: '상관없음'
  });
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [hasLocation, setHasLocation] = useState(false);

  useEffect(() => {
    const checkLocation = async () => {
      if (userProfile?.home_lat && userProfile?.home_lng) {
        setHasLocation(true);
      }
    };
    
    checkLocation();
  }, [userProfile]); // userProfile 변경 시 재확인

  useEffect(() => {
    loadPlaces();
  }, [selectedEnergy, selectedCondition, hasLocation, filters.travelTime]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadPlaces = async () => {
    try {
      console.log('Loading places...', { hasLocation, user });
      setLoading(true);
      let data;
      
      // 위치 정보가 있으면 거리 기반으로 가져오기
      if (hasLocation && user) {
        console.log('Loading with distance');
        // 시간 필터를 숫자로 변환
        let maxTime = null;
        if (filters.travelTime === '10분 이내') maxTime = 10;
        else if (filters.travelTime === '30분 이내') maxTime = 30;
        else if (filters.travelTime === '1시간 이내') maxTime = 60;
        // '1시간 이상'은 필터 적용 안함
        
        data = await dbHelpers.getPlacesWithDistance(user.id, {
          parentEnergy: selectedEnergy,
          childCondition: selectedCondition,
          maxTravelTime: maxTime
        });
      } else {
        console.log('Loading without distance');
        data = await dbHelpers.getPlaces({
          parentEnergy: selectedEnergy,
          childCondition: selectedCondition
        });
      }
      
      console.log('Loaded places:', data?.length);
      setPlaces(data);
    } catch (error) {
      console.error('장소 로드 오류:', error);
      setPlaces([]); // 에러 시 빈 배열로 설정
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return '좋은 새벽이에요';
    if (hour < 12) return '좋은 아침이에요';
    if (hour < 18) return '좋은 오후예요';
    if (hour < 22) return '좋은 저녁이에요';
    return '좋은 밤이에요';
  };

  const getChildrenInfo = () => {
    if (userProfile?.user_children && userProfile.user_children.length > 0) {
      if (userProfile.user_children.length === 1) {
        const child = userProfile.user_children[0];
        const age = getAgeFromBirthDate(`${child.birth_year}-${String(child.birth_month).padStart(2, '0')}`);
        return `${age} ${child.nickname}와 함께`;
      } else {
        return `${userProfile.user_children.length}명의 아이와 함께`;
      }
    }
    return '';
  };

  // 필터링된 장소 목록
  const filteredPlaces = useMemo(() => {
    let filtered = [...places];

    // 1시간 이상 필터 처리
    if (hasLocation && filters.travelTime === '1시간 이상') {
      filtered = filtered.filter(place => 
        place.travel_time_car && place.travel_time_car > 60
      );
    }

    // 환경 필터
    if (filters.environment !== '모두') {
      filtered = filtered.filter(place => {
        if (filters.environment === '실내') return place.is_indoor;
        if (filters.environment === '실외') return place.is_outdoor;
        return true;
      });
    }

    // 주차 필터
    if (filters.parking === '필수') {
      filtered = filtered.filter(place => 
        place.place_amenities?.parking_available === true
      );
    }

    // 비용 필터
    if (filters.cost === '무료') {
      filtered = filtered.filter(place => 
        place.place_details?.is_free === true
      );
    }

    return filtered;
  }, [places, filters, hasLocation]); // hasLocation 추가

  const handleFilterApply = () => {
    setShowDetailFilter(false);
    loadPlaces(); // 필터 적용 후 데이터 다시 로드
  };

  if (loading) {
    return (
      <div className="home-container">
        <div className="loading-state">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>멋진 나들이 장소를 찾고 있어요...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container">
      {/* 상단 헤더 */}
      <div className="home-header">
        <div className="home-logo">
          <span className="logo-icon">🌸</span>
          <span className="logo-text">아이나들</span>
        </div>
        <button 
          className="user-email-chip" 
          onClick={() => navigate('/profile')}
        >
          {user?.email?.split('@')[0]}
        </button>
      </div>
      
      {/* 인사말 섹션 */}
      <div className="greeting-section">
        <h1>{getGreeting()}, 엄마! 👋</h1>
        <p>
          {getChildrenInfo() ? 
            `${getChildrenInfo()} 어디로 나들이 갈까요?` : 
            '어디로 나들이 갈까요?'
          }
        </p>
      </div>

      <div className="home-content">
        {/* 부모 에너지 & 아이 컨디션 */}
        <div className="condition-section">
          <div className="condition-group">
            <h3>부모 에너지</h3>
            <div className="condition-options">
              {['😴 낮음', '😊 보통', '💪 높음'].map((energy) => (
                <button
                  key={energy}
                  className={`condition-btn ${selectedEnergy === energy.split(' ')[1] ? 'active' : ''}`}
                  onClick={() => setSelectedEnergy(energy.split(' ')[1])}
                >
                  {energy}
                </button>
              ))}
            </div>
          </div>

          <div className="condition-group">
            <h3>아이 컨디션</h3>
            <div className="condition-options">
              {['😊 보통', '😴 저조함'].map((condition) => (
                <button
                  key={condition}
                  className={`condition-btn ${selectedCondition === condition.split(' ')[1] ? 'active' : ''}`}
                  onClick={() => setSelectedCondition(condition.split(' ')[1])}
                >
                  {condition}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 상세 필터 버튼 */}
        <div className="filter-button-section">
          <button 
            className="detail-filter-btn"
            onClick={() => setShowDetailFilter(true)}
          >
            <FaFilter />
            <span>상세 필터</span>
          </button>
        </div>

        {/* 결과 헤더 */}
        <div className="results-header">
          <span className="total-count">총 {filteredPlaces.length}개의 장소</span>
        </div>

        {/* 장소 목록 */}
        <div className="places-list">
          {filteredPlaces.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">😢</div>
              <p className="empty-state-text">조건에 맞는 장소가 없어요</p>
              <p className="empty-state-subtext">다른 조건으로 검색해보세요!</p>
            </div>
          ) : (
            filteredPlaces.map(place => (
              <PlaceCard 
                key={place.id} 
                place={place}
                userProfile={userProfile}
                onClick={() => navigate(`/place/${place.id}`)}
              />
            ))
          )}
        </div>
      </div>

      {/* 상세 필터 모달 */}
      {showDetailFilter && (
        <div className="modal-overlay" onClick={() => setShowDetailFilter(false)}>
          <div className="filter-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>상세 필터</h2>
              <button className="close-button" onClick={() => setShowDetailFilter(false)}>
                <FaTimes />
              </button>
            </div>

            <div className="filter-content">
              {/* 위치 설정 */}
              <div className="filter-group">
                <h3>위치 기준</h3>
                {hasLocation ? (
                  <div className="location-info">
                    <FaMapMarkerAlt />
                    <span>{userProfile?.home_address || '위치 설정됨'}</span>
                    <button 
                      className="change-location-btn"
                      onClick={() => {
                        setShowDetailFilter(false);
                        setShowLocationModal(true);
                      }}
                    >
                      변경
                    </button>
                  </div>
                ) : (
                  <button 
                    className="set-location-btn"
                    onClick={() => {
                      setShowDetailFilter(false);
                      setShowLocationModal(true);
                    }}
                  >
                    <FaMapMarkerAlt />
                    위치 설정하기
                  </button>
                )}
              </div>

              {/* 이동 시간 */}
              {hasLocation && (
                <div className="filter-group">
                  <h3>이동 시간 (자동차 기준)</h3>
                  <div className="filter-options">
                    {['10분 이내', '30분 이내', '1시간 이내', '1시간 이상'].map((time) => (
                      <button 
                        key={time} 
                        className={`filter-btn ${filters.travelTime === time ? 'active' : ''}`}
                        onClick={() => setFilters({...filters, travelTime: time})}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 환경 */}
              <div className="filter-group">
                <h3>환경</h3>
                <div className="filter-options">
                  {['실내', '실외', '모두'].map((env) => (
                    <button 
                      key={env} 
                      className={`filter-btn ${filters.environment === env ? 'active' : ''}`}
                      onClick={() => setFilters({...filters, environment: env})}
                    >
                      {env}
                    </button>
                  ))}
                </div>
              </div>

              {/* 주차 */}
              <div className="filter-group">
                <h3>주차</h3>
                <div className="filter-options">
                  {['필수', '상관없음'].map((parking) => (
                    <button 
                      key={parking} 
                      className={`filter-btn ${filters.parking === parking ? 'active' : ''}`}
                      onClick={() => setFilters({...filters, parking: parking})}
                    >
                      {parking}
                    </button>
                  ))}
                </div>
              </div>

              {/* 비용 */}
              <div className="filter-group">
                <h3>비용</h3>
                <div className="filter-options">
                  {['무료', '상관없음'].map((cost) => (
                    <button 
                      key={cost} 
                      className={`filter-btn ${filters.cost === cost ? 'active' : ''}`}
                      onClick={() => setFilters({...filters, cost: cost})}
                    >
                      {cost}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowDetailFilter(false)}>
                취소
              </button>
              <button className="apply-btn" onClick={handleFilterApply}>
                적용하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 위치 설정 모달 */}
      <LocationSetModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        currentLocation={userProfile?.home_lat ? {
          lat: userProfile.home_lat,
          lng: userProfile.home_lng,
          address: userProfile.home_address
        } : null}
        onSave={async (location) => {
          try {
            console.log('Saving location:', location);
            
            // 위치 업데이트
            const updatedProfile = await dbHelpers.updateUserLocation(user.id, location.lat, location.lng, location.address);
            console.log('Location updated:', updatedProfile);
            
            // userProfile 업데이트
            if (updateProfile) {
              await updateProfile({
                home_lat: location.lat,
                home_lng: location.lng,
                home_address: location.address
              });
            }
            
            setHasLocation(true);
            await loadPlaces();
          } catch (error) {
            console.error('위치 저장 중 오류:', error);
            alert('위치 저장 중 오류가 발생했습니다.');
          }
        }}
      />
    </div>
  );
}

export default Home;