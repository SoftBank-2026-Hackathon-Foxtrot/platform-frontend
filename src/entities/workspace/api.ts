import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { isDemoMode } from "@/shared/config";
import { apiClient, providerSchema } from "@/shared/api";
export const repositorySchema = z.object({
  id: z.string(),
  name: z.string(),
  language: z.string(),
  branches: z.array(z.string()),
});
export const workspaceSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(2).max(40),
  githubConnected: z.boolean(),
  connections: z.array(
    z.object({ provider: providerSchema, connected: z.boolean(), region: z.string() }),
  ),
});
export type Workspace = z.infer<typeof workspaceSchema>;
export const workspaceOptions = (workspaceId: string) =>
  queryOptions({
    queryKey: ["workspace", workspaceId],
    queryFn: async ({ signal }) => {
      if (isDemoMode)
        return workspaceSchema.parse(
          (await apiClient.get(`/v1/workspaces/${workspaceId}`, { signal })).data,
        );
      const workspaces = z
        .array(z.object({ id: z.string(), name: z.string(), role: z.literal("owner") }))
        .parse((await apiClient.get("/v1/workspaces", { signal })).data);
      const workspace = workspaces.find((item) => item.id === workspaceId);
      if (!workspace) throw new Error("개인 workspace를 찾지 못했습니다.");
      return workspaceSchema.parse({
        ...workspace,
        githubConnected: !workspaceId.includes("local:"),
        connections: [],
      });
    },
  });
export const repositoriesOptions = (workspaceId: string) =>
  queryOptions({
    queryKey: ["repositories", workspaceId],
    queryFn: async ({ signal }) =>
      z
        .array(repositorySchema)
        .parse(
          (await apiClient.get(`/v1/workspaces/${workspaceId}/repositories`, { signal })).data,
        ),
  });
export async function updateWorkspace(workspaceId: string, data: Partial<Omit<Workspace, "id">>) {
  return workspaceSchema.parse((await apiClient.patch(`/v1/workspaces/${workspaceId}`, data)).data);
}
export async function resetDemo() {
  await apiClient.post("/demo/reset");
}
