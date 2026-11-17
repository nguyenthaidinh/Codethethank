import type { RippleAction } from "./state";
import { durations } from "./state";
import "./launch2045.css";

export function LaunchReview2045({
  open,
  time,
  act,
}: {
  open: boolean;
  time: number;
  act: (action: RippleAction) => void;
}) {
  const progress = Math.min(
    100,
    Math.max(0, (time / durations.milestone!) * 100),
  );
  return (
    <section
      className={`launch2045 ${open ? "is-open" : ""}`}
      aria-label="AION · Kiểm thử trước ra mắt năm 2045"
    >
      <div className="launch2045-atmosphere" aria-hidden="true" />
      <div className="launch2045-orbit-field" aria-hidden="true">
        <svg
          className="launch2045-orbit"
          viewBox="0 0 720 720"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="360" cy="360" r="276" />
          <circle cx="360" cy="360" r="225" strokeDasharray="2 13" />
          <ellipse
            cx="360"
            cy="360"
            rx="322"
            ry="132"
            transform="rotate(-29 360 360)"
          />
          <path d="M85 358H635M360 84V636M164 164l392 392" />
          <circle className="launch2045-orbit-node" cx="360" cy="84" r="5" />
          <circle className="launch2045-orbit-node" cx="586" cy="517" r="4" />
          <circle className="launch2045-orbit-node" cx="123" cy="224" r="3" />
        </svg>
      </div>
      <header className="launch2045-header">
        <div className="launch2045-brand">
          <span aria-hidden="true">Λ</span>
          <div>
            AION<small>RESEARCH LAB</small>
          </div>
        </div>
        <span className="launch2045-edition">
          TƯ LIỆU NGHIÊN CỨU <i /> 03 / 2045
        </span>
      </header>
      <div className="launch2045-body">
        <div className="launch2045-intro">
          <span className="launch2045-eyebrow">
            <i /> 2045 · TRƯỚC NGÀY RA MẮT
          </span>
          <h2>
            Trước ngày
            <br />
            <em>ra mắt.</em>
          </h2>
          <p>
            Những lần kiểm thử cuối cùng. Một nguyên tắc từ cuốn sổ năm ấy vẫn
            được giữ lại.
          </p>
          <blockquote>
            <span>ĐIỀU CỐT LÕI</span>Khi chưa hiểu đủ,
            <br />
            đừng vội kết luận.
          </blockquote>
        </div>
        <div className="launch2045-object">
          <div className="launch2045-paper">
            <div className="launch2045-paper-meta">
              <span>AION / KIỂM THỬ</span>
              <span>2045</span>
            </div>
            {!open ? (
              <>
                <span className="launch2045-paper-kicker">
                  NGUYÊN TẮC TRƯỚC KHI RA MẮT
                </span>
                <h3>
                  Quyền được
                  <br />
                  xem xét lại.
                </h3>
                <ol className="launch2045-criteria">
                  <li>
                    <span>01</span>
                    <div>
                      <strong>Thông tin đầu vào</strong>
                      <small>Đã hiểu đủ hoàn cảnh?</small>
                    </div>
                  </li>
                  <li>
                    <span>02</span>
                    <div>
                      <strong>Kết quả dự đoán</strong>
                      <small>Còn điều gì chưa chắc?</small>
                    </div>
                  </li>
                  <li>
                    <span>03</span>
                    <div>
                      <strong>Quyết định về con người</strong>
                      <small>Ai sẽ xem xét lại?</small>
                    </div>
                  </li>
                </ol>
                <button
                  className="launch2045-open"
                  aria-label="Mở sổ kiểm thử trước ra mắt"
                  onClick={() => act({ type: "object" })}
                >
                  <span>
                    Mở sổ kiểm thử<small>Đọc nguyên tắc được giữ lại</small>
                  </span>
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M6 18 18 6M6 6h12v12"
                      stroke="currentColor"
                      strokeWidth="1.4"
                    />
                  </svg>
                </button>
              </>
            ) : (
              <div className="launch2045-note" role="status">
                <span className="launch2045-paper-kicker">
                  NGUYÊN TẮC ĐƯỢC GIỮ LẠI
                </span>
                <h3>
                  AI đề xuất.
                  <br />
                  Con người
                  <br />
                  <em>xem xét.</em>
                </h3>
                <p>
                  Thông tin chưa đủ?
                  <br />
                  Xác minh trước khi quyết định.
                </p>
                <div className="launch2045-seal">
                  <span>HUMAN REVIEW</span>
                  <small>Xem xét thêm ≠ tự động chấp nhận</small>
                </div>
              </div>
            )}
            <span className="launch2045-paper-foot">
              MỘT BÀI HỌC TỪ NĂM 2026
            </span>
          </div>
          {open && (
            <div className="launch2045-progress">
              <span>
                HÀNH TRÌNH TIẾP NỐI <small>2046 →</small>
              </span>
              <div
                role="progressbar"
                aria-label="Chuyển sang năm 2046"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(progress)}
              >
                <i style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
        </div>
      </div>
      <footer className="launch2045-footer">
        <span>
          03 <i /> THE RIPPLE
        </span>
        <ol aria-label="Hành trình nghiên cứu">
          <li>2029</li>
          <li>2035</li>
          <li aria-current="step">2045</li>
        </ol>
        <small>Từ một câu hỏi, qua nhiều năm.</small>
      </footer>
    </section>
  );
}
