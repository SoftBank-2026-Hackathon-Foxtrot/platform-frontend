import { z } from "zod";

const anchor = z
  .string()
  .max(5000)
  .regex(/^(migration|node|resource|event)-[\w%.-]+$/);
export const migrationViewSchema = z.object({
  expanded: z.boolean().optional().catch(undefined),
  eventCursor: z.string().max(500).optional().catch(undefined),
  resume: z.string().max(100).optional().catch(undefined),
});
export type MigrationView = z.infer<typeof migrationViewSchema>;
export const monitoringOriginSchema = z.object({
  workflow: z.string().min(1).max(200),
  label: z.string().min(1).max(300),
  anchor,
  visit: z.string().min(1).max(100),
  expanded: z.boolean().optional(),
  eventCursor: z.string().max(500).optional(),
});
export type MonitoringOrigin = z.infer<typeof monitoringOriginSchema>;
export function migrationReturn(origin: MonitoringOrigin) {
  return {
    id: origin.workflow,
    hash: origin.anchor,
    search: { expanded: origin.expanded, eventCursor: origin.eventCursor, resume: origin.visit },
  };
}
export function eventAnchor(cursor: string) {
  return `event-${encodeURIComponent(cursor)}`;
}
