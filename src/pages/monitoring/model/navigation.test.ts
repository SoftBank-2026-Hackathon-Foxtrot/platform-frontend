import { describe, expect, it } from "vite-plus/test";
import { migrationReturn, migrationViewSchema } from "@/entities/migration";
import { monitoringSearchSchema, traceTimestamp } from "./monitoring";

describe("entry context and return navigation", () => {
  const from = {
    workflow: "original-workflow",
    label: "Checkout",
    anchor: "event-older",
    visit: "visit-one",
    expanded: true,
    eventCursor: "older",
  };
  it("keeps the original workflow and history page when inspecting another workflow", () => {
    const state = monitoringSearchSchema.parse({
      workflow: "another-workflow",
      comp: "redis",
      from,
    });
    expect(migrationReturn(state.from!)).toEqual({
      id: "original-workflow",
      hash: "event-older",
      search: { expanded: true, eventCursor: "older", resume: "visit-one" },
    });
    expect(migrationViewSchema.parse(migrationReturn(state.from!).search).expanded).toBe(true);
  });
  it("does not invent a return origin for direct links and rejects malformed anchors", () => {
    expect(monitoringSearchSchema.parse({ workflow: "direct", comp: "db" }).from).toBeUndefined();
    expect(
      monitoringSearchSchema.parse({ from: { ...from, anchor: "https://external.invalid" } }).from,
    ).toBeUndefined();
    expect(monitoringSearchSchema.parse({ from: { ...from, workflow: "" } }).from).toBeUndefined();
    expect(monitoringSearchSchema.parse({ side: "invalid" }).side).toBeUndefined();
  });
  it("uses measured Tempo time without losing nanosecond precision or inventing absent dates", () => {
    expect(traceTimestamp("1794076200123456789")).toBe("2026-11-07T18:30:00.123Z");
    for (const value of [
      null,
      undefined,
      "",
      "unknown",
      "-100",
      "999999999999999999999999999999",
    ]) {
      expect(traceTimestamp(value)).toBeUndefined();
    }
  });
});
