import { describe, expect, it } from "vite-plus/test";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { detailSchema } from "@/entities/migration";
import { setLocale } from "@/shared/lib/i18n";
import { ResourceObservation } from "./resource-observation";

describe("relocated resource observations", () => {
  const schema = detailSchema.shape.resources.element;
  it("preserves unknown object counts until their observation exists", () => {
    const resource = schema.parse({
      kind: "OBJECT_STORAGE",
      targetWritesPossible: false,
      replication: {
        initialCopy: { completed: 0, total: 5 },
        forward: { backlog: 0 },
        reverse: { backlog: 0 },
      },
      details: { object: {} },
    });
    const html = renderToStaticMarkup(createElement(ResourceObservation, { resource }));
    expect(html).toContain("미확인 / 미확인");
    expect(html).not.toContain("0 / 5");
    expect(html).not.toContain("0 / 0");
    resource.details.object!.initialCopyObservedAt = "2026-11-07T18:30:00Z";
    expect(renderToStaticMarkup(createElement(ResourceObservation, { resource }))).toContain(
      "0 / 5",
    );
  });
  it.each(["en", "ja"] as const)("keeps detailed observations translated in %s", (locale) => {
    setLocale(locale);
    try {
      const resource = schema.parse({
        kind: "REDIS",
        targetWritesPossible: false,
        details: { redis: { sync: { backlog: 0, copied: 784 } } },
      });
      const html = renderToStaticMarkup(createElement(ResourceObservation, { resource }));
      expect(html.match(/[가-힣][^<"]*/g)).toBeNull();
      expect(html).toContain("0 / 784");
    } finally {
      setLocale("ko");
    }
  });
});
