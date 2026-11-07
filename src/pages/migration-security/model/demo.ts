// Handoff examples only. These records are not observations of a deployed environment.
export type Phase = "current" | "plan";
export type Status = "ok" | "action" | "unknown" | "exception" | "na";
export type Source = "live" | "declared" | "none";
export type Kind =
  | "internet"
  | "edge"
  | "proxy"
  | "compute"
  | "identity"
  | "db"
  | "cache"
  | "object_store";
export const conditions = [
  ["identity", "신원·권한"],
  ["network", "네트워크 접근"],
  ["transit_enc", "전송 암호화"],
  ["rest_enc", "저장 암호화"],
  ["key_mgmt", "키 관리"],
  ["audit_approval", "감사·승인"],
  ["backup_restore", "백업·복구"],
  ["temp_access", "임시 접근 회수"],
] as const;
export type Condition = (typeof conditions)[number][0];
export interface ConditionState {
  status: Status;
  summary: string;
  source: Source;
  evidence: string;
  checkedAt?: string;
}
export interface Protection {
  current: ConditionState;
  plan: ConditionState;
  change: "방식 바뀜" | "약해짐" | "빠짐" | "알 수 없음" | "유지" | "해당 없음";
  impact: string;
}
export interface Resource {
  id: string;
  kind: Kind;
  name: Record<Phase, string>;
  detail: Record<Phase, string>;
  owner?: string;
  x: number;
  y: number;
  conditions: Record<Condition, Protection>;
}
export const collectedAt = "2026-11-07 09:12 KST";
export const planVersion = "v3";
export const kindMeta: Record<Kind, { label: string; color: string }> = {
  internet: { label: "인터넷", color: "#1E8C93" },
  edge: { label: "진입점", color: "#1E8C93" },
  proxy: { label: "프록시", color: "#7B61D9" },
  compute: { label: "앱·컴퓨트", color: "#D9711C" },
  identity: { label: "계정·권한", color: "#C7375F" },
  db: { label: "데이터베이스", color: "#3F8F32" },
  cache: { label: "캐시", color: "#3F8F32" },
  object_store: { label: "객체 저장소", color: "#3F8F32" },
};
function state(
  status: Status,
  summary: string,
  evidence = "",
  source: Source = "declared",
): ConditionState {
  return {
    status,
    summary,
    evidence,
    source,
    checkedAt: source === "live" ? collectedAt : undefined,
  };
}
function protection(
  current: string,
  plan: string,
  status: Status,
  change: Protection["change"],
  impact: string,
  evidence: string,
): Protection {
  return {
    current: state("ok", current, `수집 예시\n${current}`, "live"),
    plan: state(status, plan, evidence, evidence ? "declared" : "none"),
    change,
    impact,
  };
}
const missing: Protection = {
  current: state("na", "적용 대상 아님", "", "none"),
  plan: state("na", "적용 대상 아님", "", "none"),
  change: "해당 없음",
  impact: "—",
};
function checks(overrides: Partial<Record<Condition, Protection>>): Record<Condition, Protection> {
  return Object.fromEntries(conditions.map(([id]) => [id, overrides[id] ?? missing])) as Record<
    Condition,
    Protection
  >;
}
const dbChecks = checks({
  identity: protection(
    "IAM 토큰 · 15분",
    "Vault 계정 · 1시간 · 미구축",
    "action",
    "방식 바뀜",
    "대상 DB 계정 발급 경로 부재",
    "plans/order-onprem.yaml:24\nidentity: vault\nprovisioned: false",
  ),
  network: protection(
    "5432 ← EKS 노드",
    "5432 ← 10.20.4.0/24",
    "ok",
    "방식 바뀜",
    "앱 서브넷만 DB 접근 허용",
    "plans/order-onprem.yaml:32\nallow: 10.20.4.0/24\nport: 5432",
  ),
  transit_enc: protection(
    "TLS 1.2+ · 인증서 검증",
    "서버 TLS on · sslmode 미확인",
    "unknown",
    "알 수 없음",
    "클라이언트 인증서 검증 여부 미확인",
    "plans/order-onprem.yaml:40\nssl: on\nclient_sslmode: null",
  ),
  rest_enc: protection(
    "AES-256 · 암호화 활성",
    "디스크 암호화 미확인",
    "unknown",
    "알 수 없음",
    "복사 즉시 대상 디스크에 기록",
    "",
  ),
  key_mgmt: protection(
    "KMS · 1년 자동 교체",
    "없음",
    "action",
    "빠짐",
    "키 보관·교체·사용 기록 담당 없음",
    "plans/order-onprem.yaml:57\nkey_management: null",
  ),
  audit_approval: protection(
    "pgaudit · CloudTrail · 2인 승인",
    "pgaudit · 수집처 미확인",
    "unknown",
    "알 수 없음",
    "감사 로그 보관·조회 경로 미확인",
    "plans/order-onprem.yaml:61\npgaudit: enabled\naudit_sink: null",
  ),
  backup_restore: protection(
    "35일 · 시점 복구",
    "1일 1회 · 시점 복구 없음",
    "action",
    "약해짐",
    "복구 가능 시점 간격 증가",
    "plans/order-onprem.yaml:68\nbackup: daily\npitr: false",
  ),
  temp_access: protection(
    "세션 4시간 자동 종료",
    "점프 서버 계정 · 회수 절차 미확인",
    "unknown",
    "알 수 없음",
    "이전 종료 후 임시 접근 잔존 가능",
    "",
  ),
});
function resource(
  id: string,
  kind: Kind,
  names: [string, string],
  details: [string, string],
  x: number,
  y: number,
  owner?: string,
  rows = checks({}),
): Resource {
  return {
    id,
    kind,
    name: { current: names[0], plan: names[1] },
    detail: { current: details[0], plan: details[1] },
    x,
    y,
    owner,
    conditions: rows,
  };
}
export const resources: Resource[] = [
  resource("internet", "internet", ["인터넷", "인터넷"], ["사용자", "사용자"], 65, 255),
  resource(
    "edge",
    "edge",
    ["Cloudflare", "Cloudflare"],
    ["WAF · DNS", "원본 주소 변경"],
    205,
    255,
    "네트워크팀",
    checks({
      network: protection(
        "WAF · 운영 규칙",
        "기존 WAF 유지",
        "ok",
        "유지",
        "진입점 보호 유지 계획",
        "plans/edge.yaml:8\nwaf: retain",
      ),
      transit_enc: protection(
        "Full (strict)",
        "대상 인증서 미확인",
        "unknown",
        "알 수 없음",
        "대상 원본 연결 전 인증서 확인 필요",
        "plans/edge.yaml:12\norigin_certificate: pending",
      ),
    }),
  ),
  resource(
    "proxy",
    "proxy",
    ["AWS ALB", "HAProxy"],
    ["내부 로드밸런서", "서버 2대"],
    345,
    255,
    "네트워크팀",
    checks({
      network: protection(
        "보안 그룹 · 앱만 허용",
        "앱 접근 규칙 미확인",
        "unknown",
        "알 수 없음",
        "프록시→앱 허용 범위 확인 필요",
        "",
      ),
      transit_enc: protection(
        "HTTPS · 인증서 검증",
        "HTTP 전달",
        "action",
        "빠짐",
        "프록시→앱 구간 평문 전송",
        "plans/proxy.yaml:18\nbackend_protocol: http",
      ),
    }),
  ),
  resource(
    "app",
    "compute",
    ["order-api", "order-api"],
    ["EKS · pod 6", "사내 K8s · pod 6"],
    485,
    255,
    "앱팀",
    checks({
      identity: protection(
        "IRSA · 전용 역할",
        "전용 ServiceAccount",
        "ok",
        "방식 바뀜",
        "워크로드 신원 구현 변경",
        "plans/app.yaml:12\nserviceAccountName: order-api",
      ),
      transit_enc: protection(
        "HTTPS · 인증서 검증",
        "프록시→앱 HTTP",
        "action",
        "빠짐",
        "앱 수신 구간 평문 전송",
        "plans/app.yaml:21\nport: 8080\ntls: false",
      ),
    }),
  ),
  resource(
    "db-account",
    "identity",
    ["order_writer", "order_writer"],
    ["IAM 인증 · 15분", "Vault 발급 · 미구축"],
    695,
    95,
    "플랫폼팀",
    checks({ identity: dbChecks.identity, key_mgmt: dbChecks.key_mgmt }),
  ),
  resource(
    "cache-account",
    "identity",
    ["캐시 토큰", "캐시 토큰"],
    ["IAM 인증", "Sentinel AUTH"],
    695,
    255,
    "플랫폼팀",
    checks({
      identity: protection(
        "IAM · 앱 전용",
        "ACL 범위 미확인",
        "unknown",
        "알 수 없음",
        "세션 키 접근 범위 확인 필요",
        "plans/cache.yaml:13\nacl_file: pending",
      ),
    }),
  ),
  resource(
    "object-account",
    "identity",
    ["서비스 역할", "고정 접근 키"],
    ["STS · 1시간", "교체 주기 없음"],
    695,
    415,
    undefined,
    checks({
      key_mgmt: protection(
        "STS · 1시간",
        "고정 키 · 교체 없음",
        "action",
        "약해짐",
        "장기 자격 증명 노출 범위 증가",
        "plans/storage.yaml:16\nkey_rotation: null",
      ),
    }),
  ),
  resource(
    "db",
    "db",
    ["주문 DB", "주문 DB"],
    ["RDS PostgreSQL 15", "Patroni 3노드"],
    890,
    95,
    "DBA팀",
    dbChecks,
  ),
  resource(
    "cache",
    "cache",
    ["세션 캐시", "세션 캐시"],
    ["ElastiCache Redis", "Redis Sentinel"],
    890,
    255,
    "플랫폼팀",
    checks({
      identity: protection(
        "앱 전용 ACL",
        "ACL 범위 미확인",
        "unknown",
        "알 수 없음",
        "세션 키 접근 범위 확인 필요",
        "plans/cache.yaml:13\nacl_file: pending",
      ),
      transit_enc: protection(
        "TLS · 인증서 검증",
        "대상 TLS 미확인",
        "unknown",
        "알 수 없음",
        "세션 데이터 전송 보호 확인 필요",
        "plans/cache.yaml:19\ntls_port: pending",
      ),
      backup_restore: protection(
        "스냅샷 · 7일",
        "AOF · 복구 시험 미확인",
        "unknown",
        "알 수 없음",
        "캐시 복구 가능 여부 확인 필요",
        "plans/cache.yaml:28\nappendonly: yes\nrestore_test: pending",
      ),
    }),
  ),
  resource(
    "object",
    "object_store",
    ["영수증 저장소", "영수증 저장소"],
    ["S3 · 비공개", "MinIO"],
    890,
    415,
    "스토리지팀",
    checks({
      network: protection(
        "S3 Private Endpoint",
        "사내망 전용",
        "ok",
        "방식 바뀜",
        "사내망으로 접근 경로 변경",
        "plans/storage.yaml:8\npublic_access: false",
      ),
      key_mgmt: protection(
        "STS · KMS",
        "고정 키 · 교체 없음",
        "action",
        "약해짐",
        "키 교체와 보관 담당 필요",
        "plans/storage.yaml:16\nkey_rotation: null",
      ),
      audit_approval: protection(
        "CloudTrail · 감사 저장소",
        "감사 로그 꺼짐",
        "action",
        "빠짐",
        "파일 접근 이력 누락",
        "plans/storage.yaml:24\naudit: disabled",
      ),
    }),
  ),
];
export function getResource(id: string): Resource {
  return resources.find((r) => r.id === id) ?? resources[7]!;
}
export interface Edge {
  id: string;
  from: string;
  to: string;
  verb: Record<Phase, string>;
  scope: string;
  status: Record<Phase, Status>;
}
function edge(
  from: string,
  to: string,
  verb: string,
  status: Status = "ok",
  scope = "",
  planVerb = verb,
): Edge {
  return {
    id: `${from}-${to}`,
    from,
    to,
    verb: { current: verb, plan: planVerb },
    scope,
    status: { current: "ok", plan: status },
  };
}
export const edges = [
  edge("internet", "edge", "접속"),
  edge("edge", "proxy", "HTTPS 전달", "unknown"),
  edge("proxy", "app", "HTTPS 전달", "action", "8080", "HTTP 전달"),
  edge("app", "db-account", "사용"),
  edge("app", "cache-account", "사용"),
  edge("app", "object-account", "사용"),
  edge("db-account", "db", "읽기·쓰기", "action", "orders.*"),
  edge("cache-account", "cache", "읽기·쓰기", "unknown", "session:*"),
  edge("object-account", "object", "파일 업로드", "action", "receipts/*"),
];
export const paths = [
  { id: "orders", label: "주문 저장", identity: "db-account", data: "db", edge: "db-account-db" },
  {
    id: "sessions",
    label: "로그인",
    identity: "cache-account",
    data: "cache",
    edge: "cache-account-cache",
  },
  {
    id: "receipts",
    label: "영수증 업로드",
    identity: "object-account",
    data: "object",
    edge: "object-account-object",
  },
];
export function visibleResources(business: string) {
  const path = paths.find((p) => p.id === business);
  return path
    ? resources.filter((r) =>
        ["internet", "edge", "proxy", "app", path.identity, path.data].includes(r.id),
      )
    : resources;
}
export function counts(resource: Resource, phase: Phase) {
  return conditions.reduce(
    (result, [id]) => {
      result[resource.conditions[id][phase].status] += 1;
      return result;
    },
    { ok: 0, action: 0, unknown: 0, exception: 0, na: 0 },
  );
}
export const gates = [
  ["before_copy", "복사 전"],
  ["before_cutover", "전환 전"],
  ["after_cutover", "전환 후 확인"],
] as const;
export type Gate = (typeof gates)[number][0];
export type TaskStatus = "todo" | "in_progress" | "verifying";
export const taskStatusLabels: Record<TaskStatus, string> = {
  todo: "할 일",
  in_progress: "진행 중",
  verifying: "검사 대기",
};
export interface Task {
  id: string;
  title: string;
  resources: string[];
  condition: Condition;
  gate: Gate;
  owner: string;
  status: TaskStatus;
  due: string;
  criteria: string[];
}
export const initialTasks: Task[] = [
  {
    id: "key",
    title: "주문 DB 키 보관처 결정",
    resources: ["db", "object", "db-account", "object-account"],
    condition: "key_mgmt",
    gate: "before_copy",
    owner: "",
    status: "todo",
    due: "11/14",
    criteria: [
      "보관처 결정 (HSM / Vault)",
      "교체 주기 1년 이하",
      "DBA·앱 키 권한 분리",
      "대상 실측 통과",
    ],
  },
  {
    id: "disk",
    title: "주문 DB 디스크 암호화 확인",
    resources: ["db"],
    condition: "rest_enc",
    gate: "before_copy",
    owner: "스토리지팀",
    status: "in_progress",
    due: "11/14",
    criteria: ["대상 볼륨 암호화 설정 확인", "임시 복사 볼륨 포함", "실측 근거 등록"],
  },
  {
    id: "identity",
    title: "Vault DB 계정 발급 구성",
    resources: ["db-account", "db"],
    condition: "identity",
    gate: "before_copy",
    owner: "플랫폼팀",
    status: "in_progress",
    due: "11/14",
    criteria: ["워크로드 신원 연결", "orders.* 최소 권한", "계정 만료·회수 검사"],
  },
  {
    id: "audit",
    title: "영수증 저장소 감사 로그 켜기",
    resources: ["object"],
    condition: "audit_approval",
    gate: "before_copy",
    owner: "보안 운영팀",
    status: "todo",
    due: "11/14",
    criteria: ["감사 수집처 연결", "객체 접근 이력 조회", "보관 기간 확인"],
  },
  {
    id: "tls",
    title: "세션 캐시 TLS 실측",
    resources: ["cache", "cache-account"],
    condition: "transit_enc",
    gate: "before_cutover",
    owner: "플랫폼팀",
    status: "todo",
    due: "11/18",
    criteria: ["TLS 연결 확인", "인증서 검증 확인", "잘못된 인증서 연결 거부"],
  },
  {
    id: "backup",
    title: "주문 DB 시점 복구 설정",
    resources: ["db"],
    condition: "backup_restore",
    gate: "before_cutover",
    owner: "DBA팀",
    status: "todo",
    due: "11/18",
    criteria: ["PITR 구성", "복구 시험 결과 등록", "RPO·RTO 기준 확인"],
  },
  {
    id: "proxy-tls",
    title: "프록시→앱 TLS 구성",
    resources: ["proxy", "app"],
    condition: "transit_enc",
    gate: "before_cutover",
    owner: "네트워크팀",
    status: "todo",
    due: "11/18",
    criteria: ["백엔드 HTTPS 구성", "인증서 검증 확인", "실제 요청 경로 검사"],
  },
  {
    id: "revoke",
    title: "이전용 임시 접근 회수",
    resources: ["db"],
    condition: "temp_access",
    gate: "after_cutover",
    owner: "",
    status: "todo",
    due: "11/21",
    criteria: ["임시 계정·키 목록 확인", "세션·자격 증명 회수", "회수 후 접근 거부 확인"],
  },
];
export const owners = ["앱팀", "DBA팀", "플랫폼팀", "스토리지팀", "네트워크팀", "보안 운영팀"];
