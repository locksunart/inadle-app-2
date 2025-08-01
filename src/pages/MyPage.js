import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAuth } from '../hooks/useAuth';
import { getAgeDisplay } from '../utils/ageCalculator';
import './MyPage.css';

const MyPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('saved'); // 'saved', 'visited'
  const [savedPlaces, setSavedPlaces] = useState([]);
  const [savedEvents, setSavedEvents] = useState([]);
  const [visitedPlaces, setVisitedPlaces] = useState([]);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showChildModal, setShowChildModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user, activeTab]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // 자녀 정보 가져오기
      const { data: childrenData } = await supabase
        .from('user_children')
        .select('*')
        .eq('user_id', user.id)
        .order('birth_year', { ascending: false });
      
      setChildren(childrenData || []);

      if (activeTab === 'saved') {
        // 저장한 장소
        const { data: placesData } = await supabase
          .from('user_saved_places')
          .select(`
            *,
            places(
              id, name, category, address, region,
              place_amenities(*)
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        setSavedPlaces(placesData || []);

        // 저장한 행사
        const { data: eventsData } = await supabase
          .from('user_saved_events')
          .select(`
            *,
            events(
              id, title, event_type, start_date, end_date,
              event_organizers(name)
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        setSavedEvents(eventsData || []);
      } else {
        // 방문한 장소
        const { data: visitsData } = await supabase
          .from('user_visits')
          .select(`
            *,
            places(
              id, name, category, address, region,
              place_amenities(*)
            )
          `)
          .eq('user_id', user.id)
          .order('visited_at', { ascending: false });
        
        setVisitedPlaces(visitsData || []);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      await logout();
      navigate('/login');
    }
  };

  const handleRemoveSavedPlace = async (savedId) => {
    try {
      const { error } = await supabase
        .from('user_saved_places')
        .delete()
        .eq('id', savedId);

      if (!error) {
        setSavedPlaces(prev => prev.filter(p => p.id !== savedId));
      }
    } catch (error) {
      console.error('Error removing saved place:', error);
    }
  };

  const handleRemoveSavedEvent = async (savedId) => {
    try {
      const { error } = await supabase
        .from('user_saved_events')
        .delete()
        .eq('id', savedId);

      if (!error) {
        setSavedEvents(prev => prev.filter(e => e.id !== savedId));
      }
    } catch (error) {
      console.error('Error removing saved event:', error);
    }
  };

  const handleAddChild = async (childData) => {
    try {
      const { data, error } = await supabase
        .from('user_children')
        .insert({
          user_id: user.id,
          ...childData
        })
        .select()
        .single();

      if (!error && data) {
        setChildren(prev => [...prev, data]);
        setShowChildModal(false);
      }
    } catch (error) {
      console.error('Error adding child:', error);
    }
  };

  const handleDeleteChild = async (childId) => {
    if (window.confirm('자녀 정보를 삭제하시겠습니까?')) {
      try {
        const { error } = await supabase
          .from('user_children')
          .delete()
          .eq('id', childId);

        if (!error) {
          setChildren(prev => prev.filter(c => c.id !== childId));
        }
      } catch (error) {
        console.error('Error deleting child:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mypage-container">
      <div className="mypage-header">
        <h1>마이페이지</h1>
        <button className="logout-btn" onClick={handleLogout}>
          로그아웃
        </button>
      </div>

      <div className="user-info-section">
        <div className="user-email">{user?.email}</div>
      </div>

      <div className="children-section">
        <div className="section-header">
          <h2>우리 아이 정보</h2>
          <button className="add-child-btn" onClick={() => setShowChildModal(true)}>
            + 추가
          </button>
        </div>
        
        {children.length === 0 ? (
          <div className="empty-children">
            <p>등록된 자녀 정보가 없습니다</p>
            <p className="sub-text">자녀 정보를 등록하면 맞춤 추천을 받을 수 있어요</p>
          </div>
        ) : (
          <div className="children-list">
            {children.map(child => (
              <div key={child.id} className="child-card">
                <div className="child-info">
                  <span className="child-nickname">{child.nickname}</span>
                  <span className="child-age">{getAgeDisplay(child.birth_year, child.birth_month)}</span>
                </div>
                <button 
                  className="delete-child-btn" 
                  onClick={() => handleDeleteChild(child.id)}
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="content-section">
        <div className="tabs">
          <button
            className={`tab-btn ${activeTab === 'saved' ? 'active' : ''}`}
            onClick={() => setActiveTab('saved')}
          >
            저장한 곳
          </button>
          <button
            className={`tab-btn ${activeTab === 'visited' ? 'active' : ''}`}
            onClick={() => setActiveTab('visited')}
          >
            다녀온 곳
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'saved' ? (
            <>
              {savedPlaces.length === 0 && savedEvents.length === 0 ? (
                <div className="empty-state">
                  <p>저장한 장소나 행사가 없습니다</p>
                </div>
              ) : (
                <>
                  {savedPlaces.length > 0 && (
                    <div className="saved-section">
                      <h3>장소</h3>
                      <div className="saved-list">
                        {savedPlaces.map(saved => (
                          <div key={saved.id} className="saved-item">
                            <div className="saved-info">
                              <h4>{saved.places.name}</h4>
                              <p>{saved.places.region} · {saved.places.category}</p>
                            </div>
                            <button 
                              className="remove-btn"
                              onClick={() => handleRemoveSavedPlace(saved.id)}
                            >
                              삭제
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {savedEvents.length > 0 && (
                    <div className="saved-section">
                      <h3>행사</h3>
                      <div className="saved-list">
                        {savedEvents.map(saved => (
                          <div key={saved.id} className="saved-item">
                            <div className="saved-info">
                              <h4>{saved.events.title}</h4>
                              <p>{saved.events.event_organizers?.name}</p>
                            </div>
                            <button 
                              className="remove-btn"
                              onClick={() => handleRemoveSavedEvent(saved.id)}
                            >
                              삭제
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <>
              {visitedPlaces.length === 0 ? (
                <div className="empty-state">
                  <p>방문 기록이 없습니다</p>
                </div>
              ) : (
                <div className="visited-list">
                  {visitedPlaces.map(visit => (
                    <div key={visit.id} className="visited-item">
                      <div className="visited-info">
                        <h4>{visit.places.name}</h4>
                        <p>{visit.places.region} · {visit.places.category}</p>
                        <p className="visit-date">
                          {new Date(visit.visited_at).toLocaleDateString('ko-KR')} 방문
                        </p>
                        {visit.overall_rating && (
                          <div className="rating">
                            {'⭐'.repeat(visit.overall_rating)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* 자녀 추가 모달 */}
      {showChildModal && (
        <div className="modal-overlay" onClick={() => setShowChildModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>자녀 정보 추가</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              handleAddChild({
                nickname: formData.get('nickname'),
                birth_year: parseInt(formData.get('birth_year')),
                birth_month: parseInt(formData.get('birth_month'))
              });
            }}>
              <input
                type="text"
                name="nickname"
                placeholder="아이 이름/애칭"
                required
              />
              <div className="birth-inputs">
                <input
                  type="number"
                  name="birth_year"
                  placeholder="출생년도"
                  min="2010"
                  max={new Date().getFullYear()}
                  required
                />
                <input
                  type="number"
                  name="birth_month"
                  placeholder="출생월"
                  min="1"
                  max="12"
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowChildModal(false)}>
                  취소
                </button>
                <button type="submit">추가</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPage;