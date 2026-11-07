import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";

import { apiBaseUrl, apiClient } from "@/shared/api";

const healthSchema = z.object({ status: z.literal("ok") });

export async function getPlatformHealth(signal?: AbortSignal) {
  const response = await apiClient.get<unknown>("/health", { signal });
  return healthSchema.parse(response.data);
}

export function healthQueryOptions() {
  return queryOptions({
    queryKey: ["platform-health", apiBaseUrl] as const,
    queryFn: ({ signal }) => getPlatformHealth(signal),
  });
}
