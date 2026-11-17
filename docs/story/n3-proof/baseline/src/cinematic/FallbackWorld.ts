import { drawFinaleFallback } from "../finale/Fallback";
import { CHAIR_MOTIF } from "./motifs";
import { TERMINAL_ALERT } from "../future/terminalStyle";
import type { FinaleSave } from "../finale/state";
import type { Letter } from "../finale/letter";
import { drawRippleFallback } from "../ripple/Fallback";
import type { RippleSave } from "../ripple/state";
import type { SliceSave, Focus, Caption } from "./director";
import { drawOverlay } from "./overlay";
import { drawEvaluation } from "../verdict/screen";
import type { VerdictSave } from "../verdict/state";
import type { StaySave } from "../stayed/state";
import { drawNotebook } from "../stayed/Notebook";
import type { PropPosition } from "./WorldRenderer";
/** Lightweight 2D stage used only if the GPU cannot initialize or loses context. */
export class FallbackWorld {
  private x: CanvasRenderingContext2D;
  private width = 1280;
  private height = 720;
  private unit = 1;
  private schoolLogo = new Image();
  private focus: Focus = "door";
  private overlay = document.createElement("canvas");
  private overlayEnabled = false;
  private evaluation: VerdictSave | null = null;
  private evaluationCanvas = document.createElement("canvas");
  private finale: FinaleSave | null = null;
  private letter: Letter | null = null;
  setFinale(s: FinaleSave | null, letter: Letter | null) {
    this.finale = s;
    this.letter = letter;
  }
  private ripple: RippleSave | null = null;
  private rippleSnapshot: object = {};
  setRipple(s: RippleSave | null) {
    this.ripple = s;
  }
  private stayed: StaySave | null = null;
  private bookCanvas = document.createElement("canvas");
  setStayed(value: StaySave | null) {
    this.stayed = value;
  }
  setEvaluation(value: VerdictSave | null) {
    this.evaluation = value;
  }
  private camera = { x: 640, y: 360, zoom: 1 };
  private cinematicShot: string | null = null;
  private anchors: Record<string, [number, number]> = {
    book: [850, 480],
    teacher: [800, 470],
    chair_insert: [850, 590],
    notes: [940, 480],
    an: [490, 465],
    window: [140, 250],
    clock: [1030, 130],
    door: [1130, 340],
    laptop: [615, 370],
    notebook: [830, 480],
    profile: [690, 510],
    chair: [850, 590],
    paper: [850, 490],
  };
  constructor(public canvas: HTMLCanvasElement) {
    this.schoolLogo.src =
      import.meta.env.BASE_URL + "school/tay-nguyen-university-logo.png";
    this.x = canvas.getContext("2d")!;
    if (!this.x) throw new Error("Canvas không khả dụng");
  }
  resize(w: number, h: number) {
    this.width = w;
    this.height = h;
    this.unit = w / h < 0.85 ? h / 900 : Math.min(w / 1280, h / 720);
    this.canvas.width = w;
    this.canvas.height = h;
  }
  focusOn(f: Focus) {
    this.focus = f;
  }
  look() {}
  dispose() {}
  setOverlay(enabled: boolean, caption: Caption | null, hint: string) {
    this.overlayEnabled = enabled;
    if (!enabled) return;
    this.overlay.width = this.width;
    this.overlay.height = this.height;
    drawOverlay(this.overlay, caption, hint);
  }
  render(s: SliceSave, t: number, dt: number, elapsed: number) {
    this.focus = s.focus;
    if (this.finale && this.letter && this.ripple) {
      this.rippleSnapshot = drawFinaleFallback(
        this.x,
        this.width,
        this.height,
        this.finale,
        this.letter,
        this.ripple,
        t,
        s.reduced,
      );
      return;
    }
    if (
      this.ripple &&
      !["sketch", "change", "echo"].includes(this.ripple.phase)
    ) {
      this.rippleSnapshot = drawRippleFallback(
        this.x,
        this.width,
        this.height,
        this.ripple,
        t,
        s.reduced,
      );
      return;
    }
    const x = this.x,
      w = this.width,
      h = this.height;
    x.save();
    x.fillStyle = "#23372f";
    x.fillRect(0, 0, w, h);
    x.translate((w - 1280 * this.unit) / 2, (h - 720 * this.unit) / 2);
    x.scale(this.unit, this.unit);
    const anchor = this.anchors[s.focus];
    const seatedFrame =
      !this.ripple &&
      this.stayed &&
      ((this.stayed.phase === "chair" && t >= CHAIR_MOTIF.holdUntil) ||
        (["question", "second_chance"].includes(this.stayed.phase) &&
          s.focus === "faces"));
    const shot = seatedFrame
      ? "conversation.master"
      : !this.ripple && this.stayed?.phase === "chair"
        ? "chair.insert"
        : null;
    if (seatedFrame) {
      this.camera = { x: 620, y: 400, zoom: w / h < 0.85 ? 0.8 : 1.12 };
    } else if (this.cinematicShot !== shot && shot === "chair.insert") {
      this.camera = { x: 850, y: 590, zoom: 1.5 };
    }
    this.cinematicShot = shot;
    const blend = s.reduced ? 1 : 1 - Math.exp(-dt * 4);
    if (!seatedFrame) {
      this.camera.x += ((anchor?.[0] ?? 640) - this.camera.x) * blend;
      this.camera.y += ((anchor?.[1] ?? 360) - this.camera.y) * blend;
      this.camera.zoom += ((anchor ? 1.5 : 1) - this.camera.zoom) * blend;
    }
    x.fillStyle = "#23372f";
    x.fillRect(0, 0, 1280, 720);
    x.translate(
      640 - this.camera.x * this.camera.zoom,
      360 - this.camera.y * this.camera.zoom,
    );
    x.scale(this.camera.zoom, this.camera.zoom);
    const bg = x.createLinearGradient(0, 0, 0, 720);
    bg.addColorStop(0, "#a3aca2");
    bg.addColorStop(1, "#526b64");
    x.fillStyle = bg;
    x.fillRect(0, 0, 1280, 720);
    // Same institutional palette, depth cues and prop positions as the WebGL room.
    x.fillStyle = "#7e928e";
    x.beginPath();
    x.moveTo(0, 440);
    x.lineTo(1280, 450);
    x.lineTo(1280, 720);
    x.lineTo(0, 720);
    x.fill();
    x.strokeStyle = "#647a72";
    x.lineWidth = 1;
    for (let i = -4; i < 12; i++) {
      x.beginPath();
      x.moveTo(640 + (i - 4) * 45, 430);
      x.lineTo(i * 170, 720);
      x.stroke();
    }
    for (const y of [480, 550, 640]) {
      x.beginPath();
      x.moveTo(0, y);
      x.lineTo(1280, y);
      x.stroke();
    }
    x.fillStyle = "#8ea6ad";
    x.fillRect(0, 70, 260, 370);
    x.fillStyle = "#637f7d";
    for (let i = 0; i < 3; i++) {
      x.fillRect(i * 95 - 15, 155, 70, 270);
      x.fillStyle = "#405e65";
      for (let j = 0; j < 3; j++) x.fillRect(i * 95, 185 + j * 65, 28, 30);
      x.fillStyle = "#637f7d";
    }
    x.strokeStyle = "#dae2c5";
    x.lineWidth = 1;
    for (let i = 0; i < 70; i++) {
      const y = ((i * 37 + (s.reduced ? 0 : elapsed * 120)) % 360) + 75;
      x.beginPath();
      x.moveTo((i * 73) % 250, y);
      x.lineTo(((i * 73) % 250) - 2, y + 13);
      x.stroke();
    }
    x.strokeStyle = "#657d74";
    x.lineWidth = 12;
    for (const y of [70, 250, 440]) {
      x.beginPath();
      x.moveTo(0, y);
      x.lineTo(260, y);
      x.stroke();
    }
    x.fillStyle = "#c2c6b6";
    x.fillRect(0, 435, 278, 13);
    x.fillStyle = "#3c5847";
    x.fillRect(420, 65, 450, 170);
    x.fillStyle = "#d4d9b8";
    x.font = "23px monospace";
    x.fillText("PHÒNG THỰC HÀNH · CNTT", 450, 110);
    x.fillText("17:05", 1000, 130);
    x.font = "15px Arial";
    x.fillText("Trường Đại học Tây Nguyên", 450, 160);
    x.fillText("Mục tiêu → Dữ liệu → Dự báo", 450, 195);
    if (this.schoolLogo.complete && this.schoolLogo.naturalWidth) {
      x.save();
      x.beginPath();
      x.arc(716, 168, 28, 0, Math.PI * 2);
      x.clip();
      const inset = this.schoolLogo.naturalWidth * 0.014;
      x.drawImage(
        this.schoolLogo,
        inset,
        inset,
        this.schoolLogo.naturalWidth - 2 * inset,
        this.schoolLogo.naturalHeight - 2 * inset,
        688,
        140,
        56,
        56,
      );
      x.restore();
    }
    x.fillStyle = "#d7d7bf";
    for (const px of [390, 760]) {
      x.fillRect(px, 18, 185, 8);
      x.fillRect(px - 10, 9, 205, 7);
    }
    // Quiet rows of powered-down workstations, behind the personal desk.
    for (let i = 0; i < 5; i++) {
      const px = 335 + (i % 3) * 245,
        py = 280 + Math.floor(i / 3) * 65;
      x.fillStyle = "#a38b68";
      x.fillRect(px - 25, py + 52, 190, 10);
      x.fillStyle = "#354d48";
      x.fillRect(px, py, 90, 54);
      x.fillStyle = "#253b3e";
      x.fillRect(px + 5, py + 5, 80, 40);
      x.fillStyle = "#536e64";
      x.fillRect(px - 10, py + 62, 7, 65);
      x.fillRect(px + 140, py + 62, 7, 65);
    }
    x.fillStyle = "#345248";
    x.fillRect(1070, 210, 150, 310);
    x.fillStyle = "#819b8d";
    x.fillRect(1090, 230, 110, 90);
    x.fillStyle = "#c6bc91";
    x.fillRect(1190, 370, 8, 20);
    x.fillStyle = "#365247";
    const drag =
      this.stayed?.phase === "chair"
        ? Math.min(t / 1.25, 1)
        : this.stayed && this.stayed.phase !== "discussion"
          ? 1
          : 0;
    x.save();
    x.translate(-60 * drag, 0);
    x.fillRect(820, 545, 75, 20);
    x.fillRect(820, 490, 75, 15);
    x.fillRect(822, 500, 8, 125);
    x.fillRect(880, 500, 8, 125);
    x.restore();
    const person = (px: number, py: number, color: string) => {
      const teacher = color === "#b4a479";
      const top = py - 85,
        face = py - 115;
      x.fillStyle = color;
      x.beginPath();
      x.moveTo(px - 26, top);
      x.quadraticCurveTo(px - 42, top + 6, px - 35, top + 40);
      x.lineTo(px - 30, py + 10);
      x.lineTo(px + 30, py + 10);
      x.lineTo(px + 35, top + 30);
      x.quadraticCurveTo(px + 37, top, px + 24, top);
      x.closePath();
      x.fill();
      x.fillStyle = "#c6b995";
      x.beginPath();
      x.moveTo(px - 14, top);
      x.lineTo(px, top + 20);
      x.lineTo(px + 14, top);
      x.fill();
      x.fillStyle = "#c69d79";
      x.beginPath();
      x.ellipse(px, face, 24, 30, -0.04, 0, Math.PI * 2);
      x.fill();
      x.fillStyle = "#2c3933";
      x.beginPath();
      x.ellipse(px - 1, face - 16, 25, 17, -0.1, Math.PI, Math.PI * 2);
      x.fill();
      if (teacher) {
        x.beginPath();
        x.arc(px - 25, face - 8, 12, 0, Math.PI * 2);
        x.fill();
      }
      x.fillRect(px - 10, face - 1, 3, 3);
      x.fillRect(px + 8, face - 1, 3, 3);
      x.strokeStyle = "#906b52";
      x.lineWidth = 2;
      x.beginPath();
      x.moveTo(px - 5, face + 13);
      x.lineTo(px + 5, face + 14);
      x.stroke();
      x.strokeStyle = color;
      x.lineWidth = 17;
      x.lineCap = "round";
      x.beginPath();
      x.moveTo(px + 25, top + 20);
      x.lineTo(px + 42, py - 12);
      x.lineTo(px + 65, py - 18);
      x.stroke();
      x.fillStyle = "#c69d79";
      x.beginPath();
      x.ellipse(px + 66, py - 18, 11, 6, -0.1, 0, Math.PI * 2);
      x.fill();
      x.lineCap = "butt";
      x.fillStyle = "#30473f";
      x.fillRect(px - 28, py + 10, 23, 72);
      x.fillRect(px + 8, py + 10, 23, 72);
      x.fillStyle = "#263439";
      x.fillRect(px - 30, py + 76, 30, 12);
      x.fillRect(px + 7, py + 76, 32, 12);
    };
    person(440, 480, "#829b85");
    if (
      (!this.evaluation ||
        ["teacher_enter", "chapter02"].includes(this.evaluation.phase)) &&
      !["arrival", "explore"].includes(s.beat)
    )
      person(
        s.beat === "enter" ? 1080 - Math.min(t / 6, 1) * 222 : 858 - drag * 60,
        480 +
          (this.stayed && this.stayed.phase !== "discussion"
            ? (this.stayed.phase === "chair"
                ? Math.max(0, Math.min(1, (t - 2.6) / 1.3))
                : 1) * 25
            : 0),
        "#b4a479",
      );
    x.fillStyle = "#b1956d";
    x.beginPath();
    x.moveTo(360, 420);
    x.lineTo(840, 420);
    x.lineTo(1010, 540);
    x.lineTo(300, 540);
    x.fill();
    x.strokeStyle = "#806e52";
    x.lineWidth = 1;
    for (let i = 0; i < 8; i++) {
      x.beginPath();
      x.moveTo(360 - i * 6, 428 + i * 13);
      x.lineTo(840 + i * 20, 428 + i * 13);
      x.stroke();
    }
    x.fillStyle = "#233d31";
    x.fillRect(480, 290, 270, 170);
    const rejected = ["verdict", "response", "paper", "complete"].includes(
      s.beat,
    );
    x.fillStyle = rejected ? TERMINAL_ALERT : "#bfcfaa";
    x.font = "16px monospace";
    x.fillText(rejected ? "NOT RECOMMENDED" : "HỖ TRỢ HỌC TẬP", 500, 345);
    x.fillStyle = "#bfcfaa";
    x.fillText("PROTOTYPE / AN", 500, 385);
    if (this.evaluation) {
      this.evaluationCanvas.width = 1200;
      this.evaluationCanvas.height = 720;
      drawEvaluation(
        this.evaluationCanvas.getContext("2d")!,
        this.evaluation,
        t,
      );
      x.drawImage(this.evaluationCanvas, 480, 290, 270, 170);
    }
    if (this.ripple?.phase === "change") {
      x.fillStyle = "#183529";
      x.fillRect(480, 290, 270, 170);
      x.fillStyle = "#d4dcb4";
      x.font = "18px Arial";
      x.fillText("NEXT SUPPORT STEP", 495, 335);
      x.font = "13px Arial";
      x.fillText("AN · Dự đoán +5 · xem lại nhu cầu", 495, 375);
      x.fillText("Bước tiếp: trao đổi với giảng viên", 495, 410);
    }
    x.fillStyle = "#e2d6b4";
    x.fillRect(780, 457, 100, 52);
    x.fillStyle = "#bfc7a2";
    x.fillRect(895, 450, 100, 70);
    x.fillStyle = "#344d40";
    x.font = "14px Arial";
    x.fillText("SỔ THIẾT KẾ", 900, 475);
    if (
      this.stayed &&
      !["discussion", "chair", "question"].includes(this.stayed.phase)
    ) {
      this.bookCanvas.width = 1000;
      this.bookCanvas.height = 720;
      drawNotebook(this.bookCanvas, this.stayed, t);
      x.drawImage(this.bookCanvas, 740, 430, 260, 145);
    }
    x.fillRect(660, 490, 65, 30);
    x.restore();
    if (this.overlayEnabled) x.drawImage(this.overlay, 0, 0);
  }
  project(): PropPosition[] {
    return Object.entries(this.anchors).map(([id, [x, y]]) => ({
      id: id as Focus,
      x: this.width / 2 + (x - this.camera.x) * this.camera.zoom * this.unit,
      y: this.height / 2 + (y - this.camera.y) * this.camera.zoom * this.unit,
      visible: true,
    }));
  }
  snapshot() {
    if (
      this.ripple &&
      !["sketch", "change", "echo"].includes(this.ripple.phase)
    )
      return {
        ...this.rippleSnapshot,
        drawCalls: 1,
      };
    return {
      school: {
        name: "Trường Đại học Tây Nguyên",
        logoLoaded:
          this.schoolLogo.complete && this.schoolLogo.naturalWidth > 0,
      },
      camera: [this.camera.x, this.camera.y, this.camera.zoom],
      shot: this.cinematicShot,
      focus: this.focus,
      teacher: [],
      chair: [],
      drawCalls: 1,
      triangles: 0,
    };
  }
}
