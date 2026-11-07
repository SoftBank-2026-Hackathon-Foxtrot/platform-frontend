import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";

import { apiBaseUrl, apiClient } from "@/shared/api";

const text = z.string().nullable().optional();
const number = z.number().nullable().optional();
const decision = z.object({ result: z.string(), reasons: z.array(z.string()).default([]) });
const verification = z.object({
  method: text,
  scope: text,
  observedAt: text,
  checkedCount: number,
  mismatchCount: number,
  committedThroughLsn: text,
  durableOriginLsn: text,
  valid: z.boolean().optional(),
  matched: number,
  missing: number,
  different: number,
  extra: number,
});
const observation = z.object({
  freshness: z.string(),
  collectedAt: text,
  lastSuccessAt: text,
  lastProgressAt: text,
  collectionError: text,
});
const operation = z.object({
  operationId: text,
  action: text,
  status: text,
  requestedAt: text,
  startedAt: text,
  finishedAt: text,
});
export const workflowSchema = z.object({
  id: z.string(),
  application: z.string(),
  sourceEnv: z.string(),
  targetEnv: z.string(),
  status: z.string(),
  currentStage: z.number(),
  createdAt: z.string(),
  finishedAt: text,
  halt: z.object({ code: z.string(), message: z.string() }).nullable().optional(),
});
const flow = z.object({ state: text, backlog: number, lagSeconds: number }).optional();
const resourceSchema = z.object({
  kind: z.string(),
  migrationId: text,
  lifecycle: text,
  health: text,
  route: text,
  phase: text,
  targetWritesPossible: z.boolean(),
  observedAt: text,
  businessWriteAccess: text,
  transitionId: text,
  activeOperationId: text,
  observation,
  progress: z.object({ completed: number, total: number, unit: text }).nullable(),
  checks: z.array(
    z.object({
      code: z.string(),
      stage: z.string(),
      decision,
      currentResult: z.string(),
      observedAt: text,
      validUntil: text,
    }),
  ),
  rollback: z.object({ method: text, reasons: z.array(z.string()).default([]) }).nullable(),
  readiness: z.record(z.string(), decision).nullable(),
  replication: z
    .object({
      forward: flow,
      reverse: flow,
      initialCopy: z
        .object({ completed: number, total: number, bytes: number, totalBytes: number })
        .optional(),
    })
    .nullable(),
  details: z.object({
    database: z
      .object({
        observedAt: text,
        proxyPaused: z.boolean().nullable().optional(),
        sourceWriterSessions: number,
        targetWriterSessions: number,
        sourcePreparedTransactions: number,
        targetReachable: z.boolean().nullable().optional(),
        accessEvidence: text,
        verification: verification.nullable().optional(),
      })
      .optional(),
    redis: z
      .object({
        consumerRoute: text,
        producerRoute: text,
        drainStatus: text,
        sync: z
          .object({
            direction: text,
            freshness: text,
            backlog: number,
            copied: number,
            oldestDirtyAgeMs: number,
            lag_ms: number,
            observedAt: text,
            error: text,
            epoch: text,
            verification: verification.nullable().optional(),
          })
          .optional(),
        proxy: z
          .object({
            paused: z.boolean().nullable().optional(),
            freshness: text,
            inflight_writes: number,
            open_tx: number,
            last_pause_ms: number,
            pubsub_sessions: number,
            observedAt: text,
          })
          .optional(),
      })
      .optional(),
    object: z
      .object({
        expectedApps: number,
        lastSuccessfulSyncAt: text,
        syncFreshness: text,
        initialCopyObservedAt: text,
        forwardObservedAt: text,
        reverseObservedAt: text,
        lastVerificationAt: text,
        lastProgressAt: text,
        apps: z
          .object({
            live: number,
            acked: number,
            waiting: number,
            generation: number,
            recovering: z.boolean(),
            observedAt: text,
          })
          .nullable()
          .optional(),
        readiness: z
          .record(
            z.string(),
            z.object({
              result: z.string(),
              checks: z
                .array(
                  z.object({
                    name: z.string(),
                    ok: z.boolean(),
                    verification: verification.optional(),
                  }),
                )
                .default([]),
            }),
          )
          .optional(),
      })
      .optional(),
  }),
});
export type Resource = z.infer<typeof resourceSchema>;
const preparation = z.object({
  observation,
  data: z
    .object({
      stage: text,
      status: text,
      observedAt: text,
      jobId: text,
      vmId: text,
      imageId: text,
      configVersion: text,
      containerId: text,
      check: text,
      startedAt: text,
      finishedAt: text,
      changes: z
        .object({ create: number, update: number, delete: number, replace: number })
        .optional(),
      operations: z.array(operation).optional(),
    })
    .nullable(),
});
export const detailSchema = z.object({
  workflow: workflowSchema,
  stages: z.array(
    z.object({
      index: z.number(),
      kind: z.string(),
      status: z.string(),
      step: z.string(),
      detail: z.string(),
    }),
  ),
  resources: z.array(resourceSchema),
  preparation: z.record(z.string(), preparation),
  traffic: z.array(
    z.object({
      operationId: z.string(),
      requested: z.record(z.string(), z.number()),
      applied: z.record(z.string(), z.number()).nullable(),
      effectivePercent: z.record(z.string(), z.number()).nullable(),
      configVerified: z.boolean(),
      adapterOperationId: text,
      operationStatus: text,
      at: z.string(),
    }),
  ),
  publicProbe: z
    .object({
      freshness: z.string(),
      windowStart: z.string(),
      windowEnd: z.string(),
      total: z.number(),
      failed: z.number(),
      timeouts: z.number(),
      unknownLocation: z.number(),
      missingSamples: z.number(),
      maxSampleGapSeconds: z.number(),
      knownLocationSamples: z.number(),
      observedPercent: z.record(z.string(), z.number()).nullable(),
      enoughSamples: z.boolean(),
      p95Ms: number,
      lastSampleAt: text,
      failureIntervals: z.array(
        z.object({ firstFailureAt: z.string(), lastFailureAt: z.string(), recoveredAt: text }),
      ),
    })
    .nullable(),
  businessProbes: z.array(
    z.object({
      env: z.string(),
      freshness: z.string(),
      collectionState: z.string(),
      latest: z
        .object({
          passed: z.boolean(),
          reason: z.string(),
          finishedAt: z.string(),
          steps: z.record(z.string(), z.number()),
        })
        .nullable(),
    }),
  ),
  hold: z.object({
    desired: z.string(),
    isLive: z.boolean(),
    observedAt: text,
    requestedAt: text,
    releasedAt: text,
    heldSince: text,
    generation: z.number(),
    actors: z.array(
      z.object({
        actorId: z.string(),
        state: z.string(),
        inFlight: z.number(),
        activeWebSockets: number,
        reported: z.number(),
        expected: z.number(),
        observedAt: text,
      }),
    ),
  }),
  commands: z.array(
    z.object({
      resource: z.string(),
      action: z.string(),
      phase: z.string(),
      operationId: text,
      status: text,
      errorCode: text,
      attempt: z.number(),
      observation: operation,
    }),
  ),
});
export type Detail = z.infer<typeof detailSchema>;
const eventPage = z.object({
  events: z.array(
    z.object({ cursor: z.string(), at: z.string(), type: z.string(), message: z.string() }),
  ),
  nextCursor: text,
});
const historyPage = z.object({
  observations: z.array(
    z.object({
      resource: z.string(),
      collectedAt: z.string(),
      collectionError: text,
      data: z.object({
        phase: text,
        stage: text,
        desired: text,
        lifecycle: text,
        progress: z.object({ completed: number, total: number, unit: text }).optional(),
      }),
    }),
  ),
  nextCursor: text,
});
const baseKey = [
  "migration-console",
  apiBaseUrl,
  "registered-workspace",
  "registered-application",
] as const;
export function workflowsQuery() {
  return queryOptions<z.infer<typeof workflowSchema>[]>({
    queryKey: [...baseKey, "workflows"],
    refetchInterval: (query) => (query.state.error ? false : 5000),
    queryFn: async ({ signal }) =>
      z
        .array(workflowSchema)
        .parse((await apiClient.get<unknown>("/v1/workflows", { signal })).data),
  });
}
export function detailQuery(id: string) {
  return queryOptions<Detail>({
    queryKey: [...baseKey, id, "detail"],
    refetchInterval: (query) => (query.state.error ? false : 2000),
    queryFn: async ({ signal }) =>
      detailSchema.parse(
        (await apiClient.get<unknown>(`/v1/workflows/${encodeURIComponent(id)}`, { signal })).data,
      ),
  });
}
export function eventsQuery(id: string, after: string | null) {
  return queryOptions<z.infer<typeof eventPage>>({
    queryKey: [...baseKey, id, "events", after],
    refetchInterval: (query) => (query.state.error ? false : 5000),
    queryFn: async ({ signal }) =>
      eventPage.parse(
        (
          await apiClient.get<unknown>(`/v1/workflows/${encodeURIComponent(id)}/events`, {
            signal,
            params: { after, limit: 30 },
          })
        ).data,
      ),
  });
}
export function historyQuery(id: string, cursor: string | null, since: string) {
  return queryOptions<z.infer<typeof historyPage>>({
    queryKey: [...baseKey, id, "history", since, cursor],
    refetchInterval: (query) => (query.state.error ? false : 5000),
    queryFn: async ({ signal }) =>
      historyPage.parse(
        (
          await apiClient.get<unknown>(`/v1/workflows/${encodeURIComponent(id)}/observations`, {
            signal,
            params: { since, cursor, limit: 30 },
          })
        ).data,
      ),
  });
}
