import type { ChapterBeat } from "./director";
import type { Focus } from "../cinematic/director";

type XYZ = [number, number, number];
export interface IntroShot {
  eye: XYZ;
  at: XYZ;
  fov: number;
}

export const CLASSROOM_INTRO_DURATION = 39;
export const classroomIntroCues: {
  start: number;
  focus: Focus;
  text: string;
}[] = [
  {
    start: 0,
    focus: "wide",
    text: "17:05 · Trường Đại học Tây Nguyên, 2026. Tan học đã lâu. Trong phòng thực hành, An vẫn chưa tắt máy.",
  },
  {
    start: 6,
    focus: "laptop",
    text: "Trên màn hình, một dòng chữ còn đỏ: NOT RECOMMENDED — không được đề xuất hỗ trợ.",
  },
  {
    start: 14,
    focus: "laptop",
    text: "An: “Mình đã kiểm tra lại rồi… Nhưng một người đang cần giúp, sao cuối cùng vẫn bị bỏ qua?”",
  },
  {
    start: 22,
    focus: "notebook",
    text: "Cô Vân để lại hồ sơ STUDENT 07: một sinh viên thiếu máy tính, xin được dùng phòng máy thêm giờ để theo kịp bài học.",
  },
  {
    start: 31,
    focus: "profile",
    text: "Bên cạnh là những hồ sơ khác. Hãy đọc câu chuyện của họ, rồi cùng An thử lại với cùng một quy tắc.",
  },
];

export function isClassroomIntro(beat: ChapterBeat) {
  return [
    "CLASSROOM_ESTABLISHING",
    "CLASSROOM_EXPLORATION",
    "LAPTOP_INVESTIGATION",
  ].includes(beat);
}

export function classroomIntroCue(time: number) {
  for (let i = classroomIntroCues.length - 1; i >= 0; i--)
    if (time >= classroomIntroCues[i].start) return classroomIntroCues[i];
  return classroomIntroCues[0];
}

// Stay on the aisle side of An and above the desk throughout the dolly.
// Show the refusal first, then open out to the physical dossiers on the desk.
const landscapeKeys: (IntroShot & { t: number })[] = [
  { t: 0, eye: [4.05, 2.2, 4], at: [0.05, 1.2, -1], fov: 50 },
  { t: 9, eye: [0.75, 1.9, 0.35], at: [-0.48, 1.28, -1.03], fov: 42 },
  { t: 21, eye: [0.75, 1.9, 0.35], at: [-0.48, 1.28, -1.03], fov: 42 },
  { t: 28, eye: [1.6, 2.85, 1.35], at: [0.65, 0.95, -0.98], fov: 46 },
  { t: 35, eye: [1.7, 2.05, 1], at: [0.35, 0.99, -0.65], fov: 45 },
  {
    t: CLASSROOM_INTRO_DURATION,
    eye: [1.7, 2.05, 1],
    at: [0.35, 0.99, -0.65],
    fov: 45,
  },
];
// Compose for a narrow frame instead of cropping the landscape master.
const portraitKeys: (IntroShot & { t: number })[] = [
  { t: 0, eye: [2.4, 2.7, 4.1], at: [0, 0.95, -0.75], fov: 55 },
  { ...landscapeKeys[1], fov: 63 },
  { ...landscapeKeys[2], fov: 63 },
  { t: 28, eye: [1.55, 3.1, 1.7], at: [0.65, 0.95, -0.98], fov: 58 },
  { ...landscapeKeys[4], fov: 65 },
  { ...landscapeKeys[5], fov: 65 },
];
const ease = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
const mix = (a: XYZ, b: XYZ, p: number): XYZ =>
  a.map((v, i) => v + (b[i] - v) * p) as XYZ;

/** Absolute time sampling keeps pause, slow frames and resizing on the same path. */
export function classroomIntroShot(
  time: number,
  vertical: boolean,
  reduced: boolean,
): IntroShot {
  const t = Math.max(0, Math.min(CLASSROOM_INTRO_DURATION, time));
  const keys = vertical ? portraitKeys : landscapeKeys;
  const index = keys.findIndex((key) => key.t > t);
  const a = keys[index < 0 ? keys.length - 1 : Math.max(0, index - 1)];
  const b = keys[index < 0 ? keys.length - 1 : index];
  const p = a === b ? 0 : ease((t - a.t) / (b.t - a.t));
  // Reduced motion uses stable editorial cuts, retaining every context caption.
  const still =
    keys[[0, 1, 2, 3, 4][classroomIntroCues.indexOf(classroomIntroCue(t))]];
  const shot = reduced
    ? { eye: still.eye, at: still.at, fov: still.fov }
    : {
        eye: mix(a.eye, b.eye, p),
        at: mix(a.at, b.at, p),
        fov: a.fov + (b.fov - a.fov) * p,
      };
  return shot;
}
