import { useId } from "react";
import { t, useLocale, localeTag } from "@/shared/lib/i18n";
import type { Detail, Resource } from "../api/migrations";
import { FlowStory, PreparationActivity, TrafficMeter } from "./flow-activity";
import {
  activeSides,
  copyProgress,
  preparationFlow,
  RESOURCE_FLOW,
  resourceFlow,
  trafficFlow,
} from "./flow-model";
import { STACK_ICONS } from "./stack-icons";
import { activeModule, STEP_LABELS } from "./module-detail-model";
import "./flow-visuals.css";

// stack-diagram tiles and orthogonal edges, arranged as paired source/target rows.
const W = 1080;
const H = 594;
const GROUPS = [
  { x: 24, cx: 200 },
  { x: 704, cx: 880 },
] as const;
const ROWS = [344, 424, 504] as const;
const LIFECYCLE: Record<string, string> = {
  PREPARED: "준비 완료",
  SYNCING: "복제 중",
  READY: "전환 준비됨",
  QUIESCED: "쓰기 정지",
  SWITCHED: "경로 전환됨",
  ACTIVE: "운영 중",
  COMPLETED: "완료",
  RESTORED: "원본 복귀",
};
const CSS = `
.migration-stack { --stack-paper:var(--card); --stack-ink:var(--foreground); --stack-muted:var(--muted-foreground); --stack-rule:var(--border); --stack-accent:var(--info); color:var(--stack-ink); }
.migration-stack .diagram-layout { display:grid; gap:12px; min-width:0; }
.migration-stack .diagram-info { display:flex; flex-direction:column; gap:12px; min-width:0; }
.migration-stack .diagram-scene { display:block; width:100%; min-width:760px; max-width:1080px; margin-inline:auto; }
@media(min-width:1100px) {
  .migration-stack .diagram-layout { grid-template-columns:184px minmax(0,1fr); align-items:start; }
  .migration-stack .diagram-info { padding-right:12px; border-right:1px solid var(--border); }
  .migration-stack .diagram-info .flow-story { align-items:flex-start; flex-direction:column; gap:8px; }
  .migration-stack .diagram-info .flow-story > .ml-auto { margin-left:0; }
  .migration-stack .diagram-info .grid { grid-template-columns:minmax(0,1fr); }
  .migration-stack .diagram-info .traffic-meter > div:first-child { display:grid; grid-template-columns:1fr 1fr; }
  .migration-stack .diagram-info .traffic-meter > div:first-child > span:nth-child(2) { grid-column:1 / -1; grid-row:2; }
  .migration-stack .diagram-info .traffic-meter > div:first-child > span:nth-child(3) { text-align:right; }
  .migration-stack .diagram-scene { min-width:0; max-width:min(1080px,calc(max(320px,100dvh - 240px) * var(--diagram-ratio))); }
}
.migration-stack .canvas { position:relative; width:1080px; height:594px; background-color:var(--stack-paper); background-image:radial-gradient(color-mix(in oklch,var(--border) 70%,transparent) 1px,transparent 1px); background-size:18px 18px; }
.migration-stack .group { position:absolute; top:218px; width:352px; height:360px; border:1px solid var(--border); border-radius:8px; background:color-mix(in oklch,var(--muted) 10%,transparent); }
.migration-stack .group.aws { border-color:color-mix(in oklch,var(--muted-foreground) 60%,transparent); }
.migration-stack .group.gcp { border-color:color-mix(in oklch,var(--info) 65%,transparent); }
.migration-stack .group[data-focus=true] { box-shadow:inset 0 0 0 1px var(--info); }
.migration-stack .group-head { position:absolute; top:12px; left:14px; right:14px; display:flex; align-items:center; gap:8px; font-size:12px; font-weight:600; }
.migration-stack .group-head img { width:22px; height:22px; object-fit:contain; }
.migration-stack .group-head .role { margin-left:auto; color:var(--muted-foreground); font-size:10px; font-family:ui-monospace,monospace; }
.migration-stack .dk { display:none; }
.dark .migration-stack .lt { display:none; }
.dark .migration-stack .dk { display:block; }
.migration-stack .node { position:absolute; display:flex; align-items:center; gap:12px; width:248px; height:56px; padding:6px 10px; border:1px solid var(--border); border-radius:10px; background:var(--card); }
.migration-stack .tile { position:relative; display:grid; place-items:center; flex-shrink:0; width:40px; height:40px; border:1px solid #d9dfe7; border-radius:9px; background:#fff; }
.migration-stack .tile img { width:27px; height:27px; object-fit:contain; }
.migration-stack .node[data-state=active] { border-color:var(--success); background:color-mix(in oklch,var(--success) 5%,var(--card)); }
.migration-stack .node[data-state=focus] { border-color:var(--info); }
.migration-stack .node[data-state=error] { border-color:var(--destructive); }
.migration-stack .dot { position:absolute; right:-3px; top:-3px; width:8px; height:8px; border-radius:50%; background:var(--success); border:2px solid var(--card); }
.migration-stack .name { font-size:13px; font-weight:600; line-height:19px; }
.migration-stack .sub { font-size:10px; line-height:16px; font-family:ui-monospace,monospace; color:var(--muted-foreground); }
.migration-stack .edge { fill:none; stroke:var(--muted-foreground); stroke-width:1.3; }
.migration-stack .control { stroke-dasharray:4 5; opacity:.45; }
.migration-stack .edge-label { font:10px ui-monospace,monospace; fill:var(--muted-foreground); paint-order:stroke; stroke:var(--card); stroke-width:5px; stroke-linejoin:round; }
.migration-stack .edge-label.live-label { fill:var(--info); }
.migration-stack .copy-link { fill:none; stroke:var(--muted-foreground); stroke-width:1.2; stroke-dasharray:3 6; opacity:.3; }
.migration-stack .copy-link.active { stroke:var(--info); stroke-width:2; opacity:1; }
.migration-stack .copy-link.moving { stroke-dasharray:7 7; animation:copy-dashes 1s linear infinite; }
.migration-stack .copy-packet { fill:var(--info); offset-distance:0%; animation:request-travel 2s linear infinite; }
.migration-stack .copy-label { font-size:11px; font-weight:600; }
.migration-stack .module-detail-node { animation:module-detail-reveal .2s ease-out; }
@keyframes module-detail-reveal { from { opacity:0; } to { opacity:1; } }
@keyframes copy-dashes { to { stroke-dashoffset:-28; } }
`;
function cloud(env: string) {
  if (env.toLowerCase() === "aws") return { name: "AWS Cloud", icon: "aws" as const, style: "aws" };
  if (env.toLowerCase() === "gcp")
    return { name: "Google Cloud", icon: "gcp" as const, style: "gcp" };
  return { name: env, icon: "server" as const, style: "" };
}
function StackNode({
  cx,
  top,
  icon,
  name,
  sub,
  state,
  motion,
  stale,
  changing,
  width = 248,
}: {
  cx: number;
  top: number;
  icon: keyof typeof STACK_ICONS;
  name: string;
  sub: string;
  width?: number;
  state?: "active" | "focus" | "error";
  motion?: "copying" | "preparing";
  stale?: boolean;
  changing?: boolean;
}) {
  useLocale();
  return (
    <div
      className="node justify-start whitespace-normal text-left"
      style={{ left: cx - width / 2, top, width }}
      data-state={state}
      data-motion={motion}
      data-stale={stale}
      data-changing={changing}
      title={t(name) + " · " + sub}
    >
      <div className="tile">
        <img src={STACK_ICONS[icon]} alt="" />
        {state === "active" && <span className="dot" />}
      </div>
      <div className="min-w-0">
        <div className="name truncate">{t(name)}</div>
        <div className="sub truncate">{sub}</div>
      </div>
    </div>
  );
}
function transferMetric(resource: Resource | undefined) {
  const progress = copyProgress(resource);
  const count = (n: number) =>
    new Intl.NumberFormat(localeTag(), { maximumFractionDigits: 1 }).format(n);
  if (progress)
    return (
      count(progress.completed) +
      " / " +
      count(progress.total) +
      " " +
      t(progress.unit) +
      (progress.percent === null ? "" : " · " + count(progress.percent) + "%")
    );
  const sync = resource?.details.redis?.sync;
  const backlog =
    sync?.backlog ??
    resource?.replication?.forward?.backlog ??
    resource?.replication?.reverse?.backlog;
  if (sync?.copied != null)
    return (
      t("처리 {0}건 · 전체 수량 미보고", [count(sync.copied)]) +
      (backlog == null ? "" : " · backlog " + count(backlog))
    );
  if (backlog != null) return "backlog " + count(backlog);
  return t("진행량 미보고");
}
export function TransitionDiagram({
  data,
  suspended = false,
}: {
  data: Detail;
  suspended?: boolean;
}) {
  useLocale();
  const marker = useId().replaceAll(":", "");
  const arrow = "url(#" + marker + ")";
  const wf = data.workflow;
  const stage = data.stages.find((item) => item.index === wf.currentStage);
  const finished = ["COMPLETED", "ABORTED"].includes(wf.status);
  const traffic = trafficFlow(data);
  const preparation = preparationFlow(data);
  const candidate = activeModule(data);
  const expanded = RESOURCE_FLOW.findIndex((item) => item.kind === candidate);
  const height = H + (expanded >= 0 ? 96 : 0);
  const rows = ROWS.map((row, index) => row + (expanded >= 0 && index > expanded ? 96 : 0));
  const expandedItem = expanded >= 0 ? RESOURCE_FLOW[expanded] : undefined;
  const expandedTop = expanded >= 0 ? rows[expanded]! : 0;
  const expandedResource = data.resources.find((item) => item.kind === expandedItem?.kind);
  const detailFlow = resourceFlow(data, expandedResource);
  const preparing = !suspended && stage?.kind === "PREPARE" && preparation.running;
  const environments = [wf.sourceEnv, wf.targetEnv] as const;
  const byKind = new Map(data.resources.map((resource) => [resource.kind, resource]));
  const focused = (kind: string) =>
    !finished &&
    (stage?.kind === "SYNC" ||
      stage?.kind === kind + "_CUTOVER" ||
      (kind === "OBJECT_STORAGE" && stage?.kind === "OBJECT_CUTOVER"));
  const label = t("{0}에서 {1}로 이전하는 구성도", environments);
  return (
    <figure className="migration-stack space-y-2" data-suspended={suspended}>
      <style>{CSS}</style>
      <div className="diagram-layout">
        <aside className="diagram-info" aria-label={t("전환 구성도")}>
          <div className="space-y-1">
            <h2 className="text-sm font-semibold">{t("전환 구성도")}</h2>
            <p className="text-[10px] leading-relaxed text-muted-foreground">
              {t("리소스 사용 위치 · 복제 상태 · 현재 전환 단계 · 2초마다 갱신")}
            </p>
          </div>
          <FlowStory data={data} />
          {suspended && (
            <p className="text-xs text-warning">{t("관측 갱신 실패 · 마지막 상태 표시")}</p>
          )}
          <TrafficMeter data={data} />
          {stage?.kind === "PREPARE" && <PreparationActivity data={data} />}
        </aside>
        <div className="overflow-x-auto rounded-md border">
          <svg
            viewBox={`0 0 ${W} ${height}`}
            className="diagram-scene"
            style={{ "--diagram-ratio": W / height } as React.CSSProperties}
            role="group"
            aria-label={label}
          >
            <title>{label}</title>
            <foreignObject width={W} height={height}>
              <div className="canvas" style={{ height }} data-expanded-module={expandedItem?.kind}>
                {environments.map((env, index) => {
                  const provider = cloud(env);
                  return (
                    <div
                      key={env}
                      className={"group " + provider.style}
                      data-preparing={preparing && index === 1}
                      data-focus={
                        !finished &&
                        ((stage?.kind === "PREPARE" && index === 1) ||
                          (stage?.kind === "FINALIZE" && index === 0))
                      }
                      style={{
                        left: GROUPS[index === 0 ? 0 : 1].x,
                        height: 360 + (expanded >= 0 ? 96 : 0),
                      }}
                    >
                      <div className="group-head">
                        {provider.icon === "aws" ? (
                          <>
                            <img className="lt" src={STACK_ICONS.aws} alt="" />
                            <img className="dk" src={STACK_ICONS.aws_dark} alt="" />
                          </>
                        ) : (
                          <img src={STACK_ICONS[provider.icon]} alt="" />
                        )}
                        {provider.name}
                        <span className="font-normal text-muted-foreground">/ {env}</span>
                        <span className="role">{t(index === 0 ? "원본" : "대상")}</span>
                      </div>
                    </div>
                  );
                })}
                <svg className="absolute inset-0" width={W} height={height} aria-hidden="true">
                  <defs>
                    <marker
                      id={marker}
                      viewBox="0 0 10 10"
                      refX="9"
                      refY="5"
                      markerWidth="8"
                      markerHeight="8"
                      markerUnits="userSpaceOnUse"
                      orient="auto-start-reverse"
                    >
                      <path
                        d="M1 1 L9 5 L1 9"
                        fill="none"
                        stroke="context-stroke"
                        strokeWidth="1.5"
                      />
                    </marker>
                  </defs>
                  <path className="edge" d="M540 74 V96" markerEnd={arrow} />
                  <text className="edge-label" x="554" y="89">
                    HTTPS
                  </text>
                  {GROUPS.map((_, index) => {
                    const share = traffic.shown?.[index === 0 ? 0 : 1];
                    const confirmed = traffic.confirmed?.[index === 0 ? 0 : 1];
                    const path =
                      index === 0 ? "M530 164 V190 H388 V292 H330" : "M550 164 V190 H692 V292 H750";
                    const packets =
                      traffic.moving && !suspended && confirmed != null && confirmed > 0
                        ? Math.max(1, Math.round(confirmed / 5))
                        : 0;
                    return (
                      <g
                        key={index}
                        className={index === 0 ? "traffic-source" : "traffic-target"}
                        data-traffic-branch={environments[index === 0 ? 0 : 1]}
                      >
                        <path
                          className={"traffic-path " + (traffic.confirmed ? "" : "pending")}
                          d={path}
                          strokeWidth={share == null || share === 0 ? 1 : 2 + (share / 100) * 2.5}
                          opacity={share === 0 ? 0.2 : 1}
                          markerEnd={arrow}
                        />
                        {Array.from({ length: packets }, (_, packet) => (
                          <circle
                            key={packet}
                            r="2.5"
                            className="traffic-packet"
                            style={{
                              offsetPath: `path("${path}")`,
                              animationDelay: `${(-packet * 3) / Math.max(1, packets)}s`,
                            }}
                          />
                        ))}
                        <text
                          className="edge-label"
                          x={index === 0 ? 450 : 630}
                          y="181"
                          textAnchor="middle"
                        >
                          {share == null ? t("비율 미확인") : share + "%"}
                        </text>
                        <path
                          className="edge control"
                          d={index === 0 ? "M444 292 H430 V312 H330" : "M636 292 H650 V312 H750"}
                          markerEnd={arrow}
                        />
                      </g>
                    );
                  })}
                  {RESOURCE_FLOW.map((item, index) => {
                    const resource = byKind.get(item.kind);
                    const observedFlow = resourceFlow(data, resource);
                    const flow = { ...observedFlow, moving: observedFlow.moving && !suspended };
                    const sides = activeSides(resource);
                    const y = rows[index === 0 ? 0 : index === 1 ? 1 : 2]! + 28;
                    const directions =
                      flow.forward && flow.reverse
                        ? (["forward", "reverse"] as const)
                        : flow.reverse
                          ? (["reverse"] as const)
                          : (["forward"] as const);
                    const location =
                      sides.source && sides.target
                        ? wf.sourceEnv + " + " + wf.targetEnv
                        : sides.target
                          ? wf.targetEnv
                          : sides.source
                            ? wf.sourceEnv
                            : t("미확인");
                    if (index === expanded) {
                      const top = y - 28;
                      const sourceActive = resource?.route === "SOURCE";
                      const targetActive = resource?.route === "TARGET";
                      const reverseOnly = flow.reverse && !flow.forward;
                      return (
                        <g
                          key={item.kind}
                          data-copy-link={item.kind}
                          data-module-detail-edges={item.kind}
                        >
                          <path
                            className="edge control"
                            d={`M636 292 H666 V${top + 18} H626`}
                            markerEnd={arrow}
                          />
                          <path
                            className="edge"
                            style={{ stroke: sourceActive ? "var(--info)" : undefined }}
                            opacity={sourceActive ? 1 : 0.25}
                            d={`M330 ${top + 22} H454`}
                            markerEnd={arrow}
                          />
                          <path
                            className="edge"
                            style={{ stroke: targetActive ? "var(--info)" : undefined }}
                            opacity={targetActive ? 1 : 0.25}
                            d={`M626 ${top + 22} H750`}
                            markerEnd={arrow}
                          />
                          {[
                            reverseOnly
                              ? `M454 ${top + 98} H370 V${top + 44} H330`
                              : `M330 ${top + 44} H370 V${top + 98} H454`,
                            reverseOnly
                              ? `M750 ${top + 44} H710 V${top + 98} H626`
                              : `M626 ${top + 98} H710 V${top + 44} H750`,
                          ].map((path, line) => (
                            <path
                              key={line}
                              d={path}
                              className={
                                "copy-link " +
                                (flow.copying && !flow.stale ? "active " : "") +
                                (flow.moving ? "moving" : "")
                              }
                              markerEnd={flow.copying ? arrow : undefined}
                              markerStart={flow.forward && flow.reverse ? arrow : undefined}
                            />
                          ))}
                          <text className="edge-label" x="540" y={top + 145} textAnchor="middle">
                            {transferMetric(resource)}
                          </text>
                        </g>
                      );
                    }
                    return (
                      <g key={item.kind} data-copy-link={item.kind} data-copy-moving={flow.moving}>
                        {directions.map((direction, line) => {
                          const row = y + (directions.length > 1 ? (line === 0 ? -4 : 4) : 0);
                          const path =
                            direction === "reverse" ? `M750 ${row} H330` : `M330 ${row} H750`;
                          return (
                            <g key={direction}>
                              <path
                                d={path}
                                className={
                                  "copy-link " +
                                  (flow.copying && !flow.stale ? "active " : "") +
                                  (flow.moving ? "moving" : "")
                                }
                                markerEnd={flow.copying ? arrow : undefined}
                              />
                              {flow.moving &&
                                [0, 1, 2, 3].map((packet) => (
                                  <rect
                                    key={packet}
                                    width="7"
                                    height="4"
                                    x="-3.5"
                                    y="-2"
                                    rx="1"
                                    className="copy-packet"
                                    style={{
                                      offsetPath: `path("${path}")`,
                                      animationDelay: `${-packet * 0.5}s`,
                                    }}
                                  />
                                ))}
                            </g>
                          );
                        })}
                        <text
                          className={"edge-label copy-label " + (flow.moving ? "live-label" : "")}
                          x="540"
                          y={y - 14}
                          textAnchor="middle"
                        >
                          {t(suspended ? "관측 갱신 대기" : flow.label)}
                          {flow.reverse
                            ? " · " + t(flow.forward ? "양방향 복제" : "역방향 복제")
                            : ""}
                        </text>
                        <text className="edge-label" x="540" y={y + 15} textAnchor="middle">
                          {transferMetric(resource)}
                        </text>
                        <text className="edge-label" x="540" y={y + 34} textAnchor="middle">
                          {t(item.binding)} → {location}
                        </text>
                      </g>
                    );
                  })}
                </svg>
                {expandedItem && (
                  <div className="module-detail-node" data-module-detail={expandedItem.kind}>
                    <StackNode
                      cx={540}
                      top={expandedTop}
                      width={164}
                      icon="server"
                      name={
                        expandedItem.kind === "REDIS"
                          ? "Redis proxy"
                          : expandedItem.kind === "DATABASE"
                            ? "PgBouncer"
                            : "객체 라우터"
                      }
                      sub={t(
                        suspended
                          ? "관측 갱신 대기"
                          : (STEP_LABELS[stage?.step ?? ""] ?? stage?.step ?? "단계 보고 대기"),
                      )}
                      state="focus"
                    />
                    <StackNode
                      cx={540}
                      top={expandedTop + 70}
                      width={164}
                      icon="server"
                      name={expandedItem.kind === "REDIS" ? "Sync Worker" : "데이터 복제"}
                      sub={t(suspended ? "관측 갱신 대기" : detailFlow.label)}
                      motion={!suspended && detailFlow.moving ? "copying" : undefined}
                      stale={detailFlow.stale}
                    />
                  </div>
                )}
                <StackNode
                  cx={540}
                  top={12}
                  width={180}
                  icon="user"
                  name={t("사용자")}
                  sub={t("공용 서비스")}
                />
                <StackNode
                  cx={540}
                  top={102}
                  width={208}
                  icon="cloudflare"
                  name="Traffic LB"
                  sub={t(
                    traffic.confirmed
                      ? "LB 확인 가중치"
                      : traffic.requested
                        ? "요청 가중치 · 확인 전"
                        : "트래픽 관측 대기",
                  )}
                  state={
                    !finished && (stage?.kind === "TRAFFIC" || stage?.kind === "CANARY")
                      ? "focus"
                      : undefined
                  }
                />
                <StackNode
                  cx={540}
                  top={264}
                  width={180}
                  icon="control"
                  name="Control plane"
                  sub={t("업무 지시 · ") + data.hold.desired}
                  state={data.hold.desired === "HOLD" ? "focus" : undefined}
                />
                {environments.map((env, index) => {
                  const actors = data.hold.actors.filter((actor) =>
                    actor.actorId.includes("-" + env + "-"),
                  );
                  const reported = actors.reduce((sum, actor) => sum + actor.reported, 0);
                  const expected = actors.reduce((sum, actor) => sum + actor.expected, 0);
                  const cx = GROUPS[index === 0 ? 0 : 1].cx;
                  return (
                    <div key={env}>
                      <StackNode
                        cx={cx}
                        top={264}
                        icon="app"
                        name={t("{0} 애플리케이션", [env])}
                        sub={t("{0}/{1} 프로세스", [reported, expected])}
                        state={
                          (traffic.confirmed?.[index === 0 ? 0 : 1] ?? 0) > 0 ? "active" : undefined
                        }
                        motion={
                          preparing &&
                          index === 1 &&
                          !preparation.rows.find((row) => row.kind === "COMPUTE")?.done
                            ? "preparing"
                            : undefined
                        }
                      />
                      {RESOURCE_FLOW.map((item, row) => {
                        const resource = byKind.get(item.kind);
                        const observedFlow = resourceFlow(data, resource);
                        const flow = { ...observedFlow, moving: observedFlow.moving && !suspended };
                        const sides = activeSides(resource);
                        const active = index === 0 ? sides.source : sides.target;
                        return (
                          <StackNode
                            key={item.kind + (resource?.route ?? "UNKNOWN")}
                            cx={cx}
                            top={rows[row === 0 ? 0 : row === 1 ? 1 : 2]!}
                            icon={item.icon}
                            name={item.name}
                            sub={
                              t(active ? "사용 중" : resource?.route ? "대기" : "경로 미확인") +
                              " · " +
                              t(
                                LIFECYCLE[resource?.lifecycle ?? ""] ??
                                  resource?.lifecycle ??
                                  "미확인",
                              )
                            }
                            state={
                              flow.failed
                                ? "error"
                                : active
                                  ? "active"
                                  : focused(item.kind)
                                    ? "focus"
                                    : undefined
                            }
                            motion={
                              flow.moving
                                ? "copying"
                                : preparing && index === 1 && !resource?.lifecycle
                                  ? "preparing"
                                  : undefined
                            }
                            stale={flow.stale}
                            changing={focused(item.kind) && index === 1 && active}
                          />
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </foreignObject>
          </svg>
        </div>
      </div>
      <figcaption className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-success" />
          {t("현재 사용")}
        </span>
        <span>{t("저장소 사이의 파란 선: 데이터 복제 · 점선: 제어")}</span>
        <span>{t("흐름은 확인된 설정의 시각화이며 실제 요청 수가 아닙니다.")}</span>
        <a
          href="https://github.com/caru-ini/stack-diagram"
          target="_blank"
          rel="noreferrer"
          className="ml-auto underline underline-offset-2"
        >
          stack-diagram · AWS / svgl / Lucide
        </a>
      </figcaption>
    </figure>
  );
}
