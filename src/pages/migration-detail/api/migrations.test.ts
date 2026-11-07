import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { QueryClient } from "@tanstack/react-query";

import { apiClient } from "@/shared/api";
import { setLocale } from "@/shared/lib/i18n";

import { detailQuery, detailSchema, telemetryQuery, telemetrySchema } from "./migrations";
import fixture from "./control-plane.fixture.json";
import { ResourceCard } from "../ui/resource-card";
import { TransitionDiagram } from "../ui/transition-diagram";

vi.mock("../ui/monitoring-entry", () => ({
  MonitoringEntryLink: ({
    children,
    "aria-label": label,
  }: {
    children: import("react").ReactNode;
    "aria-label"?: string;
  }) => createElement("a", { "aria-label": label }, children),
}));
afterEach(() => vi.restoreAllMocks());

it.each(["en", "ja"] as const)("renders diagram and resource text in %s", (locale) => {
  setLocale(locale);
  try {
    const detail = detailSchema.parse(fixture);
    const diagram = renderToStaticMarkup(createElement(TransitionDiagram, { data: detail }));
    const resources = detail.resources
      .map((resource) =>
        renderToStaticMarkup(createElement(ResourceCard, { resource, workflow: detail.workflow })),
      )
      .join("");
    expect(diagram.match(/[가-힣][^<"]*/g)).toBeNull();
    expect(resources.match(/[가-힣][^<"]*/g)).toBeNull();
    expect(diagram).toContain(locale === "en" ? "Object storage" : "オブジェクトストレージ");
    expect(resources).toContain(locale === "en" ? "Unknown" : "未確認");
  } finally {
    setLocale("ko");
  }
});

describe("control-plane observation contract", () => {
  it("treats null resource details as unreported telemetry", () => {
    const payload: unknown = {
      ...fixture,
      resources: fixture.resources.map((resource) => ({ ...resource, details: null })),
    };
    const detail = detailSchema.parse(payload);
    expect(detail.resources.every((resource) => Object.keys(resource.details).length === 0)).toBe(
      true,
    );
    expect(detail.resources[0]?.details.database?.sourceWriterSessions).toBeUndefined();
    expect(() =>
      renderToStaticMarkup(createElement(TransitionDiagram, { data: detail })),
    ).not.toThrow();
  });
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
    const html = renderToStaticMarkup(
      createElement(ResourceCard, { resource: object, workflow: detail.workflow }),
    );
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
