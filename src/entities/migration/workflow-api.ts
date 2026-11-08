import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { apiClient, commandHeaders } from "@/shared/api";

export const resourceKindSchema = z.enum(["DATABASE", "REDIS", "OBJECT_STORAGE"]);
export type ResourceKind = z.infer<typeof resourceKindSchema>;
export const workflowCommandSchema = z.enum([
  "APPROVE",
  "HALT",
  "RESUME",
  "RECONCILE",
  "ROLLBACK_RESOURCE",
  "ROLLBACK_ALL",
  "FINALIZE",
  "ABORT",
]);
export type WorkflowCommand = z.infer<typeof workflowCommandSchema>;
export const workflowSchema = z.object({
  id: z.string(),
  application: z.string(),
  // Personal-workspace backends own each workflow; the shared release backend does not say.
  ownerId: z.string().optional(),
  applicationSnapshot: z
    .object({
      name: z.string(),
      version: z.number(),
      image: z.object({ imageRef: z.string() }),
    })
    .nullable()
    .optional(),
  sourceEnv: z.string(),
  targetEnv: z.string(),
  version: z.number(),
  currentStage: z.number(),
  createdAt: z.string(),
  createdBy: z.string(),
  finishedAt: z.string().nullable(),
  approvedThrough: z.number().optional(),
  status: z.enum([
    "PLANNED",
    "RUNNING",
    "WAITING_APPROVAL",
    "CUTOVER_COMPLETE",
    "HALTED",
    "ROLLING_BACK",
    "ABORTING",
    "COMPLETED",
    "ABORTED",
    "ROLLED_BACK",
  ]),
  halt: z
    .object({ code: z.string(), message: z.string(), blockers: z.array(z.string()).default([]) })
    .nullable(),
  reconcileRequested: z.boolean(),
  rolledBack: z.array(resourceKindSchema),
  rollback: z.object({ resource: resourceKindSchema, mode: z.string().optional() }).nullish(),
});
export type Workflow = z.infer<typeof workflowSchema>;
export const workflowDetailSchema = z.object({
  workflow: workflowSchema,
  allowedCommands: z.array(workflowCommandSchema),
  stages: z.array(
    z.object({
      index: z.number(),
      kind: z.string(),
      status: z.string(),
      step: z.string(),
      detail: z.string(),
      startedAt: z.string().nullish(),
      finishedAt: z.string().nullish(),
    }),
  ),
  resources: z.array(
    z.object({
      kind: resourceKindSchema,
      migrationId: z.string().nullable(),
      lifecycle: z.string().nullable(),
      health: z.string().nullable(),
      route: z.string().nullable(),
      targetWritesPossible: z.boolean(),
      readiness: z.record(z.string(), z.unknown()).nullable(),
    }),
  ),
  traffic: z.array(
    z.object({
      operationId: z.string(),
      requested: z.record(z.string(), z.number()),
      verified: z.boolean(),
      at: z.string(),
    }),
  ),
  hold: z.object({
    // The release backend reports UNKNOWN when it has no live directive.
    desired: z.enum(["RUN", "HOLD", "UNKNOWN"]),
    generation: z.number(),
    heldSince: z.string().nullable(),
    actors: z.array(
      z.object({
        actorId: z.string(),
        state: z.string(),
        inFlight: z.number(),
        reported: z.number(),
        expected: z.number(),
      }),
    ),
  }),
});
export type WorkflowDetail = z.infer<typeof workflowDetailSchema>;
const eventsSchema = z.object({
  events: z.array(
    z.object({
      cursor: z.string(),
      at: z.string(),
      type: z.string(),
      actor: z.string(),
      message: z.string(),
      resource: resourceKindSchema.nullable(),
    }),
  ),
  nextCursor: z.string().nullable(),
});
export const workflowStatus: Record<Workflow["status"], string> = {
  PLANNED: "시작 승인 대기",
  RUNNING: "진행 중",
  WAITING_APPROVAL: "승인 대기",
  CUTOVER_COMPLETE: "전환 완료 · 정리 대기",
  HALTED: "중단됨",
  ROLLING_BACK: "리소스 복귀 중",
  ABORTING: "취소 중",
  COMPLETED: "완료",
  ABORTED: "취소 완료",
  ROLLED_BACK: "원본 복귀 완료",
};
export const workflowKeys = {
  all: (workspace: string) => ["workflows", workspace] as const,
  detail: (workspace: string, id: string) => ["workflows", workspace, id] as const,
};
export const workflowOptions = (workspace: string, id: string) =>
  queryOptions({
    queryKey: ["workflows", workspace, id],
    queryFn: async ({ signal }) =>
      workflowDetailSchema.parse((await apiClient.get(`/v1/workflows/${id}`, { signal })).data),
    refetchInterval: 1500,
  });
export const workflowsOptions = (workspace: string) =>
  queryOptions({
    queryKey: ["workflows", workspace],
    queryFn: async ({ signal }) =>
      z.array(workflowSchema).parse((await apiClient.get("/v1/workflows", { signal })).data),
    refetchInterval: 4000,
  });
export const workflowEventsOptions = (workspace: string, id: string, after: string | null = null) =>
  queryOptions({
    queryKey: ["workflow-events", workspace, id, after],
    queryFn: async ({ signal }) =>
      eventsSchema.parse(
        (
          await apiClient.get(`/v1/workflows/${id}/events`, {
            signal,
            params: { after: after ?? undefined, limit: 100 },
          })
        ).data,
      ),
    refetchInterval: 4000,
  });
/**
 * A registered application is named by `applicationId`. The seed application of the shared
 * release backend has none, and that backend refuses unknown fields, so it is left out.
 */
export async function createWorkflow(
  input: { applicationId?: string; sourceEnv: string; targetEnv: string },
  key: string,
) {
  const { applicationId, ...direction } = input;
  const body = applicationId ? { applicationId, ...direction } : direction;
  return workflowDetailSchema.parse(
    (await apiClient.post("/v1/workflows", body, { headers: commandHeaders(key) })).data,
  );
}
export async function commandWorkflow(
  workflow: Workflow,
  command: WorkflowCommand,
  resourceId: ResourceKind | undefined,
  key: string,
  rollback: { mode: "normal" | "failure"; confirmTargetFailure: boolean } = {
    mode: "normal",
    confirmTargetFailure: false,
  },
) {
  return workflowDetailSchema.parse(
    (
      await apiClient.post(
        `/v1/workflows/${workflow.id}/commands`,
        {
          command,
          expectedVersion: workflow.version,
          ...(resourceId ? { resourceId, mode: rollback.mode } : {}),
          ...(resourceId && rollback.confirmTargetFailure ? { confirmTargetFailure: true } : {}),
        },
        { headers: commandHeaders(key) },
      )
    ).data,
  );
}
