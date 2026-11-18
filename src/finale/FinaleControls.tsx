import { RevealControls } from "./RevealControls";
import { TeacherTribute } from "./TeacherTribute";
import { useState } from "react";
import type { FinaleSave, FinaleAction } from "./state";
import type { Letter } from "./letter";
import { LetterExperience } from "./LetterExperience";
import { EndingScreen } from "./EndingScreen";
import { isFutureReflection } from "../ripple/FutureReflection";
import { EndingCredits } from "./EndingCredits";
import "./finale.css";
import "./player-room.css";
export function FinaleControls({
  s,
  act,
  letter,
  update,
  persisted,
  erase,
  onMenu,
  onReplay,
  reducedMotion = false,
}: {
  s: FinaleSave;
  act: (a: FinaleAction) => void;
  letter: Letter;
  update: (v: Letter, composing?: boolean) => void;
  persisted: boolean;
  erase: () => void;
  onMenu: () => void;
  onReplay: () => void;
  reducedMotion?: boolean;
}) {
  const [credits, setCredits] = useState(false);
  return (
    <>
      {isFutureReflection(s) && (
        <header
          className="future-reflection-header"
          aria-label="Viện nghiên cứu AION, năm 2046"
        >
          <span>AION</span>
          <span>2046</span>
        </header>
      )}
      {s.phase === "memory" && (
        <div className="finale-memory" aria-label="Ba vật thể trong ký ức cuối">
          <button
            aria-pressed={s.memoryFocus === "evaluation"}
            onClick={() => act({ type: "focus-memory", id: "evaluation" })}
          >
            Nhìn hồ sơ 2026
          </button>
          <button
            aria-pressed={s.memoryFocus === "chair"}
            onClick={() => act({ type: "focus-memory", id: "chair" })}
          >
            Nhìn chiếc ghế
          </button>
          <button
            aria-pressed={s.memoryFocus === "notebook"}
            onClick={() => act({ type: "focus-memory", id: "notebook" })}
          >
            Nhìn cuốn sổ
          </button>
        </div>
      )}
      {s.phase === "paper" && (
        <>
          <button
            className="player-room-monitor"
            aria-label="Mở máy tính"
            onClick={() => act({ type: "write" })}
          >
            <span>
              Mở máy tính <span aria-hidden="true">↗</span>
            </span>
          </button>
          <div className="player-room-caption">
            <span>HIỆN TẠI · GÓC BÀN CỦA BẠN</span>
            <h2>Một lời chưa nói.</h2>
          </div>
          <div className="finale-actions player-room-actions">
            <button onClick={() => act({ type: "write" })}>
              Chạm tờ giấy để viết
            </button>
            <button onClick={() => act({ type: "skip" })}>
              Giữ im lặng và tiếp tục
            </button>
          </div>
        </>
      )}
      {(s.phase === "letter" || s.phase === "review") && (
        <LetterExperience
          key={s.phase}
          phase={s.phase}
          letter={letter}
          update={update}
          persisted={persisted}
          erase={erase}
          act={act}
        />
      )}
      {s.phase === "galaxy" && (
        <RevealControls
          s={s}
          letter={letter}
          persisted={persisted}
          erase={erase}
          act={act}
        />
      )}
      {s.phase === "ending" && (
        <EndingScreen reducedMotion={reducedMotion}>
          <TeacherTribute />
          <button onClick={onMenu}>Trở về menu</button>
          <button onClick={onReplay}>Chơi lại</button>
          <button onClick={() => act({ type: "inspect" })}>
            Xem lời cảm ơn
          </button>
          <button onClick={() => setCredits(true)}>Credits</button>
        </EndingScreen>
      )}
      {credits && <EndingCredits onClose={() => setCredits(false)} />}
    </>
  );
}
