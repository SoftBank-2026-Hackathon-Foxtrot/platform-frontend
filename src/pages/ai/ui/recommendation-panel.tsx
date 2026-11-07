import { useState } from "react";
import { Copy, LoaderCircle, SlidersHorizontal } from "lucide-react";
import { t } from "@/shared/lib/i18n";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { recommend, type Deployment, type Recommendation } from "../api/ai";
import { useAiMutation } from "../model/mutation";
import { ErrorNotice, ResultStatus, Warnings } from "./result";

export function RecommendationPanel({
  deployment,
  enabled,
}: {
  deployment: Deployment;
  enabled: boolean;
}) {
  const [target, setTarget] = useState<"aws" | "gcp">(
    deployment.environment === "aws" ? "gcp" : "aws",
  );
  const mutation = useAiMutation(recommend);
  const supportedSource = deployment.environment === "aws" || deployment.environment === "gcp";
  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SlidersHorizontal className="size-4" />
          {t("사양 추천")}
        </CardTitle>
        <CardDescription>
          {t("최근 1시간의 CPU·메모리 사용량으로 대상 사양을 추천합니다.")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div role="group" aria-label={t("추천 대상 클라우드")} className="flex gap-1">
            {(["aws", "gcp"] as const).map((cloud) => (
              <Button
                key={cloud}
                variant={target === cloud ? "secondary" : "ghost"}
                size="sm"
                aria-pressed={target === cloud}
                disabled={mutation.isPending}
                onClick={() => setTarget(cloud)}
              >
                {cloud.toUpperCase()}
              </Button>
            ))}
          </div>
          <Button
            disabled={!enabled || !supportedSource || mutation.isPending}
            onClick={() =>
              mutation.submit({
                applicationId: deployment.applicationId,
                sourceDeploymentId: deployment.environmentId,
                targetEnvironment: target,
              })
            }
          >
            {mutation.isPending && (
              <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" />
            )}
            {t(mutation.isPending ? "추천 생성 중…" : "추천 받기")}
          </Button>
        </div>
        {!supportedSource && (
          <p className="text-sm text-muted-foreground">
            {t("온프렘 사용량 기반 사양 추천은 아직 지원하지 않습니다.")}
          </p>
        )}
        <ErrorNotice error={mutation.error} />
        {mutation.data ? (
          <RecommendationResult key={mutation.data.recommendationId} result={mutation.data} />
        ) : (
          <p className="py-4 text-sm text-muted-foreground">
            {t("추천 결과를 확인한 뒤 별도로 배포할 수 있습니다.")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
function RecommendationResult({ result }: { result: Recommendation }) {
  const [copyState, setCopyState] = useState("");
  const request = result.iac
    ? JSON.stringify(
        { method: "POST", endpoint: result.iac.endpoint, body: result.iac.body },
        null,
        2,
      )
    : "";
  return (
    <div className="space-y-4" aria-live="polite">
      <div className="flex flex-wrap items-center gap-2">
        <ResultStatus status={result.status} />
        <span className="text-xs font-medium">{result.targetEnvironment.toUpperCase()}</span>
      </div>
      {result.status === "COMPLETED" ? (
        <>
          {result.appProposal && (
            <dl className="space-y-3 rounded-lg border p-4">
              {Object.entries(result.appProposal.parameters).map(([key, value]) => (
                <div key={key}>
                  <dt className="text-xs text-muted-foreground">
                    {key === "cpu" ? "CPU" : t("메모리")}
                  </dt>
                  <dd className="mt-1 font-mono text-lg">
                    {String(value)} {key === "memory_mib" ? "MiB" : t("코어")}
                  </dd>
                  {result.appProposal?.rationale[key] && (
                    <dd className="mt-1 text-xs text-muted-foreground">
                      {result.appProposal.rationale[key]}
                    </dd>
                  )}
                </div>
              ))}
            </dl>
          )}
          {result.proposal && Object.keys(result.proposal.parameters).length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">{t("인프라 변경안")}</p>
              <dl className="space-y-2">
                {Object.entries(result.proposal.parameters).map(([key, value]) => (
                  <div key={key} className="text-sm">
                    <dt className="font-mono">
                      {key}: {String(value)}
                    </dt>
                    <dd className="text-xs text-muted-foreground">
                      {result.proposal?.rationale[key]}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
          {result.iac && (
            <details className="rounded-lg border px-4 py-3 text-sm">
              <summary className="cursor-pointer font-medium">{t("배포 요청 보기")}</summary>
              <p className="mt-3 text-xs text-muted-foreground">
                {t("추천만 생성했습니다. 실제 배포는 실행하지 않았습니다.")}
              </p>
              <pre className="my-3 max-h-80 overflow-auto rounded-md bg-muted p-3 text-xs">
                {request}
              </pre>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  void navigator.clipboard.writeText(request).then(
                    () => setCopyState(t("복사 완료")),
                    () => setCopyState(t("복사하지 못했습니다.")),
                  );
                }}
              >
                <Copy className="size-3.5" />
                {t("요청 복사")}
              </Button>
              <span role="status" className="ml-2 text-xs text-muted-foreground">
                {copyState}
              </span>
            </details>
          )}
        </>
      ) : (
        <p className="text-sm">
          {t(
            result.status === "INSUFFICIENT_DATA"
              ? "CPU·메모리 지표와 관측 시간이 충분하지 않아 추천을 만들지 않았습니다."
              : "현재 허용 사양으로 관측 사용량을 수용할 수 없습니다.",
          )}
        </p>
      )}
      <Warnings values={result.warnings} />
    </div>
  );
}
