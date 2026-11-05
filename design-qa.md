# 다크 테마 확인

final result: passed

- 참고 화면: https://spotify.lth.so/share/hyun
- 구현 화면: http://127.0.0.1:5184/
- 범위: Sidebar Inset의 색상·글꼴·간격·접기 동작. Foxtrot 메뉴와 빈 본문을 유지합니다.
- 캡처 위치: `../../_workspace/spotify-style-reference/captures/`. 캡처 파일은 로컬 작업 폴더에 보관합니다.
- 도구: 사용자가 승인한 Playwright와 별도 Chrome 세션.
- 데스크톱: 원본·구현 모두 CSS 1440×900, PNG 1440×900, 배율 1.
- 모바일: 원본·구현 모두 CSS 390×844, PNG 390×844, 배율 1.
- 상태: 다크 모드, 사이드바 펼침·접힘, 모바일 메뉴 열림·선택 후 닫힘. 밀도 보정은 필요하지 않았습니다.

**비교 자료**

- 원본: `desktop-reference.png`, `mobile-reference.png`, `mobile-reference-menu.png`.
- 구현: `desktop-implementation.png`, `mobile-implementation.png`, `mobile-implementation-menu.png`.
- 전체 화면 병렬 비교: `comparison-desktop.png`, `comparison-mobile.png`, `comparison-mobile-menu.png`.
- 사이드바·상단 바 확대 비교: `comparison-desktop-focus.png`, `comparison-desktop-collapsed-focus.png`.
- 실제 크기·색상·글꼴 측정: `results.json`.

**확인 결과**

- 글꼴: 두 화면 모두 Geist Variable. 메뉴는 14px/20px, 선택 항목은 굵기 500입니다. 한국어는 시스템 대체 글꼴을 사용합니다.
- 배치: 사이드바 256px, 메뉴 행 32px, 상단 바 48px입니다. 데스크톱 본문은 x=256px, y=8px, 반경 14px입니다. 접으면 x=8px로 이동합니다. 모바일은 본문 여백과 반경이 없습니다. 가로 넘침은 없었습니다.
- 색상: 본문 `oklch(0.145 0 0)`, 사이드바 `oklch(0.205 0 0)`, 선택 항목 `oklch(0.269 0 0)`, 기본 글자 `oklch(0.985 0 0)`가 원본과 같습니다.
- 자산: 기존 Geist 패키지와 Lucide 아이콘을 사용합니다. Foxtrot 아이콘과 메뉴 문구는 유지합니다. 음악 이미지와 재생 정보는 이번 범위에 없습니다.
- 문구: 애플리케이션·마이그레이션·설정을 사용합니다. 본문은 비어 있습니다. 불필요한 메뉴 그룹 제목을 넣지 않아 첫 항목의 세로 위치는 원본보다 32px 높습니다.
- 동작: 버튼과 Ctrl+B로 접기·펼치기, 메뉴 선택 표시, 상단 경로 갱신, 모바일 메뉴 선택 후 닫힘, 새로고침 후 다크 모드 유지를 확인했습니다.
- 오류: 수정 후 데스크톱·모바일의 console error와 page error는 모두 0개입니다.
- 코드: 포맷·린트·타입·FSD·shadcn 원본 11개 검사, 기존 테스트 4개, 배포 빌드를 통과했습니다.

**수정 이력**

1. 첫 비교에서 접힌 사이드바가 아이콘으로 남는 차이(P2)를 찾았습니다. `collapsible="offcanvas"`로 바꾸고 다시 캡처했습니다. 접힌 본문 위치와 너비가 원본과 같아졌습니다.
2. 브라우저 검사에서 기본 favicon 요청의 404를 찾았습니다. 빈 favicon을 명시하고 다시 확인했습니다. 오류가 남지 않았습니다.
3. 수정 후 전체 화면과 확대 화면을 다시 비교했습니다. 이번 범위에서 추가 P0·P1·P2 차이는 없었습니다.

실제 로그인·업무 API·마이그레이션 기능은 이번 스타일 검사 대상이 아닙니다.
