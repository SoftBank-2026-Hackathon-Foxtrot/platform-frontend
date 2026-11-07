import { t, useLocale } from "@/shared/lib/i18n";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CircleCheck, CircleStop, Pause, Play, RotateCcw, ScanSearch } from "lucide-react";
import {
  type ResourceKind,
  type Workflow,
  type WorkflowCommand,
  commandWorkflow,
  workflowKeys,
} from "@/entities/migration";
import { sessionOptions } from "@/entities/session";
import { getApiErrorMessage } from "@/shared/api";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/ui/alert-dialog";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
type CommandName = WorkflowCommand;
type Rollback = {
  mode: "normal" | "failure";
  confirmTargetFailure: boolean;
};
type Intent = {
  command: CommandName;
  resource?: ResourceKind;
  rollback?: Rollback;
};
type Spec = {
  label: string;
  icon: typeof Play;
  confirm: string;
  variant: "default" | "outline" | "destructive";
};
const COMMANDS: Record<CommandName, Spec> = {
  APPROVE: {
    label: "승인하고 진행",
    icon: CircleCheck,
    variant: "default",
    confirm: "이 단계는 되돌리기 어렵습니다. 현재 단계를 승인하면 엔진이 다음 작업을 진행합니다.",
  },
  HALT: {
    label: "일시 정지",
    icon: Pause,
    variant: "outline",
    confirm: "다음 변경을 보내지 않고 멈춥니다. 이미 실행 중인 작업은 기록을 유지합니다.",
  },
  RESUME: {
    label: "재개",
    icon: Play,
    variant: "default",
    confirm: "멈춘 지점부터 다시 진행합니다. 멈춘 원인을 확인했는지 점검하십시오.",
  },
  RECONCILE: {
    label: "상태 대조",
    icon: ScanSearch,
    variant: "outline",
    confirm:
      "결과가 불명확한 작업을 실제 어댑터 상태와 대조합니다. 대조가 끝나면 재개할 수 있습니다.",
  },
  ROLLBACK_RESOURCE: {
    label: "리소스 되돌리기",
    icon: RotateCcw,
    variant: "outline",
    confirm:
      "선택한 리소스를 원본 환경으로 되돌립니다. 되돌린 뒤 계속하려면 새 마이그레이션이 필요합니다.",
  },
  ABORT: {
    label: "마이그레이션 취소",
    icon: CircleStop,
    variant: "destructive",
    confirm: "이 마이그레이션을 취소하고 원본 환경 기준으로 정리합니다. 되돌릴 수 없습니다.",
  },
};
const ORDER: CommandName[] = [
  "APPROVE",
  "RESUME",
  "HALT",
  "RECONCILE",
  "ROLLBACK_RESOURCE",
  "ABORT",
];
const RESOURCE_NAMES: Record<string, string> = {
  DATABASE: "데이터베이스",
  REDIS: "Redis",
  OBJECT_STORAGE: "객체 저장소",
};
const RESOURCES: ResourceKind[] = ["DATABASE", "REDIS", "OBJECT_STORAGE"];
type Props = {
  workflow: Workflow;
  allowedCommands: string[];
};
export function CommandPanel({ workflow, allowedCommands }: Props) {
  useLocale();
  const session = useQuery(sessionOptions());
  const queryClient = useQueryClient();
  const [intent, setIntent] = useState<
    | (Intent & {
        key: string;
      })
    | null
  >(null);
  const mutation = useMutation({
    // The session's CSRF token rides on every change through the shared API client.
    mutationFn: ({
      command,
      resource,
      rollback,
      key,
    }: Intent & {
      key: string;
    }) => commandWorkflow(workflow, command, resource, key, rollback),
    onSuccess: async () => {
      setIntent(null);
      if (session.data) {
        await queryClient.invalidateQueries({
          queryKey: workflowKeys.all(session.data.workspaceId),
        });
      }
    },
  });
  const available = ORDER.filter((name) => allowedCommands.includes(name));
  if (!available.length) {
    return <p className="text-xs text-muted-foreground">{t("실행 가능한 명령 없음")}</p>;
  }
  const send = (next: Intent) => {
    // Retrying the same failed intent keeps its key, so the backend applies it once.
    const same =
      intent &&
      mutation.isError &&
      intent.command === next.command &&
      intent.resource === next.resource &&
      intent.rollback?.mode === next.rollback?.mode;
    const key = same ? intent.key : crypto.randomUUID();
    setIntent({ ...next, key });
    mutation.mutate({ ...next, key });
  };
  return (
    <div className="space-y-1">
      <div className="flex flex-wrap gap-2">
        {available.map((name) =>
          name === "ROLLBACK_RESOURCE" ? (
            <RollbackDialog
              key={name}
              resources={RESOURCES}
              pending={mutation.isPending}
              onConfirm={(resource, mode, confirmTargetFailure) =>
                send({ command: name, resource, rollback: { mode, confirmTargetFailure } })
              }
            />
          ) : (
            <ConfirmButton
              key={name}
              spec={COMMANDS[name]}
              pending={mutation.isPending}
              onConfirm={() => send({ command: name })}
            />
          ),
        )}
      </div>
      {mutation.isPending && (
        <p role="status" className="text-sm text-muted-foreground">
          {t("명령을 보내는 중입니다.")}
        </p>
      )}
      {mutation.error && (
        <Alert variant="destructive">
          <AlertTitle>{t("명령이 거절됐습니다")}</AlertTitle>
          <AlertDescription>{getApiErrorMessage(mutation.error)}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
function ConfirmButton({
  spec,
  pending,
  onConfirm,
}: {
  spec: Spec;
  pending: boolean;
  onConfirm: () => void;
}) {
  useLocale();
  const Icon = spec.icon;
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant={spec.variant} disabled={pending}>
          <Icon />
          {t(spec.label)}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t(spec.label)}</AlertDialogTitle>
          <AlertDialogDescription>{t(spec.confirm)}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("닫기")}</AlertDialogCancel>
          <AlertDialogAction
            variant={spec.variant === "destructive" ? "destructive" : "default"}
            onClick={onConfirm}
          >
            {t(spec.label)}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
function RollbackDialog({
  resources,
  pending,
  onConfirm,
}: {
  resources: ResourceKind[];
  pending: boolean;
  onConfirm: (
    resource: ResourceKind,
    mode: "normal" | "failure",
    confirmTargetFailure: boolean,
  ) => void;
}) {
  useLocale();
  const spec = COMMANDS.ROLLBACK_RESOURCE;
  const [resource, setResource] = useState<ResourceKind | "">("");
  const [mode, setMode] = useState<"normal" | "failure">("normal");
  const [confirmed, setConfirmed] = useState(false);
  const failure = mode === "failure";
  const ready = resource !== "" && (!failure || confirmed);
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant={spec.variant} disabled={pending}>
          <RotateCcw />
          {t(spec.label)}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t(spec.label)}</AlertDialogTitle>
          <AlertDialogDescription>{t(spec.confirm)}</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rollback-resource">{t("리소스")}</Label>
            <Select
              value={resource}
              onValueChange={(next) => {
                const kind = RESOURCES.find((item) => item === next) ?? "";
                setResource(kind);
                if (kind !== "REDIS") setMode("normal");
              }}
            >
              <SelectTrigger id="rollback-resource" className="w-full">
                <SelectValue placeholder={t("되돌릴 리소스를 고르십시오")} />
              </SelectTrigger>
              <SelectContent>
                {resources.map((kind) => (
                  <SelectItem key={kind} value={kind}>
                    {t(RESOURCE_NAMES[kind] ?? kind)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {resource === "REDIS" && (
            <div className="space-y-2">
              <Label htmlFor="rollback-mode">{t("방식")}</Label>
              <Select
                value={mode}
                onValueChange={(next) => setMode(next === "failure" ? "failure" : "normal")}
              >
                <SelectTrigger id="rollback-mode" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">{t("정상 되돌리기 (역방향 동기화)")}</SelectItem>
                  <SelectItem value="failure">
                    {t("대상 장애 되돌리기 (데이터 유실 가능)")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          {failure && (
            <div className="flex items-start gap-2">
              <Checkbox
                id="rollback-confirm"
                checked={confirmed}
                onCheckedChange={(next) => setConfirmed(next === true)}
              />
              <Label htmlFor="rollback-confirm" className="leading-snug">
                {t(
                  "대상 Redis 장애를 확인했고, 동기화되지 않은 쓰기가 유실될 수 있음을 이해합니다.",
                )}
              </Label>
            </div>
          )}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("닫기")}</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={!ready}
            onClick={() => resource && onConfirm(resource, mode, failure && confirmed)}
          >
            {t("되돌리기 요청")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
