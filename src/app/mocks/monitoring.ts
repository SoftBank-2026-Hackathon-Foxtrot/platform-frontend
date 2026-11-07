/** Illustrative OTEL signals, installed only by VITE_API_MODE=demo. Never real fallback data. */
const scenarios = ["issue", "live", "idle"] as const;
const keys = {
  app: ["inflight", "activewebsockets", "probe_failed", "probe_p95"],
  db: ["writers", "prepared", "forward_lag", "reverse_lag"],
  redis: ["backlog", "copied", "dirty_age", "writes"],
  obj: ["completed", "total", "forward_backlog", "reverse_backlog"],
} as const;
const bases = {
  app: [406, 0.17, 117, 47],
  db: [510, 12, 32, 38],
  redis: [830, 98, 1.7, 42],
  obj: [62, 0.12, 45, 12],
};
type Component = keyof typeof keys;
function demoTraces(now: number, scenario: string) {
  const end = Math.floor(now / 60_000) * 60_000;
  return Array.from({ length: 18 }, (_, i) => {
    const error = scenario === "issue" && i < 2;
    return {
      traceId: `a73d900000000000000000000000${String(i).padStart(5, "0")}`,
      at: new Date(end - i * 60_000).toISOString(),
      name: i % 3 === 0 ? "POST /api/orders" : i % 3 === 1 ? "GET /api/cart" : "GET /api/products",
      service: "shop-api",
      side: scenario !== "idle" && i % 3 !== 2 ? "target" : "source",
      durationMs: error ? 482 - i * 61 : 96 + i * 7,
      status: error ? "error" : "ok",
      statusCode: error ? "500" : "200",
      components: i % 3 === 2 ? ["app", "db", "obj"] : ["app", "db", "redis"],
    };
  });
}
export function monitoringDemoReply(path: string, now = Date.now()): [number, unknown] | undefined {
  const url = new URL(path, "http://demo.invalid");
  if (url.pathname === "/v1/workflows")
    return [
      200,
      scenarios.map((scenario) => ({
        id: `wf-monitoring-${scenario}`,
        application: `shop-api-${scenario}`,
        sourceEnv: "aws",
        targetEnv: "gcp",
        version: 1,
        currentStage: 0,
        createdAt: new Date(now - 1_800_000).toISOString(),
        createdBy: "demo",
        finishedAt: null,
        status: scenario === "idle" ? "PLANNED" : "RUNNING",
        halt: null,
        reconcileRequested: false,
        rolledBack: [],
        rollback: null,
      })),
    ];
  if (url.pathname === "/v1/telemetry/collection")
    return [
      200,
      {
        modules: ["앱", "DB 어댑터", "Redis 프록시", "Object 워커", "트래픽 모듈"].map(
          (name, i) => ({
            id: `module-${i}`,
            name,
            state: i === 3 ? "STALE" : "FRESH",
            lastCollectedAt: new Date(now - (i === 3 ? 600_000 : 10_000)).toISOString(),
          }),
        ),
      },
    ];
  const match = url.pathname.match(
    /^\/v1\/workflows\/wf-monitoring-(issue|live|idle)\/(telemetry\/series|traces(?:\/[^/]+)?|logs)$/,
  );
  if (!match) return undefined;
  const [, scenario = "issue", endpoint = ""] = match;
  const comp = (url.searchParams.get("comp") ?? "app") as Component;
  if (endpoint === "telemetry/series") {
    if (!(comp in keys)) return [400, { message: "Unknown component" }];
    const from = url.searchParams.get("from") ?? new Date(now - 1_800_000).toISOString();
    const to = url.searchParams.get("to") ?? new Date(now).toISOString();
    const length = Math.min(361, Math.floor((Date.parse(to) - Date.parse(from)) / 60_000) + 1);
    return [
      200,
      {
        comp,
        step: 60,
        from,
        metrics: keys[comp].map((key, metric) => {
          const base = bases[comp][metric]!;
          return {
            key,
            unit: {
              inflight: "",
              activewebsockets: "",
              probe_failed: "",
              probe_p95: "ms",
              writers: "",
              prepared: "",
              forward_lag: "s",
              reverse_lag: "s",
              backlog: "",
              copied: "",
              dirty_age: "ms",
              writes: "",
              completed: "",
              total: "",
              forward_backlog: "",
              reverse_backlog: "",
            }[key],
            scope: comp === "redis" || comp === "obj" || metric >= 2 ? "workflow" : "environment",
            shared: Array.from({ length }, (_, i) => Math.max(0, base + Math.sin(i) * base * 0.1)),
            source: Array.from({ length }, (_, i) =>
              Number((base * (1 + Math.sin(i * 1.7) * 0.035)).toFixed(2)),
            ),
            target: Array.from({ length }, (_, i) => {
              if (scenario === "idle" || (scenario === "issue" && comp === "obj" && i > length - 8))
                return null;
              if (key === "probe_failed" && scenario === "live") return 0;
              const spike =
                scenario === "issue" &&
                i > length - 6 &&
                ["probe_p95", "probe_failed"].includes(key);
              const scale =
                key === "probe_p95"
                  ? 1.12
                  : key === "inflight"
                    ? 1
                    : key === "probe_failed"
                      ? 0.6
                      : metric === 0
                        ? 0.1
                        : 0.6;
              return Number(
                (
                  base * scale * (1 + Math.sin(i * 1.2) * 0.06) +
                  (spike
                    ? base *
                      (i - length + 6) *
                      (key === "probe_failed" || comp === "redis" ? 3 : 0.35)
                    : 0)
                ).toFixed(2),
              );
            }),
          };
        }),
      },
    ];
  }
  const traces = demoTraces(now, scenario);
  const inside = (at: string) =>
    (!url.searchParams.get("from") ||
      Date.parse(at) >= Date.parse(url.searchParams.get("from")!)) &&
    (!url.searchParams.get("to") || Date.parse(at) <= Date.parse(url.searchParams.get("to")!));
  if (endpoint === "traces")
    return [
      200,
      {
        traces: traces.filter(
          (trace) =>
            inside(trace.at) && (!url.searchParams.get("comp") || trace.components.includes(comp)),
        ),
      },
    ];
  if (endpoint.startsWith("traces/")) {
    const trace = traces.find((item) => item.traceId === endpoint.split("/")[1]);
    if (!trace) return [404, { message: "Trace not found" }];
    return [
      200,
      {
        traceId: trace.traceId,
        spans: [
          {
            spanId: "root",
            parentSpanId: null,
            name: `shop-api → ${trace.side === "target" ? "GKE" : "EKS"} · ${trace.name}`,
            startMs: 0,
            durationMs: trace.durationMs,
            status: trace.status,
          },
          {
            spanId: "db",
            parentSpanId: "root",
            name: `DB adapter → ${trace.side === "target" ? "Cloud SQL" : "RDS"} · SELECT products`,
            startMs: 9,
            durationMs: 18,
            status: "ok",
          },
          {
            spanId: "redis",
            parentSpanId: "root",
            name: `Redis proxy → ${trace.side === "target" ? "Memorystore" : "ElastiCache"} · GET cart`,
            startMs: 30,
            durationMs: Math.max(1, trace.durationMs - 42),
            status: trace.status,
          },
        ],
      },
    ];
  }
  if (endpoint === "logs")
    return [
      200,
      {
        logs: traces
          .flatMap((trace, i) => [
            {
              id: `log-${i}-0`,
              at: trace.at,
              level: trace.status === "error" ? "ERROR" : "INFO",
              side: trace.side,
              service: trace.status === "error" ? "redis-proxy" : "shop-api",
              message:
                trace.status === "error"
                  ? "GET cart: upstream timeout after 400ms (Memorystore)"
                  : `${trace.name} completed status=${trace.statusCode}`,
              traceId: trace.traceId,
              spanId: trace.status === "error" ? "redis" : "root",
            },
            ...(trace.status === "error"
              ? [
                  {
                    id: `log-${i}-1`,
                    at: trace.at,
                    level: "WARN",
                    side: trace.side,
                    service: "shop-api",
                    message: "Cart cache unavailable; request failed before checkout",
                    traceId: trace.traceId,
                    spanId: "root",
                  },
                ]
              : []),
          ])
          .filter(
            (log) =>
              inside(log.at) &&
              (!url.searchParams.get("traceId") || log.traceId === url.searchParams.get("traceId")),
          ),
      },
    ];
  return undefined;
}
