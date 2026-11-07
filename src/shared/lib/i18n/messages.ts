export const messages: Record<string, { en: string; ja: string }> = {
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
  "이 단계는 되돌리기 어렵습니다. 현재 단계를 승인하면 엔진이 다음 작업을 진행합니다.": {
    en: "This stage is difficult to reverse. Approval allows the engine to continue.",
    ja: "元に戻すことが困難な段階です。承認すると処理が進みます。",
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
  "LB 설정과 공용 probe의 실제 도착 위치를 구분합니다. probe 비율은 전체 사용자 트래픽 비율이 아닙니다.":
    {
      en: "LB settings and observed public probe destinations differ. Probe ratios do not represent all user traffic.",
      ja: "LB 設定と公開プローブの到達先は別の値です。比率は全ユーザートラフィックの比率ではありません。",
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
  "WebSocket은 기존 연결의 잔존 수입니다. 신규 HTTP 요청의 도착 위치와 별도로 확인합니다.": {
    en: "Remaining WebSocket connections are separate from new HTTP request destinations.",
    ja: "WebSocket は既存接続の残数です。新しい HTTP の到達先とは別に確認します。",
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
  "화면 진입 전 5분부터 수집된 표본입니다. 수집 실패도 남습니다.": {
    en: "Samples since five minutes before opening this page, including collection failures.",
    ja: "画面を開く5分前以降のサンプルです。収集失敗も記録されます。",
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
  "Prometheus 수치와 Tempo 추적을 컨트롤 플레인을 통해 조회합니다. 원본 관측 경과도 함께 확인하세요.":
    {
      en: "Query Prometheus metrics and Tempo traces through the control plane. Also check observation age.",
      ja: "コントロールプレーン経由でメトリクスとトレースを取得します。観測からの経過も確認してください。",
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
  ". 실제 쓰기 건수를 뜻하지 않습니다.": {
    en: ". This does not indicate actual write counts.",
    ja: "。実際の書き込み件数ではありません。",
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
};
