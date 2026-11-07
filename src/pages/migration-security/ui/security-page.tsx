import { useEffect, useState } from "react";
import {
  Activity,
  ArrowLeft,
  GitCompareArrows,
  ListChecks,
  Network,
  ShieldCheck,
  Table2,
} from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { NativeSelect, NativeSelectOption } from "@/shared/ui/native-select";
import {
  conditions,
  getResource,
  initialTasks,
  paths,
  visibleResources,
  type Condition,
  type Phase,
  type Task,
} from "../model/demo";
import { CompareView } from "./compare-view";
import { GraphView } from "./graph-view";
import { TasksView } from "./tasks-view";
import "./security.css";

type View = "graph" | "compare" | "tasks";
const views = [
  { id: "graph", label: "그래프", Icon: Network },
  { id: "compare", label: "비교", Icon: GitCompareArrows },
  { id: "tasks", label: "작업", Icon: ListChecks },
] as const;
function readView(): View {
  const hash = window.location.hash.slice(1);
  return hash === "compare" || hash === "tasks" ? hash : "graph";
}
export function MigrationSecurityPage() {
  const [view, setView] = useState<View>(readView);
  const [phase, setPhase] = useState<Phase>("plan");
  const [format, setFormat] = useState<"graph" | "table">("graph");
  const [business, setBusiness] = useState("all");
  const [selection, setSelection] = useState<{ resource: string; edge?: string }>({
    resource: "db",
  });
  const [expanded, setExpanded] = useState<Condition | null>("key_mgmt");
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [taskId, setTaskId] = useState("key");
  const [taskFilter, setTaskFilter] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    const update = () => setView(readView());
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);
  function navigate(next: View) {
    setView(next);
    window.location.hash = next;
  }
  function compare(id: string, condition?: Condition) {
    setSelection({ resource: id });
    setExpanded(condition ?? "key_mgmt");
    navigate("compare");
  }
  function openTasks(id: string) {
    setTaskFilter(id);
    setTaskId(tasks.find((t) => t.resources.includes(id))?.id ?? "");
    navigate("tasks");
  }
  function openOrCreateTask(resourceId: string, condition: Condition) {
    const existing = tasks.find(
      (t) => t.resources.includes(resourceId) && t.condition === condition,
    );
    const id = existing?.id ?? `draft-${resourceId}-${condition}`;
    if (!existing) {
      const r = getResource(resourceId);
      setTasks((previous) => [
        ...previous,
        {
          id,
          title: `${r.name.plan} ${conditions.find(([c]) => c === condition)?.[1]} 확인`,
          resources: [resourceId],
          condition,
          gate: "before_copy",
          owner: r.owner ?? "",
          status: "todo",
          due: "11/14",
          criteria: ["보호 조건과 담당 확인", "대상 검사 근거 등록"],
        },
      ]);
      setNotice("예시 작업 추가 · 현재 화면에만 저장");
    }
    setTaskId(id);
    setTaskFilter(resourceId);
    navigate("tasks");
  }
  function changeBusiness(value: string) {
    setBusiness(value);
    if (!visibleResources(value).some((r) => r.id === selection.resource))
      setSelection({ resource: paths.find((p) => p.id === value)?.data ?? "db" });
  }
  return (
    <div className="sec-dashboard">
      <a
        className="sec-skip"
        href="#security-content"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById("security-content")?.focus();
        }}
      >
        본문 바로가기
      </a>
      <nav className="sec-rail" aria-label="보안 화면 바로가기">
        <ShieldCheck className="sec-brand" />
        {views.map(({ id, label, Icon }) => (
          <Button
            key={id}
            variant="ghost"
            size="icon-lg"
            aria-label={label}
            aria-current={view === id ? "page" : undefined}
            onClick={() => {
              if (id === "tasks") setTaskFilter(null);
              navigate(id);
            }}
          >
            <Icon />
          </Button>
        ))}
        <Button
          asChild
          variant="ghost"
          size="icon-lg"
          className="mt-auto"
          aria-label="마이그레이션 관측"
        >
          <a href="/">
            <Activity />
          </a>
        </Button>
      </nav>
      <div className="sec-workspace">
        <header className="sec-header">
          <h1>
            <ShieldCheck />
            이전 보안
          </h1>
          <nav aria-label="화면">
            {views.map(({ id, label }) => (
              <Button key={id} variant="ghost" asChild>
                <a
                  href={`#${id}`}
                  aria-current={view === id ? "page" : undefined}
                  onClick={() => {
                    if (id === "tasks") setTaskFilter(null);
                  }}
                >
                  {label}
                </a>
              </Button>
            ))}
          </nav>
          <div className="sec-header-meta">
            <Badge variant="outline" className="sec-demo-badge">
              화면 예시
            </Badge>
            <span>마지막 수집 · 예시 11/07 09:12</span>
          </div>
        </header>
        <div className="sec-context">
          <span className="sec-chip">
            서비스 <strong>주문 서비스</strong>
          </span>
          <span className="sec-chip">
            원본 <strong>AWS 서울 · 운영</strong>
          </span>
          <span className="sec-chip planned">
            대상 <strong>온프렘 판교 IDC</strong>
          </span>
          <span className="sec-local-notice" role="status">
            {notice}
          </span>
          <a href="/" className="sec-back">
            <ArrowLeft />
            관측 화면
          </a>
        </div>
        <main id="security-content" tabIndex={-1}>
          {view === "graph" && (
            <>
              <div className="sec-graph-toolbar">
                <div className="flex items-center gap-2">
                  <label htmlFor="business-filter" className="muted">
                    업무
                  </label>
                  <NativeSelect
                    id="business-filter"
                    value={business}
                    onChange={(e) => changeBusiness(e.target.value)}
                  >
                    <NativeSelectOption value="all">전체</NativeSelectOption>
                    {paths.map((p) => (
                      <NativeSelectOption key={p.id} value={p.id}>
                        {p.label}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                </div>
                <div className="sec-toolbar-toggles">
                  <div className="sec-segment" role="group" aria-label="시점">
                    <Button
                      variant="ghost"
                      aria-pressed={phase === "current"}
                      onClick={() => setPhase("current")}
                    >
                      지금
                    </Button>
                    <Button
                      variant="ghost"
                      aria-pressed={phase === "plan"}
                      onClick={() => setPhase("plan")}
                    >
                      이전 후 · 계획 v3
                    </Button>
                  </div>
                  <div className="sec-segment" role="group" aria-label="보기 형식">
                    <Button
                      variant="ghost"
                      aria-pressed={format === "graph"}
                      onClick={() => setFormat("graph")}
                    >
                      <Network />
                      그래프
                    </Button>
                    <Button
                      variant="ghost"
                      aria-pressed={format === "table"}
                      onClick={() => setFormat("table")}
                    >
                      <Table2 />표
                    </Button>
                  </div>
                </div>
              </div>
              <GraphView
                phase={phase}
                business={business}
                view={format}
                selection={selection}
                onSelect={setSelection}
                onCompare={(id) => compare(id)}
                onTasks={openTasks}
                tasks={tasks}
              />
            </>
          )}
          {view === "compare" && (
            <CompareView
              resource={getResource(selection.resource)}
              expanded={expanded}
              onExpand={setExpanded}
              onSelect={(id) => setSelection({ resource: id })}
              onGraph={() => navigate("graph")}
              onTask={openOrCreateTask}
              tasks={tasks}
            />
          )}
          {view === "tasks" && (
            <TasksView
              tasks={tasks}
              selected={taskId}
              filter={taskFilter}
              onSelect={setTaskId}
              onClear={() => setTaskFilter(null)}
              onUpdate={(id, patch) => {
                setTasks((previous) => previous.map((t) => (t.id === id ? { ...t, ...patch } : t)));
                setNotice("예시 작업 변경 · 현재 화면에만 저장");
              }}
              onCompare={compare}
            />
          )}
        </main>
      </div>
    </div>
  );
}
