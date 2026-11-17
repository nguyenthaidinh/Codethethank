import type { RippleAction } from "./state";
import { ResearchEraHUD } from "./ResearchEraHUD";

export function ResearchJournal2029({
  open,
  act,
}: {
  open: boolean;
  act: (action: RippleAction) => void;
}) {
  return (
    <section
      className={`research-2029 ${open ? "is-open" : ""}`}
      aria-label="Nhật ký thử nghiệm của An năm 2029"
    >
      {!open ? (
        <ResearchEraHUD year={2029} act={act} />
      ) : (
        <div
          className="research-open-spread"
          role="region"
          aria-label="Hai trang nhật ký thử nghiệm"
        >
          <div className="research-page research-page-left">
            <span className="research-page-heading">
              AN / NHẬT KÝ NGHIÊN CỨU
            </span>
            <small className="research-date">2029</small>
            <h2>Chưa đạt.</h2>
            <p className="research-handwritten">
              Thử nghiệm lại thất bại.
              <br />
              Nhưng câu hỏi vẫn còn.
            </p>
            <span className="research-page-number">01 / KẾT QUẢ</span>
          </div>
          <div className="research-page research-page-right">
            <span className="research-page-heading">
              GHI CHÚ CHO LẦN THỬ TIẾP THEO
            </span>
            <p className="research-code">
              MISSING CONTEXT<span>↓</span>
              <strong>REVIEW REQUIRED</strong>
            </p>
            <p>
              Xác minh hoàn cảnh
              <br />
              trước khi quyết định hỗ trợ.
            </p>
            <small className="research-margin-note">
              Xem xét thêm ≠ tự động chấp nhận.
            </small>
            <span className="research-page-number">02 / BƯỚC TIẾP THEO</span>
          </div>
        </div>
      )}
    </section>
  );
}
