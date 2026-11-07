import { Link } from "@tanstack/react-router";
import { t } from "@/shared/lib/i18n";
import { Button } from "@/shared/ui/button";
export function MonitoringNav({
  active,
  app,
  workflow,
}: {
  active: "system" | "migration";
  app?: string;
  workflow?: string;
}) {
  return (
    <nav aria-label={t("모니터링 종류")} className="flex gap-1 border-b pb-3">
      <Button asChild variant={active === "system" ? "secondary" : "ghost"} size="sm">
        <Link
          to="/monitoring/systems"
          search={{ app, workflow, category: "cpu", minutes: 15 }}
          aria-current={active === "system" ? "page" : undefined}
        >
          {t("시스템")}
        </Link>
      </Button>
      <Button asChild variant={active === "migration" ? "secondary" : "ghost"} size="sm">
        <Link
          to="/monitoring"
          search={{ workflow, comp: "app" }}
          aria-current={active === "migration" ? "page" : undefined}
        >
          {t("마이그레이션")}
        </Link>
      </Button>
    </nav>
  );
}
