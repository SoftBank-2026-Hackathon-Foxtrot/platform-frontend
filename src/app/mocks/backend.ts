import { z } from "zod";
import {
  applicationInputSchema,
  applicationSchema,
  type Application,
} from "@/entities/application";
import {
  migrationInputSchema,
  migrationActionSchema,
  migrationSchema,
  type Migration,
} from "@/entities/migration";
import { sessionSchema } from "@/entities/session";
import { workspaceSchema } from "@/entities/workspace";
import { resourceNames, type Provider, type Resource } from "@/shared/api";

export const demoStorageKey = "foxtrot-platform-demo-v1";
const repositories = [
  {
    id: "repo-chiikawa",
    name: "foxtrot-demo/chiikawa-reservations",
    language: "Python",
    branches: ["main", "develop"],
  },
  {
    id: "repo-orders",
    name: "foxtrot-demo/orders-api",
    language: "Python",
    branches: ["main", "staging"],
  },
  {
    id: "repo-storefront",
    name: "foxtrot-demo/storefront",
    language: "TypeScript",
    branches: ["main", "develop"],
  },
];
const regions: Record<Provider, string> = {
  AWS: "ap-northeast-2",
  GCP: "asia-northeast3",
  ONPREM: "seoul-dc-01",
};
const resourceOrder: Resource[] = ["database", "redis", "storage", "application"];
const stateSchema = z.object({
  version: z.literal(1),
  signedIn: z.boolean(),
  workspace: workspaceSchema,
  applications: z.array(applicationSchema),
  migrations: z.array(migrationSchema),
  commands: z.record(z.string(), z.object({ fingerprint: z.string(), result: z.unknown() })),
});
type State = z.infer<typeof stateSchema>;
type StorageLike = Pick<Storage, "getItem" | "setItem">;
type Reply = [number, unknown];

function seed(now: number): State {
  return {
    version: 1,
    signedIn: false,
    workspace: {
      id: "workspace-demo",
      name: "Foxtrot",
      githubConnected: false,
      connections: resourceOrder.slice(0, 3).map((_, index) => {
        const provider = (["AWS", "GCP", "ONPREM"] as const)[index]!;
        return { provider, connected: true, region: regions[provider] };
      }),
    },
    applications: [
      {
        id: "app-chiikawa",
        workspaceId: "workspace-demo",
        name: "chiikawa-reservations",
        repositoryId: "repo-chiikawa",
        repository: repositories[0]!.name,
        branch: "main",
        root: ".",
        dockerfile: "Dockerfile",
        port: 8000,
        healthPath: "/health",
        provider: "AWS",
        region: regions.AWS,
        environment: "production",
        env: "APP_ENV=production\nLOG_LEVEL=info",
        resources: [...resourceOrder],
        placements: { database: "AWS", redis: "AWS", storage: "AWS", application: "AWS" },
        status: "RUNNING",
        revision: 1,
        createdAt: now,
        updatedAt: now,
        deployments: [
          {
            id: "deploy-initial",
            status: "SUCCEEDED",
            revision: 1,
            createdAt: now,
            image: "demo/chiikawa-reservations:v1",
            fail: false,
            events: [
              {
                at: now,
                message: "예제 앱이 AWS에서 실행 중입니다. 실제 클라우드 요청은 하지 않습니다.",
              },
            ],
          },
        ],
      },
    ],
    migrations: [],
    commands: {},
  };
}

class ApiFailure extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
function requireValue<T>(value: T | undefined, message = "대상을 찾지 못했습니다."): T {
  if (!value) throw new ApiFailure(404, message);
  return value;
}
function requireRevision(value: { revision: number }, body: Record<string, unknown>) {
  if (value.revision !== body.expectedRevision)
    throw new ApiFailure(409, "상태가 바뀌었습니다. 최신 상태를 확인한 뒤 다시 실행하세요.");
}
const terminal = (m: Migration) => ["COMPLETED", "ROLLED_BACK", "CANCELLED"].includes(m.status);
const activeFor = (s: State, id: string) =>
  s.migrations.some((m) => m.applicationId === id && !terminal(m));
function allowed(m: Migration, state?: State) {
  const actions: Migration["allowedActions"] = [];
  if (m.status === "COPYING") actions.push("PAUSE", "FAIL");
  if (m.status === "READY") actions.push("APPROVE", "PAUSE", "FAIL");
  if (m.status === "SWITCHING") actions.push("FAIL");
  if (m.status === "PAUSED") actions.push("RESUME");
  if (m.status === "FAILED") actions.push("RETRY");
  if (m.status === "UNKNOWN") actions.push("RECONCILE");
  const switched = m.steps.some((step) => step.switched);
  m.blockReason =
    switched && !m.reverseEnabled
      ? "이미 전환한 리소스가 있습니다. 검증한 역방향 동기화가 없어 원본 복귀를 막습니다."
      : null;
  if (
    !["SWITCHING", "UNKNOWN", "ROLLING_BACK", "ROLLED_BACK", "CANCELLED"].includes(m.status) &&
    (!switched || m.reverseEnabled)
  )
    actions.push("ROLLBACK");
  if (!switched && ["COPYING", "READY", "PAUSED", "FAILED"].includes(m.status))
    actions.push("CANCEL");
  if (
    state &&
    state.migrations
      .slice(
        0,
        state.migrations.findIndex((item) => item.id === m.id),
      )
      .some(
        (item) =>
          item.applicationId === m.applicationId &&
          !["CANCELLED", "ROLLED_BACK"].includes(item.status),
      )
  ) {
    const rollback = actions.indexOf("ROLLBACK");
    if (rollback >= 0) actions.splice(rollback, 1);
    m.blockReason = "이 앱에 더 최근의 이전 작업이 있습니다. 최신 작업에서 복구하세요.";
  }
  m.allowedActions = actions;
}
function event(m: Migration, at: number, message: string) {
  m.events.push({ at, message });
  m.updatedAt = at;
  m.revision += 1;
  allowed(m);
}

function tick(state: State, now: number) {
  for (const app of state.applications) {
    const deployment = app.deployments[0];
    if (!deployment || !["BUILDING", "DEPLOYING"].includes(deployment.status)) continue;
    const elapsed = now - deployment.createdAt;
    if (deployment.status === "BUILDING" && elapsed >= 2000) {
      deployment.status = "DEPLOYING";
      deployment.events.push({
        at: now,
        message: "이미지 빌드 완료. 대상 환경에 배포합니다. (데모)",
      });
      app.revision += 1;
    }
    if (elapsed >= 5000) {
      deployment.status = deployment.fail ? "FAILED" : "SUCCEEDED";
      app.status =
        !deployment.fail || app.deployments.some((d) => d.status === "SUCCEEDED")
          ? "RUNNING"
          : "FAILED";
      deployment.events.push({
        at: now,
        message: deployment.fail
          ? "상태 검사 실패. 기존 성공 버전이 있으면 해당 버전을 유지합니다. (데모)"
          : "상태 검사 통과. 앱이 실행 중입니다. (데모)",
      });
      app.updatedAt = now;
      app.revision += 1;
    }
  }
  for (const migration of state.migrations) {
    if (!migration.dueAt || migration.dueAt > now) {
      allowed(migration);
      continue;
    }
    const app = state.applications.find((a) => a.id === migration.applicationId);
    if (!app) continue;
    const step = migration.steps[migration.current];
    if (migration.status === "COPYING" && step) {
      step.status = "READY";
      migration.status = "READY";
      migration.dueAt = 0;
      event(
        migration,
        now,
        `${resourceNames[step.resource]} 복사·동기화 검사 통과. 전환 승인을 기다립니다.`,
      );
    } else if (migration.status === "SWITCHING" && step) {
      step.status = "VERIFIED";
      step.switched = true;
      app.placements[step.resource] = migration.target;
      app.revision += 1;
      event(
        migration,
        now,
        `${resourceNames[step.resource]} 경로 전환·읽기/쓰기 검사 통과. (데모)`,
      );
      migration.current += 1;
      const next = migration.steps[migration.current];
      if (next) {
        next.status = "COPYING";
        migration.status = "COPYING";
        migration.dueAt = now + 3500;
        event(migration, now, `${resourceNames[next.resource]} 복사를 시작합니다.`);
      } else {
        migration.status = "COMPLETED";
        migration.dueAt = 0;
        app.provider = migration.target;
        app.region = regions[migration.target];
        app.status = "RUNNING";
        app.updatedAt = now;
        event(migration, now, "모든 리소스 전환 완료. 대상 환경에서 앱을 재개했습니다.");
      }
    } else if (migration.status === "ROLLING_BACK") {
      const next = migration.steps.find((s) => s.switched);
      if (next) {
        app.placements[next.resource] = migration.source;
        next.switched = false;
        next.status = "ROLLED_BACK";
        app.revision += 1;
        migration.dueAt = now + 1500;
        event(migration, now, `${resourceNames[next.resource]} 원본 경로 복귀·검사 완료. (데모)`);
      } else {
        migration.status = "ROLLED_BACK";
        migration.dueAt = 0;
        app.provider = migration.source;
        app.region = regions[migration.source];
        app.status = "RUNNING";
        app.updatedAt = now;
        app.revision += 1;
        event(migration, now, "원본 복귀 완료. 앱 업무를 재개했습니다.");
      }
    }
    allowed(migration);
  }
}

export function createDemoBackend(storage: StorageLike, now = Date.now) {
  function read(): State {
    const raw = storage.getItem(demoStorageKey);
    return raw ? stateSchema.parse(JSON.parse(raw)) : seed(now());
  }
  function dispatch(
    state: State,
    method: string,
    url: URL,
    body: Record<string, unknown>,
  ): unknown {
    const path = url.pathname.replace(/^\/api/, "");
    const time = now();
    if (path === "/auth/demo/login" && method === "post") {
      state.signedIn = true;
      return sessionSchema.parse({
        user: { id: "user-demo", login: "foxtrot-demo", name: "Foxtrot Demo" },
        workspaceId: state.workspace.id,
        demo: true,
      });
    }
    if (!state.signedIn) throw new ApiFailure(401, "로그인이 필요합니다.");
    if (path === "/v1/me" && method === "get")
      return {
        user: { id: "user-demo", login: "foxtrot-demo", name: "Foxtrot Demo" },
        workspaceId: state.workspace.id,
        demo: true,
      };
    if (path === "/auth/logout" && method === "post") {
      state.signedIn = false;
      return null;
    }
    if (
      (body.workspaceId && body.workspaceId !== state.workspace.id) ||
      (url.searchParams.has("workspaceId") &&
        url.searchParams.get("workspaceId") !== state.workspace.id)
    )
      throw new ApiFailure(403, "이 workspace에 접근할 수 없습니다.");
    if (path === "/demo/reset" && method === "post") {
      Object.assign(state, seed(time), { signedIn: true });
      return null;
    }
    // The security preview never creates real workflows when its local approval is clicked.
    if (path === "/v1/workflows" && method === "get") return [];
    if (path === `/v1/workspaces/${state.workspace.id}/repositories` && method === "get")
      return state.workspace.githubConnected ? repositories : [];
    if (path === `/v1/workspaces/${state.workspace.id}`) {
      if (method === "get") return state.workspace;
      if (method === "patch") {
        const updated = workspaceSchema.parse({
          ...state.workspace,
          ...body,
          id: state.workspace.id,
        });
        for (const connection of updated.connections) {
          if (
            !connection.connected &&
            (state.applications.some(
              (a) =>
                a.status !== "STOPPED" &&
                a.status !== "REGISTERED" &&
                Object.values(a.placements).includes(connection.provider),
            ) ||
              state.migrations.some(
                (m) =>
                  !terminal(m) &&
                  (m.source === connection.provider || m.target === connection.provider),
              ))
          )
            throw new ApiFailure(409, "실행 중인 앱이나 이전 작업이 이 연결을 사용하고 있습니다.");
        }
        state.workspace = updated;
        return updated;
      }
    }
    if (path === "/v1/applications") {
      if (method === "get") return state.applications;
      if (method === "post") {
        const input = applicationInputSchema.parse(body);
        validateApp(state, input);
        const repo = requireValue(
          repositories.find((r) => r.id === input.repositoryId),
          "저장소를 찾지 못했습니다.",
        );
        const app: Application = {
          ...input,
          id: crypto.randomUUID(),
          workspaceId: state.workspace.id,
          repository: repo.name,
          status: "REGISTERED",
          revision: 1,
          createdAt: time,
          updatedAt: time,
          deployments: [],
          placements: {
            database: input.provider,
            redis: input.provider,
            storage: input.provider,
            application: input.provider,
          },
        };
        state.applications.unshift(app);
        return app;
      }
    }
    const appMatch = path.match(/^\/v1\/applications\/([^/]+)(\/actions)?$/);
    if (appMatch) {
      const app = requireValue(state.applications.find((a) => a.id === appMatch[1]));
      if (method === "get") return app;
      requireRevision(app, body);
      if (activeFor(state, app.id) || app.status === "DEPLOYING")
        throw new ApiFailure(409, "진행 중인 배포·이전 작업을 먼저 마무리하세요.");
      if (method === "delete") {
        if (app.status === "RUNNING") throw new ApiFailure(409, "앱을 중지한 뒤 삭제하세요.");
        state.applications = state.applications.filter((a) => a.id !== app.id);
        return null;
      }
      if (method === "patch") {
        const input = applicationInputSchema.parse(body);
        validateApp(state, input, app.id);
        if (input.provider !== app.provider)
          throw new ApiFailure(409, "실행 환경은 마이그레이션으로 변경하세요.");
        Object.assign(app, input, {
          repository: requireValue(repositories.find((r) => r.id === input.repositoryId)).name,
          revision: app.revision + 1,
          updatedAt: time,
        });
        return app;
      }
      if (method === "post" && appMatch[2]) {
        if (body.action === "STOP") {
          app.status = "STOPPED";
          app.revision += 1;
          app.updatedAt = time;
          return app;
        }
        if (body.action === "DEPLOY") {
          if (!state.workspace.githubConnected)
            throw new ApiFailure(409, "GitHub 저장소를 먼저 연결하세요.");
          if (!state.workspace.connections.some((c) => c.provider === app.provider && c.connected))
            throw new ApiFailure(409, "실행 환경의 연결을 확인하세요.");
          const revision = app.deployments.length + 1;
          app.deployments.unshift({
            id: crypto.randomUUID(),
            status: "BUILDING",
            revision,
            image: `demo/${app.name}:v${revision}`,
            createdAt: time,
            fail: body.fail === true,
            events: [
              {
                at: time,
                message: `${app.repository}@${app.branch} 소스 수집·이미지 빌드 시작. (데모)`,
              },
            ],
          });
          app.status = "DEPLOYING";
          app.revision += 1;
          app.updatedAt = time;
          return app;
        }
      }
    }
    if (path === "/v1/migrations") {
      if (method === "get") return state.migrations;
      if (method === "post") {
        const input = migrationInputSchema.parse(body);
        const app = requireValue(state.applications.find((a) => a.id === input.applicationId));
        if (app.status !== "RUNNING" || activeFor(state, app.id))
          throw new ApiFailure(409, "실행 중이고 다른 작업이 없는 앱만 이전할 수 있습니다.");
        if (input.target === app.provider)
          throw new ApiFailure(400, "현재 환경과 다른 대상을 선택하세요.");
        if (!state.workspace.connections.some((c) => c.provider === input.target && c.connected))
          throw new ApiFailure(409, "대상 환경을 먼저 연결하세요.");
        const selected = resourceOrder.filter(
          (r) => app.resources.includes(r) || r === "application",
        );
        const migration: Migration = {
          ...input,
          id: crypto.randomUUID(),
          workspaceId: state.workspace.id,
          applicationName: app.name,
          source: app.provider,
          status: "COPYING",
          revision: 1,
          createdAt: time,
          updatedAt: time,
          dueAt: time + 3500,
          current: 0,
          resumeStatus: "COPYING",
          steps: selected.map((resource, index) => ({
            resource,
            status: index ? "WAITING" : "COPYING",
            switched: false,
          })),
          events: [
            { at: time, message: "데모 이전 시작. 실제 DMS·클라우드 작업은 실행하지 않습니다." },
          ],
          allowedActions: [],
          blockReason: null,
        };
        allowed(migration);
        state.migrations.unshift(migration);
        app.status = "MIGRATING";
        app.revision += 1;
        return migration;
      }
    }
    const migrationMatch = path.match(/^\/v1\/migrations\/([^/]+)(\/actions)?$/);
    if (migrationMatch) {
      const m = requireValue(state.migrations.find((item) => item.id === migrationMatch[1]));
      if (method === "get") return m;
      requireRevision(m, body);
      const action = migrationActionSchema.parse(body.action);
      if (!m.allowedActions.includes(action))
        throw new ApiFailure(409, m.blockReason || "현재 단계에서 실행할 수 없습니다.");
      const app = requireValue(state.applications.find((a) => a.id === m.applicationId));
      const step = m.steps[m.current];
      if (action === "APPROVE" && step) {
        m.status = "SWITCHING";
        step.status = "SWITCHING";
        m.dueAt = time + 2500;
        event(m, time, "업무 정지·진행 중 요청 0 확인. 복제 동기화 후 경로를 변경합니다. (데모)");
      }
      if (action === "PAUSE") {
        m.resumeStatus = m.status === "READY" ? "READY" : "COPYING";
        m.status = "PAUSED";
        m.dueAt = 0;
        event(m, time, "진행을 일시정지했습니다. 현재 경로를 유지합니다.");
      }
      if (action === "RESUME" || action === "RETRY") {
        m.status = m.resumeStatus;
        m.dueAt = m.status === "COPYING" ? time + 3500 : 0;
        if (step) step.status = m.status;
        event(m, time, "확인한 단계부터 진행을 재개합니다.");
      }
      if (action === "FAIL") {
        const switching = m.status === "SWITCHING";
        m.resumeStatus = m.status === "READY" ? "READY" : switching ? "SWITCHING" : "COPYING";
        m.status = switching ? "UNKNOWN" : "FAILED";
        m.dueAt = 0;
        event(
          m,
          time,
          switching
            ? "전환 응답 유실을 재현했습니다. 경로를 확인하기 전에는 재시도·복귀를 막습니다."
            : "복사 오류를 재현했습니다. 경로를 유지하고 후속 리소스를 멈췄습니다.",
        );
      }
      if (action === "RECONCILE" && step) {
        m.status = "READY";
        step.status = "READY";
        m.dueAt = 0;
        event(
          m,
          time,
          "실제 경로가 원본이고 대상 쓰기가 차단된 상태를 확인했습니다. 다시 전환할 수 있습니다. (데모)",
        );
      }
      if (action === "ROLLBACK") {
        m.status = "ROLLING_BACK";
        m.dueAt = time + 1000;
        app.status = "MIGRATING";
        app.revision += 1;
        event(
          m,
          time,
          "앱 업무 정지. DB → Redis → 파일 → 앱 순서로 전환된 리소스를 복귀합니다. (데모)",
        );
      }
      if (action === "CANCEL") {
        m.status = "CANCELLED";
        m.dueAt = 0;
        app.status = "RUNNING";
        app.revision += 1;
        event(m, time, "전환 전 계획을 취소했습니다. 원본 서비스를 유지합니다.");
      }
      allowed(m);
      return m;
    }
    throw new ApiFailure(404, "지원하지 않는 데모 API입니다.");
  }
  return {
    handle(method: string, path: string, body: Record<string, unknown> = {}, key?: string): Reply {
      try {
        const state = read();
        if (
          !state.signedIn &&
          new URL(path, "http://demo.local").pathname.replace(/^\/api/, "") !== "/auth/demo/login"
        )
          throw new ApiFailure(401, "로그인이 필요합니다.");
        tick(state, now());
        for (const migration of state.migrations) allowed(migration, state);
        const fingerprint = JSON.stringify([method, path, body]);
        const previous = key ? state.commands[key] : undefined;
        if (previous) {
          if (previous.fingerprint !== fingerprint)
            throw new ApiFailure(409, "같은 멱등 키에 다른 요청을 사용할 수 없습니다.");
          return [200, previous.result];
        }
        const result = dispatch(state, method, new URL(path, "http://demo.local"), body);
        for (const migration of state.migrations) allowed(migration, state);
        if (key && method === "post")
          state.commands[key] = { fingerprint, result: structuredClone(result) };
        storage.setItem(demoStorageKey, JSON.stringify(state));
        return [200, structuredClone(result)];
      } catch (error) {
        if (error instanceof ApiFailure) return [error.status, { message: error.message }];
        if (error instanceof z.ZodError)
          return [400, { message: error.issues[0]?.message || "입력값을 확인하세요." }];
        return [
          503,
          { message: "데모 데이터를 저장하거나 읽지 못했습니다. 브라우저 저장 공간을 확인하세요." },
        ];
      }
    },
  };
}

function validateApp(state: State, input: z.infer<typeof applicationInputSchema>, id?: string) {
  if (!state.workspace.githubConnected)
    throw new ApiFailure(409, "GitHub 저장소를 먼저 연결하세요.");
  const repo = requireValue(
    repositories.find((r) => r.id === input.repositoryId),
    "저장소를 찾지 못했습니다.",
  );
  if (!repo.branches.includes(input.branch))
    throw new ApiFailure(400, "저장소에 있는 브랜치를 선택하세요.");
  if (state.applications.some((a) => a.name === input.name && a.id !== id))
    throw new ApiFailure(409, "같은 이름의 앱이 있습니다.");
  if ([input.root, input.dockerfile].some((p) => p.startsWith("/") || p.split("/").includes("..")))
    throw new ApiFailure(400, "저장소 내부의 상대 경로를 입력하세요.");
  if (!state.workspace.connections.some((c) => c.provider === input.provider && c.connected))
    throw new ApiFailure(409, "실행 환경을 먼저 연결하세요.");
}
