import type { Review } from "../api/review";
export type ResourceId = "app" | "db" | "redis" | "object";
export function resources(review: Review) {
  return [
    {
      id: "app",
      name: "앱 서버",
      icon: "app",
      source: "AWS",
      target: review.application,
      principal: "",
      status: "앱 준비 상태",
    },
    {
      id: "db",
      name: "주문 DB",
      icon: "postgresql",
      source: "AWS",
      target: "GCP",
      principal: "",
      status: "이번 검사 제외",
    },
    {
      id: "redis",
      name: "Redis",
      icon: "redis",
      source: "AWS",
      target: "GCP",
      principal: "",
      status: "이번 검사 제외",
    },
    {
      id: "object",
      name: "오브젝트 스토리지",
      icon: "object",
      source: "S3",
      target: "Cloud Storage",
      principal: review.target.principal.replace("serviceAccount:", "").split("@")[0]!,
      status: "",
    },
  ] as const;
}
export type SecurityResource = ReturnType<typeof resources>[number];
