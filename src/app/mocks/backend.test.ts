import { beforeEach, expect, test } from "vite-plus/test";
import { applicationSchema } from "@/entities/application";
import { migrationSchema } from "@/entities/migration";
import { createDemoBackend, demoStorageKey } from "./backend";

let time = 100_000;
const values = new Map<string, string>();
const storage = {
  getItem: (key: string) => values.get(key) ?? null,
  setItem: (key: string, value: string) => {
    values.set(key, value);
  },
};
let api = createDemoBackend(storage, () => time);
const app = () => applicationSchema.parse(api.handle("get", "/v1/applications/app-chiikawa")[1]);
const readMigration = (id: string) =>
  migrationSchema.parse(api.handle("get", `/v1/migrations/${id}`)[1]);
const action = (id: string, name: string) =>
  api.handle("post", `/v1/migrations/${id}/actions`, {
    action: name,
    expectedRevision: readMigration(id).revision,
  });
function start(reverseEnabled = true) {
  return migrationSchema.parse(
    api.handle("post", "/v1/migrations", {
      applicationId: app().id,
      workspaceId: "workspace-demo",
      target: "GCP",
      reverseEnabled,
    })[1],
  );
}
beforeEach(() => {
  values.clear();
  time = 100_000;
  api = createDemoBackend(storage, () => time);
  api.handle("post", "/auth/demo/login");
});

test("로그아웃 후 업무 조회와 이전 명령 재생을 거절한다", () => {
  expect(api.handle("get", "/v1/workflows")).toEqual([200, []]);
  const m = start();
  api.handle(
    "post",
    `/v1/migrations/${m.id}/actions`,
    { action: "PAUSE", expectedRevision: m.revision },
    "pause-key",
  );
  api.handle("post", "/auth/logout");
  expect(api.handle("get", "/v1/applications")[0]).toBe(401);
  expect(api.handle("get", "/v1/workflows")[0]).toBe(401);
  expect(
    api.handle(
      "post",
      `/v1/migrations/${m.id}/actions`,
      { action: "PAUSE", expectedRevision: m.revision },
      "pause-key",
    )[0],
  ).toBe(401);
});
test("새 backend 인스턴스에서도 앱과 로그인 상태를 복원한다", () => {
  api = createDemoBackend(storage, () => time);
  expect(app().name).toBe("chiikawa-reservations");
});
test("저장소 연결·입력 검증·중복·멱등 키를 검사한다", () => {
  const input = { ...app(), name: "orders", workspaceId: "workspace-demo" };
  expect(api.handle("post", "/v1/applications", input)[0]).toBe(409);
  api.handle("patch", "/v1/workspaces/workspace-demo", { githubConnected: true });
  const first = api.handle("post", "/v1/applications", input, "create-key");
  expect(first[0]).toBe(200);
  expect(api.handle("post", "/v1/applications", input, "create-key")).toEqual(first);
  expect(
    api.handle("post", "/v1/applications", { ...input, name: "another" }, "create-key")[0],
  ).toBe(409);
  expect(api.handle("post", "/v1/applications", input)[0]).toBe(409);
  expect(
    api.handle("post", "/v1/applications", { ...input, name: "bad-path", root: "../private" })[0],
  ).toBe(400);
  expect(
    api.handle("post", "/v1/applications", { ...input, name: "bad-port", port: 70000 })[0],
  ).toBe(400);
});
test("배포 실패 시 기존 성공 버전을 유지하고 경합을 거절한다", () => {
  api.handle("patch", "/v1/workspaces/workspace-demo", { githubConnected: true });
  expect(
    api.handle("post", `/v1/applications/${app().id}/actions`, {
      action: "DEPLOY",
      fail: true,
      expectedRevision: app().revision,
    })[0],
  ).toBe(200);
  expect(
    api.handle("delete", `/v1/applications/${app().id}`, { expectedRevision: app().revision })[0],
  ).toBe(409);
  time += 6000;
  expect(app().status).toBe("RUNNING");
  expect(app().deployments[0]?.status).toBe("FAILED");
});
test("리소스마다 승인을 요구하고 후속 리소스를 앞서 전환하지 않는다", () => {
  const m = start();
  time += 4000;
  expect(readMigration(m.id).status).toBe("READY");
  time += 10000;
  expect(readMigration(m.id).status).toBe("READY");
  expect(readMigration(m.id).steps[1]?.status).toBe("WAITING");
  expect(action(m.id, "APPROVE")[0]).toBe(200);
  time += 3000;
  const next = readMigration(m.id);
  expect(next.steps[0]?.status).toBe("VERIFIED");
  expect(next.steps[1]?.status).toBe("COPYING");
  expect(app().placements.database).toBe("GCP");
  expect(app().placements.redis).toBe("AWS");
});
test("전환 응답 유실은 UNKNOWN에서 멈추고 상태 확인 전 재시도·복귀를 거절한다", () => {
  const m = start();
  time += 4000;
  action(m.id, "APPROVE");
  action(m.id, "FAIL");
  expect(readMigration(m.id).status).toBe("UNKNOWN");
  expect(action(m.id, "RETRY")[0]).toBe(409);
  expect(action(m.id, "ROLLBACK")[0]).toBe(409);
  expect(action(m.id, "RECONCILE")[0]).toBe(200);
  expect(readMigration(m.id).status).toBe("READY");
});
test("전환 후 역방향 경로가 없으면 원본 복귀를 차단한다", () => {
  const m = start(false);
  time += 4000;
  action(m.id, "APPROVE");
  time += 3000;
  readMigration(m.id);
  expect(action(m.id, "ROLLBACK")[0]).toBe(409);
  expect(readMigration(m.id).blockReason).toContain("역방향");
});
test("역방향 복귀는 전환된 리소스를 복원하고 앱을 재개한다", () => {
  const m = start();
  for (let index = 0; index < 2; index++) {
    time += 4000;
    action(m.id, "APPROVE");
    time += 3000;
    readMigration(m.id);
  }
  expect(action(m.id, "ROLLBACK")[0]).toBe(200);
  for (let index = 0; index < 4; index++) {
    time += 2000;
    readMigration(m.id);
  }
  expect(readMigration(m.id).status).toBe("ROLLED_BACK");
  expect(Object.values(app().placements).every((value) => value === "AWS")).toBe(true);
  expect(app().status).toBe("RUNNING");
});
test("실행 중인 앱에 다른 이전·삭제·수정을 허용하지 않는다", () => {
  start();
  expect(
    api.handle("post", "/v1/migrations", {
      applicationId: app().id,
      target: "ONPREM",
      reverseEnabled: true,
    })[0],
  ).toBe(409);
  expect(
    api.handle("delete", `/v1/applications/${app().id}`, { expectedRevision: app().revision })[0],
  ).toBe(409);
});
test("손상된 저장 데이터를 빈 데이터로 덮어쓰지 않는다", () => {
  values.set(demoStorageKey, "invalid-json");
  expect(api.handle("get", "/v1/me")[0]).toBe(503);
  expect(values.get(demoStorageKey)).toBe("invalid-json");
});
