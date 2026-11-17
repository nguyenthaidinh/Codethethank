import { readChapter, type ChapterSave } from "../chapter/director";
export type Focus =
  | "book"
  | "teacher"
  | "chair_insert"
  | "notes"
  | "an"
  | "clock"
  | "door"
  | "wide"
  | "window"
  | "laptop"
  | "notebook"
  | "chair"
  | "profile"
  | "faces"
  | "paper";
export type Beat =
  | "arrival"
  | "explore"
  | "enter"
  | "chair"
  | "invitation"
  | "profile"
  | "evaluate"
  | "verdict"
  | "response"
  | "paper"
  | "complete";
export interface SliceSave {
  chapter?: ChapterSave;
  version: 3;
  beat: Beat;
  observed: string[];
  selected: boolean;
  focus: Focus;
  reduced: boolean;
  muted: boolean;
  captions: boolean;
  voice?: boolean;
  volume: number;
  music: boolean;
  sfx: boolean;
}
export const SLICE_KEY = "project2011.cinematic.v3";
export const freshSlice: SliceSave = {
  version: 3,
  beat: "arrival",
  observed: [],
  selected: false,
  focus: "door",
  reduced: false,
  muted: false,
  captions: true,
  voice: true,
  volume: 0.65,
  music: true,
  sfx: true,
};
export type SliceAction =
  | { type: "observe"; prop: "laptop" | "notebook" | "window" }
  | { type: "beat"; beat: Beat }
  | { type: "focus"; focus: Focus }
  | { type: "select" }
  | { type: "evaluate" }
  | {
      type: "settings";
      value: Partial<
        Pick<
          SliceSave,
          | "reduced"
          | "muted"
          | "captions"
          | "volume"
          | "music"
          | "sfx"
          | "voice"
        >
      >;
    }
  | { type: "restart" };
export const order: Beat[] = [
  "arrival",
  "explore",
  "enter",
  "chair",
  "invitation",
  "profile",
  "evaluate",
  "verdict",
  "response",
  "paper",
  "complete",
];
export function sliceReducer(s: SliceSave, a: SliceAction): SliceSave {
  if (a.type === "restart")
    return {
      ...freshSlice,
      reduced: s.reduced,
      muted: s.muted,
      captions: s.captions,
      voice: s.voice ?? true,
      volume: s.volume,
      music: s.music,
      sfx: s.sfx,
    };
  if (a.type === "settings")
    return {
      ...s,
      ...a.value,
      volume: Math.max(0, Math.min(1, a.value.volume ?? s.volume)),
    };
  if (a.type === "focus") return { ...s, focus: a.focus };
  if (a.type === "observe" && s.beat === "explore")
    return {
      ...s,
      focus: a.prop,
      observed: [...new Set([...s.observed, a.prop])],
    };
  if (a.type === "select" && s.beat === "profile")
    return { ...s, selected: true, focus: "profile" };
  if (a.type === "evaluate" && s.beat === "profile" && s.selected)
    return { ...s, beat: "evaluate", focus: "laptop" };
  if (a.type === "beat") {
    if (order.indexOf(a.beat) !== order.indexOf(s.beat) + 1) return s;
    if (
      a.beat === "enter" &&
      (!s.observed.includes("laptop") || !s.observed.includes("notebook"))
    )
      return s;
    if (a.beat === "evaluate" && !s.selected) return s;
    const focuses: Partial<Record<Beat, Focus>> = {
      explore: "wide",
      enter: "door",
      chair: "chair",
      invitation: "faces",
      profile: "profile",
      evaluate: "laptop",
      verdict: "laptop",
      response: "faces",
      paper: "paper",
      complete: "wide",
    };
    return { ...s, beat: a.beat, focus: focuses[a.beat] ?? s.focus };
  }
  return s;
}
export function readSlice(raw: string | null): SliceSave {
  try {
    const s = JSON.parse(raw ?? "null") as SliceSave;
    if (
      !s ||
      s.version !== 3 ||
      !order.includes(s.beat) ||
      !Array.isArray(s.observed) ||
      ![
        "door",
        "clock",
        "notes",
        "an",
        "book",
        "teacher",
        "chair_insert",
        "wide",
        "window",
        "laptop",
        "notebook",
        "chair",
        "profile",
        "faces",
        "paper",
      ].includes(s.focus) ||
      typeof s.selected !== "boolean" ||
      !["reduced", "muted", "captions", "music", "sfx"].every(
        (k) => typeof s[k as keyof SliceSave] === "boolean",
      ) ||
      typeof s.volume !== "number" ||
      !Number.isFinite(s.volume)
    )
      return freshSlice;
    if (
      (order.indexOf(s.beat) >= 2 &&
        (!s.observed.includes("laptop") || !s.observed.includes("notebook"))) ||
      (order.indexOf(s.beat) >= 6 && !s.selected)
    )
      return freshSlice;
    // Restore transient shots at their start; never auto-complete an interaction.
    return {
      ...s,
      chapter: readChapter(s.chapter),
      voice: typeof s.voice === "boolean" ? s.voice : true,
      observed: s.observed.filter((x) =>
        ["laptop", "notebook", "window"].includes(x),
      ),
      volume: Math.max(0, Math.min(1, s.volume)),
    };
  } catch {
    return freshSlice;
  }
}
export interface Caption {
  speaker: string;
  text: string;
}
export function captionFor(
  s: SliceSave,
  t: number,
  focusAge = t,
): Caption | null {
  const cue = (speaker: string, text: string) => ({ speaker, text });
  switch (s.beat) {
    case "arrival":
      return t < 3
        ? cue(
            "TRƯỜNG ĐẠI HỌC TÂY NGUYÊN · 2026",
            "[Chuông tan học. Mưa lất phất ngoài cửa sổ.]",
          )
        : cue("17:05 · SAU GIỜ HỌC", "Mọi người đã về. Một màn hình vẫn sáng.");
    case "explore":
      if (s.focus === "laptop")
        return cue("AN", "Em đã tối ưu theo dữ liệu. Em tưởng nó công bằng.");
      if (s.focus === "notebook")
        return cue(
          "BẠN HỌC · KÝ ỨC",
          focusAge < 1.8
            ? "Nếu người khó khăn nhất bị loại ngay từ đầu…"
            : "…thì chương trình này đang giúp ai?",
        );
      if (s.focus === "window")
        return cue("", "[Mưa trên kính rõ hơn. Tiếng quạt lùi xa.]");
      return null;
    case "enter":
      return t < 4
        ? cue("", "[Cánh cửa mở. Bước chân dừng lại.]")
        : cue("CÔ VÂN", "Tan học rồi. Sao em vẫn ngồi đây?");
    case "chair":
      return cue("", "[Cô kéo chiếc ghế lại gần, ngồi bên An.]");
    case "invitation":
      return t < 3
        ? cue("CÔ VÂN", "Em đang muốn chọn người dễ thành công nhất,")
        : cue("CÔ VÂN", "hay muốn giúp người cần một cơ hội nhất?");
    case "profile":
      return cue("CÔ VÂN", "Mình thử một hồ sơ nữa nhé. Chính em.");
    case "evaluate":
      return cue("", "[An nhấn Enter. Mô hình đang chạy…]");
    case "verdict":
      return t < 2 ? null : cue("AN", "…Nó loại cả em.");
    case "response":
      return t < 3
        ? cue("CÔ VÂN", "Với những gì em đã nhập, kết quả đó có thể hợp lý.")
        : cue("CÔ VÂN", "Nhưng dữ liệu của hôm nay đâu kể hết được ngày mai.");
    case "paper":
      return t < 3
        ? cue("CÔ VÂN", "Cô không thể hứa em sẽ thành công.")
        : t < 6
          ? cue("CÔ VÂN", "Nhưng cô thấy em còn muốn tìm cách làm tốt hơn.")
          : cue("CÔ VÂN", "Nếu em muốn thử lại, cô ngồi đây cùng em.");
    case "complete":
      return cue("", "Người dùng cần được giúp điều gì?");
  }
}
export function hintFor(s: SliceSave): string {
  if (s.beat === "explore")
    return !s.observed.includes("laptop")
      ? "Chạm màn hình laptop đang sáng."
      : !s.observed.includes("notebook")
        ? "Chạm bản báo cáo bên cạnh laptop."
        : "Nghe tiếng bước chân ngoài cửa.";
  if (s.beat === "profile")
    return s.selected
      ? "Chạm laptop để chạy hồ sơ An."
      : "Chạm hồ sơ AN trên bàn, rồi chạm laptop.";
  if (s.beat === "complete") return "Chạm tờ giấy trắng để đọc lại câu hỏi.";
  return "Quan sát căn phòng. Câu chuyện đang diễn ra.";
}
