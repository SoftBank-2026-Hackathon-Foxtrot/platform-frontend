import { useState } from "react";
import { Activity, LoaderCircle } from "lucide-react";
import { localeTag, t } from "@/shared/lib/i18n";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { analyse, type Deployment } from "../api/ai";
import { useAiMutation } from "../model/mutation";
import { ErrorNotice, Metrics, ResultStatus, metricNames } from "./result";

const periods = [
  { minutes: 15, label: "최근 15분" },
  { minutes: 60, label: "최근 1시간" },
  { minutes: 1440, label: "최근 24시간" },
];
export function AnalysisPanel({
  deployment,
  enabled,
}: {
  deployment: Deployment;
  enabled: boolean;
}) {
  const [minutes, setMinutes] = useState(60);
  const mutation = useAiMutation(analyse);
  const result = mutation.data;
  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="size-4" />
          {t("운영 지표 분석")}
        </CardTitle>
        <CardDescription>
          {t("CPU·메모리와 요청 성능을 조회하고 근거와 함께 해석합니다.")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div role="group" aria-label={t("분석 기간")} className="flex flex-wrap gap-1">
            {periods.map((period) => (
              <Button
                key={period.minutes}
                variant={minutes === period.minutes ? "secondary" : "ghost"}
                size="sm"
                aria-pressed={minutes === period.minutes}
                disabled={mutation.isPending}
                onClick={() => setMinutes(period.minutes)}
              >
                {t(period.label)}
              </Button>
            ))}
          </div>
          <Button
            disabled={!enabled || mutation.isPending}
            onClick={() => {
              const end = new Date();
              mutation.submit({
                applicationId: deployment.applicationId,
                deploymentId: deployment.environmentId,
                timeRange: {
                  start: new Date(end.getTime() - minutes * 60000).toISOString(),
                  end: end.toISOString(),
                },
                focus: ["RESOURCES", "PERFORMANCE", "ERRORS"],
              });
            }}
          >
            {mutation.isPending && (
              <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" />
            )}
            {t(mutation.isPending ? "분석 중…" : "지표 분석")}
          </Button>
        </div>
        <ErrorNotice error={mutation.error} />
        {result ? (
          <div className="space-y-4" aria-live="polite">
            <div className="flex flex-wrap items-center gap-2">
              <ResultStatus status={result.status} />
              <span className="text-xs text-muted-foreground">
                {t("지표 종류 확보율 {0}%", [result.dataQuality.coveragePercent])}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {new Date(result.timeRange.start).toLocaleString(localeTag())} —{" "}
              {new Date(result.timeRange.end).toLocaleString(localeTag())}
            </p>
            <p className="whitespace-pre-wrap text-sm leading-6 break-words">{result.summary}</p>
            <Metrics analysis={result} />
            {result.dataQuality.missingMetrics.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {t("누락 지표: {0}", [
                  result.dataQuality.missingMetrics
                    .map((key) => t(metricNames[key]?.label ?? key))
                    .join(", "),
                ])}
              </p>
            )}
            {result.findings.length > 0 && (
              <ul className="space-y-3">
                {result.findings.map((finding, index) => (
                  <li key={index} className="space-y-1 border-l-2 pl-3 text-sm">
                    <p className="whitespace-pre-wrap break-words">{finding.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {t("근거")}:{" "}
                      {finding.evidenceKeys
                        .map((key) => t(metricNames[key.replace(/^metrics\./, "")]?.label ?? key))
                        .join(", ")}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <p className="text-xs text-muted-foreground">
              {t("CPU는 분 단위 집계의 P95이며, 메모리는 관측한 최대값입니다.")}
            </p>
            {result.traces.length > 0 && (
              <details className="text-xs text-muted-foreground">
                <summary className="cursor-pointer">
                  {t("관련 요청 추적 {0}개", [result.traces.length])}
                </summary>
                <ul className="mt-2 space-y-1">
                  {result.traces.map((trace) => (
                    <li key={trace.traceID} className="font-mono break-all">
                      {trace.traceID} · {trace.durationMs} ms
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        ) : (
          <p className="py-4 text-sm text-muted-foreground">
            {t("분석할 기간을 선택하고 지표 분석을 실행하세요.")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
