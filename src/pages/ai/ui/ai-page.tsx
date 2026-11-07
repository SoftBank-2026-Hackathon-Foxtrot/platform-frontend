import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bot, RefreshCw } from "lucide-react";
import { useSession } from "@/entities/session";
import { localeTag, t, useLocale } from "@/shared/lib/i18n";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { aiErrorMessage, canAnalyse, deploymentOptions, statusOptions } from "../api/ai";
import { AnalysisPanel } from "./analysis-panel";
import { ChatPanel } from "./chat-panel";
import { RecommendationPanel } from "./recommendation-panel";

export function AIPage() {
  useLocale();
  const session = useSession();
  const status = useQuery(statusOptions(session.workspaceId));
  const deployments = useQuery(deploymentOptions(session.workspaceId, Boolean(status.data)));
  const [selectedId, setSelectedId] = useState("");
  const values = deployments.data?.deployments ?? [];
  const selected =
    values.find((value) => value.environmentId === selectedId) ??
    values.find(canAnalyse) ??
    values[0];
  const enabled = status.data?.configured === true && !status.error && !deployments.error;
  const error = status.error ?? deployments.error;
  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <Bot className="size-6" />
            {t("AI 도우미")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("내 앱의 배포 정보와 사용량을 확인합니다.")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {status.data && <Badge variant="outline">{status.data.model}</Badge>}
          <Button
            variant="outline"
            size="sm"
            disabled={status.isFetching || deployments.isFetching}
            onClick={() => {
              void status.refetch();
              if (status.data) void deployments.refetch();
            }}
          >
            <RefreshCw className="size-3.5" />
            {t("다시 조회")}
          </Button>
        </div>
      </header>
      {error && (
        <Alert variant="destructive">
          <AlertTitle>{t("AI 정보를 불러오지 못했습니다")}</AlertTitle>
          <AlertDescription>{aiErrorMessage(error)}</AlertDescription>
        </Alert>
      )}
      {status.isPending && (
        <p role="status" className="text-sm text-muted-foreground">
          {t("AI 설정을 확인하는 중입니다.")}
        </p>
      )}
      {status.data && !status.data.configured && (
        <Alert>
          <AlertTitle>{t("AI 모델 설정 필요")}</AlertTitle>
          <AlertDescription>
            {t("서버에 AI 모델 인증 정보가 설정되지 않았습니다. 관리자에게 설정을 요청하세요.")}
          </AlertDescription>
        </Alert>
      )}
      {status.data && (
        <section aria-labelledby="ai-deployment-title" className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 id="ai-deployment-title" className="text-sm font-medium">
              {t("분석할 앱 배포")}
            </h2>
            <span className="text-xs text-muted-foreground">
              {t("플랫폼 관리 서비스는 조회 대상에서 제외됩니다.")}
            </span>
          </div>
          {deployments.isPending && (
            <p role="status" className="text-sm text-muted-foreground">
              {t("배포 목록을 불러오는 중입니다.")}
            </p>
          )}
          {!deployments.isPending && !deployments.error && !values.length && (
            <Card>
              <CardContent className="space-y-2 py-8 text-center">
                <p className="font-medium">{t("분석할 앱 배포가 없습니다.")}</p>
                <p className="text-sm text-muted-foreground">
                  {t("본인 앱의 배포 적용이 완료된 뒤 이 목록에서 선택할 수 있습니다.")}
                </p>
              </CardContent>
            </Card>
          )}
          <div
            role="group"
            aria-label={t("분석할 앱 배포")}
            className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3"
          >
            {values.map((deployment) => (
              <Button
                key={deployment.environmentId}
                variant={
                  selected?.environmentId === deployment.environmentId ? "secondary" : "outline"
                }
                aria-pressed={selected?.environmentId === deployment.environmentId}
                className="h-auto justify-start px-4 py-3 text-left"
                onClick={() => setSelectedId(deployment.environmentId)}
              >
                <span className="min-w-0 space-y-1">
                  <span className="block">
                    {deployment.applicationId}{" "}
                    <span className="ml-2 font-mono text-xs">
                      {deployment.environment.toUpperCase()}
                    </span>
                  </span>
                  <span className="block truncate font-mono text-xs text-muted-foreground">
                    {deployment.environmentId}
                  </span>
                  <span className="block text-xs font-normal text-muted-foreground">
                    {deployment.appliedAt
                      ? new Date(deployment.appliedAt).toLocaleString(localeTag())
                      : t("적용 시각 없음")}{" "}
                    · {deployment.status}
                  </span>
                </span>
              </Button>
            ))}
          </div>
        </section>
      )}
      {selected && (
        <div key={`${session.workspaceId}:${selected.environmentId}`} className="space-y-4">
          {!canAnalyse(selected) && (
            <Alert>
              <AlertTitle>{t("배포 상태 확인 필요")}</AlertTitle>
              <AlertDescription>
                {t("배포 변경이 진행 중이거나 결과가 불명확하여 분석과 추천을 중지했습니다.")}
              </AlertDescription>
            </Alert>
          )}
          <div className="grid items-start gap-6 xl:grid-cols-2">
            <ChatPanel deployment={selected} workspace={session.workspaceId} enabled={enabled} />
            <div className="space-y-6">
              <AnalysisPanel deployment={selected} enabled={enabled && canAnalyse(selected)} />
              <RecommendationPanel
                deployment={selected}
                enabled={enabled && canAnalyse(selected)}
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
