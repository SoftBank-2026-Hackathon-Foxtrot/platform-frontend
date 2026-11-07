import type { Detail } from "../api/migrations";

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
