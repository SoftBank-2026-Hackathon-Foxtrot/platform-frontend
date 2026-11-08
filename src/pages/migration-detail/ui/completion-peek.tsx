import { useEffect, useRef, useState } from "react";
import { becameComplete, claimCompletion } from "./completion-peek-model";
import "./completion-peek.css";
import friends from "./assets/chiikawa-friends.png";

export function CompletionPeek({
  id,
  status,
  suspended,
  cx,
  top,
}: {
  id: string;
  status: string;
  suspended: boolean;
  cx: number;
  top: number;
}) {
  useEffect(() => {
    const image = new Image();
    image.src = friends;
  }, []);
  const previous = useRef({ id, status });
  const timer = useRef<number | undefined>(undefined);
  const [visible, setVisible] = useState(false);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  useEffect(() => {
    if (suspended) return;
    const next = { id, status };
    const show = becameComplete(previous.current, next);
    const changed = previous.current.id !== id;
    previous.current = next;
    if (changed) {
      window.clearTimeout(timer.current);
      setVisible(false);
    }
    if (!show || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let storage: Storage | undefined;
    try {
      storage = window.sessionStorage;
    } catch {
      /* Session storage is optional. */
    }
    if (!claimCompletion(id, storage)) return;
    setVisible(true);
    timer.current = window.setTimeout(() => setVisible(false), 3000);
  }, [id, status, suspended]);
  if (!visible) return null;
  return (
    <div
      className="completion-peek"
      style={{ left: cx - 62, top: top - 112 }}
      aria-hidden="true"
      data-completion-peek={id}
    >
      <div className="completion-peek-character">
        <span
          className="completion-peek-plush"
          style={{ backgroundImage: 'url("' + friends + '")' }}
        />
        <span
          className="completion-peek-paw"
          style={{ backgroundImage: 'url("' + friends + '")' }}
        />
      </div>
    </div>
  );
}
