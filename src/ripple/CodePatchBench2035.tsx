import { useEffect, useRef, useState } from "react";
import type { RippleAction } from "./state";
import {
  type CodePatch2035,
  type CodePatch2035Action,
  type Condition2035,
  type Decision2035,
  conditions2035,
  decisions2035,
  evaluatePatch2035,
  outcomes2035,
  PATCH2035_SECONDS,
} from "./codePatch2035";
import "./code2035.css";

export function CodePatchBench2035({
  patch,
  act,
  time,
  suspended,
}: {
  patch: CodePatch2035;
  act: (a: RippleAction) => void;
  time: number;
  suspended: boolean;
}) {
  const [slot, setSlot] = useState<"condition" | "decision" | null>(
    "condition",
  );
  const [hint, setHint] = useState(false);
  const anchor = useRef<number | null>(null);
  const sourceView = useRef<HTMLDivElement>(null);
  const testView = useRef<HTMLDivElement>(null);
  const optionsView = useRef<HTMLFieldSetElement>(null);
  const busy = patch.status === "testing",
    passed = patch.status === "passed";
  const send = (action: CodePatch2035Action) =>
    act({ type: "lab2035", action: { type: "code", action } });
  useEffect(() => {
    if (slot) optionsView.current?.scrollIntoView({ block: "nearest" });
  }, [slot]);
  useEffect(() => {
    if (busy && window.matchMedia("(max-width: 700px)").matches)
      testView.current?.scrollIntoView({
        block: "nearest",
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      });
  }, [busy]);
  useEffect(() => {
    if (!busy || suspended) {
      anchor.current = null;
      return;
    }
    anchor.current ??= time - patch.elapsed;
    const elapsed = Math.max(patch.elapsed, time - anchor.current);
    if (elapsed > patch.elapsed + 0.04)
      act({
        type: "lab2035",
        action: { type: "code", action: { type: "tick", elapsed } },
      });
  }, [time, busy, patch.elapsed, suspended, act]);
  const results = evaluatePatch2035(patch.condition, patch.decision);
  const visible = busy
    ? Math.floor((patch.elapsed / PATCH2035_SECONDS) * 4)
    : patch.checked
      ? 4
      : 0;
  const failure =
    patch.checked && !passed ? results.find((t) => !t.passed) : undefined;
  const explanation =
    patch.decision === "approve"
      ? "Chưa đủ thông tin thì cần xác minh, chưa tự động chấp nhận hỗ trợ."
      : patch.decision === "reject"
        ? "Nhánh này vẫn kết luận từ chối ngay. Hãy thử một cách xử lý cho phép xem xét thêm."
        : patch.condition === "always"
          ? "Mọi hồ sơ đều bị giữ lại. Thử chỉ áp dụng nhánh này khi thiếu bối cảnh hoặc chưa đủ tin cậy."
          : "Dự đoán thấp chưa nói hết vấn đề. Kiểm tra cả bối cảnh và độ tin cậy của dự đoán.";
  return (
    <section
      className={`code2035 ${passed ? "is-passed" : ""}`}
      aria-label="Thử thách sửa logic 2035"
    >
      <header className="code2035-heading">
        <div>
          <span>2035 / TỪ PHÁT HIỆN ĐẾN THIẾT KẾ</span>
          <h2>Một nhánh code còn thiếu.</h2>
        </div>
        <button
          className="code2035-hint-toggle"
          aria-expanded={hint}
          onClick={() => setHint(!hint)}
        >
          Gợi ý
        </button>
      </header>
      <p className="code2035-brief">
        Bạn đã tìm ra thông tin bị bỏ sót. Giờ chọn hai dòng code để trường hợp
        chưa rõ được chuyển người phụ trách xem xét.
      </p>
      {hint && (
        <aside className="code2035-hint" role="status">
          <strong>Cần hỏi thêm khi nào?</strong>
          <p>
            Khi thiếu bối cảnh <b>hoặc</b> dự đoán chưa đủ tin cậy. Chuyển sang
            xem xét thêm sẽ giữ cơ hội xác minh; chưa tự động duyệt hỗ trợ.
          </p>
        </aside>
      )}
      <div className="code2035-workbench">
        <div className="code2035-editor" ref={sourceView}>
          <div className="code2035-file">
            <span aria-hidden="true">● ● ●</span>
            <span>support_policy.ts</span>
            <small>BẢN TÁI DỰNG</small>
          </div>
          <p className="code2035-editor-hint">
            Bấm hai dòng có viền để chọn cách sửa. Bạn không cần gõ code.
          </p>
          {slot && !busy && !passed && (
            <fieldset className="code2035-options" ref={optionsView}>
              <legend>
                {slot === "condition"
                  ? "① Khi nào cần dừng để xem xét?"
                  : "② Khi gặp trường hợp đó, chương trình làm gì?"}
              </legend>
              {slot === "condition"
                ? (Object.keys(conditions2035) as Condition2035[]).map((id) => (
                    <button
                      key={id}
                      aria-label={conditions2035[id].label}
                      aria-pressed={patch.condition === id}
                      onClick={() => {
                        send({ type: "condition", value: id });
                        setSlot("decision");
                      }}
                    >
                      <span aria-hidden="true">
                        {patch.condition === id ? "●" : "○"}
                      </span>
                      <span>
                        <strong>{conditions2035[id].label}</strong>
                        <small>{conditions2035[id].detail}</small>
                      </span>
                    </button>
                  ))
                : (Object.keys(decisions2035) as Decision2035[]).map((id) => (
                    <button
                      key={id}
                      aria-label={decisions2035[id].label}
                      aria-pressed={patch.decision === id}
                      onClick={() => {
                        send({ type: "decision", value: id });
                        setSlot(null);
                      }}
                    >
                      <span aria-hidden="true">
                        {patch.decision === id ? "●" : "○"}
                      </span>
                      <span>
                        <strong>{decisions2035[id].label}</strong>
                        <small>{decisions2035[id].detail}</small>
                      </span>
                    </button>
                  ))}
            </fieldset>
          )}
          <div className="code2035-source" aria-label="Quy tắc xử lý hồ sơ">
            <div>
              <i aria-hidden="true">01</i>
              <code>
                <em>function</em> nextSupportStep(profile, prediction) {"{"}
              </code>
            </div>
            <div>
              <i aria-hidden="true">02</i>
              <code>
                {" "}
                <em>if</em> (
              </code>
            </div>
            <div className="code2035-edit-line">
              <i aria-hidden="true">03</i>
              <button
                aria-label="Chọn điều kiện"
                aria-expanded={slot === "condition"}
                disabled={busy || passed}
                onClick={() =>
                  setSlot(slot === "condition" ? null : "condition")
                }
              >
                <code>{conditions2035[patch.condition].code}</code>
                <small>① Chọn điều kiện ▾</small>
              </button>
            </div>
            <div>
              <i aria-hidden="true">04</i>
              <code> ) {"{"}</code>
            </div>
            <div className="code2035-edit-line">
              <i aria-hidden="true">05</i>
              <button
                aria-label="Chọn cách xử lý"
                aria-expanded={slot === "decision"}
                disabled={busy || passed}
                onClick={() => setSlot(slot === "decision" ? null : "decision")}
              >
                <code>
                  <em>return</em> {decisions2035[patch.decision].code};
                </code>
                <small>② Chọn cách xử lý ▾</small>
              </button>
            </div>
            <div>
              <i aria-hidden="true">06</i>
              <code> {"}"}</code>
            </div>
            <div>
              <i aria-hidden="true">07</i>
              <code>
                {" "}
                <em>return</em> NEXT_SUPPORT_STEP;
              </code>
            </div>
            <div>
              <i aria-hidden="true">08</i>
              <code>{"}"}</code>
            </div>
          </div>
        </div>
        <div
          className="code2035-tests"
          ref={testView}
          aria-label="Kết quả kiểm thử logic"
        >
          <div className="code2035-tests-title">
            <span>KIỂM THỬ THIẾT KẾ</span>
            <small>
              {busy
                ? "Đang chạy…"
                : passed
                  ? "4/4 ca đạt"
                  : patch.checked
                    ? "Cần điều chỉnh"
                    : "Chưa chạy"}
            </small>
          </div>
          <ol>
            {results.map((test, i) => {
              const shown = i < visible;
              return (
                <li
                  key={test.id}
                  className={
                    shown
                      ? test.passed
                        ? "test-pass"
                        : "test-fail"
                      : "test-wait"
                  }
                >
                  <span className="code2035-test-mark" aria-hidden="true">
                    {shown ? (test.passed ? "✓" : "×") : "·"}
                  </span>
                  <div>
                    <strong>{test.label}</strong>
                    {shown ? (
                      <>
                        <span>Nhận: {outcomes2035[test.actual]}</span>
                        {!test.passed && (
                          <small>Cần: {outcomes2035[test.expected]}</small>
                        )}
                      </>
                    ) : (
                      <span>Chờ kiểm thử</span>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
          {busy && (
            <div
              className="code2035-progress"
              role="progressbar"
              aria-label="Tiến trình kiểm thử code"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(
                (patch.elapsed / PATCH2035_SECONDS) * 100,
              )}
            >
              <i
                style={{
                  width: `${(patch.elapsed / PATCH2035_SECONDS) * 100}%`,
                }}
              />
            </div>
          )}
          <div
            className={`code2035-feedback ${passed ? "success" : ""}`}
            role="status"
          >
            {passed ? (
              <>
                <strong>Bản sửa đã vượt qua bốn ca kiểm thử.</strong>
                <p>
                  Hồ sơ chưa rõ được xem xét thêm. Các trường hợp đủ thông tin
                  vẫn đi tiếp sang đề xuất bước hỗ trợ.
                </p>
              </>
            ) : failure ? (
              <>
                <strong>Ca “{failure.label}” chưa đạt.</strong>
                <p>{explanation}</p>
                <button
                  className="code2035-retry"
                  onClick={() => {
                    setSlot("condition");
                    sourceView.current?.scrollIntoView({ block: "nearest" });
                  }}
                >
                  Sửa lại hai dòng ↑
                </button>
              </>
            ) : (
              <p>
                Chọn hai dòng, rồi bấm “Chạy kiểm thử”. Bạn có thể thử lại hoặc
                bỏ qua riêng phần code.
              </p>
            )}
          </div>
          <p className="code2035-note">
            REVIEW REQUIRED = xem xét thêm, chưa phải chấp nhận hỗ trợ.
          </p>
        </div>
      </div>
      <footer className="code2035-footer">
        <div>
          <button
            className="code2035-skip"
            disabled={passed}
            onClick={() => send({ type: "skip" })}
          >
            Bỏ qua thử thách code
          </button>
          <small>Chỉ bỏ qua phần sửa code. Câu chuyện vẫn tiếp tục.</small>
        </div>
        {passed ? (
          <button
            className="code2035-primary"
            onClick={() => act({ type: "object" })}
          >
            Lưu bản sửa và tiếp tục <span aria-hidden="true">→</span>
          </button>
        ) : (
          <button
            className="code2035-primary"
            disabled={busy}
            onClick={() => {
              setSlot(null);
              send({ type: "test" });
            }}
          >
            {busy ? "Đang kiểm thử…" : "Chạy kiểm thử"}
            <span aria-hidden="true">▶</span>
          </button>
        )}
      </footer>
    </section>
  );
}
