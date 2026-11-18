import type { ChapterBeat } from "../chapter/director";
import { narration } from "../future/direction";

/** Select the opening narrator independently of the later AION cues. */
export function openingNarration(
  beat: ChapterBeat,
  time: number,
): string | null {
  if (beat !== "OPENING_CINEMATIC") return null;
  return (
    narration.find(
      (line) =>
        line.speaker === "NGƯỜI DẪN" && time >= line.start && time < line.end,
    )?.text ?? null
  );
}
