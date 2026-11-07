import { z } from "zod";
import { monitoringOriginSchema } from "@/entities/migration";
import { componentSchema, type TelemetryComponent } from "@/entities/telemetry";
import type { Trace, TimeRange } from "../api/monitoring";

export const monitoringSearchSchema = z.object({
  from: monitoringOriginSchema.optional().catch(undefined),
  side: z.enum(["source", "target"]).optional().catch(undefined),
  workflow: z.string().min(1).optional().catch(undefined),
  comp: componentSchema.catch("app"),
  at: z.iso.datetime({ offset: true }).optional().catch(undefined),
  q: z.string().max(500).optional().catch(undefined),
  trace: z.string().min(1).optional().catch(undefined),
  scope: z.enum(["all", "component"]).optional().catch(undefined),
});
export type MonitoringSearch = z.infer<typeof monitoringSearchSchema>;
export type MonitoringTab = "mx" | "tr" | "lg" | "obs";
export type TraceFilter = "all" | "error" | "slow" | "target";
export const components: Record<
  TelemetryComponent,
  { label: string; source: string; target: string }
> = {
  app: { label: "앱", source: "앱", target: "앱" },
  db: { label: "DB", source: "RDS", target: "Cloud SQL" },
  redis: { label: "Redis", source: "ElastiCache", target: "Memorystore" },
  obj: { label: "Object", source: "S3", target: "GCS" },
};
export const metricDefinitions: Record<
  TelemetryComponent,
  { key: string; title: string; unit: string; compare?: boolean }[]
> = {
  app: [
    { key: "inflight", title: "처리 중 요청", unit: "" },
    { key: "activewebsockets", title: "연결된 WebSocket", unit: "" },
    { key: "probe_failed", title: "프로브 실패", unit: "" },
    { key: "probe_p95", title: "프로브 p95", unit: "ms" },
  ],
  db: [
    { key: "writers", title: "쓰기 세션", unit: "" },
    { key: "prepared", title: "준비된 트랜잭션", unit: "" },
    { key: "forward_lag", title: "정방향 복제 지연", unit: "s" },
    { key: "reverse_lag", title: "역방향 복제 지연", unit: "s" },
  ],
  redis: [
    { key: "backlog", title: "동기화 대기", unit: "" },
    { key: "copied", title: "복사 완료", unit: "" },
    { key: "dirty_age", title: "최장 대기", unit: "ms" },
    { key: "writes", title: "처리 중 쓰기", unit: "" },
  ],
  obj: [
    { key: "completed", title: "복사 완료", unit: "" },
    { key: "total", title: "전체 객체", unit: "" },
    { key: "forward_backlog", title: "정방향 대기", unit: "" },
    { key: "reverse_backlog", title: "역방향 대기", unit: "" },
  ],
};
export function timeRange(now: number, at?: string): TimeRange {
  const end = at ? Date.parse(at) + 2 * 60_000 : Math.floor(now / 60_000) * 60_000;
  return { from: new Date(end - 30 * 60_000).toISOString(), to: new Date(end).toISOString() };
}
export function drilldownRange(at: string): TimeRange {
  return {
    from: new Date(Date.parse(at) - 120_000).toISOString(),
    to: new Date(Date.parse(at) + 120_000).toISOString(),
  };
}
export function filterTraces(
  traces: Trace[],
  filter: TraceFilter,
  range?: TimeRange,
  comp?: TelemetryComponent,
) {
  return traces.filter(
    (trace) =>
      (!range ||
        (Date.parse(trace.at) >= Date.parse(range.from) &&
          Date.parse(trace.at) <= Date.parse(range.to))) &&
      (!comp || trace.components.includes(comp)) &&
      (filter === "all" ||
        (filter === "error" && trace.status === "error") ||
        (filter === "slow" && trace.durationMs > 300) ||
        (filter === "target" && trace.side === "target")),
  );
}
export function niceMaximum(values: (number | null)[]) {
  const max = Math.max(0, ...values.filter((value): value is number => value !== null));
  if (max === 0) return 1;
  const power = 10 ** Math.floor(Math.log10(max));
  return ([1, 2, 2.5, 5, 10].find((step) => step * power >= max) ?? 10) * power;
}
/** Null ends a segment; a measured zero remains on the baseline. */
export function seriesPath(values: (number | null)[], maximum: number) {
  let previous = false;
  return values
    .map((value, index) => {
      if (value === null) {
        previous = false;
        return "";
      }
      const command = previous ? "L" : "M";
      previous = true;
      return `${command}${((index / Math.max(1, values.length - 1)) * 460).toFixed(2)},${(116 - (value / maximum) * 110).toFixed(2)}`;
    })
    .join(" ");
}
export function difference(source: number | null, target: number | null) {
  if (source === null || target === null || source === 0) return null;
  const ratio = target / source;
  return { ratio, warning: ratio >= 1.5 };
}

/** Tempo uses nanosecond strings; preserve actual time without guessing missing timestamps. */
export function traceTimestamp(nanoseconds: string | null | undefined) {
  if (!nanoseconds || !/^\d+$/.test(nanoseconds)) return undefined;
  const milliseconds = Number(BigInt(nanoseconds) / 1_000_000n);
  const date = new Date(milliseconds);
  return Number.isFinite(date.getTime()) ? date.toISOString() : undefined;
}
