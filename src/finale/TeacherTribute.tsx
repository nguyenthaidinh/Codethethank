import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import "./teacher-tribute.css";
import { TributeCelebration } from "./TributeCelebration";
import teachers from "../../backend/resources/tribute-teachers.json";

/** Local ending presentation. Does not read or mutate saves or private letters. */
export function TeacherTribute() {
  const [open, setOpen] = useState(true);
  const close = useRef<HTMLButtonElement>(null);
  const replay = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    close.current?.focus();
    return () => {
      if (previous?.isConnected) previous.focus();
    };
  }, [open]);
  if (!open)
    return (
      <button ref={replay} onClick={() => setOpen(true)}>
        Xem tri ân thầy cô
      </button>
    );
  return createPortal(
    <section
      className="game-teacher-tribute"
      role="dialog"
      aria-modal="true"
      aria-labelledby="game-tribute-title"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          setOpen(false);
        }
        if (event.key === "Tab") {
          const buttons = [
            ...event.currentTarget.querySelectorAll<HTMLButtonElement>(
              "button:not(:disabled)",
            ),
          ];
          const first = buttons[0],
            last = buttons.at(-1);
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
      <div className="game-tribute-window" aria-label="Danh sách thầy cô">
        <div className="game-tribute-roll">
          {teachers.map(({ id, name }) => (
            <p key={id}>{name}</p>
          ))}
          <p className="game-tribute-last">
            Những điều thầy cô dạy
            <br />
            sẽ được chúng em mang theo.
          </p>
        </div>
      </div>
      <footer>
        <p>Kính gửi tất cả những người thầy, người cô đã dìu dắt chúng em.</p>
        <button ref={close} onClick={() => setOpen(false)}>
          Trở lại màn kết
        </button>
      </footer>
    </section>,
    document.body,
  );
}
