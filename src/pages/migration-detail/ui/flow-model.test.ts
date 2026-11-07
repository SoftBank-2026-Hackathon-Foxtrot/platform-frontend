import { describe, expect, it } from "vite-plus/test";
import { detailSchema } from "../api/migrations";
import fixture from "../api/control-plane.fixture.json";
import {
  activeSides,
  copyProgress,
  preparationFlow,
  resourceFlow,
  trafficFlow,
} from "./flow-model";

const detail = () => detailSchema.parse(structuredClone(fixture));

describe("migration visual evidence", () => {
  it("stops copy motion when the resource reports an error", () => {
    const data = detail();
    data.workflow.status = "RUNNING";
    const resource = data.resources[0]!;
    resource.lifecycle = "SYNCING";
    resource.health = "ERROR";
    expect(resourceFlow(data, resource)).toMatchObject({ moving: false, failed: true });
  });
  it("animates legacy SYNCING observations without fabricating a percentage", () => {
    const data = detail();
    data.workflow.status = "RUNNING";
    const resource = data.resources[0]!;
    resource.lifecycle = "SYNCING";
    resource.replication = undefined;
    resource.progress = undefined;
    resource.observation.freshness = "UNKNOWN";
    resource.observedAt = "2026-11-07T10:00:00Z";
    expect(resourceFlow(data, resource)).toMatchObject({
      forward: true,
      moving: true,
      progress: null,
    });
  });
  it.each(["STALE", "UNAVAILABLE"])(
    "freezes %s observations even if lifecycle says SYNCING",
    (freshness) => {
      const data = detail();
      data.workflow.status = "RUNNING";
      const resource = data.resources[0]!;
      resource.lifecycle = "SYNCING";
      resource.observation.freshness = freshness;
      expect(resourceFlow(data, resource).moving).toBe(false);
    },
  );
  it.each([
    "HALTED",
    "WAITING_APPROVAL",
    "CUTOVER_COMPLETE",
    "COMPLETED",
    "ABORTED",
    "ROLLED_BACK",
  ] as const)("stops illustrative movement in %s", (status) => {
    const data = detail();
    data.workflow.status = status;
    const resource = data.resources[0]!;
    resource.lifecycle = "SYNCING";
    resource.observation.freshness = "FRESH";
    expect(resourceFlow(data, resource).moving).toBe(false);
  });
  it("uses only valid measured totals, including a zero denominator", () => {
    const resource = detail().resources[0]!;
    resource.progress = { completed: 250, total: 1000, unit: "rows" };
    expect(copyProgress(resource)?.percent).toBe(25);
    resource.progress = { completed: 0, total: 0, unit: "rows" };
    expect(copyProgress(resource)?.percent).toBeNull();
    resource.progress = { completed: 1001, total: 1000, unit: "rows" };
    expect(copyProgress(resource)).toBeNull();
  });
  it("does not use unobserved object copy counters", () => {
    const resource = detail().resources.find((r) => r.kind === "OBJECT_STORAGE")!;
    resource.progress = undefined;
    resource.replication = { initialCopy: { completed: 4, total: 10 } };
    resource.details.object = { initialCopyObservedAt: null };
    expect(copyProgress(resource)).toBeNull();
    resource.details.object.initialCopyObservedAt = "2026-11-07T10:00:00Z";
    expect(copyProgress(resource)?.percent).toBe(40);
  });
  it("keeps requested traffic separate from confirmed traffic", () => {
    const data = detail();
    data.workflow.status = "RUNNING";
    data.traffic = [
      {
        operationId: "test",
        at: "2026-11-07T10:00:00Z",
        requested: { aws: 95, gcp: 5 },
        configVerified: false,
      },
    ];
    expect(trafficFlow(data)).toMatchObject({
      confirmed: null,
      requested: [95, 5],
      moving: false,
      pending: true,
    });
    data.traffic[0]!.effectivePercent = { aws: 100, gcp: 0 };
    expect(trafficFlow(data)).toMatchObject({ shown: [100, 0], pending: true });
    data.traffic[0]!.effectivePercent = { aws: 95, gcp: 5 };
    expect(trafficFlow(data)).toMatchObject({ confirmed: [95, 5], pending: false, moving: true });
    data.traffic[0]!.effectivePercent = { aws: 120, gcp: -20 };
    expect(trafficFlow(data).confirmed).toBeNull();
  });
  it("does not switch service routes when a copy merely becomes READY", () => {
    const resource = detail().resources[0]!;
    resource.lifecycle = "READY";
    resource.route = "SOURCE";
    expect(activeSides(resource)).toEqual({ source: true, target: false, sourceFallback: false });
    resource.route = "MIXED";
    expect(activeSides(resource)).toEqual({ source: true, target: true, sourceFallback: false });
    resource.route = null;
    expect(activeSides(resource)).toEqual({ source: false, target: false, sourceFallback: false });
  });
  it("shows a cut-over object store on its target, with the source only serving read fallback", () => {
    const object = detail().resources.find((r) => r.kind === "OBJECT_STORAGE")!;
    object.lifecycle = "ACTIVE";
    object.route = "MIXED";
    expect(activeSides(object)).toEqual({ source: false, target: true, sourceFallback: true });
    object.route = "TARGET";
    expect(activeSides(object)).toEqual({ source: false, target: true, sourceFallback: false });
  });
  it("does not invent infrastructure completion from the overall stage", () => {
    const data = detail();
    data.preparation = {};
    expect(preparationFlow(data).rows.every((row) => !row.done && !row.moving)).toBe(true);
  });
});
