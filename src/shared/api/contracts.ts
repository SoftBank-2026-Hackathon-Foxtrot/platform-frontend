import { z } from "zod";
export const providerSchema = z.enum(["AWS", "GCP", "ONPREM"]);
export type Provider = z.infer<typeof providerSchema>;
export const providers: Record<Provider, string> = {
  AWS: "AWS",
  GCP: "Google Cloud",
  ONPREM: "온프레미스",
};
export const resourceSchema = z.enum(["database", "redis", "storage", "application"]);
export type Resource = z.infer<typeof resourceSchema>;
export const resourceNames: Record<Resource, string> = {
  database: "PostgreSQL",
  redis: "Redis",
  storage: "객체 스토리지",
  application: "애플리케이션",
};
export const eventSchema = z.object({ at: z.number(), message: z.string() });
export const commandHeaders = () => ({ "Idempotency-Key": crypto.randomUUID() });
