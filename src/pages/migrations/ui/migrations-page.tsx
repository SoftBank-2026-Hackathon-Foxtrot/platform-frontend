import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ChevronRight } from "lucide-react";

import {
  STAGE_LABELS,
  type Workflow,
  WorkflowStatusBadge,
  workflowsOptions,
} from "@/entities/migration";
import { sessionOptions } from "@/entities/session";
import { getApiErrorMessage } from "@/shared/api";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";

const STAGE_ORDER = Object.keys(STAGE_LABELS);
const FINISHED = new Set(["COMPLETED", "ABORTED"]);

export function MigrationsPage() {
  const session = useQuery(sessionOptions());
  const workspace = session.data?.workspaceId;
  const workflows = useQuery({ ...workflowsOptions(workspace ?? ""), enabled: Boolean(workspace) });
  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:px-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">마이그레이션</h1>
          <p className="text-sm text-muted-foreground">
            최근에 만든 순서입니다. 한 번에 하나만 진행할 수 있습니다.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/applications">새 마이그레이션은 애플리케이션에서</Link>
        </Button>
      </header>
      {workflows.isPending && <p role="status">목록을 불러오는 중입니다.</p>}
      {workflows.error && (
        <Alert variant="destructive">
          <AlertTitle>목록을 불러오지 못했습니다</AlertTitle>
          <AlertDescription>{getApiErrorMessage(workflows.error)}</AlertDescription>
        </Alert>
      )}
      {workflows.data?.length === 0 && (
        <p className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          아직 마이그레이션이 없습니다.
        </p>
      )}
      <div className="space-y-2">
        {workflows.data?.map((workflow) => (
          <Row key={workflow.id} workflow={workflow} />
        ))}
      </div>
    </main>
  );
}

function Row({ workflow: w }: { workflow: Workflow }) {
  const stageKind = STAGE_ORDER[w.currentStage];
  const finished = FINISHED.has(w.status);
  const done = w.status === "COMPLETED" ? STAGE_ORDER.length : w.currentStage;
  const name = w.applicationSnapshot?.name ?? w.application;
  return (
    <Link
      to="/migrations/$id"
      params={{ id: w.id }}
      className="group flex items-center gap-4 rounded-xl border bg-card p-4 transition-colors hover:bg-muted/50"
    >
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{name}</span>
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            {w.sourceEnv} <ArrowRight className="size-3" /> {w.targetEnv}
          </span>
          <WorkflowStatusBadge status={w.status} />
          {!finished && stageKind && (
            <Badge variant="secondary">
              {w.currentStage + 1}. {STAGE_LABELS[stageKind]}
            </Badge>
          )}
        </div>
        <div className="flex gap-1" aria-label={`${STAGE_ORDER.length}단계 중 ${done}단계 완료`}>
          {STAGE_ORDER.map((kind, index) => (
            <span
              key={kind}
              className={`h-1.5 flex-1 rounded-full ${
                index < done
                  ? "bg-success"
                  : index === w.currentStage && !finished
                    ? "bg-info"
                    : "bg-muted"
              }`}
            />
          ))}
        </div>
        <p className="font-mono text-xs text-muted-foreground">
          {w.id} · {new Date(w.createdAt).toLocaleString("ko-KR", { hour12: false })}
          {w.createdBy ? ` · ${w.createdBy}` : ""}
        </p>
      </div>
      <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
