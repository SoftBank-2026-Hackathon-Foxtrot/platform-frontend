import { t, useLocale } from "@/shared/lib/i18n";
import { Metric, State, value, type Resource, type Workflow } from "@/entities/migration";
import { MonitoringEntryLink } from "./monitoring-entry";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
export { Metric, State, value, when } from "@/entities/migration";
export function ResourceCard({
  resource: r,
  workflow,
}: {
  resource: Resource;
  workflow: Workflow;
}) {
  useLocale();
  const comp = r.kind === "DATABASE" ? "db" : r.kind === "REDIS" ? "redis" : "obj";
  const name =
    r.kind === "DATABASE" ? t("데이터베이스") : r.kind === "REDIS" ? "Redis" : t("객체 저장소");
  return (
    <Card size="sm">
      <CardHeader className="flex flex-wrap items-center justify-between gap-2">
        <CardTitle>{name}</CardTitle>
        <State state={r.observation.freshness} />
      </CardHeader>
      <CardContent className="space-y-3">
        <dl>
          <Metric label={t("현재 데이터 경로")}>{value(r.route)}</Metric>
          <Metric label={t("쓰기 접근")}>{value(r.businessWriteAccess)}</Metric>
          <Metric label={t("상태")}>
            <State state={r.health} />
          </Metric>
        </dl>
        <div className="space-y-2 border-t pt-3">
          <p className="text-xs font-medium">{t("전환·복귀 조건")}</p>
          <ul className="space-y-2">
            {r.checks
              .filter((check) => ["CUTOVER", "RESUME", "ROLLBACK"].includes(check.stage))
              .map((check) => (
                <li
                  key={check.code}
                  className="flex flex-wrap items-center justify-between gap-2 text-xs"
                >
                  <span>{check.code}</span>
                  <State state={check.currentResult} />
                </li>
              ))}
            {!r.checks.some((check) => ["CUTOVER", "RESUME", "ROLLBACK"].includes(check.stage)) && (
              <li className="text-xs text-muted-foreground">{t("미확인")}</li>
            )}
          </ul>
        </div>
        {r.observation.collectionError && (
          <p className="text-xs text-destructive">{r.observation.collectionError}</p>
        )}
        <div className="flex flex-wrap gap-2 border-t pt-2">
          <Button asChild variant="link" size="sm" className="px-0">
            <MonitoringEntryLink
              workflow={workflow}
              comp={comp}
              anchor={`resource-${comp}-metrics`}
            >
              {t("지표 보기")}
            </MonitoringEntryLink>
          </Button>
          <Button asChild variant="link" size="sm">
            <MonitoringEntryLink
              workflow={workflow}
              comp={comp}
              tab="obs"
              anchor={`resource-${comp}-replication`}
            >
              {t("복제·동기화 상세")}
            </MonitoringEntryLink>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
