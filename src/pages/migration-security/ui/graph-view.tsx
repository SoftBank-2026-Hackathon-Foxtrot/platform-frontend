import { useEffect, useRef, useState } from "react";
import { ArrowRight, Maximize, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import {
  conditions,
  counts,
  edges,
  getResource,
  kindMeta,
  paths,
  visibleResources,
  type Edge,
  type Phase,
  type Resource,
  type Task,
} from "../model/demo";
import { Evidence, ResourceRound, StatusBadge } from "./primitives";

type Selection = { resource: string; edge?: string };
interface Props {
  phase: Phase;
  business: string;
  view: "graph" | "table";
  selection: Selection;
  onSelect: (value: Selection) => void;
  onCompare: (id: string) => void;
  onTasks: (id: string) => void;
  tasks: Task[];
}
export function GraphView(props: Props) {
  const { phase, business, view, selection, onSelect } = props;
  const visible = visibleResources(business);
  const visibleEdges = edges.filter(
    (e) => visible.some((r) => r.id === e.from) && visible.some((r) => r.id === e.to),
  );
  const selected = getResource(selection.resource);
  const pathCount = business === "all" ? paths.length : 1;
  return (
    <div className="sec-graph-layout">
      <section className="min-w-0 flex flex-col" aria-label="보안 그래프">
        <div className="sec-section-title">
          <h2>보안 그래프</h2>
          <span className="muted">경로 {pathCount}</span>
          <span className={`sec-phase ${phase === "plan" ? "planned" : ""}`}>
            {phase === "plan" ? "계획 미리보기 · 적용 결과 미확인" : "지금 · 수집 예시"}
          </span>
        </div>
        {view === "graph" ? (
          <GraphCanvas
            resources={visible}
            edges={visibleEdges}
            phase={phase}
            selection={selection}
            onSelect={onSelect}
          />
        ) : (
          <PathTable business={business} phase={phase} selection={selection} onSelect={onSelect} />
        )}
      </section>
      <ResourcePanel
        key={`${selected.id}-${selection.edge ?? ""}`}
        {...props}
        resource={selected}
      />
    </div>
  );
}
function GraphCanvas({
  resources,
  edges: lines,
  phase,
  selection,
  onSelect,
}: {
  resources: Resource[];
  edges: Edge[];
  phase: Phase;
  selection: Selection;
  onSelect: Props["onSelect"];
}) {
  const viewport = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState(1);
  const [zoom, setZoom] = useState(1);
  useEffect(() => {
    const container = viewport.current;
    if (!container) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setFit(Math.min(1, Math.max(0.75, (entry.contentRect.width - 32) / 960)));
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);
  const scale = fit * zoom;
  return (
    <div className="sec-canvas" ref={viewport}>
      <div className="sec-zoom" role="group" aria-label="그래프 확대·축소">
        <Button
          variant="ghost"
          size="icon"
          aria-label="확대"
          disabled={zoom >= 1.6}
          onClick={() => setZoom((z) => Math.min(1.6, z + 0.2))}
        >
          <ZoomIn />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="축소"
          disabled={zoom <= 0.25}
          onClick={() => setZoom((z) => Math.max(0.25, z - 0.2))}
        >
          <ZoomOut />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="화면 맞춤"
          onClick={() => {
            setZoom(Math.min(1, ((viewport.current?.clientWidth ?? 992) - 32) / 960) / fit);
            viewport.current?.querySelector(".sec-graph-scroll")?.scrollTo({ left: 0, top: 0 });
          }}
        >
          <Maximize />
        </Button>
      </div>
      <div
        className="sec-graph-scroll"
        tabIndex={0}
        role="region"
        aria-label="자원 연결 지도 · 가로 스크롤"
      >
        <div className="sec-graph-space" style={{ width: 960 * scale, height: 520 * scale }}>
          <div className="sec-graph-board" style={{ transform: `scale(${scale})` }}>
            <svg className="sec-lines" width="960" height="520" aria-hidden="true">
              <defs>
                {["ok", "action", "unknown"].map((status) => (
                  <marker
                    key={status}
                    id={`sec-arrow-${status}`}
                    markerWidth="6"
                    markerHeight="6"
                    refX="5"
                    refY="3"
                    orient="auto"
                  >
                    <path d="M0,0 L6,3 L0,6" fill={status === "action" ? "#D9480F" : "#9DA1B0"} />
                  </marker>
                ))}
              </defs>
              {lines.map((e) => {
                const from = getResource(e.from);
                const to = getResource(e.to);
                const status = e.status[phase];
                const path =
                  from.y === to.y
                    ? `M${from.x + 30} ${from.y} H${to.x - 32}`
                    : `M${from.x + 30} ${from.y} H590 V${to.y} H${to.x - 32}`;
                return (
                  <path
                    key={e.id}
                    d={path}
                    fill="none"
                    stroke={status === "action" ? "#D9480F" : "#9DA1B0"}
                    strokeWidth={selection.edge === e.id ? 3 : 1.6}
                    strokeDasharray={status === "unknown" ? "5 4" : undefined}
                    markerEnd={`url(#sec-arrow-${status})`}
                  />
                );
              })}
            </svg>
            {lines.map((e) => {
              const from = getResource(e.from);
              const to = getResource(e.to);
              const x = from.y === to.y ? (from.x + to.x) / 2 : 643;
              return (
                <Button
                  key={e.id}
                  variant="outline"
                  className={`sec-edge-label sec-edge-${e.status[phase]}`}
                  style={{ left: x, top: to.y }}
                  aria-label={`${from.name[phase]} → ${to.name[phase]} · ${e.verb[phase]} · 연결 상세`}
                  aria-pressed={selection.edge === e.id}
                  onClick={() => onSelect({ resource: e.to, edge: e.id })}
                >
                  {e.verb[phase]}
                  {e.status[phase] !== "ok" && (
                    <span aria-hidden="true">{e.status[phase] === "action" ? "!" : "?"}</span>
                  )}
                </Button>
              );
            })}
            {resources.map((r) => {
              const c = counts(r, phase);
              const mark = c.action ? "action" : c.unknown ? "unknown" : undefined;
              return (
                <Button
                  key={r.id}
                  variant="ghost"
                  className="sec-node"
                  style={{ left: r.x - 63, top: r.y - 26 }}
                  aria-label={`${r.name[phase]} 선택${mark ? ` · ${mark === "action" ? "조치 필요" : "미확인"} ${c[mark]}` : ""}`}
                  aria-pressed={selection.resource === r.id && !selection.edge}
                  onClick={() => onSelect({ resource: r.id })}
                >
                  <ResourceRound resource={r} phase={phase}>
                    {mark && (
                      <span className={`sec-node-mark ${mark}`}>
                        {mark === "action" ? "!" : "?"} {c[mark]}
                      </span>
                    )}
                  </ResourceRound>
                  <span className="sec-node-name">{r.name[phase]}</span>
                  <span className="sec-node-detail">{r.detail[phase]}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="sec-legend" aria-label="범례">
        {(["edge", "proxy", "compute", "identity", "db"] as const).map((kind) => (
          <span key={kind}>
            <i style={{ background: kindMeta[kind].color }} />
            {kind === "db" ? "데이터" : kindMeta[kind].label}
          </span>
        ))}
        <span className="legend-separator" />
        <span className="action-text">! 조치 필요</span>
        <span className="unknown-text">? 미확인</span>
        <span className="planned-outline">계획</span>
      </div>
    </div>
  );
}
function PathTable({
  business,
  phase,
  selection,
  onSelect,
}: Pick<Props, "business" | "phase" | "selection" | "onSelect">) {
  return (
    <div className="sec-path-table">
      <Table>
        <TableHeader>
          <TableRow>
            {["경로", "사용하는 계정", "할 수 있는 일", "지금", "이전 후"].map((title) => (
              <TableHead key={title}>{title}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paths
            .filter((p) => business === "all" || p.id === business)
            .map((p) => {
              const e = edges.find((item) => item.id === p.edge)!;
              return (
                <TableRow
                  key={p.id}
                  data-state={selection.resource === p.data ? "selected" : undefined}
                >
                  <TableCell>
                    <Button variant="link" onClick={() => onSelect({ resource: p.data })}>
                      order-api <ArrowRight />
                      {getResource(p.data).name[phase]}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <code>{getResource(p.identity).name[phase]}</code>
                    <div className="muted">{getResource(p.identity).detail[phase]}</div>
                  </TableCell>
                  <TableCell>
                    {e.verb[phase]}
                    <div className="mono muted">{e.scope}</div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={e.status.current} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={e.status.plan} plan />
                  </TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
      <p className="muted sec-table-note">상태 기준 · 계정→데이터 접근 경로</p>
    </div>
  );
}
function ResourcePanel({
  resource: r,
  selection,
  phase,
  onSelect,
  onCompare,
  onTasks,
  tasks,
}: Props & { resource: Resource }) {
  const [tab, setTab] = useState(selection.edge ? "connections" : "conditions");
  const [evidenceId, setEvidenceId] = useState(
    conditions.find(([id]) => r.conditions[id].current.status !== "na")?.[0] ?? "identity",
  );
  const relatedEdges = edges.filter((e) => e.from === r.id || e.to === r.id);
  const relatedTasks = tasks.filter((t) => t.resources.includes(r.id));
  return (
    <aside className="sec-resource-panel" aria-label="자원 상세">
      <header className="sec-resource-heading">
        <ResourceRound resource={r} phase={phase} />
        <div>
          <h2>{r.name[phase]}</h2>
          <span className="muted">{kindMeta[r.kind].label}</span>
        </div>
      </header>
      <dl className="sec-resource-meta">
        <dt>지금</dt>
        <dd className="mono">{r.detail.current}</dd>
        <dt>이전 후</dt>
        <dd className="mono">{r.detail.plan}</dd>
        <dt>담당</dt>
        <dd className={!r.owner ? "action-text" : ""}>{r.owner || "담당 미지정"}</dd>
      </dl>
      <div className="sec-panel-tabs" role="group" aria-label="자원 상세 보기">
        {[
          ["conditions", "보호 조건"],
          ["connections", "연결"],
          ["evidence", "근거"],
        ].map(([id, label]) => (
          <Button key={id} variant="ghost" aria-pressed={tab === id} onClick={() => setTab(id!)}>
            {label}
          </Button>
        ))}
      </div>
      <div className="sec-panel-body">
        {tab === "conditions" && (
          <Table className="sec-condition-summary">
            <TableHeader>
              <TableRow>
                <TableHead>조건</TableHead>
                <TableHead>지금</TableHead>
                <TableHead>이전 후</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conditions.map(([id, label]) => (
                <TableRow key={id}>
                  <TableCell>{label}</TableCell>
                  <TableCell>
                    <StatusBadge status={r.conditions[id].current.status} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={r.conditions[id].plan.status} plan />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {tab === "connections" && (
          <div className="sec-connections">
            {relatedEdges.length ? (
              relatedEdges.map((e) => (
                <div key={e.id} className={selection.edge === e.id ? "selected" : ""}>
                  <Button variant="ghost" onClick={() => onSelect({ resource: r.id, edge: e.id })}>
                    {getResource(e.from).name[phase]}
                    <ArrowRight />
                    {getResource(e.to).name[phase]}
                  </Button>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge status={e.status[phase]} plan={phase === "plan"} />
                    <span>
                      {e.verb[phase]} {e.scope && <code>· {e.scope}</code>}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="muted">연결 없음</p>
            )}
          </div>
        )}
        {tab === "evidence" && (
          <div className="sec-panel-evidence">
            <div className="flex flex-wrap gap-1">
              {conditions
                .filter(([id]) => r.conditions[id].current.status !== "na")
                .map(([id, label]) => (
                  <Button
                    key={id}
                    size="sm"
                    variant={id === evidenceId ? "secondary" : "ghost"}
                    aria-pressed={id === evidenceId}
                    onClick={() => setEvidenceId(id)}
                  >
                    {label}
                  </Button>
                ))}
            </div>
            {conditions
              .filter(([id]) => id === evidenceId)
              .map(([id, label]) => (
                <div key={id}>
                  <h3>{label}</h3>
                  <p className="muted">지금</p>
                  <Evidence state={r.conditions[id].current} />
                  <p className="muted mt-4">이전 후 · 계획</p>
                  <Evidence state={r.conditions[id].plan} plan />
                </div>
              ))}
          </div>
        )}
      </div>
      <footer className="sec-panel-footer">
        <Button onClick={() => onCompare(r.id)}>원본·대상 비교</Button>
        <Button variant="outline" onClick={() => onTasks(r.id)}>
          관련 작업 {relatedTasks.length}
        </Button>
      </footer>
    </aside>
  );
}
