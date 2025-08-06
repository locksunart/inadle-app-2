# 🎯 Week 1 체크리스트 (2/3 - 2/9)
**목표**: 장소 데이터 100개 확보

## 📅 월요일 (2/3) - 2시간
### 오전 작업 (목표: 30개 수집)
- [ ] 카카오맵 수집기 준비
  - [ ] HTML 파일 브라우저에서 열기
  - [ ] API 키 확인
- [ ] 키즈카페/실내놀이터 수집
  - [ ] "대전 키즈카페" 검색
  - [ ] "키즈카페" (CE7 카테고리)
  - [ ] "어린이카페" (CE7 카테고리)
  - [ ] "놀이카페" (CE7 카테고리)
- [ ] 도서관 수집
  - [ ] "대전 어린이도서관" 검색
  - [ ] "대전 도서관" 검색
- [ ] 수집 결과 확인
  ```sql
  SELECT * FROM place_collection_stats;
  ```

### 작업 로그
```
시작 시간: 
종료 시간:
수집된 장소:
- 키즈카페: 개
- 도서관: 개
문제점:
```

---

## 📅 수요일 (2/5) - 2시간
### 오전 작업 (목표: 30개 수집)
- [ ] 공원/수목원 수집
  - [ ] "대전 공원" (AT4 카테고리)
  - [ ] "대전 수목원" (AT4 카테고리)
  - [ ] "대전 어린이공원"
- [ ] 박물관/과학관/미술관 수집
  - [ ] "대전 어린이박물관" (CT1 카테고리)
  - [ ] "대전 과학관" (CT1 카테고리)
  - [ ] "대전 미술관" (CT1 카테고리)
- [ ] 중복 제거 실행
  ```sql
  -- 중복 확인
  SELECT * FROM find_duplicate_places();
  
  -- 중복 제거
  WITH duplicates AS (
    SELECT id, name, created_at,
      ROW_NUMBER() OVER (PARTITION BY name ORDER BY created_at DESC) as rn
    FROM places
    WHERE is_active = true
  )
  UPDATE places
  SET is_active = false,
      deactivated_reason = '중복',
      deactivated_at = NOW()
  WHERE id IN (
    SELECT id FROM duplicates WHERE rn > 1
  );
  ```

### 작업 로그
```
시작 시간:
종료 시간:
수집된 장소:
- 공원/수목원: 개
- 박물관 등: 개
중복 제거: 개
```

---

## 📅 금요일 (2/7) - 2시간
### 오전 작업 (목표: 40개 수집)
- [ ] 체험시설/전시관 수집
  - [ ] "대전 체험관" (CT1 카테고리)
  - [ ] "대전 어린이체험"
  - [ ] "대전 체험학습"
- [ ] 동물원/아쿠아리움 수집
  - [ ] "대전 동물원" (AT4 카테고리)
  - [ ] "대전 아쿠아리움" (AT4 카테고리)
- [ ] 문화센터 수집
  - [ ] "대전 문화센터" (CT1 카테고리)
  - [ ] "대전 어린이문화"
- [ ] 부적절한 장소 필터링
  ```sql
  UPDATE places
  SET is_active = false,
      deactivated_reason = '제외 카테고리',
      deactivated_at = NOW()
  WHERE is_active = true
  AND (
    name ILIKE '%어린이집%' OR 
    name ILIKE '%유치원%' OR
    name ILIKE '%학원%' OR
    name ILIKE '%병원%' OR
    name ILIKE '%교회%' OR
    name ILIKE '%아파트%' OR
    name ILIKE '%주차장%'
  );
  ```

### 작업 로그
```
시작 시간:
종료 시간:
수집된 장소:
- 체험시설: 개
- 동물원 등: 개
- 문화센터: 개
필터링된 장소: 개
```

---

## 📊 주간 총계
- [ ] 목표 달성 여부 확인 (100개)
- [ ] 카테고리별 분포 확인
- [ ] 다음 주 계획 수립

### 최종 통계
```sql
-- 전체 통계 확인
SELECT * FROM place_collection_stats;

-- 이번 주 수집된 데이터만
SELECT 
  DATE(created_at) as date,
  COUNT(*) as places_added,
  data_source
FROM places
WHERE created_at >= '2025-02-03'
GROUP BY DATE(created_at), data_source
ORDER BY date;
```

### 성과 요약
```
총 수집: 개
활성 장소: 개
제외된 장소: 개
목표 달성률: %
```

## 💡 개선사항 및 다음 주 준비
- 
- 
- 