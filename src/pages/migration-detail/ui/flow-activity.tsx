import { Check, CirclePause, LoaderCircle, Radio, TriangleAlert } from "lucide-react";

import { STAGE_LABELS } from "@/entities/migration";
import { t, useLocale } from "@/shared/lib/i18n";
import { Badge } from "@/shared/ui/badge";

import type { Detail } from "../api/migrations";
import { isMoving, preparationFlow, trafficFlow } from "./flow-model";
import { STEP_LABELS } from "./module-detail-model";

export function FlowStory({ data }: { data: Detail }) {
  useLocale();
  const stage = data.stages.find((item) => item.index === data.workflow.currentStage);
  const paused = data.workflow.status === "HALTED";
  const waiting = ["PLANNED", "WAITING_APPROVAL"].includes(data.workflow.status);
  const done = ["COMPLETED", "ABORTED"].includes(data.workflow.status);
  const recovering = data.workflow.status === "ROLLING_BACK";
  return (
    <div
      className="flow-story flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border px-3 py-2 text-xs"
      role="status"
    >
      {paused ? (
        <CirclePause className="size-4 text-warning" />
      ) : done ? (
        <Check className="size-4 text-success" />
      ) : (
        <Radio className={`size-4 text-info ${isMoving(data) ? "flow-pulse" : ""}`} />
      )}
      <span className="font-semibold">
        {recovering
          ? t("{0} 복귀", [data.workflow.rollback?.resource ?? ""])
          : t(stage ? (STAGE_LABELS[stage.kind] ?? stage.kind) : "단계 미확인")}
      </span>
      {(paused || waiting) && (
        <span className="text-muted-foreground">
          {paused
            ? t("엔진 정지 · 외부 작업은 계속될 수 있습니다.")
            : waiting
              ? t("승인 대기 · 확인 후 다음 작업을 시작합니다.")
              : null}
        </span>
      )}
      {data.hold.desired === "HOLD" && (
        <Badge variant="outline" className="border-warning text-warning">
          {t("앱 업무 정지 중")}
        </Badge>
      )}
      {!done && stage?.step && (
        <span className="ml-auto text-[10px] text-info">
          {t(STEP_LABELS[stage.step] ?? stage.step)}
        </span>
      )}
    </div>
  );
}

export function TrafficMeter({ data }: { data: Detail }) {
  useLocale();
  const traffic = trafficFlow(data);
  const [source, target] = traffic.shown ?? [null, null];
  return (
    <div className="traffic-meter space-y-1.5 px-1" data-confirmed={Boolean(traffic.confirmed)}>
      <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs">
        <span className="font-medium text-muted-foreground">
          {data.workflow.sourceEnv}{" "}
          <strong className="ml-1 tabular-nums">{source === null ? "—" : `${source}%`}</strong>
        </span>
        <span className="text-[10px] text-muted-foreground">
          {t(
            traffic.confirmed
              ? "LB 확인 비율"
              : traffic.requested
                ? "전환 요청 · LB 확인 대기"
                : "트래픽 비율 미확인",
          )}
        </span>
        <span className="font-medium text-info">
          {data.workflow.targetEnv}{" "}
          <strong className="ml-1 tabular-nums">{target === null ? "—" : `${target}%`}</strong>
        </span>
      </div>
      <svg
        viewBox="0 0 1000 14"
        preserveAspectRatio="none"
        className="block h-3 w-full overflow-hidden rounded-sm"
        role="img"
        aria-label={t("트래픽 분배: {0} {1}, {2} {3}", [
          data.workflow.sourceEnv,
          source === null ? t("미확인") : `${source}%`,
          data.workflow.targetEnv,
          target === null ? t("미확인") : `${target}%`,
        ])}
      >
        <rect width="1000" height="14" className="fill-muted" />
        {source !== null && target !== null && (
          <>
            <rect
              width={source * 10}
              height="14"
              className="flow-ratio fill-muted-foreground"
              opacity={traffic.confirmed ? 0.85 : 0.35}
            />
            <rect
              x={source * 10}
              width={target * 10}
              height="14"
              className="flow-ratio fill-info"
              opacity={traffic.confirmed ? 0.95 : 0.35}
            />
          </>
        )}
      </svg>
      {traffic.confirmed && traffic.pending && traffic.requested && (
        <p className="text-[10px] text-warning">
          {t("다음 요청: {0} {1}% · {2} {3}%", [
            data.workflow.sourceEnv,
            traffic.requested[0],
            data.workflow.targetEnv,
            traffic.requested[1],
          ])}
        </p>
      )}
    </div>
  );
}

export function PreparationActivity({ data }: { data: Detail }) {
  useLocale();
  const preparation = preparationFlow(data);
  return (
    <div className="grid gap-2 sm:grid-cols-3" aria-label={t("대상 환경 준비")}>
      {preparation.rows.map((row) => (
        <div
          key={row.kind}
          className="flex items-center gap-2 rounded-md border bg-muted/20 px-3 py-2 text-xs"
          data-preparation={row.kind}
        >
          {row.failed ? (
            <TriangleAlert className="size-4 text-destructive" />
          ) : row.done ? (
            <Check className="size-4 text-success" />
          ) : row.moving ? (
            <LoaderCircle className="flow-spin size-4 text-info" />
          ) : (
            <span className="size-3 rounded-full border border-muted-foreground/50" />
          )}
          <div className="min-w-0">
            <p className="font-medium">
              {t(row.kind === "INFRA" ? "인프라 작업" : "앱 배포 작업")}
            </p>
            <p className="truncate text-[10px] text-muted-foreground">
              {row.done ? t("준비 완료") : t(row.label)}
            </p>
          </div>
        </div>
      ))}
      <div className="flex items-center gap-2 rounded-md border bg-muted/20 px-3 py-2 text-xs">
        {preparation.prepared === preparation.total ? (
          <Check className="size-4 text-success" />
        ) : preparation.running ? (
          <LoaderCircle className="flow-spin size-4 text-info" />
        ) : (
          <span className="size-3 rounded-full border border-muted-foreground/50" />
        )}
        <div>
          <p className="font-medium">{t("이전 리소스 준비")}</p>
          <p className="text-[10px] text-muted-foreground">
            {t("{0}/{1} 리소스 확인", [preparation.prepared, preparation.total])}
          </p>
        </div>
      </div>
    </div>
  );
}
