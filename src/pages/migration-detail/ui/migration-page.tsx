import { t, useLocale } from "@/shared/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, ChevronLeft, Info, RefreshCw } from "lucide-react";
import { STAGE_LABELS, WorkflowStatusBadge } from "@/entities/migration";
import { sessionOptions } from "@/entities/session";
import { getApiErrorMessage, isNotFound } from "@/shared/api";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import { type Detail, detailQuery, eventsQuery } from "../api/migrations";
import { MonitoringEntryLink, useMigrationReturn } from "./monitoring-entry";
import {
  eventAnchor,
  type MigrationView,
  type Workflow as WorkflowData,
} from "@/entities/migration";
import { CommandPanel } from "./command-panel";
import { Metric, ResourceCard, State, value, when } from "./resource-card";
import { TransitionDiagram } from "./transition-diagram";
function ErrorNotice({ error, retry }: { error: Error; retry: () => void }) {
  useLocale();
  return (
    <Alert variant="destructive">
      <AlertTitle>{t("관측값을 갱신하지 못했습니다")}</AlertTitle>
      <AlertDescription>
        {getApiErrorMessage(error)}
        {t(" 이전 값이 표시되어 있다면 최신 상태를 보장하지 않습니다.")}
        <Button variant="outline" onClick={retry}>
          {t("다시 조회")}
        </Button>
      </AlertDescription>
    </Alert>
  );
}
function split(weights: Record<string, number> | null | undefined) {
  return weights
    ? Object.entries(weights)
        .map(([env, percent]) => `${env} ${percent}%`)
        .join(" / ")
    : t("미확인");
}
type ViewProps = { view: MigrationView; onView: (view: MigrationView) => void };
export function MigrationPage({ id, view, onView }: { id: string } & ViewProps) {
  useLocale();
  const session = useQuery(sessionOptions());
  return (
    <section
      aria-label={t("마이그레이션")}
      className="mx-auto w-full max-w-7xl space-y-2 px-3 py-2 sm:px-4"
    >
      {session.data && (
        <Workflow
          key={id}
          workspace={session.data.workspaceId}
          id={id}
          view={view}
          onView={onView}
        />
      )}
    </section>
  );
}
function Workflow({ workspace, id, view, onView }: { workspace: string; id: string } & ViewProps) {
  useLocale();
  const detail = useQuery(detailQuery(workspace, id));
  useMigrationReturn(workspace, id, view, Boolean(detail.data));
  return (
    <div className="space-y-2">
      {detail.isPending && <p role="status">{t("관측값을 불러오는 중입니다.")}</p>}
      {detail.error &&
        (isNotFound(detail.error) ? (
          <Card size="sm">
            <CardHeader>
              <CardTitle>{t("마이그레이션을 찾을 수 없습니다")}</CardTitle>
              <CardDescription>
                {t("이 작업이 삭제되었거나 다른 플랫폼 서버에 연결되어 있습니다.")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline">
                <Link to="/migrations">{t("마이그레이션 목록")}</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <ErrorNotice error={detail.error} retry={() => void detail.refetch()} />
        ))}
      {detail.data && (
        <>
          <Summary data={detail.data} refresh={() => void detail.refetch()} />
          <Card size="sm" className="gap-2">
            <CardContent>
              <TransitionDiagram data={detail.data} suspended={Boolean(detail.error)} />
            </CardContent>
          </Card>
          {Object.keys(detail.data.preparation).length > 0 && <Preparation data={detail.data} />}
          <div className="grid items-start gap-4 lg:grid-cols-3">
            {detail.data.resources.map((resource) => (
              <ResourceCard
                key={resource.kind}
                resource={resource}
                workflow={detail.data.workflow}
              />
            ))}
          </div>
          <TransitionSummary data={detail.data} />
          <Button
            variant="outline"
            aria-expanded={Boolean(view.expanded)}
            aria-controls="migration-history"
            onClick={() => onView({ ...view, expanded: !view.expanded })}
          >
            {t(view.expanded ? "단계·명령 이력 접기" : "단계·명령 이력 보기")}
          </Button>
          {view.expanded && (
            <div id="migration-history" className="space-y-3">
              <History
                workspace={workspace}
                workflow={detail.data.workflow}
                view={view}
                onView={onView}
              />
              <Operations data={detail.data} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
const NEXT_STEP: Record<string, string> = {
  PLANNED: "계획을 확인하고 승인하면 첫 단계가 시작됩니다.",
  WAITING_APPROVAL: "되돌리기 어려운 단계입니다. 상태를 확인하고 승인하십시오.",
  RUNNING: "엔진이 진행 중입니다. 문제가 보이면 일시 정지할 수 있습니다.",
  HALTED: "멈췄습니다. 원인을 확인하고 재개·대조·되돌리기·취소 중 하나를 고르십시오.",
  ROLLING_BACK: "리소스를 원본으로 되돌리는 중입니다.",
  ABORTING: "취소하고 정리하는 중입니다.",
  COMPLETED: "모든 단계가 끝났습니다.",
  ABORTED: "취소된 마이그레이션입니다.",
};
function Summary({ data: d, refresh }: { data: Detail; refresh: () => void }) {
  useLocale();
  const stage = d.stages.find((item) => item.index === d.workflow.currentStage);
  return (
    <Card size="sm" className="gap-2 py-2">
      <CardHeader className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <div className="flex shrink-0 items-center gap-2">
          <Button asChild variant="ghost" size="icon-sm">
            <Link to="/migrations" aria-label={t("마이그레이션 목록")}>
              <ChevronLeft className="size-4" />
            </Link>
          </Button>
          <CardTitle className="text-base">{d.workflow.application}</CardTitle>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            {d.workflow.sourceEnv}
            <ArrowRight className="size-3" />
            {d.workflow.targetEnv}
          </span>
          <WorkflowStatusBadge status={d.workflow.status} />
        </div>
        <div
          className="min-w-0 flex-1 basis-48 border-l pl-3"
          title={t(NEXT_STEP[d.workflow.status])}
        >
          <p className="text-xs">
            <span className="font-semibold">
              {t(
                stage
                  ? `${stage.index + 1}. ${t(STAGE_LABELS[stage.kind] ?? stage.kind)}`
                  : t("단계 미확인"),
              )}
            </span>
            {stage?.detail && (
              <span className="ml-2 break-words text-muted-foreground">{stage.detail}</span>
            )}
          </p>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-1">
          <Button asChild variant="outline" size="sm">
            <MonitoringEntryLink workflow={d.workflow} anchor="migration-monitoring">
              {t("모니터링")}
            </MonitoringEntryLink>
          </Button>
          <CommandPanel workflow={d.workflow} allowedCommands={d.allowedCommands} />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label={t("작업 정보")}>
                <Info className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {d.workflow.id}
                {t(" · 버전 ")}
                {d.workflow.version}
              </p>
              <p>
                {t("시작 ")}
                {when(d.workflow.createdAt)}
              </p>
              {d.workflow.createdBy && (
                <p>
                  {t("실행자 ")}
                  {d.workflow.createdBy}
                </p>
              )}
            </TooltipContent>
          </Tooltip>
          <Button variant="ghost" size="icon-sm" onClick={refresh} aria-label={t("새로고침")}>
            <RefreshCw className="size-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <StageStepper data={d} />
        {(d.workflow.status === "PLANNED" ||
          d.workflow.status === "WAITING_APPROVAL" ||
          d.workflow.status === "HALTED") && (
          <p className="text-xs text-muted-foreground">{t(NEXT_STEP[d.workflow.status])}</p>
        )}
        {d.workflow.halt && (
          <Alert variant="destructive">
            <AlertTitle>{d.workflow.halt.code}</AlertTitle>
            <AlertDescription>
              {d.workflow.halt.message}
              {d.workflow.halt.blockers.length > 0 && ` · ${d.workflow.halt.blockers.join(", ")}`}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
function StageStepper({ data: d }: { data: Detail }) {
  useLocale();
  const finished = d.workflow.status === "COMPLETED";
  return (
    <ol className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t pt-2">
      {d.stages.map((item) => {
        const current = item.index === d.workflow.currentStage && !finished;
        const passed = item.status === "PASSED" || (finished && item.status !== "FAILED");
        const failed = item.status === "FAILED" || (current && d.workflow.status === "HALTED");
        const waiting =
          current && (d.workflow.status === "WAITING_APPROVAL" || d.workflow.status === "PLANNED");
        const tone = failed
          ? "border-destructive bg-destructive text-white"
          : passed
            ? "border-success/40 bg-success/15 text-success"
            : waiting
              ? "border-warning bg-warning/15 text-warning"
              : current
                ? "border-info bg-info/15 text-info"
                : "border-border bg-muted text-muted-foreground";
        return (
          <li
            key={item.index}
            aria-current={current ? "step" : undefined}
            className="flex items-center gap-1.5 whitespace-nowrap md:flex-1"
          >
            <span
              className={`grid size-5 shrink-0 place-items-center rounded-full border text-[10px] font-semibold ${tone} ${current && d.workflow.status === "RUNNING" ? "animate-pulse" : ""}`}
            >
              {passed ? <Check className="size-3" /> : item.index + 1}
            </span>
            <span className={`text-xs ${current ? "font-semibold" : "text-muted-foreground"}`}>
              {t(STAGE_LABELS[item.kind] ?? item.kind)}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
function Preparation({ data }: { data: Detail }) {
  useLocale();
  return (
    <section aria-label={t("배포 준비")} className="grid gap-4 md:grid-cols-2">
      {Object.entries(data.preparation).map(([kind, report]) => (
        <Card key={kind} size="sm">
          <CardHeader>
            <div className="flex justify-between gap-2">
              <CardTitle>
                {kind === "INFRA" ? t("IaC · 인프라 준비") : t("컴퓨트 · 앱 배포 준비")}
              </CardTitle>
              <State state={report.observation.freshness} />
            </div>
          </CardHeader>
          <CardContent>
            {report.data ? (
              <dl>
                <Metric label={t("작업 / 상태")}>
                  {value(report.data.stage)} / {value(report.data.status)}
                </Metric>
                <Metric label={t("대상 VM")}>{value(report.data.vmId)}</Metric>
                {report.data.changes && (
                  <Metric label={t("생성 / 수정 / 삭제 / 교체")}>
                    {[
                      report.data.changes.create,
                      report.data.changes.update,
                      report.data.changes.delete,
                      report.data.changes.replace,
                    ]
                      .map(value)
                      .join(" / ")}
                  </Metric>
                )}
                {kind === "COMPUTE" && (
                  <>
                    <Metric label={t("이미지")}>{value(report.data.imageId)}</Metric>
                    <Metric label={t("내부 검사")}>{value(report.data.check)}</Metric>
                    <Metric label={t("최근 명령")}>
                      {report.data.operations
                        ?.map((op) => `${op.action}: ${op.status}`)
                        .join(" · ") || t("미확인")}
                    </Metric>
                  </>
                )}
                <Metric label={t("결과 기록")}>{when(report.data.observedAt)}</Metric>
              </dl>
            ) : (
              <p className="text-muted-foreground">
                {t("실제 실행 결과가 아직 보고되지 않았습니다.")}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
function TransitionSummary({ data }: { data: Detail }) {
  const traffic = data.traffic.at(-1);
  return (
    <Card size="sm">
      <CardHeader className="flex flex-wrap items-center justify-between gap-2">
        <CardTitle>{t("트래픽 전환과 공용 경로 확인")}</CardTitle>
        <Button asChild variant="link" size="sm">
          <MonitoringEntryLink workflow={data.workflow} tab="obs" anchor="migration-traffic">
            {t("관측 상세")}
          </MonitoringEntryLink>
        </Button>
      </CardHeader>
      <CardContent className="grid gap-x-6 sm:grid-cols-2">
        <dl>
          <Metric label={t("요청 가중치")}>{split(traffic?.requested)}</Metric>
          <Metric label={t("LB 확인 가중치")}>{split(traffic?.effectivePercent)}</Metric>
        </dl>
        <dl>
          <Metric label={t("설정 확인")}>
            {traffic?.configVerified ? t("확인됨") : t("미확인")}
          </Metric>
          <Metric label={t("현재 업무 지시")}>
            {data.hold.isLive ? data.hold.desired : t("미확인")}
          </Metric>
        </dl>
      </CardContent>
    </Card>
  );
}
function Operations({ data }: { data: Detail }) {
  useLocale();
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("실행 명령")}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.commands.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("모듈 / 명령")}</TableHead>
                <TableHead>{t("실제 작업 ID")}</TableHead>
                <TableHead>{t("상태")}</TableHead>
                <TableHead>{t("시작")}</TableHead>
                <TableHead>{t("종료")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.commands.slice(-20).map((command) => (
                <TableRow
                  key={`${command.resource}-${command.operationId}-${command.action}-${command.attempt}`}
                >
                  <TableCell>
                    {command.resource} / {command.action}
                  </TableCell>
                  <TableCell>{value(command.operationId)}</TableCell>
                  <TableCell>
                    {value(command.status)}
                    {command.errorCode && ` · ${command.errorCode}`}
                  </TableCell>
                  <TableCell>{when(command.observation.startedAt)}</TableCell>
                  <TableCell>{when(command.observation.finishedAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-muted-foreground">{t("아직 실행된 명령이 없습니다.")}</p>
        )}
      </CardContent>
    </Card>
  );
}
function History({
  workspace,
  workflow,
  view,
  onView,
}: { workspace: string; workflow: WorkflowData } & ViewProps) {
  const events = useQuery(eventsQuery(workspace, workflow.id, view.eventCursor ?? null));
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>{t("단계 이벤트")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {events.error && <ErrorNotice error={events.error} retry={() => void events.refetch()} />}
        {events.isPending && <p role="status">{t("이벤트를 불러오는 중입니다.")}</p>}
        {events.data?.events.length === 0 && <p>{t("아직 이벤트가 없습니다.")}</p>}
        <ol className="space-y-3">
          {events.data?.events.map((event) => (
            <li
              key={event.cursor}
              className="flex flex-wrap items-start justify-between gap-2 border-b pb-3 last:border-0"
            >
              <div className="min-w-0 flex-1">
                <p className="break-words">{event.message || event.type}</p>
                <p className="text-xs text-muted-foreground">
                  {when(event.at)} · {event.type}
                </p>
              </div>
              <Button asChild variant="link" size="sm">
                <MonitoringEntryLink
                  workflow={workflow}
                  tab="tr"
                  at={
                    Number.isFinite(Date.parse(event.at))
                      ? new Date(event.at).toISOString()
                      : undefined
                  }
                  anchor={eventAnchor(event.cursor)}
                >
                  {t("이 시각 트레이스")}
                </MonitoringEntryLink>
              </Button>
            </li>
          ))}
        </ol>
        <div className="flex gap-2">
          {view.eventCursor && (
            <Button variant="outline" onClick={() => onView({ ...view, eventCursor: undefined })}>
              {t("최신 이벤트")}
            </Button>
          )}
          <Button
            variant="outline"
            disabled={!events.data?.nextCursor}
            onClick={() => onView({ ...view, eventCursor: events.data?.nextCursor ?? undefined })}
          >
            {t("다음 이벤트")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
