import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vite-plus/test";
import fixture from "../api/control-plane.fixture.json";
import { detailSchema } from "../api/migrations";
import { TransitionDiagram } from "./transition-diagram";

describe("transient module detail nodes", () => {
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
