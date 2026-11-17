import { finalNote, designQuestion } from "./story";
import type { StaySave } from "./state";
import { graphemes } from "../typography/text";
/** Physical notebook texture, reused by GPU and fallback renderers. */
export function drawNotebook(c: HTMLCanvasElement, s: StaySave, t: number) {
  const x = c.getContext("2d")!;
  x.fillStyle = "#e7ddba";
  x.fillRect(0, 0, c.width, c.height);
  x.fillStyle = "#d1c49e";
  x.fillRect(490, 0, 15, 720);
  x.strokeStyle = "#b4b69a";
  x.lineWidth = 1;
  for (let y = 150; y < 690; y += 60) {
    x.beginPath();
    x.moveTo(35, y);
    x.lineTo(965, y);
    x.stroke();
  }
  x.fillStyle = "#3d5143";
  x.font = "25px Arial";
  x.fillText("AN · THÁNG 11 / 2026", 40, 60);
  const writing = ["unwritten", "written", "closing", "next"].includes(s.phase);
  if (!writing) {
    const page = s.page ?? "outcome";
    const lines =
      page === "outcome"
        ? ["LOW PREDICTED", "BENEFIT"]
        : ["MISSING CONTEXT", "/ LOW CONFIDENCE"];
    x.font = "30px monospace";
    lines.forEach((l, i) => x.fillText(l, 45, 225 + i * 70));
    x.font = "28px Arial";
    x.fillText(
      page === "outcome" ? "→ NOT RECOMMENDED" : "→ REVIEW REQUIRED",
      45,
      435,
    );
    x.fillStyle = "#67745c";
    x.font = "24px Arial";
    x.fillText(page === "outcome" ? "01 / KẾT QUẢ" : "02 / NHU CẦU", 45, 650);
    x.font = "26px Arial";
    x.fillText("Xác minh trước khi quyết định.", 540, 250);
    x.fillText("Không tự động duyệt hỗ trợ.", 540, 305);
    x.fillText(
      s.read.length === 2
        ? "Đã nhìn lại cả hai."
        : "Lật trang để nhìn phần còn lại.",
      540,
      490,
    );
  } else {
    x.font = "italic 26px LessonSerif";
    const lines = [
      "Khi chưa hiểu đủ một con người,",
      "đừng vội xem một dự đoán",
      "là câu trả lời cuối cùng.",
    ];
    const fraction =
      s.phase === "unwritten"
        ? 0
        : s.phase === "written"
          ? Math.min(1, t / 2.8)
          : 1;
    let count = Math.floor(graphemes(finalNote).length * fraction);
    for (const [i, l] of lines.entries()) {
      const units = graphemes(l);
      x.fillText(
        units.slice(0, Math.max(0, count)).join(""),
        540,
        210 + i * 75,
      );
      count -= units.length;
    }
    if (s.phase === "next" && s.nextInspected) {
      x.font = "27px Arial";
      x.fillText("BẢN PHÁC THẢO SỬA ĐỔI", 45, 160);
      x.fillText("REVIEW REQUIRED", 45, 210);
      x.fillText("Con người xem xét thêm.", 45, 540);
      x.fillText("Chưa phải duyệt hỗ trợ.", 45, 590);
    } else {
      x.font = "26px Arial";
      x.fillText(designQuestion.slice(0, 23), 45, 160);
      x.fillText("người đang cần cơ hội?", 45, 215);
    }
  }
}
