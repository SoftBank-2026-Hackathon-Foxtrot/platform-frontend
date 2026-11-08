import MockAdapter from "axios-mock-adapter";
import { QueryClient } from "@tanstack/react-query";
import { afterEach, beforeEach, expect, test, vi } from "vite-plus/test";
import { ZodError } from "zod";
import { apiClient, setCsrfToken } from "@/shared/api";
import {
  managedInputSchema,
  appAuditOptions,
  saveManagedApplication,
  connectManagedResources,
  verifyManagedApplication,
  archiveManagedApplication,
  managedApplicationsOptions,
  type ManagedApplication,
} from "@/entities/application";
import { commandWorkflow, createWorkflow } from "@/entities/migration";
import { sessionOptions, logout } from "@/entities/session";
import { workspaceOptions } from "@/entities/workspace";
import { createAiDemo } from "./mocks/ai";
import { setLocale } from "@/shared/lib/i18n";

const image = {
  imageRef: `registry/app@sha256:${"a".repeat(64)}`,
  port: 8000,
  cpu: 256,
  memory: 512,
  architecture: "ARM64" as const,
  registryCredentialRef: null,
  environment: {},
  secretRefs: {},
};
const app: ManagedApplication = {
  id: "app-one",
  ownerId: "github:12",
  name: "goods",
  image,
  version: 7,
  status: "REGISTERED",
  configuration: null,
  policy: {
    allowedDirections: [],
    maxQuiesceSeconds: 300,
    requireTargetReady: true,
    allowTargetWriteRollback: false,
  },
  verifiedAt: null,
  createdAt: "2026-11-07T00:00:00Z",
  updatedAt: "2026-11-07T00:00:00Z",
};
const detail = {
  workflow: {
    id: "wf-one",
    application: app.id,
    ownerId: app.ownerId,
    sourceEnv: "aws",
    targetEnv: "gcp",
    version: 4,
    currentStage: 0,
    createdAt: app.createdAt,
    createdBy: "user",
    finishedAt: null,
    status: "PLANNED" as const,
    halt: null,
    reconcileRequested: false,
    rolledBack: [],
  },
  allowedCommands: ["APPROVE", "ABORT"],
  stages: [],
  resources: [],
  traffic: [],
  hold: { desired: "RUN", generation: 0, heldSince: null, actors: [] },
};
let mock: MockAdapter;
const query = new QueryClient({ defaultOptions: { queries: { retry: false } } });
beforeEach(() => {
  mock = new MockAdapter(apiClient);
  setCsrfToken("session-csrf");
});
afterEach(() => {
  mock.restore();
  setCsrfToken(null);
  query.clear();
});

test("실제 등록 요청은 고정 이미지와 세션 CSRF·멱등 키를 보낸다", async () => {
  mock.onPost("/v1/applications").reply((config) => {
    expect(config.headers?.["X-CSRF-Token"]).toBe("session-csrf");
    expect(config.headers?.["Idempotency-Key"]).toBe("same-request");
    expect(JSON.parse(config.data)).toEqual({ name: app.name, image });
    return [201, app];
  });
  expect(
    (await saveManagedApplication({ name: app.name, image }, undefined, "same-request")).id,
  ).toBe(app.id);
});

test("태그와 과거 저장소 기반 앱 계약을 실제 앱으로 받아들이지 않는다", async () => {
  expect(
    managedInputSchema.safeParse({ name: "goods", image: { ...image, imageRef: "goods:latest" } })
      .success,
  ).toBe(false);
  mock.onGet("/v1/applications").reply(200, [{ id: "demo", repositoryId: "repo" }]);
  await expect(query.fetchQuery(managedApplicationsOptions("personal:one"))).rejects.toBeInstanceOf(
    ZodError,
  );
});

test("수정·해제는 최신 버전을 Expected-Version 헤더에 보낸다", async () => {
  mock.onPatch(`/v1/applications/${app.id}`).reply((config) => {
    expect(config.headers?.["Expected-Version"]).toBe("7");
    expect(JSON.parse(config.data)).not.toHaveProperty("expectedRevision");
    return [200, { ...app, version: 8 }];
  });
  await saveManagedApplication({ name: app.name, image }, app, "update");
  mock.onDelete(`/v1/applications/${app.id}`).reply((config) => {
    expect(config.headers?.["Expected-Version"]).toBe("7");
    return [200, { ...app, status: "ARCHIVED", version: 8 }];
  });
  expect((await archiveManagedApplication(app, "archive")).status).toBe("ARCHIVED");
});

test("리소스 연결은 서버 카탈로그 선택만 요청하며 검증 실패를 보존한다", async () => {
  mock.onPut(`/v1/applications/${app.id}/resources`).reply((config) => {
    expect(JSON.parse(config.data)).toEqual({ expectedVersion: 7 });
    return [200, app];
  });
  await connectManagedResources(app, "bind");
  mock.onPost(`/v1/applications/${app.id}/verify`).reply(200, {
    applicationId: app.id,
    version: 8,
    passed: false,
    checks: { imageAccess: false },
    blockers: ["imageAccess"],
  });
  expect(await verifyManagedApplication(app, "verify")).toMatchObject({
    passed: false,
    blockers: ["imageAccess"],
  });
});

test("워크플로 생성·명령은 공통 백엔드 경로와 expectedVersion을 사용한다", async () => {
  mock.onPost("/v1/workflows").reply((config) => {
    expect(JSON.parse(config.data)).toEqual({
      applicationId: app.id,
      sourceEnv: "aws",
      targetEnv: "gcp",
    });
    return [201, detail];
  });
  const result = await createWorkflow(
    { applicationId: app.id, sourceEnv: "aws", targetEnv: "gcp" },
    "create",
  );
  mock.onPost("/v1/workflows/wf-one/commands").reply((config) => {
    expect(JSON.parse(config.data)).toEqual({
      command: "ROLLBACK_RESOURCE",
      expectedVersion: 4,
      resourceId: "REDIS",
      mode: "normal",
    });
    expect(config.headers?.["Idempotency-Key"]).toBe("rollback-request");
    return [200, detail];
  });
  await commandWorkflow(result.workflow, "ROLLBACK_RESOURCE", "REDIS", "rollback-request");
});

test("실제 세션과 workspace 목록을 읽고 로그아웃에 CSRF를 사용한다", async () => {
  mock.onGet("/v1/me").reply(200, {
    user: { id: "github:12", login: "user" },
    csrfToken: "fresh-token",
    expiresAt: app.createdAt,
  });
  const session = await query.fetchQuery(sessionOptions());
  expect(session).toMatchObject({ workspaceId: "personal:github:12", demo: false });
  mock
    .onGet("/v1/workspaces")
    .reply(200, [{ id: "personal:github:12", name: "user", role: "owner" }]);
  expect((await query.fetchQuery(workspaceOptions("personal:github:12"))).id).toBe(
    "personal:github:12",
  );
  mock.onPost("/auth/logout").reply((config) => {
    expect(config.headers?.["X-CSRF-Token"]).toBe("fresh-token");
    return [204];
  });
  await logout();
});

test("감사 이력의 다음 커서를 서버에 보내고 페이지 캐시를 분리한다", async () => {
  mock.onGet(`/v1/applications/${app.id}/events`).reply((config) => {
    expect(config.params.limit).toBe(100);
    const after = config.params.after;
    return [
      200,
      {
        events: [{ type: after ? "SECOND" : "FIRST", at: app.createdAt }],
        nextCursor: after ? null : "cursor-one",
      },
    ];
  });
  const first = await query.fetchQuery(appAuditOptions("personal:one", app.id));
  const second = await query.fetchQuery(appAuditOptions("personal:one", app.id, first.nextCursor));
  expect(first.events[0]?.type).toBe("FIRST");
  expect(second.events[0]?.type).toBe("SECOND");
  expect(second.nextCursor).toBeNull();
});

test("AI 데모는 추천부터 배포 접수와 앱 정상 응답 확인까지 연결한다", () => {
  const clock = vi.spyOn(Date, "now").mockReturnValue(10000);
  try {
    setLocale("en");
    const demo = createAiDemo();
    const result = demo.handle("post", "/v1/ai/recommendations", {
      applicationId: "app-chiikawa",
      sourceDeploymentId: "env-333333333333",
      targetEnvironment: "gcp",
    })!;
    expect(demo.handle("get", "/v1/ai/deployments")?.[1]).toEqual(
      expect.objectContaining({
        deployments: expect.arrayContaining([expect.objectContaining({ environment: "onprem" })]),
      }),
    );
    const onpremAnalysis = demo.handle("post", "/v1/ai/analyses", {
      deploymentId: "env-333333333333",
    });
    expect(onpremAnalysis).toEqual([200, expect.objectContaining({ environment: "onprem" })]);
    expect(
      demo.handle("post", "/v1/ai/recommendations", {
        sourceDeploymentId: "env-333333333333",
        targetEnvironment: "onprem",
      })?.[0],
    ).toBe(422);
    expect(result[0]).toBe(200);
    expect(JSON.stringify(result[1])).toContain("UI demo example");
    expect(JSON.stringify(result[1])).not.toMatch(/[가-힣]/);
    const { iac } = result[1] as { iac: { endpoint: string; body: Record<string, unknown> } };
    expect(iac.endpoint).toBe("/v1/provisioning/environments/env-222222222222/update");
    const accepted = demo.handle("post", iac.endpoint, iac.body, "demo-deploy")!;
    expect(accepted[0]).toBe(202);
    expect(demo.handle("post", iac.endpoint, iac.body, "demo-deploy")).toEqual(accepted);
    const { jobId, environmentId } = accepted[1] as { jobId: string; environmentId: string };
    const jobPath = "/v1/provisioning/jobs/" + jobId;
    const environmentPath = "/v1/provisioning/environments/" + environmentId;
    expect(demo.handle("get", jobPath)).toEqual([
      200,
      expect.objectContaining({ status: "QUEUED" }),
    ]);
    clock.mockReturnValue(15000);
    expect(demo.handle("get", jobPath)).toEqual([
      200,
      expect.objectContaining({ status: "SUCCEEDED" }),
    ]);
    expect(demo.handle("get", environmentPath)).toEqual([
      200,
      expect.objectContaining({ status: "VERIFYING_APP" }),
    ]);
    clock.mockReturnValue(17000);
    expect(demo.handle("get", environmentPath)).toEqual([
      200,
      expect.objectContaining({ status: "READY" }),
    ]);
    setLocale("ja");
    const reply = demo.handle("post", "/v1/ai/chat", {
      deploymentId: "env-111111111111",
      message: "クラウド移行",
    })!;
    expect(JSON.stringify(reply[1])).toContain("移行前");
    expect(JSON.stringify(reply[1])).not.toMatch(/[가-힣]/);
  } finally {
    setLocale("ko");
    clock.mockRestore();
  }
});
