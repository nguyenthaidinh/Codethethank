import type { RippleAction, RippleSave } from "./state";

/** Two notes to inspect, explicitly not an either/or quiz. */
export function SketchQuestions({
  s,
  act,
}: {
  s: RippleSave;
  act: (action: RippleAction) => void;
}) {
  const complete = s.questions.length === 2;
  return (
    <section className="ripple-sketch" aria-label="Hai dòng trong sổ của An">
      <header>
        <span>CUỐN SỔ / 2026</span>
        <h2>Nối lại hai dòng An đã viết.</h2>
      </header>
      <p className="ripple-sketch-guide" role="status">
        {complete
          ? "Hai ý đã nối. Khi chưa hiểu đủ, cần có người xem xét thêm."
          : `Chạm cả hai dòng trong sổ · ${s.questions.length}/2 đã đọc`}
      </p>
      <div className="ripple-sketch-lines">
        <button
          aria-label="Ai dễ tiến bộ nhất?"
          aria-pressed={s.questions.includes("prediction")}
          onClick={() => act({ type: "question", id: "prediction" })}
        >
          <span aria-hidden="true">
            {s.questions.includes("prediction") ? "✓" : "01"}
          </span>
          <span>
            Ai dễ tiến bộ nhất?<small>Điều mô hình đang dự đoán.</small>
          </span>
        </button>
        <i aria-hidden="true">→</i>
        <button
          aria-label="Ai còn cần cơ hội?"
          aria-pressed={s.questions.includes("opportunity")}
          onClick={() => act({ type: "question", id: "opportunity" })}
        >
          <span aria-hidden="true">
            {s.questions.includes("opportunity") ? "✓" : "02"}
          </span>
          <span>
            Ai còn cần cơ hội?<small>Điều một dự đoán chưa nói hết.</small>
          </span>
        </button>
      </div>
      <button
        className="ripple-sketch-confirm"
        aria-label="Khôi phục HUMAN REVIEW"
        disabled={!complete}
        onClick={() => act({ type: "reframe" })}
      >
        Thêm bước con người xem xét <span aria-hidden="true">↗</span>
      </button>
      <small className="ripple-sketch-footnote">
        HUMAN REVIEW · Xác minh thêm trước khi quyết định hỗ trợ.
      </small>
    </section>
  );
}
