import { Fragment } from "react";
import { ArrowLeft, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import {
  conditions,
  counts,
  edges,
  getResource,
  paths,
  resources,
  type Condition,
  type Phase,
  type Resource,
  type Task,
} from "../model/demo";
import {
  Evidence,
  PendingActions,
  ResourceDot,
  ResourceRound,
  SourceLabel,
  StatusBadge,
} from "./primitives";

interface Props {
  resource: Resource;
  expanded: Condition | null;
  onExpand: (id: Condition | null) => void;
  onSelect: (id: string) => void;
  onGraph: () => void;
  onTask: (resource: string, condition: Condition) => void;
  tasks: Task[];
}
export function CompareView({
  resource,
  expanded,
  onExpand,
  onSelect,
  onGraph,
  onTask,
  tasks,
}: Props) {
  const summary = counts(resource, "plan");
  return (
    <section aria-label="원본·대상 비교">
      <div className="sec-resource-picker">
        <Button variant="ghost" onClick={onGraph}>
          <ArrowLeft />
          그래프
        </Button>
        {resources
          .filter((r) => r.kind !== "internet")
          .map((r) => (
            <Button
              key={r.id}
              variant={resource.id === r.id ? "default" : "outline"}
              aria-pressed={resource.id === r.id}
              onClick={() => onSelect(r.id)}
            >
              <ResourceDot resource={r} />
              {r.name.plan}
            </Button>
          ))}
      </div>
      <div className="sec-compare-content">
        <div className="sec-path-cards">
          <AccessPath resource={resource} phase="current" />
          <AccessPath resource={resource} phase="plan" />
        </div>
        <Card className="sec-comparison-card">
          <div className="sec-section-title">
            <h2>{resource.name.plan} · 보호 조건</h2>
            <div className="ml-auto flex flex-wrap gap-1">
              {(["action", "unknown", "ok", "exception"] as const)
                .filter((s) => summary[s] > 0)
                .map((s) => (
                  <StatusBadge key={s} status={s} count={summary[s]} plan />
                ))}
            </div>
          </div>
          <Table className="sec-comparison-table">
            <TableHeader>
              <TableRow>
                <TableHead>조건</TableHead>
                <TableHead>지금 · AWS</TableHead>
                <TableHead>변화</TableHead>
                <TableHead>이전 후 · 온프렘 계획</TableHead>
                <TableHead>근거</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conditions.map(([id, label]) => {
                const row = resource.conditions[id];
                const open = expanded === id;
                const task = tasks.find(
                  (t) => t.resources.includes(resource.id) && t.condition === id,
                );
                return (
                  <Fragment key={id}>
                    <TableRow className={open ? "sec-expanded" : ""}>
                      <TableCell>
                        <Button
                          variant="ghost"
                          className="sec-condition-button"
                          aria-expanded={open}
                          aria-controls={`condition-${id}`}
                          onClick={() => onExpand(open ? null : id)}
                        >
                          {open ? <ChevronDown /> : <ChevronRight />}
                          {label}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={row.current.status} />
                        <p>{row.current.summary}</p>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`sec-change ${row.change === "빠짐" ? "missing" : row.change === "약해짐" ? "weaker" : row.change === "방식 바뀜" ? "changed" : ""}`}
                        >
                          {row.change}
                        </span>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={row.plan.status} plan />
                        <p>{row.plan.summary}</p>
                      </TableCell>
                      <TableCell>
                        <SourceLabel state={row.current} prefix="지금: " />
                        <SourceLabel state={row.plan} prefix="이후: " />
                      </TableCell>
                    </TableRow>
                    {open && (
                      <TableRow className="sec-expanded">
                        <TableCell colSpan={5}>
                          <div className="sec-expanded-content" id={`condition-${id}`}>
                            <div>
                              <h3>영향</h3>
                              <p>{row.impact}</p>
                              <p className="muted">
                                담당{" "}
                                <strong className={!task?.owner ? "action-text" : ""}>
                                  {task?.owner || "담당 미지정"}
                                </strong>
                                {task &&
                                  ` · ${task.gate === "before_copy" ? "복사 전" : task.gate === "before_cutover" ? "전환 전" : "전환 후 확인"}`}
                              </p>
                            </div>
                            <div>
                              <h3>지금 근거</h3>
                              <Evidence state={row.current} />
                            </div>
                            <div>
                              <h3>이전 후 근거</h3>
                              <Evidence state={row.plan} plan />
                            </div>
                            {row.plan.status !== "na" && (
                              <div className="sec-expanded-actions">
                                <Button onClick={() => onTask(resource.id, id)}>
                                  {task ? "관련 작업 열기" : "작업 만들기 · 예시"}
                                </Button>
                                <PendingActions />
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      </div>
    </section>
  );
}
function AccessPath({ resource, phase }: { resource: Resource; phase: Phase }) {
  const branch = paths.find((p) => p.data === resource.id || p.identity === resource.id);
  const ids = branch ? ["app", branch.identity, branch.data] : ["edge", "proxy", "app"];
  return (
    <Card className={`sec-access-card ${phase === "plan" ? "planned" : ""}`}>
      <div className="flex flex-wrap items-center gap-2">
        <h3>{phase === "current" ? "지금" : "이전 후"}</h3>
        <span className="muted">
          {phase === "current" ? "AWS 서울 · 운영" : "온프렘 판교 · 계획 v3"}
        </span>
        <span className="ml-auto muted">
          {phase === "current" ? "실측 예시 · 11/07 09:12" : "계획 파일 기준"}
        </span>
      </div>
      <div className="sec-access-path">
        {ids.map((id, i) => {
          const r = getResource(id);
          const e = edges.find((item) => item.from === id && item.to === ids[i + 1]);
          return (
            <Fragment key={id}>
              <div className="sec-mini-node">
                <ResourceRound resource={r} phase={phase} />
                <strong>{r.name[phase]}</strong>
                <span className="muted">{r.detail[phase]}</span>
              </div>
              {i < ids.length - 1 && (
                <div
                  className={`sec-mini-edge ${phase === "plan" ? "planned" : ""} ${e?.status[phase] === "action" ? "action" : ""}`}
                >
                  <span>
                    {e?.verb[phase] || "사용"}
                    {e?.status[phase] === "action" && " !"}
                  </span>
                </div>
              )}
            </Fragment>
          );
        })}
      </div>
    </Card>
  );
}
