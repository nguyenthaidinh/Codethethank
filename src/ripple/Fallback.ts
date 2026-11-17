import type { RippleSave } from "./state";
import { founderRevealed } from "./state";
import { milestones } from "./story";
import { results2035 } from "./experiment2035";
import { CHAIR_MOTIF } from "../cinematic/motifs";
import { futureArrivalCue } from "./FutureArrival";
/** Canvas fallback keeps object/camera choreography when WebGL is unavailable. */
export function drawRippleFallback(
  x: CanvasRenderingContext2D,
  w: number,
  h: number,
  s: RippleSave,
  t: number,
  reduced: boolean,
) {
  const modern = s.milestones >= 1,
    era = ["years", "milestone"].includes(s.phase)
      ? milestones[s.milestones].year
      : 2046;
  const future = era === 2046;
  x.fillStyle = modern ? "#1b303c" : "#555d54";
  x.fillRect(0, 0, w, h);
  x.save();
  const scale = Math.max(w / 1280, h / 900);
  x.translate(w / 2, h / 2);
  x.scale(scale, scale);
  x.translate(-640, -360);
  const chair = s.phase === "chair",
    close = ["record", "align", "milestone"].includes(s.phase);
  if (
    era === 2046 &&
    ["world", "record", "align", "reveal"].includes(s.phase)
  ) {
    const ease = (value: number) => {
      const p = Math.max(0, Math.min(1, value));
      return p * p * p * (p * (p * 6 - 15) + 10);
    };
    const arrival = futureArrivalCue(s.phase, t, reduced).travel;
    const zoom =
      s.phase === "align"
        ? 0.3 + 0.15 * (reduced ? 1 : ease(t / 4.8))
        : s.phase === "reveal"
          ? 0.45 * (reduced ? 0 : 1 - ease((t - 4) / 4.2))
          : 0.3 * arrival;
    x.translate(-600 * zoom, -267 * zoom);
    x.scale(1 + zoom, 1 + zoom);
  } else if (close) {
    x.translate(-180, -80);
    x.scale(1.3, 1.3);
  }
  const skyline = x.createLinearGradient(0, 40, 0, 400);
  skyline.addColorStop(0, "#172e3b");
  skyline.addColorStop(1, "#627e85");
  x.fillStyle = future ? skyline : "#708b93";
  x.fillRect(70, 40, 1100, 360);
  for (let i = 0; i < 14; i++) {
    x.fillStyle = future
      ? i % 2
        ? "#27434f"
        : "#365660"
      : i % 2
        ? "#334d5b"
        : "#476570";
    x.fillRect(80 + i * 78, 210 - (i % 4) * 35, 48, 190 + (i % 4) * 35);
  }
  x.strokeStyle = future ? "#65888e" : "#a1b4b2";
  x.lineWidth = future ? 3 : 6;
  for (let i = 0; i < 7; i++) {
    x.beginPath();
    x.moveTo(90 + i * 170, 40);
    x.lineTo(90 + i * 170, 400);
    x.stroke();
  }
  x.fillStyle = future ? "#1c323d" : "#344951";
  x.beginPath();
  x.moveTo(0, 400);
  x.lineTo(1280, 400);
  x.lineTo(1280, 900);
  x.lineTo(0, 900);
  x.fill();
  x.fillStyle = "#bed1c6";
  x.font = "28px Arial";
  if (!future)
    x.fillText(
      era >= 2045
        ? "AION · NGHIÊN CỨU ĐA LĨNH VỰC"
        : era + " · PHÒNG THỬ NGHIỆM",
      330,
      80,
    );
  for (let i = 0; i < 3; i++) {
    x.fillStyle = future ? "#3c5863" : "#758e93";
    x.fillRect(100 + i * 350, 310, 230, 80);
    x.fillStyle = "#1c3c49";
    x.fillRect(130 + i * 350, 250, 160, 70);
    x.strokeStyle = future ? "#799e9d" : "#9cc4bb";
    x.beginPath();
    for (let j = 0; j < 25; j++) {
      const a = 130 + i * 350 + j * 6,
        b = 280 + Math.sin(j * 0.5 + (reduced ? 0 : t)) * 13;
      if (j === 0) x.moveTo(a, b);
      else x.lineTo(a, b);
    }
    x.stroke();
  }
  const p = chair
    ? Math.min(1, Math.max(0, t - 0.1) / CHAIR_MOTIF.dragSeconds)
    : ["reflection", "reconstruct", "principle", "finale"].includes(s.phase)
      ? 1
      : 0;
  const cx = 850 - p * 95;
  x.fillStyle = "#99b3b4";
  x.fillRect(cx, 510, 80, 14);
  x.fillRect(cx, 450, 80, 14);
  x.fillRect(cx + 4, 460, 8, 145);
  x.fillRect(cx + 67, 460, 8, 145);
  x.fillStyle = future ? "#758b8c" : "#b7c4b7";
  x.beginPath();
  x.moveTo(350, 400);
  x.lineTo(900, 400);
  x.lineTo(1040, 560);
  x.lineTo(240, 560);
  x.fill();
  x.fillStyle = "#263f48";
  x.fillRect(405, 315, 260, 150);
  x.fillStyle = "#d8e6cf";
  x.font = "18px Arial";
  const lines =
    era === 2035 && s.lab2035
      ? [
          "HỒ SƠ MÔ PHỎNG 12",
          s.lab2035.running
            ? "ĐANG THỬ NGHIỆM"
            : s.lab2035.selected
              ? results2035[s.lab2035.selected].title
              : "CHỜ DỮ LIỆU",
          s.lab2035.enabled.includes("access")
            ? "+ ĐIỀU KIỆN THỰC HÀNH"
            : "CHỈ DỮ LIỆU HỌC TẬP",
        ]
      : era < 2046
        ? milestones[s.milestones].lines
        : founderRevealed(s)
          ? ["AN — FOUNDER OF AION", "AN · 2026 → 2046", "HUMAN REVIEW"]
          : s.phase === "align"
            ? ["2026 · DANH TÍNH ẨN", "NOT RECOMMENDED", "2046 · HỒ SƠ KHỚP"]
            : ["AION · 2046", "AI ĐA NĂNG #1 THẾ GIỚI", "DANH TÍNH CHƯA MỞ"];
  if (future) {
    x.font = "10px Arial";
    x.fillStyle = "#c0cebf";
    x.fillText("AION / RESEARCH", 423, 338);
    for (let row = 0; row < 8; row++) {
      x.fillStyle = row % 3 ? "#5f8994" : "#a7b99c";
      x.fillRect(423, 354 + row * 11, 75 + ((row * 23) % 130), 2);
    }
  } else lines.forEach((l, i) => x.fillText(l, 415, 350 + i * 35, 245));
  x.fillStyle = "#e3d8b1";
  x.fillRect(680, 450, 180, 100);
  x.fillStyle = "#2f5149";
  x.font = future ? "12px LessonSerif" : "18px LessonSerif";
  x.fillText("AN · 2026 →", 690, 480);
  x.fillText("HUMAN REVIEW", 690, 515);
  if (s.phase === "finale") {
    x.fillStyle = "#eee7d1";
    x.fillRect(770, 500, 150, 90);
  }
  x.fillStyle = "#cddad0";
  x.fillRect(890, 445, 100, 65);
  x.fillStyle = "#35515a";
  x.font = "12px Arial";
  x.fillText("HỒ SƠ 2026", 895, 470);
  const person = (px: number, py: number, color: string) => {
    x.fillStyle = color;
    x.fillRect(px - 30, py, 60, 100);
    x.fillStyle = "#c69b78";
    x.beginPath();
    x.arc(px, py - 25, 26, 0, Math.PI * 2);
    x.fill();
    x.fillStyle = "#203b41";
    x.fillRect(px - 25, py + 100, 18, 65);
    x.fillRect(px + 6, py + 100, 18, 65);
  };
  person(330, 510, "#7e9b9d");
  if (founderRevealed(s))
    person(
      chair ? 900 - p * 110 : 790,
      490 + (chair ? Math.max(0, Math.min(1, (t - 2.7) / 1.3)) * 20 : 20),
      "#566d60",
    );
  if (s.memories.length === 3) {
    x.strokeStyle = "#dae4b8";
    x.lineWidth = 2;
    x.beginPath();
    x.moveTo(930, 500);
    x.lineTo(cx, 580);
    x.lineTo(760, 510);
    x.stroke();
  }
  x.restore();
  return {
    era,
    chair: [
      CHAIR_MOTIF.from[0] + (CHAIR_MOTIF.to[0] - CHAIR_MOTIF.from[0]) * p,
      0,
      0.6 - 0.35 * p,
    ],
    focus: s.phase,
  };
}
