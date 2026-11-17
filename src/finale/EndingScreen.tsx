import { useEffect, useState, type ReactNode } from "react";
import { EndingFireworks } from "./EndingFireworks";
import "./ending-screen.css";
import "./ending-school.css";

export function EndingScreen({
  children,
  reducedMotion = false,
}: {
  children: ReactNode;
  reducedMotion?: boolean;
}) {
  const [celebrate, setCelebrate] = useState(true);
  const [systemReduced, setSystemReduced] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [imageFailed, setImageFailed] = useState(false);
  const reduced = reducedMotion || systemReduced;
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setSystemReduced(media.matches);
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, []);
  return (
    <section
      className={`ending-screen ending-school ${reduced ? "ending-still" : ""}`}
      aria-labelledby="ending-game-title"
    >
      <div
        className={`ending-scenery ${imageFailed ? "ending-scenery-fallback" : ""}`}
        aria-hidden="true"
      >
        {!imageFailed && (
          <img
            className="ending-campus"
            src={`${import.meta.env.BASE_URL}ending/school-twilight.webp`}
            alt=""
            onError={() => setImageFailed(true)}
          />
        )}
        <div className="ending-atmosphere" />
      </div>
      <EndingFireworks enabled={celebrate && !reduced} />
      <div className="ending-readability" aria-hidden="true" />
      <div className="ending-title ending-composition">
        <div className="ending-dedication">
          <span aria-hidden="true" />
          DÀNH CHO NHỮNG NGƯỜI ĐÃ Ở LẠI
          <span aria-hidden="true" />
        </div>
        <svg
          className="ending-constellation"
          viewBox="0 0 120 42"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="m13 28 30-13 19 9 31-17 16 14"
            stroke="currentColor"
            strokeOpacity=".4"
          />
          {[
            [13, 28],
            [43, 15],
            [62, 24],
            [93, 7],
            [109, 21],
          ].map(([x, y]) => (
            <circle
              key={x}
              cx={x}
              cy={y}
              r={x === 62 ? 2.6 : 1.5}
              fill="currentColor"
            />
          ))}
        </svg>
        <h1 id="ending-game-title">
          <span>The Unwritten</span>
          <em>Lesson</em>
        </h1>
        <p className="ending-quote">
          Có những bài học không được viết thành lời.
        </p>
        <p className="ending-afterword">Nhưng sẽ theo ta suốt một đời.</p>
        <div className="ending-rule" aria-hidden="true">
          ✦
        </div>
        <div
          className="ending-actions"
          aria-label="Lựa chọn sau khi hoàn thành"
        >
          {children}
        </div>
        <p className="ending-thanks">Cảm ơn bạn đã đi đến cuối câu chuyện.</p>
      </div>
      <footer className="ending-footer">
        <span>MỘT LỜI CẢM ƠN. MỘT HÀNH TRÌNH TIẾP NỐI.</span>
        <button
          type="button"
          disabled={reduced}
          aria-pressed={!reduced && celebrate}
          onClick={() => setCelebrate((value) => !value)}
        >
          {reduced
            ? "Đã giảm chuyển động"
            : celebrate
              ? "Tắt pháo hoa"
              : "Bật pháo hoa"}
          <span aria-hidden="true"> ✧</span>
        </button>
      </footer>
    </section>
  );
}
