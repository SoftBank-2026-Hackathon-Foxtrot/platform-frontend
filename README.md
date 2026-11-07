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
  pages/overview/   시작 화면·상태 조회 API와 query
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

## 데이터 요청

`pages/overview/api/health.ts`가 API 함수와 `queryOptions`의 예제입니다. API 함수는 Axios 요청·Zod 응답 검증을 담당합니다. query는 key와 취소 신호를 관리합니다. 화면은 `useQuery` 결과로 로딩·성공·오류를 표시합니다.

시작 화면의 연결 확인 버튼은 실제 `/api/health` 요청을 보냅니다. 개발 서버는 `/api`를 `http://127.0.0.1:8000`으로 전달하며 `/api` 접두어를 제거합니다. 백엔드를 실행하지 않으면 연결 실패를 표시합니다. 성공 모의 데이터로 바꾸지 않습니다. 이 경로의 예상 응답은 `{"status":"ok"}`입니다.

`VITE_API_BASE_URL`은 공개 API 주소입니다. 같은 출처에서 API를 제공하면 `/api`를 사용합니다. 다른 주소로 바꾸려면 `.env.example`을 참고하고, 백엔드의 CORS·쿠키·CSRF 계약도 함께 확인합니다. `VITE_*`에 토큰이나 비밀번호를 넣지 않습니다. 개발 프록시는 배포 빌드에 포함되지 않으므로 운영에서도 `/api`를 실제 백엔드로 연결해야 합니다.

인증·권한 오류와 잘못된 응답 형식은 재시도하지 않습니다. 조회의 일시 오류는 최대 한 번 재시도합니다. `useMutation`은 자동 재시도하지 않고, 변경 성공 후 해당 query key를 무효화합니다. 업무 API의 query key에는 workspace와 앱 등 접근 범위를 포함합니다.

실제 로컬 HTTP 서버를 사용하는 테스트는 정상 응답, 응답 형식 불일치, 401 재시도 금지, Query 취소 시 HTTP 연결 종료를 확인합니다. 로그인·CSRF 연결은 백엔드 계약을 확정한 뒤 추가합니다.

GitHub 로그인·앱 등록·마이그레이션 기능은 아직 구현하지 않았습니다.

## 마이그레이션 관측

기본 화면에서 컨트롤 플레인의 workflow를 선택할 수 있습니다. 표시 항목·API 연결·검사는 [관측 화면](docs/migration-observability.md)을 참고하세요.

## 마이그레이션 보안 화면

`/security`에서 예시 데이터 기반의 그래프·비교·작업 화면을 볼 수 있습니다. [구현 범위와 실행 방법](docs/migration-security-screens.md), [AI 후속 연결 메모](docs/migration-security-ai-handoff.md)를 참고하세요. 실제 보안 검사나 AI 호출은 실행하지 않습니다.
