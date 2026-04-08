# 유도 대진표 웹앱

유도 경기 운영을 위한 웹 기반 대진표 및 경기 기록 시스템입니다.

## 프로젝트 목적

이 프로젝트는 대회 주최자, 학교/동아리 운영자, 개인 선수가 함께 사용할 수 있는 유도 경기 운영 플랫폼입니다.

## 주요 기능

- **선수 등록 및 관리**: 소속 도장/클�브별 선수 등록
- **대회 생성 및 참가자 등록**: 다중 부문/체급 지원
- **자동 대진 생성**: 싱글 엘리미네이션 + 같은 도장 첫 경기 회피
- **부전승 처리**: 자동 bye 배정 및 진출
- **경기 결과 입력**: 실시간 기술별 득점 기록
- **다음 라운드 자동 반영**: 승자 자동 진출
- **대진표 공유**: 코드 조회 및 공유 링크
- **개인 선수 경기 기록**: 참가 대회 및 상세 기록 조회

## 사용자 유형

### 관리자 (ADMIN)
- 대회 생성 및 운영
- 대진표 관리 및 생성
- 경기 결과 입력
- 출력 및 공유 관리

### 학교/동아리 운영자 (MANAGER)
- 선수 등록/수정
- 소속 선수 관리
- 대회 참가 신청

### 개인 선수 (ATHLETE)
- 본인 경기 기록 조회
- 참가 대회 조회
- 경기 결과 상세 확인

### 공개 조회 (PUBLIC)
- 대회 코드 또는 공유 링크로 대진표 조회
- 별도 로그인 없이 접근 가능

## 기술 스택

### Frontend
- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui**
- **Clerk** (인증)

### Backend
- **NestJS**
- **TypeScript**
- **Prisma ORM** v7
- **PostgreSQL**

### 인증
- **Clerk** - 역할 기반 접근 제어 (RBAC) 지원

## 프로젝트 구조

```
bracket/
├── apps/
│   ├── web/                 # Next.js frontend
│   │   ├── app/
│   │   │   ├── (admin)/     # 관리자 라우트
│   │   │   ├── (manager)/   # 운영자 라우트
│   │   │   ├── (athlete)/   # 선수 라우트
│   │   │   ├── public/      # 공개 조회 라우트
│   │   │   └── sign-in/     # 로그인 페이지
│   │   ├── components/
│   │   └── lib/
│   └── api/                 # NestJS backend
│       ├── prisma/          # Prisma schema
│       └── src/
│           ├── modules/
│           │   ├── auth/        # 인증/인가
│           │   ├── users/       # 사용자 관리
│           │   ├── organizations/  # 소속 관리
│           │   ├── athletes/    # 선수 관리
│           │   ├── tournaments/ # 대회 관리
│           │   ├── brackets/    # 대진표 관리
│           │   ├── matches/     # 경기 관리
│           │   └── share-links/ # 공유 링크
│           └── common/
└── packages/
    ├── config/              # 공유 설정
    ├── types/               # 공유 타입
    ├── utils/               # 공유 유틸리티
    └── ui/                  # 공유 UI 컴포넌트
```

## 데이터 모델

### 핵심 엔티티
- **User**: 시스템 사용자 (ADMIN, MANAGER, ATHLETE 역할)
- **Organization**: 도장/학교/클�브
- **Athlete**: 선수 프로필
- **Tournament**: 대회
- **Division**: 부문/체급
- **TournamentEntry**: 대회 참가 신청
- **Bracket**: 대진표
- **Match**: 개별 경기
- **MatchScoreEvent**: 기술별 득점 이벤트
- **ShareLink**: 공유 링크
- **TournamentAccessCode**: 대회 접근 코드

## API 모듈

| 모듈 | 기능 |
|------|------|
| Auth | JWT 기반 인증, 역할 기반 접근 제어 |
| Users | 사용자 CRUD |
| Organizations | 소속 관리 |
| Athletes | 선수 관리, 경기 기록 조회 |
| Tournaments | 대회 관리, 부문 관리, 참가 등록 |
| Brackets | 대진 생성 (싱글 엘리미네이션) |
| Matches | 경기 결과 입력, 승자 자동 진출 |
| Share Links | 공유 링크 생성 및 조회 |

## 라우트 구조

### Web (Next.js App Router)
```
/                    # 홈
/sign-in             # 로그인 (Clerk)
/admin/*             # 관리자 영역 (보호됨)
/manager/*           # 운영자 영역 (보호됨)
/athlete/*           # 선수 영역 (보호됨)
/public/[code]       # 공개 대회 조회
/public/link/[slug]  # 공유 링크 조회
```

### API (NestJS)
```
POST   /auth/login
GET    /users
POST   /organizations
GET    /athletes
GET    /athletes/:id/history
GET    /tournaments
POST   /tournaments
POST   /tournaments/:id/divisions
POST   /tournaments/:id/entries
GET    /tournaments/public/by-code/:code
POST   /brackets/divisions/:id/generate
GET    /brackets/divisions/:id
POST   /matches/:id/result
GET    /matches/:id
POST   /share-links
GET    /share-links/public/by-slug/:slug
DELETE /share-links/:id
```

## 시작하기

### 필수 조건
- Node.js 20.19.0+ (nvm 사용 권장)
- PostgreSQL 14+
- npm 10+

### 설치

```bash
# 저장소 클론
git clone <repository-url>
cd bracket

# Node 버전 설정
nvm use

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일에 DATABASE_URL 및 Clerk 키 설정

# Prisma 설정
npm run prisma:generate

# 개발 서버 시작
npm run dev
```

### 환경 변수

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/judo_bracket"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# API (Web)
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api
```

## 개발 스크립트

```bash
# 개발 서버 (모든 앱)
npm run dev

# 개별 앱
npm run dev --workspace=@judo-bracket/api
npm run dev --workspace=@judo-bracket/web

# 타입 체크
npm run typecheck

# 테스트
npm test

# Prisma
npm run prisma:generate
npm run prisma:validate
```

## 대진 생성 알고리즘

1. **싱글 엘리미네이션** 구조 생성
2. **시드 배정**: 등록 순서 또는 수동 시드 기반
3. **같은 도장 회피**: 1라운드에서 같은 소속 선수 최대한 분리
4. **부전승 처리**: 참가자 수가 2의 거듭제곱이 아닌 경우 bye 자동 배정
5. **승자 자동 진출**: 경기 완료 시 다음 라운드 자동 배정

## 테스트

- **총 42개 테스트** 통과
  - API: 37개 (Service + Controller)
  - Utils: 5개 (Bracket 로직)

```bash
npm test
```

## 1차 MVP 범위

- ✅ 로그인 및 권한 분리 (Clerk)
- ✅ 관리자/운영자/선수 화면 분리
- ✅ 선수 등록
- ✅ 대회 생성 및 부문 관리
- ✅ 대진 생성 (싱글 엘리미네이션)
- ✅ 같은 도장 첫 경기 회피
- ✅ 경기 결과 입력
- ✅ 이벤트 기반 득점 기록
- ✅ 대진표 공유 (코드 + 링크)
- ✅ 개인 경기 기록 조회

## 향후 확장

- 더블 엘리미네이션
- 리그전
- 조별리그 + 본선
- 모바일 앱 확장
- 통계 및 랭킹 기능
- 실시간 알림
- PDF 출력

## 작업 원칙

- 직관적인 UI/UX
- 확장 가능한 구조
- 역할 기반 권한 분리
- 유도 경기 기록에 적합한 데이터 설계

## 문서

- `PROJECT_BRIEF.md` - 프로젝트 개요
- `.sisyphus/plans/judo-bracket.md` - 구현 계획
- `apps/api/prisma/schema.prisma` - 데이터베이스 스키마
