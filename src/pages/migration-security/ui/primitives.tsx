import type { CSSProperties, ReactNode } from "react";
import { CircleCheck, FileSearch, HelpCircle, RefreshCw, ShieldCheck, Ticket } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  kindMeta,
  type ConditionState,
  type Kind,
  type Phase,
  type Resource,
  type Status,
} from "../model/demo";

const symbols: Record<Status, string> = {
  ok: "✓",
  action: "!",
  unknown: "?",
  exception: "◇",
  na: "",
};
const labels: Record<Status, string> = {
  ok: "충족",
  action: "조치 필요",
  unknown: "미확인",
  exception: "예외",
  na: "해당 없음",
};
export function StatusBadge({
  status,
  plan = false,
  count,
}: {
  status: Status;
  plan?: boolean;
  count?: number;
}) {
  return (
    <Badge variant="outline" className={`sec-status sec-${status}`}>
      {symbols[status]} {plan && status === "ok" ? "계획상 충족" : labels[status]}
      {count !== undefined && ` ${count}`}
    </Badge>
  );
}
export function SourceLabel({ state, prefix }: { state: ConditionState; prefix?: string }) {
  const Icon =
    state.source === "live" ? CircleCheck : state.source === "declared" ? FileSearch : HelpCircle;
  return (
    <span className={`sec-source ${state.source === "none" ? "muted" : ""}`}>
      <Icon aria-hidden="true" />
      {prefix}
      {state.source === "live" ? "실측" : state.source === "declared" ? "계획 파일" : "출처 없음"}
    </span>
  );
}
// Tabler outline paths from the supplied handoff markup (MIT); no graph library required.
const iconPaths: Record<Kind, string[]> = {
  internet: [
    "M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0",
    "M3.6 9h16.8M3.6 15h16.8M11.5 3a17 17 0 0 0 0 18M12.5 3a17 17 0 0 1 0 18",
  ],
  edge: [
    "M6.657 18c-2.572 0 -4.657 -2.007 -4.657 -4.483c0 -2.475 2.085 -4.482 4.657 -4.482c.393 -1.762 1.794 -3.2 3.675 -3.773c1.88 -.572 3.956 -.193 5.444 1c1.488 1.19 2.162 3.007 1.77 4.769h.99c1.913 0 3.464 1.56 3.464 3.486c0 1.927 -1.551 3.487 -3.465 3.487h-11.878",
  ],
  proxy: [
    "M21 17h-5.397a5 5 0 0 1 -4.096 -2.133l-.514 -.734a5 5 0 0 0 -4.096 -2.133h-3.897M21 7h-5.395a5 5 0 0 0 -4.098 2.135l-.51 .73a5 5 0 0 1 -4.097 2.135h-3.9M18 10l3 -3l-3 -3M18 20l3 -3l-3 -3",
  ],
  compute: ["M12 3l8 4.5v9l-8 4.5l-8 -4.5v-9l8 -4.5M12 12l8 -4.5M12 12v9M12 12l-8 -4.5"],
  identity: [
    "M6 21v-2a4 4 0 0 1 4 -4h2M22 16c0 4 -2.5 6 -3.5 6s-3.5 -2 -3.5 -6c1 0 2.5 -.5 3.5 -1.5c1 1 2.5 1.5 3.5 1.5zM8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0",
  ],
  db: ["M4 6a8 3 0 1 0 16 0a8 3 0 1 0 -16 0M4 6v12a8 3 0 0 0 16 0V6M4 12a8 3 0 0 0 16 0"],
  cache: ["M13 2l-3 8h-7l8 12l3 -8h7z"],
  object_store: ["M4 5a8 3 0 1 0 16 0a8 3 0 1 0 -16 0M4 5l2 14a6 2 0 0 0 12 0l2 -14"],
};
export function ResourceIcon({ kind }: { kind: Kind }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {iconPaths[kind].map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}
export function ResourceDot({ resource }: { resource: Resource }) {
  return (
    <span
      className="sec-dot"
      style={{ background: kindMeta[resource.kind].color }}
      aria-hidden="true"
    />
  );
}
export function ResourceRound({
  resource,
  phase,
  children,
}: {
  resource: Resource;
  phase: Phase;
  children?: ReactNode;
}) {
  const changed =
    phase === "plan" &&
    (resource.name.current !== resource.name.plan ||
      resource.detail.current !== resource.detail.plan);
  return (
    <span
      className={`sec-round ${changed ? "planned" : ""}`}
      style={{ "--kind": kindMeta[resource.kind].color } as CSSProperties}
    >
      <ResourceIcon kind={resource.kind} />
      {children}
    </span>
  );
}
export function Evidence({ state, plan = false }: { state: ConditionState; plan?: boolean }) {
  return (
    <div className="sec-evidence">
      <SourceLabel state={state} />
      <pre className={plan ? "planned" : ""}>{state.evidence || "등록된 근거 없음"}</pre>
      {state.checkedAt && <time className="muted mono">{state.checkedAt}</time>}
    </div>
  );
}
export function PendingActions() {
  return (
    <div className="sec-pending">
      <span className="muted">실행 기능 · API 연결 예정</span>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" disabled>
          <Ticket />
          이슈 만들기
        </Button>
        <Button variant="outline" disabled>
          <ShieldCheck />
          예외 승인 요청
        </Button>
        <Button variant="outline" disabled>
          <RefreshCw />
          다시 검사
        </Button>
      </div>
    </div>
  );
}
