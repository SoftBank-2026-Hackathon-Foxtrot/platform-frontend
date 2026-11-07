import { CircleAlert, CircleHelp, Check, X } from "lucide-react";
import { t, useLocale } from "@/shared/lib/i18n";
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
import type { Review } from "../api/review";
import type { SecurityResource } from "../model/resources";
import { ResourceIcon, ResourceStatus } from "./resource-map";
export function ResourceDetail({
  resource,
  review,
  busy,
  onApply,
}: {
  resource: SecurityResource;
  review: Review;
  busy: boolean;
  onApply: () => void;
}) {
  const locale = useLocale();
  return (
    <Card
      id="security-resource-detail"
      className="security-detail gap-0 self-start overflow-hidden py-0"
      aria-labelledby="security-detail-title"
    >
      <CardHeader className="gap-3 border-b p-5">
        <div className="flex items-center gap-3">
          <ResourceIcon resource={resource} />
          <CardTitle className="min-w-0 flex-1 text-base font-semibold">
            <h2 id="security-detail-title" tabIndex={-1} className="scroll-mt-20 outline-offset-4">
              {t(resource.name)}
            </h2>
          </CardTitle>
          <ResourceStatus resource={resource} review={review} />
        </div>
        {resource.id === "object" && (
          <div className="space-y-1 text-xs">
            <span className="text-muted-foreground">{t("GCP 앱 계정")}</span>
            <code className="block break-all">
              {review.target.principal.replace("serviceAccount:", "")}
            </code>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-5 p-5">
        {resource.id !== "object" ? (
          <div className="security-empty">
            <CircleHelp aria-hidden="true" />
            <p>
              {t(resource.id === "app" ? "준비 상태 응답만 확인합니다." : "검사 대상이 아닙니다.")}
            </p>
            {resource.id === "app" && (
              <p>
                {t(
                  review.appReady === null
                    ? "앱 응답 미확인"
                    : review.appReady
                      ? "앱 준비 완료"
                      : "앱 응답 확인 필요",
                )}
              </p>
            )}
          </div>
        ) : (
          <>
            {review.plan && (
              <section className="security-plan" aria-labelledby="security-plan-title">
                <h3
                  id="security-plan-title"
                  tabIndex={-1}
                  className="mb-3 scroll-mt-20 text-sm font-medium outline-offset-4"
                >
                  {t("GCP 권한 변경안")}
                </h3>
                <div className="security-diff">
                  <div>
                    <span>{t("제거")}</span>
                    <code>
                      {review.plan.bucket}
                      <br />
                      {review.plan.removeRoles.join(", ")}
                    </code>
                  </div>
                  <div>
                    <span>{t("유지")}</span>
                    <code>
                      {review.plan.retainBucket}
                      <br />
                      roles/storage.objectUser
                    </code>
                  </div>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  {t("이 계정의 추가 버킷 권한만 제거합니다.")}
                </p>
                <Button className="mt-4 w-full" disabled={busy} onClick={onApply}>
                  {t("GCP에 적용")}
                </Button>
              </section>
            )}
            {!review.checks.length ? (
              <div className="security-empty">
                <CircleHelp aria-hidden="true" />
                <p>{t("아직 조회하지 않았습니다.")}</p>
              </div>
            ) : (
              <ul className="security-checks">
                {review.checks.map((check) => {
                  const Icon =
                    check.status === "pass"
                      ? Check
                      : check.status === "fail"
                        ? CircleAlert
                        : CircleHelp;
                  return (
                    <li
                      key={check.id}
                      className={`security-check ${check.status === "fail" ? "is-gap" : ""}`}
                    >
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-sm font-medium">{t(check.title)}</h3>
                        <span
                          className={`security-status ${check.status === "fail" ? "is-gap" : check.status === "pass" ? "is-pass" : ""}`}
                        >
                          <Icon size={12} aria-hidden="true" />
                          {t(
                            check.status === "pass"
                              ? "확인"
                              : check.status === "fail"
                                ? "설정 차이"
                                : "미확인",
                          )}
                        </span>
                      </div>
                      <dl className="security-comparison">
                        <div>
                          <dt>{t("기준")}</dt>
                          <dd className="break-words">{t(check.source)}</dd>
                        </div>
                        <div>
                          <dt>{t("결과")}</dt>
                          <dd className="break-words">{t(check.target)}</dd>
                        </div>
                      </dl>
                    </li>
                  );
                })}
              </ul>
            )}
            {!!review.checks.length && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-full">
                    {t("검사 근거 보기")}
                  </Button>
                </SheetTrigger>
                <SheetContent
                  className="security-evidence-sheet overflow-y-auto overscroll-contain data-[side=right]:w-full data-[side=right]:sm:max-w-lg"
                  showCloseButton={false}
                >
                  <SheetHeader className="pr-12">
                    <SheetTitle>{t("검사 근거")}</SheetTitle>
                    <SheetDescription>{t("AWS 인라인 정책 · GCP 버킷 IAM")}</SheetDescription>
                  </SheetHeader>
                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2 size-11"
                      aria-label={t("닫기")}
                    >
                      <X aria-hidden="true" />
                    </Button>
                  </SheetClose>
                  <div className="space-y-5 px-4 pb-8">
                    {review.collectedAt && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(review.collectedAt).toLocaleString(locale)}
                      </p>
                    )}
                    {review.checks.map((check) => (
                      <section key={check.id}>
                        <h3 className="mb-2 text-sm font-medium">{t(check.title)}</h3>
                        <code className="block [overflow-wrap:anywhere] rounded-md bg-muted p-3 text-xs">
                          {check.evidence}
                        </code>
                      </section>
                    ))}
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {t("검사 제외: 상속 권한 · 다른 정책 · 객체 ACL")}
                    </p>
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
