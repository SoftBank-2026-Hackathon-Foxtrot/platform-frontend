import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { apiClient, commandHeaders } from "@/shared/api";

const environmentSchema = z.object({
  appUrl: z.string(),
  trafficPool: z.string(),
  actors: z.record(z.string(), z.number()),
});
export const imageSchema = z.object({
  imageRef: z
    .string()
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9._:/-]+@sha256:[a-f0-9]{64}$/, "이미지 digest를 입력하세요."),
  port: z.number().int().min(1).max(65535),
  cpu: z.number().int().min(128).max(16384),
  memory: z.number().int().min(128).max(131072),
  architecture: z.enum(["X86_64", "ARM64"]),
  registryCredentialRef: z.string().nullable(),
  environment: z.record(z.string(), z.string()),
  secretRefs: z.record(z.string(), z.string()),
});
export const managedInputSchema = z.object({
  name: z.string().trim().min(1).max(80),
  image: imageSchema,
});
export const policySchema = z.object({
  allowedDirections: z.array(z.string()),
  maxQuiesceSeconds: z.number().int().min(1).max(300),
  requireTargetReady: z.literal(true),
  allowTargetWriteRollback: z.literal(false),
});
export const managedApplicationSchema = managedInputSchema.extend({
  id: z.string(),
  ownerId: z.string(),
  version: z.number().int(),
  status: z.enum(["REGISTERED", "VERIFIED", "ARCHIVED"]),
  configuration: z
    .object({
      scope: z.string(),
      sourceEnvironment: z.string().nullable().optional(),
      targetEnvironment: z.string().nullable().optional(),
      environments: z.record(z.string(), environmentSchema),
      resources: z.record(z.string(), z.unknown()),
    })
    .nullable(),
  policy: policySchema,
  verifiedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type ManagedApplication = z.infer<typeof managedApplicationSchema>;
export type ManagedInput = z.infer<typeof managedInputSchema>;
export type MigrationPolicy = z.infer<typeof policySchema>;
export const managedStatus = { REGISTERED: "등록됨", VERIFIED: "이전 준비됨", ARCHIVED: "해제됨" };
export const verificationSchema = z.object({
  applicationId: z.string(),
  version: z.number(),
  passed: z.boolean(),
  checks: z.record(z.string(), z.boolean()),
  blockers: z.array(z.string()),
});
export type Verification = z.infer<typeof verificationSchema>;
const catalogSchema = z.object({
  environments: z.array(z.string()),
  resources: z.record(z.string(), z.object({ sourceRef: z.string(), targetRef: z.string() })),
});
const auditSchema = z.object({
  events: z.array(
    z.object({ type: z.string(), at: z.string(), actor: z.string().optional() }).passthrough(),
  ),
  nextCursor: z.string().nullable(),
});
export const managedKeys = {
  all: (workspace: string) => ["managed-applications", workspace] as const,
  detail: (workspace: string, id: string) => ["managed-applications", workspace, id] as const,
};
export const managedApplicationsOptions = (workspace: string) =>
  queryOptions({
    queryKey: managedKeys.all(workspace),
    queryFn: async ({ signal }) =>
      z
        .array(managedApplicationSchema)
        .parse((await apiClient.get("/v1/applications", { signal })).data),
    refetchInterval: 5000,
  });
export const managedApplicationOptions = (workspace: string, id: string) =>
  queryOptions({
    queryKey: managedKeys.detail(workspace, id),
    queryFn: ({ signal }) => getManagedApplication(id, signal),
    refetchInterval: 3000,
  });
export async function getManagedApplication(id: string, signal?: AbortSignal) {
  return managedApplicationSchema.parse(
    (await apiClient.get(`/v1/applications/${id}`, { signal })).data,
  );
}
export const catalogOptions = (workspace: string) =>
  queryOptions({
    queryKey: ["catalog", workspace],
    queryFn: async ({ signal }) =>
      catalogSchema.parse((await apiClient.get("/v1/catalog", { signal })).data),
  });
export const appAuditOptions = (workspace: string, id: string, after: string | null = null) =>
  queryOptions({
    queryKey: ["app-audit", workspace, id, after],
    queryFn: async ({ signal }) =>
      auditSchema.parse(
        (
          await apiClient.get(`/v1/applications/${id}/events`, {
            signal,
            params: { after: after ?? undefined, limit: 100 },
          })
        ).data,
      ),
    refetchInterval: 5000,
  });
export async function saveManagedApplication(
  input: ManagedInput,
  current: ManagedApplication | undefined,
  key: string,
) {
  const options = {
    headers: {
      ...commandHeaders(key),
      ...(current ? { "Expected-Version": String(current.version) } : {}),
    },
  };
  const response = current
    ? await apiClient.patch(`/v1/applications/${current.id}`, input, options)
    : await apiClient.post("/v1/applications", input, options);
  return managedApplicationSchema.parse(response.data);
}
export async function connectManagedResources(app: ManagedApplication, key: string) {
  return managedApplicationSchema.parse(
    (
      await apiClient.put(
        `/v1/applications/${app.id}/resources`,
        { expectedVersion: app.version },
        { headers: commandHeaders(key) },
      )
    ).data,
  );
}
export async function verifyManagedApplication(app: ManagedApplication, key: string) {
  return verificationSchema.parse(
    (
      await apiClient.post(
        `/v1/applications/${app.id}/verify`,
        { expectedVersion: app.version },
        { headers: commandHeaders(key) },
      )
    ).data,
  );
}
export async function archiveManagedApplication(app: ManagedApplication, key: string) {
  return managedApplicationSchema.parse(
    (
      await apiClient.delete(`/v1/applications/${app.id}`, {
        headers: { ...commandHeaders(key), "Expected-Version": String(app.version) },
      })
    ).data,
  );
}
export async function saveManagedPolicy(
  app: ManagedApplication,
  policy: MigrationPolicy,
  key: string,
) {
  return managedApplicationSchema.parse(
    (
      await apiClient.put(
        `/v1/applications/${app.id}/policy`,
        { expectedVersion: app.version, policy },
        { headers: commandHeaders(key) },
      )
    ).data,
  );
}
export function migrationDirection(app: ManagedApplication): [string, string] | null {
  const config = app.configuration;
  if (!config) return null;
  const names = Object.keys(config.environments);
  const source = config.sourceEnvironment ?? names[0];
  const target = config.targetEnvironment ?? names[1];
  return source && target ? [source, target] : null;
}
