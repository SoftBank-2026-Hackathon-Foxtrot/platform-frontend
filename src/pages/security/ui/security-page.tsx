import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, ChevronDown, LoaderCircle, RefreshCw } from "lucide-react";
import { useSession } from "@/entities/session";
import { getApiErrorMessage } from "@/shared/api";
import { t, useLocale } from "@/shared/lib/i18n";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import {
  busyReview,
  canContinue,
  changeReview,
  reviewKey,
  reviewOptions,
  type Action,
  type Review,
} from "../api/review";
import { resources, type ResourceId } from "../model/resources";
import { ResourceDetail } from "./resource-detail";
import { ResourceMap } from "./resource-map";
import "./security.css";
const titles: Record<Review["phase"], string> = {
  idle: "AWS와 GCP의 접근 범위를 비교하세요",
  scanning: "현재 설정을 조회하고 있습니다",
  gap: "GCP의 접근 범위가 기존보다 넓습니다",
  unknown: "비교할 수 없는 설정이 있습니다",
  matched: "선택한 설정이 일치합니다",
  plan: "앱 권한은 유지하고 추가 접근만 제거합니다",
  applying: "확인한 변경안을 GCP에 적용하고 있습니다",
  applied: "설정을 적용했습니다. 다시 확인하세요",
  verifying: "설정과 앱 상태를 다시 확인하고 있습니다",
  verified: "선택한 조건이 기존 환경과 일치합니다",
  error: "작업 결과를 확인해야 합니다",
};
function nextAction(review: Review): { action: Action; label: string } {
  if (review.phase === "gap" && review.appReady) return { action: "plan", label: "변경안 확인" };
  if (review.phase === "plan") return { action: "apply", label: "변경안 보기" };
  if (["applied", "matched", "verified"].includes(review.phase))
    return { action: "verify", label: "설정 재확인" };
  return { action: "scan", label: "설정 조사" };
}
export function SecurityPage() {
  const locale = useLocale();
  const session = useSession();
  const client = useQueryClient();
  const query = useQuery(reviewOptions(session.workspaceId));
  const [selected, setSelected] = useState<ResourceId>("object");
  const [showAll, setShowAll] = useState(false);
  const primary = useRef<HTMLButtonElement>(null);
  const mutation = useMutation({
    mutationFn: ({ action, review }: { action: Action; review: Review }) =>
      changeReview(action, review),
    retry: false,
    onSuccess: (review) => {
      client.setQueryData(reviewKey(session.workspaceId), review);
      primary.current?.focus();
    },
    onError: () => void client.invalidateQueries({ queryKey: reviewKey(session.workspaceId) }),
  });
  const review = query.data;
  if (!review)
    return (
      <div className="security-page">
        <h1 className="mb-4 text-xl font-semibold">{t("보안·거버넌스")}</h1>
        <Card>
          <CardContent className="space-y-4 pt-6">
            <p role={query.error ? "alert" : "status"}>
              {query.error
                ? getApiErrorMessage(query.error)
                : t("보안 비교 결과를 불러오는 중입니다.")}
            </p>
            {query.error && (
              <>
                <p className="text-sm text-muted-foreground">
                  {t("비교 대상 연결 후 실제 설정을 조회할 수 있습니다.")}
                </p>
                <Button variant="outline" onClick={() => void query.refetch()}>
                  {t("다시 조회")}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  const busy = mutation.isPending || busyReview(review);
  const next = nextAction(review);
  const ready = canContinue(review) && !busy && !query.error;
  const step =
    review.phase === "verified"
      ? 3
      : ["applied", "verifying", "matched"].includes(review.phase)
        ? 2
        : ["gap", "plan", "applying"].includes(review.phase)
          ? 1
          : 0;
  const run = (action: Action) => {
    if (!busy) {
      setSelected("object");
      mutation.mutate({ action, review });
    }
  };
  return (
    <div className="security-page">
      <div className="security-demo-notice">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">
            {t(review.mode === "fixture" ? "예시 데이터" : "클라우드 조회")}
          </Badge>
          <p>
            {t(
              review.mode === "fixture"
                ? "로컬 시연 · 실제 클라우드는 변경하지 않습니다."
                : "AWS 기준 정책과 GCP 직접 부여 권한을 비교합니다.",
            )}
          </p>
        </div>
        <Button variant="ghost" size="sm" disabled={busy} onClick={() => run("scan")}>
          <RefreshCw aria-hidden="true" />
          {t("다시 조사")}
        </Button>
      </div>
      <Card className="security-summary gap-0 overflow-hidden py-0">
        <div className="security-summary-main">
          <div className="min-w-0 flex-1">
            <h1>{t(titles[review.phase])}</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              <span className="font-mono">{review.application}</span>
              <span className="mx-3">AWS → GCP</span>
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {t("앱에서 쓰는 버킷은 유지하고, 추가된 버킷 접근 권한만 확인합니다.")}
            </p>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs tabular-nums text-muted-foreground">
              <span>
                {t("선택 조건 일치 {0}/{1}건", [
                  review.checks.filter((c) => c.status === "pass").length,
                  3,
                ])}
              </span>
              <span>
                {t("설정 차이 {0}건", [review.checks.filter((c) => c.status === "fail").length])}
              </span>
              <span>
                {t(
                  review.appReady === null
                    ? "앱 상태 미확인"
                    : review.appReady
                      ? "대상 앱 준비 응답 정상"
                      : "대상 앱 준비 응답 확인 필요",
                )}
              </span>
            </div>
          </div>
          <div className="security-summary-action">
            <Button
              ref={primary}
              aria-disabled={busy}
              aria-busy={busy}
              className="aria-disabled:opacity-50"
              onClick={() => {
                if (busy) return;
                if (review.phase === "plan") {
                  setSelected("object");
                  requestAnimationFrame(() => {
                    const title = document.getElementById("security-plan-title");
                    title?.scrollIntoView({ block: "start" });
                    title?.focus({ preventScroll: true });
                  });
                } else run(next.action);
              }}
            >
              {busy ? (
                <LoaderCircle
                  aria-hidden="true"
                  className="animate-spin motion-reduce:animate-none"
                />
              ) : (
                <ArrowRight aria-hidden="true" />
              )}
              {t(busy ? "처리 중…" : next.label)}
            </Button>
          </div>
        </div>
        <ol className="security-steps" aria-label={t("보안 검토 단계")}>
          {["비교", "변경안", "재확인", "계속"].map((label, index) => (
            <li
              key={label}
              className={index < step ? "is-complete" : index === step ? "is-current" : ""}
              aria-current={index === step ? "step" : undefined}
            >
              <span className="security-step-number">
                {index < step ? <Check size={12} aria-hidden="true" /> : index + 1}
              </span>
              {t(label)}
            </li>
          ))}
        </ol>
      </Card>
      <div role="status" aria-live="polite" className="sr-only">
        {t(titles[review.phase])}
      </div>
      {(review.error || mutation.error || query.error) && (
        <div role="alert" className="mt-4 rounded-md border border-destructive/40 p-4 text-sm">
          {review.error ? t(review.error) : getApiErrorMessage((mutation.error ?? query.error)!)}
        </div>
      )}
      <div className="security-workspace">
        <ResourceMap
          review={review}
          selected={selected}
          onSelect={(id) => {
            setSelected(id);
            if (window.matchMedia("(max-width: 1200px)").matches)
              requestAnimationFrame(() => {
                const title = document.getElementById("security-detail-title");
                title?.scrollIntoView({ block: "start" });
                title?.focus({ preventScroll: true });
              });
          }}
        />
        <ResourceDetail
          resource={resources(review).find((r) => r.id === selected)!}
          review={review}
          busy={busy}
          onApply={() => run("apply")}
        />
        <Card className="security-audit gap-0 overflow-hidden py-0">
          <CardHeader className="flex flex-row items-center justify-between border-b px-5 py-4">
            <CardTitle className="text-sm font-medium">
              <h2>{t("검토 기록")}</h2>
            </CardTitle>
            <span className="text-xs text-muted-foreground">{t("서버 저장")}</span>
          </CardHeader>
          <CardContent className="px-5 py-1">
            {!review.events.length ? (
              <p className="py-5 text-sm text-muted-foreground">
                {t("조사를 시작하면 기록이 표시됩니다.")}
              </p>
            ) : (
              <ol className="security-event-list">
                {(showAll ? review.events : review.events.slice(0, 3)).map((event) => (
                  <li key={event.id}>
                    <span className="security-event-dot" />
                    <span className="min-w-0 flex-1">
                      {t(event.message)}
                      <span className="mt-1 block text-xs text-muted-foreground">
                        {event.actor}
                      </span>
                    </span>
                    <time dateTime={event.at}>{new Date(event.at).toLocaleTimeString(locale)}</time>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
          {review.events.length > 3 && (
            <Button
              variant="ghost"
              onClick={() => setShowAll(!showAll)}
              aria-expanded={showAll}
              className="mx-3 mb-2 text-xs text-muted-foreground"
            >
              {t(showAll ? "접기" : "전체 기록 보기")}
              <ChevronDown aria-hidden="true" />
            </Button>
          )}
        </Card>
      </div>
      <div className="security-continue">
        <div>
          <p className="text-sm font-medium">
            {t(ready ? "검토를 마쳤습니다" : "설정과 앱 상태를 재확인한 뒤 계속할 수 있습니다")}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {t(
              "이 화면의 진행 버튼만 제어합니다. 실제 마이그레이션 승인·전환은 기존 절차를 따릅니다.",
            )}
          </p>
        </div>
        {ready ? (
          <Button asChild>
            <Link to="/migrations">
              {t("마이그레이션 계속")}
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        ) : (
          <Button disabled>{t("마이그레이션 계속")}</Button>
        )}
      </div>
      <p className="security-scope-note">
        {t(
          "선택한 정책과 두 버킷의 직접 권한만 비교합니다. 상위 권한·전체 IAM·DB·Redis 보안 검사는 포함하지 않습니다.",
        )}
      </p>
    </div>
  );
}
