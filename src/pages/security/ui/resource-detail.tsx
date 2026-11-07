import { useEffect, useRef } from "react";
import { ArrowRight, Check, CircleAlert, CircleHelp, FileCode2, X } from "lucide-react";
import { t } from "@/shared/lib/i18n";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/ui/sheet";
import { checkStatus, type Phase, type SecurityResource } from "../model/demo";
import { ResourceIcon, ResourceStatus } from "./resource-map";

export function ResourceDetail({
  resource,
  phase,
  onPlan,
  onCancel,
  onVerify,
  onVerifiedFocus,
}: {
  resource: SecurityResource;
  phase: Phase;
  onPlan: () => void;
  onCancel: () => void;
  onVerify: () => void;
  onVerifiedFocus: () => void;
}) {
  const reviewButtonRef = useRef<HTMLButtonElement>(null);
  const applyButtonRef = useRef<HTMLButtonElement>(null);
  const pendingFocus = useRef<"plan" | "cancel" | "verify" | null>(null);
  const unknown = phase === "idle" || phase === "scanning";
  const plan = resource.id === "redis" && (phase === "plan" || phase === "verifying");
  const verified = phase === "verified" || phase === "approved";
  useEffect(() => {
    if (pendingFocus.current === "plan" && phase === "plan") {
      applyButtonRef.current?.focus();
    } else if (pendingFocus.current === "cancel" && phase === "gap") {
      reviewButtonRef.current?.focus();
    } else if (pendingFocus.current === "verify" && phase === "verified") {
      onVerifiedFocus();
    } else {
      return;
    }
    pendingFocus.current = null;
  }, [phase, onVerifiedFocus]);
  return (
    <Card
      id="security-resource-detail"
      className="security-detail gap-0 self-start overflow-hidden py-0"
      aria-labelledby="security-detail-title"
    >
      <CardHeader className="gap-3 border-b p-5">
        <div className="flex items-center gap-3">
          <ResourceIcon resource={resource} />
          <div className="min-w-0 flex-1">
            <CardTitle id="security-detail-title" className="text-base font-semibold">
              <h2>{t(resource.name)}</h2>
            </CardTitle>
            <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
              {resource.source}
              <ArrowRight size={12} aria-hidden="true" />
              {resource.target}
            </p>
          </div>
          <ResourceStatus resource={resource} phase={phase} />
        </div>
        <div className="flex justify-between gap-3 text-xs">
          <span className="text-muted-foreground">{t("앱 계정")}</span>
          <code>{resource.principal}</code>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 p-5">
        {unknown ? (
          <div className="security-empty">
            <CircleHelp size={24} aria-hidden="true" />
            <p className="font-medium text-foreground">{t("아직 조사하지 않았습니다")}</p>
            <p>{t("조사를 시작하면 현재 설정과 이전할 환경을 비교합니다.")}</p>
          </div>
        ) : (
          <>
            {plan && (
              <section className="security-plan" aria-labelledby="security-plan-title">
                <h3
                  id="security-plan-title"
                  className="mb-2 flex items-center gap-2 text-sm font-medium"
                >
                  <FileCode2 size={15} aria-hidden="true" />
                  {t("Redis 권한 변경안")}
                </h3>
                <p className="mb-3 text-xs text-muted-foreground">
                  {t("인증 정보는 유지하고 키와 명령 범위만 줄입니다.")}
                </p>
                <div className="security-diff" aria-label={t("권한 변경 전후")}>
                  <div>
                    <span className="security-diff-label">{t("변경 전")}</span>
                    <code>~* +@all</code>
                  </div>
                  <div>
                    <span className="security-diff-label">{t("변경 후")}</span>
                    <code>
                      ~session:*
                      <br />
                      +get +set +del +expire +ttl +ping
                    </code>
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {t("Ansible 설정 예시 · 실행 가능한 전체 ACL은 아닙니다.")}
                </p>
              </section>
            )}
            <ul className="security-checks">
              {resource.checks
                .filter((check) => !plan || check.corrected)
                .map((check) => {
                  const failed = checkStatus(check, phase) === "fail";
                  const Icon = failed ? CircleAlert : Check;
                  return (
                    <li
                      key={check.id}
                      className={failed ? "security-check is-gap" : "security-check"}
                    >
                      <div className="mb-2 flex items-center justify-between gap-2 text-sm font-medium">
                        <span>{t(check.title)}</span>
                        <span className={`security-status ${failed ? "is-gap" : "is-pass"}`}>
                          <Icon size={12} aria-hidden="true" />
                          {t(failed ? "보완 필요" : "통과")}
                        </span>
                      </div>
                      <p className="mb-3 text-sm">{t(check.requirement)}</p>
                      <dl className="security-comparison">
                        <div>
                          <dt>{t("현재")}</dt>
                          <dd>{t(check.source)}</dd>
                        </div>
                        <div>
                          <dt>{t("대상")}</dt>
                          <dd>{t(verified && check.corrected ? check.corrected : check.target)}</dd>
                        </div>
                      </dl>
                      {failed && (
                        <p className="mt-3 text-xs text-muted-foreground">
                          {t("현재보다 넓은 접근 권한입니다. 전환 전에 범위를 줄이세요.")}
                        </p>
                      )}
                    </li>
                  );
                })}
            </ul>
            <div className="flex flex-wrap gap-2">
              {resource.id === "redis" && phase === "gap" && (
                <Button
                  ref={reviewButtonRef}
                  onClick={() => {
                    pendingFocus.current = "plan";
                    onPlan();
                  }}
                  className="w-full"
                >
                  {t("변경안 확인")}
                  <ArrowRight aria-hidden="true" />
                </Button>
              )}
              {plan && (
                <>
                  <Button
                    ref={applyButtonRef}
                    className="flex-1 aria-disabled:opacity-50"
                    onClick={() => {
                      if (phase !== "verifying") {
                        pendingFocus.current = "verify";
                        onVerify();
                      }
                    }}
                    aria-disabled={phase === "verifying"}
                    aria-busy={phase === "verifying"}
                  >
                    {t(phase === "verifying" ? "재검증 중…" : "적용 후 재검증")}
                  </Button>
                  <Button
                    variant="outline"
                    disabled={phase === "verifying"}
                    onClick={() => {
                      pendingFocus.current = "cancel";
                      onCancel();
                    }}
                  >
                    {t("취소")}
                  </Button>
                </>
              )}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-full text-muted-foreground">
                    {t("검사 근거 보기")}
                  </Button>
                </SheetTrigger>
                <SheetContent
                  className="security-evidence-sheet w-full overflow-y-auto overscroll-contain sm:max-w-lg"
                  showCloseButton={false}
                >
                  <SheetHeader className="pr-12">
                    <SheetTitle>{t("검사 근거")}</SheetTitle>
                    <SheetDescription>
                      {t("예시 데이터의 검사 항목과 수집 위치입니다.")}
                    </SheetDescription>
                  </SheetHeader>
                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="absolute right-3 top-3"
                      aria-label={t("닫기")}
                    >
                      <X aria-hidden="true" />
                    </Button>
                  </SheetClose>
                  <dl className="space-y-6 px-4 pb-8">
                    {resource.checks.map((check) => (
                      <div key={check.id}>
                        <dt className="mb-2 font-medium">{t(check.title)}</dt>
                        <dd className="space-y-2 text-sm text-muted-foreground">
                          <p>{t(check.requirement)}</p>
                          <code className="block break-words rounded-md bg-muted p-3 text-xs text-foreground">
                            {check.evidence}
                          </code>
                          <p>{t("실제 검사 결과와 수집 시각은 API 연결 후 표시합니다.")}</p>
                        </dd>
                      </div>
                    ))}
                  </dl>
                </SheetContent>
              </Sheet>
            </div>
          </>
        )}
      </CardContent>
      <div className="border-t px-5 py-3 text-xs text-muted-foreground">
        {t("검사 범위: 선택한 보안 조건 3개")}
      </div>
    </Card>
  );
}
