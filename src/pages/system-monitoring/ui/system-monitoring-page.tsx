import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { consoleApplicationsOptions } from "@/entities/application";
import { useSession } from "@/entities/session";
import { getApiErrorMessage } from "@/shared/api";
import { t, useLocale } from "@/shared/lib/i18n";
import { Button } from "@/shared/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { MonitoringNav } from "@/widgets/monitoring-nav";
import { hostsOptions, seriesOptions, systemKey } from "../api/system";
import { categories, type SystemSearch } from "../model/system";
import { BackendState, MetricPanel, time } from "./metric-panel";
type Props = { search: SystemSearch; onNavigate: (search: SystemSearch) => void };
function ErrorNotice({ error }: { error: Error | null }) {
  return error ? (
    <p role="alert" className="text-sm text-destructive">
      {getApiErrorMessage(error)}
    </p>
  ) : null;
}
function Choice({
  label,
  value,
  choices,
  onChange,
}: {
  label: string;
  value?: string;
  choices: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <Select value={value ?? ""} onValueChange={onChange}>
      <SelectTrigger aria-label={label} className="w-full min-w-0 sm:w-44">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        {choices.map((choice) => (
          <SelectItem key={choice.value} value={choice.value}>
            {choice.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
export function SystemMonitoringPage({ search, onNavigate }: Props) {
  useLocale();
  const session = useSession(),
    queryClient = useQueryClient();
  const applications = useQuery(consoleApplicationsOptions(session.workspaceId));
  const app = search.app
    ? applications.data?.seed.find((row) => row.id === search.app)
    : applications.data?.seed[0];
  const env = search.env ?? app?.environments[0]?.name;
  const valid = Boolean(app && app.environments.some((row) => row.name === env));
  const hosts = useQuery({
    ...hostsOptions(session.workspaceId, app?.id ?? "", env ?? ""),
    enabled: valid,
  });
  const host =
    search.host ?? hosts.data?.hosts.find((row) => !row.stale)?.name ?? hosts.data?.hosts[0]?.name;
  const selectedHost = hosts.data?.hosts.find((row) => row.name === host);
  const resolved = { ...search, app: app?.id, env, host };
  const metrics = useQuery({
    ...seriesOptions(session.workspaceId, resolved),
    enabled: valid && Boolean(host),
  });
  const refreshing = applications.isFetching || hosts.isFetching || metrics.isFetching;
  return (
    <section
      aria-labelledby="system-title"
      className="mx-auto w-full max-w-6xl space-y-5 px-4 py-6 sm:px-8"
    >
      <MonitoringNav active="system" app={app?.id} workflow={search.workflow} />
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 id="system-title" className="text-2xl font-semibold tracking-tight">
            {t("시스템 메트릭")}
          </h1>
          <p className="text-sm text-muted-foreground">{t("앱 실행 서버 전체")}</p>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link to="/applications">
            <ArrowLeft aria-hidden />
            {t("애플리케이션")}
          </Link>
        </Button>
      </header>
      <div className="flex flex-wrap gap-3">
        <div className="grid min-w-0 flex-1 basis-full grid-cols-1 gap-3 min-[360px]:grid-cols-2 sm:flex sm:basis-auto sm:flex-wrap">
          <Choice
            label={t("애플리케이션")}
            value={app?.id}
            choices={applications.data?.seed.map((row) => ({ value: row.id, label: row.id })) ?? []}
            onChange={(value) =>
              onNavigate({ ...search, app: value, env: undefined, host: undefined })
            }
          />
          <Choice
            label={t("환경")}
            value={env}
            choices={app?.environments.map((row) => ({ value: row.name, label: row.name })) ?? []}
            onChange={(value) => onNavigate({ ...resolved, env: value, host: undefined })}
          />
          <Choice
            label={t("서버")}
            value={host}
            choices={[
              ...(hosts.data?.hosts.map((row) => ({ value: row.name, label: row.name })) ?? []),
              ...(host && !selectedHost ? [{ value: host, label: host }] : []),
            ]}
            onChange={(value) => onNavigate({ ...resolved, host: value })}
          />
          <Choice
            label={t("조회 기간")}
            value={String(search.minutes)}
            choices={[
              { value: "15", label: t("15분") },
              { value: "60", label: t("1시간") },
              { value: "360", label: t("6시간") },
            ]}
            onChange={(value) =>
              onNavigate({ ...resolved, minutes: Number(value) as SystemSearch["minutes"] })
            }
          />
        </div>
        <Button
          size="sm"
          variant="outline"
          disabled={refreshing}
          onClick={() => {
            void applications.refetch();
            void queryClient.invalidateQueries({
              queryKey: systemKey(session.workspaceId, app?.id ?? ""),
            });
          }}
        >
          <RefreshCw
            aria-hidden
            className={refreshing ? "animate-spin motion-reduce:animate-none" : ""}
          />
          {t("새로고침")}
        </Button>
      </div>
      <ErrorNotice error={applications.error ?? hosts.error ?? metrics.error} />
      {applications.isPending || (valid && hosts.isPending) ? (
        <p role="status" className="py-8">
          {t("조회 중…")}
        </p>
      ) : (applications.error && !applications.data) ||
        (hosts.error && !hosts.data) ? null : !valid ? (
        <p role="status">{t("관측 가능한 앱·환경이 없습니다")}</p>
      ) : hosts.data?.state !== "OK" && hosts.data ? (
        <BackendState state={hosts.data.state} />
      ) : !host ? (
        <p role="status" className="py-8 text-sm text-muted-foreground">
          {t("수집 중인 서버 없음")}
        </p>
      ) : (
        <>
          <nav aria-label={t("시스템 지표")} className="flex flex-wrap gap-1 border-b pb-2">
            {Object.entries(categories).map(([value, label]) => (
              <Button
                key={value}
                asChild
                variant={search.category === value ? "secondary" : "ghost"}
                size="sm"
              >
                <Link
                  to="/monitoring/systems"
                  search={{ ...resolved, category: value as SystemSearch["category"] }}
                  resetScroll={false}
                  aria-current={search.category === value ? "page" : undefined}
                >
                  {t(label)}
                </Link>
              </Button>
            ))}
          </nav>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-medium">
              {t(categories[search.category])} · {env}
            </h2>
            <p role="status" className="text-xs text-muted-foreground">
              {selectedHost ? (
                <>
                  {selectedHost.stale ? t("수집 중단") : t("마지막 수집")}{" "}
                  {time(selectedHost.lastSeen)}
                </>
              ) : (
                t("서버 수집 미확인")
              )}
            </p>
          </div>
          {(metrics.error || hosts.error) && metrics.data && (
            <p className="text-xs text-muted-foreground">
              {t("이전 값 표시 중 · 최신 상태 미확인")}
            </p>
          )}
          {metrics.isPending && (
            <div
              role="status"
              className="h-56 rounded-xl border bg-muted/20 p-4 text-sm text-muted-foreground"
            >
              {t("조회 중…")}
            </div>
          )}
          {metrics.data && (
            <div className="grid gap-4 md:grid-cols-2">
              {metrics.data.series.map((metric) => (
                <MetricPanel key={metric.id} metric={metric} range={metrics.data} />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
