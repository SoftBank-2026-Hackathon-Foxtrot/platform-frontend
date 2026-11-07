import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, RefreshCw, X } from "lucide-react";
import { workflowsOptions, type Workflow } from "@/entities/migration";
import { useSession } from "@/entities/session";
import { collectionHealth, collectionOptions, type TelemetryComponent } from "@/entities/telemetry";
import { t, useLocale } from "@/shared/lib/i18n";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/shared/ui/toggle-group";
import { logsOptions, seriesOptions, tracesOptions, type Trace } from "../api/monitoring";
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
import { TraceList } from "./trace-list";
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
            : t("모니터링할 마이그레이션이 없습니다. 애플리케이션에서 마이그레이션을 등록하세요.")}
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
  const [now, setNow] = useState(Date.now);
  const previousTab = useRef(tab);
  useEffect(() => {
    if (previousTab.current !== tab)
      document.querySelector<HTMLElement>(`.monitoring [role="tab"][data-state="active"]`)?.focus();
    previousTab.current = tab;
  }, [tab]);
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
  const series = useQuery(seriesOptions(workspace, workflow.id, search.comp, range));
  const traces = useQuery(tracesOptions(workspace, workflow.id, narrowed ?? range, compFilter));
  const logs = useQuery(
    logsOptions(workspace, workflow.id, range, tab === "lg" ? search.trace : undefined),
  );
  const seriesData = series.data;
  const collection = useQuery(collectionOptions(workspace));
  const health = collectionHealth(collection.error ? null : collection.data);
  const source = workflow.sourceEnv;
  const target = workflow.targetEnv;
  const appName = workflow.applicationSnapshot?.name ?? workflow.application;
  const visibleTraces = filterTraces(traces.data?.traces ?? [], "all", narrowed, compFilter);
  const errors = visibleTraces.filter((trace) => trace.status === "error").length;
  const logErrors = logs.data?.logs.filter((log) => log.level === "ERROR").length ?? 0;
  const change = (patch: Partial<MonitoringSearch>, nextTab = tab, replace = false) =>
    onNavigate({ ...search, ...patch }, nextTab, replace);
  const openAt = (at: string) => {
    setHover(null);
    change({ workflow: workflow.id, at, trace: undefined, q: undefined, scope: "component" }, "tr");
  };
  const openLogs = (trace: Trace) =>
    change({ workflow: workflow.id, q: trace.traceId, trace: trace.traceId }, "lg");
  const busy = series.isFetching || traces.isFetching || logs.isFetching || collection.isFetching;
  return (
    <>
      {search.workflow && (
        <Button
          asChild
          variant="link"
          className="h-auto max-w-full justify-start px-0 text-xs text-muted-foreground whitespace-normal"
        >
          <Link to="/migrations/$id" params={{ id: workflow.id }}>
            <ArrowLeft />
            <span className="break-all">
              {t("마이그레이션 {0} · {1}에서 열림", [
                workflow.id,
                t(components[search.comp].label),
              ])}
            </span>
          </Link>
        </Button>
      )}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
          <h1 id="monitoring-title" className="text-2xl font-semibold tracking-tight">
            {t("모니터링")}
          </h1>
          {workflows.length > 1 ? (
            <Select
              value={workflow.id}
              onValueChange={(id) => onNavigate({ workflow: id, comp: search.comp }, "mx")}
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
            {health.missing.length > 0 &&
              ` · ${health.missing.map((module) => t(module.name)).join(", ")} ${t("수집 없음")}`}
          </Badge>
          <Badge variant="outline" className="text-muted-foreground">
            {search.at ? t("선택 시각 기준 30분") : t("최근 30분")}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            aria-label={t("관측값 새로고침")}
            disabled={busy}
            onClick={() => {
              setNow(Date.now());
              void series.refetch();
              void traces.refetch();
              void logs.refetch();
              void collection.refetch();
            }}
          >
            <RefreshCw className={busy ? "animate-spin motion-reduce:animate-none" : ""} />
          </Button>
        </div>
      </header>
      {demo && (
        <p className="text-xs text-muted-foreground">{t("데모 · 예시 관측 데이터입니다.")}</p>
      )}
      {collection.error && <QueryNotice query={collection} subject={t("OTEL 수집")} />}
      <Tabs
        value={tab}
        onValueChange={(value) => change({}, value as MonitoringTab)}
        className="gap-4"
      >
        <TabsList aria-label={t("관측 신호")}>
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
        <TabsContent value="mx" className="space-y-4">
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
          </div>
          {workflow.status === "PLANNED" && (
            <p className="text-xs text-muted-foreground">
              {t("마이그레이션 미실행 · 이전 환경의 관측값은 아직 없습니다.")}
            </p>
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
          <QueryNotice query={traces} subject={t("트레이스")} />
          {traces.data && (
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
          <QueryNotice query={logs} subject={t("로그")} />
          {logs.data && (
            <LogList
              logs={logs.data.logs}
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
        </TabsContent>
      </Tabs>
    </>
  );
}
