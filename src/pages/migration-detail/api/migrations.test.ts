import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { QueryClient } from "@tanstack/react-query";

import { apiClient } from "@/shared/api";

import { detailQuery, detailSchema, telemetryQuery, telemetrySchema } from "./migrations";
import fixture from "./control-plane.fixture.json";
import { ResourceCard } from "../ui/resource-card";

afterEach(() => vi.restoreAllMocks());

describe("control-plane observation contract", () => {
  it("accepts the actual backend projection and preserves unknown sockets", () => {
    const detail = detailSchema.parse(fixture);
    expect(detail.resources).toHaveLength(3);
    expect(detail.hold.actors[0]?.activeWebSockets).toBeNull();
    expect(detail.publicProbe).toBeNull();
    expect(detail.traffic).toEqual([]);
  });
  it("rejects malformed measurements instead of rendering success", () => {
    const invalid = structuredClone(fixture);
    invalid.hold.actors[0]!.inFlight = "0" as unknown as number;
    expect(() => detailSchema.parse(invalid)).toThrow();
  });
  it("passes query cancellation and scopes the cache to its workflow", async () => {
    const get = vi.spyOn(apiClient, "get").mockResolvedValue({ data: fixture });
    const options = detailQuery("personal:test", "workflow-test");
    const controller = new AbortController();
    // Query context is supplied by TanStack at runtime; only signal is consumed here.
    if (typeof options.queryFn !== "function") throw new Error("Missing query function");
    await options.queryFn({
      signal: controller.signal,
      queryKey: options.queryKey,
      meta: undefined,
      client: new QueryClient(),
    });
    expect(get).toHaveBeenCalledWith("/v1/workflows/workflow-test", { signal: controller.signal });
    expect(options.queryKey).toContain("workflow-test");
  });
  it("does not display unmeasured object backlog as zero", () => {
    const detail = detailSchema.parse(fixture);
    const object = detail.resources.find((r) => r.kind === "OBJECT_STORAGE")!;
    const html = renderToStaticMarkup(createElement(ResourceCard, { resource: object }));
    expect(html).toContain("미확인");
    expect(object.details.object?.reverseObservedAt).toBeUndefined();
  });
});

it("keeps OTEL backend outages distinct from zero measurements and forwards cancellation", async () => {
  const payload = {
    source: "OTEL",
    metricsState: "UNAVAILABLE",
    tracesState: "NOT_CONFIGURED",
    metrics: [],
    traces: [],
  };
  expect(telemetrySchema.parse(payload).metrics).toEqual([]);
  expect(() =>
    telemetrySchema.parse({ ...payload, metrics: [{ name: "lag", value: "0" }] }),
  ).toThrow();
  const get = vi.spyOn(apiClient, "get").mockResolvedValue({ data: payload });
  const options = telemetryQuery("personal:test", "workflow/otel");
  if (typeof options.queryFn !== "function") throw new Error("Missing query function");
  const controller = new AbortController();
  await options.queryFn({
    signal: controller.signal,
    queryKey: options.queryKey,
    meta: undefined,
    client: new QueryClient(),
  });
  expect(get).toHaveBeenCalledWith("/v1/workflows/workflow%2Fotel/telemetry", {
    signal: controller.signal,
  });
});
