import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import "./teacher-tribute.css";
import { TributeCelebration } from "./TributeCelebration";
import teachers from "../../backend/resources/tribute-teachers.json";

/** Local ending presentation. Does not read or mutate saves or private letters. */
export function TeacherTribute({
  reducedMotion = false,
}: {
  reducedMotion?: boolean;
}) {
  const [open, setOpen] = useState(true);
  const [systemReduced, setSystemReduced] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [playback, setPlayback] = useState(0);
  const [paused, setPaused] = useState(false);
  const [finished, setFinished] = useState(false);
  const close = useRef<HTMLButtonElement>(null);
  const replay = useRef<HTMLButtonElement>(null);
  const rolling = playback > 0 || !(reducedMotion || systemReduced);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setSystemReduced(media.matches);
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, []);
  useEffect(() => {
    if (!open) {
      replay.current?.focus({ preventScroll: true });
      return;
    }
    const previous = document.activeElement as HTMLElement | null;
    close.current?.focus({ preventScroll: true });
    return () => {
      if (previous?.isConnected) previous.focus();
    };
  }, [open]);
  const closeTribute = () => {
    setOpen(false);
    setPlayback(0);
    setPaused(false);
    setFinished(false);
  };
  const toggleRoll = () => {
    if (!rolling || finished) {
      setPlayback((count) => count + 1);
      setPaused(false);
      setFinished(false);
    } else {
      setPaused((value) => !value);
    }
  };
  if (!open)
    return (
      <button type="button" ref={replay} onClick={() => setOpen(true)}>
        Xem tri ân thầy cô
      </button>
    );
  return createPortal(
    <section
      className="game-teacher-tribute"
      data-roll={rolling ? (paused ? "paused" : "playing") : "still"}
      role="dialog"
      aria-modal="true"
      aria-labelledby="game-tribute-title"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          closeTribute();
        }
        if (event.key === "Tab") {
          const controls = [
            ...event.currentTarget.querySelectorAll<HTMLElement>(
              "button:not(:disabled), [tabindex='0']",
            ),
          ];
          const first = controls[0],
            last = controls.at(-1);
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }
      }}
    >
      <div className="game-tribute-campus" aria-hidden="true">
        <img
          src={`${import.meta.env.BASE_URL}ending/school-twilight.webp`}
          alt=""
        />
      </div>
      <TributeCelebration />
      <header>
        <span>THE UNWRITTEN LESSON · 20 / 11</span>
        <h2 id="game-tribute-title">Tri ân thầy cô</h2>
        <p>
          Cảm ơn thầy cô đã dạy chúng em kiến thức,
          <br />
          cách suy nghĩ và lòng kiên nhẫn để trưởng thành.
        </p>
      </header>
      <div
        className="game-tribute-window"
        role="region"
        aria-label="Danh sách thầy cô"
        tabIndex={rolling ? undefined : 0}
      >
        <div
          key={playback}
          className="game-tribute-roll"
          onAnimationEnd={() => setFinished(true)}
        >
          <ul role="list">
            {teachers.map(({ id, name }) => (
              <li key={id}>{name}</li>
            ))}
          </ul>
          <p className="game-tribute-last">
            <span>
              Những điều thầy cô dạy
              <br />
              sẽ được chúng em mang theo.
            </span>
          </p>
        </div>
      </div>
      <footer>
        <p>Kính gửi tất cả những người thầy, người cô đã dìu dắt chúng em.</p>
        <div className="game-tribute-controls">
          <button type="button" onClick={toggleRoll}>
            {!rolling
              ? "Chạy danh sách"
              : finished
                ? "Chạy lại danh sách"
                : paused
                  ? "Tiếp tục danh sách"
                  : "Tạm dừng danh sách"}
          </button>
          <button type="button" ref={close} onClick={closeTribute}>
            Trở lại màn kết
          </button>
        </div>
      </footer>
    </section>,
    document.body,
  );
}
