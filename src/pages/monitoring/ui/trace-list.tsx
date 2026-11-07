import { Fragment, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronRight, ArrowRight } from "lucide-react";
import { useIsMobile } from "@/shared/lib/hooks";
import { t } from "@/shared/lib/i18n";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/shared/ui/toggle-group";
import { traceOptions, type Trace } from "../api/monitoring";
import { filterTraces, type TraceFilter } from "../model/monitoring";
import { clockTime, SeriesMark } from "./metric-chart";
import { Empty, QueryNotice } from "./query-notice";

const filters = { all: "전체", error: "오류", slow: "300ms 초과", target: "이전 환경만" } as const;
export function TraceList({
  traces,
  workspace,
  workflow,
  selected,
  onSelect,
  onLogs,
  source,
  target,
}: {
  traces: Trace[];
  workspace: string;
  workflow: string;
  selected?: string;
  onSelect: (trace: string | undefined) => void;
  onLogs: (trace: Trace) => void;
  source: string;
  target: string;
}) {
  const mobile = useIsMobile();
  const [filter, setFilter] = useState<TraceFilter>("all");
  const [collapsed, setCollapsed] = useState<string | null>(null);
  const rows = filterTraces(traces, filter);
  const active = selected ?? traces.find((trace) => trace.status === "error")?.traceId;
  return (
    <div className="space-y-4">
      <ToggleGroup
        type="single"
        value={filter}
        onValueChange={(value) => {
          if (value) setFilter(value as TraceFilter);
        }}
        aria-label={t("트레이스 필터")}
        className="flex-wrap"
        size="sm"
        variant="outline"
      >
        {Object.entries(filters).map(([key, label]) => (
          <ToggleGroupItem key={key} value={key}>
            {t(label)}{" "}
            <span className="text-xs text-muted-foreground tabular-nums">
              {filterTraces(traces, key as TraceFilter).length}
            </span>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      {rows.length === 0 ? (
        <Empty>{t("조건에 맞는 트레이스가 없습니다.")}</Empty>
      ) : (
        <Table className="w-full table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">{t("시각")}</TableHead>
              <TableHead>{t("요청")}</TableHead>
              <TableHead className="hidden w-20 md:table-cell">{t("처리")}</TableHead>
              <TableHead className="w-20 sm:w-36">{t("소요")}</TableHead>
              <TableHead className="w-16">{t("상태")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((trace) => {
              const open = active === trace.traceId && collapsed !== trace.traceId;
              return (
                <Fragment key={trace.traceId}>
                  <TableRow data-state={open ? "selected" : undefined}>
                    <TableCell className="font-mono text-xs">{clockTime(trace.at)}</TableCell>
                    <TableCell className="py-1">
                      <Button
                        variant="ghost"
                        className="h-auto min-h-9 w-full justify-start gap-1 px-0 text-left font-mono text-xs whitespace-normal"
                        aria-expanded={open}
                        aria-controls={open ? `trace-${trace.traceId}` : undefined}
                        onClick={() => {
                          setCollapsed(open ? trace.traceId : null);
                          onSelect(trace.traceId);
                        }}
                      >
                        {open ? (
                          <ChevronDown className="size-3" />
                        ) : (
                          <ChevronRight className="size-3" />
                        )}
                        <span className="min-w-0 break-all">
                          {trace.name}
                          <span className="block text-[10px] text-muted-foreground md:hidden">
                            {trace.side === "source"
                              ? source
                              : trace.side === "target"
                                ? target
                                : t("공통")}
                          </span>
                        </span>
                      </Button>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="flex items-center gap-2 text-xs">
                        <SeriesMark side={trace.side} />
                        {trace.side === "source"
                          ? source
                          : trace.side === "target"
                            ? target
                            : t("공통")}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-2 font-mono text-xs tabular-nums">
                        <span className="hidden h-1.5 w-14 overflow-hidden rounded bg-muted sm:block">
                          <span
                            className={`block h-full ${trace.status === "error" ? "bg-destructive" : "bg-muted-foreground"}`}
                            style={{
                              width: `${Math.min(100, (trace.durationMs / Math.max(1, ...traces.map((item) => item.durationMs))) * 100)}%`,
                            }}
                          />
                        </span>
                        {Math.round(trace.durationMs)}ms
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={trace.status === "error" ? "destructive" : "outline"}>
                        {trace.status === "error" ? t("오류") : (trace.statusCode ?? t("정상"))}
                      </Badge>
                    </TableCell>
                  </TableRow>
                  {open && (
                    <TableRow>
                      <TableCell colSpan={mobile ? 4 : 5} className="p-0">
                        <div
                          id={`trace-${trace.traceId}`}
                          className="space-y-3 rounded-lg border bg-muted/20 p-3 sm:p-4"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="min-w-0 break-all font-mono text-xs text-muted-foreground">
                              {trace.traceId}
                            </span>
                            <Button variant="link" size="sm" onClick={() => onLogs(trace)}>
                              {t("이 트레이스의 로그")}
                              <ArrowRight />
                            </Button>
                          </div>
                          <Waterfall workspace={workspace} workflow={workflow} trace={trace} />
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
function Waterfall({
  workspace,
  workflow,
  trace,
}: {
  workspace: string;
  workflow: string;
  trace: Pick<Trace, "traceId" | "durationMs">;
}) {
  const query = useQuery(traceOptions(workspace, workflow, trace.traceId));
  const duration = Math.max(
    1,
    trace.durationMs,
    ...(query.data?.spans.map((span) => span.startMs + span.durationMs) ?? []),
  );
  return (
    <>
      <QueryNotice query={query} subject={t("스팬 상세")} />
      {query.data?.spans.length === 0 && <Empty>{t("수집된 스팬이 없습니다.")}</Empty>}
      {query.data?.spans.map((span) => (
        <div
          key={span.spanId}
          className="grid items-center gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
        >
          <div
            className={`min-w-0 break-words text-xs ${span.status === "error" ? "text-destructive" : "text-foreground"}`}
          >
            {span.name}
            {span.status === "error" && <span className="ml-2">{t("오류")}</span>}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative h-5 min-w-0 flex-1 rounded bg-muted">
              <span
                className={`absolute top-1 h-3 min-w-px rounded-sm ${span.status === "error" ? "bg-destructive" : "bg-muted-foreground/60"}`}
                style={{
                  left: `${(span.startMs / duration) * 100}%`,
                  width: `${(span.durationMs / duration) * 100}%`,
                }}
              />
            </div>
            <span className="w-14 text-right font-mono text-xs tabular-nums">
              {Math.round(span.durationMs)}ms
            </span>
          </div>
        </div>
      ))}
    </>
  );
}

export function SelectedTrace({
  workspace,
  workflow,
  traceId,
  onLogs,
}: {
  workspace: string;
  workflow: string;
  traceId: string;
  onLogs: () => void;
}) {
  return (
    <section aria-label={t("선택한 트레이스")} className="space-y-3 rounded-lg border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="min-w-0 break-all font-mono text-xs">{traceId}</h2>
        <Button variant="link" onClick={onLogs}>
          {t("이 트레이스의 로그")}
          <ArrowRight />
        </Button>
      </div>
      <Waterfall workspace={workspace} workflow={workflow} trace={{ traceId, durationMs: 0 }} />
    </section>
  );
}
