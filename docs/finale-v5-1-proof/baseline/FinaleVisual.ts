import * as T from "three";
import type { FinaleSave } from "./state";
import type { Letter } from "./letter";
import { graphemes } from "../typography/text";
const ease = (v: number) => {
  const p = T.MathUtils.clamp(v, 0, 1);
  return p * p * (3 - 2 * p);
};
function wrap(x: CanvasRenderingContext2D, text: string, max: number) {
  const result: string[] = [];
  for (const paragraph of text.split("\n")) {
    let line = "";
    for (const c of graphemes(paragraph)) {
      if (x.measureText(line + c).width > max) {
        result.push(line);
        line = c;
      } else line += c;
    }
    result.push(line);
  }
  return result;
}
/** Continuous paper-to-sky composition, inside the existing research scene. */
export class FinaleVisual {
  private group = new T.Group();
  private star: T.Mesh;
  private sparks: T.Points;
  private bg: T.Points;
  private frame: T.Group;
  private canvas = document.createElement("canvas");
  private texture: T.CanvasTexture;
  private key = "";
  private originals = new Map<T.Object3D, boolean>();
  private objects: (T.BufferGeometry | T.Material | T.Texture)[] = [];
  constructor(
    private scene: T.Scene,
    private paper: T.Mesh,
  ) {
    for (const o of scene.children) this.originals.set(o, o.visible);
    this.canvas.width = 1000;
    this.canvas.height = 720;
    this.texture = new T.CanvasTexture(this.canvas);
    this.texture.colorSpace = T.SRGBColorSpace;
    this.objects.push(this.texture);
    const geo = new T.SphereGeometry(0.055, 12, 8),
      mat = new T.MeshBasicMaterial({ color: "#fff1be" });
    this.objects.push(geo, mat);
    this.star = new T.Mesh(geo, mat);
    this.group.add(this.star);
    const sparks = new Float32Array(64 * 3);
    const g = new T.BufferGeometry();
    g.setAttribute("position", new T.BufferAttribute(sparks, 3));
    const m = new T.PointsMaterial({
      color: "#e1d9a5",
      size: 0.022,
      transparent: true,
      opacity: 0.7,
    });
    this.objects.push(g, m);
    this.sparks = new T.Points(g, m);
    this.group.add(this.sparks);
    const stars = new Float32Array(460 * 3);
    let seed = 2011;
    for (let i = 0; i < 460; i++) {
      seed = (seed * 16807) % 2147483647;
      const a = (seed / 2147483647) * Math.PI * 2;
      seed = (seed * 16807) % 2147483647;
      const r = 3 + (seed / 2147483647) * 14;
      stars[i * 3] = Math.cos(a) * r;
      stars[i * 3 + 1] = 3 + Math.sin(a) * r * 0.6;
      stars[i * 3 + 2] = -3 - r * 0.7;
    }
    const sg = new T.BufferGeometry();
    sg.setAttribute("position", new T.BufferAttribute(stars, 3));
    const sm = new T.PointsMaterial({
      color: "#a8c3c1",
      size: 0.035,
      transparent: true,
      opacity: 0,
    });
    this.objects.push(sg, sm);
    this.bg = new T.Points(sg, sm);
    this.group.add(this.bg);
    this.frame = new T.Group();
    const fm = new T.MeshBasicMaterial({
      color: "#536e72",
      transparent: true,
      opacity: 0.35,
    });
    this.objects.push(fm);
    for (const [size, pos] of [
      [
        [5, 0.035, 0.035],
        [0, 0, 0],
      ],
      [
        [5, 0.035, 0.035],
        [0, 3, 0],
      ],
      [
        [0.035, 3, 0.035],
        [-2.5, 1.5, 0],
      ],
      [
        [0.035, 3, 0.035],
        [2.5, 1.5, 0],
      ],
      [
        [0.025, 3, 0.025],
        [0, 1.5, 0],
      ],
    ] as [number[], number[]][]) {
      const g = new T.BoxGeometry(...(size as [number, number, number]));
      this.objects.push(g);
      const m = new T.Mesh(g, fm);
      m.position.set(...(pos as [number, number, number]));
      this.frame.add(m);
    }
    this.frame.position.set(0.4, 4, -2);
    this.group.add(this.frame);
    scene.add(this.group);
  }
  update(
    s: FinaleSave,
    letter: Letter,
    t: number,
    reduced: boolean,
    camera: T.PerspectiveCamera,
  ) {
    const sky = ["galaxy", "closing", "ending"].includes(s.phase);
    const ink = s.phase === "transform";
    const p = ink ? ease((t - 2) / 7) : sky ? 1 : 0;
    this.paper.visible = !sky;
    this.paper.position.set(0.4, 1.095, -0.1);
    const key = JSON.stringify(letter) + s.choice;
    if (key !== this.key) {
      this.key = key;
      const x = this.canvas.getContext("2d")!;
      x.fillStyle = "#eee3c8";
      x.fillRect(0, 0, 1000, 720);
      x.fillStyle = "#3c5849";
      x.font = "24px Arial";
      x.fillText("20:11 · MỘT LỜI TRI ÂN", 55, 70);
      x.font = "italic 34px LessonSerif";
      if (s.choice !== "skip") {
        wrap(x, letter.recipient ? `Gửi ${letter.recipient}` : "", 880)
          .slice(0, 2)
          .forEach((l, i) => x.fillText(l, 55, 150 + i * 42));
        wrap(x, letter.message, 880)
          .slice(0, 10)
          .forEach((l, i) => x.fillText(l, 55, 250 + i * 43));
      }
      this.texture.needsUpdate = true;
      (this.paper.material as T.MeshBasicMaterial).map = this.texture;
    }
    for (const [o, visible] of this.originals)
      o.visible = visible && !sky && (!ink || t < 8);
    this.paper.visible = !sky && (!ink || t < 8);
    this.star.visible = ink || sky;
    const travel = reduced && ink ? 0 : p;
    this.star.position.set(0.4, 1.16 + travel * 6, -0.1 - travel * 1.5);
    this.star.scale.setScalar(reduced ? 1 : 1 + Math.sin(t * 2) * 0.07);
    const buffer = this.sparks.geometry.getAttribute(
      "position",
    ) as T.BufferAttribute;
    for (let i = 0; i < 64; i++) {
      const a = i * 2.39996;
      const spread = ink ? 1 - ease((t - 1) / 5) : 0.14;
      const r = (0.12 + (i % 9) * 0.025) * spread;
      buffer.setXYZ(
        i,
        0.4 + Math.cos(a) * r,
        1.12 + travel * 6 + Math.sin(a) * r,
        -0.1 - travel * 1.5 + Math.sin(i) * r,
      );
    }
    buffer.needsUpdate = true;
    this.sparks.geometry.setDrawRange(0, reduced ? 8 : 64);
    this.sparks.visible = ink || sky;
    (this.bg.material as T.PointsMaterial).opacity = p * 0.8;
    this.frame.visible = sky;
    this.group.visible = true;
    const fog = this.scene.fog as T.FogExp2;
    fog.density = sky ? 0.006 : 0.024 + p * 0.04;
    this.scene.background = new T.Color().lerpColors(
      new T.Color("#192f39"),
      new T.Color("#071923"),
      p,
    );
    const eye = new T.Vector3(1.7, 2.5, 0.7),
      at = new T.Vector3(0.4, 1.095, -0.1);
    if (s.phase === "memory") {
      const q = reduced ? 1 : ease(t / 6);
      eye.lerp(new T.Vector3(3.8, 2.6, 3.4), q);
      at.lerp(new T.Vector3(0.4, 1, -0.5), q);
      if (s.memoryFocus === "evaluation") {
        eye.set(2.5, 2.6, 0.2);
        at.set(1, 1.08, -1.25);
      }
      if (s.memoryFocus === "chair") {
        eye.set(3.4, 1.5, 2);
        at.set(1.1, 0.7, 0.25);
      }
      if (s.memoryFocus === "notebook") {
        eye.set(1.8, 2.6, 0.6);
        at.set(0.6, 1.08, -0.6);
      }
    }
    if (s.phase === "lesson") {
      if (t < 7) {
        eye.set(2.5, 2.6, 0.2);
        at.set(1, 1.08, -1.25);
      } else if (t < 11) {
        eye.set(3.4, 1.5, 2);
        at.set(1.1, 0.7, 0.25);
      } else {
        eye.set(-2.8, 1.65, -3);
        at.set(0.3, 1.15, 0.1);
      }
    }
    if (ink && !reduced) {
      eye.lerp(new T.Vector3(1.6, 8, 3.5), p);
      at.lerp(this.star.position, p);
    }
    if (sky) {
      eye.set(0.4, s.starSeen ? 7.5 : 7.8, s.starSeen ? 1.3 : 3.1);
      at.copy(this.star.position);
      if (s.phase === "closing" || s.phase === "ending") {
        const q = s.phase === "ending" || reduced ? 1 : ease(t / 9);
        eye.lerp(new T.Vector3(1.2, 8.4, 7), q);
        at.lerp(new T.Vector3(0.4, 6, -1.8), q);
      }
    }
    if (camera.aspect < 0.8)
      eye
        .sub(at)
        .multiplyScalar(sky ? 1.15 : 1.4)
        .add(at);
    camera.position.copy(eye);
    camera.lookAt(at);
    camera.fov = sky ? 52 : 43;
    camera.updateProjectionMatrix();
  }
  dispose() {
    this.objects.forEach((o) => o.dispose());
  }
}
