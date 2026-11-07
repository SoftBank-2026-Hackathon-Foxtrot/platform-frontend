import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Separator } from "@/shared/ui/separator";

import type { Resource } from "../api/migrations";

export function value(input: string | number | boolean | null | undefined): string {
  if (input == null || input === "") return "미확인";
  if (typeof input === "boolean") return input ? "예" : "아니오";
  return String(input);
}
export function when(input: string | null | undefined): string {
  return input ? new Date(input).toLocaleString("ko-KR", { hour12: false }) : "미확인";
}
export function State({ state }: { state: string | null | undefined }) {
  const labels: Record<string, string> = {
    FRESH: "최신",
    STALE: "오래된 측정",
    UNAVAILABLE: "수집 실패",
    UNKNOWN: "미확인",
  };
  return (
    <Badge
      variant={
        state === "UNAVAILABLE" || state === "FAIL" || state === "FAILED"
          ? "destructive"
          : "outline"
      }
    >
      {labels[state ?? ""] ?? value(state)}
    </Badge>
  );
}
export function Metric({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-5 py-1.5">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="text-right break-all tabular-nums">{children}</dd>
    </div>
  );
}
export function ResourceCard({ resource: r }: { resource: Resource }) {
  const db = r.details.database;
  const redis = r.details.redis;
  const object = r.details.object;
  const names: Record<string, string> = {
    DATABASE: "데이터베이스",
    REDIS: "Redis",
    OBJECT_STORAGE: "객체 저장소",
  };
  const copy = object?.initialCopyObservedAt ? r.replication?.initialCopy : undefined;
  const objectChecks = Object.values(object?.readiness ?? {})
    .flatMap((row) => row.checks)
    .filter((row) => row.verification);
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle>{names[r.kind] ?? r.kind}</CardTitle>
          <State state={r.observation.freshness} />
        </div>
        <CardDescription>
          {r.migrationId ? `${value(r.lifecycle)} · ${value(r.phase)}` : "마이그레이션 등록 대기"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <dl>
          <Metric label="현재 데이터 경로">{value(r.route)}</Metric>
          <Metric label="쓰기 접근">{value(r.businessWriteAccess)}</Metric>
          <Metric label="상태">
            <State state={r.health} />
          </Metric>
          {db && (
            <>
              <Metric label="PgBouncer 정지">{value(db.proxyPaused)}</Metric>
              <Metric label="Writer 세션 (원본 / 대상)">
                {value(db.sourceWriterSessions)} / {value(db.targetWriterSessions)}
              </Metric>
              <Metric label="대상 접근 가능">{value(db.targetReachable)}</Metric>
              <Metric label="쓰기 접근 근거">{value(db.accessEvidence)}</Metric>
              <Metric label="검증 방식">{value(db.verification?.method)}</Metric>
              <Metric label="검증 시각">{when(db.verification?.observedAt)}</Metric>
              {db.verification?.committedThroughLsn && (
                <Metric label="Barrier / 적용 LSN">
                  {db.verification.committedThroughLsn} / {value(db.verification.durableOriginLsn)}
                </Metric>
              )}
            </>
          )}
          {redis && (
            <>
              <Metric label="동기화 방향">{value(redis.sync?.direction)}</Metric>
              <Metric label="Backlog / 처리 건수">
                {value(redis.sync?.backlog)} / {value(redis.sync?.copied)}
              </Metric>
              <Metric label="최장 대기 (ms)">{value(redis.sync?.oldestDirtyAgeMs)}</Metric>
              <Metric label="동기화 측정">
                <span className="space-x-1">
                  {when(redis.sync?.observedAt)} <State state={redis.sync?.freshness} />
                </span>
              </Metric>
              <Metric label="생산자 / 소비자">
                {value(redis.producerRoute)} / {value(redis.consumerRoute)}
              </Metric>
              <Metric label="원본 소비 소진">{value(redis.drainStatus)}</Metric>
              <Metric label="Proxy 정지 / 쓰기 진행">
                {value(redis.proxy?.paused)} / {value(redis.proxy?.inflight_writes)}
              </Metric>
              <Metric label="마지막 정지 (ms)">{value(redis.proxy?.last_pause_ms)}</Metric>
              <Metric label="검증 방식 / 불일치">
                {value(redis.sync?.verification?.method)} /{" "}
                {value(redis.sync?.verification?.mismatchCount)}
              </Metric>
            </>
          )}
          {object && (
            <>
              <Metric label="초기 복사 객체">
                {value(copy?.completed)} / {value(copy?.total)}
              </Metric>
              <Metric label="초기 복사 바이트">
                {value(copy?.bytes)} / {value(copy?.totalBytes)}
              </Metric>
              <Metric label="정방향 / 역방향 backlog">
                {value(object.forwardObservedAt ? r.replication?.forward?.backlog : null)} /{" "}
                {value(object.reverseObservedAt ? r.replication?.reverse?.backlog : null)}
              </Metric>
              <Metric label="경로 적용 / 기대 앱">
                {value(object.apps?.acked)} / {value(object.expectedApps)}
              </Metric>
              <Metric label="보고 중인 앱">
                {value(object.apps?.live)}
                {object.apps?.recovering ? " (재등록 대기)" : ""}
              </Metric>
              <Metric label="마지막 동기화">
                <span className="space-x-1">
                  {when(object.lastSuccessfulSyncAt)} <State state={object.syncFreshness} />
                </span>
              </Metric>
              {objectChecks.map((check) => (
                <Metric key={check.name} label={check.name}>
                  {check.verification?.method} · 누락 {value(check.verification?.missing)} / 차이{" "}
                  {value(check.verification?.different)}
                </Metric>
              ))}
            </>
          )}
        </dl>
        <Separator />
        <div className="space-y-2">
          <p className="font-medium">전환·복귀 조건</p>
          <p className="text-muted-foreground">
            복귀 방식: {value(r.rollback?.method)}
            {r.rollback?.reasons.length ? ` · ${r.rollback.reasons.join(", ")}` : ""}
          </p>
          <p className="text-xs text-muted-foreground">
            대상 쓰기 가능성: {value(r.targetWritesPossible)}. 실제 쓰기 건수를 뜻하지 않습니다.
          </p>
          <ul className="space-y-2">
            {r.checks
              .filter((check) => ["CUTOVER", "RESUME", "ROLLBACK"].includes(check.stage))
              .map((check) => (
                <li key={check.code} className="flex flex-wrap items-center justify-between gap-2">
                  <span>{check.code}</span>
                  <span className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      기록 {check.decision.result}
                    </span>
                    <State state={check.currentResult} />
                  </span>
                </li>
              ))}
          </ul>
        </div>
        <div className="space-y-1 text-xs text-muted-foreground">
          <p>원 측정: {when(r.observedAt)}</p>
          <p>마지막 진전: {when(r.observation.lastProgressAt ?? object?.lastProgressAt)}</p>
          <p>
            수집: {when(r.observation.collectedAt)} · {r.observation.source ?? "수집 대기"}
          </p>
          {r.observation.collectionError && (
            <p className="text-destructive">{r.observation.collectionError}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
