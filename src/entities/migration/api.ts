import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import {
  apiClient,
  commandHeaders,
  eventSchema,
  providerSchema,
  resourceSchema,
} from "@/shared/api";
export const migrationInputSchema = z.object({
  applicationId: z.string().min(1),
  target: providerSchema,
  reverseEnabled: z.boolean(),
});
export type MigrationInput = z.infer<typeof migrationInputSchema>;
export const migrationActionSchema = z.enum([
  "APPROVE",
  "PAUSE",
  "RESUME",
  "FAIL",
  "RETRY",
  "RECONCILE",
  "ROLLBACK",
  "CANCEL",
]);
export type MigrationAction = z.infer<typeof migrationActionSchema>;
export const migrationSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  applicationId: z.string(),
  applicationName: z.string(),
  source: providerSchema,
  target: providerSchema,
  reverseEnabled: z.boolean(),
  status: z.enum([
    "COPYING",
    "READY",
    "SWITCHING",
    "PAUSED",
    "FAILED",
    "UNKNOWN",
    "ROLLING_BACK",
    "COMPLETED",
    "ROLLED_BACK",
    "CANCELLED",
  ]),
  revision: z.number(),
  createdAt: z.number(),
  updatedAt: z.number(),
  dueAt: z.number(),
  current: z.number(),
  resumeStatus: z.enum(["COPYING", "READY", "SWITCHING"]),
  steps: z.array(
    z.object({
      resource: resourceSchema,
      status: z.enum(["WAITING", "COPYING", "READY", "SWITCHING", "VERIFIED", "ROLLED_BACK"]),
      switched: z.boolean(),
    }),
  ),
  events: z.array(eventSchema),
  allowedActions: z.array(migrationActionSchema),
  blockReason: z.string().nullable(),
});
export type Migration = z.infer<typeof migrationSchema>;
export const migrationStatus: Record<Migration["status"], string> = {
  COPYING: "복사 중",
  READY: "전환 승인 대기",
  SWITCHING: "전환·검증 중",
  PAUSED: "일시정지",
  FAILED: "실패",
  UNKNOWN: "상태 확인 필요",
  ROLLING_BACK: "복귀 중",
  COMPLETED: "이전 완료",
  ROLLED_BACK: "원본 복귀 완료",
  CANCELLED: "취소됨",
};
export const migrationActionNames: Record<MigrationAction, string> = {
  APPROVE: "전환 승인",
  PAUSE: "일시정지",
  RESUME: "계속 진행",
  FAIL: "오류 재현",
  RETRY: "재시도",
  RECONCILE: "실제 상태 확인",
  ROLLBACK: "원본으로 복귀",
  CANCEL: "계획 취소",
};
export const migrationsOptions = (workspaceId: string) =>
  queryOptions({
    queryKey: ["migrations", workspaceId],
    queryFn: async ({ signal }) =>
      z
        .array(migrationSchema)
        .parse((await apiClient.get("/v1/migrations", { params: { workspaceId }, signal })).data),
    refetchInterval: 1500,
  });
export const migrationOptions = (workspaceId: string, id: string) =>
  queryOptions({
    queryKey: ["migrations", workspaceId, id],
    queryFn: async ({ signal }) =>
      migrationSchema.parse((await apiClient.get(`/v1/migrations/${id}`, { signal })).data),
    refetchInterval: 1000,
  });
export async function createMigration(input: MigrationInput, workspaceId: string) {
  return migrationSchema.parse(
    (
      await apiClient.post(
        "/v1/migrations",
        { ...input, workspaceId },
        { headers: commandHeaders() },
      )
    ).data,
  );
}
export async function actOnMigration(migration: Migration, action: MigrationAction) {
  return migrationSchema.parse(
    (
      await apiClient.post(
        `/v1/migrations/${migration.id}/actions`,
        { action, expectedRevision: migration.revision },
        { headers: commandHeaders() },
      )
    ).data,
  );
}
