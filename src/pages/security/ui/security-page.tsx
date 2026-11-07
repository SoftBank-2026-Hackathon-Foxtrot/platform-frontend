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
  idle: "버킷 권한 비교",
  scanning: "권한 조회 중",
  gap: "버킷 권한 차이 발견",
  unknown: "일부 권한 미확인",
  matched: "검사 항목 일치",
  plan: "추가 권한 변경안",
  applying: "GCP에 적용 중",
  applied: "적용 완료 · 재검사 필요",
  verifying: "권한·앱 상태 재검사 중",
  verified: "재검사 완료",
  error: "처리 결과 확인 필요",
};
function nextAction(review: Review): { action: Action; label: string } {
  if (review.readOnly) return { action: "scan", label: "권한 조회" };
  if (review.phase === "gap" && review.appReady) return { action: "plan", label: "변경안 확인" };
  if (review.phase === "plan") return { action: "apply", label: "변경안 보기" };
  if (["applied", "matched", "verified"].includes(review.phase))
    return { action: "verify", label: "재검사" };
  return { action: "scan", label: "권한 조회" };
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
              {query.error ? getApiErrorMessage(query.error) : t("비교 결과 불러오는 중…")}
            </p>
            {query.error && (
              <Button variant="outline" onClick={() => void query.refetch()}>
                {t("다시 조회")}
              </Button>
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
          {review.readOnly && <Badge variant="outline">{t("조회 전용")}</Badge>}
          {review.mode === "fixture" && <p>{t("실제 클라우드 변경 없음")}</p>}
        </div>
        <Button variant="ghost" size="sm" disabled={busy} onClick={() => run("scan")}>
          <RefreshCw aria-hidden="true" />
          {t("다시 조회")}
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
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs tabular-nums text-muted-foreground">
              <span>
                {t("일치 {0}/{1}건", [review.checks.filter((c) => c.status === "pass").length, 3])}
              </span>
              <span>
                {t("설정 차이 {0}건", [review.checks.filter((c) => c.status === "fail").length])}
              </span>
              <span>
                {t(
                  review.appReady === null
                    ? "앱 응답 미확인"
                    : review.appReady
                      ? "앱 준비 완료"
                      : "앱 응답 확인 필요",
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
        {!review.readOnly && (
          <ol className="security-steps" aria-label={t("보안 검토 단계")}>
            {["비교", "변경안", "재검사", "완료"].map((label, index) => (
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
        )}
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
          </CardHeader>
          <CardContent className="px-5 py-1">
            {!review.events.length ? (
              <p className="py-5 text-sm text-muted-foreground">{t("검토 기록 없음")}</p>
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
      {!review.readOnly && (
        <div className="security-continue">
          <div>
            <p className="text-sm font-medium">
              {t(ready ? "재검사 완료" : "권한·앱 상태 재검사 필요")}
            </p>
          </div>
          {ready ? (
            <Button asChild>
              <Link to="/migrations">
                {t("마이그레이션 목록")}
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          ) : (
            <Button disabled>{t("마이그레이션 목록")}</Button>
          )}
        </div>
      )}
      <p className="security-scope-note">{t("검사 범위: AWS 지정 정책 · GCP 버킷 직접 권한")}</p>
    </div>
  );
}
