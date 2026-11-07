import { describe, expect, it } from "vite-plus/test";
import {
  difference,
  drilldownRange,
  filterTraces,
  monitoringSearchSchema,
  niceMaximum,
  seriesPath,
} from "./monitoring";
import type { Trace } from "../api/monitoring";

describe("monitoring drilldown and chart semantics", () => {
  it("keeps zero measurements and breaks paths at missing samples", () => {
    expect(seriesPath([1, 0, null, 2], 5)).toBe("M0.00,94.00 L153.33,116.00  M460.00,72.00");
    expect(seriesPath([null, null], 1).trim()).toBe("");
    expect(niceMaximum([null, 0])).toBe(1);
    expect(niceMaximum([2.1, null])).toBe(2.5);
    expect(niceMaximum([406, 42])).toBe(500);
  });
  it("does not divide by zero or invent a comparison for an absent target", () => {
    expect(difference(0, 2)).toBeNull();
    expect(difference(1, null)).toBeNull();
    expect(difference(2, 3)).toEqual({ ratio: 1.5, warning: true });
    expect(difference(2, 0)).toEqual({ ratio: 0, warning: false });
  });
  it("sanitizes invalid URL values without making the page inaccessible", () => {
    expect(
      monitoringSearchSchema.parse({ comp: "unknown", at: "not-a-date", workflow: "" }),
    ).toEqual({ comp: "app", at: undefined, workflow: undefined });
    expect(
      monitoringSearchSchema.parse({ comp: "redis", at: "2026-11-07T14:30:00Z", q: "trace-1" }).q,
    ).toBe("trace-1");
  });
  it("applies the inclusive two-minute window and component together", () => {
    const make = (
      traceId: string,
      at: string,
      components: Trace["components"],
      durationMs = 300,
    ): Trace => ({
      traceId,
      at,
      components,
      durationMs,
      name: "GET /cart",
      service: "shop",
      side: "target",
      status: "error",
      statusCode: "500",
    });
    const traces = [
      make("before", "2026-11-07T14:27:59Z", ["redis"]),
      make("start", "2026-11-07T14:28:00Z", ["redis"]),
      make("other", "2026-11-07T14:30:00Z", ["db"]),
      make("end", "2026-11-07T14:32:00Z", ["app", "redis"], 301),
      make("after", "2026-11-07T14:32:01Z", ["redis"]),
    ];
    const range = drilldownRange("2026-11-07T14:30:00Z");
    expect(filterTraces(traces, "all", range, "redis").map((trace) => trace.traceId)).toEqual([
      "start",
      "end",
    ]);
    expect(filterTraces(traces, "slow", range, "redis").map((trace) => trace.traceId)).toEqual([
      "end",
    ]);
  });
});
