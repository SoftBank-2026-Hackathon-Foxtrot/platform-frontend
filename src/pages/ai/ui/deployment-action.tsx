import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, LoaderCircle, Rocket } from "lucide-react";
import { useSession } from "@/entities/session";
import { getApiErrorMessage } from "@/shared/api";
import { isDemoMode } from "@/shared/config";
import { t } from "@/shared/lib/i18n";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import {
  deployRecommendation,
  deploymentEnvironmentOptions,
  deploymentJobOptions,
  deploymentOptions,
  type Recommendation,
} from "../api/ai";
import { useAiMutation } from "../model/mutation";

export function DeploymentAction({ result }: { result: Recommendation }) {
  const { workspaceId } = useSession();
  const queryClient = useQueryClient();
  const mutation = useAiMutation(deployRecommendation, () => {
    void queryClient.invalidateQueries({ queryKey: deploymentOptions(workspaceId, true).queryKey });
  });
  const accepted = mutation.data;
  const job = useQuery(deploymentJobOptions(workspaceId, accepted?.jobId ?? ""));
  const jobFailed = job.data?.status === "FAILED" || job.data?.status === "NEEDS_RECONCILIATION";
  const environment = useQuery(
    deploymentEnvironmentOptions(workspaceId, accepted?.environmentId ?? "", !jobFailed),
  );
  const current = environment.data;
  const completed = job.data?.status === "SUCCEEDED" && current?.status === "READY";
  const environmentFailed =
    current && ["FAILED", "APP_NOT_READY", "NEEDS_RECONCILIATION"].includes(current.status);
  const appUnconfirmed =
    job.data?.status === "SUCCEEDED" &&
    current?.status === "INFRA_READY" &&
    ["UNKNOWN", "NOT_CONFIGURED", "FAILED"].includes(
      current.readiness?.application.status ?? "UNKNOWN",
    );
  const error = mutation.error ?? job.error ?? environment.error;
  const failure = jobFailed || environmentFailed;
  const running = accepted && !completed && !failure && !appUnconfirmed && !error;
  const message = completed
    ? isDemoMode
      ? "데모 배포가 완료됐습니다. 실제 클라우드 리소스는 변경하지 않았습니다."
      : "배포가 완료됐고 앱의 정상 응답을 확인했습니다."
    : failure
      ? "배포를 완료하지 못했습니다. 작업 상태를 확인하세요."
      : appUnconfirmed
        ? "사양 적용은 끝났지만 앱의 정상 응답은 확인하지 못했습니다."
        : accepted
          ? "배포 요청을 접수했습니다. 사양 적용과 앱 응답을 확인하고 있습니다."
          : "";
  const failureReason = job.data?.error ?? current?.error ?? current?.readiness?.application.reason;
  return (
    <div className="space-y-3 rounded-lg border p-4">
      <Button
        className="w-full"
        disabled={mutation.isPending || Boolean(accepted)}
        onClick={() => mutation.submit(result)}
      >
        {mutation.isPending || running ? (
          <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" />
        ) : completed ? (
          <Check className="size-4" />
        ) : (
          <Rocket className="size-4" />
        )}
        {t(
          mutation.isPending
            ? "배포 접수 중…"
            : completed
              ? "배포 완료"
              : running
                ? "배포 진행 중…"
                : accepted
                  ? "배포 요청 접수됨"
                  : "배포 진행하기",
        )}
      </Button>
      {accepted && (
        <div className="space-y-2 text-xs">
          <p role="status" aria-live="polite">
            {t(message)}
          </p>
          {failureReason && <p className="text-destructive">{failureReason}</p>}
          {(failure || appUnconfirmed || error) && (
            <Button
              variant="outline"
              size="sm"
              disabled={job.isFetching || environment.isFetching}
              onClick={() => {
                void job.refetch();
                void environment.refetch();
              }}
            >
              {t("상태 다시 확인")}
            </Button>
          )}
        </div>
      )}
      {error && (
        <Alert variant="destructive">
          <AlertTitle>{t(accepted ? "배포 상태 조회 실패" : "배포 요청 실패")}</AlertTitle>
          <AlertDescription>{getApiErrorMessage(error)}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
