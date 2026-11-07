import MockAdapter from "axios-mock-adapter";
import { afterEach, describe, expect, it } from "vite-plus/test";
import { apiClient, setCsrfToken } from "@/shared/api";
import { aiKeys, analyse, chat, deploymentOptions, recommend, statusOptions } from "./ai";

const mock = new MockAdapter(apiClient);
const at = "2026-11-08T00:00:00Z";
const deployment = "env-aaaaaaaaaaaa";
const analysis = {
  analysisId: "analysis_1",
  applicationId: "goods",
  sourceDeploymentId: deployment,
  environment: "aws",
  timeRange: { start: "2026-11-07T23:00:00Z", end: at },
  focus: ["RESOURCES"],
  status: "INSUFFICIENT_DATA",
  summary: "관측 지표가 없습니다.",
  findings: [],
  metrics: { cpuP95Percent: null, memoryPeakMiB: null },
  dataQuality: {
    coveragePercent: 0,
    missingMetrics: ["cpuP95Percent", "memoryPeakMiB"],
    metrics: {},
  },
  traces: [],
  tracesState: "NOT_CONFIGURED",
  createdAt: at,
};
afterEach(() => {
  mock.reset();
  setCsrfToken(null);
});
describe("AI API boundary", () => {
  it("sends a deployment-scoped chat with CSRF, the supplied idempotency key and a model timeout", async () => {
    setCsrfToken("session-csrf");
    mock.onPost("/v1/ai/chat").reply((request) => {
      expect(JSON.parse(request.data)).toEqual({
        applicationId: "goods",
        deploymentId: deployment,
        environments: ["aws"],
        message: "현재 사양",
      });
      expect(request.headers?.["X-CSRF-Token"]).toBe("session-csrf");
      expect(request.headers?.["Idempotency-Key"]).toBe("same-submission");
      expect(request.timeout).toBeGreaterThan(120000);
      return [
        200,
        {
          conversationId: "conv_1",
          messageId: "msg_1",
          answer: "CPU 1코어",
          sources: [],
          warnings: [],
          createdAt: at,
        },
      ];
    });
    expect(
      (
        await chat(
          {
            applicationId: "goods",
            deploymentId: deployment,
            environments: ["aws"],
            message: "현재 사양",
          },
          "same-submission",
        )
      ).answer,
    ).toBe("CPU 1코어");
  });
  it("keeps missing measurements null and accepts a blocked recommendation without a deployment action", async () => {
    mock.onPost("/v1/ai/analyses").reply(200, analysis);
    const readings = await analyse(
      {
        applicationId: "goods",
        deploymentId: deployment,
        timeRange: analysis.timeRange,
        focus: ["RESOURCES"],
      },
      "analysis-key",
    );
    expect(readings.metrics.cpuP95Percent).toBeNull();
    mock.onPost("/v1/ai/recommendations").reply((request) => {
      expect(JSON.parse(request.data).sourceDeploymentId).toBe(deployment);
      return [
        200,
        {
          recommendationId: "rec_1",
          applicationId: "goods",
          dataScope: "USER_DEPLOYED_APPLICATIONS_V2",
          sourceDeploymentId: deployment,
          targetEnvironment: "gcp",
          status: "INSUFFICIENT_DATA",
          basis: "TELEMETRY",
          analysis,
          proposal: null,
          appProposal: null,
          missingRequiredMetrics: ["cpuP95Percent"],
          warnings: [],
          createdAt: at,
        },
      ];
    });
    const result = await recommend(
      { applicationId: "goods", sourceDeploymentId: deployment, targetEnvironment: "gcp" },
      "recommendation-key",
    );
    expect(result.status).toBe("INSUFFICIENT_DATA");
    expect(result.appProposal).toBeNull();
    expect(result.iac).toBeUndefined();
    expect(mock.history.post.map((request) => request.url)).toEqual([
      "/v1/ai/analyses",
      "/v1/ai/recommendations",
    ]);
  });
  it("isolates account caches and propagates an unavailable API without demo data", async () => {
    expect(aiKeys.conversation("one", deployment, "conv_1")).not.toEqual(
      aiKeys.conversation("two", deployment, "conv_1"),
    );
    expect(deploymentOptions("one", true).retry).toBe(false);
    mock.onGet("/v1/ai/status").reply(404, { code: "NOT_FOUND" });
    const options = statusOptions("one");
    await expect(
      options.queryFn!({ signal: new AbortController().signal } as never),
    ).rejects.toThrow();
    expect(mock.history.get).toHaveLength(1);
  });
});
