import { getApiErrorMessage } from "@/shared/api";
import { t } from "@/shared/lib/i18n";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";

export function QueryNotice({
  query,
  subject,
}: {
  query: { isPending: boolean; error: Error | null; data: unknown; refetch: () => unknown };
  subject: string;
}) {
  if (query.error)
    return (
      <Alert variant="destructive">
        <AlertTitle>{t("{0} 조회 실패", [subject])}</AlertTitle>
        <AlertDescription>
          {getApiErrorMessage(query.error)}
          {query.data != null && <p>{t(" 이전 값 표시 중 · 최신 상태 미확인")}</p>}
          <Button variant="outline" onClick={() => void query.refetch()}>
            {t("다시 조회")}
          </Button>
        </AlertDescription>
      </Alert>
    );
  if (query.isPending)
    return (
      <div role="status" className="space-y-3 py-4">
        <span className="sr-only">{t("{0} 불러오는 중", [subject])}</span>
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-36 w-full" />
      </div>
    );
  if (
    query.data &&
    typeof query.data === "object" &&
    "state" in query.data &&
    query.data.state !== "OK"
  )
    return (
      <Alert>
        <AlertTitle>
          {t(query.data.state === "NOT_CONFIGURED" ? "수집 미설정" : "수집 서버 연결 실패")}
        </AlertTitle>
        <AlertDescription>
          <Button variant="outline" onClick={() => void query.refetch()}>
            {t("다시 조회")}
          </Button>
        </AlertDescription>
      </Alert>
    );
  if (query.data === null)
    return (
      <Alert>
        <AlertTitle>{t("{0} 미제공", [subject])}</AlertTitle>
        <AlertDescription>{t("서버 미지원")}</AlertDescription>
      </Alert>
    );
  return null;
}
export function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p
      role="status"
      className="rounded-xl border border-dashed px-4 py-10 text-center text-sm text-muted-foreground"
    >
      {children}
    </p>
  );
}
