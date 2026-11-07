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
