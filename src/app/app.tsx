import { QueryClientProvider } from "@tanstack/react-query";

import { OverviewPage } from "@/pages/overview";

import { queryClient } from "./config/query-client";

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <OverviewPage />
    </QueryClientProvider>
  );
}
