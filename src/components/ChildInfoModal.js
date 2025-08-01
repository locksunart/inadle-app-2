import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { isValidBirthDate } from '../utils/ageCalculator';
import './ChildInfoModal.css';

function ChildInfoModal({ isOpen, onClose }) {
  const { addChild } = useAuth();
  const [nickname, setNickname] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 유효성 검사
    if (!nickname.trim()) {
      setError('아이의 애칭을 입력해주세요');
      return;
    }

    if (!birthYear || !birthMonth) {
      setError('생년월을 선택해주세요');
      return;
    }

    if (!isValidBirthDate(parseInt(birthYear), parseInt(birthMonth))) {
      setError('올바른 생년월을 선택해주세요');
      return;
    }

    setLoading(true);

    try {
      const result = await addChild({
        nickname: nickname.trim(),
        birth_year: parseInt(birthYear),
        birth_month: parseInt(birthMonth)
      });

      if (result) {
        onClose();
      } else {
        setError('아이 정보 저장에 실패했습니다');
      }
    } catch (err) {
      setError('오류가 발생했습니다');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content child-info-modal">
        <div className="modal-header">
          <h2>아이 정보 입력</h2>
          <button 
            className="modal-close" 
            onClick={onClose}
            type="button"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p className="modal-description">
              아이의 연령에 맞는 장소를 추천해드려요! 😊
            </p>

            <div className="form-group">
              <label htmlFor="nickname">아이 애칭</label>
              <input
                id="nickname"
                type="text"
                placeholder="예: 첫째, 막내, 공주님"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={10}
              />
            </div>

            <div className="form-group">
              <label>생년월</label>
              <div className="birth-select-group">
                <select
                  value={birthYear}
                  onChange={(e) => setBirthYear(e.target.value)}
                  className="birth-select"
                >
                  <option value="">연도</option>
                  {years.map(year => (
                    <option key={year} value={year}>
                      {year}년
                    </option>
                  ))}
                </select>
                
                <select
                  value={birthMonth}
                  onChange={(e) => setBirthMonth(e.target.value)}
                  className="birth-select"
                >
                  <option value="">월</option>
                  {months.map(month => (
                    <option key={month} value={month}>
                      {month}월
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              나중에 하기
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? '저장 중...' : '저장하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChildInfoModal;
