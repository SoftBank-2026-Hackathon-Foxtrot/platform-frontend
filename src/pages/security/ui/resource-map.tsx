import { Check, CircleHelp, CircleAlert, FilePenLine } from "lucide-react";
import { STACK_ICONS } from "@/shared/lib/stack-icons";
import { t } from "@/shared/lib/i18n";
import { Button } from "@/shared/ui/button";
import { Card, CardHeader, CardTitle } from "@/shared/ui/card";
import {
  checkStatus,
  demoResources,
  type Phase,
  type ResourceId,
  type SecurityResource,
} from "../model/demo";

export function ResourceIcon({ resource }: { resource: SecurityResource }) {
  return (
    <span className="security-resource-icon">
      <img src={STACK_ICONS[resource.icon]} alt="" width="28" height="28" />
    </span>
  );
}

export function ResourceStatus({ resource, phase }: { resource: SecurityResource; phase: Phase }) {
  const statuses = resource.checks.map((check) => checkStatus(check, phase));
  const pending = statuses.includes("unknown");
  const gap = statuses.includes("fail");
  const planned = gap && (phase === "plan" || phase === "verifying");
  const Icon = pending ? CircleHelp : planned ? FilePenLine : gap ? CircleAlert : Check;
  return (
    <span
      className={`security-status ${pending ? "" : planned ? "is-planned" : gap ? "is-gap" : "is-pass"}`}
    >
      <Icon aria-hidden="true" size={12} />
      {t(pending ? "조사 전" : planned ? "변경안 준비" : gap ? "보완 필요" : "3건 통과")}
    </span>
  );
}

export function ResourceMap({
  phase,
  selected,
  onSelect,
}: {
  phase: Phase;
  selected: ResourceId;
  onSelect: (id: ResourceId) => void;
}) {
  const gap = phase === "gap" || phase === "plan" || phase === "verifying";
  return (
    <Card className="security-map-card gap-0 overflow-hidden py-0">
      <CardHeader className="flex flex-row items-center justify-between border-b px-5 py-4">
        <CardTitle className="text-sm font-medium">
          <h2>{t("앱과 데이터 연결")}</h2>
        </CardTitle>
        <span className="text-xs text-muted-foreground">{t("리소스 4개")}</span>
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
          <path d="M 370 185 H 630" className={gap ? "is-gap" : ""} />
          <path d="M 370 185 H 470 V 302 H 630" />
          <circle cx="470" cy="185" r="4" />
        </svg>
        {demoResources.map((resource) => (
          <div key={resource.id} className={`security-map-item security-map-${resource.id}`}>
            {resource.id !== "app" && (
              <span
                className={`security-edge-label ${resource.id === "redis" && gap ? "is-gap" : ""}`}
              >
                <code>{resource.principal}</code>
              </span>
            )}
            <Button
              variant="outline"
              aria-pressed={selected === resource.id}
              aria-controls="security-resource-detail"
              onClick={() => onSelect(resource.id)}
              className={`security-resource-button ${selected === resource.id ? "is-selected" : ""} ${resource.id === "redis" && gap ? "has-gap" : ""}`}
            >
              <span className="security-resource-top">
                <ResourceIcon resource={resource} />
                <span className="min-w-0 text-left">
                  <span className="block truncate text-sm font-medium">{t(resource.name)}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {resource.id === "app" ? "order-svc" : resource.target}
                  </span>
                </span>
              </span>
              <span className="security-resource-bottom">
                <span>{resource.source}</span>
                <ResourceStatus resource={resource} phase={phase} />
              </span>
            </Button>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t px-5 py-3 text-xs text-muted-foreground">
        <span>{t("연결선: 앱이 사용하는 계정")}</span>
        <span>{t("AWS → 온프레미스")}</span>
      </div>
    </Card>
  );
}
