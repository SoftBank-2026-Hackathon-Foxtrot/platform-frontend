import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";

import { apiClient } from "@/shared/api";

import { type ManagedApplication, managedApplicationSchema, managedKeys } from "./managed-api";

/**
 * `/v1/applications` answers two shapes. The shared release backend lists only its seed
 * application; the personal-workspace backend lists registered applications and, for the
 * seed owner, the seed application too. The console shows both.
 */
export const seedApplicationSchema = z.object({
  id: z.string(),
  scope: z.string(),
  environments: z.array(
    z.object({
      name: z.string(),
      trafficPool: z.string(),
      actors: z.record(z.string(), z.number()),
    }),
  ),
  resources: z.array(z.string()),
});
export type SeedApplication = z.infer<typeof seedApplicationSchema>;

export type ConsoleApplications = { seed: SeedApplication[]; managed: ManagedApplication[] };

export function parseConsoleApplications(raw: unknown): ConsoleApplications {
  const rows = z.array(z.unknown()).parse(raw);
  const result: ConsoleApplications = { seed: [], managed: [] };
  for (const row of rows) {
    const seed = seedApplicationSchema.safeParse(row);
    if (seed.success) result.seed.push(seed.data);
    else result.managed.push(managedApplicationSchema.parse(row));
  }
  return result;
}

export const consoleApplicationsOptions = (workspace: string) =>
  queryOptions({
    queryKey: [...managedKeys.all(workspace), "console"],
    queryFn: async ({ signal }) =>
      parseConsoleApplications((await apiClient.get("/v1/applications", { signal })).data),
    refetchInterval: 5000,
  });
