import { t, useLocale } from "@/shared/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import {
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
  useRouterState,
} from "@tanstack/react-router";
import { z } from "zod";
import { sessionOptions } from "@/entities/session";
import { ApplicationDetailPage } from "@/pages/application-detail";
import { ApplicationsPage } from "@/pages/applications";
import { LoginPage } from "@/pages/login";
import { MigrationPage } from "@/pages/migration-detail";
import { MigrationsPage } from "@/pages/migrations";
import { SettingsPage } from "@/pages/settings";
import { getApiErrorMessage } from "@/shared/api";
import { PlatformShell } from "@/widgets/platform-shell";
/** The session decides between the login screen and the console; pages assume a session. */
function Root() {
  useLocale();
  const session = useQuery(sessionOptions());
  const location = useRouterState({ select: (state) => state.location });
  if (session.isPending) {
    return (
      <p role="status" className="grid min-h-dvh place-items-center text-muted-foreground">
        {t("로그인 상태를 확인하는 중입니다.")}
      </p>
    );
  }
  if (session.error) {
    return (
      <p role="alert" className="grid min-h-dvh place-items-center text-destructive">
        {getApiErrorMessage(session.error)}
      </p>
    );
  }
  if (!session.data || location.pathname === "/login") {
    const search = new URLSearchParams(location.searchStr);
    return (
      <LoginPage
        error={search.get("error") ?? undefined}
        returnTo={location.pathname === "/login" ? "/" : location.href}
      />
    );
  }
  return (
    <PlatformShell session={session.data}>
      <Outlet />
    </PlatformShell>
  );
}
const rootRoute = createRootRoute({ component: Root });
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({ to: "/applications" });
  },
});
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  validateSearch: z.object({ error: z.string().optional() }),
});
const applicationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/applications",
  component: ApplicationsPage,
});
const applicationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/applications/$id",
  component: function ApplicationRoute() {
    const { id } = applicationRoute.useParams();
    return <ApplicationDetailPage key={id} id={id} />;
  },
});
const migrationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/migrations",
  component: MigrationsPage,
});
const migrationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/migrations/$id",
  component: function MigrationRoute() {
    const { id } = migrationRoute.useParams();
    return <MigrationPage key={id} id={id} />;
  },
});
const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: SettingsPage,
});
export const router = createRouter({
  routeTree: rootRoute.addChildren([
    indexRoute,
    loginRoute,
    applicationsRoute,
    applicationRoute,
    migrationsRoute,
    migrationRoute,
    settingsRoute,
  ]),
});
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
