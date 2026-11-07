import { QueryClientProvider } from "@tanstack/react-query";

import { MigrationPage } from "@/pages/migration-detail";

import { queryClient } from "./config/query-client";

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MigrationPage />
    </QueryClientProvider>
  );
}
