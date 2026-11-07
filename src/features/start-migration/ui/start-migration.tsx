import { t, useLocale } from "@/shared/lib/i18n";
import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Rocket } from "lucide-react";
import { createWorkflow, workflowKeys, type CreateWorkflowInput } from "@/entities/migration";
import { sessionOptions } from "@/entities/session";
import { getApiErrorDetail, getApiErrorMessage } from "@/shared/api";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { readConfiguration, sizingOptions } from "../api/sizing";
import { TargetSizing } from "./target-sizing";
type Props = {
  /** Registered applications are named; the release backend's seed application is not. */
  applicationId?: string;
  environments: string[];
  /** A registered application's catalog allows exactly one direction. */
  direction?: [string, string];
  disabledReason?: string;
};
export function StartMigration({ applicationId, environments, direction, disabledReason }: Props) {
  useLocale();
  const session = useQuery(sessionOptions());
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [source, setSource] = useState(direction?.[0] ?? environments[0] ?? "");
  const [target, setTarget] = useState(direction?.[1] ?? environments[1] ?? "");
  const [editingTarget, setEditingTarget] = useState(false);
  const [formError, setFormError] = useState(false);
  const submission = useRef<{ body: string; key: string } | null>(null);
  const sizing = useQuery(
    sizingOptions(
      session.data?.workspaceId ?? "pending",
      target,
      editingTarget && Boolean(session.data && target && target !== source),
    ),
  );
  const editable =
    sizing.data?.supported &&
    sizing.data.deployment &&
    sizing.data.targetEnv === target &&
    (!applicationId || applicationId === sizing.data.applicationId);
  const create = useMutation({
    mutationFn: ({ input, key }: { input: CreateWorkflowInput; key: string }) =>
      createWorkflow(input, key),
    retry: false,
    onSuccess: async (detail) => {
      submission.current = null;
      if (session.data) {
        await queryClient.invalidateQueries({
          queryKey: workflowKeys.all(session.data.workspaceId),
        });
      }
      await navigate({ to: "/migrations/$id", params: { id: detail.workflow.id } });
    },
  });
  const pick = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    // A different plan is a different request.
    submission.current = null;
    setFormError(false);
    create.reset();
  };
  const same = source !== "" && source === target;
  const active = create.error ? getApiErrorDetail(create.error) : null;
  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        setFormError(false);
        let input: CreateWorkflowInput;
        try {
          input = {
            applicationId,
            sourceEnv: source,
            targetEnv: target,
            ...(editingTarget && editable && sizing.data
              ? {
                  targetConfiguration: readConfiguration(
                    sizing.data,
                    new FormData(event.currentTarget),
                  ),
                }
              : {}),
          };
          if (editingTarget && !editable) throw new Error("TARGET_SIZING_UNAVAILABLE");
        } catch {
          setFormError(true);
          return;
        }
        const body = JSON.stringify(input);
        if (!submission.current || submission.current.body !== body)
          submission.current = { body, key: crypto.randomUUID() };
        create.mutate({ input, key: submission.current.key });
      }}
    >
      <div className="flex flex-wrap items-end gap-3">
        <EnvSelect
          label={t("원본")}
          names={environments}
          value={source}
          onChange={pick(setSource)}
          locked={Boolean(direction) || create.isPending}
        />
        <ArrowRight className="mb-2.5 size-4 text-muted-foreground" />
        <EnvSelect
          label={t("대상")}
          names={environments}
          value={target}
          onChange={pick(setTarget)}
          locked={Boolean(direction) || create.isPending}
        />
        <Button
          type="submit"
          disabled={
            create.isPending ||
            same ||
            !source ||
            !target ||
            Boolean(disabledReason) ||
            (editingTarget && (!editable || Boolean(sizing.error)))
          }
        >
          <Rocket />
          {create.isPending ? t("계획을 만드는 중") : t("마이그레이션 계획 만들기")}
        </Button>
      </div>
      <div role="group" aria-label={t("대상 사양 설정")} className="flex flex-wrap gap-1">
        <Button
          type="button"
          variant={!editingTarget ? "secondary" : "outline"}
          size="sm"
          aria-pressed={!editingTarget}
          disabled={create.isPending}
          onClick={() => {
            setEditingTarget(false);
            create.reset();
            setFormError(false);
          }}
        >
          {t("현재 사양 유지")}
        </Button>
        <Button
          type="button"
          variant={editingTarget ? "secondary" : "outline"}
          size="sm"
          aria-pressed={editingTarget}
          disabled={create.isPending || same || !target}
          onClick={() => {
            setEditingTarget(true);
            create.reset();
            setFormError(false);
          }}
        >
          {t("사양 변경")}
        </Button>
      </div>
      {editingTarget && (
        <div className="space-y-2">
          {sizing.isPending && (
            <p role="status" className="text-sm text-muted-foreground">
              {t("대상 사양을 불러오는 중입니다.")}
            </p>
          )}
          {sizing.error && (
            <Alert variant="destructive">
              <AlertTitle>{t("대상 사양 조회 실패")}</AlertTitle>
              <AlertDescription>
                {getApiErrorMessage(sizing.error)}{" "}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void sizing.refetch()}
                >
                  {t("다시 조회")}
                </Button>
              </AlertDescription>
            </Alert>
          )}
          {sizing.data && !editable && (
            <Alert>
              <AlertTitle>{t("이 대상의 사양을 변경할 수 없습니다.")}</AlertTitle>
              <AlertDescription>
                {sizing.data.blockedReason ||
                  t("마이그레이션 대상과 연결된 배포 정보가 필요합니다.")}
              </AlertDescription>
            </Alert>
          )}
          {editable && sizing.data && (
            <TargetSizing
              key={`${sizing.data.deployment!.environmentId}:${sizing.data.deployment!.updatedAt}`}
              data={sizing.data}
              disabled={create.isPending}
            />
          )}
        </div>
      )}
      {formError && (
        <p role="alert" className="text-sm text-destructive">
          {t("사양 값과 선택한 대상을 확인하세요.")}
        </p>
      )}
      {disabledReason && <p className="text-sm text-muted-foreground">{disabledReason}</p>}
      {same && (
        <p className="text-sm text-destructive">{t("원본과 대상은 다른 환경이어야 합니다.")}</p>
      )}
      {create.error && (
        <Alert variant="destructive">
          <AlertTitle>{t("마이그레이션을 만들지 못했습니다")}</AlertTitle>
          <AlertDescription>
            {getApiErrorMessage(create.error)}
            {active?.code === "WORKFLOW_ACTIVE" && active.blockers[0] && (
              <Link
                to="/migrations/$id"
                params={{ id: active.blockers[0] }}
                className="underline underline-offset-4"
              >
                {t("진행 중인 마이그레이션 보기")}
              </Link>
            )}
          </AlertDescription>
        </Alert>
      )}
    </form>
  );
}
function EnvSelect({
  label,
  names,
  value,
  onChange,
  locked,
}: {
  label: string;
  names: string[];
  value: string;
  onChange: (value: string) => void;
  locked: boolean;
}) {
  useLocale();
  return (
    <div className="space-y-1.5">
      <Label>{t(label)}</Label>
      <div role="group" aria-label={t(label)} className="flex flex-wrap gap-1">
        {names.map((name) => (
          <Button
            type="button"
            size="sm"
            key={name}
            variant={value === name ? "secondary" : "outline"}
            aria-pressed={value === name}
            disabled={locked}
            onClick={() => onChange(name)}
          >
            {name}
          </Button>
        ))}
      </div>
    </div>
  );
}
