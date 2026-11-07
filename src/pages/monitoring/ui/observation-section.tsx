import { useId, useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/shared/ui/button";

export function ObservationSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="min-w-0 space-y-3 border-t pt-4">
      <h3 className="text-sm font-medium">{title}</h3>
      {children}
    </section>
  );
}
export function ObservationDisclosure({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <section className="min-w-0 border-t py-2">
      <h2>
        <Button
          variant="ghost"
          className="h-auto min-h-11 max-w-full justify-start px-0 text-left whitespace-normal"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen(!open)}
        >
          {open ? <ChevronDown aria-hidden="true" /> : <ChevronRight aria-hidden="true" />}
          {title}
        </Button>
      </h2>
      <div id={id} hidden={!open} className="space-y-4 py-3">
        {children}
      </div>
    </section>
  );
}
