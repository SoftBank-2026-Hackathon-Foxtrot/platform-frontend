import { lazy, Suspense } from "react";
import { QueryClientProvider } from "@tanstack/react-query";

import { MigrationPage } from "@/pages/migration-detail";

import { queryClient } from "./config/query-client";

const SecurityPage = lazy(() =>
  import("@/pages/migration-security").then((module) => ({
    default: module.MigrationSecurityPage,
  })),
);

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense
        fallback={
          <p role="status" className="p-6">
            화면 불러오는 중
          </p>
        }
      >
        {/^\/security\/?$/.test(window.location.pathname) ? <SecurityPage /> : <MigrationPage />}
      </Suspense>
    </QueryClientProvider>
  );
}
