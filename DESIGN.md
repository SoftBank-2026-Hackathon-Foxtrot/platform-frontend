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

Unscanned → scan → gap → draft → apply/recheck → verified → approved. Counts are derived from the 12 example checks. Unscanned checks remain unknown. Draft/apply do not close the gap. Only a completed simulated verification exposes approval. Reset cancels the pending timer and clears the example history.

Resource selection is immediate. No entrances or stagger on frequently used controls. Busy feedback uses text and a spinner; reduced motion removes the spinner and sheet movement. Evidence uses a keyboard-accessible Sheet with focus restoration. Timeline timestamps use the active locale.

Below 1200px, the detail follows the map. Below 640px, the relationship map becomes an indented vertical tree with account labels; there is no horizontal canvas scrolling. Long English/Japanese copy wraps within its column. The current browser's narrow view is also a required verification target.

## Copy

Explain a finding or action, not a product promise: “Redis 접근 권한을 줄여야 합니다”, “변경안 확인”, “검사 근거 보기”. Keep “예시 데이터” and the simulation notice visible. No invented PRs, deployment logs, scan timestamps or AI summaries. Document implementation details in the handoff, not in an empty AI placeholder on the screen.

Reference: `migration-security-dashboard-handoff` images and SPEC at `d8ae63a`; existing platform source at `edb66ef`. Adapt its Kubernetes target to the user's Compose/Ansible environment.

# Monitoring

모니터링은 운영자가 기존 환경과 이전 환경의 OTEL 신호를 비교하고, 지표에서 트레이스와 로그까지 원인을 좁히는 화면이다. `SuperSon7/migration-monitoring-dashboard-handoff`의 SPEC과 목업을 기준으로 기존 develop 콘솔을 확장한다.

- 기존 PlatformShell, 중성 표면, Geist Variable, shadcn 컴포넌트를 유지한다. 본문은 `max-w-6xl`, 16px 모바일 / 32px 데스크톱 여백, 제목 24px, 본문 14px, 보조 12px, 차트 값 24px이다.
- 한글은 시스템 sans-serif로 대체한다. 시각·요청 경로·trace id·로그는 Geist Mono Variable 및 시스템 monospace를 사용한다. 수치는 tabular-nums다.
- 차트는 데스크톱 2열, 모바일 1열이다. 카드 간격 16px, 카드 안쪽 16px, 모서리는 기존 lg/xl 토큰을 사용한다. 표와 필터는 같은 페이지에 둔다.
- aws `#eb6834` / 다크 `#d95926`, gcp `#2a78d6` / 다크 `#3987e5`만 추가한다. 기존 success/warning/destructive/info는 수집·오류 상태에 사용한다. 모든 계열에는 텍스트 레이블을 병기한다.
- 차트는 같은 단위와 축, 2px 선, 3개 격자를 쓴다. null은 끊긴 선, 0은 실제 0, 미실행 대상은 값 없음으로 표시한다. API 미제공·로딩·조회 실패·빈 결과를 구분한다.
- 지표→시각 ±2분과 구성 요소→트레이스→연결 로그의 순서를 보존한다. URL 검색값과 해시가 탐색 상태를 유지한다. 여러 workflow는 머리줄 선택으로 전환한다.
- 커서 시각은 네 차트가 공유한다. 화살표 키로 시각을 고르고 Enter로 트레이스를 연다. 터치에는 시점 선택과 명시적 열기 버튼을 제공한다. 반복 탐색에 애니메이션을 추가하지 않으며 모션 감소 설정을 존중한다.
- 마이그레이션에는 진행·승인 요약을 남기고 상세 관측은 모니터링의 관측 탭으로 통합한다. 구성도 노드는 리소스·환경, 이벤트는 시각을 지정해 연다. 복귀 링크는 상단에 유지하고 출발 위치·포커스·이력 펼침 상태를 복원한다. 비교·상세 데이터는 기존 계약을 보존하며 예시 데이터는 명시적 데모 모드에서만 사용한다.
- 밝은 테마의 작은 경고 글자는 기존 warning 토큰에 foreground를 15% 혼합한다. 기본 토큰의 흰 배경 대비 3.75:1을 보완하기 위한 국소 변경이다. 다크 테마와 계열 색은 유지한다.
