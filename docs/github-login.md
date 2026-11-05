# GitHub 로그인 설계

상태: 검토안. 로그인 기능은 아직 구현하지 않았습니다.

**GitHub App으로 사용자를 인증하고, 플랫폼 백엔드가 세션을 발급합니다.** 프론트엔드는 세션 조회와 화면 전환을 맡습니다. GitHub 로그인과 GitHub App 설치는 별도 단계로 둡니다. 기존 플랫폼 백엔드 기획을 따릅니다.

기존 기획에 추가로, 첫 시연은 **승인한 팀원의 GitHub 숫자 ID만 허용**하는 정책을 제안합니다. 백엔드가 GitHub에서 받은 ID를 검사한 뒤 세션과 개인 workspace를 만듭니다. 관리형 AWS 자원을 쓰므로 로그인 성공만으로 누구나 자원을 생성하게 열지 않습니다. 이후 초대 기능으로 넓힐 수 있습니다.

현재 프론트엔드에는 쿠키를 보내는 Axios 설정과 401 재시도 금지 정책이 있습니다. 라우터·로그인 화면·세션 조회는 없습니다. 확인한 `control-plane` 원격 저장소도 비어 있습니다. 아래 API는 구현된 API가 아닌 제안 계약입니다.

**사용자 흐름**

1. 미로그인 사용자는 `/login`에서 **GitHub로 계속하기** 버튼을 봅니다. 로그인 전에는 앱 목록과 실행 메뉴를 표시하지 않습니다.
2. 버튼을 누르면 `/api/auth/github/start`로 현재 창을 이동합니다. 백엔드가 `state`와 PKCE 값을 만들고 GitHub 인증 화면으로 보냅니다. 이 이동은 Axios 요청으로 처리하지 않습니다.
3. GitHub는 백엔드 callback으로 인증 코드를 보냅니다. 백엔드가 요청을 검증하고 코드를 토큰으로 교환합니다. 이후 `GET /user`로 GitHub 숫자 ID를 확인합니다. 계정 키로 이메일이나 사용자 이름을 사용하지 않습니다.
4. 백엔드가 플랫폼 세션 쿠키를 발급하고 허용한 내부 화면으로 돌려보냅니다. 프론트엔드는 `/api/v1/me`를 조회한 뒤 앱 화면을 엽니다.
5. 첫 로그인 후에는 개인 workspace와 빈 앱 목록을 보여 줍니다. 사용자가 **저장소 연결**을 선택할 때 GitHub App 설치를 진행합니다. 설치 전에도 로그인은 완료된 상태입니다.

GitHub App은 OAuth 사용자 인증과 설치 인증을 함께 제공할 수 있습니다. 로그인에는 사용자 인증을 쓰고, 저장소 작업에는 설치 토큰을 씁니다. PKCE는 `S256`을 사용하며 코드 교환은 서버에서 처리합니다. [GitHub 사용자 인증 문서](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-a-user-access-token-for-a-github-app)

**화면과 API 계약**

브라우저에서는 `/api` 접두어를 붙입니다. 현재 Vite 프록시는 이 접두어를 제거해 백엔드로 보냅니다. 운영에서도 같은 경로 연결이 필요합니다.

| 브라우저 요청                                       | 백엔드 처리                                  | 결과                                                |
| --------------------------------------------------- | -------------------------------------------- | --------------------------------------------------- |
| `GET /api/auth/github/start?returnTo=/applications` | 인증 요청 저장, GitHub로 이동                | `302`                                               |
| `GET /api/auth/github/callback`                     | 요청 검증, 코드 교환, 사용자 확인, 세션 발급 | 성공 시 `303`으로 내부 화면 이동                    |
| `GET /api/v1/me`                                    | 세션 유효성 조회                             | `200`: 사용자·만료 시각·CSRF 토큰. 세션 없음: `401` |
| `POST /api/auth/logout`                             | CSRF 검증, 서버 세션 무효화, 쿠키 만료       | `204`                                               |
| `GET /api/v1/workspaces`                            | 사용자가 속한 workspace 조회                 | `200`: 권한을 포함한 목록                           |

`/v1/me`는 `user { id, githubId, login, avatarUrl }`, `expiresAt`, `csrfToken`을 반환합니다. 인증 응답은 `Cache-Control: no-store`로 보냅니다. GitHub 토큰과 세션 ID는 JSON에 넣지 않습니다.

로그인 화면에는 제목·GitHub 버튼·실패 메시지만 둡니다. 버튼의 아이콘은 `RiGithubFill`을 사용합니다. 로그인 후에는 사이드바 하단에 아바타·사용자 이름·로그아웃 메뉴를 둡니다. 버튼·메뉴·오류 표시는 shadcn 컴포넌트로 조합합니다. 이 화면들은 이번 검토 단계에서 구현하지 않습니다.

**세션과 callback 처리**

- 운영 세션 쿠키는 `__Host-foxtrot_session`을 사용합니다. `Secure`, `HttpOnly`, `SameSite=Lax`, `Path=/`를 지정하고 `Domain`은 지정하지 않습니다. 세션 ID는 충분한 난수로 만들고 DynamoDB에는 해시를 저장합니다. [OWASP 세션 지침](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- 첫 정책은 플랫폼 세션의 절대 만료 8시간, OAuth 인증 요청 만료 5분으로 제안합니다. 이 값은 플랫폼 정책입니다. GitHub 토큰 수명과 별도로 관리합니다.
- OAuth 요청은 서버의 `state`만 확인하지 않습니다. 요청을 시작한 브라우저의 일회용 쿠키에도 연결합니다. callback에서 두 값과 만료를 확인하고 DynamoDB 조건부 변경으로 한 번만 소비합니다. 로그인 성공 시 기존 세션 ID는 교체합니다.
- 서버는 매 요청에서 만료와 무효화 여부를 검사합니다. 즉시 로그아웃을 보장하려면 세션 조회도 강한 일관성을 사용합니다. DynamoDB TTL은 삭제가 지연될 수 있으므로 유효성 판단에 사용하지 않습니다. [DynamoDB TTL 문서](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/TTL.html)
- 변경 요청과 로그아웃에는 세션에 연결한 `X-CSRF-Token`과 허용한 Origin 검사를 적용합니다. CSRF 토큰은 `/v1/me` 응답에서 받아 메모리에 둡니다. 서버가 매번 비교하며 `SameSite`만 믿지 않습니다. [OWASP CSRF 지침](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- GitHub 토큰은 서버에서 암호화해 보관하고 갱신합니다. 프론트엔드는 GitHub 토큰·세션 ID를 localStorage에 저장하지 않습니다. GitHub 토큰 갱신 실패와 플랫폼 세션 만료는 구분합니다. [GitHub 토큰 갱신 문서](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/refreshing-user-access-tokens)
- `returnTo`는 서버가 허용한 내부 경로만 받습니다. 외부 URL·`//` 경로는 거절합니다. 인증 코드·state·토큰은 일반 요청 로그에 남기지 않습니다.

운영 callback은 `https://<콘솔 도메인>/api/auth/github/callback`으로 정확히 등록합니다. GitHub App의 wildcard callback은 끕니다. 설치 완료 주소인 setup URL은 별도로 둡니다. [GitHub callback 문서](https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app/about-the-user-authorization-callback-url)

로컬 개발도 고정한 주소와 포트를 사용합니다. 로컬 HTTP용 쿠키는 별도 이름을 쓰고, `Secure` 해제는 명시한 로컬 환경에서만 허용합니다. 임시 미리보기 주소를 운영 callback으로 등록하지 않습니다.

**프론트엔드 상태 처리**

| 상황                                | 화면과 동작                                                                                |
| ----------------------------------- | ------------------------------------------------------------------------------------------ |
| 최초 접속·인증 확인 중              | 세션 확인 표시. 보호한 업무 query는 실행하지 않음                                          |
| 세션 조회 `200`                     | 해당 사용자와 workspace의 화면·query 활성화                                                |
| 세션 없음·만료 `401`                | 사용자 query 취소, 계정 캐시 제거, `/login`으로 이동                                       |
| 네트워크 오류·`5xx`                 | 연결 오류와 재시도 표시. 미로그인으로 단정하지 않음                                        |
| workspace 권한 `403`                | 권한 오류 표시. 전체 로그아웃하지 않음                                                     |
| 사용자 인증 취소·callback 검증 실패 | `/login`에 정해 둔 오류 코드만 전달. 다시 로그인할 수 있게 함                              |
| GitHub 설치 해제·저장소 권한 해제   | 저장소 재연결 안내. 플랫폼 로그인과 구분                                                   |
| 로그아웃 응답 유실                  | 로그아웃 성공으로 표시하지 않음. 세션 상태를 다시 확인                                     |
| 실행 중 세션 만료                   | 서버의 배포·이전 작업은 계속 보존. 재로그인 후 상태 조회. 실행 명령을 자동 재전송하지 않음 |

로그아웃을 시작하면 새 업무 요청을 막습니다. 진행 중 query를 취소하고 사용자 캐시를 제거합니다. 이후 세션 무효화를 확인합니다. 취소한 요청의 응답이 이전 계정 캐시를 다시 채우지 않게 `AbortSignal`을 Axios까지 전달합니다. [TanStack Query 취소 문서](https://tanstack.com/query/latest/docs/framework/react/guides/query-cancellation)

현재 메뉴는 `useState`로만 전환합니다. 로그인 구현 때 TanStack Router를 추가해 `/login`과 보호 경로를 분리합니다. 보호 경로의 `beforeLoad`에서 세션을 확인하며, 세션 query는 화면 진입·창 재활성화 때 갱신합니다. UI의 경로 차단과 별개로 백엔드는 모든 API에서 사용자와 workspace 권한을 검사합니다. [TanStack Router 인증 경로 문서](https://tanstack.com/router/latest/docs/framework/react/guide/authenticated-routes)

추가할 코드는 `app`의 라우터, `pages/login`의 화면, `entities/session`의 API·스키마·query, `features/auth`의 로그인 이동·로그아웃 동작으로 나눕니다. 공통 Axios와 기존 QueryClient를 그대로 사용합니다.

**구현 순서와 확인 기준**

1. 백엔드에서 OAuth 요청·callback을 구현합니다. 위조 state, 다른 브라우저의 callback, 만료·재사용 코드, 외부 `returnTo`를 거절하는지 검사합니다.
2. 백엔드에서 세션·`me`·로그아웃·CSRF·workspace 권한을 구현합니다. 실제 GitHub 인증과 세션 만료·즉시 로그아웃·타 workspace 접근 차단을 검사합니다.
3. 프론트엔드에서 로그인 화면·라우터·세션 query·로그아웃을 연결합니다. 새로고침, 뒤로 가기, 다중 탭 로그아웃, 계정 전환 후 캐시 격리, 네트워크 오류를 검사합니다. 다른 탭에는 로그아웃 신호만 전달하고 토큰은 전달하지 않습니다.
4. 로그인 완료 후 별도 기능으로 GitHub App 설치·저장소 선택·앱 등록을 연결합니다. 설치 ID만 받아 권한을 인정하지 않습니다.

각 단계는 별도 커밋으로 남깁니다. 착수 전에 운영 도메인, 개발 callback 주소, GitHub App 등록값, 승인할 팀원 ID를 확정해야 합니다. 실제 인증 검증 전에는 로그인 구현 완료로 표시하지 않습니다.
