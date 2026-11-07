import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Rocket } from "lucide-react";

import { createWorkflow, workflowKeys } from "@/entities/migration";
import { sessionOptions } from "@/entities/session";
import { getApiErrorDetail, getApiErrorMessage } from "@/shared/api";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";

type Props = {
  /** Registered applications are named; the release backend's seed application is not. */
  applicationId?: string;
  environments: string[];
  /** A registered application's catalog allows exactly one direction. */
  direction?: [string, string];
  disabledReason?: string;
};

export function StartMigration({ applicationId, environments, direction, disabledReason }: Props) {
  const session = useQuery(sessionOptions());
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [source, setSource] = useState(direction?.[0] ?? environments[0] ?? "");
  const [target, setTarget] = useState(direction?.[1] ?? environments[1] ?? "");
  const [key, setKey] = useState(() => crypto.randomUUID());
  const create = useMutation({
    mutationFn: () => createWorkflow({ applicationId, sourceEnv: source, targetEnv: target }, key),
    onSuccess: async (detail) => {
      setKey(crypto.randomUUID());
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
    setKey(crypto.randomUUID());
    create.reset();
  };
  const same = source !== "" && source === target;
  const active = create.error ? getApiErrorDetail(create.error) : null;
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        <EnvSelect
          label="원본"
          names={environments}
          value={source}
          onChange={pick(setSource)}
          locked={Boolean(direction)}
        />
        <ArrowRight className="mb-2.5 size-4 text-muted-foreground" />
        <EnvSelect
          label="대상"
          names={environments}
          value={target}
          onChange={pick(setTarget)}
          locked={Boolean(direction)}
        />
        <Button
          disabled={create.isPending || same || !source || !target || Boolean(disabledReason)}
          onClick={() => create.mutate()}
        >
          <Rocket />
          {create.isPending ? "계획을 만드는 중" : "마이그레이션 계획 만들기"}
        </Button>
      </div>
      {disabledReason && <p className="text-sm text-muted-foreground">{disabledReason}</p>}
      {same && <p className="text-sm text-destructive">원본과 대상은 다른 환경이어야 합니다.</p>}
      {create.error && (
        <Alert variant="destructive">
          <AlertTitle>마이그레이션을 만들지 못했습니다</AlertTitle>
          <AlertDescription>
            {getApiErrorMessage(create.error)}
            {active?.code === "WORKFLOW_ACTIVE" && active.blockers[0] && (
              <Link
                to="/migrations/$id"
                params={{ id: active.blockers[0] }}
                className="underline underline-offset-4"
              >
                진행 중인 마이그레이션 보기
              </Link>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
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
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange} disabled={locked}>
        <SelectTrigger className="w-36" aria-label={label}>
          <SelectValue placeholder="환경" />
        </SelectTrigger>
        <SelectContent>
          {names.map((name) => (
            <SelectItem key={name} value={name}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
