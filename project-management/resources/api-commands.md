# 🚀 API 명령어 모음

## 📍 카카오맵 장소 수집

### 기본 수집 (대전 중심)
```bash
curl -X POST https://khpubcicxqaweviflvxr.supabase.co/functions/v1/import-places-from-kakao \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtocHViY2ljeHFhd2V2aWZsdnhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NDEzMjgsImV4cCI6MjA2OTUxNzMyOH0.X5_YpmHDsLueQwjFQv0lIQ6Eypm3XEEj73EaIWAGMsw" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### 카테고리별 수집

#### 키즈카페 (CE7)
```bash
curl -X POST https://khpubcicxqaweviflvxr.supabase.co/functions/v1/import-places-from-kakao \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtocHViY2ljeHFhd2V2aWZsdnhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NDEzMjgsImV4cCI6MjA2OTUxNzMyOH0.X5_YpmHDsLueQwjFQv0lIQ6Eypm3XEEj73EaIWAGMsw" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "키즈카페",
    "category": "CE7",
    "x": "127.3845475",
    "y": "36.3504119",
    "radius": "20000"
  }'
```

#### 문화시설 (CT1)
```bash
curl -X POST https://khpubcicxqaweviflvxr.supabase.co/functions/v1/import-places-from-kakao \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtocHViY2ljeHFhd2V2aWZsdnhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NDEzMjgsImV4cCI6MjA2OTUxNzMyOH0.X5_YpmHDsLueQwjFQv0lIQ6Eypm3XEEj73EaIWAGMsw" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "대전 박물관",
    "category": "CT1",
    "x": "127.3845475",
    "y": "36.3504119",
    "radius": "20000"
  }'
```

#### 관광명소 (AT4)
```bash
curl -X POST https://khpubcicxqaweviflvxr.supabase.co/functions/v1/import-places-from-kakao \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtocHViY2ljeHFhd2V2aWZsdnhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NDEzMjgsImV4cCI6MjA2OTUxNzMyOH0.X5_YpmHDsLueQwjFQv0lIQ6Eypm3XEEj73EaIWAGMsw" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "대전 공원",
    "category": "AT4",
    "x": "127.3845475",
    "y": "36.3504119",
    "radius": "20000"
  }'
```

## 📝 블로그 데이터 수집

### 수동 실행
```bash
curl -X POST https://khpubcicxqaweviflvxr.supabase.co/functions/v1/collect-blog-data \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtocHViY2ljeHFhd2V2aWZsdnhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NDEzMjgsImV4cCI6MjA2OTUxNzMyOH0.X5_YpmHDsLueQwjFQv0lIQ6Eypm3XEEj73EaIWAGMsw" \
  -H "Content-Type: application/json"
```

## 📊 연령별 적합도 계산

### 수동 실행
```bash
curl -X POST https://khpubcicxqaweviflvxr.supabase.co/functions/v1/calculate-age-suitability \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtocHViY2ljeHFhd2V2aWZsdnhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NDEzMjgsImV4cCI6MjA2OTUxNzMyOH0.X5_YpmHDsLueQwjFQv0lIQ6Eypm3XEEj73EaIWAGMsw" \
  -H "Content-Type: application/json"
```

## 🤖 AI 콘텐츠 생성

### 장소 설명 생성
```bash
curl -X POST https://khpubcicxqaweviflvxr.supabase.co/functions/v1/generate-place-content \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtocHViY2ljeHFhd2V2aWZsdnhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NDEzMjgsImV4cCI6MjA2OTUxNzMyOH0.X5_YpmHDsLueQwjFQv0lIQ6Eypm3XEEj73EaIWAGMsw" \
  -H "Content-Type: application/json" \
  -d '{
    "placeId": "PLACE_ID_HERE",
    "taskType": "description"
  }'
```

### 엄마 리뷰 생성
```bash
curl -X POST https://khpubcicxqaweviflvxr.supabase.co/functions/v1/generate-place-content \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtocHViY2ljeHFhd2V2aWZsdnhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NDEzMjgsImV4cCI6MjA2OTUxNzMyOH0.X5_YpmHDsLueQwjFQv0lIQ6Eypm3XEEj73EaIWAGMsw" \
  -H "Content-Type: application/json" \
  -d '{
    "placeId": "PLACE_ID_HERE",
    "taskType": "mom_review"
  }'
```

## 🔑 환경 변수
```
SUPABASE_URL=https://khpubcicxqaweviflvxr.supabase.co
ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtocHViY2ljeHFhd2V2aWZsdnhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NDEzMjgsImV4cCI6MjA2OTUxNzMyOH0.X5_YpmHDsLueQwjFQv0lIQ6Eypm3XEEj73EaIWAGMsw
```

## 🏷️ 카카오 카테고리 코드
- `CE7`: 카페
- `CT1`: 문화시설
- `AT4`: 관광명소
- `PK6`: 주차장 (제외)
- `FD6`: 음식점 (제외)
- `CS2`: 편의점 (제외)
- `SW8`: 지하철역 (제외)

## 📝 추천 검색 키워드

### 필수 키워드
```
대전 어린이도서관
대전 공원
대전 어린이박물관
대전 과학관
대전 미술관
대전 수목원
대전 놀이터
대전 키즈카페
대전 실내놀이터
대전 동물원
대전 아쿠아리움
대전 체험관
대전 문화센터
```

### 추가 키워드
```
키즈카페
어린이카페
놀이카페
어린이
아이
가족
유아숲체험원
어린이과학관
체험학습장
```