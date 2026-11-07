import { z } from "zod";
import { componentSchema, type TelemetryComponent } from "@/entities/telemetry";
import type { Trace, TimeRange } from "../api/monitoring";

export const monitoringSearchSchema = z.object({
  workflow: z.string().min(1).optional().catch(undefined),
  comp: componentSchema.catch("app"),
  at: z.iso.datetime({ offset: true }).optional().catch(undefined),
  q: z.string().max(500).optional().catch(undefined),
  trace: z.string().min(1).optional().catch(undefined),
  scope: z.enum(["all", "component"]).optional().catch(undefined),
});
export type MonitoringSearch = z.infer<typeof monitoringSearchSchema>;
export type MonitoringTab = "mx" | "tr" | "lg";
export type TraceFilter = "all" | "error" | "slow" | "target";
export const components: Record<
  TelemetryComponent,
  { label: string; source: string; target: string }
> = {
  app: { label: "앱", source: "EKS", target: "GKE" },
  db: { label: "DB", source: "RDS", target: "Cloud SQL" },
  redis: { label: "Redis", source: "ElastiCache", target: "Memorystore" },
  obj: { label: "Object", source: "S3", target: "GCS" },
};
export const metricDefinitions: Record<
  TelemetryComponent,
  { key: string; title: string; unit: string; compare?: boolean }[]
> = {
  app: [
    { key: "throughput", title: "처리량", unit: "req/s" },
    { key: "error_rate", title: "오류율", unit: "%", compare: true },
    { key: "latency_p95", title: "p95 지연", unit: "ms", compare: true },
    { key: "cpu", title: "CPU", unit: "%" },
  ],
  db: [
    { key: "queries", title: "쿼리", unit: "qps" },
    { key: "latency_p95", title: "쿼리 p95", unit: "ms", compare: true },
    { key: "connections", title: "커넥션", unit: "" },
    { key: "cpu", title: "CPU", unit: "%" },
  ],
  redis: [
    { key: "commands", title: "명령", unit: "ops/s" },
    { key: "hit_rate", title: "히트율", unit: "%" },
    { key: "latency_p95", title: "p95 지연", unit: "ms", compare: true },
    { key: "memory", title: "메모리", unit: "%" },
  ],
  obj: [
    { key: "requests", title: "요청", unit: "req/s" },
    { key: "error_rate", title: "오류율", unit: "%", compare: true },
    { key: "latency_p95", title: "p95 지연", unit: "ms", compare: true },
    { key: "transfer", title: "전송", unit: "MB/s" },
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
