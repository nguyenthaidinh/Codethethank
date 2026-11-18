import { useRef, type CSSProperties } from "react";
import { cueKey, isSpokenScene, type StaySave, type StayAction } from "./state";
import {
  notes,
  stayLines,
  stayChoice,
  stayAutoDelay,
  type NoteId,
} from "./story";
import "./stayed.css";
export function StayControls({
  s,
  act,
  hint,
  time = 0,
}: {
  s: StaySave;
  act: (a: StayAction) => void;
  hint: boolean;
  time?: number;
}) {
  const start = useRef<number | null>(null);
  const lines = stayLines[s.phase];
  const choice = stayChoice(s);
  const delay = stayAutoDelay(s);
  return (
    <>
      {choice && (
        <section className="dialogue-choices" aria-label="Chọn lời đáp của An">
          <p>{choice.prompt}</p>
          <small>An sẽ nói gì?</small>
          <div>
            {choice.options.map((option) => (
              <button
                key={option.id}
                onClick={() => act({ type: "reply", id: option.id })}
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>
      )}
      {lines &&
        !choice &&
        isSpokenScene(s.phase) && (
          <div className="dialogue-playback">
            {delay !== null && (
              <span className="dialogue-auto-note" aria-hidden="true">
                Tự chuyển sau {Math.max(1, Math.ceil(delay - time))}s
              </span>
            )}
            <button
              className="dialogue-advance"
              aria-label="Tiếp lời"
              title="Hội thoại tự chuyển. Bấm hoặc nhấn Enter để tiếp ngay."
              style={
                {
                  "--dialogue-progress": `${delay === null ? 0 : Math.min(1, time / delay) * 100}%`,
                } as CSSProperties
              }
              onClick={() => act({ type: "advance", cue: cueKey(s) })}
            >
              Tiếp lời <span aria-hidden="true">↵</span>
              <span className="dialogue-progress" aria-hidden="true" />
            </button>
          </div>
        )}
      {isSpokenScene(s.phase) && !choice && (
        <button
          type="button"
          className="chapter-skip"
          onClick={() => act({ type: "skip-dialogue", cue: cueKey(s) })}
        >
          Bỏ qua hội thoại
        </button>
      )}
      {!isSpokenScene(s.phase) && lines && s.seen.includes(cueKey(s)) && (
        <button className="chapter-skip" onClick={() => act({ type: "skip" })}>
          Bỏ qua đoạn đã xem
        </button>
      )}
      {s.phase === "notebook" && (
        <div className="notebook-input" aria-label="Hai trang sổ của An">
          {(Object.keys(notes) as NoteId[]).map((id) => (
            <button
              key={id}
              aria-label={notes[id].label}
              aria-pressed={s.page === id}
              onClick={() => act({ type: "read", id })}
            >
              {s.read.includes(id) ? "✓ " : ""}
              {id === "outcome" ? "01 · Kết quả" : "02 · Nhu cầu"}
            </button>
          ))}
        </div>
      )}
      {s.phase === "unwritten" && (
        <button
          className="pen-line"
          aria-label="Khôi phục dòng ghi chú"
          onPointerDown={(e) => {
            start.current = e.clientX;
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (start.current !== null)
              e.currentTarget.style.setProperty(
                "--stroke",
                `${Math.min(100, (Math.abs(e.clientX - start.current) / e.currentTarget.clientWidth) * 100)}%`,
              );
          }}
          onPointerUp={() => {
            start.current = null;
            act({ type: "write" });
          }}
          onPointerCancel={() => {
            start.current = null;
          }}
          onClick={() => act({ type: "write" })}
        >
          Lần theo nét bút →<small>Kéo hoặc chạm · Enter cũng được</small>
        </button>
      )}
      {s.phase === "next" && !s.nextInspected && (
        <button
          className="chapter-action"
          onClick={() => act({ type: "inspect-next" })}
        >
          Quan sát trang phác thảo
        </button>
      )}
      {s.phase === "next" && s.nextInspected && (
        <button
          className="dialogue-advance"
          onClick={() => act({ type: "replay" })}
        >
          Xem lại ký ức
        </button>
      )}
      {hint && ["notebook", "unwritten"].includes(s.phase) && (
        <p className="verdict-hint">
          {s.phase === "notebook"
            ? "Xem cả hai ghi chú trên sổ. Bạn đang khôi phục điều đã xảy ra."
            : "Chạm hoặc kéo một nét trên dòng giấy. Nội dung ký ức đã có sẵn."}
        </p>
      )}
    </>
  );
}
