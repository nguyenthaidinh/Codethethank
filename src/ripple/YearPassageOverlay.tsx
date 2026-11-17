import type { CSSProperties } from "react";
import type { TimePassage as Passage } from "./timePassage";

export function TimePassage({
  cue,
  reduced,
}: {
  cue: Passage;
  reduced: boolean;
}) {
  return (
    <div
      className={`ripple-time-passage ${reduced ? "is-still" : ""}`}
      data-year={cue.chapter.year}
      data-entering={cue.entering}
      style={
        {
          "--passage-cover": cue.cover,
          "--passage-title": cue.titleOpacity,
        } as CSSProperties
      }
    >
      <div className="time-lid time-lid-top" aria-hidden="true" />
      <div className="time-lid time-lid-bottom" aria-hidden="true" />
      {cue.entering && (
        <div
          className="time-passage-title"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <span>{cue.chapter.gap}</span>
          <strong>{cue.chapter.year}</strong>
          <i aria-hidden="true" />
          <h2>{cue.chapter.title}</h2>
          <p>{cue.chapter.detail}</p>
        </div>
      )}
    </div>
  );
}
