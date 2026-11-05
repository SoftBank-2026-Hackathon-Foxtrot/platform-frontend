import { QueryClient } from "@tanstack/react-query";

import { shouldRetryQuery } from "@/shared/api";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: shouldRetryQuery,
      refetchOnWindowFocus: false,
    },
    mutations: { retry: false },
  },
});
