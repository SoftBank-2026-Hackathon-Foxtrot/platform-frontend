import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, ChevronLeft, Info, RefreshCw } from "lucide-react";

import { STAGE_LABELS, WorkflowStatusBadge } from "@/entities/migration";
import { sessionOptions } from "@/entities/session";
import { getApiErrorMessage } from "@/shared/api";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";

import {
  type Detail,
  detailQuery,
  eventsQuery,
  historyQuery,
  telemetryQuery,
} from "../api/migrations";
import { CommandPanel } from "./command-panel";
import { Metric, ResourceCard, State, value, when } from "./resource-card";
import { TransitionDiagram } from "./transition-diagram";

function ErrorNotice({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <Alert variant="destructive">
      <AlertTitle>관측값을 갱신하지 못했습니다</AlertTitle>
      <AlertDescription>
        {getApiErrorMessage(error)} 이전 값이 표시되어 있다면 최신 상태를 보장하지 않습니다.
        <Button variant="outline" onClick={retry}>
          다시 조회
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
    : "미확인";
}
export function MigrationPage({ id }: { id: string }) {
  const session = useQuery(sessionOptions());
  return (
    <main className="mx-auto w-full max-w-7xl space-y-2 px-3 py-2 sm:px-4">
      {session.data && <Workflow key={id} workspace={session.data.workspaceId} id={id} />}
    </main>
  );
}
function Workflow({ workspace, id }: { workspace: string; id: string }) {
  const detail = useQuery(detailQuery(workspace, id));
  return (
    <div className="space-y-2">
      {detail.isPending && <p role="status">관측값을 불러오는 중입니다.</p>}
      {detail.error && <ErrorNotice error={detail.error} retry={() => void detail.refetch()} />}
      {detail.data && (
        <>
          <Summary data={detail.data} refresh={() => void detail.refetch()} />
          <Card size="sm" className="gap-2">
            <CardHeader className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <CardTitle>전환 구성도</CardTitle>
              <CardDescription className="text-xs">
                리소스 사용 위치 · 복제 상태 · 현재 전환 단계 · 2초마다 갱신
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TransitionDiagram data={detail.data} />
            </CardContent>
          </Card>
          {Object.keys(detail.data.preparation).length > 0 && <Preparation data={detail.data} />}
          <div className="grid items-start gap-4 lg:grid-cols-3">
            {detail.data.resources.map((resource) => (
              <ResourceCard key={resource.kind} resource={resource} />
            ))}
          </div>
          <Traffic data={detail.data} />
          <Workload data={detail.data} />
          <Operations data={detail.data} />
          <Telemetry workspace={workspace} id={id} />
          <History workspace={workspace} id={id} />
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
  const stage = d.stages.find((item) => item.index === d.workflow.currentStage);
  return (
    <Card size="sm" className="gap-2 py-2">
      <CardHeader className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <div className="flex shrink-0 items-center gap-2">
          <Button asChild variant="ghost" size="icon-sm">
            <Link to="/migrations" aria-label="마이그레이션 목록">
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
        <div className="min-w-0 flex-1 basis-48 border-l pl-3" title={NEXT_STEP[d.workflow.status]}>
          <p className="text-xs">
            <span className="font-semibold">
              {stage
                ? `${stage.index + 1}. ${STAGE_LABELS[stage.kind] ?? stage.kind}`
                : "단계 미확인"}
            </span>
            {stage?.detail && (
              <span className="ml-2 break-words text-muted-foreground">{stage.detail}</span>
            )}
          </p>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-1">
          <CommandPanel workflow={d.workflow} allowedCommands={d.allowedCommands} />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="작업 정보">
                <Info className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {d.workflow.id} · 버전 {d.workflow.version}
              </p>
              <p>시작 {when(d.workflow.createdAt)}</p>
              {d.workflow.createdBy && <p>실행자 {d.workflow.createdBy}</p>}
            </TooltipContent>
          </Tooltip>
          <Button variant="ghost" size="icon-sm" onClick={refresh} aria-label="새로고침">
            <RefreshCw className="size-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <StageStepper data={d} />
        {(d.workflow.status === "PLANNED" ||
          d.workflow.status === "WAITING_APPROVAL" ||
          d.workflow.status === "HALTED") && (
          <p className="text-xs text-muted-foreground">{NEXT_STEP[d.workflow.status]}</p>
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
              {STAGE_LABELS[item.kind] ?? item.kind}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function Preparation({ data }: { data: Detail }) {
  return (
    <section aria-label="배포 준비" className="grid gap-4 md:grid-cols-2">
      {Object.entries(data.preparation).map(([kind, report]) => (
        <Card key={kind} size="sm">
          <CardHeader>
            <div className="flex justify-between gap-2">
              <CardTitle>
                {kind === "INFRA" ? "IaC · 인프라 준비" : "컴퓨트 · 앱 배포 준비"}
              </CardTitle>
              <State state={report.observation.freshness} />
            </div>
          </CardHeader>
          <CardContent>
            {report.data ? (
              <dl>
                <Metric label="작업 / 상태">
                  {value(report.data.stage)} / {value(report.data.status)}
                </Metric>
                <Metric label="대상 VM">{value(report.data.vmId)}</Metric>
                {report.data.changes && (
                  <Metric label="생성 / 수정 / 삭제 / 교체">
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
                    <Metric label="이미지">{value(report.data.imageId)}</Metric>
                    <Metric label="내부 검사">{value(report.data.check)}</Metric>
                    <Metric label="최근 명령">
                      {report.data.operations
                        ?.map((op) => `${op.action}: ${op.status}`)
                        .join(" · ") || "미확인"}
                    </Metric>
                  </>
                )}
                <Metric label="결과 기록">{when(report.data.observedAt)}</Metric>
              </dl>
            ) : (
              <p className="text-muted-foreground">실제 실행 결과가 아직 보고되지 않았습니다.</p>
            )}
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
function Traffic({ data }: { data: Detail }) {
  const configured = data.traffic.at(-1);
  const p = data.publicProbe;
  return (
    <Card>
      <CardHeader>
        <CardTitle>트래픽 전환과 공용 경로 확인</CardTitle>
        <CardDescription>
          LB 설정과 공용 probe의 실제 도착 위치를 구분합니다. probe 비율은 전체 사용자 트래픽 비율이
          아닙니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <dl>
          <Metric label="요청 가중치">{split(configured?.requested)}</Metric>
          <Metric label="LB 확인 가중치">{split(configured?.effectivePercent)}</Metric>
          <Metric label="설정 확인">{configured?.configVerified ? "확인됨" : "미확인"}</Metric>
          <Metric label="Traffic 작업 ID">{value(configured?.adapterOperationId)}</Metric>
          <Metric label="작업 상태">{value(configured?.operationStatus)}</Metric>
        </dl>
        <div>
          {p ? (
            <>
              <dl>
                <Metric label="Probe 최신성">
                  <State state={p.freshness} />
                </Metric>
                <Metric label="관측된 도착 비율">{split(p.observedPercent)}</Metric>
                <Metric label="시도 / 위치 확인">
                  {p.total} / {p.knownLocationSamples}
                </Metric>
                <Metric label="실패 / 시간 초과">
                  {p.failed} / {p.timeouts}
                </Metric>
                <Metric label="위치 미확인 / 누락">
                  {p.unknownLocation} / {p.missingSamples}
                </Metric>
                <Metric label="성공 p95 / 최대 간격">
                  {value(p.p95Ms)} ms / {p.maxSampleGapSeconds} s
                </Metric>
              </dl>
              <p className="mt-2 text-xs text-muted-foreground">
                {when(p.windowStart)} — {when(p.windowEnd)}
                {!p.enoughSamples && " · 확인된 표본 30개 미만"}
              </p>
              {p.failureIntervals.map((failure) => (
                <p key={failure.firstFailureAt} className="mt-2 text-xs text-destructive">
                  관측 실패 {when(failure.firstFailureAt)} — {when(failure.lastFailureAt)} · 회복{" "}
                  {when(failure.recoveredAt)}
                </p>
              ))}
            </>
          ) : (
            <p className="text-muted-foreground">공용 probe가 아직 수집되지 않았습니다.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
function Workload({ data }: { data: Detail }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>앱 업무 확인과 연결 소진</CardTitle>
        <CardDescription>
          {data.hold.isLive ? "현재 업무 지시" : "보관된 업무 지시"} {data.hold.desired} · 세대{" "}
          {data.hold.generation} · 전체 정지 확인 {when(data.hold.heldSince)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex flex-wrap gap-4">
          {data.businessProbes.map((probe) => (
            <div key={probe.env} className="space-y-1">
              <p className="flex items-center gap-2 font-medium">
                {probe.env}
                <State state={probe.freshness} />
                <State state={probe.latest ? (probe.latest.passed ? "PASS" : "FAIL") : "UNKNOWN"} />
              </p>
              <p className="text-xs text-muted-foreground">
                {probe.collectionState === "SKIPPED_HELD" ? "HOLD 중 검사를 건너뜁니다. " : ""}
                {when(probe.latest?.finishedAt)} {probe.latest?.reason}
              </p>
            </div>
          ))}
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>앱 역할</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>보고 / 기대</TableHead>
              <TableHead>업무 in-flight</TableHead>
              <TableHead>WebSocket</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.hold.actors.map((actor) => (
              <TableRow key={actor.actorId}>
                <TableCell>{actor.actorId}</TableCell>
                <TableCell>{actor.state}</TableCell>
                <TableCell>
                  {actor.reported} / {actor.expected}
                </TableCell>
                <TableCell>
                  {actor.reported >= actor.expected
                    ? actor.inFlight
                    : `${actor.inFlight} (일부 보고)`}
                </TableCell>
                <TableCell>{value(actor.activeWebSockets)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <p className="text-xs text-muted-foreground">
          WebSocket은 기존 연결의 잔존 수입니다. 신규 HTTP 요청의 도착 위치와 별도로 확인합니다.
        </p>
      </CardContent>
    </Card>
  );
}
function Operations({ data }: { data: Detail }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>실행 명령</CardTitle>
      </CardHeader>
      <CardContent>
        {data.commands.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>모듈 / 명령</TableHead>
                <TableHead>실제 작업 ID</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>시작</TableHead>
                <TableHead>종료</TableHead>
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
          <p className="text-muted-foreground">아직 실행된 명령이 없습니다.</p>
        )}
      </CardContent>
    </Card>
  );
}
function NotOffered() {
  return (
    <p className="text-sm text-muted-foreground">
      연결된 컨트롤 플레인이 이 관측 정보를 제공하지 않습니다.
    </p>
  );
}
function History({ workspace, id }: { workspace: string; id: string }) {
  const [eventCursor, setEventCursor] = useState<string | null>(null);
  const [historyCursor, setHistoryCursor] = useState<string | null>(null);
  const [since] = useState(() => new Date(Date.now() - 5 * 60_000).toISOString());
  const events = useQuery(eventsQuery(workspace, id, eventCursor));
  const history = useQuery(historyQuery(workspace, id, historyCursor, since));
  return (
    <section className="grid items-start gap-4 lg:grid-cols-2" aria-label="관측 이력">
      <Card>
        <CardHeader>
          <CardTitle>단계 이벤트</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {events.error && <ErrorNotice error={events.error} retry={() => void events.refetch()} />}
          <ol className="space-y-3">
            {events.data?.events.map((event) => (
              <li key={event.cursor}>
                <p>{event.message || event.type}</p>
                <p className="text-xs text-muted-foreground">
                  {when(event.at)} · {event.type}
                </p>
              </li>
            ))}
          </ol>
          {events.isPending && <p>이벤트를 불러오는 중입니다.</p>}
          {events.data?.events.length === 0 && <p>아직 이벤트가 없습니다.</p>}
          <Button
            variant="outline"
            disabled={!events.data?.nextCursor}
            onClick={() => setEventCursor(events.data?.nextCursor ?? null)}
          >
            다음 이벤트
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>최근 관측 표본</CardTitle>
          <CardDescription>
            화면 진입 전 5분부터 수집된 표본입니다. 수집 실패도 남습니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {history.error && (
            <ErrorNotice error={history.error} retry={() => void history.refetch()} />
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>수집</TableHead>
                <TableHead>모듈</TableHead>
                <TableHead>단계 / 오류</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.data?.observations.map((row) => (
                <TableRow key={`${row.resource}-${row.collectedAt}`}>
                  <TableCell>{when(row.collectedAt)}</TableCell>
                  <TableCell>{row.resource}</TableCell>
                  <TableCell>
                    {row.collectionError ??
                      value(
                        row.data.phase ?? row.data.stage ?? row.data.lifecycle ?? row.data.desired,
                      )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {history.isPending && <p>표본을 불러오는 중입니다.</p>}
          {history.data === null && <NotOffered />}
          {history.data?.observations.length === 0 && <p>이 구간에 표본이 없습니다.</p>}
          <Button
            variant="outline"
            disabled={!history.data?.nextCursor}
            onClick={() => setHistoryCursor(history.data?.nextCursor ?? null)}
          >
            다음 표본
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}

const metricNames: Record<string, string> = {
  foxtrot_observation_age: "원본 관측 경과 (초)",
  foxtrot_observation_available: "관측 가능 (1/0)",
  foxtrot_migration_completed: "복사 완료",
  foxtrot_migration_total: "복사 전체",
  foxtrot_replication_backlog: "복제 backlog",
  foxtrot_replication_lagseconds: "복제 지연 (초)",
  foxtrot_redis_backlog: "Redis backlog",
  foxtrot_redis_lag_ms: "Redis 지연 (ms)",
  foxtrot_redis_oldestdirtyagems: "미반영 변경 경과 (ms)",
  foxtrot_redis_proxy_inflight_writes: "프록시 처리 중 쓰기",
  foxtrot_redis_proxy_open_tx: "프록시 열린 트랜잭션",
  foxtrot_redis_proxy_last_pause_ms: "프록시 마지막 pause (ms)",
  foxtrot_app_inflight: "앱 처리 중 요청",
  foxtrot_app_activewebsockets: "활성 WebSocket",
  foxtrot_probe_failed: "공용 검사 실패",
  foxtrot_probe_p95ms: "공용 검사 p95 (ms)",
};
function Telemetry({ workspace, id }: { workspace: string; id: string }) {
  const query = useQuery(telemetryQuery(workspace, id));
  return (
    <Card>
      <CardHeader>
        <CardTitle>OTEL 수집 상태와 작업 추적</CardTitle>
        <CardDescription>
          Prometheus 수치와 Tempo 추적을 컨트롤 플레인을 통해 조회합니다. 원본 관측 경과도 함께
          확인하세요.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {query.isPending && <p role="status">수집 결과를 불러오는 중입니다.</p>}
        {query.error && <ErrorNotice error={query.error} retry={() => void query.refetch()} />}
        {query.data === null && <NotOffered />}
        {query.data && (
          <>
            <p className="flex flex-wrap gap-3">
              메트릭 <State state={query.data.metricsState} /> 추적{" "}
              <State state={query.data.tracesState} />
            </p>
            {query.data.metrics.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>대상</TableHead>
                    <TableHead>수치</TableHead>
                    <TableHead>값</TableHead>
                    <TableHead>표본</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {query.data.metrics.map((m, index) => (
                    <TableRow key={`${m.name}-${m.resource}-${m.actor}-${index}`}>
                      <TableCell>
                        {[m.resource, m.direction, m.actor].filter(Boolean).join(" / ") ||
                          m.service}
                      </TableCell>
                      <TableCell>{metricNames[m.name] ?? m.name}</TableCell>
                      <TableCell>
                        {m.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <State state={m.freshness} /> {when(new Date(m.at * 1000).toISOString())}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p>수집된 메트릭이 없습니다.</p>
            )}
            {query.data.traces.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>작업 추적 ID</TableHead>
                    <TableHead>시작 서비스 / 작업</TableHead>
                    <TableHead>소요 (ms)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {query.data.traces.map((t) => (
                    <TableRow key={t.traceID}>
                      <TableCell className="font-mono text-xs">{t.traceID}</TableCell>
                      <TableCell>
                        {t.rootServiceName} / {t.rootTraceName}
                      </TableCell>
                      <TableCell>{value(t.durationMs)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p>수집된 작업 추적이 없습니다.</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
