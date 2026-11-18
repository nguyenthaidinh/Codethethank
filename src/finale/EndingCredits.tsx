import { useEffect, useRef } from "react";
import "./ending-credits.css";

export function EndingCredits({ onClose }: { onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const element = dialog.current;
    element?.showModal();
    return () => {
      element?.close();
      if (previous?.isConnected) previous.focus();
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      className="ending-credits"
      aria-labelledby="credits-title"
      onCancel={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") event.stopPropagation();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="ending-credits-inner">
        <header className="ending-credits-header">
          <span>PHÍA SAU CÂU CHUYỆN</span>
          <button
            className="ending-credits-close"
            aria-label="Đóng"
            onClick={onClose}
            autoFocus
          >
            ×
          </button>
          <h2 id="credits-title">
            THE UNWRITTEN <em>LESSON</em>
          </h2>
          <p>
            Một câu chuyện nhỏ.
            <br />
            Dành cho những người đã giúp ta trưởng thành.
          </p>
        </header>
        <div className="ending-credits-sections">
          <section>
            <span className="ending-credit-number">01</span>
            <div>
              <h3>Câu chuyện</h3>
              <p>
                Dựa trên kịch bản V3 của dự án{" "}
                <strong>CODE THE THANKS 2026</strong> — về cơ hội, sự kiên nhẫn
                và người thầy đã chọn ở lại.
              </p>
            </div>
          </section>
          <section>
            <span className="ending-credit-number">02</span>
            <div>
              <h3>Ngôi trường trong ký ức</h3>
              <p>
                Trường Đại học Tây Nguyên. Bối cảnh phòng thực hành trong câu
                chuyện là hư cấu; ảnh trường ở màn kết được biên tập từ ảnh tham
                chiếu do tác giả cung cấp.
              </p>
            </div>
          </section>
          <section>
            <span className="ending-credit-number">03</span>
            <div>
              <h3>Lời tri ân</h3>
              <p>
                Gửi những người thầy, người cô đã lắng nghe, dìu dắt và cho học
                trò can đảm thử thêm một lần nữa.
              </p>
            </div>
          </section>
        </div>
        <details className="ending-credits-details">
          <summary>
            Công nghệ & nguồn sử dụng <span aria-hidden="true">＋</span>
          </summary>
          <div>
            <p>
              React, Three.js và Vite — MIT. Không gian dùng Three.js/Canvas;
              hiệu ứng và âm môi trường được tổng hợp trong game. Ảnh nền màn
              kết được chỉnh bằng ImageGen từ ảnh tham chiếu.
            </p>
            <p>
              <a
                href="https://www.ttn.edu.vn/"
                target="_blank"
                rel="noreferrer"
              >
                Nguồn logo Trường Đại học Tây Nguyên ↗
              </a>
            </p>
            <p>
              Giọng dẫn mở đầu:{" "}
              <a
                href="https://huggingface.co/rhasspy/piper-voices/blob/main/vi/vi_VN/vais1000/medium/MODEL_CARD"
                target="_blank"
                rel="noreferrer"
              >
                Piper / VAIS-1000 — dữ liệu CC BY 4.0 ↗
              </a>
              . Giọng AION năm 2046 sử dụng giọng tổng hợp tiếng Việt Nam Minh.
            </p>
            <p>
              Bản nháp chỉ lưu riêng khi bạn chọn. Chỉ thao tác gửi có xác nhận
              mới đưa bản sao lời chúc lên Live Wall; bạn có thể gỡ bản công
              khai.
            </p>
          </div>
        </details>
        <footer>
          <span>Cảm ơn bạn đã là một phần của hành trình.</span>
          <button onClick={onClose}>
            Đóng Credits <span aria-hidden="true">↗</span>
          </button>
        </footer>
      </div>
    </dialog>
  );
}
