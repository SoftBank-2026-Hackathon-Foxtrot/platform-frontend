import type { Detail, Resource } from "../api/migrations";

export const RESOURCE_FLOW = [
  { kind: "REDIS", name: "Redis", icon: "redis", binding: "Redis proxy" },
  { kind: "DATABASE", name: "PostgreSQL", icon: "postgresql", binding: "PgBouncer" },
  {
    kind: "OBJECT_STORAGE",
    name: "객체 저장소",
    icon: "object",
    binding: "객체 라우팅",
  },
] as const;

const ACTIVE = new Set(["RUNNING", "SYNCING", "ACTIVE"]);
export function isMoving(data: Detail) {
  return ["RUNNING", "ROLLING_BACK", "ABORTING"].includes(data.workflow.status);
}
export function hasCurrentObservation(resource: Resource) {
  const freshness = resource.observation.freshness;
  const syncFreshness = resource.details.redis?.sync?.freshness;
  if ([freshness, syncFreshness].some((value) => value === "STALE" || value === "UNAVAILABLE"))
    return false;
  if (resource.observation.collectionError) return false;
  // The legacy backend reports observedAt without a freshness projection.
  return freshness === "FRESH" || Boolean(resource.observedAt);
}
function percentSplit(split: Record<string, number> | null | undefined, data: Detail) {
  if (!split) return null;
  const source = split[data.workflow.sourceEnv];
  const target = split[data.workflow.targetEnv];
  if (source == null || target == null || !Number.isFinite(source) || !Number.isFinite(target))
    return null;
  if (
    source < 0 ||
    target < 0 ||
    source > 100 ||
    target > 100 ||
    Math.abs(source + target - 100) > 0.1
  )
    return null;
  return [source, target] as const;
}
export function trafficFlow(data: Detail) {
  const record = data.traffic.at(-1);
  const confirmed = percentSplit(record?.effectivePercent, data);
  const requested = percentSplit(record?.requested, data);
  const uncertain = ["UNKNOWN", "FAILED", "CANCELLED"].includes(record?.operationStatus ?? "");
  return {
    confirmed,
    requested,
    shown: confirmed ?? requested,
    moving: isMoving(data) && Boolean(confirmed) && !uncertain,
    pending:
      !confirmed ||
      Boolean(requested && requested.some((value, index) => value !== confirmed[index])),
  };
}
export function copyProgress(resource: Resource | undefined) {
  const copy = resource?.details.object?.initialCopyObservedAt
    ? resource.replication?.initialCopy
    : undefined;
  const progress =
    resource?.progress ??
    (copy ? { completed: copy.completed, total: copy.total, unit: "객체" } : null);
  if (!progress) return null;
  const { completed, total } = progress;
  if (
    completed == null ||
    total == null ||
    !Number.isFinite(completed) ||
    !Number.isFinite(total) ||
    completed < 0 ||
    total < 0 ||
    completed > total
  )
    return null;
  return {
    completed,
    total,
    unit: progress.unit ?? "",
    percent: total > 0 ? (completed / total) * 100 : null,
  };
}
export function resourceFlow(data: Detail, resource: Resource | undefined) {
  if (!resource)
    return {
      moving: false,
      forward: false,
      reverse: false,
      stale: false,
      copying: false,
      ready: false,
      failed: false,
      progress: null,
      label: "관측 대기",
    };
  const stale = !hasCurrentObservation(resource);
  const failed = ["ERROR", "FAILED"].includes(resource.health ?? "");
  const forwardState = resource.replication?.forward?.state;
  const reverseState = resource.replication?.reverse?.state;
  const redisDirection = resource.details.redis?.sync?.direction;
  const terminal = ["COMPLETED", "CANCELLED"].includes(resource.lifecycle ?? "");
  const forward =
    !terminal &&
    (ACTIVE.has(forwardState ?? "") ||
      (!forwardState && resource.lifecycle === "SYNCING" && redisDirection !== "REVERSE"));
  const reverse =
    !terminal &&
    (ACTIVE.has(reverseState ?? "") ||
      (!reverseState && redisDirection === "REVERSE" && resource.lifecycle === "SYNCING"));
  const ready = resource.lifecycle === "READY";
  const copying = forward || reverse;
  const label = failed
    ? "리소스 오류"
    : stale
      ? "관측 갱신 대기"
      : ready
        ? "전환 준비됨"
        : copying
          ? "데이터 복제 중"
          : resource.lifecycle === "COMPLETED"
            ? "복제 작업 완료"
            : resource.lifecycle === "PREPARED"
              ? "동기화 대기"
              : ((
                  {
                    QUIESCED: "쓰기 정지",
                    SWITCHED: "경로 전환됨",
                    ACTIVE: "운영 중",
                    RESTORED: "원본 복귀",
                  } as Record<string, string>
                )[resource.lifecycle ?? ""] ?? "관측 대기");
  return {
    moving: isMoving(data) && !stale && !failed && copying,
    forward,
    reverse,
    stale,
    copying,
    ready,
    failed,
    progress: copyProgress(resource),
    label,
  };
}
export function activeSides(resource: Resource | undefined) {
  return {
    source: resource?.route === "SOURCE" || resource?.route === "MIXED",
    target: resource?.route === "TARGET" || resource?.route === "MIXED",
  };
}
export function preparationFlow(data: Detail) {
  const preparing = data.stages.find((stage) => stage.kind === "PREPARE");
  const running = preparing?.status === "RUNNING" && isMoving(data);
  const rows = (["INFRA", "COMPUTE"] as const).map((kind) => {
    const report = data.preparation[kind];
    const result = report?.data;
    const stale =
      report?.observation.freshness === "STALE" || report?.observation.freshness === "UNAVAILABLE";
    const failed = !stale && ["FAILED", "ERROR"].includes(result?.status ?? "");
    const done = !stale && ["SUCCEEDED", "COMPLETED", "READY"].includes(result?.status ?? "");
    const moving = running && !stale && !failed && !done && Boolean(result);
    return {
      kind,
      done,
      failed,
      moving,
      label: stale
        ? "관측 갱신 대기"
        : result
          ? (result.stage ?? result.status ?? "관측 대기")
          : "상세 결과 미제공",
    };
  });
  const prepared = data.resources.filter(
    (resource) =>
      ["PREPARED", "SYNCING", "READY", "ACTIVE", "COMPLETED"].includes(resource.lifecycle ?? "") &&
      hasCurrentObservation(resource),
  ).length;
  return { running, rows, prepared, total: RESOURCE_FLOW.length };
}

export const STAGE_EXPLANATION: Record<string, string> = {
  PREPARE: "앱 연결과 이전 리소스를 준비합니다. 보고된 작업부터 준비 상태가 바뀝니다.",
  SYNC: "서비스는 원본 데이터를 사용하면서 대상에 데이터를 복제합니다.",
  OBJECT_CUTOVER: "객체 접근 경로를 전환하고 양쪽 앱의 업무를 확인합니다.",
  CANARY: "일부 요청을 대상 앱으로 보냅니다. DB와 Redis는 아직 원본을 사용합니다.",
  REDIS_CUTOVER: "Redis 경로를 전환합니다. 검증 후 DB 전환까지 이어집니다.",
  DATABASE_CUTOVER: "앱 업무를 정지하고 DB 경로를 바꾼 뒤 업무를 재개합니다.",
  TRAFFIC: "데이터 경로 전환 후 대상 앱의 트래픽 비율을 단계적으로 늘립니다.",
  FINALIZE: "최종 검증 후 이전용 임시 구성을 정리하고 복귀 경로를 닫습니다.",
};
