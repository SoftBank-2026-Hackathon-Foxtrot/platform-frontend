import { MonitoringNav } from "@/widgets/monitoring-nav";
import { useEffect, useRef, useState } from "react";
import { useIsFetching, useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, RefreshCw, X } from "lucide-react";
import {
  migrationReturn,
  workflowKeys,
  workflowsOptions,
  type Workflow,
} from "@/entities/migration";
import { useSession } from "@/entities/session";
import { collectionHealth, collectionOptions, type TelemetryComponent } from "@/entities/telemetry";
import { t, useLocale } from "@/shared/lib/i18n";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/shared/ui/toggle-group";
import {
  logsOptions,
  scopeOptions,
  seriesOptions,
  tracesOptions,
  type Trace,
} from "../api/monitoring";
import {
  components,
  drilldownRange,
  filterTraces,
  metricDefinitions,
  timeRange,
  type MonitoringSearch,
  type MonitoringTab,
} from "../model/monitoring";
import { LogList } from "./log-list";
import { clockTime, MetricChart, SeriesMark } from "./metric-chart";
import { Empty, QueryNotice } from "./query-notice";
import { MigrationObservations } from "./migration-observations";
import { SelectedTrace, TraceList } from "./trace-list";
import "./monitoring.css";

export type MonitoringNavigate = (
  search: MonitoringSearch,
  tab: MonitoringTab,
  replace?: boolean,
) => void;
type Props = { search: MonitoringSearch; tab: MonitoringTab; onNavigate: MonitoringNavigate };
export function MonitoringPage(props: Props) {
  useLocale();
  const session = useSession();
  const workflows = useQuery(workflowsOptions(session.workspaceId));
  const workflow = props.search.workflow
    ? workflows.data?.find((item) => item.id === props.search.workflow)
    : (workflows.data?.find((item) => !["COMPLETED", "ABORTED"].includes(item.status)) ??
      workflows.data?.[0]);
  return (
    <section
      aria-labelledby="monitoring-title"
      className="monitoring mx-auto w-full max-w-6xl space-y-5 px-4 py-6 sm:px-8"
    >
      <span id={props.tab} aria-hidden="true" className="block h-0 scroll-mt-12" />
      <MonitoringNav active="migration" app={workflow?.application} workflow={workflow?.id} />
      <ReturnLink search={props.search} workflow={workflow} />
      {!workflow && (
        <h1 id="monitoring-title" className="text-2xl font-semibold tracking-tight">
          {t("모니터링")}
        </h1>
      )}
      <QueryNotice query={workflows} subject={t("마이그레이션 목록")} />
      {!workflows.isPending && !workflows.error && !workflow && (
        <Empty>
          {props.search.workflow
            ? t("마이그레이션을 찾을 수 없습니다")
            : t("등록된 마이그레이션 없음")}
          <Button asChild variant="link" className="ml-2">
            <Link to="/applications">{t("애플리케이션")}</Link>
          </Button>
        </Empty>
      )}
      {workflow && (
        <MonitoringContent
          key={workflow.id}
          {...props}
          workflow={workflow}
          workflows={workflows.data ?? []}
          workspace={session.workspaceId}
          demo={session.demo}
        />
      )}
    </section>
  );
}
function MonitoringContent({
  search,
  tab,
  onNavigate,
  workflow,
  workflows,
  workspace,
  demo,
}: Props & {
  workflow: Workflow;
  workflows: Workflow[];
  workspace: string;
  demo: boolean;
}) {
  const queryClient = useQueryClient();
  const observationKey = workflowKeys.detail(workspace, workflow.id);
  const observationFetching = useIsFetching({ queryKey: observationKey });
  const [now, setNow] = useState(Date.now);
  const previousTab = useRef(tab);
  useEffect(() => {
    if (previousTab.current !== tab)
      document.querySelector<HTMLElement>(`.monitoring [role="tab"][data-state="active"]`)?.focus();
    previousTab.current = tab;
  }, [tab]);
  const [logNow, setLogNow] = useState(Date.now());
  const [hover, setHover] = useState<number | null>(null);
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (!document.hidden) setNow(Date.now());
    }, 30_000);
    return () => window.clearInterval(timer);
  }, []);
  const range = timeRange(now, search.at);
  const narrowed = search.at ? drilldownRange(search.at) : undefined;
  const compFilter = search.at && search.scope !== "all" ? search.comp : undefined;
  const series = useQuery({
    ...seriesOptions(workspace, workflow.id, search.comp, range),
    enabled: tab === "mx",
  });
  const traces = useQuery({
    ...tracesOptions(workspace, workflow.id, narrowed ?? range, compFilter),
    enabled: tab === "tr",
  });
  const logs = useInfiniteQuery({
    ...logsOptions(workspace, workflow.id, timeRange(logNow, search.at), search.trace),
    enabled: tab === "lg",
  });
  const logRows = logs.data?.pages.flatMap((page) => page?.logs ?? []) ?? [];
  const observationScope = useQuery(scopeOptions(workspace, workflow.id));
  const seriesData = series.data?.state === "OK" ? series.data : undefined;
  const collection = useQuery(collectionOptions(workspace, workflow.id));
  const health = collectionHealth(collection.error ? null : collection.data);
  const source = workflow.sourceEnv;
  const target = workflow.targetEnv;
  const appName = workflow.applicationSnapshot?.name ?? workflow.application;
  const visibleTraces = filterTraces(traces.data?.traces ?? [], "all", narrowed, compFilter);
  const errors = visibleTraces.filter((trace) => trace.status === "error").length;
  const logErrors = logRows.filter((log) => log.level === "ERROR").length;
  const change = (patch: Partial<MonitoringSearch>, nextTab = tab, replace = false) =>
    onNavigate({ ...search, ...patch }, nextTab, replace);
  const openAt = (at: string) => {
    setHover(null);
    change({ workflow: workflow.id, at, trace: undefined, q: undefined, scope: "component" }, "tr");
  };
  const openLogs = (trace: Trace) =>
    change({ workflow: workflow.id, q: trace.traceId, trace: trace.traceId }, "lg");
  const busy =
    collection.isFetching ||
    (tab === "obs"
      ? observationFetching > 0
      : tab === "mx"
        ? series.isFetching
        : tab === "tr"
          ? traces.isFetching
          : logs.isFetching);
  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
          <h1 id="monitoring-title" className="text-2xl font-semibold tracking-tight">
            {t("모니터링")}
          </h1>
          {workflows.length > 1 ? (
            <Select
              value={workflow.id}
              onValueChange={(id) =>
                onNavigate({ workflow: id, comp: search.comp, from: search.from }, "mx")
              }
            >
              <SelectTrigger
                aria-label={t("모니터링할 마이그레이션")}
                className="max-w-full sm:max-w-56"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {workflows.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.applicationSnapshot?.name ?? item.application} · {item.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <span className="max-w-full break-all text-sm font-medium">{appName}</span>
          )}
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {source}
            <ArrowRight className="size-3" />
            {target}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className={`max-w-full whitespace-normal ${health.state === "warning" ? "text-warning" : "text-muted-foreground"}`}
          >
            <span
              aria-hidden="true"
              className={`size-1.5 shrink-0 rounded-full ${health.state === "healthy" ? "bg-success" : health.state === "warning" ? "bg-warning" : "bg-muted-foreground"}`}
            />
            {health.state === "unknown"
              ? t("OTEL 수집 미확인")
              : t("OTEL 수집 {0} / {1}", [health.fresh, health.total])}
          </Badge>
          {tab !== "obs" && (
            <Badge variant="outline" className="text-muted-foreground">
              {search.at ? t("선택 시각 기준 30분") : t("최근 30분")}
            </Badge>
          )}
          <Button
            variant="ghost"
            size="icon"
            aria-label={t("관측값 새로고침")}
            disabled={busy}
            onClick={() => {
              setNow(Date.now());
              setLogNow(Date.now());
              if (tab === "obs")
                void queryClient.refetchQueries({ queryKey: observationKey, type: "active" });
              else if (tab === "mx") void series.refetch();
              else if (tab === "tr") void traces.refetch();
              else void logs.refetch();
              void collection.refetch();
            }}
          >
            <RefreshCw className={busy ? "animate-spin motion-reduce:animate-none" : ""} />
          </Button>
        </div>
      </header>
      {demo && <p className="text-xs text-muted-foreground">{t("예시 데이터")}</p>}
      <details className="rounded-lg border p-3 text-xs">
        <summary className="cursor-pointer font-medium focus-visible:outline-2">
          {t("관측 대상")} · {workflow.id}
        </summary>
        <div className="mt-3 space-y-3 break-words">
          <QueryNotice query={observationScope} subject={t("관측 대상")} />
          {observationScope.data && (
            <>
              <p>
                {t("서버에 등록된 앱 구성")} · {observationScope.data.applicationId} ·{" "}
                {observationScope.data.workloadScope}
              </p>
              <p>
                {observationScope.data.sourceEnvironment} →{" "}
                {observationScope.data.targetEnvironment}
              </p>
              <p className="break-all">
                {t("앱 실행 주체")} ·{" "}
                {Object.values(observationScope.data.actors).flat().join(", ") || "—"}
              </p>
              <p>
                {t("마이그레이션 모듈의 작업 지표입니다. 앱 시스템 지표는 배포별로 조회합니다.")}
              </p>
              {observationScope.data.resources.map((resource) => (
                <div key={resource.kind} className="space-y-1 border-t pt-2">
                  <p>
                    {resource.kind} · {resource.migrationId ?? t("미실행")}
                  </p>
                  <p className="break-all">
                    {t("기존")} ·{" "}
                    {Object.entries(resource.source)
                      .map(([key, value]) => `${key}=${value}`)
                      .join(" · ") || t("미확정")}
                  </p>
                  <p className="break-all">
                    {t("이전")} ·{" "}
                    {Object.entries(resource.target)
                      .map(([key, value]) => `${key}=${value}`)
                      .join(" · ") || t("미확정")}
                  </p>
                  {resource.bindingRef && <p className="break-all">{resource.bindingRef}</p>}
                </div>
              ))}
            </>
          )}
        </div>
      </details>
      {collection.error && <QueryNotice query={collection} subject={t("OTEL 수집")} />}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ToggleGroup
          type="single"
          value={search.comp}
          size="sm"
          variant="outline"
          aria-label={t("구성 요소")}
          onValueChange={(value) => {
            if (value) {
              setHover(null);
              change({ comp: value as TelemetryComponent, at: undefined, trace: undefined });
            }
          }}
        >
          {Object.entries(components).map(([key, item]) => (
            <ToggleGroupItem key={key} value={key}>
              {t(item.label)}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        {tab !== "obs" && (
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs">
            <span className="flex items-center gap-2">
              <SeriesMark side="source" />
              {t("기존")}
              <span className="text-muted-foreground">
                {source} ·{" "}
                {source.toLowerCase() === "aws" ? components[search.comp].source : source}
              </span>
            </span>
            <span className="flex items-center gap-2">
              <SeriesMark side="target" />
              {t("이전")}
              <span className="text-muted-foreground">
                {target} ·{" "}
                {target.toLowerCase() === "gcp" ? components[search.comp].target : target}
              </span>
            </span>
          </div>
        )}
      </div>
      {search.side && tab === "mx" && (
        <Button
          variant="outline"
          size="sm"
          className="max-w-full whitespace-normal"
          onClick={() => change({ side: undefined })}
        >
          {t("{0} 계열 강조", [search.side === "source" ? source : target])}
          <X />
        </Button>
      )}
      <Tabs
        value={tab}
        onValueChange={(value) => change({}, value as MonitoringTab)}
        className="gap-4"
      >
        <TabsList aria-label={t("관측 신호")} className="h-auto max-w-full flex-wrap">
          <TabsTrigger value="obs" className="px-3">
            {t("상태")}
          </TabsTrigger>
          <TabsTrigger value="mx" className="px-3">
            {t("지표")}
          </TabsTrigger>
          <TabsTrigger value="tr" className="px-3">
            {t("트레이스")}
            {errors > 0 && (
              <Badge variant="secondary" className="px-1 text-[10px] text-warning">
                {errors}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="lg" className="px-3">
            {t("로그")}
            {logErrors > 0 && (
              <Badge variant="secondary" className="px-1 text-[10px] text-warning">
                {logErrors}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="obs">
          <MigrationObservations
            workspace={workspace}
            id={workflow.id}
            comp={search.comp}
            onTrace={(trace, at) => change({ trace, at, scope: "all" }, "tr")}
          />
        </TabsContent>
        <TabsContent value="mx" className="space-y-4">
          {workflow.status === "PLANNED" && (
            <p className="text-xs text-muted-foreground">{t("미실행 · 이전 환경 데이터 없음")}</p>
          )}
          <QueryNotice query={series} subject={t("시계열 지표")} />
          {seriesData && (
            <div className="grid gap-4 lg:grid-cols-2">
              {metricDefinitions[search.comp].map((definition) => {
                const metric = seriesData.metrics.find((item) => item.key === definition.key) ?? {
                  key: definition.key,
                  unit: definition.unit,
                  source: [],
                  target: [],
                  scope: "environment" as const,
                };
                return (
                  <MetricChart
                    key={definition.key}
                    metric={metric}
                    definition={definition}
                    from={seriesData.from}
                    step={seriesData.step}
                    index={hover}
                    onIndex={setHover}
                    onOpen={openAt}
                    source={source}
                    target={target}
                    emphasis={search.side}
                  />
                );
              })}
            </div>
          )}
          {seriesData && (seriesData.metrics[0]?.source.length ?? 0) > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Label htmlFor="monitoring-sample" className="text-xs">
                {t("시각 선택")}
              </Label>
              <Select
                value={String(hover ?? seriesData.metrics[0]!.source.length - 1)}
                onValueChange={(value) => setHover(Number(value))}
              >
                <SelectTrigger id="monitoring-sample" className="h-8 w-24 font-mono text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {seriesData.metrics[0]!.source.map((_, index) => (
                    <SelectItem key={index} value={String(index)}>
                      {clockTime(
                        new Date(
                          Date.parse(seriesData.from) + index * seriesData.step * 1000,
                        ).toISOString(),
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="link"
                size="sm"
                onClick={() =>
                  openAt(
                    new Date(
                      Date.parse(seriesData!.from) +
                        (hover ?? seriesData!.metrics[0]!.source.length - 1) *
                          seriesData!.step *
                          1000,
                    ).toISOString(),
                  )
                }
              >
                {t("이 시각 트레이스")}
                <ArrowRight />
              </Button>
            </div>
          )}
        </TabsContent>
        <TabsContent value="tr" className="space-y-4">
          {narrowed && (
            <Button
              variant="outline"
              size="sm"
              className="max-w-full whitespace-normal"
              onClick={() => change({ at: undefined, trace: undefined })}
              aria-label={t("시간 조건 지우기")}
            >
              <span className="font-mono text-xs">
                {clockTime(narrowed.from)}–{clockTime(narrowed.to)}
              </span>{" "}
              · {compFilter ? t(components[compFilter].label) : t("전체")}
              <X />
            </Button>
          )}
          {search.trace && !visibleTraces.some((trace) => trace.traceId === search.trace) && (
            <SelectedTrace
              workspace={workspace}
              workflow={workflow.id}
              traceId={search.trace}
              onLogs={() => change({ q: search.trace }, "lg")}
            />
          )}
          <QueryNotice query={traces} subject={t("트레이스")} />
          {traces.data?.state === "OK" && (
            <TraceList
              key={`${workflow.id}-${search.at ?? "all"}`}
              traces={visibleTraces}
              workspace={workspace}
              workflow={workflow.id}
              selected={search.trace}
              onSelect={(trace) => change({ trace }, "tr", true)}
              onLogs={openLogs}
              source={source}
              target={target}
            />
          )}
        </TabsContent>
        <TabsContent value="lg" className="space-y-4">
          {search.trace && (
            <Button
              variant="outline"
              size="sm"
              className="max-w-full whitespace-normal"
              onClick={() => change({ trace: undefined, q: undefined })}
              aria-label={t("트레이스 조건 지우기")}
            >
              <span className="break-all font-mono text-xs">{search.trace}</span>
              <X />
            </Button>
          )}
          <p className="text-xs text-muted-foreground">{t("관측 로그")}</p>
          <QueryNotice query={{ ...logs, data: logs.data?.pages[0] }} subject={t("로그")} />
          {logs.data?.pages[0]?.state === "OK" && (
            <LogList
              logs={logRows}
              q={search.q ?? ""}
              traceId={search.trace}
              onSearch={(q) => change({ q: q || undefined, trace: undefined }, "lg", true)}
              onTrace={(log) =>
                change({ at: log.at, trace: log.traceId ?? undefined, scope: "all" }, "tr")
              }
              source={source}
              target={target}
            />
          )}
          {logs.hasNextPage && (
            <Button
              variant="outline"
              disabled={logs.isFetchingNextPage}
              onClick={() => void logs.fetchNextPage()}
            >
              {t(logs.isFetchingNextPage ? "조회 중…" : "더 보기")}
            </Button>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}

function ReturnLink({ search, workflow }: { search: MonitoringSearch; workflow?: Workflow }) {
  const destination = search.from ? migrationReturn(search.from) : undefined;
  const id = destination?.id ?? workflow?.id ?? search.workflow;
  if (!id) return null;
  return (
    <div className="sticky top-12 z-10 -mx-4 border-b bg-background px-4 py-2 sm:-mx-8 sm:px-8">
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="h-auto min-h-10 max-w-full justify-start px-0 text-left whitespace-normal"
      >
        <Link
          to="/migrations/$id"
          params={{ id }}
          search={destination?.search ?? {}}
          hash={destination?.hash ?? ""}
          hashScrollIntoView={false}
          resetScroll={false}
        >
          <ArrowLeft aria-hidden="true" />
          <span className="min-w-0 break-words">
            {search.from
              ? t("{0} 마이그레이션으로 돌아가기", [search.from.label])
              : t("해당 마이그레이션 보기")}
          </span>
        </Link>
      </Button>
    </div>
  );
}
