import { t, useLocale, localeTag } from "@/shared/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { Boxes, ChevronRight, PackagePlus, Server } from "lucide-react";
import {
  type ManagedApplication,
  type SeedApplication,
  consoleApplicationsOptions,
  managedStatus,
} from "@/entities/application";
import { workflowsOptions } from "@/entities/migration";
import { sessionOptions } from "@/entities/session";
import { ApplicationForm } from "@/features/save-application";
import { StartMigration } from "@/features/start-migration";
import { getApiErrorMessage } from "@/shared/api";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
const RESOURCE_NAMES: Record<string, string> = {
  DATABASE: "데이터베이스",
  REDIS: "Redis",
  OBJECT_STORAGE: "객체 저장소",
};
export function ApplicationsPage() {
  useLocale();
  const session = useQuery(sessionOptions());
  const navigate = useNavigate();
  const workspace = session.data?.workspaceId;
  const apps = useQuery({
    ...consoleApplicationsOptions(workspace ?? ""),
    enabled: Boolean(workspace),
  });
  const workflows = useQuery({ ...workflowsOptions(workspace ?? ""), enabled: Boolean(workspace) });
  // The backend refuses app changes while any migration is unfinished; say so before it does.
  const active = workflows.data?.find((w) => w.status !== "COMPLETED" && w.status !== "ABORTED");
  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{t("애플리케이션")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("이전할 앱을 등록하고 리소스를 연결해 검증한 뒤 마이그레이션을 시작합니다.")}
        </p>
      </header>
      {apps.isPending && <p role="status">{t("앱 목록을 불러오는 중입니다.")}</p>}
      {apps.error && (
        <Alert variant="destructive">
          <AlertTitle>{t("앱 목록을 불러오지 못했습니다")}</AlertTitle>
          <AlertDescription>{getApiErrorMessage(apps.error)}</AlertDescription>
        </Alert>
      )}
      {apps.data && (
        <div className="grid items-start gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-6">
            {apps.data.seed.map((app) => (
              <SeedApp key={app.id} app={app} />
            ))}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Boxes className="size-4" />
                  {t(" 등록한 앱")}
                </CardTitle>
                <CardDescription>{t("내 workspace에 등록한 앱입니다.")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {apps.data.managed.length === 0 && (
                  <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                    {t("아직 등록한 앱이 없습니다. 오른쪽에서 이미지로 등록하십시오.")}
                  </p>
                )}
                {apps.data.managed.map((app) => (
                  <ManagedRow key={app.id} app={app} />
                ))}
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PackagePlus className="size-4" />
                {t(" 새 앱 등록")}
              </CardTitle>
              <CardDescription>
                {t("digest로 고정한 컨테이너 이미지만 받습니다. 태그(:latest)는 거절됩니다.")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {active && (
                <Alert>
                  <AlertTitle>{t("진행 중인 마이그레이션이 있습니다")}</AlertTitle>
                  <AlertDescription>
                    {t("마이그레이션이 끝나거나 취소될 때까지 앱을 등록·수정할 수 없습니다.")}{" "}
                    <Link
                      to="/migrations/$id"
                      params={{ id: active.id }}
                      className="underline underline-offset-4"
                    >
                      {active.id}
                      {t(" 보기")}
                    </Link>
                  </AlertDescription>
                </Alert>
              )}
              <ApplicationForm
                onSaved={(app) =>
                  void navigate({ to: "/applications/$id", params: { id: app.id } })
                }
              />
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  );
}
function SeedApp({ app }: { app: SeedApplication }) {
  useLocale();
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Server className="size-4" /> {app.id}
            </CardTitle>
            <CardDescription className="font-mono text-xs">{app.scope}</CardDescription>
          </div>
          <div className="flex flex-wrap gap-1">
            <Badge variant="outline">{t("시드 구성")}</Badge>
            {app.resources.map((kind) => (
              <Badge key={kind} variant="secondary">
                {t(RESOURCE_NAMES[kind] ?? kind)}
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          {app.environments.map((env) => (
            <div key={env.name} className="rounded-lg bg-muted/50 p-3 text-sm">
              <p className="font-medium">
                {env.name}{" "}
                <span className="text-xs text-muted-foreground">
                  {t("· 트래픽 풀 ")}
                  {env.trafficPool}
                </span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {Object.entries(env.actors)
                  .map(([actor, count]) => `${actor} ×${count}`)
                  .join(" · ")}
              </p>
            </div>
          ))}
        </div>
        <StartMigration environments={app.environments.map((env) => env.name)} />
      </CardContent>
    </Card>
  );
}
function ManagedRow({ app }: { app: ManagedApplication }) {
  useLocale();
  const tone =
    app.status === "VERIFIED"
      ? "border-success/40 bg-success/15 text-success"
      : app.status === "ARCHIVED"
        ? ""
        : "border-warning/40 bg-warning/15 text-warning";
  return (
    <Link
      to="/applications/$id"
      params={{ id: app.id }}
      className="group flex items-center gap-4 rounded-xl border p-4 transition-colors hover:bg-muted/50"
    >
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{app.name}</span>
          <Badge variant="outline" className={tone}>
            {t(managedStatus[app.status])}
          </Badge>
          <span className="text-xs text-muted-foreground">v{app.version}</span>
        </div>
        <p className="truncate font-mono text-xs text-muted-foreground">{app.image.imageRef}</p>
        <p className="text-xs text-muted-foreground">
          {app.configuration ? t("리소스 연결됨") : t("리소스 미연결")}
          {app.verifiedAt
            ? t(" · 검증 {0}", [new Date(app.verifiedAt).toLocaleString(localeTag())])
            : ""}
        </p>
      </div>
      <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
