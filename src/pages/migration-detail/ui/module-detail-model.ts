import type { Detail, Resource } from "../api/migrations";
import { hasCurrentObservation } from "./flow-model";

export function proxyActivity(data: Detail, resource: Resource | undefined, suspended: boolean) {
  const proxy = resource?.details.redis?.proxy;
  const stale =
    suspended ||
    !resource ||
    !hasCurrentObservation(resource) ||
    ["STALE", "UNAVAILABLE"].includes(proxy?.freshness ?? "");
  const destination = stale
    ? null
    : resource.route === "SOURCE"
      ? data.workflow.sourceEnv
      : resource.route === "TARGET"
        ? data.workflow.targetEnv
        : null;
  const paused = stale
    ? null
    : resource.kind === "REDIS"
      ? (proxy?.paused ?? null)
      : (resource.details.database?.proxyPaused ?? null);
  const inflight =
    !stale && proxy?.inflight_writes != null && proxy.inflight_writes >= 0
      ? proxy.inflight_writes
      : null;
  return { destination, paused, inflight, stale };
}

export const STEP_LABELS: Record<string, string> = {
  CHECK: "전환 조건 확인",
  HOLD: "앱 업무 정지",
  QUIESCE: "쓰기 정지 확인",
  CUTOVER: "경로 전환",
  RESUME: "쓰기 재개",
  RELEASE: "앱 업무 재개",
  VERIFY: "전환 후 검증",
};

export function activeModule(data: Detail) {
  if (data.workflow.status === "ROLLING_BACK") return data.workflow.rollback?.resource ?? null;
  if (data.workflow.status !== "RUNNING") return null;
  const stage = data.stages.find((item) => item.index === data.workflow.currentStage);
  if (!stage || stage.status !== "RUNNING") return null;
  switch (stage.kind) {
    case "REDIS_CUTOVER":
      return "REDIS";
    case "DATABASE_CUTOVER":
      return "DATABASE";
    case "OBJECT_CUTOVER":
      return "OBJECT_STORAGE";
    default:
      return null;
  }
}

export const STREAM_NAMES: Record<string, string> = {
  INITIAL_COPY: "초기 복사",
  CDC: "CDC 변경분",
  KEY_EVENTS: "키 변경 알림",
  OBJECT_CHANGES: "객체 변경분",
};
export function runningStreams(data: Detail, resource: Resource | undefined) {
  if (
    !resource ||
    !hasCurrentObservation(resource) ||
    ["ERROR", "FAILED"].includes(resource.health ?? "")
  )
    return [];
  if (["PLANNED", "COMPLETED", "ABORTED"].includes(data.workflow.status)) return [];
  return resource.streams.filter(
    (stream) =>
      stream.state === "RUNNING" && stream.freshness === "FRESH" && Boolean(stream.observedAt),
  );
}
