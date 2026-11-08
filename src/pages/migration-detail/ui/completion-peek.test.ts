import { describe, expect, it } from "vite-plus/test";
import { becameComplete, claimCompletion } from "./completion-peek-model";

describe("completion celebration", () => {
  it("requires an observed transition of the same workflow", () => {
    expect(becameComplete(null, { id: "a", status: "COMPLETED" })).toBe(false);
    expect(becameComplete({ id: "a", status: "RUNNING" }, { id: "a", status: "COMPLETED" })).toBe(
      true,
    );
    expect(becameComplete({ id: "a", status: "RUNNING" }, { id: "b", status: "COMPLETED" })).toBe(
      false,
    );
    expect(becameComplete({ id: "a", status: "COMPLETED" }, { id: "a", status: "COMPLETED" })).toBe(
      false,
    );
  });
  it.each(["RUNNING", "WAITING_APPROVAL", "HALTED", "ABORTED", "ROLLING_BACK"])(
    "does not celebrate %s",
    (status) => {
      expect(becameComplete({ id: "a", status: "RUNNING" }, { id: "a", status })).toBe(false);
    },
  );
  it("remembers a completed animation with or without browser storage", () => {
    const memory = new Map<string, string>();
    const storage = {
      getItem: (key: string) => memory.get(key) ?? null,
      setItem: (key: string, value: string) => {
        memory.set(key, value);
      },
    };
    expect(claimCompletion("first", storage)).toBe(true);
    expect(claimCompletion("first", storage)).toBe(false);
    memory.set("foxtrot:completion-peek:earlier", "1");
    expect(claimCompletion("earlier", storage)).toBe(false);
    expect(
      claimCompletion("restricted", {
        getItem: () => {
          throw Error("blocked");
        },
        setItem: () => {
          throw Error("blocked");
        },
      }),
    ).toBe(true);
    expect(claimCompletion("restricted")).toBe(false);
  });
});
