import type { FinalePhase, FinaleSave } from "./state";
import type { Letter } from "./letter";
import { graphemes } from "../typography/text";

export const isReveal = (phase: FinalePhase) =>
  ["transform", "galaxy", "closing", "ending"].includes(phase);
export const smooth = (n: number) => {
  const p = Math.max(0, Math.min(1, n));
  return p * p * (3 - 2 * p);
};
/** Pagination preserves every grapheme/newline. No private text is placed in game saves. */
export function revealPages(text: string): string[] {
  const chars = graphemes(text),
    pages: string[] = [];
  let page = "",
    line = 1,
    column = 0;
  for (const char of chars) {
    if (column >= 28 && char !== "\n") {
      line++;
      column = 0;
    }
    if (line > 4) {
      pages.push(page);
      page = "";
      line = 1;
      column = 0;
    }
    page += char;
    if (char === "\n") {
      line++;
      column = 0;
    } else column++;
  }
  if (page || !pages.length) pages.push(page);
  return pages;
}
export function revealLetter(s: Pick<FinaleSave, "choice">, letter: Letter) {
  if (s.choice === "skip")
    return {
      recipient: "Một bài học được nhớ lại",
      message: "Bạn đã chọn không viết lời nhắn cá nhân.",
      signature: "",
      private: true,
    };
  return {
    recipient: letter.recipient
      ? `Gửi ${letter.recipient}`
      : "Một lời cảm ơn riêng tư",
    message: letter.message || "Không có nội dung cá nhân được lưu.",
    signature: letter.displayName?.trim() || "",
    private: true,
  };
}
/** Pure phase time: deterministic on checkpoint resume and frozen by the game pause clock. */
export function revealTiming(phase: FinalePhase, t: number, reduced: boolean) {
  const transform = phase === "transform";
  const release = transform ? smooth(t / 2.4) : 1;
  const travel = transform ? smooth((t - 1.4) / 3.6) : 1;
  const arrival = transform ? smooth((t - 4.5) / 2.5) : 1;
  const close =
    phase === "ending" ? 1 : phase === "closing" ? smooth(t / 9) : 0;
  return {
    veil:
      transform && !reduced
        ? smooth((t - 2.4) / 0.8) * (1 - smooth((t - 3.5) / 1))
        : 0,
    release,
    travel,
    arrival,
    close,
    room: transform && t < 3.4 && !reduced,
    wallOpacity: transform
      ? smooth((t - (reduced ? 0 : 3.4)) / (reduced ? 1.2 : 1.6))
      : 1,
    textOpacity: arrival * (1 - close),
    reduced,
  };
}
export function projectRevealPanel(
  left: number,
  top: number,
  width: number,
  height: number,
) {
  const panel = document.querySelector<HTMLElement>(".reveal-screen-copy");
  if (!panel) return;
  panel.style.left = `${left}%`;
  panel.style.top = `${top}%`;
  panel.style.width = `${width}%`;
  panel.style.height = `${height}%`;
}
