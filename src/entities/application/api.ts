import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import {
  apiClient,
  commandHeaders,
  eventSchema,
  providerSchema,
  resourceSchema,
} from "@/shared/api";
export const applicationInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "이름은 2자 이상 입력하세요.")
    .max(50)
    .regex(/^[a-z0-9][a-z0-9-]*$/, "영문 소문자·숫자·하이픈을 사용하세요."),
  repositoryId: z.string().min(1, "저장소를 선택하세요."),
  branch: z.string().trim().min(1),
  root: z.string().trim().min(1),
  dockerfile: z.string().trim().min(1),
  port: z.number().int().min(1).max(65535),
  healthPath: z.string().startsWith("/"),
  provider: providerSchema,
  region: z.string().trim().min(1),
  environment: z.enum(["production", "staging"]),
  env: z.string().max(4000),
  resources: z.array(resourceSchema).min(1),
});
export type ApplicationInput = z.infer<typeof applicationInputSchema>;
export const deploymentSchema = z.object({
  id: z.string(),
  status: z.enum(["BUILDING", "DEPLOYING", "SUCCEEDED", "FAILED"]),
  revision: z.number(),
  createdAt: z.number(),
  image: z.string(),
  events: z.array(eventSchema),
  fail: z.boolean(),
});
export const applicationSchema = applicationInputSchema.extend({
  id: z.string(),
  workspaceId: z.string(),
  repository: z.string(),
  status: z.enum(["REGISTERED", "RUNNING", "STOPPED", "DEPLOYING", "FAILED", "MIGRATING"]),
  revision: z.number(),
  createdAt: z.number(),
  updatedAt: z.number(),
  placements: z.record(resourceSchema, providerSchema),
  deployments: z.array(deploymentSchema),
});
export type Application = z.infer<typeof applicationSchema>;
export const applicationStatus: Record<Application["status"], string> = {
  REGISTERED: "등록됨",
  RUNNING: "실행 중",
  STOPPED: "중지됨",
  DEPLOYING: "배포 중",
  FAILED: "배포 실패",
  MIGRATING: "이전 중",
};
export const applicationsOptions = (workspaceId: string) =>
  queryOptions({
    queryKey: ["applications", workspaceId],
    queryFn: async ({ signal }) =>
      z
        .array(applicationSchema)
        .parse((await apiClient.get("/v1/applications", { params: { workspaceId }, signal })).data),
    refetchInterval: 2000,
  });
export const applicationOptions = (workspaceId: string, id: string) =>
  queryOptions({
    queryKey: ["applications", workspaceId, id],
    queryFn: async ({ signal }) =>
      applicationSchema.parse((await apiClient.get(`/v1/applications/${id}`, { signal })).data),
    refetchInterval: 1500,
  });
export async function saveApplication(
  input: ApplicationInput,
  workspaceId: string,
  current?: Application,
) {
  const data = current
    ? (
        await apiClient.patch(`/v1/applications/${current.id}`, {
          ...input,
          expectedRevision: current.revision,
        })
      ).data
    : (
        await apiClient.post(
          "/v1/applications",
          { ...input, workspaceId },
          { headers: commandHeaders() },
        )
      ).data;
  return applicationSchema.parse(data);
}
export async function applicationAction(
  app: Application,
  action: "DEPLOY" | "STOP" | "DELETE",
  fail = false,
) {
  const response =
    action === "DELETE"
      ? await apiClient.delete(`/v1/applications/${app.id}`, {
          data: { expectedRevision: app.revision },
        })
      : await apiClient.post(
          `/v1/applications/${app.id}/actions`,
          { action, fail, expectedRevision: app.revision },
          { headers: commandHeaders() },
        );
  return response.data;
}
