import {
  codePatch2035Reducer,
  readCodePatch2035,
  type CodePatch2035,
  type CodePatch2035Action,
} from "./codePatch2035";
export type Source2035 = "record" | "access";
export type Trial2035 = 1 | 3;
export interface Experiment2035 {
  version: 1;
  loaded: Source2035[];
  enabled: Source2035[];
  trials: Trial2035[];
  selected: Trial2035 | null;
  running: { mask: Trial2035; elapsed: number } | null;
  noteRead: boolean;
  marked: boolean;
  codePatch?: CodePatch2035;
}
export const RUN2035_SECONDS = 2.2;
export const freshExperiment2035 = (): Experiment2035 => ({
  version: 1,
  loaded: [],
  enabled: [],
  trials: [],
  selected: null,
  running: null,
  noteRead: false,
  marked: false,
});
export const sources2035 = {
  record: {
    label: "Dữ liệu học tập",
    code: "01",
    detail: "Điểm thực hành thấp. Hai bài nộp muộn.",
  },
  access: {
    label: "Nhật ký dùng máy",
    code: "02",
    detail: "Chỉ có 45 phút thực hành mỗi ngày tại phòng máy.",
  },
} as const;
export const results2035 = {
  1: {
    title: "NOT RECOMMENDED",
    label: "Chưa được ưu tiên",
    detail: "Chỉ dựa vào kết quả học tập; dự đoán mức cải thiện thấp.",
  },
  3: {
    title: "REVIEW REQUIRED",
    label: "Cần người xem xét",
    detail:
      "Điều kiện thực hành chưa được phản ánh đủ. Cần xác minh nhu cầu hỗ trợ.",
  },
} as const;
export type Experiment2035Action =
  | { type: "load"; source: Source2035 }
  | { type: "toggle"; source: Source2035 }
  | { type: "run" }
  | { type: "tick"; elapsed: number }
  | { type: "note" }
  | { type: "mark" }
  | { type: "code"; action: CodePatch2035Action };
export const experimentMask = (s: Experiment2035) =>
  (s.enabled.includes("record") ? 1 : 0) |
  (s.enabled.includes("access") ? 2 : 0);
export const compared2035 = (s: Experiment2035) =>
  s.trials.includes(1) && s.trials.includes(3);
export const complete2035 = (s: Experiment2035) =>
  compared2035(s) && s.marked && !s.running;
export function experiment2035Reducer(
  s: Experiment2035,
  a: Experiment2035Action,
): Experiment2035 {
  if (a.type === "code") {
    if (!complete2035(s) || !s.codePatch) return s;
    const codePatch = codePatch2035Reducer(s.codePatch, a.action);
    return codePatch === s.codePatch ? s : { ...s, codePatch };
  }
  if (s.codePatch) return s;
  if (a.type === "note") return s.noteRead ? s : { ...s, noteRead: true };
  if (a.type === "tick") {
    if (!s.running || !Number.isFinite(a.elapsed)) return s;
    const elapsed = Math.max(
      s.running.elapsed,
      Math.min(RUN2035_SECONDS, a.elapsed),
    );
    if (elapsed >= RUN2035_SECONDS)
      return {
        ...s,
        running: null,
        selected: s.running.mask,
        trials: [...new Set([...s.trials, s.running.mask])],
      };
    return elapsed === s.running.elapsed
      ? s
      : { ...s, running: { ...s.running, elapsed } };
  }
  if (s.running) return s;
  if (a.type === "load")
    return s.loaded.includes(a.source)
      ? s
      : {
          ...s,
          loaded: [...s.loaded, a.source],
          enabled: [...s.enabled, a.source],
        };
  if (a.type === "toggle" && s.loaded.includes(a.source))
    return {
      ...s,
      enabled: s.enabled.includes(a.source)
        ? s.enabled.filter((id) => id !== a.source)
        : [...s.enabled, a.source],
    };
  if (a.type === "run") {
    const mask = experimentMask(s);
    return mask === 1 || mask === 3
      ? { ...s, running: { mask, elapsed: 0 } }
      : s;
  }
  if (a.type === "mark" && compared2035(s))
    return { ...s, marked: true, noteRead: true };
  return s;
}
export function readExperiment2035(value: unknown): Experiment2035 | undefined {
  if (!value || typeof value !== "object") return;
  const s = value as Experiment2035;
  const sourceList = (v: unknown): v is Source2035[] =>
    Array.isArray(v) &&
    v.every((x) => x === "record" || x === "access") &&
    new Set(v).size === v.length;
  if (
    s.version !== 1 ||
    !sourceList(s.loaded) ||
    !sourceList(s.enabled) ||
    s.enabled.some((id) => !s.loaded.includes(id)) ||
    !Array.isArray(s.trials) ||
    s.trials.some((x) => x !== 1 && x !== 3) ||
    new Set(s.trials).size !== s.trials.length ||
    (s.selected !== null && !s.trials.includes(s.selected)) ||
    typeof s.noteRead !== "boolean" ||
    typeof s.marked !== "boolean"
  )
    return;
  if (s.trials.length && !s.loaded.includes("record")) return;
  if (s.trials.length > 0 && s.selected === null) return;
  if (s.trials.includes(3) && !s.loaded.includes("access")) return;
  if (s.marked && (!compared2035(s) || !s.noteRead)) return;
  const codePatch =
    s.codePatch === undefined ? undefined : readCodePatch2035(s.codePatch);
  if (s.codePatch !== undefined && (!codePatch || !complete2035(s))) return;
  if (
    s.running !== null &&
    (!s.running ||
      typeof s.running !== "object" ||
      (s.running.mask !== 1 && s.running.mask !== 3) ||
      s.running.mask !== experimentMask(s) ||
      !Number.isFinite(s.running.elapsed) ||
      s.running.elapsed < 0 ||
      s.running.elapsed >= RUN2035_SECONDS)
  )
    return;
  return {
    ...s,
    loaded: [...s.loaded],
    enabled: [...s.enabled],
    trials: [...s.trials],
    running: s.running ? { ...s.running } : null,
    ...(codePatch ? { codePatch } : {}),
  };
}
export function experiment2035Goal(s: Experiment2035) {
  if (complete2035(s))
    return "Đã tìm thấy điều bị bỏ sót. Bấm “Tiếp: sửa logic” để thử phần code tùy chọn.";
  if (s.running) return "Đang chạy cùng hồ sơ 12. Chờ máy in kết quả…";
  if (compared2035(s))
    return "Hai bản in đã khác nhau. Đánh dấu nguồn cho biết điều kiện thực hành.";
  if (s.loaded.includes("record") && !s.enabled.includes("record"))
    return "Chạm “Dữ liệu học tập” để bật nguồn này, rồi mới bấm “Chạy thử”.";
  if (s.trials.includes(1))
    return s.enabled.includes("access")
      ? "Bạn còn thiếu bản B. Giữ cả hai nguồn bật rồi bấm “Chạy thử”."
      : "Bạn còn thiếu bản B. Bật “Nhật ký dùng máy” rồi bấm “Chạy thử”.";
  if (s.trials.includes(3))
    return s.enabled.includes("access")
      ? "Bạn còn thiếu bản A. Tắt “Nhật ký dùng máy” rồi bấm “Chạy thử”."
      : "Bạn còn thiếu bản A. Bấm “Chạy thử” khi chỉ bật “Dữ liệu học tập”.";
  return "Nạp dữ liệu học tập vào máy và chạy thử lần đầu.";
}
