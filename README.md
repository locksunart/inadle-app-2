# 아이나들 2.0

대전 지역 부모를 위한 맞춤형 육아 장소 & 행사 추천 서비스

## 프로젝트 개요

아이나들은 대전 지역의 부모들이 아이와 함께 갈 수 있는 장소를 쉽게 찾을 수 있도록 도와주는 서비스입니다.

### 주요 기능

- 🏠 **장소 추천**: 도서관, 박물관, 카페, 놀이터 등 다양한 장소 정보
- 📅 **행사 정보**: 지역 기관의 어린이 프로그램 및 행사 안내
- 🔍 **맞춤 필터**: 부모 에너지, 날씨, 혼잡도 등을 고려한 필터링
- 👶 **연령별 추천**: 아이 연령에 맞는 장소 추천
- 💾 **저장 기능**: 관심 장소 및 행사 저장

## 기술 스택

- **Frontend**: React 18, React Router, CSS Modules
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **배포**: Vercel / Netlify

## 시작하기

### 필수 요구사항

- Node.js 16+ 
- npm or yarn
- Supabase 계정

### 설치

1. 저장소 클론
```bash
git clone https://github.com/yourusername/inadle-app-2.git
cd inadle-app-2
```

2. 의존성 설치
```bash
npm install
```

3. 환경 변수 설정
`.env.example`을 `.env`로 복사하고 Supabase 정보 입력
```
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. 개발 서버 실행
```bash
npm start
```

## 프로젝트 구조

```
src/
├── components/         # 재사용 가능한 컴포넌트
│   ├── MobileNav.js   # 하단 네비게이션
│   ├── PlaceCard.js   # 장소 카드
│   └── ChildInfoModal.js # 자녀 정보 모달
├── pages/             # 페이지 컴포넌트
│   ├── Home.js        # 메인 페이지
│   ├── Events.js      # 행사 페이지
│   ├── MyPage.js      # 마이페이지
│   ├── Login.js       # 로그인
│   └── Signup.js      # 회원가입
├── hooks/             # 커스텀 훅
│   └── useAuth.js     # 인증 관련 훅
├── services/          # API 서비스
│   └── supabase.js    # Supabase 클라이언트
└── utils/             # 유틸리티 함수
    └── ageCalculator.js # 나이 계산
```

## 데이터베이스 스키마

주요 테이블:
- `places`: 장소 기본 정보
- `place_amenities`: 편의시설 정보
- `place_filter_scores`: 필터 점수
- `place_age_suitability`: 연령별 적합도
- `events`: 행사 정보
- `user_profiles`: 사용자 프로필
- `user_children`: 자녀 정보

## 향후 계획

- [ ] 데이터 수집 자동화 (네이버 블로그, 공공 API)
- [ ] AI 기반 추천 시스템 고도화
- [ ] 사용자 리뷰 및 평점 시스템
- [ ] 지도 기반 검색
- [ ] 알림 기능

## 라이선스

MIT License
