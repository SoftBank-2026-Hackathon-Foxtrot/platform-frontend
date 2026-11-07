import MockAdapter from "axios-mock-adapter";
import { apiClient } from "@/shared/api";
import { monitoringDemoReply } from "./monitoring";
import { createDemoBackend } from "./backend";

export function installDemoApi() {
  const backend = createDemoBackend(localStorage);
  const adapter = new MockAdapter(apiClient, { delayResponse: 180, onNoMatch: "throwException" });
  adapter.onAny().reply((config) => {
    const params = new URLSearchParams(config.params as Record<string, string> | undefined);
    const path = `${config.url || "/"}${params.size ? `?${params}` : ""}`;
    if (config.method === "get") {
      const response = monitoringDemoReply(path);
      if (response) return response;
    }
    let body: Record<string, unknown> = {};
    try {
      body = typeof config.data === "string" ? JSON.parse(config.data) : config.data || {};
    } catch {
      return [400, { message: "요청 형식을 확인하세요." }];
    }
    return backend.handle(
      config.method || "get",
      path,
      body,
      config.headers?.["Idempotency-Key"] as string | undefined,
    );
  });
  return adapter;
}
