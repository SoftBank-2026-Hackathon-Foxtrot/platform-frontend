import { t, useLocale } from "@/shared/lib/i18n";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Save } from "lucide-react";
import {
  type ManagedApplication,
  managedInputSchema,
  managedKeys,
  saveManagedApplication,
} from "@/entities/application";
import { sessionOptions } from "@/entities/session";
import { getApiErrorMessage } from "@/shared/api";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
type Props = {
  current?: ManagedApplication;
  onSaved?: (app: ManagedApplication) => void;
};
/** Registers an application by its pinned image, or edits one at its latest version. */
export function ApplicationForm({ current, onSaved }: Props) {
  useLocale();
  const session = useQuery(sessionOptions());
  const queryClient = useQueryClient();
  const [fields, setFields] = useState({
    name: current?.name ?? "",
    imageRef: current?.image.imageRef ?? "",
    port: String(current?.image.port ?? 8080),
    cpu: String(current?.image.cpu ?? 512),
    memory: String(current?.image.memory ?? 1024),
    architecture: current?.image.architecture ?? "X86_64",
  });
  const [key, setKey] = useState(() => crypto.randomUUID());
  const input = {
    name: fields.name,
    image: {
      imageRef: fields.imageRef.trim(),
      port: Number(fields.port),
      cpu: Number(fields.cpu),
      memory: Number(fields.memory),
      architecture: fields.architecture,
      registryCredentialRef: current?.image.registryCredentialRef ?? null,
      environment: current?.image.environment ?? {},
      secretRefs: current?.image.secretRefs ?? {},
    },
  };
  const parsed = managedInputSchema.safeParse(input);
  const save = useMutation({
    mutationFn: () => {
      if (!parsed.success) throw new Error(t("입력값을 확인하세요."));
      return saveManagedApplication(parsed.data, current, key);
    },
    onSuccess: async (app) => {
      setKey(crypto.randomUUID());
      if (session.data) {
        await queryClient.invalidateQueries({
          queryKey: managedKeys.all(session.data.workspaceId),
        });
      }
      onSaved?.(app);
    },
  });
  const set = (name: keyof typeof fields) => (value: string) => {
    setFields((before) => ({ ...before, [name]: value }));
    setKey(crypto.randomUUID());
  };
  const issues = parsed.success
    ? []
    : parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${t(issue.message)}`);
  const touched = fields.name !== "" || fields.imageRef !== "";
  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        save.mutate();
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="app-name" label={t("앱 이름")}>
          <Input
            id="app-name"
            value={fields.name}
            maxLength={80}
            placeholder="shop"
            onChange={(event) => set("name")(event.target.value)}
          />
        </Field>
        <Field id="app-arch" label={t("아키텍처")}>
          <Select value={fields.architecture} onValueChange={set("architecture")}>
            <SelectTrigger id="app-arch" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="X86_64">x86_64</SelectItem>
              <SelectItem value="ARM64">arm64</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>
      <Field id="app-image" label={t("컨테이너 이미지 (digest 고정)")}>
        <Input
          id="app-image"
          className="font-mono text-xs"
          value={fields.imageRef}
          placeholder="ghcr.io/org/app@sha256:…"
          onChange={(event) => set("imageRef")(event.target.value)}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field id="app-port" label={t("포트")}>
          <Input
            id="app-port"
            type="number"
            value={fields.port}
            onChange={(event) => set("port")(event.target.value)}
          />
        </Field>
        <Field id="app-cpu" label="CPU (millicore)">
          <Input
            id="app-cpu"
            type="number"
            value={fields.cpu}
            onChange={(event) => set("cpu")(event.target.value)}
          />
        </Field>
        <Field id="app-memory" label={t("메모리 (MiB)")}>
          <Input
            id="app-memory"
            type="number"
            value={fields.memory}
            onChange={(event) => set("memory")(event.target.value)}
          />
        </Field>
      </div>
      {touched && issues.length > 0 && (
        <ul className="list-inside list-disc text-sm text-destructive">
          {issues.map((issue) => (
            <li key={issue}>{issue}</li>
          ))}
        </ul>
      )}
      <Button type="submit" disabled={!parsed.success || save.isPending}>
        <Save />
        {save.isPending ? t("저장 중") : current ? t("변경 저장") : t("앱 등록")}
      </Button>
      {current && (
        <p className="text-xs text-muted-foreground">
          {t("버전 ")}
          {current.version}
          {t(" 기준으로 저장합니다. 저장하면 다시 검증해야 합니다.")}
        </p>
      )}
      {save.error && (
        <Alert variant="destructive">
          <AlertTitle>{t("저장하지 못했습니다")}</AlertTitle>
          <AlertDescription>{getApiErrorMessage(save.error)}</AlertDescription>
        </Alert>
      )}
    </form>
  );
}
function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  useLocale();
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{t(label)}</Label>
      {children}
    </div>
  );
}
