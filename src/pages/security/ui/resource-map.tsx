import { Check, CircleAlert, CircleHelp } from "lucide-react";
import { t } from "@/shared/lib/i18n";
import { STACK_ICONS } from "@/shared/lib/stack-icons";
import { Button } from "@/shared/ui/button";
import { Card, CardHeader, CardTitle } from "@/shared/ui/card";
import type { Review } from "../api/review";
import { resources, type ResourceId, type SecurityResource } from "../model/resources";
export function ResourceIcon({ resource }: { resource: SecurityResource }) {
  return (
    <span className="security-resource-icon">
      <img src={STACK_ICONS[resource.icon]} alt="" width="28" height="28" />
    </span>
  );
}
export function ResourceStatus({
  resource,
  review,
}: {
  resource: SecurityResource;
  review: Review;
}) {
  const relevant = resource.id === "object";
  const unknown = !review.checks.length || review.checks.some((c) => c.status === "unknown");
  const fail = review.checks.some((c) => c.status === "fail");
  const Icon = !relevant || unknown ? CircleHelp : fail ? CircleAlert : Check;
  return (
    <span className={`security-status ${!relevant || unknown ? "" : fail ? "is-gap" : "is-pass"}`}>
      <Icon aria-hidden="true" size={12} />
      {t(!relevant ? resource.status : unknown ? "미확인" : fail ? "설정 차이" : "선택 조건 일치")}
    </span>
  );
}
export function ResourceMap({
  review,
  selected,
  onSelect,
}: {
  review: Review;
  selected: ResourceId;
  onSelect: (id: ResourceId) => void;
}) {
  const gap = review.checks.some((c) => c.status === "fail");
  return (
    <Card className="security-map-card gap-0 overflow-hidden py-0">
      <CardHeader className="flex flex-row items-center justify-between border-b px-5 py-4">
        <CardTitle className="text-sm font-medium">
          <h2>{t("앱과 데이터 연결")}</h2>
        </CardTitle>
        <span className="text-xs text-muted-foreground">{t("오브젝트 권한 비교")}</span>
      </CardHeader>
      <div className="security-map" role="group" aria-label={t("리소스별 보안 검사")}>
        <div className="security-map-label">{t("실행 환경")}</div>
        <div className="security-map-label security-data-label">{t("데이터 서비스")}</div>
        <svg
          className="security-map-lines"
          viewBox="0 0 1000 370"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M 370 185 H 470 V 93 H 630" />
          <path d="M 370 185 H 630" />
          <path d="M 370 185 H 470 V 302 H 630" className={gap ? "is-gap" : ""} />
          <circle cx="470" cy="185" r="4" />
        </svg>
        {resources(review).map((resource) => (
          <div key={resource.id} className={`security-map-item security-map-${resource.id}`}>
            {resource.principal && (
              <span className={`security-edge-label ${gap ? "is-gap" : ""}`}>
                <code>{resource.principal}</code>
              </span>
            )}
            <Button
              variant="outline"
              aria-pressed={selected === resource.id}
              aria-controls="security-resource-detail"
              onClick={() => onSelect(resource.id)}
              className={`security-resource-button ${selected === resource.id ? "is-selected" : ""} ${resource.id === "object" && gap ? "has-gap" : ""}`}
            >
              <span className="security-resource-top">
                <ResourceIcon resource={resource} />
                <span className="min-w-0 text-left">
                  <span className="block text-sm font-medium">{t(resource.name)}</span>
                  <span className="mt-0.5 block break-all text-xs text-muted-foreground">
                    {resource.target}
                  </span>
                </span>
              </span>
              <span className="security-resource-bottom">
                <span>{resource.source}</span>
                <ResourceStatus resource={resource} review={review} />
              </span>
            </Button>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap justify-between gap-2 border-t px-5 py-3 text-xs text-muted-foreground">
        <span>{t("앱 구성 관계 · 권한 검사는 오브젝트만")}</span>
        <span>AWS → GCP</span>
      </div>
    </Card>
  );
}
