import { t, useLocale, localeTag } from "@/shared/lib/i18n";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { Archive, CheckCircle2, ChevronLeft, Link2, ShieldCheck, XCircle } from "lucide-react";
import {
  type ManagedApplication,
  type Verification,
  appAuditOptions,
  archiveManagedApplication,
  connectManagedResources,
  managedApplicationOptions,
  managedKeys,
  managedStatus,
  migrationDirection,
  saveManagedPolicy,
  verifyManagedApplication,
} from "@/entities/application";
import { sessionOptions } from "@/entities/session";
import { ApplicationForm } from "@/features/save-application";
import { StartMigration } from "@/features/start-migration";
import { getApiErrorMessage } from "@/shared/api";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/ui/alert-dialog";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Checkbox } from "@/shared/ui/checkbox";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
export function ApplicationDetailPage({ id }: { id: string }) {
  useLocale();
  const session = useQuery(sessionOptions());
  const workspace = session.data?.workspaceId ?? "";
  const app = useQuery({
    ...managedApplicationOptions(workspace, id),
    enabled: Boolean(workspace),
  });
  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-8">
      <Link
        to="/applications"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        {t(" 애플리케이션 목록")}
      </Link>
      {app.isPending && <p role="status">{t("앱 정보를 불러오는 중입니다.")}</p>}
      {app.error && (
        <Alert variant="destructive">
          <AlertTitle>{t("앱 정보를 불러오지 못했습니다")}</AlertTitle>
          <AlertDescription>{getApiErrorMessage(app.error)}</AlertDescription>
        </Alert>
      )}
      {app.data && <Detail app={app.data} workspace={workspace} />}
    </main>
  );
}
function useAppMutation<T>(workspace: string, run: (key: string) => Promise<T>) {
  const queryClient = useQueryClient();
  const [key, setKey] = useState(() => crypto.randomUUID());
  return useMutation({
    mutationFn: () => run(key),
    onSuccess: async () => {
      setKey(crypto.randomUUID());
      await queryClient.invalidateQueries({ queryKey: managedKeys.all(workspace) });
    },
  });
}
function Detail({ app, workspace }: { app: ManagedApplication; workspace: string }) {
  useLocale();
  const navigate = useNavigate();
  const connect = useAppMutation(workspace, (key) => connectManagedResources(app, key));
  const verify = useAppMutation(workspace, (key) => verifyManagedApplication(app, key));
  const archive = useAppMutation(workspace, (key) => archiveManagedApplication(app, key));
  const direction = migrationDirection(app);
  const environments = app.configuration ? Object.keys(app.configuration.environments) : [];
  const archived = app.status === "ARCHIVED";
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <CardTitle className="flex flex-wrap items-center gap-2 text-2xl">
                {app.name}
                <Badge variant="outline">{t(managedStatus[app.status])}</Badge>
                <span className="text-sm font-normal text-muted-foreground">v{app.version}</span>
              </CardTitle>
              <CardDescription className="font-mono text-xs break-all">
                {app.id} · {app.image.imageRef}
              </CardDescription>
            </div>
            {!archived && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" disabled={archive.isPending}>
                    <Archive />
                    {t("등록 해제")}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {app.name}
                      {t(" 등록 해제")}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {t("더 이상 이 앱으로 마이그레이션을 만들 수 없습니다. 기록은 남습니다.")}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t("닫기")}</AlertDialogCancel>
                    <AlertDialogAction
                      variant="destructive"
                      onClick={() =>
                        archive.mutate(undefined, {
                          onSuccess: () => void navigate({ to: "/applications" }),
                        })
                      }
                    >
                      {t("등록 해제")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <ol className="grid gap-3 sm:grid-cols-3">
            <Step done label={t("1. 이미지 등록")} />
            <Step done={Boolean(app.configuration)} label={t("2. 리소스 연결")} />
            <Step done={app.status === "VERIFIED"} label={t("3. 이전 준비 검증")} />
          </ol>
          {archive.error && <ErrorAlert title={t("등록 해제 실패")} error={archive.error} />}
        </CardContent>
      </Card>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="size-4" />
              {t(" 리소스 연결")}
            </CardTitle>
            <CardDescription>
              {t("서버가 승인한 카탈로그(DB·Redis·객체 저장소와 환경)를 이 앱에 연결합니다.")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {app.configuration ? (
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">scope</dt>
                  <dd className="font-mono text-xs">{app.configuration.scope}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">{t("환경")}</dt>
                  <dd>{environments.join(", ")}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">{t("방향")}</dt>
                  <dd>{direction ? `${direction[0]} → ${direction[1]}` : t("미확인")}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">{t("리소스")}</dt>
                  <dd>{Object.keys(app.configuration.resources).join(", ")}</dd>
                </div>
              </dl>
            ) : (
              <p className="text-sm text-muted-foreground">{t("아직 연결된 리소스가 없습니다.")}</p>
            )}
            <Button
              variant="outline"
              disabled={archived || connect.isPending}
              onClick={() => connect.mutate()}
            >
              <Link2 />
              {app.configuration ? t("카탈로그로 다시 연결") : t("카탈로그 리소스 연결")}
            </Button>
            {connect.error && <ErrorAlert title={t("연결 실패")} error={connect.error} />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="size-4" />
              {t(" 이전 준비 검증")}
            </CardTitle>
            <CardDescription>
              {t("연결한 리소스와 정책으로 실제 이전이 가능한지 서버가 확인합니다.")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              disabled={archived || !app.configuration || verify.isPending}
              onClick={() => verify.mutate()}
            >
              <ShieldCheck />
              {verify.isPending ? t("검증 중") : t("검증 실행")}
            </Button>
            {!app.configuration && (
              <p className="text-sm text-muted-foreground">{t("리소스를 먼저 연결하십시오.")}</p>
            )}
            {verify.data && <VerificationResult result={verify.data} />}
            {verify.error && <ErrorAlert title={t("검증 요청 실패")} error={verify.error} />}
          </CardContent>
        </Card>

        <PolicyCard app={app} workspace={workspace} direction={direction} />

        <Card>
          <CardHeader>
            <CardTitle>{t("마이그레이션 시작")}</CardTitle>
            <CardDescription>{t("검증을 통과한 앱만 계획을 만들 수 있습니다.")}</CardDescription>
          </CardHeader>
          <CardContent>
            {direction ? (
              <StartMigration
                applicationId={app.id}
                environments={environments}
                direction={direction}
                disabledReason={
                  app.status === "VERIFIED"
                    ? undefined
                    : t("먼저 이전 준비 검증을 통과해야 합니다.")
                }
              />
            ) : (
              <p className="text-sm text-muted-foreground">{t("리소스를 먼저 연결하십시오.")}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("앱 변경")}</CardTitle>
          <CardDescription>
            {t("이미지나 실행 자원을 바꾸면 다시 검증해야 합니다.")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!archived && <ApplicationForm key={app.version} current={app} />}
        </CardContent>
      </Card>

      <Audit workspace={workspace} id={app.id} />
    </div>
  );
}
function Step({ done, label }: { done: boolean; label: string }) {
  useLocale();
  return (
    <li
      className={`flex items-center gap-2 rounded-lg border p-3 text-sm ${done ? "border-success/40 bg-success/10" : ""}`}
    >
      {done ? (
        <CheckCircle2 className="size-4 text-success" />
      ) : (
        <span className="size-4 rounded-full border-2" />
      )}
      {t(label)}
    </li>
  );
}
function VerificationResult({ result }: { result: Verification }) {
  useLocale();
  return (
    <div className="space-y-2 rounded-lg border p-3 text-sm">
      <p className={`font-medium ${result.passed ? "text-success" : "text-destructive"}`}>
        {result.passed ? t("검증 통과") : t("검증 실패")} · v{result.version}
      </p>
      <ul className="space-y-1">
        {Object.entries(result.checks).map(([name, ok]) => (
          <li key={name} className="flex items-center gap-2">
            {ok ? (
              <CheckCircle2 className="size-3.5 text-success" />
            ) : (
              <XCircle className="size-3.5 text-destructive" />
            )}
            <span className="font-mono text-xs">{name}</span>
          </li>
        ))}
      </ul>
      {result.blockers.length > 0 && (
        <p className="text-xs text-destructive">
          {t("막는 항목: ")}
          {result.blockers.join(", ")}
        </p>
      )}
    </div>
  );
}
function PolicyCard({
  app,
  workspace,
  direction,
}: {
  app: ManagedApplication;
  workspace: string;
  direction: [string, string] | null;
}) {
  useLocale();
  const route = direction ? `${direction[0]}->${direction[1]}` : null;
  const [allowed, setAllowed] = useState(
    route ? app.policy.allowedDirections.includes(route) : false,
  );
  const [quiesce, setQuiesce] = useState(String(app.policy.maxQuiesceSeconds));
  const seconds = Number(quiesce);
  const valid = Number.isInteger(seconds) && seconds >= 1 && seconds <= 300;
  const save = useAppMutation(workspace, (key) =>
    saveManagedPolicy(
      app,
      {
        ...app.policy,
        allowedDirections: allowed && route ? [route] : [],
        maxQuiesceSeconds: seconds,
      },
      key,
    ),
  );
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("이전 정책")}</CardTitle>
        <CardDescription>
          {t("허용 방향과 쓰기 정지 최대 시간입니다. 대상 쓰기 후 되돌리기는 허용하지 않습니다.")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {route ? (
          <div className="flex items-center gap-2">
            <Checkbox
              id="policy-direction"
              checked={allowed}
              onCheckedChange={(next) => setAllowed(next === true)}
            />
            <Label htmlFor="policy-direction">
              {direction?.[0]} → {direction?.[1]}
              {t(" 방향 명시적으로 허용")}
            </Label>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {t("리소스를 연결하면 방향을 정할 수 있습니다.")}
          </p>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="policy-quiesce">{t("최대 쓰기 정지 (초, 1–300)")}</Label>
          <Input
            id="policy-quiesce"
            type="number"
            className="w-32"
            value={quiesce}
            onChange={(event) => setQuiesce(event.target.value)}
          />
        </div>
        <Button
          variant="outline"
          disabled={!route || !valid || save.isPending || app.status === "ARCHIVED"}
          onClick={() => save.mutate()}
        >
          {t("정책 저장")}
        </Button>
        <p className="text-xs text-muted-foreground">
          {t("정책을 저장하면 다시 검증해야 합니다.")}
        </p>
        {save.error && <ErrorAlert title={t("정책 저장 실패")} error={save.error} />}
      </CardContent>
    </Card>
  );
}
function Audit({ workspace, id }: { workspace: string; id: string }) {
  useLocale();
  const [cursor, setCursor] = useState<string | null>(null);
  const audit = useQuery({
    ...appAuditOptions(workspace, id, cursor),
    enabled: Boolean(workspace),
  });
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("변경 기록")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {audit.isPending && <p role="status">{t("기록을 불러오는 중입니다.")}</p>}
        {audit.error && <ErrorAlert title={t("기록을 불러오지 못했습니다")} error={audit.error} />}
        <ol className="space-y-2">
          {audit.data?.events.map((event, index) => (
            <li key={`${event.at}-${index}`} className="text-sm">
              <span className="font-medium">{event.type}</span>
              <span className="ml-2 text-xs text-muted-foreground">
                {new Date(event.at).toLocaleString(localeTag(), { hour12: false })}
                {event.actor ? ` · ${event.actor}` : ""}
              </span>
            </li>
          ))}
        </ol>
        {audit.data?.events.length === 0 && (
          <p className="text-sm text-muted-foreground">{t("기록이 없습니다.")}</p>
        )}
        <Button
          variant="outline"
          size="sm"
          disabled={!audit.data?.nextCursor}
          onClick={() => setCursor(audit.data?.nextCursor ?? null)}
        >
          {t("다음 기록")}
        </Button>
      </CardContent>
    </Card>
  );
}
function ErrorAlert({ title, error }: { title: string; error: Error }) {
  useLocale();
  return (
    <Alert variant="destructive">
      <AlertTitle>{t(title)}</AlertTitle>
      <AlertDescription>{getApiErrorMessage(error)}</AlertDescription>
    </Alert>
  );
}
