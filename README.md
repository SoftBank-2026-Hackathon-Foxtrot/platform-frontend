# Foxtrot Platform Frontend

플랫폼 콘솔의 프론트엔드 기본 구성입니다. Vite+·React·TypeScript·Tailwind CSS·shadcn/ui·Axios·TanStack Query를 사용합니다. 작업 규칙은 [AGENTS.md](AGENTS.md)에 있습니다.

## 실행

Node 버전은 `.node-version`, pnpm 버전은 `package.json`, 의존성 버전은 `pnpm-lock.yaml`을 따릅니다. [Vite+ 설치](https://viteplus.dev/guide/) 후 실행합니다.

```bash
vp install --frozen-lockfile
vp dev
```

## 검사

```bash
vp run check
vp run build
```

`check`는 포맷·린트·타입·FSD·shadcn 원본·테스트를 검사합니다. 생성된 컴포넌트는 포맷 대상에서도 제외합니다.

## 구조

```text
src/
  app/              앱 시작·QueryClient·테마
  pages/overview/   Sidebar Inset 레이아웃·상태 조회 API 예제
  shared/api/       공통 Axios 인스턴스·오류·조회 재시도 정책
  shared/ui/        shadcn CLI가 생성한 원본
  shared/lib/       공통 도구
```

FSD 의존 방향은 `app → pages → widgets → features → entities → shared`입니다. 필요한 레이어만 만듭니다. 외부 slice는 `index.ts`로만 참조하고 `steiger`로 검사합니다.

## 컴포넌트 추가

```bash
vp exec shadcn add dialog
vp run ui:record
vp run check
```

`ui:record`는 새 파일만 등록합니다. 기존 원본이 바뀌면 실패합니다. 기존 shadcn 컴포넌트는 사용자가 수정 요청을 한 경우에만 변경합니다. 그 외에는 props와 화면 조합으로 처리합니다.

## 화면

시작 화면은 shadcn의 `SidebarProvider`·`Sidebar variant="inset"`·`SidebarInset`으로 구성합니다. 사이드바 접기, 모바일 메뉴, 애플리케이션·마이그레이션·설정 선택을 제공합니다. 본문은 비워 두었습니다. 기존 소개 카드와 API 연결 확인 화면은 제거했습니다.

화면은 다크 모드로 고정합니다. [스타일 참고 화면](https://spotify.lth.so/share/hyun)의 Geist 글꼴, 중성 색상, 256px 사이드바, 32px 메뉴 행, 48px 상단 바를 따릅니다. 사이드바를 접으면 완전히 숨깁니다. 본문 안에서 스크롤하며, 상단 바는 고정합니다. 테마 토큰과 공개 props로 적용하며 shadcn 원본은 수정하지 않습니다.

## 데이터 요청 예제

`pages/overview/api/health.ts`가 API 함수와 `queryOptions`의 예제입니다. API 함수는 Axios 요청·Zod 응답 검증을 담당합니다. query는 key와 취소 신호를 관리합니다. 본문에서 API 예제를 자동 호출하지 않습니다.

상태 조회 예제의 경로는 `/api/health`입니다. 개발 서버는 `/api`를 `http://127.0.0.1:8000`으로 전달하며 `/api` 접두어를 제거합니다. 이 경로의 예상 응답은 `{"status":"ok"}`입니다. 실제 백엔드가 필요하며 성공 모의 데이터로 바꾸지 않습니다.

`VITE_API_BASE_URL`은 공개 API 주소입니다. 같은 출처에서 API를 제공하면 `/api`를 사용합니다. 다른 주소로 바꾸려면 `.env.example`을 참고하고, 백엔드의 CORS·쿠키·CSRF 계약도 함께 확인합니다. `VITE_*`에 토큰이나 비밀번호를 넣지 않습니다. 개발 프록시는 배포 빌드에 포함되지 않으므로 운영에서도 `/api`를 실제 백엔드로 연결해야 합니다.

인증·권한 오류와 잘못된 응답 형식은 재시도하지 않습니다. 조회의 일시 오류는 최대 한 번 재시도합니다. `useMutation`은 자동 재시도하지 않고, 변경 성공 후 해당 query key를 무효화합니다. 업무 API의 query key에는 workspace와 앱 등 접근 범위를 포함합니다.

실제 로컬 HTTP 서버를 사용하는 테스트는 정상 응답, 응답 형식 불일치, 401 재시도 금지, Query 취소 시 HTTP 연결 종료를 확인합니다. 로그인·CSRF 연결은 백엔드 계약을 확정한 뒤 추가합니다.

GitHub 로그인·앱 등록·마이그레이션 기능은 아직 구현하지 않았습니다.
