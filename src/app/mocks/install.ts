import MockAdapter from "axios-mock-adapter";
import { apiClient } from "@/shared/api";
import { monitoringDemoReply } from "./monitoring";
import { createAiDemo } from "./ai";
import { createDemoBackend } from "./backend";

export function installDemoApi() {
  const backend = createDemoBackend(localStorage);
  const ai = createAiDemo();
  if (new URLSearchParams(window.location.search).get("preview") === "ai") {
    backend.handle("post", "/auth/demo/login");
  }
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
    if (path.startsWith("/v1/ai/") || path.startsWith("/v1/provisioning/")) {
      if (backend.handle("get", "/v1/me")[0] !== 200)
        return [401, { message: "로그인이 필요합니다." }];
      const response = ai.handle(
        config.method || "get",
        path,
        body,
        config.headers?.["Idempotency-Key"] as string | undefined,
      );
      if (response) return response;
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
