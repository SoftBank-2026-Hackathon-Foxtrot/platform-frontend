import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { targetConfigurationSchema, type TargetConfiguration } from "@/entities/migration";
import { apiClient } from "@/shared/api";

const scalar = z.union([z.string(), z.number(), z.boolean()]);
export const sizingOptionsSchema = z.object({
  applicationId: z.string(),
  targetEnv: z.string(),
  cloud: z.string(),
  supported: z.boolean(),
  blockedReason: z.string().nullable(),
  deployment: z
    .object({
      environmentId: z.string().regex(/^env-[a-f0-9]{12}$/),
      status: z.string(),
      updatedAt: z.string(),
      sizing: z.record(z.string(), scalar),
      app: z.object({
        cpu: z.number(),
        memoryMiB: z.number(),
        workerCount: z.number(),
        apiWorkers: z.number(),
      }),
    })
    .nullable(),
  parameters: z.record(
    z.string(),
    z.object({
      type: z.enum(["string", "integer", "boolean"]),
      enum: z.array(z.string()).optional(),
      minimum: z.number().optional(),
      maximum: z.number().optional(),
    }),
  ),
  appOptions: z.object({ cpu: z.array(z.number()), memoryStepMiB: z.number().positive() }),
});
export type SizingOptions = z.infer<typeof sizingOptionsSchema>;
export const sizingOptions = (workspace: string, target: string, enabled: boolean) =>
  queryOptions({
    queryKey: ["migration-sizing", workspace, target],
    queryFn: async ({ signal }) =>
      sizingOptionsSchema.parse(
        (
          await apiClient.get("/v1/migration-sizing", {
            signal,
            params: { targetEnv: target },
          })
        ).data,
      ),
    enabled,
    retry: false,
    refetchOnWindowFocus: false,
  });

/** Form drafts are local; the server rechecks the deployment revision and all sizing constraints. */
export function readConfiguration(data: SizingOptions, form: FormData): TargetConfiguration {
  const deployment = data.deployment;
  if (!data.supported || !deployment) throw new Error("TARGET_SIZING_UNAVAILABLE");
  const sizing: Record<string, string | number | boolean> = {};
  for (const [key, rule] of Object.entries(data.parameters)) {
    const raw = form.get(`sizing.${key}`);
    if (typeof raw !== "string" || !raw.trim()) throw new Error("INVALID_SIZING");
    let value: string | number | boolean = raw;
    if (rule.type === "integer") {
      value = Number(raw);
      if (
        !Number.isSafeInteger(value) ||
        (rule.minimum !== undefined && value < rule.minimum) ||
        (rule.maximum !== undefined && value > rule.maximum)
      )
        throw new Error("INVALID_SIZING");
    } else if (rule.type === "boolean") {
      if (raw !== "true" && raw !== "false") throw new Error("INVALID_SIZING");
      value = raw === "true";
    } else if (rule.enum && !rule.enum.includes(raw)) throw new Error("INVALID_SIZING");
    if (value !== deployment.sizing[key]) sizing[key] = value;
  }
  const cpu = Number(form.get("app.cpu"));
  const memoryMiB = Number(form.get("app.memoryMiB"));
  if (
    !data.appOptions.cpu.includes(cpu) ||
    !Number.isSafeInteger(memoryMiB) ||
    memoryMiB <= 0 ||
    memoryMiB % data.appOptions.memoryStepMiB !== 0
  )
    throw new Error("INVALID_SIZING");
  return targetConfigurationSchema.parse({
    environmentId: deployment.environmentId,
    expectedUpdatedAt: deployment.updatedAt,
    sizing,
    app: { cpu, memoryMiB },
  });
}
