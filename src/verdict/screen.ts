import { evidence } from "./evidence";
import { profiles, evaluate } from "./rules";
import type { VerdictSave } from "./state";
import { TERMINAL_ALERT } from "../future/terminalStyle";
export function drawEvaluation(
  x: CanvasRenderingContext2D,
  s: VerdictSave,
  t: number,
) {
  x.fillStyle = "#12261f";
  x.fillRect(0, 0, 1200, 720);
  x.fillStyle = "#b4c6b2";
  x.font = "26px monospace";
  x.fillText("AN / MÔ HÌNH THỬ NGHIỆM HỖ TRỢ HỌC TẬP · 2026", 45, 55);
  x.font = "23px Arial";
  x.fillText("DỮ LIỆU GIẢ LẬP TRONG THẾ GIỚI GAME", 45, 99);
  x.strokeStyle = "#5e7964";
  x.beginPath();
  x.moveTo(45, 125);
  x.lineTo(1150, 125);
  x.stroke();
  const p = s.selected ? profiles[s.selected] : null;
  const done =
    s.selected &&
    s.tested.includes(s.selected) &&
    s.phase !== "choose" &&
    s.phase !== "running";
  if (done) {
    x.font = "22px monospace";
    x.fillText("EVALUATION:", 45, 161);
  }
  x.font = "bold 55px monospace";
  x.fillStyle =
    done && !evaluate(s.selected!).recommended ? TERMINAL_ALERT : "#e6e5c8";
  x.fillText(
    s.phase === "running"
      ? "ĐANG ƯỚC TÍNH" + ".".repeat(Math.floor(t * 2) % 4)
      : done
        ? evaluate(s.selected!).label
        : "ƯU TIÊN HỖ TRỢ",
    45,
    217,
  );
  x.fillStyle = "#c6d4b9";
  x.font = "35px Arial";
  if (p) {
    x.fillText(`STUDENT: ${p.name}     YEAR: 2026`, 45, 292);
    x.fillText(`Tiến bộ trước đây: +${p.priorGain} điểm`, 45, 353);
    x.fillText(`Mức học đều ghi nhận: ${p.regularity}%`, 45, 409);
    x.font = "30px Arial";
    x.fillText(`Nhu cầu: ${p.need}`, 45, 467);
    x.fillStyle = "#a8b8a5";
    x.fillText("Nhu cầu chưa được dùng để chọn ưu tiên.", 45, 520);
    if (done)
      x.fillText(
        `Dự đoán +${evaluate(s.selected!).predictedGain} điểm / ngưỡng +12`,
        45,
        580,
      );
  } else {
    [
      "STUDENT 07 / NOT RECOMMENDED",
      "Kết quả giảm; vắng học; bài tập không đều.",
      "Thiết bị học tập: chưa có trong dữ liệu.",
      "Mục tiêu: ưu tiên cải thiện dự đoán cao.",
    ].forEach((l, i) => x.fillText(l, 45, 310 + i * 65));
  }
  if (["connect", "comparison"].includes(s.phase) && s.carried) {
    x.fillStyle = "#e6d9af";
    x.font = "27px Arial";
    x.fillText(`ĐỐI CHIẾU: ${evidence[s.carried].title}`, 45, 640);
  }
  x.fillStyle = "#8ba18d";
  x.font = "22px monospace";
  x.fillText("LOCAL PROTOTYPE / FINAL JUDGMENT", 45, 687);
  if (s.phase === "running") {
    x.fillStyle = "#d4d8b8";
    x.fillRect(45, 615, 1100 * Math.min(1, t / 1.8), 7);
  }
}
