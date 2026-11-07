import { useEffect } from "react";
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
import { deploymentsOptions, instancesOptions, seriesOptions, systemKey } from "../api/system";
import { categories, type SystemSearch } from "../model/system";
import { BackendState, MetricPanel, time } from "./metric-panel";
type Props = {
  search: SystemSearch;
  onNavigate: (search: SystemSearch, replace?: boolean) => void;
};
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
        <SelectValue placeholder={label}>
          {value && !choices.some((row) => row.value === value) ? value : undefined}
        </SelectValue>
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
  const deployments = useQuery(deploymentsOptions(session.workspaceId, app?.id ?? ""));
  const choices = deployments.data?.environments ?? [];
  const selectedDeployment = search.deployment
    ? choices.find((row) => row.environmentId === search.deployment)
    : choices.find(
        (row) => (!search.env || row.cloud === search.env) && row.status !== "DESTROYED",
      );
  const deployment = selectedDeployment?.environmentId;
  const env = selectedDeployment?.cloud;
  const valid = Boolean(app && deployment);
  const instances = useQuery(
    instancesOptions(session.workspaceId, app?.id ?? "", deployment ?? ""),
  );
  const liveInstances = instances.data?.instances.filter((row) => !row.stale) ?? [];
  const instance = search.instance ?? liveInstances[0]?.id;
  const selectedInstance = instances.data?.instances.find((row) => row.id === instance);
  const resolved = { ...search, app: app?.id, env, deployment, instance };
  useEffect(() => {
    if (deployment && instance && (!search.deployment || !search.instance)) {
      onNavigate({ ...search, app: app?.id, deployment, instance, env }, true);
    }
  }, [deployment, instance, search, app?.id, env, onNavigate]);
  const metrics = useQuery({
    ...seriesOptions(session.workspaceId, resolved),
    enabled: valid && Boolean(instance),
  });
  const refreshing =
    applications.isFetching || deployments.isFetching || instances.isFetching || metrics.isFetching;
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
          <p className="text-sm text-muted-foreground">{t("선택한 앱 배포의 컨테이너")}</p>
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
              onNavigate({
                ...search,
                app: value,
                env: undefined,
                deployment: undefined,
                instance: undefined,
              })
            }
          />
          <Choice
            label={t("배포")}
            value={deployment}
            choices={choices.map((row) => ({
              value: row.environmentId,
              label: `${row.cloud} · ${row.deploymentId}`,
            }))}
            onChange={(value) =>
              onNavigate({ ...resolved, deployment: value, env: undefined, instance: undefined })
            }
          />
          <Choice
            label={t("실행 인스턴스")}
            value={instance}
            choices={
              liveInstances.map((row) => ({
                value: row.id,
                label: `${row.role} · ${row.id}`,
              })) ?? []
            }
            onChange={(value) => onNavigate({ ...resolved, instance: value })}
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
            void deployments.refetch();
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
      {selectedDeployment && (
        <p className="break-all text-xs text-muted-foreground">
          {selectedDeployment.cloud} · {selectedDeployment.environmentId}
          <br />
          {selectedDeployment.deploymentId}
        </p>
      )}
      <ErrorNotice
        error={applications.error ?? deployments.error ?? instances.error ?? metrics.error}
      />
      {applications.isPending ||
      (app && deployments.isPending) ||
      (valid && instances.isPending) ? (
        <p role="status" className="py-8">
          {t("조회 중…")}
        </p>
      ) : (applications.error && !applications.data) ||
        (deployments.error && !deployments.data) ||
        (instances.error && !instances.data) ? null : deployments.data &&
        deployments.data.state !== "OK" ? (
        <BackendState state={deployments.data.state} />
      ) : !valid ? (
        <p role="status">
          {t(
            search.deployment
              ? "선택한 배포의 수집이 중단되었습니다"
              : "수집 중인 앱 배포가 없습니다",
          )}
        </p>
      ) : instances.data?.state !== "OK" && instances.data ? (
        <BackendState state={instances.data.state} />
      ) : !instance ? (
        <p role="status" className="py-8 text-sm text-muted-foreground">
          {t("이 배포에서 수집 중인 인스턴스가 없습니다")}
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
              {selectedInstance ? (
                <>
                  {selectedInstance.stale ? t("수집 중단") : t("마지막 수집")}{" "}
                  {time(selectedInstance.lastSeen)}
                </>
              ) : (
                t("인스턴스 수집 미확인")
              )}
            </p>
          </div>
          {search.category === "network" && selectedInstance?.networkScope === "app-instance" && (
            <p className="text-xs text-muted-foreground">
              {t(
                "네트워크는 같은 앱 실행 묶음의 API·워커·터널 합계입니다. API 인스턴스에서 수집합니다.",
              )}
            </p>
          )}
          {(metrics.error || instances.error) && metrics.data && (
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
