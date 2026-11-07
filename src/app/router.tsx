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
import { SecurityPage } from "@/pages/security";
import { SettingsPage } from "@/pages/settings";
import { getApiErrorMessage, isNotFound } from "@/shared/api";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
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
      <main className="grid min-h-dvh place-items-center bg-background px-4 text-foreground">
        <Card className="w-full max-w-lg" role="alert">
          <CardHeader>
            <CardTitle>{t("플랫폼 API 연결 실패")}</CardTitle>
            <CardDescription>
              {isNotFound(session.error)
                ? t("연결된 서버에 플랫폼 로그인 API가 없습니다. API 주소를 확인하십시오.")
                : getApiErrorMessage(session.error)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => void session.refetch()}>
              {t("다시 조회")}
            </Button>
          </CardContent>
        </Card>
      </main>
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
const securityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/security",
  component: SecurityPage,
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
    securityRoute,
  ]),
});
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
