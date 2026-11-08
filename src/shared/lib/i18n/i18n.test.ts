import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { messages } from "./messages";
import { setLocale, translate } from "./index";

afterEach(() => {
  setLocale("ko");
  vi.unstubAllGlobals();
});

describe("console language", () => {
  it("preserves parameters and untranslated service identifiers", () => {
    expect(translate("{0}단계 중 {1}단계 완료", [8, 3], "en")).toBe("3 of 8 stages completed");
    expect(translate("{0}단계 중 {1}단계 완료", [8, 3], "ja")).toBe("8段階中3段階完了");
    expect(translate("wf-123 / aws / gcp", [], "ja")).toBe("wf-123 / aws / gcp");
    expect(translate(" ", [], "en")).toBe(" ");
    expect(translate("배포 진행하기", [], "en")).toBe("Deploy now");
    expect(translate("배포 진행하기", [], "ja")).toBe("デプロイを実行");
    expect(translate("답변 근거 {0}개", [3], "ja")).toBe("回答の根拠 3件");
  });

  it("has complete translations and matching placeholders for every message", () => {
    const placeholders = (value: string) =>
      [...value.matchAll(/\{\d+\}/g)].map((match) => match[0]).sort();
    for (const [key, message] of Object.entries(messages)) {
      for (const locale of ["en", "ja"] as const) {
        expect(message[locale], `${locale}: ${key}`).toBeTruthy();
        expect(message[locale], `${locale}: ${key}`).not.toMatch(/[가-힣]/);
        expect(placeholders(message[locale]), key).toEqual(placeholders(key));
      }
    }
  });

  it("updates the document language and persists the browser choice", () => {
    const storage = new Map<string, string>();
    const document = { documentElement: { lang: "ko" } };
    vi.stubGlobal("document", document);
    vi.stubGlobal("window", {
      localStorage: { setItem: (key: string, value: string) => storage.set(key, value) },
    });
    setLocale("ja");
    expect(document.documentElement.lang).toBe("ja");
    expect(storage.get("foxtrot-locale")).toBe("ja");
    expect(translate("설정")).toBe("設定");
  });

  it("still switches languages when browser storage is blocked", () => {
    vi.stubGlobal("window", {
      localStorage: {
        setItem: () => {
          throw new Error("blocked");
        },
      },
    });
    setLocale("en");
    expect(translate("설정")).toBe("Settings");
  });
});
