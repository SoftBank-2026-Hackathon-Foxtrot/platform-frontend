import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity, MessageSquare, RefreshCw, SlidersHorizontal } from "lucide-react";
import { useSession } from "@/entities/session";
import { t, useLocale } from "@/shared/lib/i18n";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
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
  useEffect(() => {
    if (!selectedId && selected) setSelectedId(selected.environmentId);
  }, [selectedId, selected]);
  const enabled = status.data?.configured === true && !status.error && !deployments.error;
  const error = status.error ?? deployments.error;
  return (
    <section className="flex min-h-0 flex-1 flex-col" aria-label={t("앱 AI 도우미")}>
      <div className="shrink-0 space-y-3 px-4 pt-4 pb-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-muted-foreground">{t("분석할 앱 배포")}</span>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t("다시 조회")}
            disabled={status.isFetching || deployments.isFetching}
            onClick={() => {
              void status.refetch();
              if (status.data) void deployments.refetch();
            }}
          >
            <RefreshCw className="size-3.5" />
          </Button>
        </div>
        {selected && <p className="truncate text-sm font-medium">{selected.applicationId}</p>}
        <div role="group" aria-label={t("분석할 앱 배포")} className="flex flex-wrap gap-2">
          {values.map((deployment) => (
            <Button
              key={deployment.environmentId}
              variant={
                selected?.environmentId === deployment.environmentId ? "secondary" : "outline"
              }
              size="sm"
              aria-pressed={selected?.environmentId === deployment.environmentId}
              onClick={() => setSelectedId(deployment.environmentId)}
              className="h-8 min-w-0 gap-2"
            >
              <span
                className={
                  "size-1.5 rounded-full " +
                  (deployment.environment === "aws"
                    ? "bg-aws"
                    : deployment.environment === "gcp"
                      ? "bg-gcp"
                      : "bg-chart-2")
                }
              />
              {deployment.environment === "onprem"
                ? "On-prem"
                : deployment.environment.toUpperCase()}
              <span className="text-[10px] font-normal text-muted-foreground">
                {deployment.status}
              </span>
            </Button>
          ))}
        </div>
        {(status.isPending || deployments.isPending) && (
          <p role="status" className="text-xs text-muted-foreground">
            {t("AI 설정을 확인하는 중입니다.")}
          </p>
        )}
        {error && (
          <Alert variant="destructive">
            <AlertTitle>{t("AI 정보를 불러오지 못했습니다")}</AlertTitle>
            <AlertDescription>{aiErrorMessage(error)}</AlertDescription>
          </Alert>
        )}
        {status.data && !status.data.configured && (
          <Alert>
            <AlertTitle>{t("AI 모델 설정 필요")}</AlertTitle>
            <AlertDescription>
              {t("서버에 AI 모델 인증 정보가 설정되지 않았습니다. 관리자에게 설정을 요청하세요.")}
            </AlertDescription>
          </Alert>
        )}
        {!deployments.isPending && !deployments.error && !values.length && (
          <p className="py-4 text-sm text-muted-foreground">{t("분석할 앱 배포가 없습니다.")}</p>
        )}
      </div>
      {selected && (
        <Tabs
          key={session.workspaceId + ":" + selected.environmentId}
          defaultValue="chat"
          className="min-h-0 min-w-0 flex-1 gap-0"
        >
          <TabsList className="mx-4 mb-3 grid h-auto! min-h-9 w-auto min-w-0 shrink-0 grid-cols-3">
            <TabsTrigger value="chat" className="h-auto min-h-8 min-w-0 gap-1 px-2 text-xs">
              <MessageSquare className="size-3.5" />
              <span className="truncate">{t("채팅")}</span>
            </TabsTrigger>
            <TabsTrigger
              value="analysis"
              aria-label={t("지표 분석")}
              title={t("지표 분석")}
              className="h-auto min-h-8 min-w-0 gap-1 px-2 text-xs"
            >
              <Activity className="size-3.5" />
              <span className="truncate">{t("분석")}</span>
            </TabsTrigger>
            <TabsTrigger
              value="recommendation"
              aria-label={t("사양 추천")}
              title={t("사양 추천")}
              className="h-auto min-h-8 min-w-0 gap-1 px-2 text-xs"
            >
              <SlidersHorizontal className="size-3.5" />
              <span className="truncate">{t("추천")}</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="chat" forceMount className="min-h-0 data-[state=inactive]:hidden">
            <ChatPanel
              deployment={selected}
              workspace={session.workspaceId}
              enabled={enabled}
              inset
            />
          </TabsContent>
          <TabsContent
            value="analysis"
            forceMount
            className="min-h-0 overflow-y-auto px-4 pb-4 data-[state=inactive]:hidden"
          >
            <AnalysisPanel deployment={selected} enabled={enabled && canAnalyse(selected)} />
          </TabsContent>
          <TabsContent
            value="recommendation"
            forceMount
            className="min-h-0 overflow-y-auto px-4 pb-4 data-[state=inactive]:hidden"
          >
            <RecommendationPanel deployment={selected} enabled={enabled && canAnalyse(selected)} />
          </TabsContent>
        </Tabs>
      )}
    </section>
  );
}
