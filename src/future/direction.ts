import type { ChapterBeat } from "../chapter/director";
import { openingTime } from "./pacing";
export type FuturePlace = "city" | "headquarters" | "core" | "anomaly";
export type Channel = "source" | "limit";
export const OPENING_TIMING = {
  atrium: openingTime(12),
  nexus: openingTime(23.1),
  anomaly: openingTime(33),
  silent: openingTime(37.5),
} as const;
export const OPENING_DURATION = openingTime(41.5);
const originalNarration = [
  {
    start: 0,
    end: 7.6,
    speaker: "NGƯỜI DẪN",
    text: "Năm 2046. Nhân loại bước vào kỷ nguyên mà những giới hạn của tri thức liên tục được viết lại.",
  },
  {
    start: 7.6,
    end: 12,
    speaker: "NGƯỜI DẪN",
    text: "Những câu hỏi từng nằm ngoài tầm với… giờ mở ra những hướng đi mới.",
  },
  {
    start: 12,
    end: 18.6,
    speaker: "NGƯỜI DẪN",
    text: "Từ những khám phá khoa học tưởng chừng bất khả thi, đến việc dự báo các cuộc khủng hoảng trước khi chúng xảy ra…",
  },
  {
    start: 18.6,
    end: 23.1,
    speaker: "NGƯỜI DẪN",
    text: "Một trí tuệ đã mở ra những khả năng mà thế giới chưa từng có.",
  },
  {
    start: 23.1,
    end: 27.3,
    speaker: "NGƯỜI DẪN",
    text: "AION. Trí tuệ nhân tạo đa năng tiên tiến nhất thế giới.",
  },
  {
    start: 27.3,
    end: 33,
    speaker: "NGƯỜI DẪN",
    text: "Thành tựu làm thay đổi cách nhân loại khám phá, sáng tạo và định hình tương lai.",
  },
  {
    start: 33,
    end: 37.5,
    speaker: "NGƯỜI DẪN",
    text: "Nhưng ngay cả AION… vẫn có một câu hỏi chưa tìm được lời giải.",
  },
  {
    start: 37.5,
    end: 41.5,
    speaker: "AION",
    text: "Nguyên tắc này đã được kiểm chứng. Điều tôi cần tìm là nguồn gốc của nó.",
  },
] as const;
export const narration = originalNarration.map((line) => ({
  ...line,
  start: openingTime(line.start),
  end: openingTime(line.end),
}));
export const channels: Record<
  Channel,
  {
    label: string;
    title: string;
    short: string;
    lines: string[];
    dialogue: string[];
  }
> = {
  source: {
    label: "Kiểm tra nguyên tắc HUMAN REVIEW",
    short: "Nguyên tắc hiện tại",
    title: "NGUYÊN TẮC / 2046",
    lines: [
      "CORE PRINCIPLE: HUMAN REVIEW",
      "FUNCTION: VERIFIED",
      "Thiếu hoàn cảnh → con người xem xét thêm.",
      "Xem xét không phải tự động duyệt hỗ trợ.",
    ],
    dialogue: [
      "Tôi biết nguyên tắc này hoạt động như thế nào. Khi thông tin chưa đủ, quyết định cần được con người xem xét thêm.",
      "Nguyên tắc ấy đã ảnh hưởng đến cách hàng triệu quyết định được hỗ trợ. Nhưng các ghi chép chưa giải thích đầy đủ vì sao nó ra đời.",
    ],
  },
  limit: {
    label: "Truy dấu nguồn gốc năm 2026",
    short: "Dấu vết năm 2026",
    title: "TƯ LIỆU GỐC / 2026",
    lines: [
      "DESIGN ORIGIN: INCOMPLETE",
      "STUDENT 07: NOT RECOMMENDED",
      "Bài tập năm 2026: xếp ưu tiên giờ thực hành bổ sung.",
      "Một đề nghị hỗ trợ. Một buổi chiều 17:05.",
    ],
    dialogue: [
      "Năm 2026, một sinh viên thử xếp ưu tiên giờ thực hành bằng dữ liệu học tập. Hồ sơ 07 chưa được đề xuất; lý do bạn thiếu giờ thực hành lại chưa được ghi nhận.",
      "Một buổi chiều. Một bản đánh giá. Và một quyết định không được ghi lại đầy đủ. Tôi cần tái dựng điều đã xảy ra.",
    ],
  },
};
export const originAudit = {
  heading: "AION / ARCHITECTURE AUDIT / 2046",
  title: "HUMAN REVIEW",
  status: "ORIGIN UNKNOWN",
  lines: [
    "CORE PRINCIPLE: HUMAN REVIEW",
    "FUNCTION: VERIFIED",
    "DESIGN ORIGIN: INCOMPLETE",
    "HISTORICAL TRACE: 2026",
  ],
  principle: "HUMAN REVIEW",
  function: "VERIFIED",
  origin: "INCOMPLETE",
  year: 2026,
} as const;

export function futurePlace(beat: ChapterBeat, time: number): FuturePlace {
  if (beat === "OPENING_CINEMATIC")
    return time < OPENING_TIMING.atrium
      ? "city"
      : time < OPENING_TIMING.nexus
        ? "headquarters"
        : time < OPENING_TIMING.anomaly
          ? "core"
          : "anomaly";
  return "anomaly";
}
export function futureCaption(
  beat: ChapterBeat,
  t: number,
  selected: Channel | null = null,
  compared = false,
): string | null {
  if (beat === "OPENING_CINEMATIC")
    return (
      narration.find((line) => t >= line.start && t < line.end)?.text ??
      narration.at(-1)!.text
    );
  if (beat === "PLAYER_CONTROL_ENABLED")
    return "AION: Nguyên tắc HUMAN REVIEW đã được kiểm chứng. Tôi muốn tìm hiểu buổi chiều đã đặt nền móng cho nó.";
  if (beat === "SIGNAL_INVESTIGATION") {
    if (compared && t > 9)
      return "AION: Nguyên tắc hôm nay dẫn về hồ sơ 07 và một đề nghị hỗ trợ năm 2026. Hãy trở lại buổi chiều ấy để tìm điều chưa được ghi chép.";
    if (selected) return "AION: " + channels[selected].dialogue[t < 5 ? 0 : 1];
    return "AION: Kiểm tra nguyên tắc hiện tại và dấu vết năm 2026. Điều gì đã khiến một dự đoán không còn là câu trả lời cuối cùng?";
  }
  if (beat === "MEMORY_TRANSITION")
    return t < 3
      ? "[Hệ thống lùi xa.]"
      : t < 4
        ? ""
        : t < 6
          ? "[Mưa. Một hồi chuông tan học từ xa.]"
          : "[Tiếng bước chân ngoài hành lang.]";
  return null;
}
export const futurePalette = {
  navy: "#071423",
  graphite: "#182936",
  silver: "#a6bac7",
  cyan: "#91d9e1",
  white: "#e3edf0",
  amber: "#e1b97b",
} as const;
