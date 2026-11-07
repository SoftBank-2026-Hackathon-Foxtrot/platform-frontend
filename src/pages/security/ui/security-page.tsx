import { useEffect, useReducer, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, ChevronDown, LoaderCircle, RotateCcw } from "lucide-react";
import { t, useLocale } from "@/shared/lib/i18n";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import {
  checkCounts,
  demoReducer,
  demoResources,
  initialDemoState,
  type DemoAction,
  type Phase,
} from "../model/demo";
import { ResourceDetail } from "./resource-detail";
import { ResourceMap } from "./resource-map";
import "./security.css";

const phaseCopy: Record<Phase, { label: string; title: string; description: string }> = {
  idle: {
    label: "조사 전",
    title: "이전할 환경의 보안 설정을 비교하세요",
    description: "앱, DB, Redis, 오브젝트 스토리지의 접근 범위와 연결 설정을 확인합니다.",
  },
  scanning: {
    label: "조사 중",
    title: "현재 환경과 대상 환경을 비교하고 있습니다",
    description: "예시 검사 결과를 불러오는 중입니다.",
  },
  gap: {
    label: "보완 필요",
    title: "Redis 접근 권한을 줄여야 합니다",
    description: "대상 환경에서 앱 계정이 모든 키와 명령에 접근할 수 있습니다.",
  },
  plan: {
    label: "변경안 준비",
    title: "세션 키와 지정 명령만 허용하도록 변경합니다",
    description: "변경안을 검토한 뒤 적용하고 보안 검사를 다시 실행하세요.",
  },
  verifying: {
    label: "재검증 중",
    title: "변경한 권한을 다시 확인하고 있습니다",
    description: "예시 설정 적용과 재검증을 진행하는 중입니다.",
  },
  verified: {
    label: "검증 완료",
    title: "보안 검사 12건을 통과했습니다",
    description: "이번에 검사한 범위에서 보완할 항목이 없습니다. 전환을 승인할 수 있습니다.",
  },
  approved: {
    label: "전환 승인됨",
    title: "이 예시의 보안 검토를 마쳤습니다",
    description: "승인 기록을 남겼습니다. 실제 트래픽 전환은 실행하지 않았습니다.",
  },
};
const primaryActions = {
  idle: { type: "scan", label: "조사 시작" },
  scanning: { type: "scan", label: "조사 중…" },
  gap: { type: "plan", label: "변경안 확인" },
  plan: { type: "verify", label: "적용 후 재검증" },
  verifying: { type: "verify", label: "재검증 중…" },
  verified: { type: "approve", label: "전환 승인" },
} as const;
const steps = ["조사", "변경안", "재검증", "승인"];
const activeStep: Record<Phase, number> = {
  idle: 0,
  scanning: 0,
  gap: 1,
  plan: 1,
  verifying: 2,
  verified: 3,
  approved: 4,
};

export function SecurityPage() {
  const locale = useLocale();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const primaryActionRef = useRef<HTMLButtonElement>(null);
  const [state, dispatch] = useReducer(demoReducer, initialDemoState);
  const [showAllEvents, setShowAllEvents] = useState(false);
  const { phase, selected, events } = state;
  const resource = demoResources.find((item) => item.id === selected)!;
  const counts = checkCounts(phase);
  const copy = phaseCopy[phase];
  const busy = phase === "scanning" || phase === "verifying";
  const run = (type: Exclude<DemoAction["type"], "select" | "reset">) =>
    dispatch({ type, at: new Date().toISOString() });

  useEffect(() => {
    if (phase === "approved") headingRef.current?.focus();
  }, [phase]);

  // Only the explicitly labelled local demonstration is simulated. No infrastructure calls.
  useEffect(() => {
    if (phase !== "scanning" && phase !== "verifying") return;
    const timer = window.setTimeout(
      () =>
        dispatch({
          type: phase === "scanning" ? "scanned" : "verified",
          at: new Date().toISOString(),
        }),
      650,
    );
    return () => window.clearTimeout(timer);
  }, [phase]);

  return (
    <main className="security-page" aria-label={t("보안·거버넌스")}>
      <div className="security-demo-notice">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <Badge variant="outline">{t("예시 데이터")}</Badge>
          <p>{t("조사·설정 적용·승인은 시연용입니다.")}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            dispatch({ type: "reset" });
            setShowAllEvents(false);
          }}
          disabled={phase === "idle"}
        >
          <RotateCcw aria-hidden="true" />
          {t("처음으로")}
        </Button>
      </div>
      <Card className="security-summary gap-0 overflow-hidden py-0">
        <div className="security-summary-main">
          <div className="min-w-0 flex-1">
            <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="font-mono text-sm font-medium">order-svc</span>
              <span className="text-xs text-muted-foreground">{t("AWS → 온프레미스")}</span>
              <Badge
                variant="outline"
                className={phase === "gap" ? "border-destructive/30 text-destructive" : ""}
              >
                {busy && <LoaderCircle className="animate-spin" aria-hidden="true" />}
                {t(copy.label)}
              </Badge>
            </div>
            <div role="status" aria-live="polite" aria-atomic="true">
              <h1 ref={headingRef} tabIndex={-1}>
                {t(copy.title)}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {t(copy.description)}
              </p>
            </div>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs tabular-nums text-muted-foreground">
              <span>{t("리소스 4개")}</span>
              <span>{t("검사 {0}/{1}건 통과", [counts.pass, counts.total])}</span>
              {counts.fail > 0 && (
                <span className="text-destructive">{t("보완 {0}건", [counts.fail])}</span>
              )}
              {counts.unknown > 0 && <span>{t("미확인 {0}건", [counts.unknown])}</span>}
              <span>Docker Compose · Ansible</span>
            </div>
          </div>
          <div className="security-summary-action">
            {phase !== "approved" && (
              <Button
                ref={primaryActionRef}
                aria-disabled={busy}
                aria-busy={busy}
                className="aria-disabled:opacity-50"
                onClick={() => {
                  if (!busy) run(primaryActions[phase].type);
                }}
              >
                {busy && <LoaderCircle className="animate-spin" aria-hidden="true" />}
                {t(primaryActions[phase].label)}
                <ArrowRight aria-hidden="true" />
              </Button>
            )}
            {phase === "approved" && (
              <Button variant="outline" asChild>
                <Link to="/migrations">
                  {t("마이그레이션 목록")}
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            )}
          </div>
        </div>
        <ol className="security-steps" aria-label={t("보안 검토 단계")}>
          {steps.map((step, index) => (
            <li
              key={step}
              className={
                index < activeStep[phase]
                  ? "is-complete"
                  : index === activeStep[phase]
                    ? "is-current"
                    : ""
              }
              aria-current={index === activeStep[phase] ? "step" : undefined}
            >
              <span className="security-step-number">
                {index < activeStep[phase] ? <Check size={12} aria-label={t("완료")} /> : index + 1}
              </span>
              <span>{t(step)}</span>
            </li>
          ))}
        </ol>
      </Card>
      <div className="security-workspace">
        <ResourceMap
          phase={phase}
          selected={selected}
          onSelect={(id) => dispatch({ type: "select", id })}
        />
        <ResourceDetail
          key={selected}
          resource={resource}
          phase={phase}
          onPlan={() => run("plan")}
          onCancel={() => run("cancel")}
          onVerify={() => run("verify")}
          onVerifiedFocus={() => primaryActionRef.current?.focus()}
        />
        <Card className="security-audit gap-0 overflow-hidden py-0">
          <CardHeader className="flex flex-row items-center justify-between border-b px-5 py-4">
            <CardTitle className="text-sm font-medium">
              <h2>{t("검토 기록")}</h2>
            </CardTitle>
            <span className="text-xs text-muted-foreground">{t("시연 기록")}</span>
          </CardHeader>
          <CardContent className="px-5 py-1">
            {events.length === 0 ? (
              <p className="py-5 text-sm text-muted-foreground">
                {t("조사를 시작하면 기록이 표시됩니다.")}
              </p>
            ) : (
              <ol className="security-event-list">
                {(showAllEvents ? events : events.slice(0, 3)).map((event) => (
                  <li key={event.id}>
                    <span className="security-event-dot" />
                    <span className="min-w-0 flex-1">{t(event.message)}</span>
                    <time dateTime={event.at}>
                      {new Intl.DateTimeFormat(locale, {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      }).format(new Date(event.at))}
                    </time>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
          {events.length > 3 && (
            <Button
              variant="ghost"
              onClick={() => setShowAllEvents(!showAllEvents)}
              className="mx-3 mb-2 text-xs text-muted-foreground"
              aria-expanded={showAllEvents}
            >
              {t(showAllEvents ? "접기" : "전체 기록 보기")}
              <ChevronDown className={showAllEvents ? "rotate-180" : ""} aria-hidden="true" />
            </Button>
          )}
        </Card>
      </div>
      <p className="security-scope-note">
        {t(
          "이 화면은 선택한 12개 조건만 확인합니다. 전체 보안 인증이나 규정 준수 판정은 포함하지 않습니다.",
        )}
      </p>
    </main>
  );
}
