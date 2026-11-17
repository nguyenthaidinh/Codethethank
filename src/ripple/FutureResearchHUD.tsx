import type { CSSProperties } from "react";
import {
  founderRevealed,
  durations,
  type RippleSave,
  type RippleAction,
  type MemoryId,
} from "./state";
import { memories } from "./story";
import "./future2046.css";

export const isFutureResearchPhase = (s: RippleSave) =>
  !["sketch", "change", "years", "milestone", "echo"].includes(s.phase);

function ArchiveIcon({ kind = "design" }: { kind?: MemoryId }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      aria-hidden="true"
    >
      {kind === "stayed" ? (
        <path d="M13 26V11q0-3 3-3h16q3 0 3 3v15M11 27h26v5H11zM14 32v10m20-10v10M16 12h16v11H16z" />
      ) : kind === "evaluation" ? (
        <>
          <path d="M12 6h18l7 7v29H12zM30 6v8h7M18 21h13m-13 5h13m-13 5h8" />
          <path d="m28 35 3 3 7-8" />
        </>
      ) : (
        <path d="M9 8h26q4 0 4 4v29H13q-4 0-4-4zm6 0v33M21 17h12m-12 6h12m-12 6h8M9 34h6" />
      )}
    </svg>
  );
}

export function FutureResearchHUD({
  s,
  act,
  time,
}: {
  s: RippleSave;
  act: (action: RippleAction) => void;
  time: number;
}) {
  const overview = s.phase === "world" || s.phase === "record";
  const progress = Math.min(1, time / durations.align!);
  const overviewOpacity =
    s.phase === "world" ? Math.max(0, Math.min(1, (time - 4.3) / 1.4)) : 1;
  return (
    <section
      className={`future-research-hud future2046 is-${s.phase}`}
      aria-label="AION 2046 · Không gian nghiên cứu"
    >
      <header className="future2046-header">
        <div className="future2046-brand">
          <span aria-hidden="true">Λ</span>
          <div>
            AION<small>RESEARCH INSTITUTE</small>
          </div>
        </div>
        <div className="future2046-location">
          <i />
          <span>2046</span>
          <small>HUMAN REVIEW</small>
        </div>
      </header>
      {overview && (
        <div
          className="future2046-overview"
          style={{ opacity: overviewOpacity }}
        >
          <div className="future2046-intro">
            <span className="future2046-eyebrow">
              <i /> HAI MƯƠI NĂM SAU
            </span>
            <h2>
              Một kỷ nguyên mới.<em>Một bài học ở lại.</em>
            </h2>
            <p>
              Giữa những điều đã đổi thay,
              <br />
              cuốn sổ năm ấy vẫn được giữ gìn.
            </p>
          </div>
          {s.phase === "record" && (
            <article className="future2046-archive">
              <div className="future2046-archive-top">
                <span>TƯ LIỆU GỐC</span>
                <small>01 / 03</small>
              </div>
              <div className="future2046-archive-body">
                <ArchiveIcon />
                <div>
                  <h3>Dấu vết từ cuốn sổ</h3>
                  <p>
                    Hồ sơ nhà sáng lập được lưu
                    <br />
                    cùng trang viết đầu tiên.
                  </p>
                </div>
              </div>
              <div
                className="future2046-date-line"
                aria-label="Từ năm 2026 đến năm 2046"
              >
                <span>2026</span>
                <i />
                <span>2046</span>
              </div>
              <button
                className="future2046-open"
                aria-label="Đối chiếu hồ sơ nhà sáng lập"
                onClick={() => act({ type: "record" })}
              >
                <span>
                  Đối chiếu hồ sơ<small>Theo dấu bài học đầu tiên</small>
                </span>
                <span aria-hidden="true">↗</span>
              </button>
            </article>
          )}
        </div>
      )}
      {s.phase === "world" && time >= 4.1 && (
        <div className="future2046-arrival-track" aria-hidden="true">
          <span>KHÔNG GIAN NGHIÊN CỨU</span>
          <i
            style={
              {
                "--future-progress": `${Math.min(1, time / durations.world!) * 100}%`,
              } as CSSProperties
            }
          />
          <small>2046</small>
        </div>
      )}
      {s.phase === "align" && (
        <article
          className="future2046-match"
          aria-label="Đang đối chiếu tư liệu"
        >
          <span className="future2046-eyebrow">
            <i /> ĐỐI CHIẾU NGUỒN GỐC
          </span>
          <h2>
            Một nét bút.<em>Hai mươi năm.</em>
          </h2>
          <p>
            Những dấu vết được giữ lại
            <br />
            đang nối về cùng một người.
          </p>
          <ol>
            {[
              ["Hồ sơ đánh giá", "Năm 2026", 1.2],
              ["Trang sổ thiết kế", "Nguyên tắc HUMAN REVIEW", 3.1],
              ["Hồ sơ nhà sáng lập", "Đối chiếu dấu bút", 5.8],
            ].map(([title, sub, at], index) => (
              <li key={title} data-complete={time >= Number(at)}>
                <span className="future2046-match-number">0{index + 1}</span>
                <div>
                  {title}
                  <small>{sub}</small>
                </div>
                <span className="future2046-match-mark" aria-hidden="true">
                  {time >= Number(at) ? "✓" : "·"}
                </span>
              </li>
            ))}
          </ol>
          <div
            className="future2046-match-progress"
            role="progressbar"
            aria-label="Tiến độ đối chiếu"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress * 100)}
          >
            <i style={{ width: `${progress * 100}%` }} />
          </div>
          <small className="future2046-match-status">
            {time < 5.8 ? "Đang nối các dấu vết…" : "Các dấu vết đã khớp."}
          </small>
        </article>
      )}
      {s.phase === "reveal" && founderRevealed(s) && time >= 7.2 && (
        <div className="future2046-founder">
          <span className="future2046-eyebrow">
            <i /> DANH TÍNH ĐÃ KHỚP
          </span>
          <h2>
            An<span>FOUNDER OF AION</span>
          </h2>
          <p>
            Từ buổi chiều năm 2026,
            <br />
            đến những điều được viết tiếp.
          </p>
          <div className="future2046-founder-date">
            <span>2026</span>
            <i />
            <span>2046</span>
          </div>
        </div>
      )}
      {s.phase === "reconstruct" && (
        <div className="future-memory-tray" aria-label="Ba vật thể trong ký ức">
          <div className="future-memory-caption">
            <span>GHÉP LẠI NGUỒN GỐC</span>
            <small>{s.memories.length} / 3 dấu vết</small>
          </div>
          <div className="future-memory-objects">
            {(Object.keys(memories) as MemoryId[]).map((id, i) => (
              <button
                key={id}
                aria-label={memories[id].label}
                aria-pressed={s.selected === id}
                onClick={() => act({ type: "memory", id })}
              >
                <div className="future-memory-item-head">
                  <small>0{i + 1}</small>
                  <span aria-hidden="true">
                    {s.memories.includes(id) ? "✓" : "↗"}
                  </span>
                </div>
                <ArchiveIcon kind={id} />
                <span>
                  {id === "evaluation"
                    ? "Hồ sơ 2026"
                    : id === "stayed"
                      ? "Chiếc ghế"
                      : "Cuốn sổ"}
                </span>
                <small>
                  {s.memories.includes(id) ? "ĐÃ XEM" : "CHẠM ĐỂ NHỚ LẠI"}
                </small>
              </button>
            ))}
          </div>
          {s.memories.length === 3 && (
            <button
              className="future-memory-unlock"
              onClick={() => act({ type: "unlock" })}
            >
              Khớp ba ký ức <span aria-hidden="true">→</span>
            </button>
          )}
        </div>
      )}
      <div className="future2046-chapter-mark" aria-hidden="true">
        <span>THE RIPPLE</span>
        <i />
        <small>04 / 04</small>
      </div>
    </section>
  );
}
