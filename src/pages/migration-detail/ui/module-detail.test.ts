import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vite-plus/test";
import fixture from "../api/control-plane.fixture.json";
import { detailSchema } from "../api/migrations";
import { TransitionDiagram } from "./transition-diagram";
import { proxyActivity } from "./module-detail-model";
import { setLocale } from "@/shared/lib/i18n";

describe("transient module detail nodes", () => {
  it("animates reported copy paths through expanded worker nodes and freezes uncertain observations", () => {
    const data = detailSchema.parse(structuredClone(fixture));
    data.workflow.status = "RUNNING";
    data.workflow.currentStage = 2;
    data.stages.find((s) => s.index === 2)!.status = "RUNNING";
    const object = data.resources.find((r) => r.kind === "OBJECT_STORAGE")!;
    object.lifecycle = "ACTIVE";
    object.observation.freshness = "FRESH";
    object.replication = { forward: { state: "RUNNING" } };
    const render = (suspended = false) =>
      renderToStaticMarkup(createElement(TransitionDiagram, { data, suspended }));
    expect(render().match(/data-replication-packet=/g)).toHaveLength(8);
    object.replication.reverse = { state: "RUNNING" };
    expect(render().match(/data-replication-packet=/g)).toHaveLength(16);
    expect(render(true)).not.toContain("data-replication-packet=");
    object.observation.freshness = "STALE";
    expect(render()).not.toContain("data-replication-packet=");
    object.observation.freshness = "FRESH";
    object.replication = undefined;
    expect(render()).not.toContain("data-replication-packet=");
    expect(render()).toContain("복제 실행 미확인");
  });
  it.each(["en", "ja"] as const)("translates module responsibilities in %s", (locale) => {
    const data = detailSchema.parse(structuredClone(fixture));
    data.workflow.status = "RUNNING";
    data.workflow.currentStage = 4;
    data.stages.find((s) => s.index === 4)!.status = "RUNNING";
    setLocale(locale);
    try {
      expect(
        renderToStaticMarkup(createElement(TransitionDiagram, { data })).match(/[가-힣]/g),
      ).toBeNull();
    } finally {
      setLocale("ko");
    }
  });
  it("uses reported proxy state without inferring writes from the platform step", () => {
    const data = detailSchema.parse(structuredClone(fixture));
    const redis = data.resources.find((r) => r.kind === "REDIS")!;
    redis.observation.freshness = "FRESH";
    redis.route = "TARGET";
    redis.details.redis = { proxy: { paused: true, inflight_writes: 3, freshness: "FRESH" } };
    expect(proxyActivity(data, redis, false)).toMatchObject({
      destination: data.workflow.targetEnv,
      paused: true,
      inflight: 3,
      stale: false,
    });
    redis.details.redis.proxy = {};
    expect(proxyActivity(data, redis, false).paused).toBeNull();
    redis.details.redis.proxy = { freshness: "STALE", paused: false };
    expect(proxyActivity(data, redis, false)).toMatchObject({
      destination: null,
      paused: null,
      inflight: null,
      stale: true,
    });
    expect(proxyActivity(data, redis, true).destination).toBeNull();
    redis.details.redis.proxy = { freshness: "FRESH" };
    redis.route = "MIXED";
    expect(proxyActivity(data, redis, false).destination).toBeNull();
  });
  it.each([
    [2, "OBJECT_STORAGE", "객체 라우터"],
    [4, "REDIS", "Redis proxy"],
    [5, "DATABASE", "PgBouncer"],
  ] as const)("expands stage %s inside the complete topology", (index, kind, router) => {
    const data = detailSchema.parse(structuredClone(fixture));
    data.workflow.status = "RUNNING";
    data.workflow.currentStage = index;
    data.stages.find((s) => s.index === index)!.status = "RUNNING";
    const markup = renderToStaticMarkup(createElement(TransitionDiagram, { data }));
    expect(markup).toContain('class="canvas"');
    expect(markup).toContain(`data-module-detail="${kind}"`);
    expect(markup).toContain(router);
    expect(markup).toContain("Traffic LB");
    expect(markup).toContain("AWS Cloud");
    expect(markup).toContain("Google Cloud");
    expect(markup.match(/class="tile"/g)).toHaveLength(13);
    data.stages.find((s) => s.index === index)!.status = "PASSED";
    const completed = renderToStaticMarkup(createElement(TransitionDiagram, { data }));
    expect(completed).not.toContain("data-module-detail=");
    expect(completed.match(/class="tile"/g)).toHaveLength(11);
  });
  it.each(["WAITING_APPROVAL", "HALTED", "COMPLETED"] as const)(
    "does not expand %s workflows",
    (status) => {
      const data = detailSchema.parse(structuredClone(fixture));
      data.workflow.currentStage = 4;
      data.workflow.status = status;
      data.stages.find((s) => s.index === 4)!.status = "RUNNING";
      expect(renderToStaticMarkup(createElement(TransitionDiagram, { data }))).not.toContain(
        "data-module-detail=",
      );
    },
  );
});
