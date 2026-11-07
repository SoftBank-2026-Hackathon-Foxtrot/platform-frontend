import { useId } from "react";
import { t, localeTag } from "@/shared/lib/i18n";
import { Card, CardContent } from "@/shared/ui/card";
import type { Series } from "../api/system";
import { chartPath, titles } from "../model/system";
export function number(value: number | null) {
  return value === null ? "—" : value.toLocaleString(localeTag(), { maximumFractionDigits: 2 });
}
export function time(at: number) {
  return new Date(at * 1000).toLocaleTimeString(localeTag(), {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
export function BackendState({ state }: { state: string }) {
  return (
    <p role="status" className="py-8 text-sm text-muted-foreground">
      {t(state === "NOT_CONFIGURED" ? "수집 서버 미연결" : "수집 서버 조회 실패")}
    </p>
  );
}
export function MetricPanel({
  metric,
  range,
}: {
  metric: Series["series"][number];
  range: Omit<Series, "series">;
}) {
  const id = useId(),
    title = t(titles[metric.id] ?? metric.id);
  const values = metric.points.map((p) => p[1]).filter((v): v is number => v !== null);
  const largest = Math.max(0, ...values);
  const scale =
    metric.unit === "%"
      ? 1
      : largest >= 1073741824
        ? 1073741824
        : largest >= 1048576
          ? 1048576
          : largest >= 1024
            ? 1024
            : 1;
  const unit =
    metric.unit === "%"
      ? "%"
      : (scale === 1073741824 ? "GiB" : scale === 1048576 ? "MiB" : scale === 1024 ? "KiB" : "B") +
        (metric.unit.endsWith("/s") ? "/s" : "");
  const max = metric.unit === "%" ? 100 : Math.max(scale, largest * 1.1);
  const last = metric.points.at(-1)?.[1] ?? null;
  return (
    <Card className="gap-0 py-4 shadow-none">
      <CardContent className="space-y-3 px-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 id={id} className="text-sm font-medium">
            {title}
          </h3>
          <p className="text-xl tabular-nums">
            {number(last === null ? null : last / scale)}{" "}
            <span className="text-xs text-muted-foreground">{unit}</span>
          </p>
        </div>
        {metric.state !== "OK" ? (
          <BackendState state={metric.state} />
        ) : values.length === 0 ? (
          <p className="grid h-44 place-items-center text-sm text-muted-foreground">
            {t("표본 없음")}
          </p>
        ) : (
          <>
            <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-2 gap-y-2 pt-2">
              <div
                aria-hidden
                className="relative min-w-10 text-right text-xs tabular-nums text-muted-foreground"
              >
                {[1, 0.5, 0].map((n) => (
                  <span
                    key={n}
                    className="absolute right-0 -translate-y-1/2"
                    style={{ top: `${(1 - n) * 100}%` }}
                  >
                    {number((n * max) / scale)}
                  </span>
                ))}
              </div>
              <svg
                viewBox="50 25 390 125"
                preserveAspectRatio="none"
                role="img"
                aria-labelledby={id}
                className="h-36 w-full overflow-visible text-foreground"
              >
                <desc>{t("시간별 측정값. 아래 표에서 확인할 수 있습니다.")}</desc>
                {[0, 0.5, 1].map((n) => (
                  <line
                    key={n}
                    x1="50"
                    x2="440"
                    y1={150 - n * 125}
                    y2={150 - n * 125}
                    className="stroke-border"
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
                <path
                  d={chartPath(metric.points, range.from, range.to, max, range.step)}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
              <div className="col-start-2 flex justify-between gap-2 text-xs tabular-nums text-muted-foreground">
                <span>{time(range.from)}</span>
                <span>{time(range.to)}</span>
              </div>
            </div>
            <details className="text-xs">
              <summary className="cursor-pointer rounded py-1 text-muted-foreground focus-visible:outline-2 focus-visible:outline-ring">
                {t("측정값 보기")}
              </summary>
              <div className="max-h-48 overflow-auto">
                <table className="w-full text-left tabular-nums">
                  <caption className="sr-only">{title}</caption>
                  <thead>
                    <tr>
                      <th className="py-2">{t("시각")}</th>
                      <th>{unit}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metric.points.map(([at, value]) => (
                      <tr key={at} className="border-t [content-visibility:auto]">
                        <td className="py-1">{time(at)}</td>
                        <td>{number(value === null ? null : value / scale)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          </>
        )}
      </CardContent>
    </Card>
  );
}
