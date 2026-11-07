import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { apiClient } from "@/shared/api";

export const componentSchema = z.enum(["app", "db", "redis", "obj"]);
export type TelemetryComponent = z.infer<typeof componentSchema>;
export const collectionSchema = z.object({
  modules: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      state: z.enum(["FRESH", "STALE", "UNAVAILABLE", "UNKNOWN"]),
      lastCollectedAt: z.iso.datetime({ offset: true }).nullable(),
    }),
  ),
});
export type Collection = z.infer<typeof collectionSchema>;

/** Optional, proposed monitoring APIs must never fall back to example data. */
export async function readTelemetry<T>(
  path: string,
  schema: z.ZodType<T>,
  signal: AbortSignal,
  params?: Record<string, string>,
): Promise<T | null> {
  const response = await apiClient.get(path, {
    params,
    signal,
    validateStatus: (status) => (status >= 200 && status < 300) || [404, 405, 501].includes(status),
  });
  return [404, 405, 501].includes(response.status) ? null : schema.parse(response.data);
}

export function collectionOptions(workspace: string) {
  return queryOptions({
    queryKey: ["telemetry-collection", workspace],
    queryFn: ({ signal }) => readTelemetry("/v1/telemetry/collection", collectionSchema, signal),
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}

export function collectionHealth(collection: Collection | null | undefined) {
  const modules = collection?.modules ?? [];
  const fresh = modules.filter((module) => module.state === "FRESH").length;
  return {
    fresh,
    total: modules.length,
    state: modules.length === 0 ? "unknown" : fresh === modules.length ? "healthy" : "warning",
    missing: modules.filter((module) => module.state !== "FRESH"),
  };
}
