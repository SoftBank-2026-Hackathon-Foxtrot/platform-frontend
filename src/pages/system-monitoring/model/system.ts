import { z } from "zod";
export const categories = {
  cpu: "CPU",
  memory: "메모리",
  disk: "디스크",
  network: "네트워크",
} as const;
export const systemSearchSchema = z.object({
  app: z.string().max(128).optional(),
  env: z.string().max(64).optional(),
  deployment: z.string().max(128).optional(),
  instance: z.string().max(128).optional(),
  category: z.enum(["cpu", "memory", "disk", "network"]).catch("cpu"),
  minutes: z.union([z.literal(15), z.literal(60), z.literal(360)]).catch(15),
  workflow: z.string().max(128).optional(),
});
export type SystemSearch = z.infer<typeof systemSearchSchema>;
export const titles: Record<string, string> = {
  cpu: "CPU 사용률",
  cpu_cores: "CPU 사용량",
  memory: "메모리 사용률",
  memory_bytes: "메모리 사용량",
  disk_usage: "디스크 사용률 (/)",
  disk_read: "디스크 읽기",
  disk_write: "디스크 쓰기",
  network_receive: "네트워크 수신",
  network_transmit: "네트워크 송신",
};
export function chartPath(
  points: [number, number | null][],
  from: number,
  to: number,
  max: number,
  step: number,
) {
  let path = "",
    previous: number | null = null;
  for (const [at, value] of points) {
    if (value === null) {
      previous = null;
      continue;
    }
    const x = 50 + ((at - from) / Math.max(1, to - from)) * 390;
    const y = 150 - (value / max) * 125;
    path += `${previous === null || at - previous > step * 1.5 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)} `;
    previous = at;
  }
  return path;
}

export function selectDeployment<
  T extends {
    environmentId: string;
    cloud: string;
    status: string;
    collection?: "REPORTING" | "NOT_REPORTING" | "UNKNOWN";
  },
>(choices: T[], search: Pick<SystemSearch, "deployment" | "env">): T | undefined {
  if (search.deployment) return choices.find((row) => row.environmentId === search.deployment);
  const matching = choices.filter(
    (row) => (!search.env || row.cloud === search.env) && row.status !== "DESTROYED",
  );
  return matching.find((row) => row.collection === "REPORTING") ?? matching[0];
}
