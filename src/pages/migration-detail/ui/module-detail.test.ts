import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vite-plus/test";
import fixture from "../api/control-plane.fixture.json";
import { detailSchema } from "../api/migrations";
import { TransitionDiagram } from "./transition-diagram";
import { CommandPanel } from "./command-panel";
import { proxyActivity, activeModule, runningStreams } from "./module-detail-model";
import { setLocale } from "@/shared/lib/i18n";

describe("transient module detail nodes", () => {
  it("shows one cutover approval and then rollback or finalize choices", () => {
    const data = detailSchema.parse(structuredClone(fixture));
    const queryClient = new QueryClient();
    const render = (allowedCommands: string[]) =>
      renderToStaticMarkup(
        createElement(QueryClientProvider, {
          client: queryClient,
          children: createElement(CommandPanel, { workflow: data.workflow, allowedCommands }),
        }),
      );
    try {
      data.workflow.status = "WAITING_APPROVAL";
      expect(render(["APPROVE", "ABORT"])).toContain("컷오버 승인");
      data.workflow.status = "CUTOVER_COMPLETE";
      const complete = render(["ROLLBACK", "FINALIZE"]);
      expect(complete).toContain("롤백");
      expect(complete).toContain("전환 완료");
      expect(complete).not.toContain("컷오버 승인");
      expect(complete).not.toContain("리소스 되돌리기");
    } finally {
      queryClient.clear();
    }
  });
  it("opens the requested rollback resource even when the current forward stage has passed", () => {
    const data = detailSchema.parse(structuredClone(fixture));
    data.workflow.status = "ROLLING_BACK";
    data.workflow.currentStage = 7;
    data.workflow.rollback = { resource: "REDIS", mode: "normal" };
    expect(activeModule(data)).toBe("REDIS");
    const redis = data.resources.find((r) => r.kind === "REDIS")!;
    redis.observation.freshness = "FRESH";
    redis.route = "TARGET";
    redis.streams = [
      {
        channel: "KEY_EVENTS",
        direction: "REVERSE",
        state: "RUNNING",
        freshness: "FRESH",
        observedAt: "2026-11-07T12:00:00Z",
        backlog: 2,
      },
    ];
    expect(runningStreams(data, redis)).toHaveLength(1);
    const markup = renderToStaticMarkup(createElement(TransitionDiagram, { data }));
    expect(markup).toContain('data-module-detail="REDIS"');
    expect(markup).toContain('data-change-subscription="KEY_EVENTS"');
    expect(markup).toContain("원본 복귀 중");
    expect(markup).toContain("gcp → aws");
    redis.streams[0]!.freshness = "STALE";
    expect(runningStreams(data, redis)).toEqual([]);
    redis.streams[0]!.freshness = "FRESH";
    redis.health = "ERROR";
    expect(runningStreams(data, redis)).toEqual([]);
  });
  it.each(["WAITING_APPROVAL", "CUTOVER_COMPLETE"] as const)(
    "retains observed background streams in %s",
    (status) => {
      const data = detailSchema.parse(structuredClone(fixture));
      data.workflow.status = status;
      const db = data.resources.find((r) => r.kind === "DATABASE")!;
      db.observation.freshness = "FRESH";
      db.streams = [
        {
          channel: "CDC",
          state: "RUNNING",
          direction: "FORWARD",
          freshness: "FRESH",
          observedAt: "2026-11-07T12:00:00Z",
          lagMs: 7,
        },
      ];
      expect(runningStreams(data, db)).toHaveLength(1);
      data.workflow.status = "COMPLETED";
      expect(runningStreams(data, db)).toEqual([]);
      data.workflow.status = "ROLLED_BACK";
      expect(runningStreams(data, db)).toEqual([]);
      data.workflow.status = "RUNNING";
      db.streams[0]!.observedAt = null;
      expect(runningStreams(data, db)).toEqual([]);
    },
  );
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
  it.each(["WAITING_APPROVAL", "CUTOVER_COMPLETE", "HALTED", "COMPLETED", "ROLLED_BACK"] as const)(
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

vi.mock("./monitoring-entry", () => ({
  MonitoringEntryLink: ({
    children,
    "aria-label": label,
  }: {
    children: import("react").ReactNode;
    "aria-label"?: string;
  }) => createElement("a", { "aria-label": label }, children),
}));
