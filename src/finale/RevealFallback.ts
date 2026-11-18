import type { FinaleSave } from "./state";
import type { Letter } from "./letter";
import { drawPlayerRoomFallback } from "./PlayerRoomFallback";
import {
  projectRevealPanel,
  revealLetter,
  revealPages,
  revealTiming,
} from "./reveal";

/** Live procedural fallback. Uses the same phase clock, privacy rules and native page reader. */
export function drawRevealFallback(
  x: CanvasRenderingContext2D,
  w: number,
  h: number,
  s: FinaleSave,
  letter: Letter,
  t: number,
  reduced: boolean,
) {
  const timing = revealTiming(s.phase, t, reduced),
    portrait = w / h < 0.8;
  if (timing.room)
    drawPlayerRoomFallback(
      x,
      w,
      h,
      s.choice === "skip" ? "paper" : "review",
      t,
      reduced,
    );
  else {
    x.fillStyle = "#0b1422";
    x.fillRect(0, 0, w, h);
  }
  x.save();
  if (timing.room) {
    x.fillStyle = `rgba(11,20,34,${Math.min(1, Math.max(0, (t - 1.5) / 1.9))})`;
    x.fillRect(0, 0, w, h);
  }
  const zoom = s.starSeen ? 1.08 : 1;
  const scale =
    (1 - (reduced ? 0 : timing.close) * 0.22) * (reduced ? 1 : zoom);
  const bw = w * (portrait ? 0.8 : 0.68) * scale,
    bh = h * (portrait ? 0.43 : 0.44) * scale,
    left = (w - bw) / 2,
    top = (h - bh) / 2;
  x.globalAlpha = timing.wallOpacity;
  const gradient = x.createLinearGradient(0, 0, 0, h);
  gradient.addColorStop(0, "#0b1422");
  gradient.addColorStop(0.75, "#172a3a");
  gradient.addColorStop(1, "#0b1422");
  x.fillStyle = gradient;
  x.fillRect(0, 0, w, h);
  x.strokeStyle = "#2c495d";
  x.lineWidth = 1;
  for (let i = 0; i < 11; i++) {
    x.beginPath();
    x.moveTo(w / 2 + (i - 5) * w * 0.03, h * 0.53);
    x.lineTo((i - 2) * w * 0.15, h);
    x.stroke();
  }
  for (let i = 0; i < 5; i++) {
    const px = left - 20 - i * w * 0.04,
      py = top - 15 - i * 12;
    x.fillStyle = "#24384a";
    x.fillRect(px, py, 4, h * 0.63 - py);
    x.fillRect(w - px - 4, py, 4, h * 0.63 - py);
  }
  x.fillStyle = "#24384a";
  x.fillRect(left - 12, top - 12, bw + 24, bh + 24);
  x.strokeStyle = "#d8b57f99";
  x.strokeRect(left - 2, top - 2, bw + 4, bh + 4);
  x.fillStyle = "#0b1422";
  x.fillRect(left, top, bw, bh);
  for (let i = 0; i < 3; i++) {
    x.fillStyle = i % 2 ? "#24384a" : "#182b3c";
    x.fillRect(left - 30 - i * 9, top + bh + 12 + i * 7, bw + 60 + i * 18, 6);
  }
  for (let i = 0; i < 60; i++) {
    x.fillStyle = "#72b7c950";
    x.fillRect(
      (((i * 79) % 101) / 101) * w,
      (((i * 43) % 97) / 97) * h * 0.6,
      1.5,
      1.5,
    );
  }
  if (s.phase !== "galaxy" && timing.textOpacity > 0) {
    const content = revealLetter(s, letter);
    x.globalAlpha = timing.textOpacity;
    x.fillStyle = "#efd39f";
    x.font = `${Math.max(10, bw * 0.018)}px Arial`;
    x.fillText(
      "20 / 11 · LỜI TRI ÂN RIÊNG TƯ",
      left + bw * 0.07,
      top + bh * 0.13,
      bw * 0.86,
    );
    x.fillStyle = "#f0eee8";
    x.font = `${Math.max(17, bw * 0.036)}px LessonSerif, Georgia, serif`;
    x.fillText(content.recipient, left + bw * 0.07, top + bh * 0.28, bw * 0.86);
    x.font = `${Math.max(15, bw * 0.027)}px LessonSerif, Georgia, serif`;
    const words = revealPages(content.message)[0];
    let line = "",
      y = top + bh * 0.44;
    for (const ch of Array.from(words)) {
      if (ch === "\n" || x.measureText(line + ch).width > bw * 0.86) {
        x.fillText(line, left + bw * 0.07, y);
        y += Math.max(20, bh * 0.09);
        line = "";
      }
      if (y > top + bh * 0.82) break;
      if (ch !== "\n") line += ch;
    }
    x.fillText(line, left + bw * 0.07, y);
  }
  x.globalAlpha = 1;
  const p = reduced ? 1 : timing.travel,
    startX = w * 0.5,
    startY = h * 0.45,
    endX = w * 0.5,
    endY = top - 25;
  const px =
      startX + (endX - startX) * p + Math.sin(p * Math.PI * 2) * w * 0.12,
    py = startY + (endY - startY) * p;
  if (s.phase === "transform" && !reduced) {
    x.strokeStyle = "#e8c48890";
    x.beginPath();
    x.moveTo(startX, startY);
    x.bezierCurveTo(w * 0.8, h * 0.4, w * 0.25, h * 0.2, px, py);
    x.stroke();
    for (let i = 0; i < 60; i++) {
      const q = Math.max(0, p - i * 0.004);
      x.fillStyle = "#d5a76b";
      x.fillRect(
        startX + Math.sin(q * Math.PI * 2) * w * 0.12,
        startY + (endY - startY) * q,
        2,
        2,
      );
    }
  }
  const glowRadius = 32;
  const glow = x.createRadialGradient(px, py, 0, px, py, glowRadius);
  glow.addColorStop(0, "#f0eee8");
  glow.addColorStop(0.12, "#d5a76b");
  glow.addColorStop(1, "#d5a76b00");
  x.fillStyle = glow;
  x.fillRect(px - glowRadius, py - glowRadius, glowRadius * 2, glowRadius * 2);
  if (timing.veil > 0) {
    x.fillStyle = `rgba(11,20,34,${timing.veil})`;
    x.fillRect(0, 0, w, h);
  }
  x.restore();
  if (s.phase === "galaxy")
    projectRevealPanel(
      (left / w) * 100,
      (top / h) * 100,
      (bw / w) * 100,
      (bh / h) * 100,
    );
  return { focus: s.phase, star: true, drawCalls: 1 };
}
