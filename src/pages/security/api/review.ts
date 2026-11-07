import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { apiClient } from "@/shared/api";

const time = z.iso.datetime({ offset: true });
export const reviewSchema = z.object({
  revision: z.number().int().nonnegative(),
  application: z.string(),
  mode: z.enum(["cloud", "fixture"]),
  readOnly: z.boolean().default(true),
  phase: z.enum([
    "idle",
    "scanning",
    "gap",
    "unknown",
    "matched",
    "plan",
    "applying",
    "applied",
    "verifying",
    "verified",
    "error",
  ]),
  source: z.object({ role: z.string(), policy: z.string(), bucket: z.string() }),
  target: z.object({ principal: z.string(), bucket: z.string(), extraBucket: z.string() }),
  collectedAt: time.nullable(),
  verifiedAt: time.nullable(),
  validUntil: time.optional(),
  appReady: z.boolean().nullable(),
  error: z.string().nullable(),
  uiCanContinue: z.boolean(),
  checks: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      status: z.enum(["pass", "fail", "unknown"]),
      source: z.string(),
      target: z.string(),
      evidence: z.string(),
    }),
  ),
  plan: z
    .object({
      id: z.string(),
      bucket: z.string(),
      principal: z.string(),
      removeRoles: z.array(z.string()),
      retainBucket: z.string(),
      expiresAt: time,
    })
    .nullable(),
  events: z.array(z.object({ id: z.string(), at: time, actor: z.string(), message: z.string() })),
});
export type Review = z.infer<typeof reviewSchema>;
export type Action = "scan" | "plan" | "apply" | "verify";
export const busyReview = (review: Review) =>
  ["scanning", "applying", "verifying"].includes(review.phase);
export const canApply = (review: Review, now = Date.now()) =>
  !review.readOnly &&
  review.phase === "plan" &&
  review.appReady === true &&
  !review.error &&
  !!review.plan &&
  review.plan.bucket === review.target.extraBucket &&
  review.plan.retainBucket === review.target.bucket &&
  review.plan.principal === review.target.principal &&
  review.plan.removeRoles.length > 0 &&
  now < Date.parse(review.plan.expiresAt);
export const canContinue = (review: Review, now = Date.now()) =>
  !review.readOnly &&
  review.uiCanContinue &&
  review.phase === "verified" &&
  review.appReady === true &&
  review.checks.length > 0 &&
  review.checks.every((c) => c.status === "pass") &&
  !!review.validUntil &&
  now < Date.parse(review.validUntil);
export const reviewKey = (workspace: string) => ["security-review", workspace] as const;
export const reviewOptions = (workspace: string) =>
  queryOptions({
    queryKey: reviewKey(workspace),
    queryFn: async ({ signal }) =>
      reviewSchema.parse((await apiClient.get("/v1/security-review", { signal })).data),
    retry: false,
    refetchInterval: (query) => (query.state.data && busyReview(query.state.data) ? 1500 : 15000),
  });
export async function changeReview(action: Action, review: Review) {
  return reviewSchema.parse(
    (
      await apiClient.post(
        `/v1/security-review/${action}`,
        { revision: review.revision, ...(action === "apply" ? { planId: review.plan?.id } : {}) },
        { timeout: 120000 },
      )
    ).data,
  );
}
