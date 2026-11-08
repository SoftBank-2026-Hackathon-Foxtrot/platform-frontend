import { useSyncExternalStore, useState, type ReactNode } from "react";
import { Maximize2, Minimize2, X } from "lucide-react";
import { mascot } from "@/shared/brand";
import { isDemoMode } from "@/shared/config";
import { t, useLocale } from "@/shared/lib/i18n";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/shared/ui/sheet";

const insetQuery = "(min-width: 1200px)";
function subscribe(listener: () => void) {
  const query = window.matchMedia(insetQuery);
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
}

export function AssistantInset({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  useLocale();
  const desktop = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(insetQuery).matches,
    () => false,
  );
  const [wide, setWide] = useState(false);
  const identity = (
    <>
      <img src={mascot} alt="" className="size-10 shrink-0 rounded-xl bg-white object-contain" />
      <div className="min-w-0">
        <p className="text-sm font-semibold">{t("AI 도우미")}</p>
      </div>
      {isDemoMode && (
        <Badge variant="outline" className="ml-1 text-[10px]">
          {t("화면 데모")}
        </Badge>
      )}
    </>
  );
  if (!desktop)
    return (
      <Sheet
        open={open}
        onOpenChange={(value) => {
          if (!value) onClose();
        }}
      >
        <SheetContent
          id="ai-assistant-inset"
          side="right"
          className="w-full! max-w-[480px]! gap-0"
          showCloseButton={false}
        >
          <SheetHeader className="flex-row items-center gap-3 border-b">
            {identity}
            <SheetTitle className="sr-only">{t("AI 도우미")}</SheetTitle>
            <SheetDescription className="sr-only">
              {t("현재 화면을 유지하며 AI와 대화합니다.")}
            </SheetDescription>
            <Button
              variant="ghost"
              size="icon-sm"
              className="ml-auto"
              onClick={onClose}
              aria-label={t("AI 패널 닫기")}
            >
              <X />
            </Button>
          </SheetHeader>
          <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    );
  return (
    <aside
      id="ai-assistant-inset"
      aria-label={t("AI 도우미")}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          onClose();
        }
      }}
      className={
        (open ? "flex " : "hidden ") +
        "my-2 mr-2 min-h-0 shrink-0 flex-col overflow-hidden rounded-xl border bg-background shadow-sm " +
        (wide ? "w-[560px]" : "w-[416px]")
      }
    >
      <header className="flex h-[72px] shrink-0 items-center gap-3 border-b px-4">
        {identity}
        <div className="ml-auto flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setWide(!wide)}
            aria-label={t(wide ? "패널 줄이기" : "패널 넓히기")}
            aria-pressed={wide}
          >
            {wide ? <Minimize2 /> : <Maximize2 />}
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label={t("AI 패널 닫기")}>
            <X />
          </Button>
        </div>
      </header>
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </aside>
  );
}
