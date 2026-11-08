import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { apiClient } from "@/shared/api";

export const observation = z.enum(["allowed", "denied", "unknown"]);
export const observations = z.object({
  receipt: observation,
  otherBucket: observation,
  copy: observation,
});
const time = z.iso.datetime({ offset: true });
const rehearsal = z.object({
  revision: z.number().int().nonnegative(),
  available: z.boolean(),
  status: z.enum(["idle", "running", "tested", "failed", "approved", "held", "error"]),
  expiresAt: time.optional(),
  finishedAt: time.optional(),
  approvedBy: z.string().optional(),
  approvedAt: time.optional(),
  result: z
    .object({
      bucket: z.string(),
      extraBucket: z.string(),
      before: observations,
      after: observations,
      beforeActions: z.array(z.string()),
      afterActions: z.array(z.string()),
      passed: z.boolean(),
      attempts: z.array(
        z.object({ actions: z.array(z.string()), observations, passed: z.boolean() }),
      ),
      method: z.enum(["rule", "bedrock"]),
    })
    .optional(),
  history: z.array(
    z.object({
      at: time,
      action: z.enum(["tested", "failed", "error", "approve", "hold"]),
      actor: z.string(),
    }),
  ),
});
const path = "/v1/security-review/onprem/rehearsal";
export const rehearsalOptions = (workspace: string) =>
  queryOptions({
    queryKey: ["security-rehearsal", workspace] as const,
    queryFn: async ({ signal }) => rehearsal.parse((await apiClient.get(path, { signal })).data),
    retry: false,
    refetchInterval: (q) => (q.state.data?.status === "running" ? 1500 : 15000),
  });
export async function changeRehearsal(action: "run" | "approve" | "hold", revision: number) {
  return rehearsal.parse(
    (await apiClient.post(path + "/" + action, { revision }, { timeout: 180000 })).data,
  );
}
export type AccessResults = z.infer<typeof observations>;
export type Rehearsal = z.infer<typeof rehearsal>;
