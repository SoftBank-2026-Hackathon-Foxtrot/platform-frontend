import { t } from "@/shared/lib/i18n";

// UI fixtures only. This module is installed exclusively by VITE_API_MODE=demo.
const scope = "USER_DEPLOYED_APPLICATIONS_V2";
const app = "app-chiikawa";
const deployments = [
  {
    environmentId: "env-111111111111",
    deploymentId: "chiikawa-aws-demo",
    applicationId: app,
    environment: "aws",
    status: "READY",
    appliedAt: "2026-11-07T09:00:00Z",
  },
  {
    environmentId: "env-222222222222",
    deploymentId: "chiikawa-gcp-demo",
    applicationId: app,
    environment: "gcp",
    status: "READY",
    appliedAt: "2026-11-07T09:00:00Z",
  },
  {
    environmentId: "env-333333333333",
    deploymentId: "chiikawa-onprem-demo",
    applicationId: app,
    environment: "onprem",
    status: "READY",
    appliedAt: "2026-11-07T09:00:00Z",
  },
];
type Reply = [number, unknown];
function id(prefix: string) {
  return prefix + crypto.randomUUID().replaceAll("-", "");
}
function analysis(deploymentId: string, timeRange?: unknown) {
  const end = new Date();
  return {
    analysisId: id("analysis_"),
    applicationId: app,
    sourceDeploymentId: deploymentId,
    environment: deployments.find((d) => d.environmentId === deploymentId)?.environment ?? "aws",
    timeRange: timeRange ?? {
      start: new Date(end.getTime() - 3600000).toISOString(),
      end: end.toISOString(),
    },
    focus: ["RESOURCES", "PERFORMANCE", "ERRORS"],
    status: "COMPLETED",
    summary: t(
      "화면 데모용 예제입니다. CPU P95는 28%, 메모리 관측 최대값은 620 MiB입니다. 실제 운영 지표를 조회한 결과는 아닙니다.",
    ),
    findings: [
      {
        category: "RESOURCE",
        severity: "INFO",
        description: t(
          "예제 구간에서는 CPU와 메모리에 여유가 있습니다. 실제 사양 변경은 운영 지표를 확인한 뒤 결정하세요.",
        ),
        evidenceKeys: ["metrics.cpuP95Percent", "metrics.memoryPeakMiB"],
      },
    ],
    metrics: {
      cpuP95Percent: 28,
      memoryPeakMiB: 620,
      requestP95Ms: 86,
      requestRatePerSecond: 42,
      databaseP95Ms: 8.2,
      redisP95Ms: 1.4,
      errorRatePercent: 0.03,
    },
    dataQuality: {
      coveragePercent: 100,
      missingMetrics: [],
      metrics: {
        cpuP95Percent: { state: "OK", source: "DEMO_FIXTURE", temporalCoveragePercent: 100 },
        memoryPeakMiB: { state: "OK", source: "DEMO_FIXTURE", temporalCoveragePercent: 100 },
      },
    },
    traces: [],
    tracesState: "NOT_CONFIGURED",
    createdAt: end.toISOString(),
  };
}
export function createAiDemo() {
  const jobs = new Map<string, { environmentId: string; startedAt: number }>();
  const acceptedRequests = new Map<string, { body: string; response: unknown }>();
  function environmentState(environmentId: string) {
    const deployment = deployments.find((item) => item.environmentId === environmentId);
    if (!deployment) return;
    const latest = [...jobs.values()].filter((item) => item.environmentId === environmentId).at(-1);
    const elapsed = latest ? Date.now() - latest.startedAt : 6000;
    return {
      ...deployment,
      status:
        elapsed < 1500
          ? "PLANNING"
          : elapsed < 4500
            ? "APPLYING"
            : elapsed < 6000
              ? "VERIFYING_APP"
              : "READY",
      error: null,
      readiness: { application: { status: elapsed < 6000 ? "PENDING" : "READY" } },
    };
  }
  const conversations = new Map<
    string,
    {
      applicationId: string;
      environments: string[];
      deploymentId: string;
      recentTurns: { user: string; assistant: unknown; createdAt: string }[];
    }
  >();
  return {
    handle(
      method: string,
      path: string,
      body: Record<string, unknown> = {},
      key?: string,
    ): Reply | undefined {
      const update = path.match(/^\/v1\/provisioning\/environments\/(env-[a-f0-9]{12})\/update$/);
      if (update && method === "post") {
        const requestBody = JSON.stringify({ path, body });
        const seen = key ? acceptedRequests.get(key) : undefined;
        if (seen)
          return seen.body === requestBody
            ? [202, seen.response]
            : [409, { message: t("같은 요청 키에 다른 사양을 보낼 수 없습니다.") }];
        const environmentId = update[1]!;
        const environment = environmentState(environmentId);
        if (!environment) return [404, { message: t("대상 데모 배포가 없습니다.") }];
        if (environment.status !== "READY")
          return [409, { message: t("이미 배포가 진행 중입니다.") }];
        const jobId = "job-" + crypto.randomUUID().replaceAll("-", "").slice(0, 12);
        jobs.set(jobId, { environmentId, startedAt: Date.now() });
        const response = { environmentId, jobId, status: "PLANNING" };
        if (key) acceptedRequests.set(key, { body: requestBody, response });
        return [202, response];
      }
      const jobMatch = path.match(/^\/v1\/provisioning\/jobs\/(job-[a-f0-9]{12})$/);
      if (jobMatch && method === "get") {
        const job = jobs.get(jobMatch[1]!);
        if (!job) return [404, { message: t("배포 작업이 없습니다.") }];
        const elapsed = Date.now() - job.startedAt;
        return [
          200,
          {
            jobId: jobMatch[1],
            environmentId: job.environmentId,
            status: elapsed < 1500 ? "QUEUED" : elapsed < 4500 ? "RUNNING" : "SUCCEEDED",
            error: null,
          },
        ];
      }
      const environmentMatch = path.match(/^\/v1\/provisioning\/environments\/(env-[a-f0-9]{12})$/);
      if (environmentMatch && method === "get") {
        const environment = environmentState(environmentMatch[1]!);
        return environment
          ? [200, environment]
          : [404, { message: t("대상 데모 배포가 없습니다.") }];
      }
      if (!path.startsWith("/v1/ai/")) return;
      if (path === "/v1/ai/status" && method === "get")
        return [
          200,
          {
            configured: true,
            model: t("DEMO · 예제 응답"),
            prometheusConfigured: true,
            tempoConfigured: false,
            retentionDays: 30,
            sizingEnvironments: ["aws", "gcp"],
            dataScope: scope,
          },
        ];
      if (path === "/v1/ai/deployments" && method === "get")
        return [
          200,
          {
            dataScope: scope,
            deployments: deployments.map((item) => environmentState(item.environmentId)),
          },
        ];
      if (path.startsWith("/v1/ai/conversations/") && method === "get") {
        const conversationId = path.split("/").at(-1)!;
        const stored = conversations.get(conversationId);
        return stored
          ? [200, { conversationId, ...stored }]
          : [404, { message: t("대화를 찾을 수 없습니다.") }];
      }
      const rawDeployment = body.deploymentId ?? body.sourceDeploymentId;
      const deploymentId = typeof rawDeployment === "string" ? rawDeployment : "";
      const deployment = deployments.find((d) => d.environmentId === deploymentId);
      if (!deployment) return [404, { message: t("선택한 데모 배포가 없습니다.") }];
      if (path === "/v1/ai/chat" && method === "post") {
        const conversationId =
          typeof body.conversationId === "string" ? body.conversationId : id("conv_");
        const question = typeof body.message === "string" ? body.message : "";
        const answer = /옮기|이전|마이그레이션|cloud|migration|移行|クラウド/i.test(question)
          ? t(
              "이전 전에 앱, DB, Redis와 파일 저장소의 연결을 확인하세요.\n\n대상 리소스를 준비하고 변경분 복제가 따라잡으면 컷오버를 승인합니다. 전환 뒤에는 롤백 또는 전환 완료를 선택합니다.\n\n이 답변은 화면 데모용 예제이며 실제 배포 상태를 조회하지 않았습니다.",
            )
          : t(
              "선택한 예제 앱의 구성입니다.\n\n• 앱: CPU 1 vCPU · 메모리 2 GiB\n• 데이터베이스: PostgreSQL\n• 캐시: Redis\n• CPU P95: 28% · 메모리 최대: 620 MiB\n\n실제 운영 데이터가 아닌 화면 데모용 예제입니다. 지표 분석과 사양 추천도 위에서 직접 확인할 수 있습니다.",
            );
        const response = {
          conversationId,
          messageId: id("msg_"),
          answer,
          sources: [
            { id: "demo-deployment", type: "DEMO_FIXTURE", observedAt: new Date().toISOString() },
          ],
          warnings: [],
          createdAt: new Date().toISOString(),
        };
        const conversation = conversations.get(conversationId) ?? {
          applicationId: app,
          environments: [deployment.environment],
          deploymentId,
          recentTurns: [],
        };
        conversation.recentTurns.push({
          user: question,
          assistant: response,
          createdAt: response.createdAt,
        });
        conversations.set(conversationId, conversation);
        return [200, response];
      }
      if (path === "/v1/ai/analyses" && method === "post")
        return [200, analysis(deploymentId, body.timeRange)];
      if (path === "/v1/ai/recommendations" && method === "post") {
        if (body.targetEnvironment !== "aws" && body.targetEnvironment !== "gcp")
          return [422, { message: t("온프렘 대상 사양 추천은 아직 지원하지 않습니다.") }];
        const target = body.targetEnvironment === "aws" ? deployments[0]! : deployments[1]!;
        const result = analysis(deploymentId);
        return [
          200,
          {
            recommendationId: id("rec_"),
            applicationId: app,
            dataScope: scope,
            status: "COMPLETED",
            sourceDeploymentId: deploymentId,
            targetEnvironment: target.environment,
            targetDeploymentId: target.environmentId,
            analysisStatus: "COMPLETED",
            basis: "TELEMETRY",
            analysis: result,
            proposal: { cloud: target.environment, parameters: {}, rationale: {} },
            appProposal: {
              parameters: { cpu: 1, memory_mib: 2048 },
              rationale: {
                cpu: t("예제 사용량에 CPU 여유를 둡니다."),
                memory_mib: t("예제 메모리 사용량과 여유 공간을 반영합니다."),
              },
            },
            iac: {
              action: "UPDATE",
              endpoint: "/v1/provisioning/environments/" + target.environmentId + "/update",
              body: { app: { cpu: 1, memoryMiB: 2048 } },
            },
            warnings: [t("화면 데모용 예제입니다. 실제 분석이나 배포는 실행하지 않았습니다.")],
            createdAt: new Date().toISOString(),
          },
        ];
      }
      return [404, { message: t("지원하지 않는 AI 데모 API입니다.") }];
    },
  };
}
