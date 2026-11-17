import { drawRevealFallback } from "./RevealFallback";
import { isReveal } from "./reveal";
import { drawPlayerRoomFallback } from "./PlayerRoomFallback";
import { isPlayerRoom } from "./PlayerRoom";
import type { FinaleSave } from "./state";
import type { Letter } from "./letter";
import type { RippleSave } from "../ripple/state";
import { drawRippleFallback } from "../ripple/Fallback";
import { graphemes } from "../typography/text";
export function drawFinaleFallback(
  x: CanvasRenderingContext2D,
  w: number,
  h: number,
  s: FinaleSave,
  letter: Letter,
  r: RippleSave,
  t: number,
  reduced: boolean,
) {
  if (isReveal(s.phase))
    return drawRevealFallback(x, w, h, s, letter, t, reduced);
  if (isPlayerRoom(s.phase)) {
    drawPlayerRoomFallback(x, w, h, s.phase, t, reduced);
    return { focus: s.phase, star: false, drawCalls: 1 };
  }
  const sky = ["galaxy", "closing", "ending"].includes(s.phase);
  const ink = s.phase === "transform";
  const p = ink ? Math.max(0, Math.min(1, (t - 2) / 7)) : sky ? 1 : 0;
  if (!sky) {
    if (s.phase === "memory" && s.memoryFocus) {
      const scale = Math.max(w / 1280, h / 900);
      const target =
        s.memoryFocus === "evaluation"
          ? [930, 480]
          : s.memoryFocus === "chair"
            ? [755, 550]
            : [760, 490];
      x.fillStyle = "#192f39";
      x.fillRect(0, 0, w, h);
      x.save();
      x.translate(w / 2, h * 0.5);
      x.scale(1.3, 1.3);
      x.translate(
        -(w / 2 + (target[0] - 640) * scale),
        -(h / 2 + (target[1] - 360) * scale),
      );
      drawRippleFallback(x, w, h, r, t, reduced);
      x.restore();
    } else drawRippleFallback(x, w, h, r, t, reduced);
  }
  x.save();
  x.fillStyle = `rgba(5,21,31,${sky ? 1 : p})`;
  x.fillRect(0, 0, w, h);
  if (!sky && !(s.phase === "memory" && s.memoryFocus)) {
    const pw = Math.min(w * 0.52, 380),
      ph = pw * 0.7,
      px = w * 0.5 - pw / 2,
      py = h * 0.53;
    x.globalAlpha = 1 - p;
    x.fillStyle = "#e9dfc2";
    x.fillRect(px, py, pw, ph);
    x.fillStyle = "#3d5949";
    x.font = "italic 13px Arial";
    const text = s.choice === "skip" ? "" : letter.message;
    let line = "",
      y = py + 35;
    for (const ch of graphemes(text)) {
      if (x.measureText(line + ch).width > pw - 30 || ch === "\n") {
        x.fillText(line, px + 15, y);
        line = "";
        y += 20;
      }
      if (y > py + ph - 12) break;
      line += ch;
    }
    x.fillText(line, px + 15, y);
    x.globalAlpha = 1;
  }
  if (ink || sky) {
    let seed = 2011;
    for (let i = 0; i < 180; i++) {
      seed = (seed * 16807) % 2147483647;
      const px = (seed / 2147483647) * w;
      seed = (seed * 16807) % 2147483647;
      const py = (seed / 2147483647) * h;
      x.fillStyle = `rgba(162,199,195,${p * (0.2 + (i % 4) * 0.12)})`;
      x.beginPath();
      x.arc(px, py, 1 + (i % 3) * 0.35, 0, Math.PI * 2);
      x.fill();
    }
    const sx = w * 0.5,
      sy = h * (0.53 - 0.05 * p);
    for (let i = 0; i < (reduced ? 8 : 40); i++) {
      const a = i * 2.399;
      const radius = (1 - p) * Math.min(w * 0.2, 110);
      x.fillStyle = "#e4d7a5";
      x.fillRect(sx + Math.cos(a) * radius, sy + Math.sin(a) * radius, 2, 2);
    }
    const glow = x.createRadialGradient(sx, sy, 0, sx, sy, 40);
    glow.addColorStop(0, "#f4e5b5");
    glow.addColorStop(0.12, "#e8ddae");
    glow.addColorStop(1, "#d5e2c000");
    x.fillStyle = glow;
    x.fillRect(sx - 40, sy - 40, 80, 80);
  }
  if (sky) {
    x.strokeStyle = "#8ba6aa44";
    x.lineWidth = 2;
    const size = Math.min(w * 0.8, 650),
      left = w * 0.5 - size * 0.5,
      top = h * 0.22;
    x.strokeRect(left, top, size, h * 0.5);
    x.beginPath();
    x.moveTo(w * 0.5, top);
    x.lineTo(w * 0.5, top + h * 0.5);
    x.stroke();
  }
  x.restore();
  return { focus: s.phase, star: sky || ink, drawCalls: 1 };
}
