import { describe, expect, it } from "vite-plus/test";
import { canContinue, reviewSchema } from "./review";
const sample = {
  revision: 1,
  application: "goods",
  mode: "cloud",
  readOnly: false,
  phase: "verified",
  source: { role: "app", policy: "workload-bucket", bucket: "source" },
  target: { principal: "app@gcp", bucket: "target", extraBucket: "demo" },
  collectedAt: "2026-11-08T00:00:00Z",
  verifiedAt: "2026-11-08T00:00:00Z",
  validUntil: "2026-11-08T00:10:00Z",
  appReady: true,
  error: null,
  uiCanContinue: true,
  checks: [
    {
      id: "extra",
      title: "scope",
      status: "pass",
      source: "one",
      target: "one",
      evidence: "policy",
    },
  ],
  plan: null,
  events: [],
};
describe("security review navigation", () => {
  it("requires a verified server response, app readiness and fresh evidence", () => {
    const review = reviewSchema.parse(sample);
    const now = Date.parse("2026-11-08T00:01:00Z");
    expect(canContinue(review, now)).toBe(true);
    expect(canContinue({ ...review, phase: "applied" }, now)).toBe(false);
    expect(canContinue({ ...review, appReady: false }, now)).toBe(false);
    expect(canContinue({ ...review, uiCanContinue: false }, now)).toBe(false);
    expect(canContinue(review, Date.parse(sample.validUntil))).toBe(false);
  });
  it("never treats unknown, failed or empty checks as passed", () => {
    const review = reviewSchema.parse(sample);
    const now = Date.parse(sample.verifiedAt);
    for (const status of ["unknown", "fail"] as const)
      expect(canContinue({ ...review, checks: [{ ...review.checks[0]!, status }] }, now)).toBe(
        false,
      );
    expect(canContinue({ ...review, checks: [] }, now)).toBe(false);
  });
  it("defaults to read-only and never enables continuation in that mode", () => {
    const review = reviewSchema.parse({ ...sample, readOnly: undefined });
    expect(review.readOnly).toBe(true);
    expect(canContinue(review, Date.parse(sample.verifiedAt))).toBe(false);
  });
  it("rejects success-shaped malformed API responses", () => {
    expect(reviewSchema.safeParse({ ...sample, revision: -1 }).success).toBe(false);
    expect(reviewSchema.safeParse({ ...sample, appReady: "true" }).success).toBe(false);
    expect(reviewSchema.safeParse({ ...sample, phase: "approved" }).success).toBe(false);
  });
});
