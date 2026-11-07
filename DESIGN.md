# Security dashboard: extension of Foxtrot

## Direction

Mode: **Operate**. Preserve the supplied handoff: summary and next action above, relationship map on the left, selected resource on the right, review history below the map. The current platform shell, fonts and primitives remain unchanged. No new visual brand, globe, force-directed graph, AI chat, score gauge or generic KPI cards.

The map explains one thing: which account the app uses to access each data service. Color highlights a specific gap; text and icons carry the same meaning. Detail explains the condition, source, target and proposed change. A change draft is not a passed check.

## Existing tokens and components

- Typeface: existing `Geist Variable`, `sans-serif` platform fallback for Korean/Japanese; monospace only for account IDs and ACL examples.
- Page title: 18–23px, weight 600, line-height 1.4, tracking -0.025em. Section titles: 14–16px; body 13–14px; compact metadata 11–12px.
- Existing `--background`, `--card`, `--foreground`, `--muted-foreground`, `--border`, `--ring`, `--destructive`, `--success`, `--info`. Preserve both themes. No new palette.
- Layout: 24px outer padding, 20px section gaps, 20–24px card padding, 10px stack tiles, existing shadcn card radius. Mobile outer padding 12px.
- Reuse Button, Badge, Card, Sheet and PlatformShell. Reuse the existing stack illustrations through `shared/lib/stack-icons`; do not alter generated `shared/ui` files.

## States and behavior

Unscanned → scan → gap → change plan → applied → verified. Three checks come from the server. Applying a plan is separate from verification. Only fresh verification plus app readiness enables this page’s migration link. Existing workflow approvals remain separate. Server revisions and audit events survive browser refresh; expired or failed checks cannot enable the link.

Resource selection is immediate. No entrances or stagger on frequently used controls. Busy feedback uses text and a spinner; reduced motion removes the spinner and sheet movement. Evidence uses a keyboard-accessible Sheet with focus restoration. Timeline timestamps use the active locale.

Below 1200px, the detail follows the map. Below 640px, the relationship map becomes an indented vertical tree with account labels; there is no horizontal canvas scrolling. Long English/Japanese copy wraps within its column. The current browser's narrow view is also a required verification target.

## Copy

Explain a finding or action, not a product promise: “GCP의 접근 범위가 기존보다 넓습니다”, “변경안 확인”, “검사 근거 보기”. Show “클라우드 조회” for cloud mode and “예시 데이터” only for local fixtures. No invented PRs, deployment logs, scan timestamps or AI summaries. Document implementation details in the handoff, not in an empty AI placeholder on the screen.

Reference: `migration-security-dashboard-handoff` images and SPEC at `d8ae63a`; existing platform source at `edb66ef`. The current implementation follows the requested AWS → GCP object-access demo. DB/Redis are context only. Keep the same map geometry and platform tokens.

# Monitoring

모니터링은 운영자가 기존 환경과 이전 환경의 OTEL 신호를 비교하고, 지표에서 트레이스와 로그까지 원인을 좁히는 화면이다. `SuperSon7/migration-monitoring-dashboard-handoff`의 SPEC과 목업을 기준으로 기존 release/2 콘솔을 확장한다.

- 기존 PlatformShell, 중성 표면, Geist Variable, shadcn 컴포넌트를 유지한다. 본문은 `max-w-6xl`, 16px 모바일 / 32px 데스크톱 여백, 제목 24px, 본문 14px, 보조 12px, 차트 값 24px이다.
- 한글은 시스템 sans-serif로 대체한다. 시각·요청 경로·trace id·로그는 Geist Mono Variable 및 시스템 monospace를 사용한다. 수치는 tabular-nums다.
- 차트는 데스크톱 2열, 모바일 1열이다. 카드 간격 16px, 카드 안쪽 16px, 모서리는 기존 lg/xl 토큰을 사용한다. 표와 필터는 같은 페이지에 둔다.
- aws `#eb6834` / 다크 `#d95926`, gcp `#2a78d6` / 다크 `#3987e5`만 추가한다. 기존 success/warning/destructive/info는 수집·오류 상태에 사용한다. 모든 계열에는 텍스트 레이블을 병기한다.
- 차트는 같은 단위와 축, 2px 선, 3개 격자를 쓴다. null은 끊긴 선, 0은 실제 0, 미실행 대상은 값 없음으로 표시한다. API 미제공·로딩·조회 실패·빈 결과를 구분한다.
- 지표→시각 ±2분과 구성 요소→트레이스→연결 로그의 순서를 보존한다. URL 검색값과 해시가 탐색 상태를 유지한다. 여러 workflow는 머리줄 선택으로 전환한다.
- 커서 시각은 네 차트가 공유한다. 화살표 키로 시각을 고르고 Enter로 트레이스를 연다. 터치에는 시점 선택과 명시적 열기 버튼을 제공한다. 반복 탐색에 애니메이션을 추가하지 않으며 모션 감소 설정을 존중한다.
- 마이그레이션에는 진행·승인 요약을 남기고 상세 관측은 모니터링의 상태 탭으로 통합한다. 구성도 노드는 리소스·환경, 이벤트는 시각을 지정해 연다. 복귀 링크는 상단에 유지하고 출발 위치·포커스·이력 펼침 상태를 복원한다. 비교·상세 데이터는 기존 계약을 보존하며 예시 데이터는 명시적 데모 모드에서만 사용한다.
- 밝은 테마의 작은 경고 글자는 기존 warning 토큰에 foreground를 15% 혼합한다. 기본 토큰의 흰 배경 대비 3.75:1을 보완하기 위한 국소 변경이다. 다크 테마와 계열 색은 유지한다.

- 상태 탭은 긴 리소스 카드를 재사용하지 않는다. 동기화·경로·검증·전환 조건을 소제목과 구분선으로 나누고, 수집 원본과 이력은 접어서 제공한다. 설명문 대신 짧은 상태·단위·측정 시각을 쓴다. 미수집·캐시·프로브/사용자 트래픽의 구분은 유지한다.

## 앱 서버 시스템 메트릭

기존 모니터링의 Operate 화면을 확장한다. 상단에서 시스템과 마이그레이션을 구분하고, 시스템 화면은 앱 → 소유한 배포 → 실행 인스턴스 → CPU/메모리/디스크/네트워크 순서로 좁힌다. 앱의 요청·주문·채팅은 이번 화면에 포함하지 않는다. 선택한 배포 ID를 표시한다. CPU·메모리·I/O는 컨테이너, 관리형 실행 환경의 공유 네트워크는 앱 실행 묶음으로 구분한다.

기존 색·Geist/한글 시스템 글꼴·shadcn·최대 6xl·24px 제목·14px 본문·12px 보조 글자·16px 차트 간격을 유지한다. 차트는 선택한 종류만 2열/모바일 1열로 보이며 수치와 시간은 tabular-nums다. 퍼센트 축은 0–100, bytes는 공통 배율로 표시한다. null은 선을 끊고 현재 결측값을 과거값이나 0으로 바꾸지 않는다. 마지막 수집 시각과 중단 상태를 표시한다.

필터와 종류는 URL에 보존한다. 종류는 링크라 새 탭·뒤로 가기가 작동한다. 필터와 반복 탐색은 즉시 반응하며 장식 모션은 없다. 새로고침만 진행 피드백을 주고 reduced-motion을 존중한다. 차트 표 보기로 키보드/스크린리더에서 모든 측정값에 접근한다.

Monitoring data uses emitted migration counters and gauges. Shared workflow measurements use one neutral series; source/target comparisons appear only when the emitter identifies each environment. System metrics retain separate categories and require the owned deployment and container instance; shared app-instance networking is labeled explicitly. Observation logs page forward without changing filters.
