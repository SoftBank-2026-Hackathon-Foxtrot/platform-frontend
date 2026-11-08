import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/entities/session";
import { getApiErrorMessage } from "@/shared/api";
import { t, useLocale } from "@/shared/lib/i18n";
import { Button } from "@/shared/ui/button";
import { Card, CardHeader, CardContent } from "@/shared/ui/card";
import {
  changeRehearsal,
  rehearsalOptions,
  type AccessResults,
  type Rehearsal,
} from "../api/rehearsal";

const observationLabels = { allowed: "허용", denied: "거부", unknown: "미확인" };
const states = {
  idle: "검사 전",
  running: "검사 중",
  tested: "변경안 검토 가능",
  failed: "검증 실패",
  approved: "승인 기록 완료",
  held: "보류",
  error: "검사 실패 · 재실행 필요",
};
const scenarios: [keyof AccessResults, string][] = [
  ["receipt", "앱 · 영수증 쓰기와 읽기"],
  ["otherBucket", "앱 · 업무 외 버킷 목록"],
  ["copy", "복사 계정 · 복사와 내용 확인"],
];

function downloadPatch(report: NonNullable<Rehearsal["result"]>, rollback: boolean) {
  const first = rollback ? report.afterActions : report.beforeActions;
  const second = rollback ? report.beforeActions : report.afterActions;
  const patch = [
    { op: "test", path: "/identities/1/name", value: "app" },
    { op: "test", path: "/identities/1/actions", value: first },
    { op: "replace", path: "/identities/1/actions", value: second },
  ];
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(patch, null, 2)], { type: "application/json-patch+json" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = rollback ? "seaweedfs-rollback.patch.json" : "seaweedfs-app.patch.json";
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function RehearsalPanel() {
  const locale = useLocale();
  const workspace = useSession().workspaceId;
  const options = rehearsalOptions(workspace);
  const query = useQuery(options);
  const client = useQueryClient();
  const [now, setNow] = useState(Date.now);
  const data = query.data;
  useEffect(() => {
    if (!data?.expiresAt || data.status !== "tested") return;
    const expires = Date.parse(data.expiresAt);
    const timer = window.setTimeout(
      () => setNow(Date.now()),
      Math.max(0, expires - Date.now()) + 20,
    );
    return () => window.clearTimeout(timer);
  }, [data?.expiresAt, data?.status]);
  const mutation = useMutation({
    mutationFn: ({ action, revision }: { action: "run" | "approve" | "hold"; revision: number }) =>
      changeRehearsal(action, revision),
    retry: false,
    onSuccess: (result) => client.setQueryData(options.queryKey, result),
    onError: () => void client.invalidateQueries({ queryKey: options.queryKey }),
  });
  const busy = mutation.isPending || data?.status === "running";
  const error = query.error ?? mutation.error;
  const fresh = data?.expiresAt && Math.max(now, Date.now()) < Date.parse(data.expiresAt);
  const run = (action: "run" | "approve" | "hold") => {
    if (data && !busy && !query.error) mutation.mutate({ action, revision: data.revision });
  };
  const report = data?.result;
  return (
    <div className="security-page">
      <Card>
        <CardHeader>
          <h1 className="text-xl font-semibold">{t("온프렘 버킷 권한 시험")}</h1>
          <p className="max-w-prose text-sm text-muted-foreground">
            {t(
              "SeaweedFS에서 배포 번들의 앱 권한과 변경안을 각각 실행합니다. 시험 데이터와 계정은 격리됩니다.",
            )}
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <Button disabled={!data?.available || busy || !!query.error} onClick={() => run("run")}>
              {t(busy ? "처리 중…" : "샌드박스 시험")}
            </Button>
            <span role="status" className="text-sm">
              {t(
                busy
                  ? states.running
                  : !data
                    ? "비교 결과 불러오는 중…"
                    : !data.available
                      ? "실행기 연결 필요"
                      : states[data.status],
              )}
            </span>
          </div>
          {error && (
            <div role="alert">
              {getApiErrorMessage(error)}{" "}
              <Button variant="outline" onClick={() => void query.refetch()}>
                {t("다시 조회")}
              </Button>
            </div>
          )}
          {report && (
            <>
              <section aria-labelledby="trial-evidence">
                <h2 id="trial-evidence" className="mb-2 font-semibold">
                  {t("실행 근거")}
                </h2>
                <table className="w-full table-fixed text-left text-sm">
                  <thead>
                    <tr className="border-b">
                      <th scope="col" className="w-1/2 py-2">
                        {t("검사")}
                      </th>
                      <th scope="col">{t("기존 설정")}</th>
                      <th scope="col">{t("변경 설정")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scenarios.map(([key, label]) => (
                      <tr key={key} className="border-b">
                        <th scope="row" className="py-3 pr-2 font-medium">
                          {t(label)}
                          <code className="block break-all text-xs font-normal text-muted-foreground">
                            {key === "otherBucket" ? report.extraBucket : report.bucket}
                          </code>
                        </th>
                        <td>{t(observationLabels[report.before[key]])}</td>
                        <td
                          className={
                            report.before[key] !== report.after[key] ? "font-semibold" : undefined
                          }
                        >
                          {t(observationLabels[report.after[key]])}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
              <section className="space-y-2">
                <h2 className="font-semibold">{t("앱 계정 변경안")}</h2>
                <div className="security-diff">
                  <div>
                    <span>{t("기존 설정")}</span>
                    <code>{report.beforeActions.join(", ")}</code>
                  </div>
                  <div>
                    <span>{t("변경 설정")}</span>
                    <code>{report.afterActions.join(", ")}</code>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t(
                    report.method === "bedrock"
                      ? "Bedrock 제안 · 실행 결과로 검증"
                      : "규칙 제안 · 실행 결과로 검증",
                  )}
                </p>
                {report.attempts.length > 1 && (
                  <details>
                    <summary>{t("시험한 후보 보기")}</summary>
                    {report.attempts.map((trial, i) => (
                      <p key={i}>
                        {trial.actions.join(", ")} · {t(trial.passed ? "확인" : "검증 실패")}
                      </p>
                    ))}
                  </details>
                )}
                <p className="text-sm">
                  {t(
                    "승인하면 변경·복구 패치를 받을 수 있습니다. 온프렘 반영은 운영자가 수행합니다.",
                  )}
                </p>
                {data?.status === "tested" && data.expiresAt && (
                  <p className="text-xs text-muted-foreground">
                    {t("변경안 유효 시각 {0}", [
                      new Date(data.expiresAt).toLocaleTimeString(locale),
                    ])}
                  </p>
                )}
                {data?.status === "approved" ? (
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => downloadPatch(report, false)}>
                      {t("변경 패치 받기")}
                    </Button>
                    <Button variant="outline" onClick={() => downloadPatch(report, true)}>
                      {t("복구 패치 받기")}
                    </Button>
                  </div>
                ) : (
                  data?.status === "tested" && (
                    <div className="flex gap-2">
                      <Button
                        disabled={busy || !!query.error || !report.passed || !fresh}
                        onClick={() => run("approve")}
                      >
                        {t("설정안 승인")}
                      </Button>
                      <Button
                        variant="outline"
                        disabled={busy || !!query.error || !fresh}
                        onClick={() => run("hold")}
                      >
                        {t("보류")}
                      </Button>
                    </div>
                  )
                )}
                {data?.status === "tested" && !fresh && (
                  <p role="status">{t("변경안 만료 · 다시 시험하세요.")}</p>
                )}
              </section>
            </>
          )}
          {data && data.history.length > 0 && (
            <details>
              <summary className="cursor-pointer py-2 text-sm font-medium">
                {t("검토 기록")}
              </summary>
              <ol className="space-y-2 text-sm">
                {data.history.map((entry, i) => (
                  <li key={i}>
                    {t(
                      entry.action === "approve"
                        ? states.approved
                        : entry.action === "hold"
                          ? states.held
                          : states[entry.action],
                    )}{" "}
                    · {entry.actor} ·{" "}
                    <time dateTime={entry.at}>{new Date(entry.at).toLocaleString(locale)}</time>
                  </li>
                ))}
              </ol>
            </details>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
