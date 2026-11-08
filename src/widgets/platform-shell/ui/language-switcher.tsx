import { LOCALES, setLocale, t, useLocale } from "@/shared/lib/i18n";
import { Button } from "@/shared/ui/button";

export function LanguageSwitcher() {
  const locale = useLocale();
  return (
    <div
      role="group"
      aria-label={t("언어")}
      className="flex shrink-0 items-center rounded-md border p-0.5"
    >
      {LOCALES.map((option) => (
        <Button
          key={option.value}
          variant={locale === option.value ? "secondary" : "ghost"}
          size="sm"
          className="h-6 px-2 text-[11px]"
          lang={option.value}
          aria-pressed={locale === option.value}
          onClick={() => setLocale(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
