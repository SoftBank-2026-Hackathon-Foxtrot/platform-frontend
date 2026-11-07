import { useState } from "react";
import { ArrowLeft, ArrowRight, CircleHelp, Clock, TriangleAlert, X } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Checkbox } from "@/shared/ui/checkbox";
import { NativeSelect, NativeSelectOption } from "@/shared/ui/native-select";
import {
  conditions,
  gates,
  getResource,
  owners,
  taskStatusLabels,
  type Condition,
  type Gate,
  type Task,
  type TaskStatus,
} from "../model/demo";
import { PendingActions, ResourceDot, StatusBadge } from "./primitives";
interface Props {
  tasks: Task[];
  selected: string;
  filter: string | null;
  onSelect: (id: string) => void;
  onClear: () => void;
  onUpdate: (id: string, patch: Partial<Pick<Task, "owner" | "status">>) => void;
  onCompare: (resource: string, condition: Condition) => void;
}
export function TasksView({
  tasks,
  selected,
  filter,
  onSelect,
  onClear,
  onUpdate,
  onCompare,
}: Props) {
  const [gate, setGate] = useState<Gate | null>(null);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const filtered = tasks.filter(
    (t) => (!filter || t.resources.includes(filter)) && (!gate || t.gate === gate),
  );
  const task = filtered.find((t) => t.id === selected) ?? filtered[0];
  return (
    <section aria-label="조치 작업">
      <div className="sec-gates">
        {gates.map(([id, label], i) => {
          const count = tasks.filter((t) => t.gate === id).length;
          return (
            <div key={id} className="sec-gate-wrap">
              <Button
                variant="outline"
                className={`sec-gate ${id === "before_copy" ? "blocked" : ""}`}
                aria-pressed={gate === id}
                onClick={() => setGate((g) => (g === id ? null : id))}
              >
                <span className="sec-step">{i + 1}</span>
                <span>
                  <strong>{label}</strong>
                  <small>
                    {count}건 ·{" "}
                    {id === "before_copy"
                      ? "복사 차단"
                      : id === "before_cutover"
                        ? "전환 조건 확인"
                        : "회수·검증"}
                  </small>
                </span>
              </Button>
              {i < 2 && <ArrowRight className="muted size-4 shrink-0" />}
            </div>
          );
        })}
      </div>
      <div className="sec-task-toolbar">
        <h2>작업 {filtered.length}</h2>
        {filter && (
          <span className="flex items-center gap-2">
            <ResourceDot resource={getResource(filter)} />
            {getResource(filter).name.plan}
          </span>
        )}
        {(filter || gate) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setGate(null);
              onClear();
            }}
          >
            <X />
            전체 작업
          </Button>
        )}
        <span className="ml-auto muted">예시 편집 · 새로고침 시 초기화</span>
      </div>
      {filtered.length === 0 ? (
        <div className="sec-empty">
          <h3>관련 작업 없음</h3>
          <p className="muted">자원 선택에 연결된 작업 0건</p>
          <Button
            variant="outline"
            onClick={() => {
              setGate(null);
              onClear();
            }}
          >
            <ArrowLeft />
            전체 작업
          </Button>
        </div>
      ) : (
        <div className="sec-task-layout">
          <nav className="sec-task-list" aria-label="작업 선택">
            {gates.map(([id, label]) => {
              const group = filtered.filter((t) => t.gate === id);
              return (
                group.length > 0 && (
                  <div key={id}>
                    <h3>
                      {label} <span>{group.length}</span>
                    </h3>
                    {group.map((t) => {
                      const r = getResource(t.resources[0]!);
                      const unknown = r.conditions[t.condition].plan.status === "unknown";
                      const Icon = unknown ? CircleHelp : TriangleAlert;
                      return (
                        <Button
                          key={t.id}
                          variant="ghost"
                          className="sec-task-item"
                          aria-pressed={task?.id === t.id}
                          onClick={() => onSelect(t.id)}
                        >
                          <Icon className={unknown ? "unknown-text" : "action-text"} />
                          <span className="sec-task-item-main">
                            <strong>{t.title}</strong>
                            <small>
                              <ResourceDot resource={r} />
                              {r.name.plan} · {conditions.find(([c]) => c === t.condition)?.[1]}
                            </small>
                          </span>
                          <span className="sec-task-item-meta">
                            <strong className={!t.owner ? "action-text" : ""}>
                              {t.owner || "담당 미지정"}
                            </strong>
                            <small>{taskStatusLabels[t.status]}</small>
                          </span>
                        </Button>
                      );
                    })}
                  </div>
                )
              );
            })}
          </nav>
          {task &&
            (() => {
              const resource = getResource(task.resources[0]!);
              const row = resource.conditions[task.condition];
              return (
                <article className="sec-task-detail" aria-label="작업 상세">
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`sec-task-gate-label ${task.gate === "before_copy" ? "blocked" : ""}`}
                    >
                      {gates.find(([id]) => id === task.gate)?.[1]}
                      {task.gate === "before_copy" ? " 차단" : ""}
                    </span>
                    <span className="muted">발견 11/07 09:14 · 예시</span>
                    <span className="sec-due mono">
                      <Clock />
                      {task.due}까지
                    </span>
                  </div>
                  <h2>{task.title}</h2>
                  <div className="sec-task-detail-grid">
                    <div>
                      <dl className="sec-task-facts">
                        <dt>변화</dt>
                        <dd>
                          <div>
                            <span className="muted">지금</span>
                            {row.current.summary}
                          </div>
                          <div>
                            <span className="muted">이후</span>
                            <StatusBadge status={row.plan.status} plan />
                            {row.plan.summary}
                          </div>
                        </dd>
                        <dt>어디</dt>
                        <dd>
                          <div className="flex flex-wrap gap-2">
                            {task.resources.map((id) => (
                              <span key={id} className="sec-resource-tag">
                                <ResourceDot resource={getResource(id)} />
                                {getResource(id).name.plan}
                              </span>
                            ))}
                          </div>
                          <p className="muted">영향 · 주문 서비스</p>
                        </dd>
                        <dt>근거</dt>
                        <dd>
                          <code>{row.plan.evidence || "등록된 근거 없음"}</code>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className="muted">
                              {row.plan.source === "declared" ? "계획 파일 · v3" : "출처 없음"}
                            </span>
                            <Button
                              variant="link"
                              size="sm"
                              onClick={() => onCompare(resource.id, task.condition)}
                            >
                              비교 보기
                            </Button>
                          </div>
                        </dd>
                        <dt>완료 조건</dt>
                        <dd className="sec-criteria">
                          {task.criteria.map((criterion, i) => (
                            <label key={`${task.id}-${i}`}>
                              <Checkbox
                                checked={!!checked[`${task.id}-${i}`]}
                                onCheckedChange={(value) =>
                                  setChecked((previous) => ({
                                    ...previous,
                                    [`${task.id}-${i}`]: value === true,
                                  }))
                                }
                              />
                              {criterion}
                            </label>
                          ))}
                          <span className="muted">
                            체크 · 개인 확인용 / 충족 판정 · 검사 근거 필요
                          </span>
                        </dd>
                      </dl>
                    </div>
                    <Card className="sec-next-action">
                      <h3>다음 할 일</h3>
                      <div className="sec-next-action-body">
                        <label htmlFor="task-status">진행 상태</label>
                        <NativeSelect
                          id="task-status"
                          value={task.status}
                          onChange={(e) =>
                            onUpdate(task.id, { status: e.target.value as TaskStatus })
                          }
                        >
                          {Object.entries(taskStatusLabels).map(([value, label]) => (
                            <NativeSelectOption key={value} value={value}>
                              {label}
                            </NativeSelectOption>
                          ))}
                        </NativeSelect>
                        <label htmlFor="task-owner">담당</label>
                        <NativeSelect
                          id="task-owner"
                          value={task.owner}
                          className={!task.owner ? "sec-unassigned" : ""}
                          onChange={(e) => onUpdate(task.id, { owner: e.target.value })}
                        >
                          <NativeSelectOption value="">담당 미지정</NativeSelectOption>
                          {owners.map((owner) => (
                            <NativeSelectOption key={owner}>{owner}</NativeSelectOption>
                          ))}
                        </NativeSelect>
                        <PendingActions />
                      </div>
                    </Card>
                  </div>
                </article>
              );
            })()}
        </div>
      )}
    </section>
  );
}
