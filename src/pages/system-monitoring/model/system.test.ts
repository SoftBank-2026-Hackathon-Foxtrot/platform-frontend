import { QueryClient } from "@tanstack/react-query";
import { apiClient } from "@/shared/api";
import { describe, expect, it, vi } from "vite-plus/test";
import { systemSearchSchema, chartPath, selectDeployment } from "./system";
import { seriesSchema, seriesOptions, deploymentsOptions } from "../api/system";
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

it("requests registered deployments even before their first sample", async () => {
  const get = vi
    .spyOn(apiClient, "get")
    .mockResolvedValue({ data: { state: "UNAVAILABLE", environments: [] } });
  const client = new QueryClient();
  expect(await client.fetchQuery(deploymentsOptions("workspace", "app/id"))).toEqual({
    state: "UNAVAILABLE",
    environments: [],
  });
  expect(get).toHaveBeenCalledWith("/v1/applications/app%2Fid/system-metrics/deployments", {
    signal: expect.any(AbortSignal),
    params: { include_inactive: true },
  });
  client.clear();
  get.mockRestore();
});

it("preserves shared deployment identifiers and separates their query cache", async () => {
  const row = {
    environmentId: "shared:env-000000000001",
    deploymentId: "chiikawa-aws-demo",
    cloud: "aws",
    status: "REPORTING",
    access: "shared",
  };
  const get = vi.spyOn(apiClient, "get").mockResolvedValue({
    data: { state: "OK", environments: [row] },
  });
  const client = new QueryClient();
  try {
    const result = await client.fetchQuery(deploymentsOptions("workspace", "chiikawa"));
    expect(result.environments).toEqual([row]);
    const search = systemSearchSchema.parse({
      app: "chiikawa",
      deployment: result.environments[0]!.environmentId,
      instance: "api-1",
    });
    expect(search.deployment).toBe("shared:env-000000000001");
    expect(seriesOptions("workspace", search).queryKey).not.toEqual(
      seriesOptions("workspace", { ...search, deployment: "env-000000000001" }).queryKey,
    );
  } finally {
    client.clear();
    get.mockRestore();
  }
});

it("prefers reporting deployments without overriding an explicit selection or cloud", () => {
  const waiting = {
    environmentId: "aws",
    cloud: "aws",
    status: "READY",
    collection: "NOT_REPORTING" as const,
  };
  const reporting = {
    environmentId: "gcp",
    cloud: "gcp",
    status: "READY",
    collection: "REPORTING" as const,
  };
  const choices = [waiting, reporting];
  expect(selectDeployment(choices, {})).toEqual(reporting);
  expect(selectDeployment(choices, { deployment: "aws" })).toEqual(waiting);
  expect(selectDeployment(choices, { env: "aws" })).toEqual(waiting);
  expect(selectDeployment(choices, { deployment: "missing" })).toBeUndefined();
  expect(selectDeployment([{ ...reporting, status: "DESTROYED" }], {})).toBeUndefined();
});
