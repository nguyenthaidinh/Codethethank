import type { FinalePhase } from "./state";
/** Live layered Canvas fallback: same interaction and time-driven camera, no image backdrop. */
export function drawPlayerRoomFallback(
  x: CanvasRenderingContext2D,
  w: number,
  h: number,
  phase: FinalePhase,
  t: number,
  reduced: boolean,
) {
  const close = phase === "letter" || phase === "review";
  const p = close
    ? reduced || phase === "review"
      ? 1
      : Math.min(1, t / 1.8)
    : 0;
  const q = p * p * (3 - 2 * p),
    scale = Math.min(w / 1000, h / 640) * (1 + q * 0.7);
  const ox = w / 2,
    oy = h * 0.48;
  x.fillStyle = "#0B1422";
  x.fillRect(0, 0, w, h);
  x.save();
  x.translate(ox, oy);
  x.scale(scale, scale);
  x.fillStyle = "#24384A";
  x.fillRect(-850, -480, 1700, 670);
  const sky = x.createLinearGradient(0, -300, 0, 70);
  sky.addColorStop(0, "#48677a");
  sky.addColorStop(1, "#D5A76B");
  x.fillStyle = sky;
  x.fillRect(-620, -320, 310, 360);
  x.fillStyle = "#142332";
  x.fillRect(-470, -320, 7, 360);
  x.fillRect(-620, -140, 310, 7);
  x.fillStyle = "#6b7e86";
  x.fillRect(-630, -330, 20 + (reduced ? 0 : Math.sin(t * 0.35) * 3), 380);
  x.fillStyle = "#786b58";
  x.beginPath();
  x.moveTo(-570, 120);
  x.lineTo(570, 120);
  x.lineTo(800, 370);
  x.lineTo(-800, 370);
  x.fill();
  x.fillStyle = "#554c43";
  x.fillRect(-800, 370, 1600, 18);
  x.fillStyle = "#152431";
  x.fillRect(-38, 55, 76, 90);
  x.fillRect(-92, 145, 184, 13);
  x.fillStyle = "#101a26";
  x.fillRect(-245, -200, 490, 285);
  x.fillStyle = "#0B1422";
  x.fillRect(-231, -186, 462, 257);
  if (!close) {
    x.fillStyle = "#72B7C9";
    x.font = "13px Arial";
    x.fillText("THE UNWRITTEN LESSON", -195, -150);
    x.fillStyle = "#F0EEE8";
    x.font = "28px Georgia";
    x.fillText("Một lời chưa nói.", -195, -65);
    x.fillStyle = "#72B7C9";
    x.font = "16px Arial";
    x.fillText("Chạm để bắt đầu", -65, 26);
  }
  x.fillStyle = "#1b2b38";
  x.fillRect(-235, 190, 480, 100);
  x.fillStyle = "#74838b";
  for (let i = 0; i < 56; i++)
    x.fillRect(-197 + (i % 14) * 28, 207 + Math.floor(i / 14) * 17, 23, 12);
  x.save();
  x.translate(-355, 215);
  x.rotate(-0.12);
  x.fillStyle = "#2e4857";
  x.fillRect(-70, -60, 140, 130);
  x.fillStyle = "#cdc8b6";
  x.fillRect(-63, -53, 126, 113);
  x.restore();
  x.fillStyle = "#D5A76B";
  x.fillRect(-260, 180, 5, 95);
  x.fillStyle = "#86918e";
  x.fillRect(365, 105, 55, 65);
  x.fillStyle = "#302923";
  x.beginPath();
  x.ellipse(392, 105, 27, 8, 0, 0, Math.PI * 2);
  x.fill();
  x.fillStyle = "#F0EEE833";
  for (let i = 0; i < 24; i++)
    x.fillRect(
      -600 + ((i * 61) % 470),
      -200 + ((i * 31) % 300) + (reduced ? 0 : Math.sin(t * 0.15 + i) * 4),
      2,
      2,
    );
  x.restore();
  const button = document.querySelector<HTMLElement>(".player-room-monitor");
  if (button) {
    button.style.left = `${((ox - 231 * scale) / w) * 100}%`;
    button.style.top = `${((oy - 186 * scale) / h) * 100}%`;
    button.style.width = `${((462 * scale) / w) * 100}%`;
    button.style.height = `${((257 * scale) / h) * 100}%`;
  }
}
