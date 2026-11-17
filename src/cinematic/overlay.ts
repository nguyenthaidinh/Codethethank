import type { Caption } from "./director";
export function drawOverlay(
  canvas: HTMLCanvasElement,
  caption: Caption | null,
  hint: string,
) {
  const x = canvas.getContext("2d")!,
    w = canvas.width,
    h = canvas.height;
  x.clearRect(0, 0, w, h);
  const gradient = x.createLinearGradient(0, h * 0.67, 0, h);
  gradient.addColorStop(0, "transparent");
  gradient.addColorStop(1, "rgba(9,17,15,.88)");
  x.fillStyle = gradient;
  x.fillRect(0, h * 0.67, w, h * 0.33);
  x.fillStyle = "#e4dcc3";
  x.font = "12px Arial";
  x.fillText("THE UNWRITTEN LESSON / 17:05 · PHÒNG THỰC HÀNH", 28, 32);
  if (caption) {
    x.textAlign = "center";
    x.fillStyle = "#d3c49e";
    x.font = "12px Arial";
    x.fillText(caption.speaker, w / 2, h - 110);
    x.fillStyle = "#f1e9d5";
    const size = w < 600 ? 18 : 23;
    x.font = `${size}px LessonSerif`;
    const words = caption.text.split(" ");
    let line = "";
    const lines: string[] = [];
    for (const word of words) {
      if (x.measureText(line + word).width > w * 0.84) {
        lines.push(line.trim());
        line = "";
      }
      line += word + " ";
    }
    if (line) lines.push(line.trim());
    lines.forEach((l, i) => x.fillText(l, w / 2, h - 78 + i * (size + 5)));
    x.textAlign = "left";
  } else if (hint) {
    x.textAlign = "center";
    x.font = "15px Arial";
    x.fillStyle = "#e9e0c5";
    x.fillText(hint, w / 2, h - 45);
    x.textAlign = "left";
  }
}
