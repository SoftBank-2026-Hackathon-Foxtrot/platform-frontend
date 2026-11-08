type Status = { id: string; status: string };
const played = new Set<string>();

export function becameComplete(previous: Status | null, next: Status) {
  return previous?.id === next.id && previous.status !== "COMPLETED" && next.status === "COMPLETED";
}

export function claimCompletion(id: string, storage?: Pick<Storage, "getItem" | "setItem">) {
  if (played.has(id)) return false;
  played.add(id);
  try {
    const key = `foxtrot:completion-peek:${id}`;
    if (storage?.getItem(key)) return false;
    storage?.setItem(key, "1");
  } catch {
    // A restricted browser still remembers the celebration for this page session.
  }
  return true;
}
