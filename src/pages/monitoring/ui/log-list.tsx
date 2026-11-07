import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { t } from "@/shared/lib/i18n";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/shared/ui/toggle-group";
import type { Log } from "../api/monitoring";
import { clockTime, SeriesMark } from "./metric-chart";
import { Empty } from "./query-notice";

export function LogList({
  logs,
  q,
  traceId,
  onSearch,
  onTrace,
  source,
  target,
}: {
  logs: Log[];
  q: string;
  traceId?: string;
  onSearch: (value: string) => void;
  onTrace: (log: Log) => void;
  source: string;
  target: string;
}) {
  const [level, setLevel] = useState("all");
  const rows = logs.filter(
    (log) =>
      (level === "all" || log.level === level) &&
      (!traceId || log.traceId === traceId) &&
      `${log.message} ${log.traceId ?? ""}`.toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ToggleGroup
          type="single"
          value={level}
          onValueChange={(value) => {
            if (value) setLevel(value);
          }}
          size="sm"
          variant="outline"
          aria-label={t("로그 수준")}
        >
          {["all", "ERROR", "WARN"].map((value) => (
            <ToggleGroupItem key={value} value={value}>
              {value === "all" ? t("전체") : value}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <div className="w-full sm:w-72">
          <Label htmlFor="monitoring-log-search" className="sr-only">
            {t("메시지 · trace id 검색")}
          </Label>
          <Input
            id="monitoring-log-search"
            type="search"
            name="monitoring-log-query"
            spellCheck={false}
            value={q}
            placeholder={t("메시지 · trace id 검색")}
            onChange={(event) => onSearch(event.target.value)}
            className="font-mono text-xs"
          />
        </div>
      </div>
      {rows.length === 0 ? (
        <Empty>{t("조건에 맞는 로그가 없습니다.")}</Empty>
      ) : (
        <Table className="w-full table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">{t("시각")}</TableHead>
              <TableHead className="w-16">{t("수준")}</TableHead>
              <TableHead className="hidden w-36 lg:table-cell">{t("서비스")}</TableHead>
              <TableHead>{t("메시지")}</TableHead>
              <TableHead className="w-10 sm:w-24">
                <span className="sr-only">{t("트레이스")}</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((log) => (
              <TableRow
                key={log.id}
                data-state={traceId && log.traceId === traceId ? "selected" : undefined}
              >
                <TableCell className="align-top font-mono text-xs">{clockTime(log.at)}</TableCell>
                <TableCell
                  className={`align-top font-mono text-xs ${log.level === "ERROR" ? "text-destructive" : log.level === "WARN" ? "text-warning" : "text-muted-foreground"}`}
                >
                  {log.level}
                </TableCell>
                <TableCell className="hidden align-top lg:table-cell">
                  <span className="flex items-start gap-2 text-xs whitespace-normal">
                    <SeriesMark side={log.side} />
                    <span className="break-all">
                      {log.service}
                      <span className="block text-muted-foreground">
                        {log.side === "source"
                          ? source
                          : log.side === "target"
                            ? target
                            : t("공통")}
                      </span>
                    </span>
                  </span>
                </TableCell>
                <TableCell className="align-top font-mono text-xs whitespace-normal">
                  <span className="mb-1 block break-all text-muted-foreground lg:hidden">
                    {log.service} ·{" "}
                    {log.side === "source" ? source : log.side === "target" ? target : t("공통")}
                  </span>
                  <span className="break-all">{log.message}</span>
                </TableCell>
                <TableCell className="p-1 align-top">
                  {log.traceId && (
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => onTrace(log)}
                      aria-label={t("트레이스 {0} 열기", [log.traceId])}
                    >
                      <span className="hidden sm:inline">{t("트레이스")}</span>
                      <ArrowRight />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
