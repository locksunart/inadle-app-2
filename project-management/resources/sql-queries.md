# 💼 유용한 SQL 쿼리 모음

## 📊 통계 확인

### 전체 통계
```sql
-- 카테고리별 장소 현황
SELECT * FROM place_collection_stats;

-- 일별 수집 현황
SELECT 
  DATE(created_at) as collection_date,
  data_source,
  COUNT(*) as places_added,
  COUNT(DISTINCT category) as categories_covered
FROM places
GROUP BY DATE(created_at), data_source
ORDER BY collection_date DESC;

-- 시스템 건강도
SELECT * FROM system_health_check;
```

### 목표 달성률
```sql
SELECT 
  CASE 
    WHEN category IN ('키즈카페', '실내놀이터') THEN '키즈카페/실내놀이터'
    WHEN category IN ('박물관', '과학관', '미술관') THEN '박물관/과학관/미술관'
    WHEN category IN ('공원', '수목원') THEN '공원/수목원'
    ELSE category
  END as category_group,
  SUM(active_count) as current_count,
  CASE 
    WHEN category IN ('키즈카페', '실내놀이터') THEN 20
    WHEN category = '도서관' THEN 15
    WHEN category IN ('공원', '수목원') THEN 20
    WHEN category IN ('박물관', '과학관', '미술관') THEN 15
    WHEN category = '체험시설' THEN 10
    WHEN category = '문화센터' THEN 10
    ELSE 5
  END as target_count
FROM place_collection_stats
WHERE active_count > 0
GROUP BY category_group, target_count;
```

## 🧹 데이터 정리

### 중복 제거
```sql
-- 중복 찾기
SELECT * FROM find_duplicate_places();

-- 중복 제거 (오래된 것 비활성화)
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

### 부적절한 장소 필터링
```sql
-- 제외 키워드가 포함된 장소 비활성화
UPDATE places
SET is_active = false,
    deactivated_reason = CASE
      WHEN name ILIKE '%어린이집%' OR name ILIKE '%유치원%' THEN '교육기관'
      WHEN name ILIKE '%병원%' OR name ILIKE '%의원%' THEN '의료시설'
      WHEN name ILIKE '%교회%' OR name ILIKE '%성당%' THEN '종교시설'
      WHEN name ILIKE '%아파트%' OR name ILIKE '%오피스텔%' THEN '주거시설'
      WHEN name ILIKE '%주차장%' THEN '주차시설'
      ELSE '기타 부적절'
    END,
    deactivated_at = NOW()
WHERE is_active = true
AND (
  name ILIKE '%어린이집%' OR name ILIKE '%유치원%' OR
  name ILIKE '%학교%' OR name ILIKE '%학원%' OR
  name ILIKE '%병원%' OR name ILIKE '%의원%' OR
  name ILIKE '%보건소%' OR name ILIKE '%육아지원센터%' OR
  name ILIKE '%교회%' OR name ILIKE '%성당%' OR
  name ILIKE '%아파트%' OR name ILIKE '%주차장%'
);
```

## 📍 장소 검색 및 확인

### 최근 추가된 장소
```sql
SELECT 
  id,
  name,
  category,
  address,
  data_source,
  created_at
FROM places
WHERE is_active = true
ORDER BY created_at DESC
LIMIT 20;
```

### 특정 카테고리 장소
```sql
-- 키즈카페 목록
SELECT name, address, phone
FROM places
WHERE is_active = true
AND category IN ('키즈카페', '실내놀이터')
ORDER BY name;

-- 도서관 목록
SELECT name, address, phone
FROM places
WHERE is_active = true
AND category = '도서관'
ORDER BY name;
```

### 좌표가 있는 장소 (지도 표시용)
```sql
SELECT 
  name,
  category,
  coordinates->>'lat' as lat,
  coordinates->>'lng' as lng
FROM places
WHERE is_active = true
AND coordinates IS NOT NULL;
```

## 📈 블로그 및 리뷰 현황

### 블로그 수집 현황
```sql
-- 장소별 블로그 수
SELECT 
  p.name,
  COUNT(pb.id) as blog_count,
  MAX(pb.post_date) as latest_post
FROM places p
LEFT JOIN place_blog_mentions pb ON p.id = pb.place_id
WHERE p.is_active = true
GROUP BY p.id, p.name
HAVING COUNT(pb.id) > 0
ORDER BY blog_count DESC;

-- 최근 수집된 블로그
SELECT 
  p.name as place_name,
  pb.blog_title,
  pb.post_date,
  pb.created_at
FROM place_blog_mentions pb
JOIN places p ON pb.place_id = p.id
ORDER BY pb.created_at DESC
LIMIT 10;
```

### 연령별 적합도
```sql
-- 연령별 적합도가 계산된 장소
SELECT 
  p.name,
  p.category,
  pas.age_0_12_months,
  pas.age_13_24_months,
  pas.age_25_48_months,
  pas.age_49_72_months,
  pas.age_73_84_months,
  pas.age_over_84_months,
  pas.confidence_score
FROM places p
JOIN place_age_suitability pas ON p.id = pas.place_id
WHERE p.is_active = true
ORDER BY pas.confidence_score DESC;
```

## 🔧 유지보수

### 비활성화된 장소 확인
```sql
SELECT 
  name,
  category,
  deactivated_reason,
  deactivated_at
FROM places
WHERE is_active = false
ORDER BY deactivated_at DESC
LIMIT 20;
```

### 데이터 품질 체크
```sql
-- 필수 정보 누락 확인
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN address IS NULL OR address = '' THEN 1 END) as no_address,
  COUNT(CASE WHEN coordinates IS NULL THEN 1 END) as no_coordinates,
  COUNT(CASE WHEN category IS NULL OR category = '' THEN 1 END) as no_category
FROM places
WHERE is_active = true;

-- 전화번호 없는 장소
SELECT name, address
FROM places
WHERE is_active = true
AND (phone IS NULL OR phone = '');
```