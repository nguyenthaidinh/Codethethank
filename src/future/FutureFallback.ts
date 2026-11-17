import type { ChapterBeat } from "../chapter/director";
import {
  originAudit,
  channels,
  futurePlace,
  OPENING_TIMING,
  type Channel,
} from "./direction";
import { TERMINAL_FONT, terminalColor } from "./terminalStyle";

/** Canvas alternative: same physical loci and investigation; no WebGL requirement. */
export class FutureFallback {
  signal = { x: 0, y: 0, focused: false };
  anchors: Record<string, { x: number; y: number }> = {};
  private x: CanvasRenderingContext2D;
  private w = 1280;
  private h = 720;
  private found: Channel[] = [];
  private selected: Channel | null = null;
  private place = "city";
  private view: "core" | "atrium" = "core";
  get ready() {
    return true;
  }
  lookPlace(view: "core" | "atrium") {
    this.view = view;
  }
  adaptQuality() {
    /* Fixed Canvas resolution, no GPU resource escalation. */
  }
  constructor(private canvas: HTMLCanvasElement) {
    this.x = canvas.getContext("2d")!;
  }
  resize(w: number, h: number) {
    this.w = w;
    this.h = h;
    this.canvas.width = Math.min(w, 1440);
    this.canvas.height = (h * this.canvas.width) / w;
  }
  observe() {
    /* Static camera makes fallback safe on constrained devices. */
  }
  focusSignal(v: boolean) {
    this.signal.focused = v;
  }
  setInvestigation(found: Channel[], selected: Channel | null = null) {
    this.found = found;
    this.selected = selected;
  }
  render(
    beat: ChapterBeat,
    t: number,
    _dt: number,
    elapsed: number,
    reduced: boolean,
  ) {
    const c = this.x,
      w = this.w,
      h = this.h,
      place =
        beat === "PLAYER_CONTROL_ENABLED" && this.view === "atrium"
          ? "headquarters"
          : futurePlace(beat, t);
    this.place = place;
    c.setTransform(this.canvas.width / w, 0, 0, this.canvas.height / h, 0, 0);
    const sky = c.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, "#071423");
    sky.addColorStop(1, "#68818b");
    c.fillStyle = sky;
    c.fillRect(0, 0, w, h);
    if (place === "city") {
      for (let layer = 0; layer < 3; layer++)
        for (let i = 0; i < 18; i++) {
          const bw = w / (12 + layer * 4),
            bh = h * (0.1 + ((i * 17 + layer * 3) % 13) / 35),
            px = (i * w) / 16 - (reduced ? 0 : elapsed * (layer + 1) * 0.7),
            py = h * 0.81 - bh;
          c.fillStyle = ["#415a6b", "#294053", "#132b3e"][layer];
          c.fillRect(px, py, bw * 0.75, bh);
          c.fillStyle = "#bacdc85a";
          for (let a = 0; a < 3; a++)
            for (let b = 0; b < 6; b++)
              c.fillRect(px + 8 + a * bw * 0.16, py + 15 + b * bh * 0.13, 2, 4);
        }
      c.strokeStyle = "#b5d3dc";
      c.lineWidth = w * 0.025;
      c.beginPath();
      c.moveTo(w * 0.46, h * 0.8);
      c.lineTo(w * 0.46, h * 0.32);
      c.bezierCurveTo(
        w * 0.46,
        h * 0.13,
        w * 0.65,
        h * 0.13,
        w * 0.65,
        h * 0.32,
      );
      c.lineTo(w * 0.65, h * 0.8);
      c.stroke();
      c.fillStyle = "#10293c";
      c.fillRect(w * 0.52, h * 0.2, w * 0.075, h * 0.61);
      c.fillRect(w * 0.39, h * 0.6, w * 0.13, h * 0.21);
      c.fillRect(w * 0.595, h * 0.5, w * 0.1, h * 0.31);
      c.strokeStyle = "#9dbbc9";
      c.lineWidth = 1;
      for (let y = h * 0.24; y < h * 0.8; y += h * 0.037) {
        c.beginPath();
        c.moveTo(w * 0.52, y);
        c.lineTo(w * 0.595, y);
        c.stroke();
      }
    } else {
      c.fillStyle = "#0d202f";
      c.beginPath();
      c.moveTo(0, h);
      c.lineTo(w * 0.31, h * 0.48);
      c.lineTo(w * 0.69, h * 0.48);
      c.lineTo(w, h);
      c.fill();
      for (const side of [-1, 1])
        for (let i = 0; i < 6; i++) {
          const xx =
            side < 0 ? w * 0.02 + i * w * 0.045 : w * 0.98 - i * w * 0.045;
          c.strokeStyle = "#a7c5d945";
          c.lineWidth = 2;
          c.beginPath();
          c.moveTo(xx, h * 0.12 + i * 12);
          c.lineTo(xx, h * 0.85 - i * 30);
          c.stroke();
        }
      for (let i = 0; i < 5; i++) {
        c.fillStyle = "#91b7c533";
        c.fillRect(0, h * (0.23 + i * 0.13), w * 0.26, h * 0.015);
        c.fillRect(w * 0.74, h * (0.23 + i * 0.13), w * 0.26, h * 0.015);
      }
      c.strokeStyle = "#b9d6dc";
      c.lineWidth = 2;
      c.beginPath();
      c.ellipse(w * 0.5, h * 0.78, w * 0.21, h * 0.055, 0, 0, Math.PI * 2);
      c.stroke();
      for (let i = 0; i < 28; i++) {
        const yy = h * (0.2 + i * 0.015),
          wave = reduced ? 0 : Math.sin(elapsed * 0.4 + i * 0.12) * w * 0.015;
        c.strokeStyle = i % 5 === 0 ? "#e6bd7c" : "#8bc1d786";
        c.lineWidth = i % 5 === 0 ? 3 : 1;
        c.beginPath();
        c.moveTo(w * 0.4 + wave, yy);
        c.lineTo(w * 0.6 - wave, yy);
        c.stroke();
      }
      // Service pylons and bridges retain a hierarchy of human/infrastructure scale.
      for (let i = 0; i < 6; i++) {
        const px = w * (0.31 + i * 0.075),
          height = h * (0.26 + (i % 2) * 0.07);
        c.fillStyle = "#102c3e";
        c.fillRect(px, h * 0.58 - height, w * 0.035, height);
        c.strokeStyle = "#8cc5d6";
        c.lineWidth = 1;
        for (let y = h * 0.58 - height; y < h * 0.58; y += h * 0.03) {
          c.beginPath();
          c.moveTo(px, y);
          c.lineTo(px + w * 0.035, y);
          c.stroke();
        }
      }
      const mystery =
        beat !== "OPENING_CINEMATIC" || t >= OPENING_TIMING.anomaly;
      if (mystery) {
        const left = w * 0.15,
          top = h * 0.23,
          width = w * 0.7;
        c.fillStyle = "#071522";
        c.fillRect(left, top, width, h * 0.5);
        c.strokeStyle = "#b89c73";
        c.strokeRect(left, top, width, h * 0.5);
        let yy = top + 28;
        c.textAlign = "left";
        const write = (
          text: string,
          size: number,
          color = "#c9dce2",
          code = false,
        ) => {
          c.fillStyle = color;
          c.font = `${size}px ${code ? TERMINAL_FONT : "Arial"}`;
          let line = "";
          for (const word of text.split(" ")) {
            if (c.measureText(line + word).width > width - 28) {
              c.fillText(line.trim(), left + 14, yy);
              yy += size * 1.4;
              line = "";
            }
            line += word + " ";
          }
          if (line) {
            c.fillText(line.trim(), left + 14, yy);
            yy += size * 1.4;
          }
        };
        write(originAudit.title, w < 600 ? 16 : 24, "#e6c496");
        yy += 12;
        write(
          this.selected ? channels[this.selected].title : originAudit.status,
          w < 600 ? 13 : 19,
          this.selected ? "#9acbd7" : terminalColor(originAudit.status),
          true,
        );
        yy += 10;
        for (const line of this.selected
          ? channels[this.selected].lines
          : originAudit.lines)
          write("> " + line, w < 600 ? 13 : 18, terminalColor(line), true);
      }
    }
    c.textAlign = "center";
    c.font = "bold 30px Arial";
    c.fillStyle = "#e3edf0";
    c.fillText("A I O N", w * 0.5, h * 0.13);
    c.font = "11px Arial";
    c.fillStyle = "#a7c6d6";
    c.fillText(
      "2046  /  AION CITADEL · GRAND ATRIUM · NEXUS",
      w * 0.5,
      h * 0.17,
    );
    this.signal = { x: w * 0.5, y: h * 0.61, focused: this.signal.focused };
    this.anchors = {
      source: { x: w * 0.35, y: h * 0.58 },
      limit: { x: w * 0.65, y: h * 0.58 },
      open: { x: w * 0.5, y: h * 0.7 },
      research: { x: w * 0.2, y: h * 0.4 },
    };
    if (beat === "OPENING_CINEMATIC" && t < 2) {
      c.fillStyle = `rgba(0,0,0,${1 - t / 2})`;
      c.fillRect(0, 0, w, h);
    }
  }
  snapshot() {
    return {
      renderer: "future-canvas-fallback",
      place: this.place,
      investigated: [...this.found],
      selected: this.selected,
      signal: this.signal,
      drawCalls: 0,
      triangles: 0,
    };
  }
  dispose() {
    this.x.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
