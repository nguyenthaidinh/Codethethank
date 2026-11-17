import {
  compared2035,
  complete2035,
  type Experiment2035,
} from "./experiment2035";

export const LAB2035_HELP_DELAY = 20;
export type Lab2035HelpTarget = "record" | "access" | "run" | "mark" | "finish";
export interface Lab2035Help {
  title: string;
  steps: string[];
  target: Lab2035HelpTarget | null;
}

/** Describe the next real action for this configuration; never change game state. */
export function lab2035Help(s: Experiment2035): Lab2035Help {
  if (s.running)
    return {
      title: "Máy đang chạy.",
      steps: ["Chờ một chút. Kết quả sẽ được in ở bên phải bàn."],
      target: null,
    };
  if (complete2035(s))
    return {
      title: "Bạn đã tìm thấy thông tin bị bỏ sót.",
      steps: [
        "Bấm “Tiếp: sửa logic” ở dưới bàn. Phần code tiếp theo có thể bỏ qua.",
      ],
      target: "finish",
    };
  if (compared2035(s))
    return {
      title: "Bạn đã có đủ bản A và bản B.",
      steps: [
        "Bấm “Đánh dấu dữ liệu bị bỏ sót” dưới nguồn “Nhật ký dùng máy”.",
        "Sau đó bấm “Tiếp: sửa logic” để xem thử thách code tùy chọn.",
      ],
      target: "mark",
    };
  const missingA = !s.trials.includes(1);
  const title = missingA ? "Bạn còn thiếu bản A." : "Bạn còn thiếu bản B.";
  if (!s.loaded.includes("record"))
    return {
      title,
      steps: [
        "Chạm nguồn “Dữ liệu học tập” ở bên trái để nạp vào máy.",
        "Giữ nguồn này bật trong cả hai lần thử.",
      ],
      target: "record",
    };
  if (!s.enabled.includes("record"))
    return {
      title,
      steps: [
        "Chạm “Dữ liệu học tập” để chuyển sang “Đang bật”.",
        "Nguồn này cần bật thì máy mới chạy được.",
      ],
      target: "record",
    };
  if (missingA) {
    if (s.enabled.includes("access"))
      return {
        title,
        steps: [
          "Chạm “Nhật ký dùng máy” một lần để chuyển sang “Đang tắt”.",
          "Giữ “Dữ liệu học tập” bật, rồi bấm “Chạy thử” ở giữa bàn.",
        ],
        target: "access",
      };
    return {
      title,
      steps: [
        "Bấm “Chạy thử” ở giữa bàn.",
        "Máy sẽ in bản A, chỉ dùng dữ liệu học tập.",
      ],
      target: "run",
    };
  }
  if (!s.loaded.includes("access"))
    return {
      title,
      steps: [
        "Chạm nguồn “Nhật ký dùng máy” để nạp thêm thông tin.",
        "Giữ cả hai nguồn bật, rồi bấm “Chạy thử”.",
      ],
      target: "access",
    };
  if (!s.enabled.includes("access"))
    return {
      title,
      steps: [
        "Chạm “Nhật ký dùng máy” để chuyển sang “Đang bật”.",
        "Giữ cả hai nguồn bật, rồi bấm “Chạy thử”.",
      ],
      target: "access",
    };
  return {
    title,
    steps: [
      "Bấm “Chạy thử” ở giữa bàn.",
      "Máy sẽ in bản B, có thêm thông tin về điều kiện dùng máy.",
    ],
    target: "run",
  };
}
