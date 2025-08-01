import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../hooks/useAuth';
import './Events.css';

const Events = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' or 'ongoing'
  const [selectedOrganizer, setSelectedOrganizer] = useState('all');
  const [selectedEventType, setSelectedEventType] = useState('all');
  const [organizers, setOrganizers] = useState([]);

  useEffect(() => {
    fetchEvents();
    fetchOrganizers();
  }, [activeTab, selectedOrganizer, selectedEventType]);

  const fetchOrganizers = async () => {
    try {
      const { data, error } = await supabase
        .from('event_organizers')
        .select('*')
        .order('name');

      if (error) throw error;
      setOrganizers(data || []);
    } catch (error) {
      console.error('Error fetching organizers:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('events')
        .select(`
          *,
          event_organizers(name, category),
          places(name, address, region)
        `);

      // 탭에 따른 필터
      const today = new Date().toISOString().split('T')[0];
      if (activeTab === 'upcoming') {
        query = query.gte('start_date', today).eq('status', 'upcoming');
      } else {
        query = query.lte('start_date', today).gte('end_date', today).eq('status', 'ongoing');
      }

      // 주최기관 필터
      if (selectedOrganizer !== 'all') {
        query = query.eq('organizer_id', selectedOrganizer);
      }

      // 행사 유형 필터
      if (selectedEventType !== 'all') {
        query = query.eq('event_type', selectedEventType);
      }

      query = query.order('start_date', { ascending: true });

      const { data, error } = await query;

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;
    
    const startStr = start.toLocaleDateString('ko-KR', { 
      month: 'numeric', 
      day: 'numeric' 
    });
    
    if (!end) return startStr;
    
    const endStr = end.toLocaleDateString('ko-KR', { 
      month: 'numeric', 
      day: 'numeric' 
    });
    
    return `${startStr} - ${endStr}`;
  };

  const getEventTypeLabel = (type) => {
    const labels = {
      '정기프로그램': '정기',
      '특별행사': '특별',
      '전시': '전시',
      '공연': '공연'
    };
    return labels[type] || type;
  };

  const getEventTypeColor = (type) => {
    const colors = {
      '정기프로그램': '#4CAF50',
      '특별행사': '#FF6B6B',
      '전시': '#9C27B0',
      '공연': '#2196F3'
    };
    return colors[type] || '#666';
  };

  const formatAgeRange = (minAge, maxAge, note) => {
    if (note) return note;
    if (!minAge && !maxAge) return '전연령';
    
    const formatAge = (months) => {
      if (months < 24) return `${months}개월`;
      const years = Math.floor(months / 12);
      return `${years}세`;
    };
    
    if (!maxAge) return `${formatAge(minAge)} 이상`;
    if (!minAge) return `${formatAge(maxAge)} 이하`;
    return `${formatAge(minAge)} ~ ${formatAge(maxAge)}`;
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>행사 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="events-container">
      <div className="events-header">
        <h1>행사/프로그램</h1>
        <p>대전 지역의 다양한 어린이 행사와 프로그램을 만나보세요</p>
      </div>

      <div className="events-filters">
        <div className="tabs">
          <button 
            className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            예정된 행사
          </button>
          <button 
            className={`tab-btn ${activeTab === 'ongoing' ? 'active' : ''}`}
            onClick={() => setActiveTab('ongoing')}
          >
            진행중인 행사
          </button>
        </div>

        <div className="filter-row">
          <select 
            className="filter-select"
            value={selectedOrganizer}
            onChange={(e) => setSelectedOrganizer(e.target.value)}
          >
            <option value="all">모든 주최기관</option>
            {organizers.map(org => (
              <option key={org.id} value={org.id}>{org.name}</option>
            ))}
          </select>

          <select 
            className="filter-select"
            value={selectedEventType}
            onChange={(e) => setSelectedEventType(e.target.value)}
          >
            <option value="all">모든 유형</option>
            <option value="정기프로그램">정기프로그램</option>
            <option value="특별행사">특별행사</option>
            <option value="전시">전시</option>
            <option value="공연">공연</option>
          </select>
        </div>
      </div>

      <div className="events-content">
        <div className="results-info">
          <span className="result-count">총 {events.length}개의 행사</span>
        </div>

        {events.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <p className="empty-text">현재 등록된 행사가 없습니다</p>
            <p className="empty-subtext">곧 새로운 행사 정보가 추가될 예정입니다</p>
          </div>
        ) : (
          <div className="events-list">
            {events.map(event => (
              <div key={event.id} className="event-card">
                <div className="event-header">
                  <span 
                    className="event-type-badge"
                    style={{ backgroundColor: getEventTypeColor(event.event_type) }}
                  >
                    {getEventTypeLabel(event.event_type)}
                  </span>
                  {event.is_free && (
                    <span className="free-badge">무료</span>
                  )}
                </div>

                <h3 className="event-title">{event.title}</h3>
                
                <div className="event-info">
                  <div className="info-item">
                    <span className="info-icon">🏢</span>
                    <span>{event.event_organizers?.name}</span>
                  </div>
                  
                  <div className="info-item">
                    <span className="info-icon">📅</span>
                    <span>{formatDateRange(event.start_date, event.end_date)}</span>
                  </div>
                  
                  <div className="info-item">
                    <span className="info-icon">👶</span>
                    <span>{formatAgeRange(event.target_age_min, event.target_age_max, event.target_age_note)}</span>
                  </div>

                  {event.places && (
                    <div className="info-item">
                      <span className="info-icon">📍</span>
                      <span>{event.places.name}</span>
                    </div>
                  )}
                </div>

                {event.description && (
                  <p className="event-description">{event.description}</p>
                )}

                <div className="event-actions">
                  {event.registration_url && (
                    <a 
                      href={event.registration_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="register-btn"
                    >
                      신청하기 →
                    </a>
                  )}
                  <button className="save-btn">
                    <span>💾</span> 저장
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;