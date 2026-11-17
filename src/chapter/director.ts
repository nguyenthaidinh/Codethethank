import {
  freshVerdict,
  classroomReview,
  readVerdict,
  verdictReducer,
  type VerdictSave,
  type VerdictAction,
} from "../verdict/state";
import { isClassroomIntro, CLASSROOM_INTRO_DURATION } from "./ClassroomIntro";
export type ChapterBeat =
  | "OPENING_CINEMATIC"
  | "PLAYER_CONTROL_ENABLED"
  | "SIGNAL_INVESTIGATION"
  | "MEMORY_TRANSITION"
  | "CLASSROOM_ESTABLISHING"
  | "CLASSROOM_EXPLORATION"
  | "LAPTOP_INVESTIGATION"
  | "NEXT_SCENE_READY";
export type ObjectId =
  "window" | "clock" | "notebook" | "laptop" | "chair" | "door";
export interface ChapterSave {
  introElapsed?: number;
  verdict?: VerdictSave;
  version: 1;
  beat: ChapterBeat;
  evidence: ObjectId[];
  signal: boolean;
}
export const freshChapter: ChapterSave = {
  version: 1,
  beat: "OPENING_CINEMATIC",
  evidence: [],
  signal: false,
};
export const objects: Record<ObjectId, { label: string; text: string }> = {
  window: {
    label: "Nhìn qua cửa sổ",
    text: "[Mưa trên kính. Sân trường đang vắng dần.]",
  },
  clock: {
    label: "Nhìn đồng hồ",
    text: "17:05 — sau giờ học. Một màn hình vẫn sáng.",
  },
  notebook: {
    label: "Đọc tài liệu thuyết trình",
    text: "Phản biện: nếu loại người có kết quả thấp, chương trình hỗ trợ sẽ giúp ai? Số suất có hạn — nhưng ai đang cần chúng nhất?",
  },
  laptop: {
    label: "Quan sát laptop",
    text: "Mô hình thử nghiệm do An viết. Mục tiêu: ưu tiên mức cải thiện học tập dự đoán cao. Nhu cầu hỗ trợ chưa được dùng để quyết định.",
  },
  chair: {
    label: "Quan sát ghế trống",
    text: "[Một chiếc ghế chưa có người ngồi, ngay bên cạnh An.]",
  },
  door: {
    label: "Lắng nghe ngoài cửa",
    text: "[Tiếng bước chân ngoài hành lang dừng lại.]",
  },
};
export function readChapter(value: unknown): ChapterSave | undefined {
  if (!value || typeof value !== "object") return;
  const s = value as ChapterSave;
  const beats: ChapterBeat[] = [
    "OPENING_CINEMATIC",
    "PLAYER_CONTROL_ENABLED",
    "SIGNAL_INVESTIGATION",
    "MEMORY_TRANSITION",
    "CLASSROOM_ESTABLISHING",
    "CLASSROOM_EXPLORATION",
    "LAPTOP_INVESTIGATION",
    "NEXT_SCENE_READY",
  ];
  if (
    s.version !== 1 ||
    (s.introElapsed !== undefined &&
      (!Number.isFinite(s.introElapsed) ||
        s.introElapsed < 0 ||
        s.introElapsed > CLASSROOM_INTRO_DURATION)) ||
    !beats.includes(s.beat) ||
    typeof s.signal !== "boolean" ||
    !Array.isArray(s.evidence) ||
    s.evidence.some((id) => !Object.keys(objects).includes(id))
  )
    return;
  if (beats.indexOf(s.beat) >= 3 && !s.signal) return;
  if (s.beat === "NEXT_SCENE_READY" && !ready(s)) return;
  let verdict =
    s.beat === "NEXT_SCENE_READY"
      ? (readVerdict(s.verdict) ?? freshVerdict)
      : undefined;
  // Old checkpoints at the confusing comparison step now continue at her arrival.
  if (
    verdict &&
    !verdict.flow &&
    verdict.tested.includes("student07") &&
    ["connect", "comparison"].includes(verdict.phase)
  )
    verdict = {
      ...verdict,
      flow: "screen-first",
      phase: "teacher_enter",
      carried: null,
    };
  if (verdict?.flow === "screen-first" && verdict.stayed && !verdict.ripple)
    verdict = { ...verdict, stayed: { ...verdict.stayed, interactive: true } };
  const restored: ChapterSave = {
    ...s,
    verdict,
    evidence: [...new Set(s.evidence)],
    beat:
      s.beat === "MEMORY_TRANSITION" || isClassroomIntro(s.beat)
        ? "CLASSROOM_ESTABLISHING"
        : s.beat,
  };
  return isClassroomIntro(restored.beat) &&
    restored.introElapsed === CLASSROOM_INTRO_DURATION
    ? chapterReducer(restored, { type: "introduction-complete" })
    : restored;
}
export function ready(s: ChapterSave) {
  // Room observation is optional orientation. The actual three-clue
  // investigation remains enforced inside The Verdict before any evaluation.
  return s.evidence.includes("laptop");
}
export type ChapterAction =
  | { type: "verdict"; action: VerdictAction }
  | { type: "skip" }
  | { type: "signal" }
  | { type: "open" }
  | { type: "arrive" }
  | { type: "introduction-complete" }
  | { type: "intro-tick"; elapsed: number }
  | { type: "explore" }
  | { type: "observe"; id: ObjectId }
  | { type: "return" }
  | { type: "continue" };
export function chapterReducer(s: ChapterSave, a: ChapterAction): ChapterSave {
  if (a.type === "intro-tick" && isClassroomIntro(s.beat)) {
    if (!Number.isFinite(a.elapsed) || a.elapsed <= (s.introElapsed ?? 0))
      return s;
    return {
      ...s,
      introElapsed: Math.min(CLASSROOM_INTRO_DURATION, a.elapsed),
    };
  }
  if (a.type === "verdict" && s.beat === "NEXT_SCENE_READY")
    return {
      ...s,
      verdict: verdictReducer(s.verdict ?? freshVerdict, a.action),
    };
  if (a.type === "skip" && s.beat === "OPENING_CINEMATIC")
    return { ...s, beat: "PLAYER_CONTROL_ENABLED" };
  if (a.type === "signal" && s.beat === "PLAYER_CONTROL_ENABLED")
    return { ...s, beat: "SIGNAL_INVESTIGATION" };
  if (a.type === "open" && s.beat === "SIGNAL_INVESTIGATION")
    return { ...s, signal: true, beat: "MEMORY_TRANSITION" };
  if (a.type === "arrive" && s.beat === "MEMORY_TRANSITION")
    return { ...s, beat: "CLASSROOM_ESTABLISHING" };
  if (a.type === "introduction-complete" && isClassroomIntro(s.beat)) {
    return {
      ...s,
      beat: "NEXT_SCENE_READY",
      introElapsed: CLASSROOM_INTRO_DURATION,
      evidence: [...new Set<ObjectId>([...s.evidence, "notebook", "laptop"])],
      verdict: classroomReview,
    };
  }
  if (a.type === "explore" && s.beat === "CLASSROOM_ESTABLISHING")
    return { ...s, beat: "CLASSROOM_EXPLORATION" };
  if (
    a.type === "observe" &&
    ["CLASSROOM_EXPLORATION", "LAPTOP_INVESTIGATION"].includes(s.beat)
  )
    return {
      ...s,
      evidence: [...new Set([...s.evidence, a.id])],
      beat:
        a.id === "laptop" ? "LAPTOP_INVESTIGATION" : "CLASSROOM_EXPLORATION",
    };
  if (a.type === "return" && s.beat === "LAPTOP_INVESTIGATION")
    return { ...s, beat: "CLASSROOM_EXPLORATION" };
  if (a.type === "continue" && s.beat === "LAPTOP_INVESTIGATION" && ready(s))
    return { ...s, beat: "NEXT_SCENE_READY", verdict: freshVerdict };
  return s;
}
export function chapterCaption(beat: ChapterBeat, t: number): string {
  if (beat === "OPENING_CINEMATIC")
    return t < 5
      ? "[Tiếng hội trường dần rõ. Một sân khấu đang thức dậy.]"
      : t < 10
        ? "Global Intelligence Summit · 2046"
        : t < 15
          ? "AION — trí tuệ nhân tạo đa năng số 1 thế giới năm 2046."
          : t < 22
            ? "AION: Có một kết quả mà tôi muốn cùng bạn xem lại."
            : "[Một tín hiệu sáng lên bên ghế của bạn.]";
  if (beat === "PLAYER_CONTROL_ENABLED")
    return "Quan sát nguồn sáng bên phải. Chạm để tập trung vào tín hiệu.";
  if (beat === "SIGNAL_INVESTIGATION")
    return "Một hồ sơ từ mô hình thử nghiệm năm 2026. Kết quả vẫn còn đó. Điều xảy ra sau đó đang bị khóa.";
  if (beat === "MEMORY_TRANSITION")
    return t < 3
      ? "[Âm thanh hội nghị lùi xa.]"
      : t < 4
        ? ""
        : t < 6
          ? "[Mưa. Một hồi chuông tan học từ xa.]"
          : "[Tiếng trò chuyện và bước chân khuất dần ngoài hành lang.]";
  if (beat === "CLASSROOM_ESTABLISHING")
    return "Phòng thực hành Trường Đại học Tây Nguyên · 2026 · 17:05. An vẫn ngồi trước laptop.";
  return "";
}
