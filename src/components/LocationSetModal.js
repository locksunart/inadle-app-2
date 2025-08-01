import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaSearch, FaTimes, FaLocationArrow } from 'react-icons/fa';
import { getCurrentLocation, DAEJEON_REGIONS, DAEJEON_LANDMARKS } from '../utils/locationCalculator';
import './LocationSetModal.css';

const LocationSetModal = ({ isOpen, onClose, onSave, currentLocation }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('region'); // 'region', 'landmark', 'search'

  useEffect(() => {
    if (currentLocation) {
      setSelectedLocation(currentLocation);
    }
  }, [currentLocation]);

  const handleGetCurrentLocation = async () => {
    setIsGettingLocation(true);
    try {
      const location = await getCurrentLocation();
      setSelectedLocation({
        lat: location.lat,
        lng: location.lng,
        address: '현재 위치'
      });
    } catch (error) {
      alert('위치를 가져올 수 없습니다. 위치 권한을 확인해주세요.');
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleRegionSelect = (region) => {
    setSelectedLocation({
      lat: region.lat,
      lng: region.lng,
      address: `대전 ${region.name}`
    });
  };

  const handleLandmarkSelect = (landmark) => {
    setSelectedLocation({
      lat: landmark.lat,
      lng: landmark.lng,
      address: landmark.address
    });
  };

  const handleSave = () => {
    if (selectedLocation) {
      onSave(selectedLocation);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="location-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>기본 위치 설정</h2>
          <button className="close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="location-content">
          {/* 현재 위치 버튼 */}
          <button 
            className="current-location-btn"
            onClick={handleGetCurrentLocation}
            disabled={isGettingLocation}
          >
            <FaLocationArrow />
            {isGettingLocation ? '위치 가져오는 중...' : '현재 위치 사용'}
          </button>

          {/* 탭 메뉴 */}
          <div className="location-tabs">
            <button 
              className={`tab-btn ${activeTab === 'region' ? 'active' : ''}`}
              onClick={() => setActiveTab('region')}
            >
              지역 선택
            </button>
            <button 
              className={`tab-btn ${activeTab === 'landmark' ? 'active' : ''}`}
              onClick={() => setActiveTab('landmark')}
            >
              주요 장소
            </button>
          </div>

          {/* 탭 내용 */}
          <div className="tab-content">
            {activeTab === 'region' && (
              <div className="region-grid">
                {DAEJEON_REGIONS.map(region => (
                  <button
                    key={region.name}
                    className={`region-btn ${selectedLocation?.address?.includes(region.name) ? 'selected' : ''}`}
                    onClick={() => handleRegionSelect(region)}
                  >
                    {region.name}
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'landmark' && (
              <div className="landmark-list">
                {DAEJEON_LANDMARKS.map(landmark => (
                  <button
                    key={landmark.name}
                    className={`landmark-btn ${selectedLocation?.address === landmark.address ? 'selected' : ''}`}
                    onClick={() => handleLandmarkSelect(landmark)}
                  >
                    <div className="landmark-name">{landmark.name}</div>
                    <div className="landmark-address">{landmark.address}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 선택된 위치 표시 */}
          {selectedLocation && (
            <div className="selected-location">
              <FaMapMarkerAlt />
              <span>{selectedLocation.address}</span>
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button className="cancel-btn" onClick={onClose}>
            취소
          </button>
          <button 
            className="save-btn" 
            onClick={handleSave}
            disabled={!selectedLocation}
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationSetModal;