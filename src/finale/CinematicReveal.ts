import * as T from "three";
import type { FinaleSave } from "./state";
import type { Letter } from "./letter";
import { graphemes } from "../typography/text";
import {
  projectRevealPanel,
  revealLetter,
  revealPages,
  revealTiming,
  smooth,
} from "./reveal";

/** Presentation-only reveal; no clock, audio context, input listener or progression writes. */
export class CinematicReveal {
  readonly root = new T.Group();
  private wall = new T.Group();
  private resources: (T.BufferGeometry | T.Material | T.Texture)[] = [];
  private materials = new Map<string, T.MeshStandardMaterial>();
  private canvas = document.createElement("canvas");
  private texture: T.CanvasTexture;
  private wallText: T.Mesh<T.PlaneGeometry, T.MeshBasicMaterial>;
  private ink: T.Mesh<T.PlaneGeometry, T.MeshBasicMaterial>;
  private light: T.PointLight;
  private ambient: T.HemisphereLight;
  private orb: T.Mesh;
  private halo: T.Sprite;
  private glyphs: T.Points<T.BufferGeometry, T.PointsMaterial>;
  private source = new Float32Array(240 * 3);
  private ribbonGlow: T.Mesh<T.TubeGeometry, T.MeshBasicMaterial>;
  private ribbon: T.Line<T.BufferGeometry, T.LineBasicMaterial>;
  private path = new T.CubicBezierCurve3(
    new T.Vector3(0.2, 1.66, -0.69),
    new T.Vector3(2.2, 2.5, -3),
    new T.Vector3(-1.4, 5.2, -7),
    new T.Vector3(0.2, 6.25, -10.8),
  );
  private eye = new T.Vector3();
  private at = new T.Vector3();
  private point = new T.Vector3();
  private corner = new T.Vector3();
  private wide = new T.Vector3();
  private near = new T.Vector3();
  private start = new T.Vector3();
  private veil: T.Mesh<T.PlaneGeometry, T.ShaderMaterial>;
  private background = new T.Color("#0b1422");
  private lastPhase: FinaleSave["phase"] | undefined;
  private closingFocus = 0;
  private key = "";
  private seen: boolean | undefined;
  private focusAt = 0;
  private focus = 0;
  constructor(private scene: T.Scene) {
    this.root.name = "finale-personal-reveal";
    const box = (
      size: [number, number, number],
      pos: [number, number, number],
      color: string,
      parent: T.Group = this.root,
    ) => {
      const g = new T.BoxGeometry(...size);
      let m = this.materials.get(color);
      if (!m) {
        m = new T.MeshStandardMaterial({
          color,
          roughness: 0.72,
          metalness: 0.18,
        });
        this.materials.set(color, m);
        this.resources.push(m);
      }
      const mesh = new T.Mesh(g, m);
      mesh.position.set(...pos);
      parent.add(mesh);
      this.resources.push(g);
      return mesh;
    };
    box([55, 0.12, 65], [0, -0.12, -15], "#0b1422");
    for (let i = 0; i < 3; i++)
      box(
        [11 - i * 0.7, 0.16, 3.7 - i * 0.45],
        [0.2, i * 0.16, -11],
        "#182b3c",
      );
    box([8.7, 5.3, 0.4], [0, 0, -0.3], "#24384a", this.wall);
    box([8.12, 4.72, 0.12], [0, 0, -0.03], "#a48960", this.wall);
    box([8, 4.6, 0.08], [0, 0, 0.04], "#0b1422", this.wall);
    this.wall.position.set(0.2, 3.5, -11);
    this.root.add(this.wall);
    for (const side of [-1, 1]) {
      box([0.2, 7, 0.45], [side * 5.7, 3.5, -11.7], "#24384a");
      for (let i = 0; i < 4; i++)
        box(
          [0.09, 5 + i * 0.8, 0.15],
          [side * (6.7 + i * 1.2), 2.5 + i * 0.4, -13 - i * 2],
          "#24384a",
        );
      for (let i = 0; i < 5; i++)
        box([0.018, 0.018, 1.9], [side * 3.3, 0.015, -2 - i * 2.4], "#456675");
    }
    this.canvas.width = 1600;
    this.canvas.height = 920;
    this.texture = new T.CanvasTexture(this.canvas);
    this.texture.colorSpace = T.SRGBColorSpace;
    const textMat = new T.MeshBasicMaterial({
      map: this.texture,
      transparent: true,
      depthWrite: false,
    });
    const textGeo = new T.PlaneGeometry(8, 4.6);
    this.wallText = new T.Mesh(textGeo, textMat);
    this.wallText.position.z = 0.09;
    this.wall.add(this.wallText);
    const inkGeo = new T.PlaneGeometry(1.4, 0.805),
      inkMat = new T.MeshBasicMaterial({
        map: this.texture,
        transparent: true,
        depthWrite: false,
        fog: false,
      });
    this.ink = new T.Mesh(inkGeo, inkMat);
    this.ink.position.set(0.2, 1.66, -0.7);
    this.root.add(this.ink);
    this.resources.push(this.texture, textMat, textGeo, inkGeo, inkMat);
    const glyphGeo = new T.BufferGeometry();
    glyphGeo.setAttribute(
      "position",
      new T.BufferAttribute(new Float32Array(240 * 3), 3),
    );
    const glyphMat = new T.PointsMaterial({
      color: "#d5a76b",
      size: 0.025,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
      fog: false,
    });
    this.glyphs = new T.Points(glyphGeo, glyphMat);
    this.glyphs.frustumCulled = false;
    this.root.add(this.glyphs);
    this.resources.push(glyphGeo, glyphMat);
    const ribbonGeo = new T.BufferGeometry().setFromPoints(
      this.path.getPoints(120),
    );
    const ribbonMat = new T.LineBasicMaterial({
      color: "#e6be85",
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
      fog: false,
    });
    this.ribbon = new T.Line(ribbonGeo, ribbonMat);
    this.root.add(this.ribbon);
    this.resources.push(ribbonGeo, ribbonMat);
    const tubeGeo = new T.TubeGeometry(this.path, 96, 0.025, 6, false);
    const tubeMat = new T.MeshBasicMaterial({
      color: "#e5ad6e",
      transparent: true,
      opacity: 0.24,
      depthWrite: false,
      fog: false,
    });
    this.ribbonGlow = new T.Mesh(tubeGeo, tubeMat);
    this.root.add(this.ribbonGlow);
    this.resources.push(tubeGeo, tubeMat);
    const orbGeo = new T.IcosahedronGeometry(0.065, 1),
      orbMat = new T.MeshBasicMaterial({ color: "#f0eee8", fog: false });
    this.orb = new T.Mesh(orbGeo, orbMat);
    this.root.add(this.orb);
    this.resources.push(orbGeo, orbMat);
    const glow = document.createElement("canvas");
    glow.width = 64;
    glow.height = 64;
    const gx = glow.getContext("2d")!;
    const grad = gx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, "#f0eee8");
    grad.addColorStop(0.15, "#d5a76baa");
    grad.addColorStop(1, "#d5a76b00");
    gx.fillStyle = grad;
    gx.fillRect(0, 0, 64, 64);
    const glowTex = new T.CanvasTexture(glow);
    glowTex.colorSpace = T.SRGBColorSpace;
    const haloMat = new T.SpriteMaterial({
      map: glowTex,
      transparent: true,
      depthWrite: false,
      fog: false,
      blending: T.AdditiveBlending,
    });
    this.halo = new T.Sprite(haloMat);
    this.halo.scale.setScalar(0.72);
    this.root.add(this.halo);
    this.resources.push(glowTex, haloMat);
    const starsGeo = new T.BufferGeometry(),
      points = new Float32Array(160 * 3);
    for (let i = 0; i < 160; i++) {
      points[i * 3] = (((i * 79) % 191) - 95) * 0.3;
      points[i * 3 + 1] = 2 + ((i * 41) % 101) * 0.1;
      points[i * 3 + 2] = -15 - ((i * 37) % 131) * 0.15;
    }
    starsGeo.setAttribute("position", new T.BufferAttribute(points, 3));
    const starsMat = new T.PointsMaterial({
      color: "#72b7c9",
      size: 0.02,
      transparent: true,
      opacity: 0.35,
    });
    this.root.add(new T.Points(starsGeo, starsMat));
    this.resources.push(starsGeo, starsMat);
    this.ambient = new T.HemisphereLight("#97c3d0", "#0b1422", 1.5);
    this.root.add(this.ambient);
    this.light = new T.PointLight("#d5a76b", 18, 24, 2);
    this.light.position.set(0.2, 5, -7);
    this.root.add(this.light);
    const veilGeo = new T.PlaneGeometry(2, 2);
    const veilMat = new T.ShaderMaterial({
      uniforms: { alpha: { value: 0 } },
      transparent: true,
      depthWrite: false,
      depthTest: false,
      vertexShader: "void main(){gl_Position=vec4(position.xy,0.0,1.0);}",
      fragmentShader:
        "uniform float alpha; void main(){gl_FragColor=vec4(0.043,0.078,0.133,alpha);}",
    });
    this.veil = new T.Mesh(veilGeo, veilMat);
    this.veil.frustumCulled = false;
    this.veil.renderOrder = 100;
    this.root.add(this.veil);
    this.resources.push(veilGeo, veilMat);
    scene.add(this.root);
    this.root.visible = false;
  }
  private paint(s: FinaleSave, letter: Letter) {
    const content = revealLetter(s, letter),
      key = JSON.stringify(content);
    if (key === this.key) return;
    this.key = key;
    const x = this.canvas.getContext("2d")!;
    const paperLight = x.createLinearGradient(0, 0, 1600, 920);
    paperLight.addColorStop(0, "#182a3d");
    paperLight.addColorStop(1, "#0b1422");
    x.fillStyle = paperLight;
    x.fillRect(0, 0, 1600, 920);
    x.fillStyle = "#efd39f";
    x.font = "24px Arial";
    x.fillText("20 / 11  ·  LỜI TRI ÂN RIÊNG TƯ", 100, 95);
    const lines = (text: string, size: number, max: number) => {
      x.font = `${size}px LessonSerif, Georgia, serif`;
      const rows: string[] = [];
      let row = "";
      for (const c of graphemes(text)) {
        if (c === "\n") {
          rows.push(row);
          row = "";
          continue;
        }
        if (row && x.measureText(row + c).width > max) {
          rows.push(row);
          row = "";
        }
        row += c;
      }
      rows.push(row);
      return rows;
    };
    x.fillStyle = "#f0eee8";
    lines(content.recipient, 52, 1400)
      .slice(0, 2)
      .forEach((l, i) => x.fillText(l, 100, 195 + i * 62));
    lines(revealPages(content.message)[0], 44, 1400)
      .slice(0, 7)
      .forEach((l, i) => x.fillText(l, 100, 350 + i * 57));
    x.fillStyle = "#d5a76b";
    x.font = "italic 32px Arial";
    x.fillText(
      content.signature ? `— ${content.signature}` : "",
      100,
      805,
      1400,
    );
    x.fillStyle = "#9eafb9";
    x.font = "24px Arial";
    x.fillText("Không gian cá nhân · Chưa công khai", 100, 875);
    this.texture.needsUpdate = true;
    // Sample actual glyph ink, then dissolve those points into the flight path.
    const sample = document.createElement("canvas");
    sample.width = 640;
    sample.height = 160;
    const sx = sample.getContext("2d")!;
    sx.fillStyle = "#fff";
    sx.font = "30px Arial";
    sx.fillText(content.message.slice(0, 80), 12, 70, 610);
    const pixels = sx.getImageData(0, 0, 640, 160).data,
      ink: number[] = [];
    for (let y = 20; y < 120; y += 3)
      for (let px = 0; px < 640; px += 3)
        if (pixels[(y * 640 + px) * 4 + 3] > 100) ink.push(px, y);
    for (let i = 0; i < 240; i++) {
      const idx = ink.length ? Math.floor((i / 240) * (ink.length / 2)) * 2 : 0;
      this.source[i * 3] = 0.2 + ((ink[idx] ?? 320) - 320) / 460;
      this.source[i * 3 + 1] = 1.66 + (80 - (ink[idx + 1] ?? 80)) / 260;
      this.source[i * 3 + 2] = -0.68;
    }
  }
  update(
    s: FinaleSave,
    letter: Letter,
    t: number,
    reduced: boolean,
    camera: T.PerspectiveCamera,
  ) {
    this.root.visible = true;
    this.paint(s, letter);
    const timing = revealTiming(s.phase, t, reduced),
      portrait = camera.aspect < 0.8;
    const transform = s.phase === "transform";
    if (s.phase !== this.lastPhase) {
      this.closingFocus =
        this.lastPhase === "galaxy" ? this.focus : s.starSeen ? 1 : 0;
      this.lastPhase = s.phase;
      this.seen = undefined;
    }
    this.veil.visible = timing.veil > 0;
    this.veil.material.uniforms.alpha.value = timing.veil;
    if (this.seen === undefined) {
      this.focus = s.starSeen ? 1 : 0;
      this.seen = s.starSeen;
      this.focusAt = -10;
    }
    if (this.seen !== s.starSeen) {
      this.seen = s.starSeen;
      this.focusAt = t;
    }
    this.focus = s.starSeen
      ? reduced
        ? 1
        : smooth((t - this.focusAt) / 1.2)
      : 0;
    if (s.phase === "closing") this.focus = this.closingFocus;
    this.wall.scale.set(portrait ? 0.52 : 1, portrait ? 1.1 : 1, 1);
    this.wall.position.y = portrait ? 3.2 : 3.5;
    this.wall.visible = timing.wallOpacity > 0;
    this.ambient.intensity = timing.wallOpacity * 1.8;
    this.light.intensity = timing.wallOpacity * (12 + timing.arrival * 10);
    this.wallText.visible = s.phase !== "galaxy";
    this.wallText.material.opacity = timing.textOpacity;
    this.ink.visible = transform && !reduced && t < 2.5;
    this.ink.material.opacity = 1 - timing.release;
    this.path.getPoint(reduced ? 1 : timing.travel, this.point);
    this.orb.position.copy(this.point);
    this.halo.position.copy(this.point);
    this.orb.scale.setScalar(1 + timing.arrival * 0.35);
    this.halo.material.opacity = transform ? timing.release * 0.85 : 0.7;
    this.ribbon.visible = transform && !reduced;
    this.ribbonGlow.visible = this.ribbon.visible;
    this.ribbonGlow.geometry.setDrawRange(
      0,
      Math.floor(timing.travel * 96) * 36,
    );
    this.ribbonGlow.material.opacity = 0.24 * (1 - smooth((t - 6) / 3));
    this.ribbon.geometry.setDrawRange(0, Math.floor(timing.travel * 120) + 1);
    this.ribbon.material.opacity = 0.7 * (1 - smooth((t - 6) / 3));
    this.glyphs.visible = transform && !reduced && t < 8;
    const attr = this.glyphs.geometry.getAttribute(
      "position",
    ) as T.BufferAttribute;
    const count = portrait ? 120 : 240;
    for (let i = 0; i < count; i++) {
      this.path.getPoint(Math.max(0, timing.travel - i * 0.0015), this.point);
      const wiggle = Math.sin(i * 2.4) * 0.028;
      attr.setXYZ(
        i,
        T.MathUtils.lerp(
          this.source[i * 3],
          this.point.x + wiggle,
          timing.release,
        ),
        T.MathUtils.lerp(
          this.source[i * 3 + 1],
          this.point.y + Math.cos(i) * 0.025,
          timing.release,
        ),
        T.MathUtils.lerp(this.source[i * 3 + 2], this.point.z, timing.release),
      );
    }
    attr.needsUpdate = true;
    this.glyphs.geometry.setDrawRange(0, count);
    this.glyphs.material.opacity = 1 - smooth((t - 6) / 2);
    this.wide.set(0.2, 3.5, portrait ? 5.5 : 1.4);
    this.near.set(0.2, 3.5, portrait ? 3.9 : 0);
    this.eye.copy(this.wide).lerp(this.near, this.focus);
    this.at.set(0.2, 3.5, -11);
    if (transform && !reduced) {
      this.start.set(
        0.2,
        s.choice === "skip" ? 1.58 : 1.66,
        s.choice === "skip" ? (portrait ? 5.6 : 2.15) : portrait ? 1.65 : 0.8,
      );
      const move = smooth((t - 1.5) / 7.5);
      this.eye.lerpVectors(this.start, this.wide, move);
      this.eye.x += Math.sin(move * Math.PI) * 1.15;
      this.at
        .set(0.2, s.choice === "skip" ? 1.38 : 1.66, -0.72)
        .lerp(this.point.set(0.2, 3.5, -11), smooth((t - 1.5) / 5));
    }
    if (timing.close && !reduced) {
      this.eye.lerp(this.point.set(0.2, 4.2, portrait ? 10 : 6), timing.close);
      this.at.y = T.MathUtils.lerp(3.5, 3.1, timing.close);
    }
    camera.position.copy(this.eye);
    camera.lookAt(this.at);
    camera.fov = 44;
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    const fog = this.scene.fog as T.FogExp2;
    fog.color.copy(this.background);
    fog.density =
      transform && !reduced
        ? 0.012 + Math.sin(smooth((t - 1.5) / 3) * Math.PI) * 0.55
        : 0.012;
    this.scene.background = this.background;
    if (s.phase === "galaxy") {
      const halfW = 4 * (portrait ? 0.52 : 1),
        halfH = 2.3 * (portrait ? 1.1 : 1);
      this.corner
        .set(0.2 - halfW, this.wall.position.y + halfH, -10.91)
        .project(camera);
      const left = (this.corner.x + 1) * 50,
        top = (1 - this.corner.y) * 50;
      this.corner
        .set(0.2 + halfW, this.wall.position.y - halfH, -10.91)
        .project(camera);
      projectRevealPanel(
        left,
        top,
        (this.corner.x + 1) * 50 - left,
        (1 - this.corner.y) * 50 - top,
      );
    }
  }
  dispose() {
    this.root.removeFromParent();
    this.resources.forEach((r) => r.dispose());
  }
}
