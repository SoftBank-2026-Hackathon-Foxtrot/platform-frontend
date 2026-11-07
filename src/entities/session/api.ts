import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { z } from "zod";
import { isDemoMode } from "@/shared/config";
import { apiClient, isUnauthorized, setCsrfToken } from "@/shared/api";
export const sessionSchema = z.object({
  user: z.object({ id: z.string(), login: z.string(), name: z.string() }),
  workspaceId: z.string(),
  demo: z.boolean(),
  local: z.boolean().optional(),
});
export type Session = z.infer<typeof sessionSchema>;
export function useSession(): Session {
  const { data } = useSuspenseQuery(sessionOptions());
  if (!data) throw new Error("로그인이 필요합니다.");
  return data;
}
export const sessionOptions = () =>
  queryOptions({
    queryKey: ["session"],
    queryFn: async ({ signal }) => {
      try {
        const raw = (await apiClient.get("/v1/me", { signal })).data;
        if (isDemoMode) return sessionSchema.parse(raw);
        const response = realSessionSchema.parse(raw);
        setCsrfToken(response.csrfToken);
        return sessionSchema.parse({
          user: { ...response.user, name: response.user.login },
          workspaceId: `personal:${response.user.id}`,
          demo: false,
          local: response.user.id === "local:developer",
        });
      } catch (error) {
        if (isUnauthorized(error)) {
          setCsrfToken(null);
          return null;
        }
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
  setCsrfToken(null);
}

export const realSessionSchema = z.object({
  user: z.object({ id: z.string(), login: z.string() }),
  csrfToken: z.string(),
  expiresAt: z.string(),
});
