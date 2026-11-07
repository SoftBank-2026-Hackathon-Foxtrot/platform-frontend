import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { z } from "zod";
import { migrationViewSchema, type MigrationView, type Workflow } from "@/entities/migration";
import { useSession } from "@/entities/session";
import type { TelemetryComponent } from "@/entities/telemetry";

const snapshotSchema = z.object({
  anchor: z.string(),
  x: z.number().finite(),
  y: z.number().finite(),
  scroll: z.array(z.object({ id: z.string(), x: z.number().finite(), y: z.number().finite() })),
});
const storageKey = (workspace: string, workflow: string, key: string) =>
  `migration-view:${workspace}:${workflow}:${key}`;

export function MonitoringEntryLink({
  workflow,
  comp = "app",
  tab = "mx",
  at,
  trace,
  side,
  anchor,
  children,
  className,
  style,
  "aria-label": ariaLabel,
}: {
  workflow: Pick<Workflow, "id" | "application">;
  comp?: TelemetryComponent;
  tab?: "mx" | "tr" | "lg" | "obs";
  at?: string;
  trace?: string;
  side?: "source" | "target";
  anchor: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  "aria-label"?: string;
}) {
  const session = useSession();
  const location = useRouterState({ select: (state) => state.location });
  const view = migrationViewSchema.parse(location.search);
  const [visit] = useState(() => crypto.randomUUID());
  return (
    <Link
      id={anchor}
      to="/monitoring"
      search={{
        workflow: workflow.id,
        comp,
        side,
        at,
        trace,
        scope: at ? (comp === "app" ? "all" : "component") : undefined,
        from: {
          workflow: workflow.id,
          label: workflow.application.slice(0, 300),
          anchor,
          visit,
          expanded: view.expanded,
          eventCursor: view.eventCursor,
        },
      }}
      hash={tab}
      className={className}
      style={style}
      aria-label={ariaLabel}
      onClick={() => {
        try {
          const snapshot = JSON.stringify({
            anchor,
            x: window.scrollX,
            y: window.scrollY,
            scroll: [...document.querySelectorAll<HTMLElement>("[data-return-scroll]")].map(
              (element) => ({ id: element.id, x: element.scrollLeft, y: element.scrollTop }),
            ),
          });
          for (const key of [visit, location.state.__TSR_key]) {
            if (key)
              sessionStorage.setItem(storageKey(session.workspaceId, workflow.id, key), snapshot);
          }
        } catch {
          /* Storage may be disabled; the validated resource anchor still works. */
        }
      }}
    >
      {children}
    </Link>
  );
}

export function useMigrationReturn(
  workspace: string,
  workflow: string,
  view: MigrationView,
  ready: boolean,
) {
  const location = useRouterState({ select: (state) => state.location });
  const restored = useRef<string | undefined>(undefined);
  useEffect(() => {
    const key = location.state.__TSR_key ?? view.resume;
    if (!ready || !key || restored.current === key) return;
    let snapshot: z.infer<typeof snapshotSchema> | undefined;
    try {
      // Browser Back returns to the same history entry. It may contain a previous resume URL,
      // so its most recent departure takes precedence over that older explicit return token.
      for (const savedKey of [location.state.__TSR_key, view.resume]) {
        if (!savedKey) continue;
        const raw = sessionStorage.getItem(storageKey(workspace, workflow, savedKey));
        if (raw) {
          snapshot = snapshotSchema.parse(JSON.parse(raw));
          break;
        }
      }
    } catch {
      /* Missing or invalid saved state falls back to the URL anchor. */
    }
    const target = snapshot?.anchor ?? (view.resume ? location.hash : undefined);
    if (!target) return;
    let frame = 0;
    let observer: MutationObserver | undefined;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const restore = () => {
      const element = document.getElementById(target);
      if (!element) return false;
      observer?.disconnect();
      if (timeout) clearTimeout(timeout);
      frame = requestAnimationFrame(() => {
        restored.current = key;
        element.focus({ preventScroll: true });
        if (snapshot) {
          for (const scroll of snapshot.scroll) {
            document
              .getElementById(scroll.id)
              ?.scrollTo({ left: scroll.x, top: scroll.y, behavior: "instant" });
          }
          window.scrollTo({ left: snapshot.x, top: snapshot.y, behavior: "instant" });
          const rect = element.getBoundingClientRect();
          if (rect.bottom < 48 || rect.top > window.innerHeight)
            element.scrollIntoView({ block: "center", behavior: "instant" });
        } else element.scrollIntoView({ block: "center", behavior: "instant" });
      });
      return true;
    };
    if (!restore()) {
      // Stage events can arrive after the workflow. Restore only once their anchor is mounted.
      observer = new MutationObserver(restore);
      observer.observe(document.body, { childList: true, subtree: true });
      timeout = setTimeout(() => observer?.disconnect(), 10_000);
    }
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      if (timeout) clearTimeout(timeout);
    };
  }, [workspace, workflow, ready, view.resume, location.hash, location.state.__TSR_key]);
}
