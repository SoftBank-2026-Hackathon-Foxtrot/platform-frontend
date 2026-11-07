# 모니터링 대시보드

`/monitoring`에서 workflow의 기존 환경과 이전 환경을 비교한다. 기준 자료는 [monitoring handoff](https://github.com/SuperSon7/migration-monitoring-dashboard-handoff) `29e896b`의 SPEC/NEEDS다. 기존 마이그레이션 상세의 진행·승인 기능을 유지하며 각 리소스와 OTEL 카드에 `지표 보기` 링크를 추가한다.

## 화면과 탐색

- 지표: 앱·DB·Redis·Object별 4개 차트, 같은 축의 두 계열, 공통 시각 커서.
- 트레이스: 전체·오류·300ms 초과·이전 환경 필터, 오류 요청 기본 펼침, 스팬 워터폴.
- 로그: 전체·ERROR·WARN 필터, 메시지/trace ID 검색, 연결 트레이스 열기.
- 여러 workflow는 상단에서 선택한다. 시간 범위는 최근 30분이다. 시간은 브라우저의 현지 시간으로 표시하며 API에는 ISO 시각을 전달한다.
- 차트 클릭 또는 화살표 키 + Enter는 해당 시각 ±2분과 구성 요소로 트레이스를 좁힌다. 터치 사용자는 시각 선택과 `이 시각 트레이스` 버튼을 사용할 수 있다.
- `workflow`, `comp=app|db|redis|obj`, `at=<ISO>`, `q`, `#mx|tr|lg`를 지원한다. 추가 `trace`는 펼칠 트레이스/연결 로그, `scope=all|component`는 로그에서 직접 연 트레이스를 다른 구성 요소 필터가 숨기지 않도록 구분한다.
- 조건 지우기, 브라우저 뒤로 가기, 새로고침으로 이동 맥락을 유지하거나 해제한다. 컴포넌트 및 workflow 변경 시 관련 조건을 초기화한다.

## 실제 API 연결 상태

**아래 API는 handoff가 제안한 계약이다. 이 PR은 백엔드를 구현하지 않는다.** 기존 `/v1/workflows/{id}/telemetry`의 단일 최신값으로 시계열·cloud 구분·스팬·로그를 만들어 내지 않는다. 시계열과 상세 API는 해당 서버가 구현해야 한다. 로그는 Loki 등 저장소 연결도 필요하다.

공통 Axios 인스턴스와 TanStack Query를 사용한다. 키는 workspace·workflow·구성 요소·시간·trace ID를 포함한다. `AbortSignal`과 기존 인증 쿠키/CSRF 구성을 유지한다. 모든 응답은 Zod로 검증한다.

| GET 경로                              | 검색값                     | 응답                                                             |
| ------------------------------------- | -------------------------- | ---------------------------------------------------------------- |
| `/v1/telemetry/collection`            | 없음                       | `{ modules: [{ id, name, state, lastCollectedAt }] }`            |
| `/v1/workflows/{id}/telemetry/series` | `comp, from, to, step=60s` | `{ comp, from, step, metrics: [{ key, unit, source, target }] }` |
| `/v1/workflows/{id}/traces`           | `from, to, comp?`          | `{ traces: [Trace] }`                                            |
| `/v1/workflows/{id}/traces/{traceId}` | 없음                       | `{ traceId, spans: [Span] }`                                     |
| `/v1/workflows/{id}/logs`             | `from, to, traceId?`       | `{ logs: [Log] }`                                                |

`from`, `to`, `at`, `lastCollectedAt`은 timezone을 포함한 ISO 8601 문자열이다. collection의 `state`는 `FRESH | STALE | UNAVAILABLE | UNKNOWN`이고 수집 시각이 없으면 `null`이다. 빈 수집 목록과 조회 실패는 녹색 상태 점으로 표시하지 않는다.

시계열의 `step`은 초 단위 양의 정수다. 모든 지표의 source/target 배열은 같은 시각 격자와 길이를 사용한다. 미실행 또는 누락 샘플은 `null`이다. 프론트는 null 구간의 선을 끊고 현재값을 `—`로 표시하며, 0을 그대로 보존한다. 배열은 요청 범위의 샘플을 시간순으로 보낸다.

| 구성 요소 | key와 unit                                                              |
| --------- | ----------------------------------------------------------------------- |
| app       | `throughput: req/s`, `error_rate: %`, `latency_p95: ms`, `cpu: %`       |
| db        | `queries: qps`, `latency_p95: ms`, `connections: ""`, `cpu: %`          |
| redis     | `commands: ops/s`, `hit_rate: %`, `latency_p95: ms`, `memory: %`        |
| obj       | `requests: req/s`, `error_rate: %`, `latency_p95: ms`, `transfer: MB/s` |

지표 이름과 단위는 화면에서 변환하지 않는다. 잘못된 단위·음수·서로 다른 배열 길이는 응답 오류로 처리한다. 차이 표시는 오류율과 지연에만 적용한다. source=0 또는 null이면 비율을 계산하지 않는다.

```ts
type Trace = {
  traceId: string;
  at: string;
  name: string;
  service: string;
  side: "source" | "target";
  durationMs: number;
  status: "ok" | "error";
  statusCode: string | null;
  components: ("app" | "db" | "redis" | "obj")[];
};
type Span = {
  spanId: string;
  parentSpanId: string | null;
  name: string;
  startMs: number;
  durationMs: number;
  status: "ok" | "error";
};
type Log = {
  id: string;
  at: string;
  level: "INFO" | "WARN" | "ERROR";
  side: "source" | "target";
  service: string;
  message: string;
  traceId: string | null;
  spanId: string | null;
};
```

`Span.startMs`는 root 시작부터의 상대 시간이다. `name`은 모듈 → 실제 자원 · 동작을 포함한다. OTEL `migration.component=object`는 백엔드에서 이 계약의 `obj`로 정규화해야 한다. 서비스가 응답하는 원문 메시지와 span 이름은 번역하지 않는다.

404·405·501은 해당 신호 미제공으로 표시한다. 401·403·서버 오류·잘못된 응답은 실패와 재조회 버튼을 표시한다. 조회 실패를 모의 성공값으로 대체하지 않는다. 정상 응답이 빈 배열이면 빈 결과로 표시한다. trace/log 필터는 반환된 결과 범위에서 적용한다. 백엔드는 이 범위의 전체 결과를 제공해야 하며 조용한 결과 잘림을 피해야 한다.

## 명시적 데모

```sh
VITE_API_MODE=demo vp dev
```

데모 계정으로 로그인 후 `/monitoring`을 연다. 화면에 예시 데이터임을 표시한다. 상단에서 `wf-monitoring-issue`(오류 및 Object 수집 누락), `wf-monitoring-live`(오류율 0), `wf-monitoring-idle`(대상 미실행)을 선택한다. 모의 응답은 `src/app/mocks/monitoring.ts`에서만 생성하며 실제 모드에서는 설치하지 않는다. 데모 workflow의 기존 마이그레이션 상세 API는 제공하지 않는다.

## 검증

`vp run check`와 `vp run build`를 실행한다. 신규 단위 검사는 null/0, 단위·배열 검증, ±2분 경계, 구성 요소 필터, 잘못된 URL, 접근 범위별 query key, 요청 취소 신호, 미제공 응답과 오류의 구분을 확인한다. 브라우저에서는 데스크톱·390px, 두 테마, KOR/ENG/日本語, 차트→트레이스→로그→트레이스, 키보드, URL 복원과 실제 모드의 미제공/권한 오류를 확인한다.
