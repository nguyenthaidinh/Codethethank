import { useEffect, useRef, useState, type PointerEvent } from "react";
import { createPortal } from "react-dom";
import type { RippleAction } from "./state";
import {
  type Experiment2035,
  type Source2035,
  type Trial2035,
  type Experiment2035Action,
  sources2035,
  results2035,
  experiment2035Goal,
  compared2035,
  complete2035,
  RUN2035_SECONDS,
} from "./experiment2035";
import "./lab2035.css";
import { lab2035Help, LAB2035_HELP_DELAY } from "./lab2035Help";

function Cassette({ id }: { id: Source2035 }) {
  const color = id === "record" ? "#9dc9d0" : "#dfbe7f";
  return (
    <svg viewBox="0 0 150 62" aria-hidden="true">
      <path
        d="M9 3h127l8 9v42l-7 5H9l-5-5V9Z"
        fill="#354b53"
        stroke="#8c9d9e"
      />
      <path d="M14 10h104v33H14Z" fill="#182f39" />
      <path
        d="M19 17h53M19 24h86M19 31h69"
        stroke={color}
        strokeWidth="2"
        opacity=".7"
      />
      <circle cx="130" cy="21" r="5" fill={color} />
      <path
        d="M20 51h8m7 0h8m7 0h8m7 0h8m7 0h8m7 0h8m7 0h8"
        stroke="#c7b589"
        strokeWidth="5"
      />
      <text x="123" y="44" fill={color} fontSize="9" fontFamily="monospace">
        {sources2035[id].code}
      </text>
    </svg>
  );
}

export function LabBench2035({
  lab,
  act,
  time,
  suspended,
}: {
  lab: Experiment2035;
  act: (a: RippleAction) => void;
  time: number;
  suspended: boolean;
}) {
  const runAnchor = useRef<number | null>(null),
    input = useRef<HTMLDivElement>(null),
    ignoreClicks = useRef(0);
  const [drag, setDrag] = useState<{
    id: Source2035;
    x: number;
    y: number;
    sx: number;
    sy: number;
  } | null>(null);
  const [note, setNote] = useState(false),
    [message, setMessage] = useState("");
  const [helpOpen, setHelpOpen] = useState<"manual" | "automatic" | null>(null);
  const section = useRef<HTMLElement>(null);
  const progressKey = `${lab.loaded.join(",")}/${lab.trials.join(",")}/${lab.marked}`;
  const helpClock = useRef({ progress: progressKey, at: time });
  const help = lab2035Help(lab);
  useEffect(() => {
    const clock = helpClock.current;
    if (
      clock.progress !== progressKey ||
      time < clock.at ||
      suspended ||
      lab.running ||
      drag
    ) {
      helpClock.current = { progress: progressKey, at: time };
      return;
    }
    if (!helpOpen && time - clock.at >= LAB2035_HELP_DELAY)
      setHelpOpen("automatic");
  }, [time, progressKey, suspended, lab.running, !!drag, helpOpen]);
  const dismissHelp = () => {
    helpClock.current = { progress: progressKey, at: time };
    setHelpOpen(null);
  };
  const locateHelp = () => {
    if (!help.target) return;
    const button = section.current?.querySelector<HTMLButtonElement>(
      `[data-help-target="${help.target}"]`,
    );
    if (!button || button.disabled) return;
    button.scrollIntoView({
      block: "center",
      behavior: section.current?.closest(".motion-reduced") ? "auto" : "smooth",
    });
    button.focus({ preventScroll: true });
  };
  const send = (action: Experiment2035Action) =>
    act({ type: "lab2035", action });
  useEffect(() => {
    if (!lab.running || suspended) {
      runAnchor.current = null;
      return;
    }
    runAnchor.current ??= time - lab.running.elapsed;
    const elapsed = Math.max(lab.running.elapsed, time - runAnchor.current);
    if (elapsed > lab.running.elapsed + 0.04)
      act({ type: "lab2035", action: { type: "tick", elapsed } });
  }, [time, lab.running, suspended, act]);
  const busy = !!lab.running,
    ready = lab.enabled.includes("record"),
    both = compared2035(lab),
    done = complete2035(lab);
  const progress = lab.running ? lab.running.elapsed / RUN2035_SECONDS : 0;
  const drop = (e: PointerEvent<HTMLButtonElement>) => {
    if (!drag) return;
    const box = input.current?.getBoundingClientRect();
    const tap = Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) < 9;
    const inside =
      box &&
      e.clientX >= box.left &&
      e.clientX <= box.right &&
      e.clientY >= box.top &&
      e.clientY <= box.bottom;
    if (tap || inside) {
      send({ type: "load", source: drag.id });
      setMessage("");
    } else setMessage("Thả nguồn vào khe máy ở giữa, hoặc chạm nguồn để nạp.");
    ignoreClicks.current = performance.now() + 300;
    setDrag(null);
    if (e.currentTarget.hasPointerCapture(e.pointerId))
      e.currentTarget.releasePointerCapture(e.pointerId);
  };
  return (
    <section
      ref={section}
      className={`lab2035 ${busy ? "is-running" : ""} ${done ? "is-solved" : ""}`}
      aria-label="Bàn thử nghiệm năm 2035"
    >
      <div className="lab2035-heading">
        <div>
          <span>PHÒNG THỬ NGHIỆM / 2035</span>
          <h2>Điều mô hình không nhìn thấy.</h2>
        </div>
        <span className="lab2035-case">
          HỒ SƠ MÔ PHỎNG 12<small>Cùng một người · hai lượt thử</small>
        </span>
      </div>
      <div className="lab2035-objective-row">
        <p className="lab2035-objective" role="status">
          {message || experiment2035Goal(lab)}
        </p>
        <button
          className={`lab2035-help-toggle ${helpOpen ? "is-open" : ""}`}
          aria-label="Cần giúp?"
          aria-expanded={!!helpOpen}
          aria-controls={helpOpen ? "lab2035-help" : undefined}
          onClick={() => (helpOpen ? dismissHelp() : setHelpOpen("manual"))}
        >
          <span aria-hidden="true">?</span> Cần giúp?
        </button>
      </div>
      {helpOpen && (
        <aside
          className="lab2035-help"
          id="lab2035-help"
          aria-label="Hướng dẫn chơi 2035"
        >
          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            id="lab2035-help-copy"
          >
            <small>
              {helpOpen === "automatic"
                ? "THỬ CÁCH NÀY NHÉ"
                : "HƯỚNG DẪN THAO TÁC"}
            </small>
            <h3>{help.title}</h3>
            <ol>
              {help.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
          <div className="lab2035-help-actions">
            {help.target && (
              <button onClick={locateHelp}>
                Chỉ vị trí cần bấm <span aria-hidden="true">↗</span>
              </button>
            )}
            <button onClick={dismissHelp}>Đã hiểu</button>
          </div>
        </aside>
      )}
      <div className="lab2035-console">
        <div className="lab2035-sources">
          <h3>
            <b>01</b> Nạp nguồn dữ liệu
          </h3>
          <small className="lab2035-instruction">
            Kéo vào khe máy · hoặc chạm để nạp
          </small>
          {(Object.keys(sources2035) as Source2035[]).map((id) => {
            const loaded = lab.loaded.includes(id),
              enabled = lab.enabled.includes(id);
            return (
              <div
                className={`lab2035-source ${enabled ? "is-enabled" : ""}`}
                key={id}
              >
                <button
                  data-help-target={id}
                  data-help-active={!!helpOpen && help.target === id}
                  aria-describedby={
                    helpOpen && help.target === id
                      ? "lab2035-help-copy"
                      : undefined
                  }
                  aria-label={sources2035[id].label}
                  aria-pressed={enabled}
                  disabled={busy}
                  onPointerDown={(e) => {
                    if (loaded || busy) return;
                    e.currentTarget.setPointerCapture(e.pointerId);
                    setDrag({
                      id,
                      x: e.clientX,
                      y: e.clientY,
                      sx: e.clientX,
                      sy: e.clientY,
                    });
                  }}
                  onPointerMove={(e) => {
                    if (drag?.id === id)
                      setDrag({ ...drag, x: e.clientX, y: e.clientY });
                  }}
                  onPointerUp={drop}
                  onPointerCancel={() => setDrag(null)}
                  onClick={(e) => {
                    if (
                      e.detail > 0 &&
                      performance.now() < ignoreClicks.current
                    )
                      return;
                    send({ type: loaded ? "toggle" : "load", source: id });
                    setMessage("");
                  }}
                >
                  <Cassette id={id} />
                  <span>
                    {sources2035[id].label}
                    <small>
                      {loaded
                        ? enabled
                          ? "● Đang bật · chạm để tắt"
                          : "○ Đang tắt · chạm để bật"
                        : "↗ Chạm hoặc kéo để nạp"}
                    </small>
                  </span>
                </button>
                {loaded && (
                  <p className="lab2035-source-detail">
                    {sources2035[id].detail}
                  </p>
                )}
                {id === "access" && both && !done && (
                  <button
                    className="lab2035-mark"
                    data-help-target="mark"
                    data-help-active={!!helpOpen && help.target === "mark"}
                    disabled={busy}
                    onClick={() => send({ type: "mark" })}
                  >
                    Đánh dấu dữ liệu bị bỏ sót ↗
                  </button>
                )}
              </div>
            );
          })}
        </div>
        <div
          className={`lab2035-machine ${drag ? "awaits-source" : ""}`}
          ref={input}
          data-testid="lab2035-input"
        >
          <h3>
            <b>02</b> Chạy cùng một hồ sơ
          </h3>
          <svg
            className="lab2035-device"
            viewBox="0 0 310 175"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="lab35-shell" x2="0" y2="1">
                <stop stopColor="#506872" />
                <stop offset="1" stopColor="#273f49" />
              </linearGradient>
            </defs>
            <path
              d="M12 16 28 4h254l16 12v143l-10 10H23l-11-10Z"
              fill="url(#lab35-shell)"
              stroke="#92a9ad"
            />
            <rect
              x="76"
              y="20"
              width="204"
              height="114"
              rx="5"
              fill="#0b222d"
              stroke="#6a8992"
            />
            <text x="92" y="43" fill="#8eb4b9" fontSize="10">
              HỒ SƠ 12 / MÔ PHỎNG
            </text>
            <text
              x="92"
              y="76"
              fill={busy ? "#e5cd96" : "#d1e2da"}
              fontSize="17"
            >
              {busy ? "ĐANG CHẠY…" : ready ? "SẴN SÀNG" : "CHỜ DỮ LIỆU"}
            </text>
            <text x="92" y="100" fill="#8cb0b5" fontSize="10">
              {lab.enabled.includes("access")
                ? "+ Điều kiện thực hành"
                : "Chỉ kết quả học tập"}
            </text>
            {["record", "access"].map((id, i) => (
              <g
                key={id}
                opacity={lab.enabled.includes(id as Source2035) ? 1 : 0.25}
              >
                <rect
                  x="23"
                  y={49 + i * 48}
                  width="35"
                  height="13"
                  rx="2"
                  fill="#0a1f28"
                  stroke={i ? "#dfbe7f" : "#9dc9d0"}
                />
                <path
                  d={`M58 ${55 + i * 48}h12`}
                  stroke={i ? "#dfbe7f" : "#9dc9d0"}
                  strokeWidth="2"
                />
                <circle
                  cx={31 + progress * 22}
                  cy={55 + i * 48}
                  r="3"
                  fill={i ? "#dfbe7f" : "#9dc9d0"}
                />
              </g>
            ))}
            <path d="M80 149h130" stroke="#152d37" strokeWidth="7" />
            <path
              d={`M80 149h${130 * progress}`}
              stroke="#d0bd8d"
              strokeWidth="5"
            />
            <circle
              cx="263"
              cy="149"
              r="5"
              fill={busy ? "#dfbe7f" : "#9dc9d0"}
            />
          </svg>
          <button
            className="lab2035-run-button"
            data-help-target="run"
            data-help-active={!!helpOpen && help.target === "run"}
            aria-label="Chạy thử nghiệm"
            disabled={!ready || busy}
            onClick={() => {
              setMessage("");
              send({ type: "run" });
            }}
          >
            {busy ? "Đang thử nghiệm…" : "Chạy thử"}
            <span aria-hidden="true">▶</span>
          </button>
          <small className="lab2035-instruction">
            {!ready
              ? "Cần bật nguồn dữ liệu học tập."
              : "Bật/tắt nguồn để thử cách nhìn khác."}
          </small>
          {busy && (
            <div
              className="lab2035-progress"
              role="progressbar"
              aria-label="Tiến trình thử nghiệm"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress * 100)}
            >
              <i style={{ width: `${progress * 100}%` }} />
            </div>
          )}
        </div>
        <div className="lab2035-prints">
          <h3>
            <b>03</b> Đối chiếu hai bản in
          </h3>
          {([1, 3] as Trial2035[]).map((mask) => (
            <article
              className={`lab2035-print ${lab.trials.includes(mask) ? "has-result" : ""} ${mask === 3 ? "with-context" : ""}`}
              key={mask}
              aria-label={`Kết quả ${mask === 1 ? "A" : "B"}`}
            >
              <small>
                PHÉP THỬ {mask === 1 ? "A" : "B"} <span>HỒ SƠ 12</span>
              </small>
              {lab.trials.includes(mask) ? (
                <>
                  <strong>{results2035[mask].title}</strong>
                  <p>{results2035[mask].label}</p>
                  <small>
                    {mask === 1 ? "Chỉ dữ liệu học tập" : "+ Nhật ký dùng máy"}
                  </small>
                </>
              ) : (
                <p className="lab2035-unprinted">
                  {mask === 1
                    ? "Chưa thử với dữ liệu học tập."
                    : "Chưa thử khi thêm điều kiện học."}
                </p>
              )}
            </article>
          ))}
        </div>
        <span className="lab2035-screw screw-left" aria-hidden="true" />
        <span className="lab2035-screw screw-right" aria-hidden="true" />
      </div>
      <footer className="lab2035-footer">
        <button
          className="lab2035-note-button"
          aria-expanded={note}
          onClick={() => {
            setNote(!note);
            send({ type: "note" });
          }}
        >
          ↗ Ghi chú đồng đội
        </button>
        {done ? (
          <button
            className="lab2035-finish"
            data-help-target="finish"
            data-help-active={!!helpOpen && help.target === "finish"}
            onClick={() => act({ type: "object" })}
          >
            Tiếp: sửa logic <span aria-hidden="true">→</span>
          </button>
        ) : (
          <span>
            {both
              ? "Giữ hai bản in, tìm phần thông tin mới."
              : "Không đổi người. Chỉ thay nguồn thông tin."}
          </span>
        )}
      </footer>
      {note && (
        <aside className="lab2035-note">
          <button aria-label="Gấp ghi chú" onClick={() => setNote(false)}>
            ×
          </button>
          <small>GHI CHÚ CỦA ĐỒNG ĐỘI</small>
          <p>Người này chưa có máy riêng, đang xin thêm giờ dùng phòng máy.</p>
          <p>
            Giữ nguyên hồ sơ giữa hai lượt. Chỉ thay thông tin về điều kiện thực
            hành.
          </p>
        </aside>
      )}
      {done && (
        <p className="lab2035-discovery" role="status">
          Đã xác định: điều kiện thực hành bị bỏ sót. Cần người xác minh, chưa
          tự động duyệt hỗ trợ.
        </p>
      )}
      {drag &&
        createPortal(
          <div
            className="lab2035-drag"
            aria-hidden="true"
            style={{ left: drag.x, top: drag.y }}
          >
            <Cassette id={drag.id} />
            <span>{sources2035[drag.id].label}</span>
          </div>,
          document.fullscreenElement ?? document.body,
        )}
    </section>
  );
}
