import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { once } from "node:events";

import { afterAll, afterEach, beforeAll, beforeEach, expect, test } from "vite-plus/test";
import { CancelledError, QueryClient } from "@tanstack/react-query";
import { ZodError } from "zod";

import { apiClient, shouldRetryQuery } from "@/shared/api";

import { getPlatformHealth, healthQueryOptions } from "./health";

const okResponse = (_request: IncomingMessage, response: ServerResponse) => {
  response.writeHead(200, { "Content-Type": "application/json" }).end('{"status":"ok"}');
};
let respond = okResponse;
const server = createServer((request, response) => respond(request, response));
const originalBaseUrl = apiClient.defaults.baseURL;
const client = new QueryClient({
  defaultOptions: { queries: { retry: shouldRetryQuery, retryDelay: 0 } },
});

beforeAll(async () => {
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  if (!address || typeof address === "string")
    throw new Error("검사용 서버를 시작하지 못했습니다.");
  apiClient.defaults.baseURL = `http://127.0.0.1:${address.port}`;
});

beforeEach(() => {
  respond = okResponse;
});
afterEach(() => client.clear());
afterAll(async () => {
  apiClient.defaults.baseURL = originalBaseUrl;
  server.closeAllConnections();
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
});

test("실제 HTTP 응답을 Axios와 Query를 거쳐 읽는다", async () => {
  expect(await client.fetchQuery(healthQueryOptions())).toEqual({ status: "ok" });
});

test("200 응답이라도 계약이 다르면 성공으로 저장하지 않는다", async () => {
  let requests = 0;
  respond = (_request, response) => {
    requests += 1;
    response.writeHead(200, { "Content-Type": "application/json" }).end('{"ready":true}');
  };
  await expect(client.fetchQuery(healthQueryOptions())).rejects.toBeInstanceOf(ZodError);
  expect(requests).toBe(1);
  expect(client.getQueryData(healthQueryOptions().queryKey)).toBeUndefined();
});

test("401 응답은 자동 재시도하지 않는다", async () => {
  let requests = 0;
  respond = (_request, response) => {
    requests += 1;
    response.writeHead(401).end();
  };
  await expect(client.fetchQuery(healthQueryOptions())).rejects.toMatchObject({
    response: { status: 401 },
  });
  expect(requests).toBe(1);
});

test("조회 취소를 진행 중인 HTTP 연결까지 전달한다", async () => {
  let connectionClosed = false;
  let started!: () => void;
  const requestStarted = new Promise<void>((resolve) => {
    started = resolve;
  });
  respond = (_request, response) => {
    response.once("close", () => {
      connectionClosed = true;
    });
    started();
  };
  const pending = client.fetchQuery(healthQueryOptions());
  const cancelled = expect(pending).rejects.toBeInstanceOf(CancelledError);
  await requestStarted;
  await client.cancelQueries({ queryKey: healthQueryOptions().queryKey });
  await cancelled;
  await expect.poll(() => connectionClosed).toBe(true);
  expect(client.getQueryData(healthQueryOptions().queryKey)).toBeUndefined();
  const controller = new AbortController();
  controller.abort();
  await expect(getPlatformHealth(controller.signal)).rejects.toMatchObject({
    code: "ERR_CANCELED",
  });
});
