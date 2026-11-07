/** Illustrative findings only. Never use this reducer to authorize a migration. */
export type ResourceId = "app" | "db" | "redis" | "object";
export type Phase = "idle" | "scanning" | "gap" | "plan" | "verifying" | "verified" | "approved";
export type CheckStatus = "unknown" | "pass" | "fail";
export interface SecurityCheck {
  id: string;
  title: string;
  requirement: string;
  source: string;
  target: string;
  corrected?: string;
  evidence: string;
}
export interface SecurityResource {
  id: ResourceId;
  name: string;
  icon: "app" | "postgresql" | "redis" | "object";
  source: string;
  target: string;
  principal: string;
  checks: SecurityCheck[];
}

export const demoResources: SecurityResource[] = [
  {
    id: "app",
    name: "앱 서버",
    icon: "app",
    source: "EC2",
    target: "Docker Compose",
    principal: "order-svc",
    checks: [
      {
        id: "app-network",
        title: "접근 경로",
        requirement: "프록시에서만 앱에 접속",
        source: "보안 그룹: 프록시만 허용",
        target: "앱 포트 외부 공개 없음",
        evidence: "compose.yaml · services.app.ports / networks",
      },
      {
        id: "app-user",
        title: "실행 계정",
        requirement: "관리자 권한 없이 실행",
        source: "전용 서비스 계정",
        target: "비관리자 사용자로 실행",
        evidence: "compose.yaml · services.app.user",
      },
      {
        id: "app-secret",
        title: "인증 정보",
        requirement: "인증 정보를 이미지와 분리",
        source: "Secrets Manager 참조",
        target: "읽기 전용 시크릿 파일 연결",
        evidence: "compose.yaml · services.app.secrets",
      },
    ],
  },
  {
    id: "db",
    name: "주문 DB",
    icon: "postgresql",
    source: "RDS PostgreSQL",
    target: "PostgreSQL",
    principal: "order_app",
    checks: [
      {
        id: "db-network",
        title: "접근 경로",
        requirement: "앱 네트워크에서만 DB에 접속",
        source: "보안 그룹: 앱만 허용",
        target: "DB 포트 외부 공개 없음",
        evidence: "compose.yaml · services.db.ports / pg_hba.conf",
      },
      {
        id: "db-role",
        title: "접근 권한",
        requirement: "앱 계정은 주문 데이터만 사용",
        source: "orders 스키마 CRUD 권한",
        target: "orders 스키마 CRUD 권한",
        evidence: "PostgreSQL · role / schema grants",
      },
      {
        id: "db-tls",
        title: "전송 암호화",
        requirement: "암호화된 연결만 허용",
        source: "TLS 연결 필수",
        target: "TLS 연결 필수",
        evidence: "PostgreSQL · ssl / hostssl connection probe",
      },
    ],
  },
  {
    id: "redis",
    name: "세션 Redis",
    icon: "redis",
    source: "ElastiCache",
    target: "Redis",
    principal: "session_app",
    checks: [
      {
        id: "redis-acl",
        title: "접근 권한",
        requirement: "앱 계정은 세션 키만 사용",
        source: "session:* 키로 제한",
        target: "모든 키와 명령에 접근 가능",
        corrected: "session:* 키와 지정 명령만 허용",
        evidence: "Redis · ACL GETUSER session_app (credentials redacted)",
      },
      {
        id: "redis-network",
        title: "접근 경로",
        requirement: "앱 네트워크에서만 Redis에 접속",
        source: "보안 그룹: 앱만 허용",
        target: "Redis 포트 외부 공개 없음",
        evidence: "compose.yaml · services.redis.ports / networks",
      },
      {
        id: "redis-tls",
        title: "전송 암호화",
        requirement: "암호화된 연결만 허용",
        source: "TLS 연결 필수",
        target: "TLS 연결 필수",
        evidence: "Redis · tls-port / TLS connection probe",
      },
    ],
  },
  {
    id: "object",
    name: "영수증 저장소",
    icon: "object",
    source: "S3",
    target: "MinIO",
    principal: "receipt_app",
    checks: [
      {
        id: "object-public",
        title: "공개 접근",
        requirement: "익명 사용자의 접근 차단",
        source: "퍼블릭 액세스 차단",
        target: "익명 접근 차단",
        evidence: "MinIO · anonymous policy / anonymous request probe",
      },
      {
        id: "object-scope",
        title: "접근 권한",
        requirement: "앱 계정은 영수증 경로만 사용",
        source: "receipts/* 경로로 제한",
        target: "receipts/* 경로로 제한",
        evidence: "MinIO · service account policy",
      },
      {
        id: "object-tls",
        title: "전송 암호화",
        requirement: "암호화된 연결만 허용",
        source: "HTTPS 연결 필수",
        target: "HTTPS 연결 필수",
        evidence: "MinIO · HTTPS endpoint probe",
      },
    ],
  },
];

export interface AuditEvent {
  id: number;
  message: string;
  at: string;
}
export interface DemoState {
  phase: Phase;
  selected: ResourceId;
  events: AuditEvent[];
}
export const initialDemoState: DemoState = { phase: "idle", selected: "redis", events: [] };
export type DemoAction =
  | { type: "select"; id: ResourceId }
  | { type: "reset" }
  | {
      type: "scan" | "scanned" | "plan" | "cancel" | "verify" | "verified" | "approve";
      at: string;
    };

const transitions: Partial<
  Record<DemoAction["type"], { from: Phase; to: Phase; message?: string }>
> = {
  scan: { from: "idle", to: "scanning" },
  scanned: { from: "scanning", to: "gap", message: "조사 완료 · Redis 권한 보완 1건" },
  plan: { from: "gap", to: "plan", message: "Redis 권한 변경안 작성" },
  cancel: { from: "plan", to: "gap", message: "변경안 취소" },
  verify: { from: "plan", to: "verifying", message: "Redis 설정 적용 요청" },
  verified: { from: "verifying", to: "verified", message: "재검증 완료 · 보안 검사 12건 통과" },
  approve: { from: "verified", to: "approved", message: "demo 사용자가 전환 승인" },
};

export function demoReducer(state: DemoState, action: DemoAction): DemoState {
  if (action.type === "reset") return initialDemoState;
  if (action.type === "select") return { ...state, selected: action.id };
  const transition = transitions[action.type];
  if (!transition || state.phase !== transition.from) return state;
  return {
    ...state,
    phase: transition.to,
    selected: action.type === "plan" ? "redis" : state.selected,
    events: transition.message
      ? [
          { id: state.events.length + 1, message: transition.message, at: action.at },
          ...state.events,
        ]
      : state.events,
  };
}

export function checkStatus(check: SecurityCheck, phase: Phase): CheckStatus {
  if (phase === "idle" || phase === "scanning") return "unknown";
  if (check.corrected && phase !== "verified" && phase !== "approved") return "fail";
  return "pass";
}

export function checkCounts(phase: Phase) {
  const checks = demoResources.flatMap((resource) => resource.checks);
  return checks.reduce(
    (counts, check) => {
      counts[checkStatus(check, phase)] += 1;
      return counts;
    },
    { pass: 0, fail: 0, unknown: 0, total: checks.length },
  );
}
