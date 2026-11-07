import MockAdapter from "axios-mock-adapter";
import { afterEach, expect, test } from "vite-plus/test";
import { apiClient } from "@/shared/api";
import { readConfiguration, sizingOptions, sizingOptionsSchema } from "./sizing";

const raw = {
  applicationId: "goods",
  targetEnv: "gcp",
  cloud: "gcp",
  supported: true,
  blockedReason: null,
  deployment: {
    environmentId: "env-aaaaaaaaaaaa",
    status: "READY",
    updatedAt: "2026-11-08T00:00:00Z",
    sizing: { db_tier: "db-custom-1-3840", db_storage_gib: 20, cache_high_availability: false },
    app: { cpu: 1, memoryMiB: 2048, workerCount: 2, apiWorkers: 4 },
  },
  parameters: {
    db_tier: { type: "string", enum: ["db-custom-1-3840", "db-custom-2-7680"] },
    db_storage_gib: { type: "integer", minimum: 20, maximum: 200 },
    cache_high_availability: { type: "boolean" },
  },
  appOptions: { cpu: [1, 2], memoryStepMiB: 512 },
};
const mock = new MockAdapter(apiClient);
afterEach(() => mock.reset());
function form() {
  const values = new FormData();
  for (const [key, value] of Object.entries({
    "app.cpu": "2",
    "app.memoryMiB": "4096",
    "sizing.db_tier": "db-custom-1-3840",
    "sizing.db_storage_gib": "40",
    "sizing.cache_high_availability": "false",
  }))
    values.set(key, value);
  return values;
}
test("uses owned target metadata and pins its revision with only changed sizing values", async () => {
  const controller = new AbortController();
  mock.onGet("/v1/migration-sizing").reply((request) => {
    expect(request.params).toEqual({ targetEnv: "gcp" });
    return [200, raw];
  });
  const options = sizingOptions("personal:owner", "gcp", true);
  const data = await options.queryFn!({ signal: controller.signal } as never);
  expect(readConfiguration(data, form())).toEqual({
    environmentId: "env-aaaaaaaaaaaa",
    expectedUpdatedAt: raw.deployment.updatedAt,
    sizing: { db_storage_gib: 40 },
    app: { cpu: 2, memoryMiB: 4096 },
  });
  expect(sizingOptions("personal:other", "gcp", true).queryKey).not.toEqual(options.queryKey);
});
test("rejects missing target mapping and invalid values without sending an update", () => {
  const data = sizingOptionsSchema.parse(raw);
  expect(() =>
    readConfiguration({ ...data, supported: false, deployment: null }, form()),
  ).toThrow();
  const values = form();
  values.set("app.cpu", "NaN");
  expect(() => readConfiguration(data, values)).toThrow();
  values.set("app.cpu", "2");
  values.set("sizing.db_storage_gib", "20.5");
  expect(() => readConfiguration(data, values)).toThrow();
  expect(mock.history.post).toHaveLength(0);
});
