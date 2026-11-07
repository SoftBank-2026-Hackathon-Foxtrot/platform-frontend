import { describe, expect, it } from "vite-plus/test";
import { systemSearchSchema, chartPath } from "./system";
import { seriesSchema, seriesOptions } from "../api/system";
describe("system monitoring", () => {
  it("preserves deployment, instance and category in URLs and isolates query caches", () => {
    const search = systemSearchSchema.parse({
      app: "goods",
      env: "gcp",
      deployment: "env-000000000001",
      instance: "app-02",
      category: "disk",
      minutes: 15,
    });
    expect(search).toMatchObject({ instance: "app-02", category: "disk" });
    expect(systemSearchSchema.parse({ minutes: 999, category: "anything" })).toMatchObject({
      minutes: 15,
      category: "cpu",
    });
    expect(seriesOptions("a", search).queryKey).not.toEqual(seriesOptions("b", search).queryKey);
    expect(seriesOptions("a", search).queryKey).not.toEqual(
      seriesOptions("a", { ...search, deployment: "env-other" }).queryKey,
    );
    expect(seriesOptions("a", search).queryKey).not.toEqual(
      seriesOptions("a", { ...search, instance: "app-01" }).queryKey,
    );
  });
  it("keeps measured zero separate from missing or stopped collection", () => {
    const parsed = seriesSchema.parse({
      from: 0,
      to: 60,
      step: 15,
      series: [
        {
          id: "cpu",
          unit: "%",
          state: "OK",
          points: [
            [0, 0],
            [15, null],
            [30, 2],
            [60, 1],
          ],
        },
      ],
    });
    const points = parsed.series[0]!.points;
    expect(points[0]![1]).toBe(0);
    expect(points[1]![1]).toBeNull();
    expect(chartPath(points, 0, 60, 100, 15).match(/M/g)).toHaveLength(3);
  });
});
