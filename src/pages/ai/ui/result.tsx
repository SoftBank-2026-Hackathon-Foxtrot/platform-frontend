import { t } from "@/shared/lib/i18n";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { Badge } from "@/shared/ui/badge";
import { aiErrorMessage, type Analysis } from "../api/ai";

export function ErrorNotice({ error }: { error: Error | null }) {
  return error ? (
    <Alert variant="destructive">
      <AlertTitle>{t("AI 요청 실패")}</AlertTitle>
      <AlertDescription>{aiErrorMessage(error)}</AlertDescription>
    </Alert>
  ) : null;
}
export function Warnings({ values }: { values: string[] }) {
  return values.length ? (
    <ul className="space-y-1 text-xs text-muted-foreground">
      {values.map((warning, index) => (
        <li key={index} className="whitespace-pre-wrap break-words">
          {warning}
        </li>
      ))}
    </ul>
  ) : null;
}
const statuses: Record<string, string> = {
  COMPLETED: "응답 완료",
  PARTIAL: "일부 지표 누락",
  INSUFFICIENT_DATA: "관측 자료 부족",
  CONSTRAINT_LIMIT: "허용 사양 초과",
};
export function ResultStatus({ status }: { status: string }) {
  return <Badge variant="outline">{t(statuses[status] ?? status)}</Badge>;
}
export const metricNames: Record<string, { label: string; unit: string }> = {
  cpuP95Percent: { label: "CPU 사용률 P95", unit: "%" },
  memoryPeakMiB: { label: "관측 메모리 최대값", unit: "MiB" },
  requestP95Ms: { label: "응답 시간 P95", unit: "ms" },
  requestRatePerSecond: { label: "초당 요청 수", unit: "req/s" },
  databaseP95Ms: { label: "DB 호출 P95", unit: "ms" },
  redisP95Ms: { label: "Redis 호출 P95", unit: "ms" },
  errorRatePercent: { label: "서버 오류율", unit: "%" },
};
export function Metrics({ analysis }: { analysis: Analysis }) {
  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-border">
      {Object.entries(metricNames).map(([key, { label, unit }]) => {
        const value = analysis.metrics[key];
        return (
          <div key={key} className="space-y-2 bg-card px-3 py-3">
            <dt className="text-xs text-muted-foreground">{t(label)}</dt>
            <dd className="font-mono text-sm tabular-nums">
              {value == null ? t("자료 없음") : `${Number(value.toFixed(2))} ${unit}`}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
