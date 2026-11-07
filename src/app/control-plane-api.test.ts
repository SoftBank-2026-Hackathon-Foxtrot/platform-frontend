import MockAdapter from "axios-mock-adapter";
import { QueryClient } from "@tanstack/react-query";
import { afterEach, beforeEach, expect, test } from "vite-plus/test";
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
    status: "RUNNING" as const,
    halt: null,
    reconcileRequested: false,
    rolledBack: [],
  },
  allowedCommands: ["HALT", "ABORT"],
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
  expect(result.workflow.status).toBe("RUNNING");
  expect(result.allowedCommands).not.toContain("APPROVE");
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

test("선택한 대상 사양은 별도 배포 요청 없이 마이그레이션 계획에 포함한다", async () => {
  const targetConfiguration = {
    environmentId: "env-aaaaaaaaaaaa",
    expectedUpdatedAt: "2026-11-08T00:00:00Z",
    sizing: { db_storage_gib: 40 },
    app: { cpu: 2, memoryMiB: 4096 },
  };
  mock.onPost("/v1/workflows").reply((config) => {
    expect(JSON.parse(config.data)).toEqual({
      sourceEnv: "aws",
      targetEnv: "gcp",
      targetConfiguration,
    });
    expect(config.headers?.["Idempotency-Key"]).toBe("sized-plan");
    return [201, detail];
  });
  await createWorkflow({ sourceEnv: "aws", targetEnv: "gcp", targetConfiguration }, "sized-plan");
  expect(mock.history.post.map((request) => request.url)).toEqual(["/v1/workflows"]);
});
test.each(["ROLLBACK", "FINALIZE"] as const)(
  "컷오버 이후 %s 명령은 리소스 선택 없이 전체 작업에 보낸다",
  async (command) => {
    const cutover = {
      ...detail,
      workflow: { ...detail.workflow, status: "CUTOVER_COMPLETE", currentStage: 7 },
      allowedCommands: ["ROLLBACK", "FINALIZE"],
    };
    mock.onPost("/v1/workflows").reply(201, cutover);
    const result = await createWorkflow({ sourceEnv: "aws", targetEnv: "gcp" }, "create");
    expect(result.allowedCommands).toEqual(["ROLLBACK", "FINALIZE"]);
    mock.onPost("/v1/workflows/wf-one/commands").reply((config) => {
      expect(JSON.parse(config.data)).toEqual({ command, expectedVersion: 4 });
      expect(config.headers?.["Idempotency-Key"]).toBe("finish-request");
      return [
        200,
        {
          ...cutover,
          workflow: {
            ...cutover.workflow,
            status: command === "ROLLBACK" ? "ROLLED_BACK" : "COMPLETED",
            rollback: command === "ROLLBACK" ? { resource: null } : null,
          },
          allowedCommands: [],
        },
      ];
    });
    const response = await commandWorkflow(result.workflow, command, undefined, "finish-request");
    expect(response.workflow.status).toBe(command === "ROLLBACK" ? "ROLLED_BACK" : "COMPLETED");
    expect(response.allowedCommands).toEqual([]);
  },
);

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
