import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { apiClient, getApiErrorMessage, isNotFound } from "@/shared/api";
import { t } from "@/shared/lib/i18n";

const time = z.iso.datetime({ offset: true });
const scalar = z.union([z.string(), z.number(), z.boolean()]);
const scope = z.literal("USER_DEPLOYED_APPLICATIONS_V2");
export const statusSchema = z.object({
  configured: z.boolean(),
  model: z.string(),
  prometheusConfigured: z.boolean(),
  tempoConfigured: z.boolean(),
  retentionDays: z.number().int().positive(),
  sizingEnvironments: z.array(z.enum(["aws", "gcp"])),
  dataScope: scope,
});
export const deploymentSchema = z.object({
  environmentId: z.string().regex(/^env-[a-f0-9]{12}$/),
  deploymentId: z.string(),
  applicationId: z.string(),
  environment: z.enum(["aws", "gcp", "onprem"]),
  status: z.string(),
  appliedAt: time.nullable().optional(),
});
export type Deployment = z.infer<typeof deploymentSchema>;
const deploymentsSchema = z.object({ dataScope: scope, deployments: z.array(deploymentSchema) });
const sourceSchema = z.object({
  id: z.string(),
  type: z.string(),
  observedAt: time.nullable().optional(),
  data: z.record(z.string(), z.unknown()).optional(),
});
export const chatSchema = z.object({
  conversationId: z.string(),
  messageId: z.string(),
  answer: z.string(),
  sources: z.array(sourceSchema),
  warnings: z.array(z.string()),
  createdAt: time,
});
export type Chat = z.infer<typeof chatSchema>;
const conversationSchema = z.object({
  conversationId: z.string(),
  applicationId: z.string(),
  environments: z.array(z.string()),
  deploymentId: z.string().nullable().optional(),
  recentTurns: z.array(z.object({ user: z.string(), assistant: chatSchema, createdAt: time })),
});
export const analysisSchema = z.object({
  analysisId: z.string(),
  applicationId: z.string(),
  sourceDeploymentId: z.string(),
  environment: z.string(),
  timeRange: z.object({ start: time, end: time }),
  focus: z.array(z.string()),
  status: z.enum(["COMPLETED", "PARTIAL", "INSUFFICIENT_DATA"]),
  summary: z.string(),
  findings: z.array(
    z.object({
      category: z.enum(["RESOURCE", "PERFORMANCE", "ERROR", "DATA_QUALITY"]),
      severity: z.enum(["INFO", "WARNING", "CRITICAL"]),
      description: z.string(),
      evidenceKeys: z.array(z.string()),
    }),
  ),
  metrics: z.record(z.string(), z.number().nullable()),
  dataQuality: z.object({
    coveragePercent: z.number().min(0).max(100),
    missingMetrics: z.array(z.string()),
    metrics: z.record(
      z.string(),
      z.object({
        state: z.string(),
        source: z.string().optional(),
        temporalCoveragePercent: z.number().nullable(),
      }),
    ),
  }),
  traces: z.array(z.object({ traceID: z.string(), durationMs: z.number() })),
  tracesState: z.string(),
  createdAt: time,
});
export type Analysis = z.infer<typeof analysisSchema>;
const proposalSchema = z.object({
  parameters: z.record(z.string(), scalar),
  rationale: z.record(z.string(), z.string()),
});
export const recommendationSchema = z.object({
  recommendationId: z.string(),
  applicationId: z.string(),
  dataScope: scope,
  status: z.enum(["COMPLETED", "INSUFFICIENT_DATA", "CONSTRAINT_LIMIT"]),
  sourceDeploymentId: z.string(),
  targetEnvironment: z.string(),
  targetDeploymentId: z.string().nullable().optional(),
  analysisStatus: z.string().optional(),
  basis: z.literal("TELEMETRY"),
  analysis: analysisSchema,
  proposal: proposalSchema.extend({ cloud: z.string() }).nullable(),
  appProposal: proposalSchema.nullable(),
  missingRequiredMetrics: z.array(z.string()).optional(),
  iac: z
    .object({
      action: z.enum(["CREATE", "UPDATE"]),
      endpoint: z.string(),
      body: z.record(z.string(), z.unknown()),
    })
    .optional(),
  warnings: z.array(z.string()),
  createdAt: time,
});
export type Recommendation = z.infer<typeof recommendationSchema>;
export type ChatRequest = {
  applicationId: string;
  deploymentId: string;
  environments: string[];
  message: string;
  conversationId?: string;
};
export type AnalysisRequest = {
  applicationId: string;
  deploymentId: string;
  timeRange: { start: string; end: string };
  focus: ("RESOURCES" | "PERFORMANCE" | "ERRORS")[];
};
export type RecommendationRequest = {
  applicationId: string;
  sourceDeploymentId: string;
  targetEnvironment: "aws" | "gcp";
};
export const aiKeys = {
  all: (workspace: string) => ["ai", workspace] as const,
  conversation: (workspace: string, deployment: string, id: string) =>
    ["ai", workspace, "conversation", deployment, id] as const,
};
export const statusOptions = (workspace: string) =>
  queryOptions({
    queryKey: [...aiKeys.all(workspace), "status"],
    queryFn: async ({ signal }) =>
      statusSchema.parse((await apiClient.get("/v1/ai/status", { signal })).data),
    retry: false,
  });
export const deploymentOptions = (workspace: string, enabled: boolean) =>
  queryOptions({
    queryKey: [...aiKeys.all(workspace), "deployments"],
    queryFn: async ({ signal }) =>
      deploymentsSchema.parse((await apiClient.get("/v1/ai/deployments", { signal })).data),
    enabled,
    retry: false,
  });
export const conversationOptions = (workspace: string, deployment: string, id: string) =>
  queryOptions({
    queryKey: aiKeys.conversation(workspace, deployment, id),
    queryFn: async ({ signal }) =>
      conversationSchema.parse(
        (await apiClient.get(`/v1/ai/conversations/${encodeURIComponent(id)}`, { signal })).data,
      ),
    enabled: Boolean(id),
    retry: false,
  });
const command = { timeout: 180000 };
export async function chat(request: ChatRequest, key: string) {
  return chatSchema.parse(
    (
      await apiClient.post("/v1/ai/chat", request, {
        ...command,
        headers: { "Idempotency-Key": key },
      })
    ).data,
  );
}
export async function analyse(request: AnalysisRequest, key: string) {
  return analysisSchema.parse(
    (
      await apiClient.post("/v1/ai/analyses", request, {
        ...command,
        headers: { "Idempotency-Key": key },
      })
    ).data,
  );
}
export async function recommend(request: RecommendationRequest, key: string) {
  return recommendationSchema.parse(
    (
      await apiClient.post("/v1/ai/recommendations", request, {
        ...command,
        headers: { "Idempotency-Key": key },
      })
    ).data,
  );
}
export const canAnalyse = (deployment: Deployment) =>
  ["READY", "INFRA_READY", "APP_NOT_READY"].includes(deployment.status);
export function aiErrorMessage(error: Error): string {
  return isNotFound(error)
    ? t("AI API 또는 선택한 배포 정보가 없습니다. 서버 반영 상태와 배포 목록을 확인하세요.")
    : getApiErrorMessage(error);
}
