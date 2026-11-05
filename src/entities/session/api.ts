import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { apiClient, isUnauthorized } from "@/shared/api";
export const sessionSchema = z.object({
  user: z.object({ id: z.string(), login: z.string(), name: z.string() }),
  workspaceId: z.string(),
  demo: z.boolean(),
});
export type Session = z.infer<typeof sessionSchema>;
export const sessionOptions = () =>
  queryOptions({
    queryKey: ["session"],
    queryFn: async ({ signal }) => {
      try {
        return sessionSchema.parse((await apiClient.get("/v1/me", { signal })).data);
      } catch (error) {
        if (isUnauthorized(error)) return null;
        throw error;
      }
    },
    staleTime: 0,
    retry: false,
    refetchOnWindowFocus: true,
  });
export async function loginDemo() {
  return sessionSchema.parse((await apiClient.post("/auth/demo/login")).data);
}
export async function logout() {
  await apiClient.post("/auth/logout");
}
