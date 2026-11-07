# OTEL 마이그레이션 화면

각 모듈의 OTEL 로그를 Collector가 CP로 전달하고, CP는 기존 상세/이력 모델을 제공합니다. 리소스 카드에 수집 출처 OTEL을 표시합니다. `/v1/workflows/{id}/telemetry`는 Prometheus의 핵심 수치와 Tempo의 최근 trace ID/서비스/작업/소요 시간을 조회합니다. 프런트엔드는 공통 Axios + TanStack Query + Zod로 CP만 호출합니다.

Collector/backend 미설정, 단절, 아직 없는 표본을 구별합니다. metric 수집 시각과 원본 관측 경과를 함께 표시합니다. 수치가 없다고 0으로 표시하지 않습니다. 작업 ID는 span correlation용이며 브라우저에 OTLP SDK나 service token을 넣지 않습니다. 실제 앱 SDK는 demo 저장소에 있습니다.

`VITE_API_BASE_URL` 또는 `/api` 프록시를 CP에 연결합니다. 운영 수집 구성은 IaC `docs/migration-observability.md`를 따릅니다. 검사: `vp run check`, `vp run build`.
