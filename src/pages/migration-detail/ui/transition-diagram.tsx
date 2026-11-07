import { useId } from "react";

import { STAGE_LABELS } from "@/entities/migration";

import type { Detail, Resource } from "../api/migrations";
import { STACK_ICONS } from "./stack-icons";

// Adapted from stack-diagram's tile, group and edge geometry.
// Official logos remain unmodified; source URLs: docs/stack-diagram-icons.json.
const W = 1080;
const H = 550;
const GROUPS = [
  { x: 16, cx: 256 },
  { x: 584, cx: 824 },
] as const;
const RESOURCES = [
  { kind: "REDIS", name: "Redis", icon: "redis", offset: -150, lane: 478 },
  { kind: "DATABASE", name: "PostgreSQL", icon: "postgresql", offset: 0, lane: 498 },
  { kind: "OBJECT_STORAGE", name: "객체 저장소", icon: "object", offset: 150, lane: 518 },
] as const;
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
.migration-stack .canvas { position:relative; width:1080px; height:550px; background-color:var(--stack-paper); background-image:linear-gradient(color-mix(in oklch,var(--stack-rule) 45%,transparent) 1px,transparent 1px),linear-gradient(90deg,color-mix(in oklch,var(--stack-rule) 45%,transparent) 1px,transparent 1px); background-size:24px 24px; }
.migration-stack .group { position:absolute; top:170px; width:480px; height:364px; border:1px solid var(--stack-rule); border-radius:6px; }
.migration-stack .group.aws { border-color:var(--stack-muted); border-radius:0; }
.migration-stack .group.gcp { border-color:#4285f4; }
.migration-stack .group[data-focus=true] { outline:2px solid var(--stack-accent); outline-offset:3px; }
.migration-stack .group-head { position:absolute; top:12px; left:14px; right:14px; display:flex; align-items:center; gap:8px; font-size:12px; font-weight:600; }
.migration-stack .group-head img { width:22px; height:22px; object-fit:contain; }
.migration-stack .group-head .role { margin-left:auto; color:var(--stack-muted); font-size:10px; font-family:ui-monospace,monospace; }
.migration-stack .dk { display:none; }
.dark .migration-stack .lt { display:none; }
.dark .migration-stack .dk { display:block; }
.migration-stack .node { position:absolute; width:132px; text-align:center; }
.migration-stack .tile { position:relative; display:grid; place-items:center; width:60px; height:60px; margin:auto; border:1px solid #d9dfe7; border-radius:12px; background:#fff; box-shadow:0 1px 3px #00000010; }
.migration-stack .tile img { width:34px; height:34px; object-fit:contain; }
.migration-stack .node[data-state=active] .tile { outline:2px solid var(--success); outline-offset:3px; }
.migration-stack .node[data-state=focus] .tile { outline:2px solid var(--stack-accent); outline-offset:3px; }
.migration-stack .dot { position:absolute; right:-4px; top:-4px; width:10px; height:10px; border-radius:50%; background:var(--success); border:2px solid var(--stack-paper); }
.migration-stack .name { margin-top:8px; font-size:13px; font-weight:600; line-height:18px; }
.migration-stack .sub { margin-top:2px; font-size:10px; line-height:15px; font-family:ui-monospace,monospace; color:var(--stack-muted); }
.migration-stack .name span,.migration-stack .sub span { background:var(--stack-paper); padding:0 3px; box-decoration-break:clone; }
.migration-stack .edge { fill:none; stroke:var(--stack-muted); stroke-width:1.3; }
.migration-stack .live { stroke:var(--stack-accent); stroke-width:1.8; }
.migration-stack .control { stroke-dasharray:4 5; opacity:.65; }
.migration-stack .sync { stroke:var(--stack-accent); stroke-dasharray:6 5; animation:stack-flow 1.4s linear infinite; }
.migration-stack .edge-label { font:10px ui-monospace,monospace; fill:var(--stack-muted); paint-order:stroke; stroke:var(--stack-paper); stroke-width:5px; stroke-linejoin:round; }
.migration-stack .edge-label.live-label { fill:var(--stack-accent); }
@keyframes stack-flow { to { stroke-dashoffset:-22; } }
@media (prefers-reduced-motion:reduce) { .migration-stack .sync { animation:none; } }
`;
function cloud(env: string) {
  if (env.toLowerCase() === "aws") return { name: "AWS Cloud", icon: "aws" as const, style: "aws" };
  if (env.toLowerCase() === "gcp")
    return { name: "Google Cloud", icon: "gcp" as const, style: "gcp" };
  return { name: env, icon: "server" as const, style: "" };
}
function routeLabel(resource: Resource | undefined, target: boolean) {
  if (!resource?.route) return "경로 미확인";
  if (!["SOURCE", "TARGET", "MIXED"].includes(resource.route)) return "경로 미확인";
  return resource.route === "MIXED" || resource.route === (target ? "TARGET" : "SOURCE")
    ? "사용 중"
    : "대기";
}
function StackNode({
  cx,
  top,
  icon,
  name,
  sub,
  state,
}: {
  cx: number;
  top: number;
  icon: keyof typeof STACK_ICONS;
  name: string;
  sub: string;
  state?: "active" | "focus";
}) {
  return (
    <div
      className="node"
      style={{ left: cx - 66, top }}
      data-state={state}
      title={name + " · " + sub}
    >
      <div className="tile">
        <img src={STACK_ICONS[icon]} alt="" />
        {state === "active" && <span className="dot" />}
      </div>
      <div className="name">
        <span>{name}</span>
      </div>
      <div className="sub">
        <span>{sub}</span>
      </div>
    </div>
  );
}
export function TransitionDiagram({ data }: { data: Detail }) {
  const marker = useId().replaceAll(":", "");
  const wf = data.workflow;
  const stage = data.stages.find((s) => s.index === wf.currentStage);
  const finished = wf.status === "COMPLETED" || wf.status === "ABORTED";
  const latest = data.traffic.at(-1);
  const split = latest?.effectivePercent ?? latest?.requested;
  const byKind = new Map(data.resources.map((resource) => [resource.kind, resource]));
  const environments = [wf.sourceEnv, wf.targetEnv] as const;
  const focused = (kind: string) =>
    !finished &&
    (stage?.kind === "SYNC" ||
      stage?.kind === kind + "_CUTOVER" ||
      (kind === "OBJECT_STORAGE" && stage?.kind === "OBJECT_CUTOVER"));
  const label = wf.sourceEnv + "에서 " + wf.targetEnv + "로 이전하는 구성도";
  const arrow = "url(#" + marker + ")";
  return (
    <figure className="migration-stack space-y-2">
      <style>{CSS}</style>
      <div className="overflow-x-auto rounded-md border">
        <svg
          viewBox={"0 0 " + W + " " + H}
          className="mx-auto block w-full min-w-[760px] max-w-[1080px]"
          role="img"
          aria-label={label}
        >
          <title>{label}</title>
          <foreignObject width={W} height={H}>
            <div className="canvas">
              {environments.map((env, index) => {
                const provider = cloud(env);
                return (
                  <div
                    key={env}
                    className={"group " + provider.style}
                    data-focus={
                      !finished &&
                      ((stage?.kind === "PREPARE" && index === 1) ||
                        (stage?.kind === "FINALIZE" && index === 0))
                    }
                    style={{ left: GROUPS[index === 0 ? 0 : 1].x }}
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
                      <span className="role">
                        {index === 0 ? "SOURCE · 원본" : "TARGET · 대상"}
                      </span>
                    </div>
                  </div>
                );
              })}
              <svg
                className="absolute inset-0"
                width={W}
                height={H}
                viewBox={"0 0 " + W + " " + H}
                aria-hidden="true"
              >
                <defs>
                  <marker
                    id={marker}
                    viewBox="0 0 10 10"
                    refX="9"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
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
                <path className="edge live" d="M140 54 H504" markerEnd={arrow} />
                <text className="edge-label live-label" x="320" y="45" textAnchor="middle">
                  HTTPS
                </text>
                {GROUPS.map((group, index) => {
                  const env = environments[index === 0 ? 0 : 1];
                  const share = split?.[env];
                  return (
                    <g key={env}>
                      <path
                        className={"edge " + (share !== undefined && share > 0 ? "live" : "")}
                        d={"M540 130 V144 H" + group.cx + " V214"}
                        markerEnd={arrow}
                      />
                      <text
                        className="edge-label live-label"
                        x={(540 + group.cx) / 2}
                        y="136"
                        textAnchor="middle"
                      >
                        {share === undefined ? "비율 미확인" : share + "%"}
                      </text>
                      <path
                        className="edge control"
                        d={
                          "M960 130 V154 H" +
                          (index === 0 ? 460 : 1040) +
                          " V250 H" +
                          (group.cx + 36)
                        }
                        markerEnd={arrow}
                      />
                      <path
                        className="edge"
                        d={
                          "M" +
                          group.cx +
                          " 326 V336 H" +
                          (group.cx - 150) +
                          " M" +
                          group.cx +
                          " 336 H" +
                          (group.cx + 150)
                        }
                      />
                      {RESOURCES.map((resource) => (
                        <path
                          key={resource.kind}
                          className="edge"
                          d={"M" + (group.cx + resource.offset) + " 336 V344"}
                          markerEnd={arrow}
                        />
                      ))}
                    </g>
                  );
                })}
                <text className="edge-label" x="780" y="145" textAnchor="middle">
                  heartbeat / HOLD · RUN
                </text>
                {RESOURCES.flatMap((item) => {
                  const resource = byKind.get(item.kind);
                  return (["forward", "reverse"] as const).flatMap((direction) => {
                    const flow = resource?.replication?.[direction];
                    if (!flow?.state || !["RUNNING", "SYNCING", "ACTIVE"].includes(flow.state))
                      return [];
                    const reverse = direction === "reverse";
                    const start = GROUPS[reverse ? 1 : 0].cx + item.offset;
                    const end = GROUPS[reverse ? 0 : 1].cx + item.offset;
                    const lane = item.lane + (reverse ? 7 : 0);
                    return [
                      <g key={item.kind + direction}>
                        <path
                          className="edge sync"
                          d={"M" + start + " 454 V" + lane + " H" + end + " V454"}
                          markerEnd={arrow}
                        />
                        <text
                          className="edge-label live-label"
                          x="540"
                          y={lane - 5}
                          textAnchor="middle"
                        >
                          {item.name} {reverse ? "←" : "→"}
                        </text>
                      </g>,
                    ];
                  });
                })}
              </svg>
              <StackNode cx={104} top={24} icon="user" name="사용자" sub="공용 서비스" />
              <StackNode
                cx={540}
                top={24}
                icon="cloudflare"
                name="Traffic LB"
                sub={
                  latest?.effectivePercent
                    ? "LB 확인 가중치"
                    : latest
                      ? "요청 가중치 · 확인 전"
                      : "트래픽 관측 대기"
                }
                state={
                  !finished && (stage?.kind === "TRAFFIC" || stage?.kind === "CANARY")
                    ? "focus"
                    : undefined
                }
              />
              <StackNode
                cx={960}
                top={24}
                icon="control"
                name="Control plane"
                sub={"업무 지시 · " + data.hold.desired}
                state={data.hold.desired === "HOLD" ? "focus" : undefined}
              />
              {environments.map((env, index) => {
                const actors = data.hold.actors.filter((actor) =>
                  actor.actorId.includes("-" + env + "-"),
                );
                const reported = actors.reduce((n, a) => n + a.reported, 0);
                const expected = actors.reduce((n, a) => n + a.expected, 0);
                const probe = data.businessProbes.find((p) => p.env === env);
                return (
                  <div key={env}>
                    <StackNode
                      cx={GROUPS[index === 0 ? 0 : 1].cx}
                      top={220}
                      icon="app"
                      name={env + " 애플리케이션"}
                      sub={
                        "프로세스 " +
                        reported +
                        "/" +
                        expected +
                        " · " +
                        (probe?.freshness ?? "미확인")
                      }
                      state={(split?.[env] ?? 0) > 0 ? "active" : undefined}
                    />
                    {RESOURCES.map((item) => {
                      const resource = byKind.get(item.kind);
                      const route = routeLabel(resource, index === 1);
                      return (
                        <StackNode
                          key={item.kind}
                          cx={GROUPS[index === 0 ? 0 : 1].cx + item.offset}
                          top={350}
                          icon={item.icon}
                          name={item.name}
                          sub={
                            route +
                            " · " +
                            (LIFECYCLE[resource?.lifecycle ?? ""] ??
                              resource?.lifecycle ??
                              "미확인")
                          }
                          state={
                            focused(item.kind)
                              ? "focus"
                              : route === "사용 중"
                                ? "active"
                                : undefined
                          }
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
      <figcaption className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-success" />
          현재 사용
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full border border-info" />
          현재 전환 대상
        </span>
        <span>점선: 제어 · 움직이는 파란 선: 관측된 복제 방향</span>
        <span className="ml-auto">
          icons: AWS Architecture Icons / svgl / Lucide ·{" "}
          <a
            href="https://github.com/caru-ini/stack-diagram"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2"
          >
            stack-diagram
          </a>
        </span>
      </figcaption>
      <span className="sr-only">
        현재 단계: {stage ? (STAGE_LABELS[stage.kind] ?? stage.kind) : "미확인"}. 업무 지시:{" "}
        {data.hold.desired}.
      </span>
    </figure>
  );
}
