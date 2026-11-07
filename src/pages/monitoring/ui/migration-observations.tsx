import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  detailQuery,
  historyQuery,
  telemetryQuery,
  Metric,
  State,
  value,
  when,
  type Detail,
} from "@/entities/migration";
import type { TelemetryComponent } from "@/entities/telemetry";
import { t, useLocale } from "@/shared/lib/i18n";
import { Button } from "@/shared/ui/button";
import { ObservationDisclosure, ObservationSection } from "./observation-section";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { QueryNotice, Empty } from "./query-notice";
import { ResourceObservation } from "./resource-observation";
import { traceTimestamp } from "../model/monitoring";
function split(weights: Record<string, number> | null | undefined) {
  return weights
    ? Object.entries(weights)
        .map(([env, percent]) => `${env} ${percent}%`)
        .join(" / ")
    : t("미확인");
}
function NotOffered() {
  return <Empty>{t("서버 미지원")}</Empty>;
}
export function MigrationObservations({
  workspace,
  id,
  comp,
  onTrace,
}: {
  workspace: string;
  id: string;
  comp: TelemetryComponent;
  onTrace: (trace: string, at?: string) => void;
}) {
  const detail = useQuery(detailQuery(workspace, id));
  const resource = detail.data?.resources.find(
    (r) => r.kind === { db: "DATABASE", redis: "REDIS", obj: "OBJECT_STORAGE", app: "APP" }[comp],
  );
  return (
    <div className="space-y-5">
      <QueryNotice query={detail} subject={t("마이그레이션 관측")} />
      {detail.data?.simulation && <p className="text-xs text-warning">{t("예시 데이터")}</p>}
      {detail.data &&
        (comp === "app" ? (
          <section aria-label={t("앱 상태")} className="space-y-5">
            <h2 className="text-base font-semibold">{t("앱")}</h2>
            <Traffic data={detail.data} />
            <Workload data={detail.data} />
          </section>
        ) : resource ? (
          <ResourceObservation resource={resource} />
        ) : (
          <Empty>{t("관측값 없음")}</Empty>
        ))}
      <Telemetry workspace={workspace} id={id} onTrace={onTrace} />
      <ObservationHistory workspace={workspace} id={id} />
    </div>
  );
}
function Traffic({ data }: { data: Detail }) {
  useLocale();
  const configured = data.traffic.at(-1);
  const p = data.publicProbe;
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ObservationSection title={t("트래픽 분배")}>
        <dl>
          <Metric label={t("요청 가중치")}>{split(configured?.requested)}</Metric>
          <Metric label={t("LB 확인 가중치")}>{split(configured?.effectivePercent)}</Metric>
          <Metric label={t("설정 확인")}>
            {configured?.configVerified ? t("확인됨") : t("미확인")}
          </Metric>
          <Metric label={t("Traffic 작업 ID")}>{value(configured?.adapterOperationId)}</Metric>
          <Metric label={t("작업 상태")}>{value(configured?.operationStatus)}</Metric>
        </dl>
      </ObservationSection>
      <ObservationSection title={t("프로브 결과")}>
        {p ? (
          <>
            <dl>
              <Metric label={t("Probe 최신성")}>
                <State state={p.freshness} />
              </Metric>
              <Metric label={t("테스트 요청 도착 비율")}>{split(p.observedPercent)}</Metric>
              <Metric label={t("시도 / 위치 확인")}>
                {p.total} / {p.knownLocationSamples}
              </Metric>
              <Metric label={t("실패 / 시간 초과")}>
                {p.failed} / {p.timeouts}
              </Metric>
              <Metric label={t("위치 미확인 / 누락")}>
                {p.unknownLocation} / {p.missingSamples}
              </Metric>
              <Metric label={t("성공 p95 / 최대 간격")}>
                {value(p.p95Ms)} ms / {p.maxSampleGapSeconds} s
              </Metric>
            </dl>
            <p className="mt-2 text-xs text-muted-foreground">
              {when(p.windowStart)} — {when(p.windowEnd)}
              {!p.enoughSamples && t(" · 확인된 표본 30개 미만")}
            </p>
            {p.failureIntervals.map((failure) => (
              <p key={failure.firstFailureAt} className="mt-2 text-xs text-destructive">
                {t("관측 실패 ")}
                {when(failure.firstFailureAt)} — {when(failure.lastFailureAt)}
                {t(" · 회복")} {when(failure.recoveredAt)}
              </p>
            ))}
          </>
        ) : (
          <p className="text-muted-foreground">{t("프로브 데이터 없음")}</p>
        )}
      </ObservationSection>
    </div>
  );
}
function Workload({ data }: { data: Detail }) {
  useLocale();
  return (
    <ObservationSection title={t("앱 상태")}>
      <p className="text-xs text-muted-foreground">
        {data.hold.isLive ? t("현재 업무 지시") : t("보관된 업무 지시")} {data.hold.desired}
        {t(" · 세대")} {data.hold.generation}
        {t(" · 전체 정지 확인 ")}
        {when(data.hold.heldSince)}
      </p>
      <div className="space-y-5">
        <div className="flex flex-wrap gap-4">
          {data.businessProbes.map((probe) => (
            <div key={probe.env} className="space-y-1">
              <p className="flex items-center gap-2 font-medium">
                {probe.env}
                <State state={probe.freshness} />
                <State state={probe.latest ? (probe.latest.passed ? "PASS" : "FAIL") : "UNKNOWN"} />
              </p>
              <p className="text-xs text-muted-foreground">
                {probe.collectionState === "SKIPPED_HELD" ? t("HOLD · 검사 생략 ") : ""}
                {when(probe.latest?.finishedAt)} {probe.latest?.reason}
              </p>
            </div>
          ))}
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("앱 역할")}</TableHead>
              <TableHead>{t("상태")}</TableHead>
              <TableHead>{t("보고 / 기대")}</TableHead>
              <TableHead>{t("업무 in-flight")}</TableHead>
              <TableHead>{t("잔여 WebSocket")}</TableHead>
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
                    : t("{0} (일부 보고)", [actor.inFlight])}
                </TableCell>
                <TableCell>{value(actor.activeWebSockets)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </ObservationSection>
  );
}
function ObservationHistory({ workspace, id }: { workspace: string; id: string }) {
  const [cursor, setCursor] = useState<string | null>(null);
  const [since] = useState(() => new Date(Date.now() - 5 * 60000).toISOString());
  const history = useQuery(historyQuery(workspace, id, cursor, since));
  return (
    <div>
      {history.error && <QueryNotice query={history} subject={t("관측 이력")} />}
      <ObservationDisclosure title={t("관측 이력 · 전체 리소스")}>
        <p className="text-xs text-muted-foreground">
          {t("조회 시작")} {when(since)}
        </p>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("수집")}</TableHead>
              <TableHead>{t("모듈")}</TableHead>
              <TableHead>{t("단계 / 오류")}</TableHead>
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
        {history.isPending && <p>{t("조회 중…")}</p>}
        {history.data === null && <NotOffered />}
        {history.data?.observations.length === 0 && <p>{t("표본 없음")}</p>}
        <Button
          variant="outline"
          disabled={!history.data?.nextCursor}
          onClick={() => setCursor(history.data?.nextCursor ?? null)}
        >
          {t("다음 표본")}
        </Button>
      </ObservationDisclosure>
    </div>
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
function Telemetry({
  workspace,
  id,
  onTrace,
}: {
  workspace: string;
  id: string;
  onTrace: (trace: string, at?: string) => void;
}) {
  useLocale();
  const query = useQuery(telemetryQuery(workspace, id));
  return (
    <div>
      {query.error && <QueryNotice query={query} subject={t("수집 데이터")} />}
      <ObservationDisclosure title={t("수집 지표·트레이스 · 전체 리소스")}>
        {query.isPending && <p role="status">{t("조회 중…")}</p>}
        {query.data === null && <NotOffered />}
        {query.data && (
          <>
            <p className="flex flex-wrap gap-3">
              {t("메트릭 ")}
              <State state={query.data.metricsState} />
              {t(" 추적")} <State state={query.data.tracesState} />
            </p>
            {query.data.metrics.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("대상")}</TableHead>
                    <TableHead>{t("수치")}</TableHead>
                    <TableHead>{t("값")}</TableHead>
                    <TableHead>{t("표본")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {query.data.metrics.map((m, index) => (
                    <TableRow key={`${m.name}-${m.resource}-${m.actor}-${index}`}>
                      <TableCell>
                        {[m.resource, m.direction, m.actor].filter(Boolean).join(" / ") ||
                          m.service}
                      </TableCell>
                      <TableCell>{t(metricNames[m.name] ?? m.name)}</TableCell>
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
              <p>{t("지표 없음")}</p>
            )}
            {query.data.traces.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("작업 추적 ID")}</TableHead>
                    <TableHead>{t("시작 서비스 / 작업")}</TableHead>
                    <TableHead>{t("소요 (ms)")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {query.data.traces.map((t) => (
                    <TableRow key={t.traceID}>
                      <TableCell className="font-mono text-xs">
                        <Button
                          variant="link"
                          className="h-auto max-w-full p-0 text-left font-mono text-xs whitespace-normal break-all"
                          onClick={() => onTrace(t.traceID, traceTimestamp(t.startTimeUnixNano))}
                        >
                          {t.traceID}
                        </Button>
                      </TableCell>
                      <TableCell>
                        {t.rootServiceName} / {t.rootTraceName}
                      </TableCell>
                      <TableCell>{value(t.durationMs)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p>{t("트레이스 없음")}</p>
            )}
          </>
        )}
      </ObservationDisclosure>
    </div>
  );
}
