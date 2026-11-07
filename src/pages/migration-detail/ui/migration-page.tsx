import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity, ArrowRight, RefreshCw } from "lucide-react";

import { apiBaseUrl, getApiErrorMessage } from "@/shared/api";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";

import {
  type Detail,
  detailQuery,
  eventsQuery,
  historyQuery,
  workflowsQuery,
} from "../api/migrations";
import { Metric, ResourceCard, State, value, when } from "./resource-card";

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
export function MigrationPage() {
  const workflows = useQuery(workflowsQuery());
  const [selected, setSelected] = useState<string | null>(null);
  const id = selected ?? workflows.data?.[0]?.id;
  return (
    <main className="mx-auto min-h-svh max-w-7xl space-y-7 px-4 py-8 sm:px-8">
      <header className="flex flex-wrap items-start justify-between gap-5">
        <div className="space-y-2">
          <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Activity className="size-4" /> FOXTROT / MIGRATION
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">마이그레이션 관측</h1>
          <p className="text-sm text-muted-foreground">
            단계, 데이터 경로, 전환의 실제 영향을 한곳에서 확인합니다.
          </p>
        </div>
        <Button asChild variant="outline">
          <a href={`${apiBaseUrl}/auth/github/start?returnTo=/`}>GitHub 로그인</a>
        </Button>
      </header>
      {workflows.isPending && <p role="status">마이그레이션 목록을 불러오는 중입니다.</p>}
      {workflows.error && (
        <ErrorNotice error={workflows.error} retry={() => void workflows.refetch()} />
      )}
      {workflows.data?.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>등록된 마이그레이션이 없습니다</CardTitle>
            <CardDescription>
              컨트롤 플레인에서 workflow를 생성하면 여기에 표시됩니다.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
      <nav aria-label="마이그레이션 선택" className="flex flex-wrap gap-2">
        {workflows.data?.map((workflow) => (
          <Button
            key={workflow.id}
            variant={id === workflow.id ? "default" : "outline"}
            aria-pressed={id === workflow.id}
            onClick={() => setSelected(workflow.id)}
          >
            {workflow.application} · {workflow.sourceEnv} → {workflow.targetEnv} ·{" "}
            {workflow.id.slice(-8)}
          </Button>
        ))}
      </nav>
      {id && <Workflow key={id} id={id} />}
    </main>
  );
}
function Workflow({ id }: { id: string }) {
  const detail = useQuery(detailQuery(id));
  return (
    <div className="space-y-6">
      {detail.isPending && <p role="status">관측값을 불러오는 중입니다.</p>}
      {detail.error && <ErrorNotice error={detail.error} retry={() => void detail.refetch()} />}
      {detail.data && (
        <>
          <Summary data={detail.data} refresh={() => void detail.refetch()} />
          <Preparation data={detail.data} />
          <div className="grid items-start gap-4 lg:grid-cols-3">
            {detail.data.resources.map((resource) => (
              <ResourceCard key={resource.kind} resource={resource} />
            ))}
          </div>
          <Traffic data={detail.data} />
          <Workload data={detail.data} />
          <Operations data={detail.data} />
          <History id={id} />
        </>
      )}
    </div>
  );
}
function Summary({ data: d, refresh }: { data: Detail; refresh: () => void }) {
  const stage = d.stages.find((item) => item.index === d.workflow.currentStage);
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-3">
            {d.workflow.sourceEnv}
            <ArrowRight className="size-4" />
            {d.workflow.targetEnv}
            <State state={d.workflow.status} />
          </CardTitle>
          <Button variant="ghost" onClick={refresh}>
            <RefreshCw />
            새로고침
          </Button>
        </div>
        <CardDescription>
          {d.workflow.id} · 시작 {when(d.workflow.createdAt)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-lg font-medium">
          {stage?.kind ?? "단계 미확인"}{" "}
          <span className="text-sm font-normal text-muted-foreground">{stage?.detail}</span>
        </p>
        {d.workflow.halt && (
          <Alert variant="destructive">
            <AlertTitle>{d.workflow.halt.code}</AlertTitle>
            <AlertDescription>{d.workflow.halt.message}</AlertDescription>
          </Alert>
        )}
        <ol className="flex flex-wrap gap-2">
          {d.stages.map((item) => (
            <li key={item.index}>
              <Badge variant={item.index === d.workflow.currentStage ? "default" : "outline"}>
                {item.index + 1}. {item.kind} · {item.status}
              </Badge>
            </li>
          ))}
        </ol>
        <p className="text-xs text-muted-foreground">
          화면은 2초, 모듈은 5초 간격으로 갱신합니다. 미확인 값은 0으로 바꾸지 않습니다.
        </p>
      </CardContent>
    </Card>
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
function History({ id }: { id: string }) {
  const [eventCursor, setEventCursor] = useState<string | null>(null);
  const [historyCursor, setHistoryCursor] = useState<string | null>(null);
  const [since] = useState(() => new Date(Date.now() - 5 * 60_000).toISOString());
  const events = useQuery(eventsQuery(id, eventCursor));
  const history = useQuery(historyQuery(id, historyCursor, since));
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
