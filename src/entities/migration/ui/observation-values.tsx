import { t, useLocale, localeTag } from "@/shared/lib/i18n";
import { Badge } from "@/shared/ui/badge";
export function value(input: string | number | boolean | null | undefined): string {
  if (input == null || input === "") return t("미확인");
  if (typeof input === "boolean") return input ? t("예") : t("아니오");
  return String(input);
}
export function when(input: string | null | undefined): string {
  return input ? new Date(input).toLocaleString(localeTag(), { hour12: false }) : t("미확인");
}
export function State({ state }: { state: string | null | undefined }) {
  useLocale();
  const labels: Record<string, string> = {
    FRESH: t("최신"),
    STALE: t("오래된 측정"),
    UNAVAILABLE: t("수집 실패"),
    UNKNOWN: t("미확인"),
  };
  return (
    <Badge
      variant={
        state === "UNAVAILABLE" || state === "FAIL" || state === "FAILED"
          ? "destructive"
          : "outline"
      }
    >
      {labels[state ?? ""] ?? value(state)}
    </Badge>
  );
}
export function Metric({ label, children }: { label: string; children: React.ReactNode }) {
  useLocale();
  return (
    <div className="flex items-start justify-between gap-5 py-1.5">
      <dt className="min-w-0 text-muted-foreground">{t(label)}</dt>
      <dd className="min-w-0 text-right break-all tabular-nums">{children}</dd>
    </div>
  );
}
