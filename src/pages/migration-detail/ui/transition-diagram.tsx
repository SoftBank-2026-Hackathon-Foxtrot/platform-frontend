import type { ComponentType, SVGProps } from "react";
import { Boxes, Cpu, Database, Globe, MemoryStick, Network, Waypoints } from "lucide-react";

import { STAGE_LABELS } from "@/entities/migration";

import type { Detail, Resource } from "../api/migrations";

/**
 * The migration as a stack diagram: user → traffic LB → source and target environments,
 * each resource's active side, sync arrows between sides, and a numbered callout on what the
 * current stage changes. Everything drawn comes from the detail response; unknown stays unknown.
 */

type Icon = ComponentType<SVGProps<SVGSVGElement>>;
type Box = { x: number; y: number; w: number; h: number };

const W = 1000;
const H = 640;
const PANEL = { y: 240, h: 380, w: 360 };
const SRC_X = 30;
const DST_X = W - 30 - PANEL.w;
const NODE = { w: 230, h: 58 };
const ROWS = { APP: 300, REDIS: 385, DATABASE: 465, OBJECT_STORAGE: 545 } as const;
type Row = keyof typeof ROWS;
const RESOURCE_ROWS: { kind: Exclude<Row, "APP">; label: string; icon: Icon }[] = [
  { kind: "REDIS", label: "Redis", icon: MemoryStick },
  { kind: "DATABASE", label: "데이터베이스", icon: Database },
  { kind: "OBJECT_STORAGE", label: "객체 저장소", icon: Boxes },
];
const LB = { x: W / 2, y: 150 };
const USER = { x: W / 2, y: 50 };
const CP = { x: W / 2, y: ROWS.APP };

const srcCx = SRC_X + PANEL.w / 2;
const dstCx = DST_X + PANEL.w / 2;

const LIFECYCLE: Record<string, string> = {
  SYNCING: "동기화 중",
  READY: "전환 준비됨",
  QUIESCED: "쓰기 정지",
  SWITCHED: "경로 전환됨",
  ACTIVE: "대상에서 운영",
  COMPLETED: "완료",
  ROLLED_BACK: "되돌림",
};
const SYNCING = new Set(["SYNCING", "READY", "QUIESCED", "SWITCHED", "ACTIVE"]);

function side(resource: Resource | undefined): { source: boolean; target: boolean } {
  const route = resource?.route;
  if (route === "TARGET") return { source: false, target: true };
  if (route === "MIXED") return { source: true, target: true };
  // No route reported yet: the application still runs on its source.
  return { source: true, target: false };
}

function weights(detail: Detail) {
  const last = detail.traffic.at(-1);
  const split = last?.effectivePercent ?? last?.requested ?? null;
  const { sourceEnv: src, targetEnv: dst } = detail.workflow;
  if (!split) return { src: 100, dst: 0, measured: false };
  return { src: split[src] ?? 0, dst: split[dst] ?? 0, measured: Boolean(last?.effectivePercent) };
}

/** What each stage changes, drawn as the callout box. */
function calloutFor(kind: string | undefined): { box: Box; text: string } | null {
  const row = (r: Row): Box => ({
    x: SRC_X - 12,
    y: ROWS[r] - NODE.h / 2 - 12,
    w: W - 2 * (SRC_X - 12),
    h: NODE.h + 24,
  });
  switch (kind) {
    case "PREPARE":
      return {
        box: { x: DST_X - 10, y: PANEL.y - 10, w: PANEL.w + 20, h: PANEL.h + 20 },
        text: "대상 환경 준비",
      };
    case "SYNC":
      return {
        box: {
          x: srcCx + NODE.w / 2 + 6,
          y: ROWS.REDIS - 44,
          w: dstCx - srcCx - NODE.w - 12,
          h: ROWS.OBJECT_STORAGE - ROWS.REDIS + 88,
        },
        text: "원본 → 대상 복제",
      };
    case "OBJECT_CUTOVER":
      return { box: row("OBJECT_STORAGE"), text: "객체 저장소 경로 전환" };
    case "REDIS_CUTOVER":
      return { box: row("REDIS"), text: "Redis 경로 전환" };
    case "DATABASE_CUTOVER":
      return { box: row("DATABASE"), text: "DB 쓰기 전환" };
    case "CANARY":
      return {
        box: { x: LB.x - 110, y: LB.y - 40, w: 220 + (dstCx - LB.x) - 40, h: ROWS.APP - LB.y + 20 },
        text: "카나리 트래픽",
      };
    case "TRAFFIC":
      return {
        box: { x: srcCx - 60, y: LB.y - 40, w: dstCx - srcCx + 120, h: ROWS.APP - LB.y + 20 },
        text: "트래픽 단계 전환",
      };
    case "FINALIZE":
      return {
        box: { x: SRC_X - 10, y: PANEL.y - 10, w: PANEL.w + 20, h: PANEL.h + 20 },
        text: "원본 정리",
      };
    default:
      return null;
  }
}

export function TransitionDiagram({ data }: { data: Detail }) {
  const wf = data.workflow;
  const stage = data.stages.find((item) => item.index === wf.currentStage);
  const finished = wf.status === "COMPLETED" || wf.status === "ABORTED";
  const waiting = wf.status === "WAITING_APPROVAL" || wf.status === "PLANNED";
  const halted = wf.status === "HALTED";
  const callout = finished ? null : calloutFor(stage?.kind);
  const traffic = weights(data);
  const byKind = new Map(data.resources.map((r) => [r.kind, r]));
  const envActors = (env: string) => {
    const actors = data.hold.actors.filter((a) => a.actorId.includes(`-${env}-`));
    return {
      reported: actors.reduce((sum, a) => sum + a.reported, 0),
      expected: actors.reduce((sum, a) => sum + a.expected, 0),
    };
  };
  const probe = (env: string) => data.businessProbes.find((p) => p.env === env)?.latest;
  const held = data.hold.desired === "HOLD";

  return (
    <figure className="space-y-3">
      <div className="overflow-x-auto rounded-xl border bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:18px_18px]">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="min-w-[760px] text-foreground"
          role="img"
          aria-label={`${wf.sourceEnv}에서 ${wf.targetEnv}로 이전하는 구성도`}
        >
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="11"
              markerHeight="11"
              orient="auto-start-reverse"
              markerUnits="userSpaceOnUse"
            >
              <path d="M0,0 L10,5 L0,10 z" className="fill-muted-foreground" />
            </marker>
            <marker
              id="arrow-live"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="11"
              markerHeight="11"
              orient="auto-start-reverse"
              markerUnits="userSpaceOnUse"
            >
              <path d="M0,0 L10,5 L0,10 z" className="fill-info" />
            </marker>
          </defs>

          <Panel
            x={SRC_X}
            env={wf.sourceEnv}
            role="원본"
            retired={finished && wf.status === "COMPLETED"}
          />
          <Panel x={DST_X} env={wf.targetEnv} role="대상" />

          {/* user → LB */}
          <line
            x1={USER.x}
            y1={USER.y + 26}
            x2={LB.x}
            y2={LB.y - 30}
            className="stroke-muted-foreground"
            strokeWidth={1.5}
            markerEnd="url(#arrow)"
          />
          <text
            x={USER.x + 10}
            y={(USER.y + LB.y) / 2 + 4}
            className="fill-muted-foreground text-[12px]"
          >
            HTTPS
          </text>

          {/* LB → apps, width follows the traffic split */}
          <TrafficEdge toX={srcCx} percent={traffic.src} measured={traffic.measured} />
          <TrafficEdge toX={dstCx} percent={traffic.dst} measured={traffic.measured} />

          <Node
            cx={USER.x}
            cy={USER.y}
            w={150}
            h={52}
            icon={Globe}
            title="사용자"
            sub="공용 트래픽"
          />
          <Node
            cx={LB.x}
            cy={LB.y}
            w={190}
            h={58}
            icon={Network}
            title="Traffic LB"
            sub={`${wf.sourceEnv} ${traffic.src}% · ${wf.targetEnv} ${traffic.dst}%`}
          />

          {/* control plane ↔ apps: the workload directive */}
          <line
            x1={CP.x - 75}
            y1={CP.y}
            x2={srcCx + NODE.w / 2}
            y2={CP.y}
            className="stroke-muted-foreground"
            strokeDasharray="4 4"
          />
          <line
            x1={CP.x + 75}
            y1={CP.y}
            x2={dstCx - NODE.w / 2}
            y2={CP.y}
            className="stroke-muted-foreground"
            strokeDasharray="4 4"
          />
          <Node
            cx={CP.x}
            cy={CP.y}
            w={150}
            h={58}
            icon={Waypoints}
            title="컨트롤 플레인"
            sub={`업무 지시 ${data.hold.desired}`}
            tone={held ? "warn" : undefined}
          />

          {[wf.sourceEnv, wf.targetEnv].map((env, i) => {
            const counts = envActors(env);
            const latest = probe(env);
            const share = i === 0 ? traffic.src : traffic.dst;
            return (
              <Node
                key={env}
                cx={i === 0 ? srcCx : dstCx}
                cy={ROWS.APP}
                w={NODE.w}
                h={NODE.h}
                icon={Cpu}
                title={`앱 · ${counts.reported}/${counts.expected} 프로세스`}
                sub={
                  latest
                    ? latest.passed
                      ? "업무 검사 통과"
                      : `업무 검사 실패 ${latest.reason}`
                    : "업무 검사 미확인"
                }
                tone={latest && !latest.passed ? "bad" : share > 0 ? "live" : undefined}
                dim={share === 0 && !(i === 0)}
              />
            );
          })}

          {RESOURCE_ROWS.map(({ kind, label, icon }) => {
            const resource = byKind.get(kind);
            const active = side(resource);
            const lifecycle = resource?.lifecycle ?? null;
            const syncing = lifecycle !== null && SYNCING.has(lifecycle);
            const reverse = active.target && !active.source && syncing;
            const y = ROWS[kind];
            const state = lifecycle ? (LIFECYCLE[lifecycle] ?? lifecycle) : "등록 대기";
            return (
              <g key={kind}>
                <SyncArrow y={y} on={syncing && !reverse} label={syncing ? "복제" : ""} />
                {reverse && <SyncArrow y={y} on reverse label="역방향 복제" />}
                <Node
                  cx={srcCx}
                  cy={y}
                  w={NODE.w}
                  h={NODE.h}
                  icon={icon}
                  title={label}
                  sub={active.source ? `사용 중 · ${state}` : state}
                  tone={active.source ? "live" : undefined}
                  dim={!active.source}
                />
                <Node
                  cx={dstCx}
                  cy={y}
                  w={NODE.w}
                  h={NODE.h}
                  icon={icon}
                  title={label}
                  sub={active.target ? `사용 중 · ${state}` : lifecycle ? state : "준비 전"}
                  tone={active.target ? "live" : undefined}
                  dim={!active.target}
                />
              </g>
            );
          })}

          {callout && stage && (
            <g className={wf.status === "RUNNING" ? "animate-pulse" : undefined}>
              <rect
                x={callout.box.x}
                y={callout.box.y}
                width={callout.box.w}
                height={callout.box.h}
                rx={16}
                className={
                  halted ? "fill-destructive/5 stroke-destructive" : "fill-callout/5 stroke-callout"
                }
                strokeWidth={2.5}
              />
              <circle
                cx={callout.box.x + 4}
                cy={callout.box.y + 4}
                r={15}
                className={halted ? "fill-destructive" : "fill-callout"}
              />
              <text
                x={callout.box.x + 4}
                y={callout.box.y + 9}
                textAnchor="middle"
                className="fill-white text-[15px] font-bold"
              >
                {stage.index + 1}
              </text>
              <text
                x={callout.box.x + 26}
                y={callout.box.y - 6}
                className={`text-[12px] font-semibold ${halted ? "fill-destructive" : "fill-callout"}`}
              >
                {callout.text}
                {waiting ? " · 승인 대기" : halted ? " · 멈춤" : ""}
              </text>
            </g>
          )}
        </svg>
      </div>
      <figcaption className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
        <Legend className="border-success bg-success/15" text="현재 사용 중인 쪽" />
        <Legend className="border-dashed border-muted-foreground" text="대기·미사용" />
        <span className="flex items-center gap-1.5">
          <span className="h-0 w-6 border-t-2 border-dashed border-info" /> 움직이는 선: 복제 중
        </span>
        <Legend
          className="border-callout"
          text={`번호: 현재 단계${stage ? ` (${stage.index + 1}. ${STAGE_LABELS[stage.kind] ?? stage.kind})` : ""}`}
        />
        {!traffic.measured && <span>트래픽 비율은 LB 측정 전 기본값입니다.</span>}
      </figcaption>
    </figure>
  );
}

function Legend({ className, text }: { className: string; text: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`size-3 rounded border-2 ${className}`} /> {text}
    </span>
  );
}

function Panel({
  x,
  env,
  role,
  retired,
}: {
  x: number;
  env: string;
  role: string;
  retired?: boolean;
}) {
  return (
    <g>
      <rect
        x={x}
        y={PANEL.y}
        width={PANEL.w}
        height={PANEL.h}
        rx={18}
        className={`fill-card/60 stroke-border ${retired ? "opacity-50" : ""}`}
        strokeWidth={1.5}
      />
      <text x={x + 18} y={PANEL.y + 26} className="fill-foreground text-[14px] font-semibold">
        {env}
      </text>
      <text
        x={x + PANEL.w - 18}
        y={PANEL.y + 26}
        textAnchor="end"
        className="fill-muted-foreground text-[12px]"
      >
        {role}
        {retired ? " · 정리 대상" : ""}
      </text>
    </g>
  );
}

function TrafficEdge({
  toX,
  percent,
  measured,
}: {
  toX: number;
  percent: number;
  measured: boolean;
}) {
  const live = percent > 0;
  const path = `M ${LB.x} ${LB.y + 29} C ${LB.x} ${LB.y + 80}, ${toX} ${LB.y + 50}, ${toX} ${ROWS.APP - NODE.h / 2 - 4}`;
  const midX = (LB.x + toX) / 2;
  return (
    <g>
      <path
        d={path}
        fill="none"
        className={live ? "stroke-info" : "stroke-muted-foreground/50"}
        strokeWidth={live ? 1.5 + (percent / 100) * 5 : 1.2}
        strokeDasharray={live ? "8 6" : "3 5"}
        markerEnd={live ? "url(#arrow-live)" : "url(#arrow)"}
        style={live ? { animation: "diagram-flow 1s linear infinite" } : undefined}
      />
      <text
        x={midX}
        y={LB.y + 62}
        textAnchor="middle"
        className={`text-[13px] font-semibold ${live ? "fill-info" : "fill-muted-foreground"}`}
      >
        {percent}%{measured ? "" : "*"}
      </text>
    </g>
  );
}

function SyncArrow({
  y,
  on,
  reverse,
  label,
}: {
  y: number;
  on: boolean;
  reverse?: boolean;
  label: string;
}) {
  const x1 = srcCx + NODE.w / 2 + 4;
  const x2 = dstCx - NODE.w / 2 - 4;
  const offset = reverse ? 10 : on ? -6 : 0;
  return (
    <g>
      <line
        x1={reverse ? x2 : x1}
        y1={y + offset}
        x2={reverse ? x1 : x2}
        y2={y + offset}
        className={on ? "stroke-info" : "stroke-muted-foreground/40"}
        strokeWidth={on ? 2.5 : 1}
        strokeDasharray={on ? "8 6" : "2 6"}
        markerEnd={on ? "url(#arrow-live)" : undefined}
        style={on ? { animation: "diagram-flow 0.8s linear infinite" } : undefined}
      />
      {label && (
        <text
          x={(x1 + x2) / 2}
          y={y + offset - 8}
          textAnchor="middle"
          className="fill-info text-[11px] font-medium"
        >
          {label}
        </text>
      )}
    </g>
  );
}

function Node({
  cx,
  cy,
  w,
  h,
  icon: IconComponent,
  title,
  sub,
  tone,
  dim,
}: {
  cx: number;
  cy: number;
  w: number;
  h: number;
  icon: Icon;
  title: string;
  sub: string;
  tone?: "live" | "warn" | "bad";
  dim?: boolean;
}) {
  const x = cx - w / 2;
  const y = cy - h / 2;
  const stroke =
    tone === "live"
      ? "stroke-success"
      : tone === "warn"
        ? "stroke-warning"
        : tone === "bad"
          ? "stroke-destructive"
          : "stroke-border";
  return (
    <g className={dim ? "opacity-55" : undefined}>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={12}
        className={`fill-card ${stroke}`}
        strokeWidth={tone ? 2 : 1.2}
        strokeDasharray={dim ? "5 4" : undefined}
      />
      <rect
        x={x + 10}
        y={cy - 17}
        width={34}
        height={34}
        rx={9}
        className={tone === "live" ? "fill-success/15" : "fill-muted"}
      />
      <IconComponent
        x={x + 17}
        y={cy - 10}
        width={20}
        height={20}
        className={tone === "live" ? "text-success" : "text-foreground"}
      />
      <text x={x + 54} y={cy - 3} className="fill-foreground text-[13px] font-semibold">
        {title}
      </text>
      <text x={x + 54} y={cy + 14} className="fill-muted-foreground text-[11px]">
        {sub.length > 26 ? `${sub.slice(0, 25)}…` : sub}
      </text>
    </g>
  );
}
