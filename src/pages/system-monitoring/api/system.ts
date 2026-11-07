import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { apiClient } from "@/shared/api";
import type { SystemSearch } from "../model/system";
const state = z.enum(["OK", "NOT_CONFIGURED", "UNAVAILABLE"]);
export const seriesSchema = z.object({
  from: z.number(),
  to: z.number(),
  step: z.number().positive(),
  series: z.array(
    z.object({
      id: z.string(),
      unit: z.string(),
      state,
      points: z.array(z.tuple([z.number(), z.number().nullable()])),
    }),
  ),
});
const instancesSchema = z.object({
  state,
  instances: z.array(
    z.object({
      id: z.string(),
      role: z.string(),
      networkScope: z.enum(["container", "app-instance"]),
      lastSeen: z.number(),
      stale: z.boolean(),
    }),
  ),
});
const deploymentsSchema = z.object({
  state,
  environments: z.array(
    z.object({
      environmentId: z.string(),
      deploymentId: z.string(),
      cloud: z.string(),
      status: z.string(),
      access: z.enum(["personal", "shared"]).default("personal"),
    }),
  ),
});
export function deploymentsOptions(workspace: string, app: string) {
  return queryOptions({
    queryKey: ["system-live-deployments", workspace, app],
    queryFn: async ({ signal }) =>
      deploymentsSchema.parse(
        (
          await apiClient.get(
            `/v1/applications/${encodeURIComponent(app)}/system-metrics/deployments`,
            { signal },
          )
        ).data,
      ),
    enabled: Boolean(app),
    refetchInterval: 15000,
  });
}
export type Series = z.infer<typeof seriesSchema>;
export const systemKey = (workspace: string, app: string) => ["system-metrics", workspace, app];
export function instancesOptions(workspace: string, app: string, deployment: string) {
  return queryOptions({
    queryKey: [...systemKey(workspace, app), "instances", deployment],
    queryFn: async ({ signal }) =>
      instancesSchema.parse(
        (
          await apiClient.get(
            `/v1/applications/${encodeURIComponent(app)}/system-metrics/instances`,
            { signal, params: { deployment } },
          )
        ).data,
      ),
    refetchInterval: 15000,
    enabled: Boolean(app && deployment),
  });
}
export function seriesOptions(workspace: string, search: SystemSearch) {
  const params = {
    deployment: search.deployment,
    instance: search.instance,
    category: search.category,
    minutes: search.minutes,
  };
  return queryOptions({
    queryKey: [...systemKey(workspace, search.app ?? ""), "series", params],
    queryFn: async ({ signal }) =>
      seriesSchema.parse(
        (
          await apiClient.get(
            `/v1/applications/${encodeURIComponent(search.app ?? "")}/system-metrics`,
            { signal, params },
          )
        ).data,
      ),
    refetchInterval: 15_000,
    enabled: Boolean(search.app && search.deployment && search.instance),
  });
}
