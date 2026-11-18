import { useState } from "react";
import type { FinaleAction, FinaleSave } from "./state";
import type { Letter } from "./letter";
import { revealLetter, revealPages } from "./reveal";
import { PublicReceipt } from "./PublicSharing";
import { usePublicSharing } from "./public-sharing";
import "./cinematic-reveal.css";

export function RevealControls({
  s,
  letter,
  persisted,
  erase,
  act,
}: {
  s: FinaleSave;
  letter: Letter;
  persisted: boolean;
  erase: () => void;
  act: (action: FinaleAction) => void;
}) {
  const { receipt } = usePublicSharing();
  const content = revealLetter(s, letter),
    pages = revealPages(content.message);
  const [selection, setSelection] = useState({ key: "", index: 0 });
  const index =
    selection.key === content.message
      ? Math.min(selection.index, pages.length - 1)
      : 0;
  const move = (next: number) =>
    setSelection({
      key: content.message,
      index: Math.max(0, Math.min(pages.length - 1, next)),
    });
  const status =
    s.choice === "skip"
      ? "Không tạo lời nhắn · Chưa công khai."
      : persisted
        ? "Bản nháp riêng tư lưu trên thiết bị này."
        : letter.local
          ? "Chưa có bản lưu trên thiết bị · Chỉ giữ trong phiên này."
          : "Bản nháp chỉ giữ trong phiên này.";
  return (
    <>
      <p className="reveal-topline">
        {s.choice === "skip" ? "Một bài học còn sáng" : "Lời tri ân của bạn"}
      </p>
      <section
        className="reveal-screen-copy"
        aria-label={
          s.starSeen ? "Ngôi sao của tôi" : "Lời tri ân trên màn hình"
        }
        tabIndex={0}
        data-reveal-page={index + 1}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
            e.preventDefault();
            move(index + (e.key === "ArrowRight" ? 1 : -1));
          }
        }}
      >
        <span className="reveal-kicker">
          {s.choice === "skip" ? "KÝ ỨC" : "NGÔI SAO RIÊNG TƯ"}
        </span>
        <h2>{content.recipient}</h2>
        <p className="reveal-message">{pages[index]}</p>
        {content.signature && (
          <p className="reveal-signature">— {content.signature}</p>
        )}
        {pages.length > 1 && (
          <nav className="reveal-pages" aria-label="Các trang lời nhắn">
            <button
              onClick={() => move(index - 1)}
              disabled={index === 0}
              aria-label="Trang lời nhắn trước"
            >
              ←
            </button>
            <span aria-live="polite">
              Trang {index + 1} / {pages.length}
            </span>
            <button
              onClick={() => move(index + 1)}
              disabled={index === pages.length - 1}
              aria-label="Trang lời nhắn sau"
            >
              →
            </button>
          </nav>
        )}
        <small>{status}</small>
      </section>
      <div className="reveal-actions">
        {!s.starSeen ? (
          <button
            aria-label="Nhìn gần ngôi sao của tôi"
            onClick={() => act({ type: "star" })}
          >
            Đến gần lời cảm ơn
          </button>
        ) : (
          s.choice === "letter" && (
            <button onClick={erase}>Xóa nội dung đã lưu</button>
          )
        )}
        <button
          className="reveal-continue"
          onClick={() => act({ type: "finish" })}
        >
          {s.completed ? "Trở lại kết thúc" : "Đi tiếp cùng ánh sáng"}
        </button>
      </div>
      {receipt && (
        <details className="reveal-public-receipt">
          <summary>Bản gửi Live Wall · Xem / gỡ</summary>
          <PublicReceipt />
        </details>
      )}
      <p className="galaxy-truth">
        Không gian cá nhân · Không phải bài đăng cộng đồng.
      </p>
    </>
  );
}
