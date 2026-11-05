# Foxtrot Platform Frontend

플랫폼 콘솔의 프론트엔드 기본 구성입니다. Vite+·React·TypeScript·Tailwind CSS·shadcn/ui를 사용합니다. 작업 규칙은 [AGENTS.md](AGENTS.md)에 있습니다.

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

`check`는 포맷·린트·타입·FSD·shadcn 원본을 검사합니다. 생성된 컴포넌트는 포맷 대상에서도 제외합니다.

## 구조

```text
src/
  app/              앱 시작·전역 설정·테마
  pages/overview/   시작 화면
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

GitHub 로그인·앱 등록·마이그레이션 기능은 아직 구현하지 않았습니다.
