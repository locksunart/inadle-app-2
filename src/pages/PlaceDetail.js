import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaMapMarkerAlt, FaPhone, FaGlobe, FaClock, FaHeart, FaShare, FaParking, FaBaby, FaStar } from 'react-icons/fa';
import { supabase, dbHelpers } from '../services/supabase';
import { useAuth } from '../hooks/useAuth';
import './PlaceDetail.css';

const PlaceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [aiDescription, setAiDescription] = useState(null);
  const [momReviews, setMomReviews] = useState([]);

  useEffect(() => {
    loadPlaceDetail();
    checkIfSaved();
    loadAiContent();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadPlaceDetail = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('places')
        .select(`
          *,
          place_details(*),
          place_amenities(*),
          place_filter_scores(*),
          place_age_suitability(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setPlace(data);
    } catch (error) {
      console.error('Error loading place:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAiContent = async () => {
    try {
      // AI 생성 설명 가져오기
      const { data: descriptions } = await supabase
        .from('place_ai_descriptions')
        .select('*')
        .eq('place_id', id)
        .eq('description_type', 'overview')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (descriptions && descriptions.length > 0) {
        setAiDescription(descriptions[0]);
      }
      
      // 맘's 리뷰 가져오기
      const { data: reviews } = await supabase
        .from('place_mom_reviews')
        .select('*')
        .eq('place_id', id)
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (reviews) {
        setMomReviews(reviews);
      }
    } catch (error) {
      console.error('Error loading AI content:', error);
    }
  };

  const checkIfSaved = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('user_saved_places')
        .select('id')
        .eq('user_id', user.id)
        .eq('place_id', id)
        .maybeSingle();
      
      setIsSaved(!!data);
    } catch (error) {
      console.error('Error checking saved status:', error);
      setIsSaved(false);
    }
  };

  const handleSaveToggle = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const success = await dbHelpers.toggleSavePlace(user.id, id);
      if (success) {
        setIsSaved(!isSaved);
      }
    } catch (error) {
      console.error('Error toggling save:', error);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: place.name,
        text: `${place.name} - 아이나들에서 추천하는 장소`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('링크가 복사되었습니다!');
    }
  };

  const handleAddressClick = () => {
    const address = encodeURIComponent(place.address);
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // 모바일에서는 카카오맵 앱으로 연결
      window.location.href = `kakaomap://search?q=${address}`;
    } else {
      // 데스크톱에서는 구글맵으로
      window.open(`https://maps.google.com/maps?q=${address}`, '_blank');
    }
  };

  const getOperatingHours = () => {
    if (!place.operating_hours) return null;
    
    const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    const dayNames = ['월', '화', '수', '목', '금', '토', '일'];
    
    return days.map((day, index) => {
      const hours = place.operating_hours[day];
      if (hours?.closed) {
        return `${dayNames[index]}: 휴무`;
      } else if (hours?.open && hours?.close) {
        return `${dayNames[index]}: ${hours.open} - ${hours.close}`;
      }
      return null;
    }).filter(Boolean);
  };

  const getAgeSuitability = () => {
    if (!place.place_age_suitability) return [];
    
    const ageGroups = [
      { key: 'age_0_12_months', label: '0-12개월', score: place.place_age_suitability.age_0_12_months },
      { key: 'age_13_24_months', label: '1-2세', score: place.place_age_suitability.age_13_24_months },
      { key: 'age_25_48_months', label: '2-4세', score: place.place_age_suitability.age_25_48_months },
      { key: 'age_49_72_months', label: '4-6세', score: place.place_age_suitability.age_49_72_months },
      { key: 'age_73_84_months', label: '6-7세', score: place.place_age_suitability.age_73_84_months },
      { key: 'age_over_84_months', label: '7세 이상', score: place.place_age_suitability.age_over_84_months }
    ];
    
    return ageGroups.filter(group => group.score && group.score > 0);
  };

  if (loading) {
    return (
      <div className="place-detail-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>장소 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="place-detail-container">
        <div className="error-state">
          <p>장소를 찾을 수 없습니다.</p>
          <button onClick={() => navigate('/')}>홈으로 돌아가기</button>
        </div>
      </div>
    );
  }

  return (
    <div className="place-detail-container">
      {/* 헤더 */}
      <div className="detail-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <FaArrowLeft />
        </button>
        <h1>장소 상세</h1>
        <div className="header-actions">
          <button className="icon-button" onClick={handleSaveToggle}>
            <FaHeart className={isSaved ? 'saved' : ''} />
          </button>
          <button className="icon-button" onClick={handleShare}>
            <FaShare />
          </button>
        </div>
      </div>

      {/* 기본 정보 */}
      <div className="place-basic-info">
        <div className="category-badge">{place.category}</div>
        <h2>{place.name}</h2>
        <div className="location-info" onClick={handleAddressClick}>
          <FaMapMarkerAlt />
          <span>{place.address}</span>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="detail-tabs">
        <button 
          className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          기본 정보
        </button>
        <button 
          className={`tab-btn ${activeTab === 'amenities' ? 'active' : ''}`}
          onClick={() => setActiveTab('amenities')}
        >
          편의시설
        </button>
        <button 
          className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          맘's 리뷰
        </button>
      </div>

      {/* 탭 콘텐츠 */}
      <div className="tab-content">
        {activeTab === 'info' && (
          <div className="info-content">
            {/* 어떤 곳인가요? */}
            <div className="info-section">
              <h3>어떤 곳인가요?</h3>
              <p className="place-description">
                {aiDescription?.content || `${place.name}은(는) ${place.category}입니다. 아이들과 함께 방문하기 좋은 곳이에요.`}
              </p>
            </div>

            {/* 연령 적합도 */}
            <div className="info-section">
              <h3>연령 적합도</h3>
              <div className="age-suitability-inline">
                {getAgeSuitability().map((group) => (
                  <div key={group.key} className="age-badge">
                    <span className="age-label">{group.label}</span>
                    <div className="stars-mini">
                      {'⭐'.repeat(Math.floor(group.score))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* 운영 정보 */}
            <div className="info-section">
              <h3>운영 정보</h3>
              <div className="info-list">
                {getOperatingHours() && (
                  <div className="info-item">
                    <FaClock />
                    <div>
                      <strong>운영시간</strong>
                      {getOperatingHours().map((hours, index) => (
                        <p key={index}>{hours}</p>
                      ))}
                    </div>
                  </div>
                )}
                
                {place.phone && (
                  <div className="info-item">
                    <FaPhone />
                    <div>
                      <strong>전화번호</strong>
                      <p>{place.phone}</p>
                    </div>
                  </div>
                )}
                
                {place.homepage && (
                  <div className="info-item">
                    <FaGlobe />
                    <div>
                      <strong>홈페이지</strong>
                      <a href={place.homepage} target="_blank" rel="noopener noreferrer">
                        바로가기
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 이용 요금 */}
            <div className="info-section">
              <h3>이용 요금</h3>
              {place.place_details?.is_free ? (
                <div className="free-notice">
                  <span className="free-badge">무료</span>
                  <p>무료로 이용할 수 있어요!</p>
                </div>
              ) : (
                <div className="price-info">
                  {place.place_details?.price_adult && (
                    <p>성인: {place.place_details.price_adult.toLocaleString()}원</p>
                  )}
                  {place.place_details?.price_child && (
                    <p>어린이: {place.place_details.price_child.toLocaleString()}원</p>
                  )}
                  {place.place_details?.price_note && (
                    <p className="price-note">{place.place_details.price_note}</p>
                  )}
                </div>
              )}
            </div>

            {/* 특징 */}
            {place.place_details?.features && place.place_details.features.length > 0 && (
              <div className="info-section">
                <h3>주요 특징</h3>
                <div className="features-list">
                  {place.place_details.features.map((feature, index) => (
                    <span key={index} className="feature-tag">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'amenities' && (
          <div className="amenities-content">
            <div className="amenities-grid">
              <div className="amenity-card">
                <div className="amenity-header">
                  <FaParking />
                  <h3>주차</h3>
                </div>
                <div className="amenity-status">
                  {place.place_amenities?.parking_available ? (
                    <>
                      <span className="status-yes">가능</span>
                      {place.place_amenities.parking_free && (
                        <span className="free-badge">무료</span>
                      )}
                    </>
                  ) : (
                    <span className="status-no">불가</span>
                  )}
                </div>
                {place.place_amenities?.parking_note && (
                  <p className="amenity-note">{place.place_amenities.parking_note}</p>
                )}
              </div>

              <div className="amenity-card">
                <div className="amenity-header">
                  <FaBaby />
                  <h3>수유실</h3>
                </div>
                <div className="amenity-status">
                  {place.place_amenities?.nursing_room ? (
                    <span className="status-yes">있음</span>
                  ) : (
                    <span className="status-no">없음</span>
                  )}
                </div>
              </div>

              <div className="amenity-card">
                <div className="amenity-header">
                  <FaBaby />
                  <h3>기저귀 교환대</h3>
                </div>
                <div className="amenity-status">
                  {place.place_amenities?.diaper_table ? (
                    <span className="status-yes">있음</span>
                  ) : (
                    <span className="status-no">없음</span>
                  )}
                </div>
              </div>

              <div className="amenity-card">
                <div className="amenity-header">
                  <FaBaby />
                  <h3>아기 의자</h3>
                </div>
                <div className="amenity-status">
                  {place.place_amenities?.baby_chair ? (
                    <span className="status-yes">있음</span>
                  ) : (
                    <span className="status-no">없음</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="reviews-content">
            {/* AI 요약 리뷰 */}
            {momReviews.length > 0 && (
              <div className="mom-tips-section">
                <h3>💡 엄마들의 꿀팁</h3>
                {momReviews.map((review, index) => (
                  <div key={review.id} className="mom-tip">
                    <p>{review.review_text}</p>
                  </div>
                ))}
              </div>
            )}
            
            {/* 블로그 리뷰 목록 */}
            <div className="blog-reviews-section">
              <h3>📝 블로그 리뷰</h3>
              {place.place_blog_mentions && place.place_blog_mentions.length > 0 ? (
                <div className="blog-list">
                  {place.place_blog_mentions.map((blog) => (
                    <a 
                      key={blog.id} 
                      href={blog.blog_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="blog-item"
                    >
                      <h4>{blog.blog_title}</h4>
                      <p>{blog.blog_description}</p>
                      <div className="blog-meta">
                        <span>{blog.blogger_name}</span>
                        {blog.post_date && (
                          <span>{new Date(blog.post_date).toLocaleDateString()}</span>
                        )}
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="no-reviews">아직 리뷰가 없어요</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'age' && (
          <div className="age-content">
            <div className="age-suitability">
              {getAgeSuitability().map((group) => (
                <div key={group.key} className="age-item">
                  <div className="age-info">
                    <span className="age-label">{group.label}</span>
                    <div className="rating-info">
                      <div className="rating-stars">
                        {[...Array(5)].map((_, i) => (
                          <FaStar 
                            key={i} 
                            className={i < Math.floor(group.score) ? 'filled' : 'empty'} 
                          />
                        ))}
                      </div>
                      <span className="rating-number">{group.score.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaceDetail;