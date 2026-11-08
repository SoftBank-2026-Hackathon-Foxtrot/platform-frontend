import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { QueryClient } from "@tanstack/react-query";
import { apiClient } from "@/shared/api";
import { collectionHealth } from "@/entities/telemetry";
import {
  monitoringWorkflowsOptions,
  logsOptions,
  seriesOptions,
  seriesSchema,
  traceDetailSchema,
  traceOptions,
  tracesOptions,
} from "./monitoring";

afterEach(() => vi.restoreAllMocks());
const range = { from: "2026-11-07T14:00:00Z", to: "2026-11-07T14:30:00Z" };
const payload = {
  comp: "redis",
  from: range.from,
  step: 60,
  metrics: [{ key: "dirty_age", unit: "ms", source: [0, 1], target: [null, 2] }],
};
describe("monitoring API boundary", () => {
  it("rejects malformed or unaligned observations and preserves absence", () => {
    expect(seriesSchema.parse(payload).metrics[0]?.target).toEqual([null, 2]);
    expect(() => seriesSchema.parse({ ...payload, step: 0 })).toThrow();
    expect(() =>
      seriesSchema.parse({ ...payload, metrics: [{ ...payload.metrics[0], source: [1] }] }),
    ).toThrow();
    expect(() =>
      seriesSchema.parse({ ...payload, metrics: [{ ...payload.metrics[0], target: ["0", 2] }] }),
    ).toThrow();
    expect(() =>
      seriesSchema.parse({ ...payload, metrics: [{ ...payload.metrics[0], unit: "seconds" }] }),
    ).toThrow();
    expect(() => traceDetailSchema.parse({ traceId: "a", spans: [{ startMs: -1 }] })).toThrow();
  });
  it("scopes query identity to workspace, workflow, component, time and trace", () => {
    const first = seriesOptions("alice", "w1", "redis", range);
    expect(first.queryKey).not.toEqual(seriesOptions("bob", "w1", "redis", range).queryKey);
    expect(first.queryKey).not.toEqual(seriesOptions("alice", "w2", "redis", range).queryKey);
    expect(first.queryKey).not.toEqual(seriesOptions("alice", "w1", "db", range).queryKey);
    expect(tracesOptions("alice", "w1", range, "redis").queryKey).not.toEqual(
      tracesOptions("alice", "w1", range).queryKey,
    );
    expect(logsOptions("alice", "w1", range, "a").queryKey).not.toEqual(
      logsOptions("alice", "w1", range, "b").queryKey,
    );
  });
  it("passes the abort signal and encoded workflow identity to the shared client", async () => {
    const get = vi.spyOn(apiClient, "get").mockResolvedValue({ status: 200, data: payload });
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    await client.fetchQuery(seriesOptions("alice", "w/1", "redis", range));
    expect(get).toHaveBeenCalledWith(
      "/v1/workflows/w%2F1/telemetry/series",
      expect.objectContaining({
        signal: expect.any(AbortSignal),
        params: { ...range, comp: "redis", step: "60s" },
      }),
    );
    client.clear();
  });
  it.each([404, 405, 501])(
    "represents unimplemented status %s as unavailable, never demo",
    async (status) => {
      vi.spyOn(apiClient, "get").mockResolvedValue({ status, data: {} });
      const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
      expect(await client.fetchQuery(seriesOptions("alice", "w1", "redis", range))).toBeNull();
      client.clear();
    },
  );
  it("keeps failures as errors and rejects a trace from another identity", async () => {
    const get = vi.spyOn(apiClient, "get").mockRejectedValue(new Error("forbidden"));
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    await expect(client.fetchInfiniteQuery(logsOptions("alice", "w1", range))).rejects.toThrow(
      "forbidden",
    );
    get.mockResolvedValue({ status: 200, data: { traceId: "other", spans: [] } });
    await expect(client.fetchQuery(traceOptions("alice", "w1", "expected"))).rejects.toThrow(
      "Unexpected trace identity",
    );
    client.clear();
  });
  it("does not show a green collection dot for unknown or empty collection", () => {
    expect(collectionHealth(null).state).toBe("unknown");
    expect(collectionHealth({ modules: [] }).state).toBe("unknown");
    expect(
      collectionHealth({
        modules: [{ id: "a", name: "app", state: "STALE", lastCollectedAt: null }],
      }).state,
    ).toBe("warning");
  });
});

it("loads cutover and rollback states without breaking monitoring navigation", async () => {
  const workflows = ["PLANNED", "CUTOVER_COMPLETE", "COMPLETED", "ROLLED_BACK"].map((status) => ({
    id: status,
    application: "goods",
    sourceEnv: "aws",
    targetEnv: "gcp",
    version: 1,
    currentStage: 0,
    createdAt: range.from,
    createdBy: "user",
    finishedAt: null,
    status,
    halt: null,
    reconcileRequested: false,
    rolledBack: [],
  }));
  const get = vi.spyOn(apiClient, "get").mockResolvedValue({ data: workflows });
  const client = new QueryClient();
  expect(await client.fetchQuery(monitoringWorkflowsOptions("one"))).toEqual(workflows);
  expect(get).toHaveBeenCalledWith("/v1/workflows", { signal: expect.any(AbortSignal) });
  expect(monitoringWorkflowsOptions("one").queryKey).not.toEqual(
    monitoringWorkflowsOptions("two").queryKey,
  );
  client.clear();
});
