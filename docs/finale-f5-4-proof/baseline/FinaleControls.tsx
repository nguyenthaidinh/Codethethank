import { useEffect, useRef, useState } from "react";
import type { FinaleSave, FinaleAction } from "./state";
import type { Letter } from "./letter";
import { LetterExperience } from "./LetterExperience";
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
}: {
  s: FinaleSave;
  act: (a: FinaleAction) => void;
  letter: Letter;
  update: (v: Letter, composing?: boolean) => void;
  persisted: boolean;
  erase: () => void;
  onMenu: () => void;
  onReplay: () => void;
}) {
  const [credits, setCredits] = useState(false);
  const modal = useRef<HTMLDivElement>(null);
  const backFocus = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!credits) return;
    backFocus.current = document.activeElement as HTMLElement;
    modal.current?.querySelector("button")?.focus();
    return () => backFocus.current?.focus();
  }, [credits]);
  const status = persisted
    ? "Chỉ lưu trên thiết bị này · Chưa công khai."
    : letter.local
      ? "Chưa có bản lưu trên thiết bị · Chỉ giữ trong phiên này."
      : "Chỉ giữ trong phiên này · Chưa công khai.";
  return (
    <>
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
            <p>Câu chuyện tiếp theo bắt đầu từ bạn.</p>
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
        <>
          {!s.starSeen ? (
            <button
              className="own-star"
              aria-label="Nhìn gần ngôi sao của tôi"
              onClick={() => act({ type: "star" })}
            >
              <span />
              Ngôi sao của khoảnh khắc này
            </button>
          ) : (
            <section className="star-note" aria-label="Ngôi sao của tôi">
              <p>
                {s.choice === "skip"
                  ? "Một ánh sáng cho bài học được nhớ lại."
                  : letter.recipient
                    ? `Gửi ${letter.recipient}`
                    : "Một lời cảm ơn riêng tư"}
              </p>
              <p className="letter-text">
                {s.choice === "skip"
                  ? "Bạn đã chọn không viết lời nhắn cá nhân."
                  : letter.message || "Không có nội dung cá nhân được lưu."}
              </p>
              {s.choice === "letter" && letter.displayName && (
                <p className="letter-signature">— {letter.displayName}</p>
              )}
              <small>
                {s.choice === "skip"
                  ? "Không tạo lời nhắn · Chưa công khai."
                  : status}
              </small>
              {s.choice === "letter" && (
                <button className="quiet-link" onClick={erase}>
                  Xóa nội dung đã lưu
                </button>
              )}
            </section>
          )}
          <button
            className="galaxy-return"
            onClick={() => act({ type: "finish" })}
          >
            {s.completed ? "Trở lại kết thúc" : "Đi tiếp cùng ánh sáng"}
          </button>
          <p className="galaxy-truth">
            Các sao xa là cảnh nền · Không phải bài đăng cộng đồng.
          </p>
        </>
      )}
      {s.phase === "ending" && (
        <div className="ending-title">
          <p>Có những bài học không được viết thành lời.</p>
          <h1>
            THE UNWRITTEN
            <br />
            LESSON
          </h1>
          <div className="ending-actions">
            <button onClick={onMenu}>Trở về menu</button>
            <button onClick={onReplay}>Chơi lại</button>
            <button onClick={() => act({ type: "inspect" })}>
              Xem lời cảm ơn
            </button>
            <button onClick={() => setCredits(true)}>Credits</button>
          </div>
        </div>
      )}
      {credits && (
        <div className="credits-shade">
          <div
            className="credits"
            ref={modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="credits-title"
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.stopPropagation();
                setCredits(false);
              }
              if (e.key === "Tab") {
                const list = [
                  ...modal.current!.querySelectorAll<HTMLElement>(
                    "button,a[href]",
                  ),
                ];
                const first = list[0],
                  last = list.at(-1)!;
                if (e.shiftKey && document.activeElement === first) {
                  e.preventDefault();
                  last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                  e.preventDefault();
                  first.focus();
                }
              }
            }}
          >
            <h2 id="credits-title">THE UNWRITTEN LESSON</h2>
            <p>Dựa trên kịch bản V3 của dự án CODE THE THANKS 2026.</p>
            <p>
              Không gian được dựng bằng Three.js/Canvas. Âm môi trường và hiệu
              ứng được tổng hợp trong game.
            </p>
            <p>React, Three.js và Vite — MIT.</p>
            <p>
              Lời tri ân chỉ lưu cục bộ khi bạn chọn. Không có kết nối đăng công
              khai.
            </p>
            <p>
              Bối cảnh phòng thực hành hư cấu tại Trường Đại học Tây Nguyên.{" "}
              <a
                href="https://www.ttn.edu.vn/"
                target="_blank"
                rel="noreferrer"
              >
                Logo của nhà trường
              </a>
              .
            </p>
            <p>
              Giọng dẫn mở đầu tổng hợp:{" "}
              <a
                href="https://huggingface.co/rhasspy/piper-voices/blob/main/vi/vi_VN/vais1000/medium/MODEL_CARD"
                target="_blank"
                rel="noreferrer"
              >
                Piper / VAIS-1000 — dữ liệu CC BY 4.0
              </a>
              . Phần giới thiệu có lời dẫn; các cuộc trò chuyện để người chơi tự
              đọc phụ đề.
            </p>
            <button onClick={() => setCredits(false)}>Đóng Credits</button>
          </div>
        </div>
      )}
    </>
  );
}
