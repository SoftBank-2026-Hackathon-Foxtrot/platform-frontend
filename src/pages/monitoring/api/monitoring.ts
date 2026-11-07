import { apiClient } from "@/shared/api";
import { workflowSchema } from "@/entities/migration";
import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { componentSchema, readTelemetry, type TelemetryComponent } from "@/entities/telemetry";

const timestamp = z.iso.datetime({ offset: true });
const sample = z.number().finite().nonnegative().nullable();
const state = z.enum(["OK", "NOT_CONFIGURED", "UNAVAILABLE"]).default("OK");
const units: Record<string, string> = {
  inflight: "",
  activewebsockets: "",
  probe_failed: "",
  probe_p95: "ms",
  writers: "",
  prepared: "",
  forward_lag: "s",
  reverse_lag: "s",
  backlog: "",
  copied: "",
  dirty_age: "ms",
  writes: "",
  completed: "",
  total: "",
  forward_backlog: "",
  reverse_backlog: "",
};
export const seriesSchema = z
  .object({
    state,
    comp: componentSchema,
    step: z.number().int().positive(),
    from: timestamp,
    metrics: z.array(
      z
        .object({
          key: z.string(),
          unit: z.string(),
          scope: z.enum(["environment", "workflow"]).default("environment"),
          shared: z.array(sample).optional(),
          source: z.array(sample),
          target: z.array(sample),
        })
        .refine(
          (metric) =>
            metric.source.length === metric.target.length &&
            (!metric.shared || metric.shared.length === metric.source.length),
          "Unaligned series",
        )
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
  side: z.enum(["source", "target", "shared"]),
  durationMs: z.number().finite().nonnegative(),
  status: z.enum(["ok", "error"]),
  statusCode: z.string().nullable(),
  components: z.array(componentSchema),
});
export const tracesSchema = z.object({ state, traces: z.array(traceSchema) });
export type Trace = z.infer<typeof traceSchema>;
export const traceDetailSchema = z.object({
  state,
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
  state,
  nextCursor: z.string().nullable().default(null),
  logs: z.array(
    z.object({
      id: z.string(),
      at: timestamp,
      level: z.enum(["INFO", "WARN", "ERROR"]),
      side: z.enum(["source", "target", "shared"]),
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
  return infiniteQueryOptions({
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page: z.infer<typeof logsSchema> | null) => page?.nextCursor ?? undefined,
    queryKey: ["monitoring", workspace, workflow, "logs", range, traceId],
    queryFn: ({ signal, pageParam }) =>
      readTelemetry(`${pathFor(workflow)}/logs`, logsSchema, signal, {
        ...range,
        ...(pageParam ? { cursor: pageParam } : {}),
        ...(traceId ? { traceId } : {}),
      }),
    staleTime: 30_000,
  });
}

export const scopeSchema = z.object({
  workflowId: z.string(),
  applicationId: z.string(),
  workloadScope: z.string(),
  sourceEnvironment: z.string(),
  targetEnvironment: z.string(),
  actors: z.record(z.string(), z.array(z.string())),
  resources: z.array(
    z.object({
      kind: z.string(),
      migrationId: z.string().nullable(),
      bindingRef: z.string().nullable(),
      source: z.record(z.string(), z.union([z.string(), z.number()])),
      target: z.record(z.string(), z.union([z.string(), z.number()])),
    }),
  ),
});
export function scopeOptions(workspace: string, workflow: string) {
  return queryOptions({
    queryKey: ["monitoring", workspace, workflow, "scope"],
    queryFn: async ({ signal }) => {
      const data = await readTelemetry(
        `${pathFor(workflow)}/monitoring-scope`,
        scopeSchema,
        signal,
      );
      if (data && data.workflowId !== workflow) throw new Error("Unexpected workflow identity");
      return data;
    },
    staleTime: 15000,
  });
}

export function liveWorkflowsOptions(workspace: string) {
  return queryOptions({
    queryKey: ["monitoring-live-workflows", workspace],
    queryFn: async ({ signal }) =>
      z
        .array(workflowSchema)
        .parse((await apiClient.get("/v1/telemetry/workflows", { signal })).data),
    refetchInterval: 15000,
  });
}
