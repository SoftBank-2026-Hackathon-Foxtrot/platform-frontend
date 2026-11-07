import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { componentSchema, readTelemetry, type TelemetryComponent } from "@/entities/telemetry";

const timestamp = z.iso.datetime({ offset: true });
const sample = z.number().finite().nonnegative().nullable();
const units: Record<string, string> = {
  throughput: "req/s",
  error_rate: "%",
  latency_p95: "ms",
  cpu: "%",
  queries: "qps",
  connections: "",
  commands: "ops/s",
  hit_rate: "%",
  memory: "%",
  requests: "req/s",
  transfer: "MB/s",
};
export const seriesSchema = z
  .object({
    comp: componentSchema,
    step: z.number().int().positive(),
    from: timestamp,
    metrics: z.array(
      z
        .object({
          key: z.string(),
          unit: z.string(),
          source: z.array(sample),
          target: z.array(sample),
        })
        .refine((metric) => metric.source.length === metric.target.length, "Unaligned series")
        .refine(
          (metric) => !(metric.key in units) || metric.unit === units[metric.key],
          "Unexpected metric unit",
        ),
    ),
  })
  .refine(
    (data) =>
      data.metrics.every((metric) => metric.source.length === data.metrics[0]?.source.length),
    "Unaligned metric timelines",
  );
export type Series = z.infer<typeof seriesSchema>;
export const traceSchema = z.object({
  traceId: z.string().min(1),
  at: timestamp,
  name: z.string(),
  service: z.string(),
  side: z.enum(["source", "target"]),
  durationMs: z.number().finite().nonnegative(),
  status: z.enum(["ok", "error"]),
  statusCode: z.string().nullable(),
  components: z.array(componentSchema),
});
export const tracesSchema = z.object({ traces: z.array(traceSchema) });
export type Trace = z.infer<typeof traceSchema>;
export const traceDetailSchema = z.object({
  traceId: z.string(),
  spans: z.array(
    z.object({
      spanId: z.string(),
      parentSpanId: z.string().nullable(),
      name: z.string(),
      startMs: z.number().finite().nonnegative(),
      durationMs: z.number().finite().nonnegative(),
      status: z.enum(["ok", "error"]),
    }),
  ),
});
export const logsSchema = z.object({
  logs: z.array(
    z.object({
      id: z.string(),
      at: timestamp,
      level: z.enum(["INFO", "WARN", "ERROR"]),
      side: z.enum(["source", "target"]),
      service: z.string(),
      message: z.string(),
      traceId: z.string().nullable(),
      spanId: z.string().nullable(),
    }),
  ),
});
export type Log = z.infer<typeof logsSchema>["logs"][number];
export type TimeRange = { from: string; to: string };
const pathFor = (workflow: string) => `/v1/workflows/${encodeURIComponent(workflow)}`;

export function seriesOptions(
  workspace: string,
  workflow: string,
  comp: TelemetryComponent,
  range: TimeRange,
) {
  return queryOptions({
    queryKey: ["monitoring", workspace, workflow, "series", comp, range],
    queryFn: async ({ signal }) => {
      const data = await readTelemetry(
        `${pathFor(workflow)}/telemetry/series`,
        seriesSchema,
        signal,
        { comp, ...range, step: "60s" },
      );
      if (data && data.comp !== comp) throw new Error("Unexpected telemetry component");
      return data;
    },
    staleTime: 30_000,
  });
}
export function tracesOptions(
  workspace: string,
  workflow: string,
  range: TimeRange,
  comp?: TelemetryComponent,
) {
  return queryOptions({
    queryKey: ["monitoring", workspace, workflow, "traces", range, comp],
    queryFn: ({ signal }) =>
      readTelemetry(`${pathFor(workflow)}/traces`, tracesSchema, signal, {
        ...range,
        ...(comp ? { comp } : {}),
      }),
    staleTime: 30_000,
  });
}
export function traceOptions(workspace: string, workflow: string, traceId: string) {
  return queryOptions({
    queryKey: ["monitoring", workspace, workflow, "trace", traceId],
    queryFn: async ({ signal }) => {
      const data = await readTelemetry(
        `${pathFor(workflow)}/traces/${encodeURIComponent(traceId)}`,
        traceDetailSchema,
        signal,
      );
      if (data && data.traceId !== traceId) throw new Error("Unexpected trace identity");
      return data;
    },
    staleTime: 60_000,
  });
}
export function logsOptions(
  workspace: string,
  workflow: string,
  range: TimeRange,
  traceId?: string,
) {
  return queryOptions({
    queryKey: ["monitoring", workspace, workflow, "logs", range, traceId],
    queryFn: ({ signal }) =>
      readTelemetry(`${pathFor(workflow)}/logs`, logsSchema, signal, {
        ...range,
        ...(traceId ? { traceId } : {}),
      }),
    staleTime: 30_000,
  });
}
