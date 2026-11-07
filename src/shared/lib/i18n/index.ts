import { useSyncExternalStore } from "react";
import { messages } from "./messages";

export type Locale = "ko" | "en" | "ja";
export const LOCALES = [
  { value: "ko", label: "KOR" },
  { value: "en", label: "ENG" },
  { value: "ja", label: "日本語" },
] as const;
const KEY = "foxtrot-locale";
const listeners = new Set<() => void>();
export function isLocale(value: unknown): value is Locale {
  return value === "ko" || value === "en" || value === "ja";
}
function stored(): Locale {
  try {
    const saved = window.localStorage.getItem(KEY);
    return isLocale(saved) ? saved : "ko";
  } catch {
    return "ko";
  }
}
let current: Locale = stored();
export function getLocale(): Locale {
  return current;
}
export function localeTag(): string {
  return { ko: "ko-KR", en: "en-US", ja: "ja-JP" }[current];
}
export function applyLocale() {
  if (typeof document !== "undefined") document.documentElement.lang = current;
}
export function setLocale(locale: Locale) {
  if (!isLocale(locale)) return;
  current = locale;
  try {
    window.localStorage.setItem(KEY, locale);
  } catch {
    /* The in-memory choice still applies. */
  }
  applyLocale();
  listeners.forEach((listener) => listener());
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
export function useLocale(): Locale {
  return useSyncExternalStore(subscribe, getLocale, () => "ko");
}
export function translate(
  message: string | null | undefined,
  values: readonly unknown[] = [],
  locale: Locale = current,
): string {
  if (message == null) return "";
  const key = message.trim();
  if (!key) return message;
  const entry = messages[key];
  const translated = locale === "ko" ? key : (entry?.[locale] ?? key);
  const spaced =
    message.slice(0, message.length - message.trimStart().length) +
    translated +
    message.slice(message.trimEnd().length);
  return spaced.replace(/\{(\d+)\}/g, (token, index: string) =>
    Number(index) < values.length ? String(values[Number(index)]) : token,
  );
}
export const t = translate;
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key !== KEY && event.key !== null) return;
    current = stored();
    applyLocale();
    listeners.forEach((listener) => listener());
  });
}
