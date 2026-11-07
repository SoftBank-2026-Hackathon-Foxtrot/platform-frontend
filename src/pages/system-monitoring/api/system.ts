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
const hostsSchema = z.object({
  state,
  hosts: z.array(z.object({ name: z.string(), lastSeen: z.number(), stale: z.boolean() })),
});
export type Series = z.infer<typeof seriesSchema>;
export const systemKey = (workspace: string, app: string) => ["system-metrics", workspace, app];
export function hostsOptions(workspace: string, app: string, environment: string) {
  return queryOptions({
    queryKey: [...systemKey(workspace, app), "hosts", environment],
    queryFn: async ({ signal }) =>
      hostsSchema.parse(
        (
          await apiClient.get(`/v1/applications/${encodeURIComponent(app)}/system-metrics/hosts`, {
            signal,
            params: { environment },
          })
        ).data,
      ),
    refetchInterval: 15_000,
  });
}
export function seriesOptions(workspace: string, search: SystemSearch) {
  const params = {
    environment: search.env,
    host: search.host,
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
    enabled: Boolean(search.app && search.env && search.host),
  });
}
