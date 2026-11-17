import { durations, type RippleSave } from "./state";

export const timeChapters = [
  {
    year: 2029,
    gap: "BA NĂM SAU",
    title: "Câu hỏi vẫn còn.",
    detail: "An tiếp tục thử nghiệm. Một lần nữa, rồi một lần nữa.",
  },
  {
    year: 2035,
    gap: "SÁU NĂM TIẾP THEO",
    title: "Không còn một mình.",
    detail: "Những câu hỏi được mang đến một bàn nghiên cứu lớn hơn.",
  },
  {
    year: 2045,
    gap: "MƯỜI NĂM TIẾP THEO",
    title: "Trước một khởi đầu.",
    detail: "AION bước vào những lần kiểm thử cuối cùng trước ngày ra mắt.",
  },
  {
    year: 2046,
    gap: "HAI MƯƠI NĂM SAU BUỔI CHIỀU ẤY",
    title: "AION",
    detail: "Một kỷ nguyên mới. Một bài học vẫn được giữ lại.",
  },
] as const;

export interface TimePassage {
  chapter: (typeof timeChapters)[number];
  cover: number;
  titleOpacity: number;
  entering: boolean;
}
const ease = (n: number) => {
  const p = Math.min(1, Math.max(0, n));
  return p * p * (3 - 2 * p);
};

/** A cold shader/texture frame must not consume a whole title or blackout. */
export function rippleClockStep(
  s: RippleSave | null,
  time: number,
  raw: number,
  reduced: boolean,
) {
  const cinematic =
    s &&
    (["change", "milestone", "world"].includes(s.phase) ||
      rippleTimePassage(s, time, reduced) !== null);
  return cinematic ? Math.min(raw, 0.15) : raw;
}

/** Covers each environment swap. Uses the existing game clock, including pause. */
export function rippleTimePassage(
  s: RippleSave,
  time: number,
  reduced: boolean,
): TimePassage | null {
  if (s.phase === "change" || s.phase === "milestone") {
    const duration = durations[s.phase]!;
    const fade = reduced ? 0.45 : 0.95;
    if (time < duration - fade) return null;
    return {
      chapter:
        timeChapters[s.phase === "change" ? 0 : Math.min(3, s.milestones + 1)],
      cover: ease((time - duration + fade) / fade),
      titleOpacity: 0,
      entering: false,
    };
  }
  if (s.phase !== "years" && s.phase !== "world") return null;
  const chapter = timeChapters[s.phase === "world" ? 3 : s.milestones];
  const openAt = reduced ? 1.25 : chapter.year === 2046 ? 2.5 : 2.1;
  const finish = openAt + (reduced ? 0.55 : 1.6);
  if (time >= finish) return null;
  return {
    chapter,
    entering: true,
    cover: 1 - ease((time - openAt) / (finish - openAt)),
    titleOpacity: ease(time / 0.4) * (1 - ease((time - openAt + 0.2) / 0.85)),
  };
}
