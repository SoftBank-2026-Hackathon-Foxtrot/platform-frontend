import { useId, useState } from "react";
import type { TargetConfiguration } from "@/entities/migration";
import { t, useLocale } from "@/shared/lib/i18n";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import type { SizingOptions } from "../api/sizing";

const LABELS: Record<string, string> = {
  db_instance_class: "대상 DB 사양",
  db_tier: "대상 DB 사양",
  db_storage_gib: "DB 저장 공간 (GiB)",
  db_max_storage_gib: "DB 저장 공간 상한 (GiB)",
  db_multi_az: "DB 고가용성",
  db_high_availability: "DB 고가용성",
  cache_node_type: "Redis 인스턴스",
  cache_node_count: "Redis 노드 수",
  cache_memory_gib: "Redis 메모리 (GiB)",
  cache_high_availability: "Redis 고가용성",
};

// Provider specifications, not estimates from the app's allocation:
// https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.DBInstanceClass.Summary.html
// https://docs.cloud.google.com/sql/docs/postgres/machine-series-overview
function databaseLabel(value: string) {
  const aws: Record<string, [number, number]> = {
    "db.t3.micro": [2, 1],
    "db.t3.small": [2, 2],
    "db.m6g.large": [2, 8],
  };
  const custom = /^db-custom-(\d+)-(\d+)$/.exec(value);
  const spec = custom ? [Number(custom[1]), Number(custom[2]) / 1024] : aws[value];
  return spec ? t("{0} vCPU · 메모리 {1} GiB", spec) : value;
}

export function TargetSizing({ data, disabled }: { data: SizingOptions; disabled: boolean }) {
  const deployment = data.deployment!;
  const [cpu, setCpu] = useState(deployment.app.cpu);
  const [memory, setMemory] = useState(String(deployment.app.memoryMiB));
  const id = useId();
  const minMemory =
    data.cloud === "aws" ? ({ 0.25: 512, 0.5: 1024, 1: 2048, 2: 4096, 4: 8192 }[cpu] ?? 512) : 512;
  const maxMemory =
    data.cloud === "aws"
      ? ({ 0.25: 2048, 0.5: 4096, 1: 8192, 2: 16384, 4: 30720 }[cpu] ?? 32768)
      : cpu * 4096;
  return (
    <fieldset disabled={disabled} className="space-y-4 rounded-lg border p-4">
      <legend className="px-1 text-sm font-medium">{t("대상 사양")}</legend>
      <p className="text-xs text-muted-foreground">
        {t(
          "사양 적용과 앱 준비 확인이 끝나면 복제를 시작합니다. 계획 생성 후에는 사양을 변경할 수 없습니다.",
        )}
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>{t("앱 CPU")}</Label>
          <div role="group" aria-label={t("앱 CPU")} className="flex flex-wrap gap-1">
            {data.appOptions.cpu.map((value) => (
              <Button
                type="button"
                key={value}
                variant={cpu === value ? "secondary" : "outline"}
                size="sm"
                aria-pressed={cpu === value}
                onClick={() => {
                  setCpu(value);
                  const floor =
                    data.cloud === "aws"
                      ? ({ 0.25: 512, 0.5: 1024, 1: 2048, 2: 4096, 4: 8192 }[value] ?? 512)
                      : 512;
                  setMemory(String(Math.max(Number(memory) || floor, floor)));
                }}
              >
                {value} vCPU
              </Button>
            ))}
          </div>
          <input type="hidden" name="app.cpu" value={cpu} />
          <p className="text-xs text-muted-foreground">
            {t(
              data.cloud === "aws"
                ? "앱과 워커가 공유하는 할당량입니다."
                : "컨테이너마다 적용하는 할당량입니다.",
            )}
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${id}-memory`}>{t("앱 메모리 (MiB)")}</Label>
          <Input
            id={`${id}-memory`}
            name="app.memoryMiB"
            type="number"
            required
            min={minMemory}
            max={maxMemory}
            step={data.cloud === "aws" && cpu !== 0.25 ? 1024 : data.appOptions.memoryStepMiB}
            value={memory}
            onChange={(event) => setMemory(event.target.value)}
          />
          {Number(memory) > 0 && (
            <p className="text-xs text-muted-foreground">{Number(memory) / 1024} GiB</p>
          )}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {Object.entries(data.parameters).map(([key, rule]) =>
          rule.type === "integer" ? (
            <div key={key} className="space-y-2">
              <Label htmlFor={`${id}-${key}`}>{t(LABELS[key] ?? key)}</Label>
              <Input
                id={`${id}-${key}`}
                name={`sizing.${key}`}
                type="number"
                step={1}
                required
                min={
                  key === "db_storage_gib" || key === "db_max_storage_gib"
                    ? Math.max(rule.minimum ?? 0, Number(deployment.sizing[key]))
                    : rule.minimum
                }
                max={rule.maximum}
                defaultValue={String(deployment.sizing[key])}
              />
            </div>
          ) : (
            <Choice
              key={key}
              name={`sizing.${key}`}
              label={t(LABELS[key] ?? key)}
              initial={String(deployment.sizing[key])}
              values={rule.type === "boolean" ? ["false", "true"] : (rule.enum ?? [])}
              boolean={rule.type === "boolean"}
              database={key === "db_tier" || key === "db_instance_class"}
            />
          ),
        )}
      </div>
    </fieldset>
  );
}
function Choice({
  name,
  label,
  initial,
  values,
  boolean,
  database,
}: {
  name: string;
  label: string;
  initial: string;
  values: string[];
  boolean: boolean;
  database: boolean;
}) {
  const [value, setValue] = useState(initial);
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div role="group" aria-label={label} className="flex flex-wrap gap-2">
        {values.map((option) => (
          <Button
            type="button"
            key={option}
            size="sm"
            className={database ? "h-auto flex-col items-start gap-1 px-3 py-2" : undefined}
            variant={value === option ? "secondary" : "outline"}
            aria-pressed={value === option}
            onClick={() => setValue(option)}
          >
            {database ? (
              <>
                <span>{databaseLabel(option)}</span>
                <span className="font-mono text-[10px] text-muted-foreground">{option}</span>
              </>
            ) : boolean ? (
              t(option === "true" ? "사용" : "미사용")
            ) : (
              option
            )}
          </Button>
        ))}
      </div>
      <input type="hidden" name={name} value={value} />
    </div>
  );
}

export function TargetSizingSummary({ configuration }: { configuration: TargetConfiguration }) {
  useLocale();
  return (
    <div className="space-y-2 rounded-md border p-3 text-xs">
      <p className="font-medium">{t("확정한 대상 사양")}</p>
      <p className="font-mono text-muted-foreground">{configuration.environmentId}</p>
      <dl className="flex flex-wrap gap-x-5 gap-y-2">
        {configuration.app.cpu !== undefined && (
          <div>
            <dt className="text-muted-foreground">{t("앱 CPU")}</dt>
            <dd>{configuration.app.cpu} vCPU</dd>
          </div>
        )}
        {configuration.app.memoryMiB !== undefined && (
          <div>
            <dt className="text-muted-foreground">{t("앱 메모리 (MiB)")}</dt>
            <dd>
              {configuration.app.memoryMiB} MiB · {configuration.app.memoryMiB / 1024} GiB
            </dd>
          </div>
        )}
        {Object.entries(configuration.sizing).map(([key, value]) => (
          <div key={key}>
            <dt className="text-muted-foreground">{t(LABELS[key] ?? key)}</dt>
            <dd>
              {key === "db_tier" || key === "db_instance_class" ? (
                <>
                  <span className="block">{databaseLabel(String(value))}</span>
                  <span className="font-mono text-muted-foreground">{String(value)}</span>
                </>
              ) : typeof value === "boolean" ? (
                t(value ? "사용" : "미사용")
              ) : (
                String(value)
              )}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
