import type { ChapterBeat } from "./director";
type Point = [number, number, number];
const ease = (v: number) => {
  const p = Math.max(0, Math.min(1, v));
  return p * p * (3 - 2 * p);
};
/** Procedural 2.5D stage: world-space geometry projected through a moving camera.
 * No background bitmap, network assets, WebGL or post-processing dependency. */
export class SummitWorld {
  private ctx: CanvasRenderingContext2D;
  private w = 1280;
  private h = 720;
  private eye: Point = [-4, 4, -12];
  private look = [0, 0];
  private targetLook = [0, 0];
  private zoom = 0;
  private active = false;
  signal = { x: 0, y: 0, focused: false };
  constructor(private canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unavailable");
    this.ctx = ctx;
  }
  resize(w: number, h: number) {
    this.w = w;
    this.h = h;
    const scale = Math.min(1, 1440 / w);
    this.canvas.width = w * scale;
    this.canvas.height = h * scale;
  }
  observe(x: number, y: number) {
    this.targetLook = [
      Math.max(-1, Math.min(1, x)),
      Math.max(-1, Math.min(1, y)),
    ];
  }
  private p([x, y, z]: Point) {
    const depth = Math.max(0.25, z - this.eye[2]);
    const lens = Math.min(this.w * 0.85, this.h * 1.4);
    return {
      x: this.w * 0.5 + ((x - this.eye[0]) * lens) / depth + this.look[0] * 24,
      y: this.h * 0.47 - ((y - this.eye[1]) * lens) / depth + this.look[1] * 12,
      scale: lens / depth,
    };
  }
  private polygon(points: Point[], color: string) {
    const c = this.ctx;
    c.beginPath();
    points.forEach((pt, i) => {
      const p = this.p(pt);
      if (i) c.lineTo(p.x, p.y);
      else c.moveTo(p.x, p.y);
    });
    c.closePath();
    c.fillStyle = color;
    c.fill();
  }
  private box(
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    color: string,
  ) {
    this.polygon(
      [
        [x - w / 2, y, z],
        [x + w / 2, y, z],
        [x + w / 2, y + h, z],
        [x - w / 2, y + h, z],
      ],
      color,
    );
    this.polygon(
      [
        [x - w / 2, y + h, z],
        [x + w / 2, y + h, z],
        [x + w / 2, y + h, z + d],
        [x - w / 2, y + h, z + d],
      ],
      "#47524f",
    );
    this.polygon(
      [
        [x + w / 2, y, z],
        [x + w / 2, y + h, z],
        [x + w / 2, y + h, z + d],
        [x + w / 2, y, z + d],
      ],
      "#172626",
    );
  }
  private text(text: string, at: Point, size: number, color: string) {
    const p = this.p(at);
    this.ctx.fillStyle = color;
    this.ctx.font = `${Math.max(9, size * p.scale)}px Arial`;
    this.ctx.textAlign = "center";
    this.ctx.fillText(text, p.x, p.y);
  }
  render(
    beat: ChapterBeat,
    t: number,
    dt: number,
    elapsed: number,
    reduced: boolean,
  ) {
    const c = this.ctx,
      w = this.w,
      h = this.h;
    const opening = beat === "OPENING_CINEMATIC",
      close = beat === "SIGNAL_INVESTIGATION" || beat === "MEMORY_TRANSITION";
    const progress = opening ? ease(t / 30) : 1;
    const goal: Point = close
      ? [2.6, 1.55, 3]
      : [-4 * (1 - progress), 4 - 2.1 * progress, -12 + 10 * progress];
    const blend = reduced ? 1 : 1 - Math.exp(-dt * 2.5);
    this.eye = this.eye.map((v, i) => v + (goal[i] - v) * blend) as Point;
    this.zoom += ((close ? 1 : 0) - this.zoom) * blend;
    const controlled = beat === "PLAYER_CONTROL_ENABLED";
    this.look = this.look.map((v, i) =>
      reduced ? 0 : v + ((controlled ? this.targetLook[i] : 0) - v) * blend,
    );
    c.setTransform(this.canvas.width / w, 0, 0, this.canvas.height / h, 0, 0);
    const sky = c.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, "#09181d");
    sky.addColorStop(0.55, "#233c40");
    sky.addColorStop(1, "#101b20");
    c.fillStyle = sky;
    c.fillRect(0, 0, w, h);
    // Back wall, recessed stage, skylights, balcony tiers and ribbed ceiling.
    this.polygon(
      [
        [-22, 0, 43],
        [22, 0, 43],
        [22, 15, 43],
        [-22, 15, 43],
      ],
      "#253a3c",
    );
    this.polygon(
      [
        [-22, 0, 0],
        [22, 0, 0],
        [22, 0, 43],
        [-22, 0, 43],
      ],
      "#192c30",
    );
    for (let i = -9; i <= 9; i++)
      this.polygon(
        [
          [i * 2, 0, 2],
          [i * 2 + 0.015, 0, 2],
          [i * 2 + 0.015, 0, 42],
          [i * 2, 0, 42],
        ],
        "#324143",
      );
    for (let z = 42; z >= 8; z -= 5) {
      this.box(-16, 0, z, 1, 13, 0.6, "#3d5353");
      this.box(16, 0, z, 1, 13, 0.6, "#3d5353");
      this.polygon(
        [
          [-16, 12.5, z],
          [16, 12.5, z],
          [16, 12.5, z + 0.35],
          [-16, 12.5, z + 0.35],
        ],
        "#71827b",
      );
      for (const side of [-1, 1]) {
        this.box(side * 14, 5, z, 4, 0.45, 4.8, "#4e5c58");
        this.box(side * 14, 8.5, z, 4, 0.35, 4.8, "#485b59");
        this.polygon(
          [
            [side * 12, 5.5, z],
            [side * 12, 6.2, z],
            [side * 12, 6.2, z + 4],
            [side * 12, 5.5, z + 4],
          ],
          "#75918b",
        );
      }
    }
    this.box(0, 0, 34, 24, 0.7, 6, "#50615d");
    this.polygon(
      [
        [-10, 1.1, 39],
        [10, 1.1, 39],
        [10, 10, 39],
        [-10, 10, 39],
      ],
      "#0b2026",
    );
    this.text("GLOBAL INTELLIGENCE SUMMIT", [0, 9, 38.9], 0.5, "#9ab7b8");
    this.text("A I O N", [0, 5.8, 38.9], 2.2, "#f0e9d3");
    this.text(
      "2046  /  TRÍ TUỆ NHÂN TẠO ĐA NĂNG SỐ 1 THẾ GIỚI",
      [0, 3.8, 38.9],
      0.4,
      "#d3d7c8",
    );
    this.text(
      "KHOA HỌC     ·     Y TẾ     ·     GIÁO DỤC",
      [0, 2.5, 38.9],
      0.35,
      "#99bbb6",
    );
    // Soft light shafts; slow sweep only when motion is allowed.
    const drift = reduced ? 0 : Math.sin(elapsed * 0.12) * 1.2;
    for (const side of [-1, 1])
      this.polygon(
        [
          [side * 10, 12, 34],
          [side * 10 + 0.3, 12, 34],
          [side * 3 + drift, 0, 30],
          [side * 7 + drift, 0, 30],
        ],
        "rgba(211,226,209,.055)",
      );
    // Moving audience: seated heads, shoulders and chair backs in seven depth layers.
    for (let row = 0; row < 7; row++) {
      const z = 31 - row * 3;
      for (let seat = -7; seat <= 7; seat++) {
        if (Math.abs(seat) < 2) continue;
        const px = seat * 1.45,
          sway = reduced ? 0 : Math.sin(elapsed * 0.55 + row + seat) * 0.025;
        this.box(px, 0.2, z, 1, 0.85, 0.7, row % 2 ? "#293a3e" : "#304044");
        const p = this.p([px + sway, 1.45, z + 0.3]);
        c.fillStyle = seat % 3 ? "#545c56" : "#7e7664";
        c.beginPath();
        c.ellipse(p.x, p.y, p.scale * 0.18, p.scale * 0.23, 0, 0, Math.PI * 2);
        c.fill();
        this.polygon(
          [
            [px - 0.34, 1.18, z + 0.2],
            [px + 0.34, 1.18, z + 0.2],
            [px + 0.4, 0.65, z + 0.2],
            [px - 0.4, 0.65, z + 0.2],
          ],
          seat % 4 ? "#1c292f" : "#51605b",
        );
      }
    }
    // Player's physical terminal at the aisle. Its light is the only gameplay marker.
    this.box(3.2, 0, 5.5, 0.28, 1.1, 0.3, "#334447");
    this.box(3.2, 1.1, 5.35, 1.65, 0.12, 1.1, "#6c7971");
    this.polygon(
      [
        [2.4, 1.23, 5.3],
        [4, 1.23, 5.3],
        [4, 2.25, 5.55],
        [2.4, 2.25, 5.55],
      ],
      "#0b1d23",
    );
    const point = this.p([3.2, 1.75, 5.4]);
    this.signal = { x: point.x, y: point.y, focused: this.active };
    if (!opening || t >= 15) {
      const pulse = reduced ? 1 : 0.7 + 0.3 * Math.sin(elapsed * 2);
      const glow = c.createRadialGradient(
        point.x,
        point.y,
        0,
        point.x,
        point.y,
        Math.max(20, point.scale * 0.7),
      );
      glow.addColorStop(
        0,
        `rgba(223,202,143,${(this.active ? 0.5 : 0.25) * pulse})`,
      );
      glow.addColorStop(1, "rgba(223,202,143,0)");
      c.fillStyle = glow;
      c.fillRect(
        point.x - point.scale,
        point.y - point.scale,
        point.scale * 2,
        point.scale * 2,
      );
      if (this.zoom < 0.7) {
        this.text("20:11", [3.2, 1.75, 5.25], 0.23, "#e9d79c");
        this.text("SIGNAL", [3.2, 1.45, 5.25], 0.1, "#9abfbb");
      } else {
        for (const [i, line] of [
          "YEAR: 2026",
          "CASE: 17:05",
          "RESULT: NOT RECOMMENDED",
          "OUTCOME: RESTRICTED",
        ].entries())
          this.text(
            line,
            [3.2, 2.03 - i * 0.19, 5.25],
            0.085,
            i === 2 ? "#edbb9c" : "#d7dfcc",
          );
        this.text(
          "MÔ HÌNH THỬ NGHIỆM / 2026",
          [3.2, 1.27, 5.25],
          0.061,
          "#9aafa9",
        );
      }
    }
    // Lens-edge falloff, not a static background.
    const vignette = c.createRadialGradient(
      w * 0.5,
      h * 0.5,
      h * 0.2,
      w * 0.5,
      h * 0.5,
      Math.max(w, h) * 0.68,
    );
    vignette.addColorStop(0, "#0000");
    vignette.addColorStop(1, "#02090cb5");
    c.fillStyle = vignette;
    c.fillRect(0, 0, w, h);
    if (opening && t < 5) {
      c.fillStyle = `rgba(0,0,0,${1 - ease(t / 5)})`;
      c.fillRect(0, 0, w, h);
    }
  }
  focusSignal(value: boolean) {
    this.active = value;
  }
  snapshot() {
    return {
      camera: [...this.eye],
      signal: { ...this.signal },
      renderer: "procedural-2.5d",
    };
  }
  dispose() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
