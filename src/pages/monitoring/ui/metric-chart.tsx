import { useId } from "react";
import { t, localeTag } from "@/shared/lib/i18n";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import type { Series } from "../api/monitoring";
import { difference, niceMaximum, seriesPath } from "../model/monitoring";

export function clockTime(at: string) {
  return new Date(at).toLocaleTimeString(localeTag(), {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
function number(value: number | null) {
  return value === null ? "—" : value.toLocaleString(localeTag(), { maximumFractionDigits: 2 });
}
export function SeriesMark({ side }: { side: "source" | "target" }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block h-0.5 w-3 shrink-0 ${side === "source" ? "bg-aws" : "bg-gcp"}`}
    />
  );
}
export function MetricChart({
  metric,
  definition,
  from,
  step,
  index,
  onIndex,
  onOpen,
  source,
  target,
  emphasis,
}: {
  metric: Series["metrics"][number];
  definition: { title: string; unit: string; compare?: boolean };
  from: string;
  step: number;
  index: number | null;
  onIndex: (index: number | null) => void;
  onOpen: (at: string) => void;
  source: string;
  target: string;
  emphasis?: "source" | "target";
}) {
  const id = useId();
  const length = metric.source.length;
  const selected = Math.min(index ?? length - 1, length - 1);
  const a = metric.source[selected] ?? null;
  const b = metric.target[selected] ?? null;
  const at = new Date(Date.parse(from) + Math.max(0, selected) * step * 1000).toISOString();
  const last = new Date(Date.parse(from) + Math.max(0, length - 1) * step * 1000).toISOString();
  const diff = definition.compare ? difference(a, b) : null;
  const maximum = niceMaximum([...metric.source, ...metric.target]);
  const hasSamples =
    metric.source.some((value) => value !== null) || metric.target.some((value) => value !== null);
  const x = (selected / Math.max(1, length - 1)) * 460;
  return (
    <Card className="gap-0 rounded-xl py-4 shadow-none">
      <CardContent className="space-y-2 px-4">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <h2 id={id} className="text-sm font-medium">
            {t(definition.title)}{" "}
            <span className="text-xs font-normal text-muted-foreground">{definition.unit}</span>
          </h2>
          <span
            className={`font-mono text-[11px] ${index === null ? "text-muted-foreground" : "text-info"}`}
          >
            {index === null ? clockTime(last) : t("{0} · 눌러서 트레이스", [clockTime(at)])}
          </span>
        </div>
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 tabular-nums">
          <span className="flex items-baseline gap-1.5">
            <SeriesMark side="source" />
            <strong className="text-2xl font-semibold">{number(a)}</strong>
            <span className="text-xs text-muted-foreground">{source}</span>
          </span>
          <span className="flex items-baseline gap-1.5">
            <SeriesMark side="target" />
            <strong className="text-2xl font-semibold">{number(b)}</strong>
            <span className="text-xs text-muted-foreground">{target}</span>
          </span>
          {diff && (
            <span
              className={`ml-auto text-xs ${diff.warning ? "text-warning" : "text-muted-foreground"}`}
            >
              {diff.ratio >= 2
                ? t("{0} {1}배", [target, diff.ratio.toFixed(1)])
                : `${target} ${diff.ratio >= 1 ? "+" : ""}${Math.round((diff.ratio - 1) * 100)}%`}
            </span>
          )}
        </div>
        <Button
          asChild
          variant="ghost"
          className="monitoring-chart relative block h-auto w-full rounded-sm p-0 hover:bg-transparent focus-visible:ring-2"
        >
          <button
            type="button"
            disabled={!hasSamples}
            aria-label={t("{0} 그래프. 화살표로 시각 선택, Enter로 트레이스 열기", [
              t(definition.title),
            ])}
            aria-describedby={`${id}-values`}
            onPointerMove={(event) => {
              if (event.pointerType !== "mouse") return;
              const rect = event.currentTarget.getBoundingClientRect();
              onIndex(
                Math.max(
                  0,
                  Math.min(
                    length - 1,
                    Math.round(((event.clientX - rect.left) / rect.width) * (length - 1)),
                  ),
                ),
              );
            }}
            onPointerLeave={(event) => {
              if (event.pointerType === "mouse") onIndex(null);
            }}
            onClick={(event) => {
              if (event.detail > 0) {
                const rect = event.currentTarget.getBoundingClientRect();
                const point = Math.max(
                  0,
                  Math.min(
                    length - 1,
                    Math.round(((event.clientX - rect.left) / rect.width) * (length - 1)),
                  ),
                );
                onOpen(new Date(Date.parse(from) + point * step * 1000).toISOString());
              } else onOpen(at);
            }}
            onKeyDown={(event) => {
              if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
              event.preventDefault();
              onIndex(
                event.key === "Home"
                  ? 0
                  : event.key === "End"
                    ? length - 1
                    : Math.max(
                        0,
                        Math.min(length - 1, selected + (event.key === "ArrowRight" ? 1 : -1)),
                      ),
              );
            }}
          >
            <svg
              viewBox="0 0 460 134"
              preserveAspectRatio="none"
              className="size-full h-36 overflow-visible"
              aria-hidden="true"
            >
              {[6, 61, 116].map((y) => (
                <line
                  key={y}
                  x1="0"
                  x2="460"
                  y1={y}
                  y2={y}
                  stroke="var(--border)"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
              <path
                d={seriesPath(metric.source, maximum)}
                fill="none"
                stroke="var(--aws)"
                strokeWidth={emphasis === "source" ? 3 : 2}
                strokeDasharray={emphasis === "target" ? "4 3" : undefined}
                vectorEffect="non-scaling-stroke"
              />
              <path
                d={seriesPath(metric.target, maximum)}
                fill="none"
                stroke="var(--gcp)"
                strokeWidth={emphasis === "target" ? 3 : 2}
                strokeDasharray={emphasis === "source" ? "4 3" : undefined}
                vectorEffect="non-scaling-stroke"
              />
              {index !== null && (
                <line
                  x1={x}
                  x2={x}
                  y1="6"
                  y2="116"
                  stroke="var(--muted-foreground)"
                  strokeDasharray="3 3"
                />
              )}
            </svg>
            {hasSamples ? (
              <>
                <span
                  aria-hidden="true"
                  className="absolute top-0 right-0 bg-card px-1 font-mono text-[10px] font-normal text-muted-foreground"
                >
                  {number(maximum)}
                </span>
                <span
                  aria-hidden="true"
                  className="absolute right-0 bottom-4 bg-card px-1 font-mono text-[10px] font-normal text-muted-foreground"
                >
                  0
                </span>
              </>
            ) : (
              <span className="absolute inset-0 flex items-center justify-center text-xs font-normal text-muted-foreground">
                {t("수집된 지표가 없습니다.")}
              </span>
            )}
          </button>
        </Button>
        <p id={`${id}-values`} className="sr-only">
          {clockTime(at)}: {source} {number(a)} {definition.unit}, {target} {number(b)}{" "}
          {definition.unit}
        </p>
        <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
          <span>{clockTime(from)}</span>
          <span>{clockTime(last)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
