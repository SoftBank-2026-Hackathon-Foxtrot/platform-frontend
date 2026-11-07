import { describe, expect, it } from "vite-plus/test";
import {
  checkCounts,
  demoReducer,
  initialDemoState,
  type DemoAction,
  type DemoState,
} from "./demo";

const at = "2026-11-08T03:00:00Z";
const act = (state: DemoState, type: Exclude<DemoAction["type"], "reset" | "select">) =>
  demoReducer(state, { type, at });

describe("security demonstration boundaries", () => {
  it("does not count unscanned checks as passed or allow an early approval", () => {
    expect(checkCounts("idle")).toEqual({ pass: 0, fail: 0, unknown: 12, total: 12 });
    for (const phase of ["idle", "scanning", "gap", "plan", "verifying"] as const) {
      const state = { ...initialDemoState, phase };
      expect(act(state, "approve")).toBe(state);
    }
  });

  it("keeps the gap open while drafting or applying and records approval only after verification", () => {
    let state = act(act(initialDemoState, "scan"), "scanned");
    expect(checkCounts(state.phase)).toEqual({ pass: 11, fail: 1, unknown: 0, total: 12 });
    state = act(state, "plan");
    expect(checkCounts(state.phase).fail).toBe(1);
    state = act(state, "cancel");
    expect(state.phase).toBe("gap");
    state = act(act(state, "plan"), "verify");
    expect(checkCounts(state.phase).fail).toBe(1);
    state = act(state, "verified");
    expect(checkCounts(state.phase).pass).toBe(12);
    state = act(state, "approve");
    expect(state.phase).toBe("approved");
    expect(state.events[0]?.message).toBe("demo 사용자가 전환 승인");
    expect(act(state, "approve")).toBe(state);
  });

  it("rejects stale completions after a reset and keeps selection separate from results", () => {
    const scanning = act(initialDemoState, "scan");
    const reset = demoReducer(scanning, { type: "reset" });
    expect(act(reset, "scanned")).toBe(reset);
    const selected = demoReducer(reset, { type: "select", id: "db" });
    expect(selected.phase).toBe("idle");
    expect(selected.events).toEqual([]);
  });
});
