import { t, useLocale } from "@/shared/lib/i18n";
import { Badge } from "@/shared/ui/badge";
export const STAGE_LABELS: Record<string, string> = {
  PREPARE: "대상 환경 준비",
  SYNC: "데이터 동기화",
  OBJECT_CUTOVER: "객체 저장소 전환",
  CANARY: "카나리 트래픽",
  REDIS_CUTOVER: "Redis 전환",
  DATABASE_CUTOVER: "데이터베이스 전환",
  TRAFFIC: "트래픽 전환",
  FINALIZE: "마무리",
};
const STATUS: Record<
  string,
  {
    label: string;
    tone: "ok" | "run" | "wait" | "bad" | "idle";
  }
> = {
  PLANNED: { label: "승인 대기", tone: "wait" },
  WAITING_APPROVAL: { label: "승인 대기", tone: "wait" },
  RUNNING: { label: "진행 중", tone: "run" },
  CUTOVER_COMPLETE: { label: "전환 완료 · 정리 대기", tone: "wait" },
  HALTED: { label: "멈춤", tone: "bad" },
  ROLLING_BACK: { label: "되돌리는 중", tone: "wait" },
  ABORTING: { label: "취소 중", tone: "wait" },
  COMPLETED: { label: "완료", tone: "ok" },
  ABORTED: { label: "취소됨", tone: "idle" },
  ROLLED_BACK: { label: "원본 복귀 완료", tone: "idle" },
};
const TONES = {
  ok: "border-success/40 bg-success/15 text-success",
  run: "border-info/40 bg-info/15 text-info",
  wait: "border-warning/40 bg-warning/15 text-warning",
  bad: "border-destructive/40 bg-destructive/15 text-destructive",
  idle: "",
};
export function WorkflowStatusBadge({ status }: { status: string }) {
  useLocale();
  const spec = STATUS[status] ?? { label: status, tone: "idle" as const };
  return (
    <Badge variant="outline" className={TONES[spec.tone]}>
      {spec.tone === "run" && (
        <span className="mr-0.5 size-1.5 animate-pulse rounded-full bg-current" aria-hidden />
      )}
      {t(spec.label)}
    </Badge>
  );
}
