import { t, useLocale } from "@/shared/lib/i18n";
import { Metric, State, value, when, type Resource } from "@/entities/migration";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { ObservationSection } from "./observation-section";
export function ResourceObservation({ resource: r }: { resource: Resource }) {
  useLocale();
  const db = r.details.database;
  const redis = r.details.redis;
  const object = r.details.object;
  const names: Record<string, string> = {
    DATABASE: t("데이터베이스"),
    REDIS: "Redis",
    OBJECT_STORAGE: t("객체 저장소"),
  };
  const copy = object?.initialCopyObservedAt ? r.replication?.initialCopy : undefined;
  const objectChecks = Object.values(object?.readiness ?? {})
    .flatMap((row) => row.checks)
    .filter((row) => row.verification);
  const checks = r.checks.filter((check) =>
    ["CUTOVER", "RESUME", "ROLLBACK"].includes(check.stage),
  );
  return (
    <section className="space-y-5" aria-label={names[r.kind] ?? r.kind}>
      <header className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <h2 className="text-base font-semibold">{names[r.kind] ?? r.kind}</h2>
        <State state={r.health} />
        <State state={r.observation.freshness} />
        <span className="min-w-0 text-xs break-all text-muted-foreground">
          {r.migrationId
            ? `${value(r.lifecycle)} · ${value(r.phase)}`
            : t("마이그레이션 등록 대기")}
        </span>
      </header>
      <div className="grid gap-x-10 gap-y-6 lg:grid-cols-2">
        <ObservationSection title={r.kind === "DATABASE" ? t("연결") : t("동기화")}>
          <dl>
            {!db && !redis && !object && <Metric label={t("관측값")}>{t("미확인")}</Metric>}
            {db && (
              <>
                <Metric label={t("PgBouncer 정지")}>{value(db.proxyPaused)}</Metric>
                <Metric label={t("Writer 세션 (원본 / 대상)")}>
                  {value(db.sourceWriterSessions)} / {value(db.targetWriterSessions)}
                </Metric>
                <Metric label={t("대상 접근 가능")}>{value(db.targetReachable)}</Metric>
                <Metric label={t("쓰기 접근 근거")}>{value(db.accessEvidence)}</Metric>
              </>
            )}
            {redis && (
              <>
                <Metric label={t("동기화 방향")}>{value(redis.sync?.direction)}</Metric>
                <Metric label={t("Backlog / 처리 건수")}>
                  {value(redis.sync?.backlog)} / {value(redis.sync?.copied)}
                </Metric>
                <Metric label={t("최장 대기 (ms)")}>{value(redis.sync?.oldestDirtyAgeMs)}</Metric>
                <Metric label={t("동기화 측정")}>
                  <span className="space-x-1">
                    {when(redis.sync?.observedAt)} <State state={redis.sync?.freshness} />
                  </span>
                </Metric>
              </>
            )}
            {object && (
              <>
                <Metric label={t("초기 복사 객체")}>
                  {value(copy?.completed)} / {value(copy?.total)}
                </Metric>
                <Metric label={t("초기 복사 바이트")}>
                  {value(copy?.bytes)} / {value(copy?.totalBytes)}
                </Metric>
                <Metric label={t("정방향 / 역방향 backlog")}>
                  {value(object.forwardObservedAt ? r.replication?.forward?.backlog : null)} /{" "}
                  {value(object.reverseObservedAt ? r.replication?.reverse?.backlog : null)}
                </Metric>
                <Metric label={t("마지막 동기화")}>
                  <span className="space-x-1">
                    {when(object.lastSuccessfulSyncAt)} <State state={object.syncFreshness} />
                  </span>
                </Metric>
              </>
            )}
          </dl>
        </ObservationSection>
        <ObservationSection title={t("경로·쓰기")}>
          <dl>
            <Metric label={t("현재 데이터 경로")}>{value(r.route)}</Metric>
            <Metric label={t("쓰기 접근")}>{value(r.businessWriteAccess)}</Metric>
            {redis && (
              <>
                <Metric label={t("생산자 / 소비자")}>
                  {value(redis.producerRoute)} / {value(redis.consumerRoute)}
                </Metric>
                <Metric label={t("원본 소비 소진")}>{value(redis.drainStatus)}</Metric>
                <Metric label={t("Proxy 정지 / 쓰기 진행")}>
                  {value(redis.proxy?.paused)} / {value(redis.proxy?.inflight_writes)}
                </Metric>
                <Metric label={t("마지막 정지 (ms)")}>{value(redis.proxy?.last_pause_ms)}</Metric>
              </>
            )}
            {object && (
              <>
                <Metric label={t("경로 적용 / 기대 앱")}>
                  {value(object.apps?.acked)} / {value(object.expectedApps)}
                </Metric>
                <Metric label={t("보고 중인 앱")}>
                  {value(object.apps?.live)}
                  {object.apps?.recovering ? t(" (재등록 대기)") : ""}
                </Metric>
              </>
            )}
          </dl>
        </ObservationSection>
        <ObservationSection title={t("검증")}>
          <dl>
            {!db && !redis && !object && <Metric label={t("검증 결과")}>{t("미확인")}</Metric>}
            {db && (
              <>
                <Metric label={t("검증 방식")}>{value(db.verification?.method)}</Metric>
                <Metric label={t("검증 시각")}>{when(db.verification?.observedAt)}</Metric>
                {db.verification?.committedThroughLsn && (
                  <Metric label={t("Barrier / 적용 LSN")}>
                    {db.verification.committedThroughLsn} /{" "}
                    {value(db.verification.durableOriginLsn)}
                  </Metric>
                )}
              </>
            )}
            {redis && (
              <>
                <Metric label={t("검증 방식 / 불일치")}>
                  {value(redis.sync?.verification?.method)} /{" "}
                  {value(redis.sync?.verification?.mismatchCount)}
                </Metric>
              </>
            )}
            {object && (
              <>
                {objectChecks.map((check) => (
                  <Metric key={check.name} label={check.name}>
                    {check.verification?.method}
                    {t(" · 누락 ")}
                    {value(check.verification?.missing)}
                    {t(" / 차이")} {value(check.verification?.different)}
                  </Metric>
                ))}
              </>
            )}
            {object && objectChecks.length === 0 && (
              <Metric label={t("검증 결과")}>{t("미확인")}</Metric>
            )}
          </dl>
        </ObservationSection>
        <ObservationSection title={t("전환·복귀 조건")}>
          <dl>
            <Metric label={t("복귀 방식")}>{value(r.rollback?.method)}</Metric>
            <Metric label={t("대상 쓰기 가능")}>{value(r.targetWritesPossible)}</Metric>
          </dl>
          {r.rollback?.reasons.length ? (
            <p className="text-xs break-words text-muted-foreground">
              {r.rollback.reasons.join(", ")}
            </p>
          ) : null}
          {checks.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("조건")}</TableHead>
                  <TableHead>{t("현재")}</TableHead>
                  <TableHead>{t("최근 판정")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {checks.map((check) => (
                  <TableRow key={check.code}>
                    <TableCell className="text-xs">{check.code}</TableCell>
                    <TableCell>
                      <State state={check.currentResult} />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {check.decision.result}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">{t("판정 없음")}</p>
          )}
        </ObservationSection>
      </div>
      <dl className="flex flex-wrap gap-x-6 gap-y-2 border-t pt-4 text-xs text-muted-foreground">
        <div>
          <dt>{t("측정 시각")}</dt>
          <dd>{when(r.observedAt)}</dd>
        </div>
        <div>
          <dt>{t("마지막 진전")}</dt>
          <dd>{when(r.observation.lastProgressAt ?? object?.lastProgressAt)}</dd>
        </div>
        <div>
          <dt>{t("수집 시각")}</dt>
          <dd>
            {when(r.observation.collectedAt)} · {r.observation.source ?? t("수집 대기")}
          </dd>
        </div>
      </dl>
      {r.observation.collectionError && (
        <p role="alert" className="text-sm break-words text-destructive">
          {r.observation.collectionError}
        </p>
      )}
    </section>
  );
}
