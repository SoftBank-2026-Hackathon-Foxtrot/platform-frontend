export const messages: Record<string, { en: string; ja: string }> = {
  "서버 미지원": { en: "Not supported by server", ja: "サーバー未対応" },
  "관측값 없음": { en: "No observations", ja: "観測値なし" },
  "프로브 데이터 없음": { en: "No probe data", ja: "プローブデータなし" },
  "HOLD · 검사 생략 ": { en: "HOLD · Check skipped ", ja: "HOLD · 検査省略 " },
  "조회 중…": { en: "Loading…", ja: "読み込み中…" },
  "표본 없음": { en: "No samples", ja: "サンプルなし" },
  "지표 없음": { en: "No metrics", ja: "メトリクスなし" },
  "트레이스 없음": { en: "No traces", ja: "トレースなし" },
  " 이전 값 표시 중 · 최신 상태 미확인": {
    en: " Showing cached values · Current state unconfirmed",
    ja: " 前回の値を表示中 · 最新状態は未確認",
  },
  "갱신 실패": { en: "Refresh failed", ja: "更新失敗" },
  "실행 결과 대기": { en: "Awaiting execution result", ja: "実行結果待ち" },
  "명령 이력 없음": { en: "No command history", ja: "コマンド履歴なし" },
  "이벤트 없음": { en: "No events", ja: "イベントなし" },
  "등록된 마이그레이션 없음": { en: "No migrations registered", ja: "登録済みの移行なし" },
  "미실행 · 이전 환경 데이터 없음": {
    en: "Not started · No target data",
    ja: "未実行 · 移行先データなし",
  },
  "요청 중…": { en: "Sending…", ja: "送信中…" },
  경로·쓰기: { en: "Routing & writes", ja: "経路・書き込み" },
  검증: { en: "Verification", ja: "検証" },
  "복귀 방식": { en: "Rollback method", ja: "ロールバック方式" },
  "대상 쓰기 가능": {
    en: "Target writes possible",
    ja: "移行先への書き込み可能性",
  },
  조건: { en: "Condition", ja: "条件" },
  "최근 판정": { en: "Last decision", ja: "前回の判定" },
  "판정 없음": { en: "No decisions", ja: "判定なし" },
  "검증 결과": { en: "Verification result", ja: "検証結果" },
  "측정 시각": { en: "Measured", ja: "測定時刻" },
  "마지막 진전": { en: "Last progress", ja: "最終進捗" },
  "수집 시각": { en: "Collected", ja: "収集時刻" },
  "트래픽 분배": { en: "Traffic split", ja: "トラフィック配分" },
  "프로브 결과": { en: "Probe results", ja: "プローブ結果" },
  "테스트 요청 도착 비율": {
    en: "Test request destinations",
    ja: "テストリクエストの到達率",
  },
  "앱 상태": { en: "App status", ja: "アプリ状態" },
  "잔여 WebSocket": { en: "Remaining WebSockets", ja: "残存 WebSocket" },
  "관측 이력 · 전체 리소스": {
    en: "Observation history · All resources",
    ja: "観測履歴 · 全リソース",
  },
  "조회 시작": { en: "Since", ja: "取得開始" },
  "수집 데이터": { en: "Collected data", ja: "収集データ" },
  "수집 지표·트레이스 · 전체 리소스": {
    en: "Collected metrics & traces · All resources",
    ja: "収集メトリクス・トレース · 全リソース",
  },
  동기화: { en: "Sync", ja: "同期" },
  연결: { en: "Connections", ja: "接続" },
  "{0} 관측 상세 보기": { en: "View {0} observation details", ja: "{0} の観測詳細を見る" },
  "마이그레이션 관측": { en: "Migration observations", ja: "移行の観測" },
  "복제·동기화 상세": { en: "Replication details", ja: "複製・同期の詳細" },
  "관측 상세": { en: "Observation details", ja: "観測の詳細" },
  "단계·명령 이력 접기": {
    en: "Hide stage and command history",
    ja: "ステージ・コマンド履歴を閉じる",
  },
  "단계·명령 이력 보기": { en: "Stage and command history", ja: "ステージ・コマンド履歴を見る" },
  "최신 이벤트": { en: "Latest events", ja: "最新イベント" },
  "이 리소스의 관측값이 없습니다.": {
    en: "No observations for this resource.",
    ja: "このリソースの観測値はありません。",
  },
  관측값: { en: "Observations", ja: "観測値" },
  "선택한 트레이스": { en: "Selected trace", ja: "選択したトレース" },
  "{0} 계열 강조": { en: "Emphasizing {0}", ja: "{0} の系列を強調" },
  "{0} 마이그레이션으로 돌아가기": { en: "Return to {0} migration", ja: "{0} の移行に戻る" },
  "해당 마이그레이션 보기": { en: "View this migration", ja: "この移行を見る" },
  "{0} · {1} 지표 보기": { en: "{0} · View {1} metrics", ja: "{0} · {1} のメトリクスを見る" },
  모니터링: { en: "Monitoring", ja: "モニタリング" },
  "지표 보기": { en: "View metrics", ja: "メトリクスを見る" },
  "OTEL 수집 정상": { en: "OTEL collection healthy", ja: "OTEL 収集正常" },
  "OTEL 수집 끊김": { en: "OTEL collection interrupted", ja: "OTEL 収集中断" },
  "OTEL 수집 미확인": { en: "OTEL collection unknown", ja: "OTEL 収集未確認" },
  "{0} 조회 실패": { en: "Could not load {0}", ja: "{0}の取得に失敗しました" },
  "{0} 불러오는 중": { en: "Loading {0}…", ja: "{0}を読み込み中…" },
  "{0} 미제공": { en: "{0} unavailable", ja: "{0}は未提供です" },
  "연결된 서버가 이 관측 데이터를 제공하지 않습니다.": {
    en: "The connected server does not provide this telemetry.",
    ja: "接続先サーバーはこの観測データを提供していません。",
  },
  처리량: { en: "Throughput", ja: "スループット" },
  오류율: { en: "Error rate", ja: "エラー率" },
  "p95 지연": { en: "p95 latency", ja: "p95 レイテンシー" },
  쿼리: { en: "Queries", ja: "クエリ" },
  "쿼리 p95": { en: "Query p95", ja: "クエリ p95" },
  커넥션: { en: "Connections", ja: "接続数" },
  명령: { en: "Commands", ja: "コマンド" },
  히트율: { en: "Hit rate", ja: "ヒット率" },
  메모리: { en: "Memory", ja: "メモリ" },
  요청: { en: "Request", ja: "リクエスト" },
  전송: { en: "Transfer", ja: "転送" },
  "{0} · 눌러서 트레이스": {
    en: "{0} · Select to view traces",
    ja: "{0} · 選択してトレースを表示",
  },
  "{0} {1}배": { en: "{0} {1}×", ja: "{0} {1}倍" },
  "{0} 그래프. 화살표로 시각 선택, Enter로 트레이스 열기": {
    en: "{0} chart. Arrow keys select time; Enter opens traces",
    ja: "{0}のグラフ。矢印キーで時刻を選択、Enterでトレースを開く",
  },
  "수집된 지표가 없습니다.": {
    en: "No collected metrics.",
    ja: "収集されたメトリクスはありません。",
  },
  전체: { en: "All", ja: "すべて" },
  "300ms 초과": { en: "Over 300ms", ja: "300ms 超" },
  "이전 환경만": { en: "Target only", ja: "移行先のみ" },
  "트레이스 필터": { en: "Trace filters", ja: "トレースフィルター" },
  "조건에 맞는 트레이스가 없습니다.": {
    en: "No traces match these filters.",
    ja: "条件に一致するトレースはありません。",
  },
  시각: { en: "Time", ja: "時刻" },
  처리: { en: "Served by", ja: "処理環境" },
  소요: { en: "Duration", ja: "所要時間" },
  정상: { en: "OK", ja: "正常" },
  "이 트레이스의 로그": { en: "Logs for this trace", ja: "このトレースのログ" },
  "스팬 상세": { en: "Span details", ja: "スパン詳細" },
  "수집된 스팬이 없습니다.": { en: "No collected spans.", ja: "収集されたスパンはありません。" },
  "로그 수준": { en: "Log level", ja: "ログレベル" },
  "메시지 · trace id 검색": { en: "Search message or trace ID", ja: "メッセージ・trace IDを検索" },
  "조건에 맞는 로그가 없습니다.": {
    en: "No logs match these filters.",
    ja: "条件に一致するログはありません。",
  },
  수준: { en: "Level", ja: "レベル" },
  서비스: { en: "Service", ja: "サービス" },
  메시지: { en: "Message", ja: "メッセージ" },
  트레이스: { en: "Traces", ja: "トレース" },
  "트레이스 {0} 열기": { en: "Open trace {0}", ja: "トレース {0}を開く" },
  "모니터링할 마이그레이션이 없습니다. 애플리케이션에서 마이그레이션을 등록하세요.": {
    en: "No migrations to monitor. Create a migration from Applications.",
    ja: "モニタリングする移行がありません。アプリケーションから移行を登録してください。",
  },
  "마이그레이션 {0} · {1}에서 열림": {
    en: "Migration {0} · Opened from {1}",
    ja: "マイグレーション {0} · {1}から表示",
  },
  "모니터링할 마이그레이션": { en: "Migration to monitor", ja: "モニタリングする移行" },
  "OTEL 수집 {0} / {1}": { en: "OTEL collection {0} / {1}", ja: "OTEL 収集 {0} / {1}" },
  "수집 없음": { en: "No collection", ja: "収集なし" },
  "선택 시각 기준 30분": { en: "30 min around selected time", ja: "選択時刻を基準に30分" },
  "최근 30분": { en: "Last 30 minutes", ja: "直近30分" },
  "관측값 새로고침": { en: "Refresh telemetry", ja: "観測値を更新" },
  "데모 · 예시 관측 데이터입니다.": {
    en: "Demo · Illustrative telemetry data.",
    ja: "デモ · 観測データのサンプルです。",
  },
  "OTEL 수집": { en: "OTEL collection", ja: "OTEL 収集" },
  "관측 신호": { en: "Telemetry signals", ja: "観測シグナル" },
  지표: { en: "Metrics", ja: "メトリクス" },
  로그: { en: "Logs", ja: "ログ" },
  "구성 요소": { en: "Component", ja: "構成要素" },
  기존: { en: "Source", ja: "移行元" },
  이전: { en: "Target", ja: "移行先" },
  "마이그레이션 미실행 · 이전 환경의 관측값은 아직 없습니다.": {
    en: "Migration not started · No target observations yet.",
    ja: "移行未実行 · 移行先の観測値はまだありません。",
  },
  "시계열 지표": { en: "Metric time series", ja: "時系列メトリクス" },
  "시각 선택": { en: "Select time", ja: "時刻を選択" },
  "이 시각 트레이스": { en: "Traces at this time", ja: "この時刻のトレース" },
  "시간 조건 지우기": { en: "Clear time filter", ja: "時間条件を解除" },
  "트레이스 조건 지우기": { en: "Clear trace filter", ja: "トレース条件を解除" },
  앱: { en: "App", ja: "アプリ" },
  "DB 어댑터": { en: "DB adapter", ja: "DB アダプター" },
  "Redis 프록시": { en: "Redis proxy", ja: "Redis プロキシ" },
  "Object 워커": { en: "Object worker", ja: "Object ワーカー" },
  "트래픽 모듈": { en: "Traffic module", ja: "トラフィックモジュール" },
  "본문으로 이동": { en: "Skip to content", ja: "本文へ移動" },
  "앱을 표시할 root 요소가 없습니다.": {
    en: "Missing root element.",
    ja: "root 要素がありません。",
  },
  "로그인 상태를 확인하는 중입니다.": {
    en: "Checking session…",
    ja: "ログイン状態を確認中です。",
  },
  "대상 환경 준비": {
    en: "Prepare target",
    ja: "移行先の準備",
  },
  "데이터 동기화": {
    en: "Data sync",
    ja: "データ同期",
  },
  "객체 저장소 전환": {
    en: "Object cutover",
    ja: "ストレージ切替",
  },
  "카나리 트래픽": {
    en: "Canary traffic",
    ja: "カナリア配信",
  },
  "Redis 전환": {
    en: "Redis cutover",
    ja: "Redis 切替",
  },
  "데이터베이스 전환": {
    en: "Database cutover",
    ja: "DB 切替",
  },
  "트래픽 전환": {
    en: "Traffic shift",
    ja: "トラフィック切替",
  },
  마무리: {
    en: "Finalize",
    ja: "最終確定",
  },
  "승인 대기": {
    en: "Awaiting approval",
    ja: "承認待ち",
  },
  "진행 중": {
    en: "Running",
    ja: "実行中",
  },
  멈춤: {
    en: "Halted",
    ja: "停止中",
  },
  "되돌리는 중": {
    en: "Rolling back",
    ja: "ロールバック中",
  },
  "취소 중": {
    en: "Aborting",
    ja: "中止処理中",
  },
  완료: {
    en: "Completed",
    ja: "完了",
  },
  취소됨: {
    en: "Aborted",
    ja: "中止済み",
  },
  "입력값을 확인하세요.": {
    en: "Check your input.",
    ja: "入力内容を確認してください。",
  },
  "앱 이름": {
    en: "App name",
    ja: "アプリ名",
  },
  아키텍처: {
    en: "Architecture",
    ja: "アーキテクチャ",
  },
  "컨테이너 이미지 (digest 고정)": {
    en: "Container image (pinned digest)",
    ja: "コンテナイメージ（digest 固定）",
  },
  포트: {
    en: "Port",
    ja: "ポート",
  },
  "메모리 (MiB)": {
    en: "Memory (MiB)",
    ja: "メモリ（MiB）",
  },
  "저장 중": {
    en: "Saving…",
    ja: "保存中",
  },
  "변경 저장": {
    en: "Save changes",
    ja: "変更を保存",
  },
  "앱 등록": {
    en: "Register app",
    ja: "アプリを登録",
  },
  버전: {
    en: "Version",
    ja: "バージョン",
  },
  "기준으로 저장합니다. 저장하면 다시 검증해야 합니다.": {
    en: "is used for saving. Verify again after saving.",
    ja: "を基準に保存します。保存後は再検証が必要です。",
  },
  "저장하지 못했습니다": {
    en: "Could not save",
    ja: "保存できませんでした",
  },
  원본: {
    en: "Source",
    ja: "移行元",
  },
  대상: {
    en: "Target",
    ja: "移行先",
  },
  "계획을 만드는 중": {
    en: "Creating plan…",
    ja: "計画を作成中",
  },
  "마이그레이션 계획 만들기": {
    en: "Create migration plan",
    ja: "移行計画を作成",
  },
  "원본과 대상은 다른 환경이어야 합니다.": {
    en: "Source and target must differ.",
    ja: "移行元と移行先は異なる環境を選んでください。",
  },
  "마이그레이션을 만들지 못했습니다": {
    en: "Could not create migration",
    ja: "移行計画を作成できませんでした",
  },
  "진행 중인 마이그레이션 보기": {
    en: "View active migration",
    ja: "実行中の移行を表示",
  },
  환경: {
    en: "Environment",
    ja: "環境",
  },
  "애플리케이션 목록": {
    en: "Applications",
    ja: "アプリ一覧",
  },
  "앱 정보를 불러오는 중입니다.": {
    en: "Loading app…",
    ja: "アプリ情報を取得中です。",
  },
  "앱 정보를 불러오지 못했습니다": {
    en: "Could not load app",
    ja: "アプリ情報を取得できませんでした",
  },
  "등록 해제": {
    en: "Unregister",
    ja: "登録を解除",
  },
  "더 이상 이 앱으로 마이그레이션을 만들 수 없습니다. 기록은 남습니다.": {
    en: "This app can no longer be migrated. History is retained.",
    ja: "このアプリの移行計画は作成できなくなります。履歴は保持されます。",
  },
  닫기: {
    en: "Close",
    ja: "閉じる",
  },
  "1. 이미지 등록": {
    en: "1. Register image",
    ja: "1. イメージ登録",
  },
  "2. 리소스 연결": {
    en: "2. Connect resources",
    ja: "2. リソース接続",
  },
  "3. 이전 준비 검증": {
    en: "3. Verify readiness",
    ja: "3. 移行準備の検証",
  },
  "등록 해제 실패": {
    en: "Unregister failed",
    ja: "登録解除に失敗しました",
  },
  "리소스 연결": {
    en: "Connect resources",
    ja: "リソース接続",
  },
  "서버가 승인한 카탈로그(DB·Redis·객체 저장소와 환경)를 이 앱에 연결합니다.": {
    en: "Connect the server-approved catalog of databases, Redis, storage and environments.",
    ja: "サーバーが承認した DB・Redis・ストレージ・環境のカタログを接続します。",
  },
  방향: {
    en: "Direction",
    ja: "方向",
  },
  미확인: {
    en: "Unknown",
    ja: "未確認",
  },
  리소스: {
    en: "Resources",
    ja: "リソース",
  },
  "아직 연결된 리소스가 없습니다.": {
    en: "No resources connected yet.",
    ja: "接続されたリソースはありません。",
  },
  "카탈로그로 다시 연결": {
    en: "Reconnect catalog",
    ja: "カタログを再接続",
  },
  "카탈로그 리소스 연결": {
    en: "Connect catalog resources",
    ja: "カタログのリソースを接続",
  },
  "연결 실패": {
    en: "Connection failed",
    ja: "接続失敗",
  },
  "이전 준비 검증": {
    en: "Verify migration readiness",
    ja: "移行準備の検証",
  },
  "연결한 리소스와 정책으로 실제 이전이 가능한지 서버가 확인합니다.": {
    en: "The server checks whether the connected resources and policy allow migration.",
    ja: "接続したリソースとポリシーで移行できるかサーバーが確認します。",
  },
  "검증 중": {
    en: "Verifying…",
    ja: "検証中",
  },
  "검증 실행": {
    en: "Run verification",
    ja: "検証を実行",
  },
  "리소스를 먼저 연결하십시오.": {
    en: "Connect resources first.",
    ja: "先にリソースを接続してください。",
  },
  "검증 요청 실패": {
    en: "Verification request failed",
    ja: "検証リクエストに失敗しました",
  },
  "마이그레이션 시작": {
    en: "Start migration",
    ja: "移行を開始",
  },
  "검증을 통과한 앱만 계획을 만들 수 있습니다.": {
    en: "Only verified apps can create plans.",
    ja: "検証済みのアプリのみ計画を作成できます。",
  },
  "먼저 이전 준비 검증을 통과해야 합니다.": {
    en: "Pass readiness verification first.",
    ja: "先に移行準備の検証に合格してください。",
  },
  "앱 변경": {
    en: "Edit app",
    ja: "アプリを編集",
  },
  "이미지나 실행 자원을 바꾸면 다시 검증해야 합니다.": {
    en: "Image or runtime resource changes require verification again.",
    ja: "イメージや実行リソースの変更後は再検証が必要です。",
  },
  "검증 통과": {
    en: "Verification passed",
    ja: "検証合格",
  },
  "검증 실패": {
    en: "Verification failed",
    ja: "検証失敗",
  },
  "막는 항목:": {
    en: "Blockers:",
    ja: "阻害要因:",
  },
  "이전 정책": {
    en: "Migration policy",
    ja: "移行ポリシー",
  },
  "허용 방향과 쓰기 정지 최대 시간입니다. 대상 쓰기 후 되돌리기는 허용하지 않습니다.": {
    en: "Allowed direction and maximum write pause. Rollback after target writes is not allowed.",
    ja: "許可する方向と書き込み停止の上限です。移行先での書き込み後は戻せません。",
  },
  "방향 명시적으로 허용": {
    en: "Explicitly allow this direction",
    ja: "この方向を明示的に許可",
  },
  "리소스를 연결하면 방향을 정할 수 있습니다.": {
    en: "Connect resources to set the direction.",
    ja: "リソース接続後に方向を設定できます。",
  },
  "최대 쓰기 정지 (초, 1–300)": {
    en: "Maximum write pause (seconds, 1–300)",
    ja: "書き込み停止上限（秒、1–300）",
  },
  "정책 저장": {
    en: "Save policy",
    ja: "ポリシーを保存",
  },
  "정책을 저장하면 다시 검증해야 합니다.": {
    en: "Verify again after saving the policy.",
    ja: "ポリシーの保存後は再検証が必要です。",
  },
  "정책 저장 실패": {
    en: "Could not save policy",
    ja: "ポリシーを保存できませんでした",
  },
  "변경 기록": {
    en: "Change history",
    ja: "変更履歴",
  },
  "기록을 불러오는 중입니다.": {
    en: "Loading history…",
    ja: "履歴を取得中です。",
  },
  "기록을 불러오지 못했습니다": {
    en: "Could not load history",
    ja: "履歴を取得できませんでした",
  },
  "기록이 없습니다.": {
    en: "No history yet.",
    ja: "履歴はありません。",
  },
  "다음 기록": {
    en: "Next records",
    ja: "次の履歴",
  },
  데이터베이스: {
    en: "Database",
    ja: "データベース",
  },
  "객체 저장소": {
    en: "Object storage",
    ja: "オブジェクトストレージ",
  },
  애플리케이션: {
    en: "Applications",
    ja: "アプリケーション",
  },
  "이전할 앱을 등록하고 리소스를 연결해 검증한 뒤 마이그레이션을 시작합니다.": {
    en: "Register an app, connect resources, verify readiness, then start migration.",
    ja: "アプリを登録し、リソースを接続して検証した後に移行を開始します。",
  },
  "앱 목록을 불러오는 중입니다.": {
    en: "Loading applications…",
    ja: "アプリ一覧を取得中です。",
  },
  "앱 목록을 불러오지 못했습니다": {
    en: "Could not load applications",
    ja: "アプリ一覧を取得できませんでした",
  },
  "등록한 앱": {
    en: "Registered apps",
    ja: "登録済みアプリ",
  },
  "내 workspace에 등록한 앱입니다.": {
    en: "Apps registered in your workspace.",
    ja: "ワークスペースに登録したアプリです。",
  },
  "아직 등록한 앱이 없습니다. 오른쪽에서 이미지로 등록하십시오.": {
    en: "No apps yet. Register one using a container image.",
    ja: "登録済みアプリはありません。イメージから登録してください。",
  },
  "새 앱 등록": {
    en: "Register a new app",
    ja: "新しいアプリを登録",
  },
  "digest로 고정한 컨테이너 이미지만 받습니다. 태그(:latest)는 거절됩니다.": {
    en: "Only digest-pinned images are accepted. Tags such as :latest are rejected.",
    ja: "digest 固定のイメージのみ使用できます。:latest などのタグは使えません。",
  },
  "진행 중인 마이그레이션이 있습니다": {
    en: "A migration is active",
    ja: "実行中の移行があります",
  },
  "마이그레이션이 끝나거나 취소될 때까지 앱을 등록·수정할 수 없습니다.": {
    en: "App registration and editing are disabled until migration completes or is aborted.",
    ja: "移行の完了または中止までアプリの登録・編集はできません。",
  },
  보기: {
    en: "View",
    ja: "表示",
  },
  "시드 구성": {
    en: "Seed configuration",
    ja: "シード設定",
  },
  "· 트래픽 풀": {
    en: "· Traffic pool",
    ja: "· トラフィックプール",
  },
  "리소스 연결됨": {
    en: "Resources connected",
    ja: "リソース接続済み",
  },
  "리소스 미연결": {
    en: "Resources not connected",
    ja: "リソース未接続",
  },
  "· 검증 {0}": {
    en: "· Verified {0}",
    ja: "· 検証 {0}",
  },
  "GitHub 로그인을 취소했습니다.": {
    en: "GitHub sign-in was cancelled.",
    ja: "GitHub ログインをキャンセルしました。",
  },
  "Foxtrot 플랫폼 콘솔": {
    en: "Foxtrot Platform Console",
    ja: "Foxtrot プラットフォーム",
  },
  "앱을 등록하고 클라우드 이전을 단계마다 승인하며 전환 과정을 확인합니다.": {
    en: "Register apps, approve migration stages and monitor the transition.",
    ja: "アプリを登録し、移行の各段階を承認して進捗を確認します。",
  },
  "로그인하지 못했습니다": {
    en: "Could not sign in",
    ja: "ログインできませんでした",
  },
  "로그인 오류: {0}": {
    en: "Sign-in error: {0}",
    ja: "ログインエラー: {0}",
  },
  "데모 계정으로 시작": {
    en: "Start with demo account",
    ja: "デモアカウントで開始",
  },
  "GitHub로 로그인": {
    en: "Sign in with GitHub",
    ja: "GitHub でログイン",
  },
  "승인하고 진행": {
    en: "Approve and continue",
    ja: "承認して続行",
  },
  "현재 단계를 승인하면 엔진이 다음 작업을 진행합니다.": {
    en: "Approving this stage lets the engine continue.",
    ja: "この段階を承認すると、エンジンが次の作業を進めます。",
  },
  "승인하면 대상 환경을 준비하고 데이터 동기화를 시작합니다. 원본은 그대로 운영되며, 언제든 취소할 수 있습니다.":
    {
      en: "Approving prepares the target and starts data sync. The source keeps serving, and you can cancel at any time.",
      ja: "承認すると移行先を準備し、データ同期を始めます。移行元はそのまま稼働し、いつでも取り消せます。",
    },
  "승인하면 Redis를 전환하고 이어서 데이터베이스를 전환합니다. 전환 뒤에도 원본으로 역방향 동기화가 계속되어, 문제가 생기면 리소스별로 되돌릴 수 있습니다.":
    {
      en: "Approving switches Redis and then the database. Reverse sync to the source keeps running after the switch, so each resource can be rolled back if something goes wrong.",
      ja: "承認すると Redis、続いてデータベースを切り替えます。切り替え後も移行元への逆方向同期が続くため、問題があればリソースごとに戻せます。",
    },
  "승인하면 역방향 동기화를 멈추고 원본 쪽 경로를 정리합니다. 이후에는 원본으로 되돌릴 수 없습니다.":
    {
      en: "Approving stops reverse sync and cleans up the source path. After this, you cannot roll back to the source.",
      ja: "承認すると逆方向同期を止め、移行元の経路を片付けます。これ以降は移行元に戻せません。",
    },
  "일시 정지": {
    en: "Pause",
    ja: "一時停止",
  },
  "다음 변경을 보내지 않고 멈춥니다. 이미 실행 중인 작업은 기록을 유지합니다.": {
    en: "Stop sending further changes. Records of running operations are retained.",
    ja: "以降の変更を停止します。実行中の処理の記録は保持されます。",
  },
  재개: {
    en: "Resume",
    ja: "再開",
  },
  "멈춘 지점부터 다시 진행합니다. 멈춘 원인을 확인했는지 점검하십시오.": {
    en: "Continue from the paused point. Check the cause first.",
    ja: "停止位置から再開します。原因を先に確認してください。",
  },
  "상태 대조": {
    en: "Reconcile state",
    ja: "状態を照合",
  },
  "결과가 불명확한 작업을 실제 어댑터 상태와 대조합니다. 대조가 끝나면 재개할 수 있습니다.": {
    en: "Reconcile uncertain operations with the adapter's actual state before resuming.",
    ja: "結果が不明な処理をアダプターの実際の状態と照合します。完了後に再開できます。",
  },
  "리소스 되돌리기": {
    en: "Roll back resource",
    ja: "リソースを戻す",
  },
  "선택한 리소스를 원본 환경으로 되돌립니다. 되돌린 뒤 계속하려면 새 마이그레이션이 필요합니다.": {
    en: "Return the selected resource to its source. A new migration is required afterward.",
    ja: "選択したリソースを移行元に戻します。続行には新しい移行計画が必要です。",
  },
  "마이그레이션 취소": {
    en: "Abort migration",
    ja: "移行を中止",
  },
  "이 마이그레이션을 취소하고 원본 환경 기준으로 정리합니다. 되돌릴 수 없습니다.": {
    en: "Abort and clean up against the source environment. This cannot be undone.",
    ja: "移行を中止して移行元を基準に整理します。取り消しはできません。",
  },
  "실행 가능한 명령 없음": {
    en: "No commands available",
    ja: "実行できる操作はありません",
  },
  "명령을 보내는 중입니다.": {
    en: "Sending command…",
    ja: "操作を送信中です。",
  },
  "명령이 거절됐습니다": {
    en: "Command rejected",
    ja: "操作が拒否されました",
  },
  "되돌릴 리소스를 고르십시오": {
    en: "Select a resource to roll back",
    ja: "戻すリソースを選択",
  },
  방식: {
    en: "Mode",
    ja: "方式",
  },
  "정상 되돌리기 (역방향 동기화)": {
    en: "Normal rollback (reverse sync)",
    ja: "通常のロールバック（逆方向同期）",
  },
  "대상 장애 되돌리기 (데이터 유실 가능)": {
    en: "Target failure rollback (possible data loss)",
    ja: "障害時のロールバック（データ損失の可能性）",
  },
  "대상 Redis 장애를 확인했고, 동기화되지 않은 쓰기가 유실될 수 있음을 이해합니다.": {
    en: "I confirm the target Redis has failed and understand that unsynchronized writes may be lost.",
    ja: "移行先 Redis の障害を確認し、未同期の書き込みが失われる可能性を理解しています。",
  },
  "되돌리기 요청": {
    en: "Request rollback",
    ja: "ロールバックを要求",
  },
  "관측값을 갱신하지 못했습니다": {
    en: "Could not refresh observations",
    ja: "観測値を更新できませんでした",
  },
  "이전 값이 표시되어 있다면 최신 상태를 보장하지 않습니다.": {
    en: "Previously displayed values may no longer be current.",
    ja: "以前の値が表示されている場合、最新とは限りません。",
  },
  "다시 조회": {
    en: "Retry",
    ja: "再取得",
  },
  "관측값을 불러오는 중입니다.": {
    en: "Loading observations…",
    ja: "観測値を取得中です。",
  },
  "전환 구성도": {
    en: "Migration topology",
    ja: "移行構成図",
  },
  "리소스 사용 위치 · 복제 상태 · 현재 전환 단계 · 2초마다 갱신": {
    en: "Resource routes · Replication · Current stage · Updates every 2s",
    ja: "使用先 · 複製状態 · 現在の段階 · 2秒ごとに更新",
  },
  "계획을 확인하고 승인하면 첫 단계가 시작됩니다.": {
    en: "Review and approve the plan to start.",
    ja: "計画を確認して承認すると開始します。",
  },
  "되돌리기 어려운 단계입니다. 상태를 확인하고 승인하십시오.": {
    en: "This stage is difficult to reverse. Check the status before approving.",
    ja: "元に戻すことが困難です。状態を確認して承認してください。",
  },
  "엔진이 진행 중입니다. 문제가 보이면 일시 정지할 수 있습니다.": {
    en: "The engine is running. Pause if a problem appears.",
    ja: "実行中です。問題があれば一時停止できます。",
  },
  "멈췄습니다. 원인을 확인하고 재개·대조·되돌리기·취소 중 하나를 고르십시오.": {
    en: "Halted. Check the cause, then resume, reconcile, roll back or abort.",
    ja: "停止しました。原因を確認し、再開・照合・ロールバック・中止を選んでください。",
  },
  "리소스를 원본으로 되돌리는 중입니다.": {
    en: "Returning resources to the source.",
    ja: "リソースを移行元に戻しています。",
  },
  "취소하고 정리하는 중입니다.": {
    en: "Aborting and cleaning up.",
    ja: "中止して整理しています。",
  },
  "모든 단계가 끝났습니다.": {
    en: "All stages completed.",
    ja: "すべての段階が完了しました。",
  },
  "취소된 마이그레이션입니다.": {
    en: "This migration was aborted.",
    ja: "この移行は中止されました。",
  },
  "마이그레이션 목록": {
    en: "Migrations",
    ja: "移行一覧",
  },
  "단계 미확인": {
    en: "Unknown stage",
    ja: "段階未確認",
  },
  "작업 정보": {
    en: "Operation details",
    ja: "操作情報",
  },
  "· 버전": {
    en: "· Version",
    ja: "· バージョン",
  },
  시작: {
    en: "Started",
    ja: "開始",
  },
  실행자: {
    en: "Started by",
    ja: "実行者",
  },
  새로고침: {
    en: "Refresh",
    ja: "更新",
  },
  "배포 준비": {
    en: "Deployment preparation",
    ja: "デプロイ準備",
  },
  "IaC · 인프라 준비": {
    en: "IaC · Infrastructure preparation",
    ja: "IaC · インフラ準備",
  },
  "컴퓨트 · 앱 배포 준비": {
    en: "Compute · App deployment preparation",
    ja: "コンピュート · アプリのデプロイ準備",
  },
  "작업 / 상태": {
    en: "Operation / Status",
    ja: "操作 / 状態",
  },
  "대상 VM": {
    en: "Target VM",
    ja: "移行先 VM",
  },
  "생성 / 수정 / 삭제 / 교체": {
    en: "Create / Update / Delete / Replace",
    ja: "作成 / 更新 / 削除 / 置換",
  },
  이미지: {
    en: "Image",
    ja: "イメージ",
  },
  "내부 검사": {
    en: "Internal check",
    ja: "内部チェック",
  },
  "최근 명령": {
    en: "Recent operations",
    ja: "最近の操作",
  },
  "결과 기록": {
    en: "Result timestamp",
    ja: "結果の記録時刻",
  },
  "실제 실행 결과가 아직 보고되지 않았습니다.": {
    en: "Execution results have not been reported yet.",
    ja: "実行結果はまだ報告されていません。",
  },
  "트래픽 전환과 공용 경로 확인": {
    en: "Traffic shift and public route verification",
    ja: "トラフィック切替と公開経路の確認",
  },
  "요청 가중치": {
    en: "Requested weights",
    ja: "要求した重み",
  },
  "LB 확인 가중치": {
    en: "Verified LB weights",
    ja: "LB 確認済みの重み",
  },
  "설정 확인": {
    en: "Configuration verified",
    ja: "設定確認",
  },
  확인됨: {
    en: "Verified",
    ja: "確認済み",
  },
  "Traffic 작업 ID": {
    en: "Traffic operation ID",
    ja: "トラフィック操作 ID",
  },
  "작업 상태": {
    en: "Operation status",
    ja: "操作状態",
  },
  "Probe 최신성": {
    en: "Probe freshness",
    ja: "プローブの鮮度",
  },
  "관측된 도착 비율": {
    en: "Observed destination ratio",
    ja: "観測された到達比率",
  },
  "시도 / 위치 확인": {
    en: "Attempts / Located",
    ja: "試行 / 位置確認",
  },
  "실패 / 시간 초과": {
    en: "Failed / Timed out",
    ja: "失敗 / タイムアウト",
  },
  "위치 미확인 / 누락": {
    en: "Unknown location / Missing",
    ja: "位置未確認 / 欠落",
  },
  "성공 p95 / 최대 간격": {
    en: "Success p95 / Max gap",
    ja: "成功 p95 / 最大間隔",
  },
  "· 확인된 표본 30개 미만": {
    en: "· Fewer than 30 located samples",
    ja: "· 位置確認済みサンプルが30件未満",
  },
  "관측 실패": {
    en: "Observation failure",
    ja: "観測失敗",
  },
  "· 회복": {
    en: "· Recovered",
    ja: "· 回復",
  },
  "공용 probe가 아직 수집되지 않았습니다.": {
    en: "No public probes collected yet.",
    ja: "公開プローブはまだ収集されていません。",
  },
  "앱 업무 확인과 연결 소진": {
    en: "Workload checks and connection draining",
    ja: "業務チェックと接続の排出",
  },
  "현재 업무 지시": {
    en: "Current workload directive",
    ja: "現在の業務指示",
  },
  "보관된 업무 지시": {
    en: "Archived workload directive",
    ja: "保存された業務指示",
  },
  "· 세대": {
    en: "· Generation",
    ja: "· 世代",
  },
  "· 전체 정지 확인": {
    en: "· All held since",
    ja: "· 全停止確認",
  },
  "HOLD 중 검사를 건너뜁니다.": {
    en: "Checks are skipped during HOLD.",
    ja: "HOLD 中はチェックを省略します。",
  },
  "앱 역할": {
    en: "App role",
    ja: "アプリの役割",
  },
  상태: {
    en: "Status",
    ja: "状態",
  },
  "보고 / 기대": {
    en: "Reported / Expected",
    ja: "報告 / 想定",
  },
  "업무 in-flight": {
    en: "Work in flight",
    ja: "処理中の業務",
  },
  "{0} (일부 보고)": {
    en: "{0} (partial reports)",
    ja: "{0}（一部の報告）",
  },
  "실행 명령": {
    en: "Executed operations",
    ja: "実行操作",
  },
  "모듈 / 명령": {
    en: "Module / Operation",
    ja: "モジュール / 操作",
  },
  "실제 작업 ID": {
    en: "Adapter operation ID",
    ja: "実際の操作 ID",
  },
  종료: {
    en: "Finished",
    ja: "終了",
  },
  "아직 실행된 명령이 없습니다.": {
    en: "No operations executed yet.",
    ja: "実行された操作はありません。",
  },
  "연결된 컨트롤 플레인이 이 관측 정보를 제공하지 않습니다.": {
    en: "The connected control plane does not provide these observations.",
    ja: "接続先はこの観測情報を提供していません。",
  },
  "관측 이력": {
    en: "Observation history",
    ja: "観測履歴",
  },
  "단계 이벤트": {
    en: "Stage events",
    ja: "段階イベント",
  },
  "이벤트를 불러오는 중입니다.": {
    en: "Loading events…",
    ja: "イベントを取得中です。",
  },
  "아직 이벤트가 없습니다.": {
    en: "No events yet.",
    ja: "イベントはありません。",
  },
  "다음 이벤트": {
    en: "Next events",
    ja: "次のイベント",
  },
  "최근 관측 표본": {
    en: "Recent observation samples",
    ja: "最近の観測サンプル",
  },
  수집: {
    en: "Collected",
    ja: "収集",
  },
  모듈: {
    en: "Module",
    ja: "モジュール",
  },
  "단계 / 오류": {
    en: "Stage / Error",
    ja: "段階 / エラー",
  },
  "표본을 불러오는 중입니다.": {
    en: "Loading samples…",
    ja: "サンプルを取得中です。",
  },
  "이 구간에 표본이 없습니다.": {
    en: "No samples in this interval.",
    ja: "この期間のサンプルはありません。",
  },
  "다음 표본": {
    en: "Next samples",
    ja: "次のサンプル",
  },
  "원본 관측 경과 (초)": {
    en: "Observation age (s)",
    ja: "元の観測からの経過（秒）",
  },
  "관측 가능 (1/0)": {
    en: "Available (1/0)",
    ja: "観測可能（1/0）",
  },
  "복사 완료": {
    en: "Copied",
    ja: "コピー済み",
  },
  "복사 전체": {
    en: "Total to copy",
    ja: "コピー総数",
  },
  "복제 backlog": {
    en: "Replication backlog",
    ja: "複製 backlog",
  },
  "복제 지연 (초)": {
    en: "Replication lag (s)",
    ja: "複製遅延（秒）",
  },
  "Redis 지연 (ms)": {
    en: "Redis lag (ms)",
    ja: "Redis 遅延（ms）",
  },
  "미반영 변경 경과 (ms)": {
    en: "Oldest pending change (ms)",
    ja: "未反映変更の経過（ms）",
  },
  "프록시 처리 중 쓰기": {
    en: "Proxy in-flight writes",
    ja: "プロキシの処理中書き込み",
  },
  "프록시 열린 트랜잭션": {
    en: "Proxy open transactions",
    ja: "プロキシの未完了トランザクション",
  },
  "프록시 마지막 pause (ms)": {
    en: "Proxy last pause (ms)",
    ja: "プロキシの最終停止（ms）",
  },
  "앱 처리 중 요청": {
    en: "App in-flight requests",
    ja: "アプリの処理中リクエスト",
  },
  "활성 WebSocket": {
    en: "Active WebSockets",
    ja: "アクティブ WebSocket",
  },
  "공용 검사 실패": {
    en: "Public probe failures",
    ja: "公開プローブ失敗",
  },
  "공용 검사 p95 (ms)": {
    en: "Public probe p95 (ms)",
    ja: "公開プローブ p95（ms）",
  },
  "OTEL 수집 상태와 작업 추적": {
    en: "OTEL collection and traces",
    ja: "OTEL 収集状態とトレース",
  },
  "수집 결과를 불러오는 중입니다.": {
    en: "Loading collection results…",
    ja: "収集結果を取得中です。",
  },
  메트릭: {
    en: "Metrics",
    ja: "メトリクス",
  },
  추적: {
    en: "Traces",
    ja: "トレース",
  },
  수치: {
    en: "Metric",
    ja: "指標",
  },
  값: {
    en: "Value",
    ja: "値",
  },
  표본: {
    en: "Sample",
    ja: "サンプル",
  },
  "수집된 메트릭이 없습니다.": {
    en: "No metrics collected.",
    ja: "収集されたメトリクスはありません。",
  },
  "작업 추적 ID": {
    en: "Trace ID",
    ja: "トレース ID",
  },
  "시작 서비스 / 작업": {
    en: "Root service / Operation",
    ja: "開始サービス / 操作",
  },
  "소요 (ms)": {
    en: "Duration (ms)",
    ja: "所要時間（ms）",
  },
  "수집된 작업 추적이 없습니다.": {
    en: "No traces collected.",
    ja: "収集されたトレースはありません。",
  },
  예: {
    en: "Yes",
    ja: "はい",
  },
  아니오: {
    en: "No",
    ja: "いいえ",
  },
  최신: {
    en: "Fresh",
    ja: "最新",
  },
  "오래된 측정": {
    en: "Stale",
    ja: "古い観測値",
  },
  "수집 실패": {
    en: "Unavailable",
    ja: "収集失敗",
  },
  "마이그레이션 등록 대기": {
    en: "Awaiting migration registration",
    ja: "移行登録待ち",
  },
  "현재 데이터 경로": {
    en: "Current data route",
    ja: "現在のデータ経路",
  },
  "쓰기 접근": {
    en: "Write access",
    ja: "書き込みアクセス",
  },
  "PgBouncer 정지": {
    en: "PgBouncer paused",
    ja: "PgBouncer 停止",
  },
  "Writer 세션 (원본 / 대상)": {
    en: "Writer sessions (source / target)",
    ja: "Writer セッション（元 / 先）",
  },
  "대상 접근 가능": {
    en: "Target reachable",
    ja: "移行先への接続",
  },
  "쓰기 접근 근거": {
    en: "Write access evidence",
    ja: "書き込みアクセスの根拠",
  },
  "검증 방식": {
    en: "Verification method",
    ja: "検証方式",
  },
  "검증 시각": {
    en: "Verified at",
    ja: "検証時刻",
  },
  "Barrier / 적용 LSN": {
    en: "Barrier / Applied LSN",
    ja: "Barrier / 適用 LSN",
  },
  "동기화 방향": {
    en: "Sync direction",
    ja: "同期方向",
  },
  "Backlog / 처리 건수": {
    en: "Backlog / Processed",
    ja: "Backlog / 処理件数",
  },
  "최장 대기 (ms)": {
    en: "Oldest pending (ms)",
    ja: "最大待機（ms）",
  },
  "동기화 측정": {
    en: "Sync observation",
    ja: "同期の観測",
  },
  "생산자 / 소비자": {
    en: "Producer / Consumer",
    ja: "生産側 / 消費側",
  },
  "원본 소비 소진": {
    en: "Source consumption drained",
    ja: "移行元の消費排出",
  },
  "Proxy 정지 / 쓰기 진행": {
    en: "Proxy paused / In-flight writes",
    ja: "プロキシ停止 / 処理中書き込み",
  },
  "마지막 정지 (ms)": {
    en: "Last pause (ms)",
    ja: "最終停止（ms）",
  },
  "검증 방식 / 불일치": {
    en: "Verification / Mismatches",
    ja: "検証方式 / 不一致",
  },
  "초기 복사 객체": {
    en: "Initial copy objects",
    ja: "初期コピーオブジェクト",
  },
  "초기 복사 바이트": {
    en: "Initial copy bytes",
    ja: "初期コピーバイト",
  },
  "정방향 / 역방향 backlog": {
    en: "Forward / Reverse backlog",
    ja: "正方向 / 逆方向 backlog",
  },
  "경로 적용 / 기대 앱": {
    en: "Route applied / Expected apps",
    ja: "経路適用 / 想定アプリ",
  },
  "보고 중인 앱": {
    en: "Reporting apps",
    ja: "報告中のアプリ",
  },
  "(재등록 대기)": {
    en: "(awaiting re-registration)",
    ja: "（再登録待ち）",
  },
  "마지막 동기화": {
    en: "Last synced",
    ja: "最終同期",
  },
  "· 누락": {
    en: "· Missing",
    ja: "· 欠落",
  },
  "/ 차이": {
    en: "/ Different",
    ja: "/ 差分",
  },
  "전환·복귀 조건": {
    en: "Cutover and rollback conditions",
    ja: "切替・復帰条件",
  },
  "복귀 방식:": {
    en: "Rollback mode:",
    ja: "復帰方式:",
  },
  "대상 쓰기 가능성:": {
    en: "Target writes possible:",
    ja: "移行先での書き込みの可能性:",
  },
  기록: {
    en: "History",
    ja: "履歴",
  },
  "원 측정:": {
    en: "Observed:",
    ja: "元の観測:",
  },
  "마지막 진전:": {
    en: "Last progress:",
    ja: "最終進捗:",
  },
  "수집:": {
    en: "Collected:",
    ja: "収集:",
  },
  "수집 대기": {
    en: "Awaiting collection",
    ja: "収集待ち",
  },
  "준비 완료": {
    en: "Prepared",
    ja: "準備完了",
  },
  "복제 중": {
    en: "Replicating",
    ja: "複製中",
  },
  "전환 준비됨": {
    en: "Ready for cutover",
    ja: "切替準備完了",
  },
  "쓰기 정지": {
    en: "Writes paused",
    ja: "書き込み停止",
  },
  "경로 전환됨": {
    en: "Route switched",
    ja: "経路切替済み",
  },
  "운영 중": {
    en: "Active",
    ja: "稼働中",
  },
  "원본 복귀": {
    en: "Source restored",
    ja: "移行元に復帰",
  },
  "경로 미확인": {
    en: "Route unknown",
    ja: "経路未確認",
  },
  "사용 중": {
    en: "In use",
    ja: "使用中",
  },
  "읽기 보조": {
    en: "Read fallback",
    ja: "読み取り補助",
  },
  "{0} 읽기 보조": {
    en: "{0} read fallback",
    ja: "{0} 読み取り補助",
  },
  대기: {
    en: "Standby",
    ja: "待機",
  },
  에서: {
    en: "from",
    ja: "から",
  },
  "로 이전하는 구성도": {
    en: "migration topology",
    ja: "への移行構成図",
  },
  "SOURCE · 원본": {
    en: "SOURCE",
    ja: "SOURCE · 移行元",
  },
  "TARGET · 대상": {
    en: "TARGET",
    ja: "TARGET · 移行先",
  },
  "비율 미확인": {
    en: "Ratio unknown",
    ja: "比率未確認",
  },
  사용자: {
    en: "User",
    ja: "ユーザー",
  },
  "공용 서비스": {
    en: "Public service",
    ja: "公開サービス",
  },
  "요청 가중치 · 확인 전": {
    en: "Requested weights · unverified",
    ja: "要求した重み · 未確認",
  },
  "트래픽 관측 대기": {
    en: "Awaiting traffic observation",
    ja: "トラフィック観測待ち",
  },
  "업무 지시 ·": {
    en: "Workload ·",
    ja: "業務指示 ·",
  },
  프로세스: {
    en: "Processes",
    ja: "プロセス",
  },
  "현재 사용": {
    en: "In use",
    ja: "現在使用中",
  },
  "현재 전환 대상": {
    en: "Current cutover target",
    ja: "現在の切替対象",
  },
  "점선: 제어 · 움직이는 파란 선: 관측된 복제 방향": {
    en: "Dashed: control · Moving blue: observed replication",
    ja: "破線: 制御 · 動く青線: 観測された複製方向",
  },
  "현재 단계:": {
    en: "Current stage:",
    ja: "現在の段階:",
  },
  ". 업무 지시:": {
    en: ". Workload:",
    ja: "。業務指示:",
  },
  마이그레이션: {
    en: "Migrations",
    ja: "マイグレーション",
  },
  "최근에 만든 순서입니다. 한 번에 하나만 진행할 수 있습니다.": {
    en: "Newest first. Only one migration can run at a time.",
    ja: "新しい順です。同時に実行できる移行は1件です。",
  },
  "새 마이그레이션은 애플리케이션에서": {
    en: "Create migrations from Applications",
    ja: "新しい移行はアプリから作成",
  },
  "목록을 불러오는 중입니다.": {
    en: "Loading list…",
    ja: "一覧を取得中です。",
  },
  "목록을 불러오지 못했습니다": {
    en: "Could not load list",
    ja: "一覧を取得できませんでした",
  },
  "아직 마이그레이션이 없습니다.": {
    en: "No migrations yet.",
    ja: "移行計画はありません。",
  },
  "{0}단계 중 {1}단계 완료": {
    en: "{1} of {0} stages completed",
    ja: "{0}段階中{1}段階完了",
  },
  설정: {
    en: "Settings",
    ja: "設定",
  },
  "계정과 workspace": {
    en: "Account and workspace",
    ja: "アカウントとワークスペース",
  },
  "GitHub 연결": {
    en: "GitHub connection",
    ja: "GitHub 接続",
  },
  연결됨: {
    en: "Connected",
    ja: "接続済み",
  },
  "로컬 개발 계정": {
    en: "Local development account",
    ja: "ローカル開発アカウント",
  },
  화면: {
    en: "Appearance",
    ja: "外観",
  },
  "이 브라우저에만 저장됩니다.": {
    en: "Saved in this browser only.",
    ja: "このブラウザーにのみ保存されます。",
  },
  다크: {
    en: "Dark",
    ja: "ダーク",
  },
  라이트: {
    en: "Light",
    ja: "ライト",
  },
  "확인 중": {
    en: "Checking…",
    ja: "確認中",
  },
  "플랫폼 API 연결": {
    en: "Platform API connection",
    ja: "プラットフォーム API 接続",
  },
  "로 실제 요청을 보냅니다.": {
    en: "receives a real request.",
    ja: "に実際のリクエストを送信します。",
  },
  "연결 확인 중": {
    en: "Checking connection…",
    ja: "接続を確認中",
  },
  "API 연결 확인": {
    en: "Check API connection",
    ja: "API 接続を確認",
  },
  로그아웃: {
    en: "Sign out",
    ja: "ログアウト",
  },
  "사이드바 전환": {
    en: "Toggle sidebar",
    ja: "サイドバーを切替",
  },
  "현재 위치": {
    en: "Current location",
    ja: "現在の位置",
  },
  "라이트 모드로 전환": {
    en: "Switch to light mode",
    ja: "ライトモードに切替",
  },
  "다크 모드로 전환": {
    en: "Switch to dark mode",
    ja: "ダークモードに切替",
  },
  등록됨: {
    en: "Registered",
    ja: "登録済み",
  },
  "이전 준비됨": {
    en: "Ready to migrate",
    ja: "移行準備完了",
  },
  해제됨: {
    en: "Unregistered",
    ja: "登録解除済み",
  },
  언어: {
    en: "Language",
    ja: "言語",
  },
  "로그인이 필요합니다.": {
    en: "Sign-in required.",
    ja: "ログインが必要です。",
  },
  "접근 권한이 없습니다.": {
    en: "Access denied.",
    ja: "アクセス権限がありません。",
  },
  "입력값과 허용된 설정을 확인하세요.": {
    en: "Check the input and allowed settings.",
    ja: "入力内容と許可された設定を確認してください。",
  },
  "등록 정보가 없습니다.": {
    en: "Registration not found.",
    ja: "登録情報がありません。",
  },
  "백엔드 응답 형식이 API 계약과 다릅니다.": {
    en: "The backend response does not match the API contract.",
    ja: "バックエンドの応答形式が API 契約と一致しません。",
  },
  "연결된 컨트롤 플레인이 이 기능을 제공하지 않습니다.": {
    en: "The connected control plane does not support this feature.",
    ja: "接続先はこの機能を提供していません。",
  },
  "백엔드에 연결하지 못했습니다. 서버 주소와 실행 상태를 확인하십시오.": {
    en: "Could not connect to the backend. Check the server URL and status.",
    ja: "バックエンドに接続できません。アドレスと稼働状態を確認してください。",
  },
  "요청을 처리하지 못했습니다. 다시 확인하십시오.": {
    en: "Could not process the request. Please retry.",
    ja: "リクエストを処理できませんでした。確認して再試行してください。",
  },
  "이미지 digest를 입력하세요.": {
    en: "Enter an image digest.",
    ja: "イメージの digest を入力してください。",
  },
  "{0}에서 {1}로 이전하는 구성도": {
    en: "Migration topology: {0} → {1}",
    ja: "{0} から {1} への移行構成図",
  },
  "{0} 애플리케이션": {
    en: "{0} application",
    ja: "{0} アプリケーション",
  },
  "플랫폼 API 연결 실패": {
    en: "Platform API connection failed",
    ja: "プラットフォーム API 接続失敗",
  },
  "연결된 서버에 플랫폼 로그인 API가 없습니다. API 주소를 확인하십시오.": {
    en: "The connected server does not provide the platform sign-in API. Check the API address.",
    ja: "接続先にプラットフォームのログイン API がありません。API のアドレスを確認してください。",
  },
  "마이그레이션을 찾을 수 없습니다": {
    en: "Migration not found",
    ja: "移行計画が見つかりません",
  },
  "이 작업이 삭제되었거나 다른 플랫폼 서버에 연결되어 있습니다.": {
    en: "This operation was removed, or you are connected to a different platform server.",
    ja: "この操作は削除されたか、別のプラットフォームサーバーに接続しています。",
  },
  "관측 대기": {
    en: "Awaiting observation",
    ja: "観測待ち",
  },
  "관측 갱신 대기": {
    en: "Awaiting fresh observation",
    ja: "最新の観測待ち",
  },
  "데이터 복제 중": {
    en: "Replicating data",
    ja: "データ複製中",
  },
  "복제 작업 완료": {
    en: "Replication completed",
    ja: "複製完了",
  },
  "동기화 대기": {
    en: "Awaiting sync",
    ja: "同期待ち",
  },
  "상세 결과 미제공": {
    en: "Detailed result not provided",
    ja: "詳細結果の提供なし",
  },
  "앱 연결과 이전 리소스를 준비합니다. 보고된 작업부터 준비 상태가 바뀝니다.": {
    en: "Preparing app connectivity and migration resources. Status follows reported results.",
    ja: "アプリの接続と移行リソースを準備します。報告された結果に応じて状態が変わります。",
  },
  "서비스는 원본 데이터를 사용하면서 대상에 데이터를 복제합니다.": {
    en: "The service uses source data while copying it to the target.",
    ja: "サービスは移行元を使用しながら移行先にデータを複製します。",
  },
  "객체 접근 경로를 전환하고 양쪽 앱의 업무를 확인합니다.": {
    en: "Switching object routes and checking business operations in both environments.",
    ja: "オブジェクトの経路を切り替え、両環境の業務を確認します。",
  },
  "일부 요청을 대상 앱으로 보냅니다. DB와 Redis는 아직 원본을 사용합니다.": {
    en: "Some requests reach the target app. Database and Redis still use the source.",
    ja: "一部のリクエストを移行先アプリへ送ります。DB と Redis は移行元を使用します。",
  },
  "Redis 경로를 전환합니다. 검증 후 DB 전환까지 이어집니다.": {
    en: "Switching Redis routes. Database cutover follows verification.",
    ja: "Redis の経路を切り替えます。検証後に DB の切替へ進みます。",
  },
  "앱 업무를 정지하고 DB 경로를 바꾼 뒤 업무를 재개합니다.": {
    en: "Holding app work, switching database routes, then resuming work.",
    ja: "アプリ業務を停止し、DB の経路を切り替えてから業務を再開します。",
  },
  "데이터 경로 전환 후 대상 앱의 트래픽 비율을 단계적으로 늘립니다.": {
    en: "Increasing target app traffic step by step after switching data routes.",
    ja: "データ経路の切替後、移行先アプリへの配信比率を段階的に増やします。",
  },
  "최종 검증 후 이전용 임시 구성을 정리하고 복귀 경로를 닫습니다.": {
    en: "After final verification, remove temporary migration configuration and close rollback paths.",
    ja: "最終検証後、移行用の一時構成を整理し、復帰経路を閉じます。",
  },
  "엔진 정지 · 외부 작업은 계속될 수 있습니다.": {
    en: "Engine halted · External operations may continue.",
    ja: "エンジン停止 · 外部の処理は続く場合があります。",
  },
  "승인 대기 · 확인 후 다음 작업을 시작합니다.": {
    en: "Awaiting approval · Review before continuing.",
    ja: "承認待ち · 確認後に次の処理を開始します。",
  },
  "작업이 종료되었습니다. 마지막 관측 상태입니다.": {
    en: "Operation ended. Showing the last observed state.",
    ja: "処理は終了しました。最後に観測した状態です。",
  },
  "앱 업무 정지 중": {
    en: "App work is held",
    ja: "アプリ業務停止中",
  },
  "LB 확인 비율": {
    en: "Confirmed LB split",
    ja: "LB 確認済み比率",
  },
  "전환 요청 · LB 확인 대기": {
    en: "Change requested · Awaiting LB confirmation",
    ja: "切替要求済み · LB 確認待ち",
  },
  "트래픽 비율 미확인": {
    en: "Traffic split unknown",
    ja: "配信比率未確認",
  },
  "트래픽 분배: {0} {1}, {2} {3}": {
    en: "Traffic split: {0} {1}, {2} {3}",
    ja: "配信比率: {0} {1}、{2} {3}",
  },
  "다음 요청: {0} {1}% · {2} {3}%": {
    en: "Requested next: {0} {1}% · {2} {3}%",
    ja: "次の要求: {0} {1}% · {2} {3}%",
  },
  "인프라 작업": {
    en: "Infrastructure operation",
    ja: "インフラ処理",
  },
  "앱 배포 작업": {
    en: "App deployment",
    ja: "アプリのデプロイ",
  },
  "이전 리소스 준비": {
    en: "Migration resource preparation",
    ja: "移行リソースの準備",
  },
  "{0}/{1} 리소스 확인": {
    en: "{0}/{1} resources confirmed",
    ja: "{0}/{1} リソース確認",
  },
  "객체 라우팅": {
    en: "Object routing",
    ja: "オブジェクト経路",
  },
  객체: {
    en: "objects",
    ja: "オブジェクト",
  },
  "진행량 미보고": {
    en: "Progress not reported",
    ja: "進捗量未報告",
  },
  "처리 {0}건 · 전체 수량 미보고": {
    en: "{0} processed · Total not reported",
    ja: "{0} 件処理 · 総数未報告",
  },
  "역방향 복제": {
    en: "Reverse replication",
    ja: "逆方向複製",
  },
  "흐름은 확인된 설정의 시각화이며 실제 요청 수가 아닙니다.": {
    en: "Flow illustrates confirmed configuration, not actual request counts.",
    ja: "流れは確認済み設定の模式表示で、実際のリクエスト数ではありません。",
  },
  "{0}/{1} 프로세스": {
    en: "{0}/{1} processes",
    ja: "{0}/{1} プロセス",
  },
  "저장소 사이의 파란 선: 데이터 복제 · 점선: 제어": {
    en: "Blue storage links: data replication · Dashed: control",
    ja: "ストレージ間の青線: データ複製 · 破線: 制御",
  },
  "리소스 오류": {
    en: "Resource error",
    ja: "リソースエラー",
  },
  "관측 갱신 실패 · 마지막 상태 표시": {
    en: "Observation refresh failed · Showing the last state",
    ja: "観測の更新失敗 · 最後の状態を表示",
  },
  "양방향 복제": {
    en: "Bidirectional replication",
    ja: "双方向複製",
  },
  "객체 라우터": {
    en: "Object router",
    ja: "オブジェクトルーター",
  },
  "데이터 복제": {
    en: "Data replication",
    ja: "データ複製",
  },
  "전환 조건 확인": {
    en: "Check prerequisites",
    ja: "切替条件の確認",
  },
  "앱 업무 정지": {
    en: "Hold workload",
    ja: "アプリ処理を停止",
  },
  "쓰기 정지 확인": {
    en: "Quiesce writes",
    ja: "書き込み停止の確認",
  },
  "경로 전환": {
    en: "Switch route",
    ja: "経路切替",
  },
  "쓰기 재개": {
    en: "Resume writes",
    ja: "書き込み再開",
  },
  "앱 업무 재개": {
    en: "Release workload",
    ja: "アプリ処理を再開",
  },
  "전환 후 검증": {
    en: "Verify transition",
    ja: "切替後の検証",
  },
  "단계 보고 대기": {
    en: "Awaiting stage report",
    ja: "段階の報告待ち",
  },
  "쓰기 일시 정지": {
    en: "Writes paused",
    ja: "書き込み一時停止",
  },
  "요청 → {0}": {
    en: "Requests → {0}",
    ja: "リクエスト → {0}",
  },
  "목적지 미확인": {
    en: "Destination unknown",
    ja: "接続先未確認",
  },
  "앱의 Redis 요청을 라우팅합니다.": {
    en: "Routes the application's Redis requests.",
    ja: "アプリのRedisリクエストをルーティングします。",
  },
  "쓰기 허용": {
    en: "Writes enabled",
    ja: "書き込み許可",
  },
  "처리 중인 쓰기 {0}건": {
    en: "{0} writes in flight",
    ja: "処理中の書き込み {0}件",
  },
  "저장소 간 변경 데이터를 복제합니다.": {
    en: "Replicates changed data between stores.",
    ja: "ストレージ間で変更データを複製します。",
  },
  "객체 요청 라우팅": {
    en: "Object request routing",
    ja: "オブジェクト要求の経路制御",
  },
  "앱 요청 전달": {
    en: "Route app requests",
    ja: "アプリ要求を転送",
  },
  "변경 데이터 복제": {
    en: "Replicate changes",
    ja: "変更データを複製",
  },
  "복제 실행 미확인": {
    en: "Replication activity unconfirmed",
    ja: "複製の実行は未確認",
  },
  "초기 복사": {
    en: "Initial copy",
    ja: "初期コピー",
  },
  "CDC 변경분": {
    en: "CDC changes",
    ja: "CDC変更分",
  },
  "키 변경 알림": {
    en: "Key notifications",
    ja: "キー変更通知",
  },
  "객체 변경분": {
    en: "Object changes",
    ja: "オブジェクト変更分",
  },
  "{0} 복귀": {
    en: "Restore {0}",
    ja: "{0}を復帰",
  },
  "원본 복귀 중": {
    en: "Restoring source",
    ja: "移行元に復帰中",
  },
  "구독 중": {
    en: "Subscribed",
    ja: "購読中",
  },
  "변경 로그 전송": {
    en: "Sending change log",
    ja: "変更ログ転送",
  },
  "대기 {0}건": {
    en: "{0} pending",
    ja: "待機 {0}件",
  },
  "초기 데이터 복사": {
    en: "Initial data copy",
    ja: "初期データコピー",
  },
  "변경 키 읽기·반영": {
    en: "Read and apply changed keys",
    ja: "変更キーを取得・反映",
  },
  "변경 로그 적용": {
    en: "Apply change log",
    ja: "変更ログを適用",
  },
  "키 알림 발행": {
    en: "Publish key notifications",
    ja: "キー通知を発行",
  },
  "CDC 변경분 전송": {
    en: "Send CDC changes",
    ja: "CDC変更分を転送",
  },
  "변경분 전송": {
    en: "Send changes",
    ja: "変更分を転送",
  },
  "변경분 반영": {
    en: "Apply changes",
    ja: "変更分を反映",
  },

  "3건 통과": { en: "3 passed", ja: "3件通過" },
  "AWS → 온프레미스": { en: "AWS → On-premises", ja: "AWS → オンプレミス" },
  "Ansible 설정 예시 · 실행 가능한 전체 ACL은 아닙니다.": {
    en: "Ansible example · Not a complete executable ACL.",
    ja: "Ansible設定例 · 実行用の完全なACLではありません。",
  },
  "DB 포트 외부 공개 없음": { en: "DB port is not published", ja: "DBポートの外部公開なし" },
  "HTTPS 연결 필수": { en: "HTTPS required", ja: "HTTPS接続必須" },
  "Redis 권한 변경안": { en: "Redis permission changes", ja: "Redis権限の変更案" },
  "Redis 권한 변경안 작성": {
    en: "Redis permission changes drafted",
    ja: "Redis権限の変更案を作成",
  },
  "Redis 설정 적용 요청": {
    en: "Redis configuration apply requested",
    ja: "Redis設定の適用を要求",
  },
  "Redis 접근 권한을 줄여야 합니다": {
    en: "Redis permissions need narrowing",
    ja: "Redisのアクセス権限を制限してください",
  },
  "Redis 포트 외부 공개 없음": {
    en: "Redis port is not published",
    ja: "Redisポートの外部公開なし",
  },
  "Secrets Manager 참조": { en: "Secrets Manager reference", ja: "Secrets Manager参照" },
  "TLS 연결 필수": { en: "TLS required", ja: "TLS接続必須" },
  "demo 사용자가 전환 승인": { en: "demo approved the cutover", ja: "demoが切り替えを承認" },
  "orders 스키마 CRUD 권한": {
    en: "CRUD access to the orders schema",
    ja: "ordersスキーマのCRUD権限",
  },
  "receipts/* 경로로 제한": { en: "Restricted to receipts/*", ja: "receipts/*に制限" },
  "session:* 키로 제한": { en: "Restricted to session:* keys", ja: "session:*キーに制限" },
  "session:* 키와 지정 명령만 허용": {
    en: "Only session:* keys and listed commands",
    ja: "session:*キーと指定コマンドのみ許可",
  },
  "검사 {0}/{1}건 통과": { en: "{0}/{1} checks passed", ja: "検査{0}/{1}件通過" },
  "검사 근거": { en: "Check evidence", ja: "検査の根拠" },
  "검사 근거 보기": { en: "View check evidence", ja: "検査の根拠を表示" },
  "검사 범위: 선택한 보안 조건 3개": {
    en: "Scope: 3 selected security conditions",
    ja: "検査範囲：選択したセキュリティ条件3件",
  },
  "검증 완료": { en: "Verified", ja: "検証完了" },
  "검토 기록": { en: "Review history", ja: "確認履歴" },
  "공개 접근": { en: "Public access", ja: "公開アクセス" },
  "관리자 권한 없이 실행": {
    en: "Run without administrator privileges",
    ja: "管理者権限なしで実行",
  },
  "권한 변경 전후": { en: "Permissions before and after", ja: "権限の変更前後" },
  "대상 환경에서 앱 계정이 모든 키와 명령에 접근할 수 있습니다.": {
    en: "The app account can access all keys and commands in the target environment.",
    ja: "移行先ではアプリのアカウントが全キーと全コマンドにアクセスできます。",
  },
  "데이터 서비스": { en: "Data services", ja: "データサービス" },
  "리소스 4개": { en: "4 resources", ja: "リソース4個" },
  "리소스별 보안 검사": { en: "Security checks by resource", ja: "リソース別セキュリティ検査" },
  "모든 키와 명령에 접근 가능": {
    en: "All keys and commands allowed",
    ja: "全キーと全コマンドを許可",
  },
  "미확인 {0}건": { en: "{0} unchecked", ja: "未確認{0}件" },
  "변경 전": { en: "Before", ja: "変更前" },
  "변경 후": { en: "After", ja: "変更後" },
  변경안: { en: "Changes", ja: "変更案" },
  "변경안 준비": { en: "Changes drafted", ja: "変更案を作成済み" },
  "변경안 취소": { en: "Changes cancelled", ja: "変更案を取り消し" },
  "변경안 확인": { en: "Review changes", ja: "変更案を確認" },
  "변경안을 검토한 뒤 적용하고 보안 검사를 다시 실행하세요.": {
    en: "Review and apply the changes, then run the checks again.",
    ja: "変更案を確認して適用し、セキュリティ検査を再実行してください。",
  },
  "변경한 권한을 다시 확인하고 있습니다": {
    en: "Checking the updated permissions",
    ja: "変更後の権限を確認しています",
  },
  "보안 검사 12건을 통과했습니다": {
    en: "All 12 security checks passed",
    ja: "セキュリティ検査12件を通過しました",
  },
  "보안 검토 단계": { en: "Security review steps", ja: "セキュリティ確認手順" },
  "보안 그룹: 앱만 허용": {
    en: "Security group: app only",
    ja: "セキュリティグループ：アプリのみ許可",
  },
  "보안 그룹: 프록시만 허용": {
    en: "Security group: proxy only",
    ja: "セキュリティグループ：プロキシのみ許可",
  },
  보안·거버넌스: { en: "Security & governance", ja: "セキュリティ・ガバナンス" },
  "보완 {0}건": { en: "{0} to fix", ja: "要修正{0}件" },
  "보완 필요": { en: "Needs changes", ja: "要修正" },
  "비관리자 사용자로 실행": { en: "Runs as a non-root user", ja: "非管理者ユーザーで実行" },
  "세션 Redis": { en: "Session Redis", ja: "セッションRedis" },
  "세션 키와 지정 명령만 허용하도록 변경합니다": {
    en: "Limit access to session keys and listed commands",
    ja: "セッションキーと指定コマンドのみに制限します",
  },
  승인: { en: "Approval", ja: "承認" },
  "승인 기록을 남겼습니다. 실제 트래픽 전환은 실행하지 않았습니다.": {
    en: "Approval recorded. No actual traffic was switched.",
    ja: "承認を記録しました。実際のトラフィックは切り替えていません。",
  },
  "시연 기록": { en: "Demo history", ja: "デモ履歴" },
  "실제 검사 결과와 수집 시각은 API 연결 후 표시합니다.": {
    en: "Actual results and collection times will appear after API integration.",
    ja: "実際の検査結果と取得時刻はAPI接続後に表示します。",
  },
  "실행 계정": { en: "Runtime identity", ja: "実行アカウント" },
  "실행 환경": { en: "Application runtime", ja: "実行環境" },
  "아직 조사하지 않았습니다": { en: "No scan yet", ja: "未調査です" },
  "암호화된 연결만 허용": { en: "Require encrypted connections", ja: "暗号化された接続のみ許可" },
  "앱 계정": { en: "App account", ja: "アプリアカウント" },
  "앱 계정은 세션 키만 사용": {
    en: "App account can only use session keys",
    ja: "アプリはセッションキーのみ使用",
  },
  "앱 계정은 영수증 경로만 사용": {
    en: "App account can only use receipt paths",
    ja: "アプリは領収書パスのみ使用",
  },
  "앱 계정은 주문 데이터만 사용": {
    en: "App account can only use order data",
    ja: "アプリは注文データのみ使用",
  },
  "앱 네트워크에서만 DB에 접속": {
    en: "DB access from the app network only",
    ja: "アプリのネットワークからのみDBに接続",
  },
  "앱 네트워크에서만 Redis에 접속": {
    en: "Redis access from the app network only",
    ja: "アプリのネットワークからのみRedisに接続",
  },
  "앱 서버": { en: "App server", ja: "アプリサーバー" },
  "앱 포트 외부 공개 없음": { en: "App port is not published", ja: "アプリポートの外部公開なし" },
  "앱, DB, Redis, 오브젝트 스토리지의 접근 범위와 연결 설정을 확인합니다.": {
    en: "Check access scope and connections for the app, DB, Redis and object storage.",
    ja: "アプリ、DB、Redis、オブジェクトストレージのアクセス範囲と接続設定を確認します。",
  },
  "연결선: 앱이 사용하는 계정": {
    en: "Connections show the app's accounts",
    ja: "接続線：アプリが使用するアカウント",
  },
  "영수증 저장소": { en: "Receipt storage", ja: "領収書ストレージ" },
  "예시 검사 결과를 불러오는 중입니다.": {
    en: "Loading example check results.",
    ja: "検査結果の例を読み込んでいます。",
  },
  "예시 데이터": { en: "Example data", ja: "サンプルデータ" },
  "예시 데이터의 검사 항목과 수집 위치입니다.": {
    en: "Example checks and their collection sources.",
    ja: "サンプルの検査項目と取得元です。",
  },
  "예시 설정 적용과 재검증을 진행하는 중입니다.": {
    en: "Simulating configuration apply and verification.",
    ja: "設定適用と再検証のデモを実行しています。",
  },
  "이 예시의 보안 검토를 마쳤습니다": {
    en: "Security review completed for this example",
    ja: "このサンプルのセキュリティ確認が完了しました",
  },
  "이 화면은 선택한 12개 조건만 확인합니다. 전체 보안 인증이나 규정 준수 판정은 포함하지 않습니다.":
    {
      en: "This view checks 12 selected conditions. It does not certify overall security or regulatory compliance.",
      ja: "この画面では選択した12条件のみを確認します。セキュリティ全体の認証や規制への適合判定は含みません。",
    },
  "이번에 검사한 범위에서 보완할 항목이 없습니다. 전환을 승인할 수 있습니다.": {
    en: "No changes needed within the checked scope. Cutover can be approved.",
    ja: "今回の検査範囲に要修正項目はありません。切り替えを承認できます。",
  },
  "이전할 환경의 보안 설정을 비교하세요": {
    en: "Compare security settings before migration",
    ja: "移行先のセキュリティ設定を比較してください",
  },
  "익명 사용자의 접근 차단": { en: "Block anonymous access", ja: "匿名アクセスを拒否" },
  "익명 접근 차단": { en: "Anonymous access blocked", ja: "匿名アクセスを拒否" },
  "인증 정보": { en: "Credentials", ja: "認証情報" },
  "인증 정보는 유지하고 키와 명령 범위만 줄입니다.": {
    en: "Keep credentials unchanged; narrow keys and commands only.",
    ja: "認証情報を維持し、キーとコマンドの範囲のみを制限します。",
  },
  "인증 정보를 이미지와 분리": {
    en: "Keep credentials outside the image",
    ja: "認証情報をイメージから分離",
  },
  "읽기 전용 시크릿 파일 연결": {
    en: "Read-only secret file mounted",
    ja: "読み取り専用のシークレットファイルを接続",
  },
  재검증: { en: "Verification", ja: "再検証" },
  "재검증 완료 · 보안 검사 12건 통과": {
    en: "Verification complete · 12 security checks passed",
    ja: "再検証完了 · セキュリティ検査12件通過",
  },
  "재검증 중": { en: "Verifying", ja: "再検証中" },
  "재검증 중…": { en: "Verifying…", ja: "再検証中…" },
  "적용 후 재검증": { en: "Apply and verify", ja: "適用して再検証" },
  "전송 암호화": { en: "Encryption in transit", ja: "転送時の暗号化" },
  "전용 서비스 계정": { en: "Dedicated service account", ja: "専用サービスアカウント" },
  "전체 기록 보기": { en: "Show all events", ja: "すべての記録を表示" },
  "전환 승인": { en: "Approve cutover", ja: "切り替えを承認" },
  "전환 승인됨": { en: "Cutover approved", ja: "切り替え承認済み" },
  "접근 경로": { en: "Network access", ja: "接続経路" },
  "접근 권한": { en: "Access permissions", ja: "アクセス権限" },
  접기: { en: "Show less", ja: "折りたたむ" },
  조사: { en: "Scan", ja: "調査" },
  "조사 시작": { en: "Start scan", ja: "調査を開始" },
  "조사 완료 · Redis 권한 보완 1건": {
    en: "Scan complete · 1 Redis permission issue",
    ja: "調査完了 · Redis権限の要修正1件",
  },
  "조사 전": { en: "Not scanned", ja: "調査前" },
  "조사 중": { en: "Scanning", ja: "調査中" },
  "조사 중…": { en: "Scanning…", ja: "調査中…" },
  "조사·설정 적용·승인은 시연용입니다.": {
    en: "Scans, changes and approvals are simulated.",
    ja: "調査・設定適用・承認はデモ動作です。",
  },
  "검토 기록 없음": {
    en: "No review history",
    ja: "確認履歴なし",
  },
  "조사를 시작하면 현재 설정과 이전할 환경을 비교합니다.": {
    en: "Start a scan to compare the current and target settings.",
    ja: "調査を開始すると現在と移行先の設定を比較します。",
  },
  "주문 DB": { en: "Orders DB", ja: "注文DB" },
  처음으로: { en: "Reset demo", ja: "デモをリセット" },
  취소: { en: "Cancel", ja: "キャンセル" },
  통과: { en: "Passed", ja: "通過" },
  "퍼블릭 액세스 차단": { en: "Public access blocked", ja: "パブリックアクセスを拒否" },
  "프록시에서만 앱에 접속": {
    en: "App access from the proxy only",
    ja: "プロキシからのみアプリに接続",
  },
  현재: { en: "Source", ja: "移行元" },
  "현재 환경과 대상 환경을 비교하고 있습니다": {
    en: "Comparing the source and target environments",
    ja: "移行元と移行先の環境を比較しています",
  },
  "현재보다 넓은 접근 권한입니다. 전환 전에 범위를 줄이세요.": {
    en: "Access is broader than in the source. Narrow it before cutover.",
    ja: "移行元よりアクセス範囲が広くなっています。切り替え前に制限してください。",
  },

  "버킷 권한 비교": {
    en: "Bucket permissions",
    ja: "バケット権限の比較",
  },
  "권한 조회 중": {
    en: "Reading permissions",
    ja: "権限を取得中",
  },
  "버킷 권한 차이 발견": {
    en: "Bucket permission differences found",
    ja: "バケット権限の差分を検出",
  },
  "일부 권한 미확인": {
    en: "Some permissions unchecked",
    ja: "一部の権限は未確認",
  },
  "검사 항목 일치": {
    en: "Checked settings match",
    ja: "検査項目が一致",
  },
  "추가 권한 변경안": {
    en: "Extra access change plan",
    ja: "追加権限の変更案",
  },
  "GCP에 적용 중": {
    en: "Applying to GCP",
    ja: "GCPに適用中",
  },
  "적용 완료 · 재검사 필요": {
    en: "Applied · Recheck required",
    ja: "適用済み · 再検査が必要",
  },
  "권한·앱 상태 재검사 중": {
    en: "Rechecking permissions and app readiness",
    ja: "権限とアプリの準備状態を再検査中",
  },
  "재검사 완료": {
    en: "Recheck complete",
    ja: "再検査完了",
  },
  "처리 결과 확인 필요": {
    en: "Operation result needs review",
    ja: "処理結果の確認が必要",
  },
  "GCP에 적용": { en: "Apply to GCP", ja: "GCPに適用" },
  재검사: {
    en: "Recheck",
    ja: "再検査",
  },
  "권한 조회": {
    en: "Read permissions",
    ja: "権限を取得",
  },
  "비교 결과 불러오는 중…": {
    en: "Loading comparison…",
    ja: "比較結果を読み込み中…",
  },
  "클라우드 조회": { en: "Cloud settings", ja: "クラウド設定" },
  "실제 클라우드 변경 없음": {
    en: "No live cloud changes",
    ja: "実際のクラウドへの変更なし",
  },
  "검사 {0}/{1}건 확인": { en: "{0}/{1} checks confirmed", ja: "{0}/{1}件を確認" },
  "설정 차이 {0}건": { en: "{0} setting differences", ja: "設定の差分 {0}件" },
  "앱 응답 미확인": {
    en: "App response unchecked",
    ja: "アプリの応答は未確認",
  },
  "앱 준비 완료": {
    en: "App reports ready",
    ja: "アプリは準備完了",
  },
  "앱 응답 확인 필요": {
    en: "App response needs review",
    ja: "アプリの応答を要確認",
  },
  "처리 중…": { en: "Working…", ja: "処理中…" },
  변경안·적용: { en: "Review & apply", ja: "変更案・適用" },
  재확인: { en: "Verify", ja: "再確認" },
  계속: { en: "Continue", ja: "続行" },
  "권한·앱 상태 재검사 필요": {
    en: "Recheck permissions and app readiness",
    ja: "権限とアプリの準備状態の再検査が必要",
  },
  "검사 범위: AWS 지정 정책 · GCP 버킷 직접 권한": {
    en: "Scope: selected AWS policy · direct GCP bucket grants",
    ja: "検査範囲：指定のAWSポリシー · GCPバケットの直接権限",
  },
  "GCP 앱 계정": { en: "GCP app account", ja: "GCPアプリアカウント" },
  "준비 상태 응답만 확인합니다.": {
    en: "Checks the app readiness response only.",
    ja: "アプリの準備状態の応答のみ確認します。",
  },
  "검사 대상이 아닙니다.": {
    en: "Not included in this check.",
    ja: "検査対象外です。",
  },
  "아직 조회하지 않았습니다.": {
    en: "Not checked yet.",
    ja: "まだ取得していません。",
  },
  "설정 차이": { en: "Difference", ja: "設定の差分" },
  "차이 없음": {
    en: "No differences",
    ja: "差分なし",
  },
  "GCP 권한 변경안": { en: "GCP permission change", ja: "GCP権限の変更案" },
  "이 계정의 추가 버킷 권한만 제거합니다.": {
    en: "Removes only this account’s extra bucket access.",
    ja: "このアカウントの追加バケット権限のみ削除します。",
  },
  "AWS 인라인 정책 · GCP 버킷 IAM": {
    en: "AWS inline policy · GCP bucket IAM",
    ja: "AWSインラインポリシー · GCPバケットIAM",
  },
  "앱 응답": {
    en: "App response",
    ja: "アプリの応答",
  },
  "검사 제외": {
    en: "Not checked",
    ja: "検査対象外",
  },
  "AWS 기준 정책": { en: "AWS reference policy", ja: "AWS基準ポリシー" },
  "버킷 전용 정책 확인": { en: "Bucket-scoped policy confirmed", ja: "バケット専用ポリシーを確認" },
  "지원하지 않는 정책 형태": { en: "Unsupported policy structure", ja: "未対応のポリシー形式" },
  "앱에 필요한 접근 유지": {
    en: "Required app access retained",
    ja: "アプリに必要なアクセスを維持",
  },
  "객체 목록·읽기·쓰기·삭제": {
    en: "List, read, write and delete objects",
    ja: "オブジェクトの一覧・読み取り・書き込み・削除",
  },
  "추가 버킷 접근": { en: "Extra bucket access", ja: "追加バケットへのアクセス" },
  "선택한 정책은 앱 버킷만 허용": {
    en: "Selected policy allows the app bucket only",
    ja: "選択したポリシーはアプリのバケットのみ許可",
  },
  "추가 직접 권한 없음": { en: "No extra direct grant", ja: "追加の直接権限なし" },
  "추가 버킷 권한 변경안 생성": {
    en: "Extra bucket change plan created",
    ja: "追加バケットの変更案を作成",
  },
  "GCP 변경 적용 · 재확인 필요": {
    en: "GCP change applied · Verify settings",
    ja: "GCPに適用済み · 再確認が必要",
  },
  "설정 재확인 완료": { en: "Settings rechecked", ja: "設定の再確認が完了" },
  "AWS·GCP 설정 조사 완료": { en: "AWS and GCP settings collected", ja: "AWS・GCPの設定を取得" },
  "작업 실패 · 설정 재조회 필요": {
    en: "Operation failed · Scan again",
    ja: "操作失敗 · 再調査が必要",
  },
  "작업 결과를 다시 확인해야 합니다.": {
    en: "Check the result by scanning again.",
    ja: "再調査して操作結果を確認してください。",
  },
  "클라우드 조회·적용 결과를 확인하지 못했습니다. 다시 조사하세요.": {
    en: "Could not confirm the cloud operation. Scan again.",
    ja: "クラウド操作の結果を確認できませんでした。再調査してください。",
  },
  "클라우드 설정이 변경되었습니다. 다시 조사하세요.": {
    en: "Cloud settings changed. Scan again.",
    ja: "クラウド設定が変更されました。再調査してください。",
  },
  "보안 비교 대상이 아직 연결되지 않았습니다.": {
    en: "Security review targets are not connected yet.",
    ja: "セキュリティ比較対象は未接続です。",
  },
  "보안 비교 설정을 확인하세요.": {
    en: "Check the security review configuration.",
    ja: "セキュリティ比較の設定を確認してください。",
  },
  비교: { en: "Compare", ja: "比較" },
  유지: { en: "Keep", ja: "維持" },
  제거: { en: "Remove", ja: "削除" },
  "변경안 보기": { en: "View change plan", ja: "変更案を見る" },
  "검사 제외: 상속 권한 · 다른 정책 · 객체 ACL": {
    en: "Excluded: inherited permissions · other policies · object ACLs",
    ja: "対象外：継承された権限 · 他のポリシー · オブジェクトACL",
  },
  "일치 {0}/{1}건": {
    en: "{0}/{1} checks match",
    ja: "{0}/{1}件が一致",
  },
  "AWS 기준": { en: "AWS reference", ja: "AWS基準" },
  "조회 결과": { en: "Observed", ja: "取得結果" },
  "오브젝트 스토리지": { en: "Object storage", ja: "オブジェクトストレージ" },
  확인: { en: "Confirmed", ja: "確認済み" },
  기준: { en: "Source", ja: "基準" },
  결과: { en: "Result", ja: "結果" },

  "AI 도우미": { en: "AI assistant", ja: "AIアシスタント" },
  "AI API 또는 선택한 배포 정보가 없습니다. 서버 반영 상태와 배포 목록을 확인하세요.": {
    en: "The AI API or selected deployment is unavailable. Check the server version and deployment list.",
    ja: "AI APIまたは選択したデプロイがありません。サーバーの反映状況とデプロイ一覧を確認してください。",
  },
  "AI 모델 설정 필요": { en: "AI model setup required", ja: "AIモデルの設定が必要です" },
  "AI 설정을 확인하는 중입니다.": { en: "Checking AI configuration…", ja: "AI設定を確認中…" },
  "AI 요청 실패": { en: "AI request failed", ja: "AIリクエストに失敗しました" },
  "AI 정보를 불러오지 못했습니다": {
    en: "Could not load AI information",
    ja: "AI情報を取得できませんでした",
  },
  "CPU 사용률 P95": { en: "CPU utilization P95", ja: "CPU使用率 P95" },
  "CPU·메모리와 요청 성능을 조회하고 근거와 함께 해석합니다.": {
    en: "Read CPU, memory and request performance, with evidence-based interpretation.",
    ja: "CPU・メモリ・リクエスト性能を取得し、根拠とともに分析します。",
  },
  "CPU는 분 단위 집계의 P95이며, 메모리는 관측한 최대값입니다.": {
    en: "CPU is P95 of minute aggregates. Memory is the observed high-water value.",
    ja: "CPUは分単位の集計値のP95、メモリは観測した最大値です。",
  },
  "DB 호출 P95": { en: "DB call P95", ja: "DB呼び出し P95" },
  "Redis 호출 P95": { en: "Redis call P95", ja: "Redis呼び出し P95" },
  "관련 요청 추적 {0}개": {
    en: "{0} related request traces",
    ja: "関連リクエストのトレース {0}件",
  },
  "관측 메모리 최대값": { en: "Observed memory peak", ja: "観測メモリ最大値" },
  "관측 자료 부족": { en: "Insufficient observations", ja: "観測データ不足" },
  근거: { en: "Evidence", ja: "根拠" },
  "내 앱의 배포 정보와 사용량을 확인합니다.": {
    en: "Review deployment details and usage for your applications.",
    ja: "自分のアプリのデプロイ情報と使用量を確認します。",
  },
  "누락 지표: {0}": { en: "Missing metrics: {0}", ja: "不足している指標：{0}" },
  "답변 근거 {0}개": { en: "{0} answer sources", ja: "回答の根拠 {0}件" },
  "대화 기록": { en: "Conversation history", ja: "会話履歴" },
  "대화 다시 조회": { en: "Reload conversation", ja: "会話を再取得" },
  "마지막 배포 적용 기록을 근거로 답합니다. 실시간 상태와 다를 수 있습니다.": {
    en: "Answers use the last applied deployment record. Live state may differ.",
    ja: "最終適用時のデプロイ記録に基づいて回答します。現在の状態とは異なる場合があります。",
  },
  "배포 목록을 불러오는 중입니다.": { en: "Loading deployments…", ja: "デプロイ一覧を取得中…" },
  "배포 변경이 진행 중이거나 결과가 불명확하여 분석과 추천을 중지했습니다.": {
    en: "Analysis and recommendations are blocked while deployment changes are unsettled.",
    ja: "デプロイの変更中、または結果が不明なため、分析と推奨を停止しています。",
  },
  "배포 상태 확인 필요": { en: "Confirm deployment state", ja: "デプロイ状態の確認が必要です" },
  "배포 요청 보기": { en: "View deployment request", ja: "デプロイリクエストを表示" },
  "복사하지 못했습니다.": { en: "Could not copy.", ja: "コピーできませんでした。" },
  "본인 앱의 배포 적용이 완료된 뒤 이 목록에서 선택할 수 있습니다.": {
    en: "Your application appears here after a deployment has been applied successfully.",
    ja: "自分のアプリのデプロイ適用が完了すると、この一覧で選択できます。",
  },
  "분석 기간": { en: "Analysis period", ja: "分析期間" },
  "분석할 기간을 선택하고 지표 분석을 실행하세요.": {
    en: "Choose a period and run metric analysis.",
    ja: "期間を選択して指標分析を実行してください。",
  },
  "분석할 앱 배포": { en: "Application deployment to analyse", ja: "分析対象のアプリデプロイ" },
  "분석할 앱 배포가 없습니다.": {
    en: "No application deployments to analyse.",
    ja: "分析できるアプリデプロイがありません。",
  },
  "사양 추천": { en: "Sizing recommendations", ja: "リソース構成の推奨" },
  "새 대화": { en: "New conversation", ja: "新しい会話" },
  "서버 오류율": { en: "Server error rate", ja: "サーバーエラー率" },
  "서버에 AI 모델 인증 정보가 설정되지 않았습니다. 관리자에게 설정을 요청하세요.": {
    en: "AI credentials are not configured on the server. Ask an administrator to configure them.",
    ja: "サーバーにAIモデルの認証情報が設定されていません。管理者に設定を依頼してください。",
  },
  "선택한 앱의 사양과 리소스 구성을 물어보세요.": {
    en: "Ask about the selected application’s sizing and resources.",
    ja: "選択したアプリのリソース構成について質問してください。",
  },
  "온프렘 사용량 기반 사양 추천은 아직 지원하지 않습니다.": {
    en: "Usage-based sizing for on-premises deployments is not supported yet.",
    ja: "オンプレミスの使用量に基づくリソース推奨は、まだ対応していません。",
  },
  "요청 복사": { en: "Copy request", ja: "リクエストをコピー" },
  "운영 지표 분석": { en: "Operational metric analysis", ja: "運用指標の分析" },
  "응답 시간 P95": { en: "Response time P95", ja: "応答時間 P95" },
  "응답 완료": { en: "Response ready", ja: "応答完了" },
  "인프라 변경안": { en: "Infrastructure changes", ja: "インフラ変更案" },
  "인프라 채팅": { en: "Infrastructure chat", ja: "インフラチャット" },
  "일부 지표 누락": { en: "Some metrics missing", ja: "一部の指標が不足" },
  "자료 없음": { en: "No data", ja: "データなし" },
  "적용 시각 없음": { en: "Apply time unavailable", ja: "適用時刻なし" },
  "지표 종류 확보율 {0}%": { en: "{0}% of metric types available", ja: "指標種類の取得率 {0}%" },
  질문: { en: "Question", ja: "質問" },
  "초당 요청 수": { en: "Requests per second", ja: "秒あたりリクエスト数" },
  "최근 15분": { en: "Last 15 minutes", ja: "直近15分" },
  "최근 1시간": { en: "Last hour", ja: "直近1時間" },
  "최근 1시간의 CPU·메모리 사용량으로 대상 사양을 추천합니다.": {
    en: "Recommend target sizing from CPU and memory usage over the last hour.",
    ja: "直近1時間のCPU・メモリ使用量から、移行先のリソース構成を推奨します。",
  },
  "최근 24시간": { en: "Last 24 hours", ja: "直近24時間" },
  "최근 대화 10개를 참고합니다.": {
    en: "Uses the last 10 conversation turns.",
    ja: "直近10件の会話を参照します。",
  },
  "추천 결과를 확인한 뒤 별도로 배포할 수 있습니다.": {
    en: "Review recommendations before deploying separately.",
    ja: "推奨結果を確認してから、別途デプロイできます。",
  },
  "추천 대상 클라우드": { en: "Target cloud for sizing", ja: "推奨対象のクラウド" },
  "추천만 생성했습니다. 실제 배포는 실행하지 않았습니다.": {
    en: "Only a recommendation was generated. No deployment was executed.",
    ja: "推奨のみを生成しました。デプロイは実行していません。",
  },
  코어: { en: "cores", ja: "コア" },
  "플랫폼 관리 서비스는 조회 대상에서 제외됩니다.": {
    en: "Shared platform management services are excluded.",
    ja: "プラットフォームの管理サービスは対象外です。",
  },
  "허용 사양 초과": { en: "Exceeds allowed capacity", ja: "許可された構成の上限超過" },
  "현재 앱과 DB는 어떤 사양으로 배포되어 있나요?": {
    en: "What resources are allocated to this application and database?",
    ja: "現在のアプリとDBは、どのような構成でデプロイされていますか？",
  },
  "답변 생성 중…": { en: "Generating answer…", ja: "回答を生成中…" },
  "질문 보내기": { en: "Send question", ja: "質問を送信" },
  "분석 중…": { en: "Analysing…", ja: "分析中…" },
  "지표 분석": { en: "Analyse metrics", ja: "指標を分析" },
  "추천 생성 중…": { en: "Generating recommendation…", ja: "推奨を生成中…" },
  "추천 받기": { en: "Get recommendation", ja: "推奨を取得" },
  "CPU·메모리 지표와 관측 시간이 충분하지 않아 추천을 만들지 않았습니다.": {
    en: "CPU, memory or observation coverage is insufficient. No recommendation was generated.",
    ja: "CPU・メモリ指標または観測時間が不足しているため、推奨を生成しませんでした。",
  },
  "현재 허용 사양으로 관측 사용량을 수용할 수 없습니다.": {
    en: "The currently allowed configurations cannot support the observed usage.",
    ja: "現在許可されたリソース構成では、観測使用量を処理できません。",
  },
};
