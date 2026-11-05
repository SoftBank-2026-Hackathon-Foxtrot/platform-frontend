import { QueryClientProvider } from "@tanstack/react-query";

import { OverviewPage } from "@/pages/overview";
import { TooltipProvider } from "@/shared/ui/tooltip";

import { queryClient } from "./config/query-client";

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <OverviewPage />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
