import * as T from "three";
import {
  narrativeColor,
  narrativePalettes,
  type NarrativeDirection,
} from "./NarrativePalette";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

type XYZ = [number, number, number];
export type ClassroomDirection = NarrativeDirection;

/** Owned classroom geometry; the official school mark is a small local texture. */
export class ClassroomArt {
  readonly geometries: T.BufferGeometry[] = [];
  readonly textures: T.Texture[] = [];
  readonly materials = new Set<T.Material>();
  private surfaces = new Map<
    string,
    T.MeshLambertMaterial | T.MeshBasicMaterial
  >();
  schoolLogoLoaded = false;
  private closed = false;
  private maps = new Map<string, T.CanvasTexture>();
  get palette() {
    return narrativePalettes[this.direction];
  }
  constructor(
    private scene: T.Scene,
    readonly direction: ClassroomDirection,
  ) {}

  private map(kind: string) {
    const prior = this.maps.get(kind);
    if (prior) return prior;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = kind === "fabric" ? 128 : 512;
    const c = canvas.getContext("2d")!;
    c.fillStyle = "#ededeb";
    c.fillRect(0, 0, canvas.width, canvas.height);
    let seed = 1705;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    if (kind === "wood") {
      for (let i = 0; i < 150; i++) {
        const y = random() * 512;
        c.strokeStyle = `rgba(72,55,29,${0.015 + random() * 0.035})`;
        c.lineWidth = 0.5 + random() * 1.8;
        c.beginPath();
        c.moveTo(0, y);
        c.bezierCurveTo(
          140,
          y + random() * 9,
          340,
          y - random() * 9,
          512,
          y + random() * 2,
        );
        c.stroke();
      }
    } else if (kind === "fabric") {
      c.strokeStyle = "rgba(25,35,31,.045)";
      c.lineWidth = 1;
      for (let i = 0; i < 128; i += 3) {
        c.beginPath();
        c.moveTo(i, 0);
        c.lineTo(i, 128);
        c.moveTo(0, i);
        c.lineTo(128, i);
        c.stroke();
      }
    } else {
      if (kind === "paint") {
        const wash = c.createLinearGradient(0, 0, 512, 512);
        wash.addColorStop(0, "#d0dfe5");
        wash.addColorStop(0.5, "#f4efe1");
        wash.addColorStop(1, "#d0d7da");
        c.fillStyle = wash;
        c.fillRect(0, 0, 512, 512);
      }
      for (let i = 0; i < (kind === "floor" ? 180 : 300); i++) {
        const shade = Math.floor(140 + random() * 90);
        c.fillStyle = `rgba(${shade},${shade},${shade - 4},${kind === "floor" ? 0.035 : 0.025})`;
        const size = kind === "floor" ? 7 + random() * 20 : 6 + random() * 18;
        c.fillRect(random() * 512, random() * 512, size, size * 0.65);
      }
    }
    const texture = this.texture(canvas);
    texture.wrapS = texture.wrapT = T.RepeatWrapping;
    texture.repeat.set(kind === "floor" ? 7 : 1, kind === "floor" ? 7 : 1);
    texture.anisotropy = 4;
    this.maps.set(kind, texture);
    return texture;
  }

  private texture(canvas: HTMLCanvasElement) {
    const texture = new T.CanvasTexture(canvas);
    texture.colorSpace = T.SRGBColorSpace;
    this.textures.push(texture);
    return texture;
  }
  material(color: string) {
    const key = color;
    const prior = this.surfaces.get(key);
    if (prior) return prior;
    const wood = [
      "#a89972",
      "#a69c7b",
      "#a89972",
      "#ad8b62",
      "#9b7954",
    ].includes(color);
    const fabric = ["#4b6858", "#597461", "#7b9181", "#b4a57c"].includes(color);
    const paint = ["#b6b7a8", "#c5c4b5", "#71877e", "#667e78"].includes(color);
    const kind = wood
      ? "wood"
      : fabric
        ? "fabric"
        : paint
          ? "paint"
          : color === "#8d9992"
            ? "floor"
            : null;
    // Interior paint must respond to the window and desk light. Keep only
    // the distant scenery unlit so the rain view remains legible.
    const flatPaint = [
      "#899da3",
      "#718b8d",
      "#536e75",
      "#9aaeb0",
      "#69877a",
      "#5d796f",
    ].includes(color);
    const material = flatPaint
      ? new T.MeshBasicMaterial({
          color: narrativeColor(color, this.palette),
          map: kind ? this.map(kind) : null,
          toneMapped: false,
        })
      : new T.MeshLambertMaterial({
          color: narrativeColor(color, this.palette),
          map: kind ? this.map(kind) : null,
        });
    material.name = color;
    this.surfaces.set(key, material);
    this.materials.add(material);
    return material;
  }
  box(
    parent: T.Object3D,
    size: XYZ,
    pos: XYZ,
    color: string,
    radius = 0,
  ): T.Mesh {
    const bevel = Math.min(radius, Math.min(...size) * 0.4);
    const geo =
      bevel > 0
        ? new RoundedBoxGeometry(...size, 1, bevel)
        : new T.BoxGeometry(...size);
    this.geometries.push(geo);
    const mesh = new T.Mesh(geo, this.material(color));
    mesh.position.set(...pos);
    mesh.castShadow = mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }
  cylinder(
    parent: T.Object3D,
    radius: number,
    height: number,
    pos: XYZ,
    color: string,
    bottom = radius,
  ) {
    const geo = new T.CylinderGeometry(radius, bottom, height, 12);
    this.geometries.push(geo);
    const mesh = new T.Mesh(geo, this.material(color));
    mesh.position.set(...pos);
    mesh.castShadow = mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }
  private label(
    parent: T.Object3D,
    lines: string[],
    size: [number, number],
    pos: XYZ,
    bg: string,
    fg: string,
    font = 46,
    matchAspect = false,
  ) {
    const canvas = document.createElement("canvas");
    canvas.width = size[0] > 3 ? 1024 : 512;
    const height = matchAspect ? (1024 * size[1]) / size[0] : 512;
    canvas.height = Math.round((canvas.width * height) / 1024);
    const c = canvas.getContext("2d")!;
    c.scale(canvas.width / 1024, canvas.width / 1024);
    c.fillStyle = narrativeColor(bg, this.palette);
    c.fillRect(0, 0, 1024, height);
    c.fillStyle = narrativeColor(fg, this.palette);
    c.textBaseline = "middle";
    lines.forEach((line, i) => {
      c.font = `${i === 0 ? "600 " : ""}${font}px Arial`;
      const fit = Math.min(1, 900 / Math.max(1, c.measureText(line).width));
      c.font = `${i === 0 ? "600 " : ""}${Math.round(font * fit)}px Arial`;
      c.fillText(
        line,
        62,
        height / 2 + (i - (lines.length - 1) / 2) * (font * 1.7),
      );
    });
    const geo = new T.PlaneGeometry(...size);
    this.geometries.push(geo);
    const mat = new T.MeshBasicMaterial({
      map: this.texture(canvas),
      side: T.DoubleSide,
      toneMapped: false,
    });
    this.materials.add(mat);
    const mesh = new T.Mesh(geo, mat);
    mesh.position.set(...pos);
    parent.add(mesh);
    return mesh;
  }
  private cable(parent: T.Object3D, points: XYZ[]) {
    const curve = new T.CatmullRomCurve3(
      points.map((p) => new T.Vector3(...p)),
    );
    const geo = new T.TubeGeometry(curve, 12, 0.009, 4, false);
    this.geometries.push(geo);
    const mesh = new T.Mesh(geo, this.material("#354846"));
    parent.add(mesh);
  }
  chair() {
    const chair = new T.Group();
    this.box(chair, [0.52, 0.09, 0.5], [0, 0.53, 0], "#4b6858", 0.027);
    const back = this.box(
      chair,
      [0.52, 0.43, 0.08],
      [0, 0.85, 0.23],
      "#597461",
      0.034,
    );
    back.rotation.x = -0.055;
    for (const x of [-0.21, 0.21]) {
      for (const z of [-0.18, 0.18]) {
        this.box(chair, [0.032, 0.52, 0.032], [x, 0.25, z], "#354846", 0.006);
        this.box(chair, [0.044, 0.035, 0.044], [x, 0.017, z], "#263439", 0.008);
      }
      this.box(chair, [0.032, 0.66, 0.032], [x, 0.7, 0.23], "#354846", 0.005);
      this.box(chair, [0.028, 0.018, 0.4], [x, 0.29, 0], "#354846");
    }
    return chair;
  }
  private workstation(x: number, z: number, index: number) {
    const g = new T.Group();
    g.position.set(x, 0, z);
    this.scene.add(g);
    this.box(g, [2.1, 0.085, 0.85], [0, 0.94, 0], "#ad8b62", 0.02);
    this.box(g, [1.9, 0.22, 0.03], [0, 0.73, -0.31], "#71877e");
    for (const dx of [-0.88, 0.88])
      for (const dz of [-0.27, 0.27])
        this.box(g, [0.042, 0.92, 0.042], [dx, 0.46, dz], "#354846");
    const monitor = new T.Group();
    monitor.rotation.y = ((index % 3) - 1) * 0.045;
    g.add(monitor);
    this.box(monitor, [0.72, 0.43, 0.045], [0, 1.27, -0.18], "#263439", 0.015);
    this.box(
      monitor,
      [0.66, 0.355, 0.008],
      [0, 1.27, -0.153],
      index === 2 ? "#506665" : "#1e3034",
    );
    this.box(monitor, [0.045, 0.19, 0.045], [0, 1.01, -0.18], "#354846");
    this.box(monitor, [0.29, 0.015, 0.19], [0, 0.994, -0.13], "#354846", 0.006);
    const keyboard = this.box(
      g,
      [0.46, 0.022, 0.17],
      [-0.06, 0.997, 0.19],
      "#263439",
      0.008,
    );
    keyboard.rotation.y = index % 2 ? 0.09 : -0.03;
    for (let row = 0; row < 3; row++)
      this.box(
        g,
        [0.39, 0.004, 0.014],
        [-0.06, 1.01, 0.15 + row * 0.045],
        "#71877e",
      );
    this.box(g, [0.22, 0.025, 0.23], [0.53, 0.994, 0.2], "#526c67", 0.004);
    this.box(g, [0.065, 0.033, 0.09], [0.54, 1.02, 0.2], "#263439", 0.015);
    this.box(g, [0.22, 0.48, 0.45], [0.63, 0.34, -0.12], "#354846", 0.014);
    this.cable(g, [
      [0.1, 0.97, -0.2],
      [0.18, 0.6, -0.34],
      [0.55, 0.4, -0.35],
    ]);
    const chair = this.chair();
    chair.position.set(((index % 3) - 1) * 0.18, 0, index % 2 ? 0.72 : 0.83);
    chair.rotation.y = index % 2 ? -0.19 : 0.12;
    g.add(chair);
    if (index === 1 || index === 4) {
      const notes = this.box(
        g,
        [0.26, 0.025, 0.33],
        [-0.65, 1.0, 0.12],
        "#d7cfb6",
      );
      notes.rotation.y = 0.16;
      this.box(g, [0.018, 0.014, 0.21], [-0.58, 1.02, 0.13], "#354846");
    }
    if (index === 5)
      this.cylinder(g, 0.055, 0.19, [-0.7, 1.07, -0.08], "#b6b7a8");
  }

  build() {
    const room = this.scene;
    this.box(room, [12.2, 0.16, 13], [0, -0.08, -0.5], "#8d9992");
    for (let x = -6; x <= 6; x += 1.2)
      this.box(room, [0.006, 0.003, 13], [x, 0.002, -0.5], "#4d6974");
    for (let z = -7; z <= 6; z += 1.2)
      this.box(room, [12, 0.003, 0.006], [0, 0.002, z], "#4d6974");
    this.box(room, [12.2, 3.8, 0.2], [0, 1.9, -7], "#b6b7a8");
    this.box(room, [0.2, 3.8, 13], [6.08, 1.9, -0.5], "#c5c4b5");
    this.box(room, [12, 1.05, 0.025], [0, 0.52, -6.88], "#71877e");
    this.box(room, [0.025, 1.05, 12.8], [5.96, 0.52, -0.5], "#71877e");
    this.box(room, [12, 0.11, 0.04], [0, 0.055, -6.85], "#354846");
    this.box(room, [0.2, 1.05, 13], [-6, 0.5, -0.5], "#667e78");
    this.box(room, [0.22, 0.65, 13], [-6, 3.48, -0.5], "#b6b7a8");
    for (const z of [-6.8, -3.3, 0.2, 3.7, 5.9]) {
      this.box(room, [0.32, 2.8, 0.22], [-5.96, 2, z], "#b6b7a8");
      this.box(room, [0.3, 0.07, 0.05], [-5.77, 2.04, z], "#354846");
    }
    for (const y of [1.05, 2.05, 3.15])
      this.box(room, [0.17, 0.055, 12.7], [-5.91, y, -0.5], "#526c67");
    this.box(room, [0.42, 0.1, 12.8], [-5.9, 1.03, -0.5], "#c5c4b5", 0.015);
    // The outdoor matte, water on glass and live rain are owned by RainExterior.
    // Real-width doorway, reveal and corridor. Entry camera is aligned to this aperture.
    this.box(room, [7.7, 3.8, 0.2], [-2.15, 1.9, 5.9], "#b6b7a8");
    this.box(room, [2.8, 3.8, 0.2], [4.6, 1.9, 5.9], "#b6b7a8");
    this.box(room, [1.5, 0.85, 0.22], [2.45, 3.375, 5.9], "#b6b7a8");
    for (const x of [1.65, 3.25])
      this.box(room, [0.09, 2.98, 0.24], [x, 1.49, 5.84], "#526c67");
    this.box(room, [1.69, 0.09, 0.24], [2.45, 2.98, 5.84], "#526c67");
    const door = new T.Group();
    door.position.set(1.7, 0, 5.8);
    room.add(door);
    // Four solid rails leave a real opening for the glazed panel.
    this.box(door, [1.5, 1.715, 0.08], [0.75, 0.8575, 0], "#526c67", 0.012);
    this.box(door, [1.5, 0.335, 0.08], [0.75, 2.7325, 0], "#526c67", 0.012);
    this.box(door, [0.215, 0.85, 0.08], [0.1075, 2.14, 0], "#526c67", 0.012);
    this.box(door, [0.215, 0.85, 0.08], [1.3925, 2.14, 0], "#526c67", 0.012);
    const doorPane = this.box(
      door,
      [1.07, 0.85, 0.09],
      [0.75, 2.14, 0],
      "#899da3",
    );
    const paneMaterial = new T.MeshStandardMaterial({
      color: "#a9c1c7",
      transparent: true,
      opacity: 0.18,
      roughness: 0.2,
      depthWrite: false,
    });
    this.materials.add(paneMaterial);
    doorPane.material = paneMaterial;
    this.box(door, [1.12, 0.035, 0.11], [0.75, 1.72, 0], "#354846");
    this.cylinder(door, 0.028, 0.18, [1.31, 1.2, 0.11], "#a8a18a").rotation.x =
      Math.PI / 2;
    door.rotation.y = -0.65;
    this.box(room, [5.5, 0.12, 4.5], [2, -0.12, 8.2], "#8d9992");
    this.box(room, [5.5, 0.12, 4.5], [2, 3.55, 8.2], "#b6b7a8");
    this.box(room, [0.28, 3.5, 0.3], [4.3, 1.75, 8.7], "#b6b7a8");
    this.box(room, [5.5, 0.1, 0.12], [2, 1.02, 10.0], "#526c67");
    for (const x of [-0.5, 1, 2.5, 4.5])
      this.box(room, [0.05, 1.04, 0.05], [x, 0.5, 10], "#526c67");
    this.label(
      room,
      ["B.204", "PHÒNG THỰC HÀNH CNTT"],
      [1.1, 0.43],
      [2.45, 3.32, 5.75],
      "#354846",
      "#e1d6b9",
      76,
    ).rotation.y = Math.PI;
    this.box(room, [4.3, 1.42, 0.1], [-1.8, 2.2, -6.83], "#354846", 0.025);
    this.label(
      room,
      [
        "THỰC HÀNH · CÔNG NGHỆ THÔNG TIN",
        "Mục tiêu  →  Dữ liệu  →  Dự báo",
        "Kiểm thử giả định trước khi quyết định.",
      ],
      [4.12, 1.28],
      [-1.8, 2.2, -6.765],
      "#3b514a",
      "#c9d5c4",
      43,
    );
    this.box(room, [4.4, 0.04, 0.12], [-1.8, 1.48, -6.73], "#8d9992");
    for (let i = 0; i < 3; i++)
      this.box(
        room,
        [0.13, 0.018, 0.018],
        [-0.4 + i * 0.23, 1.51, -6.7],
        "#e1d6b9",
      );
    this.box(room, [1.08, 0.42, 0.13], [2.45, 2.65, -6.8], "#263439", 0.025);
    this.label(
      room,
      ["17:05"],
      [0.98, 0.36],
      [2.45, 2.65, -6.72],
      "#263439",
      "#e1d6b9",
      240,
    );
    this.label(
      room,
      ["TRƯỜNG ĐẠI HỌC", "TÂY NGUYÊN", "PHÒNG THỰC HÀNH · 2026"],
      [1.55, 0.85],
      [4.65, 2, -6.87],
      "#b6b7a8",
      "#354846",
      65,
    );
    this.label(
      room,
      ["TRƯỜNG ĐẠI HỌC TÂY NGUYÊN"],
      [4.15, 0.42],
      [-1.8, 3.25, -6.72],
      "#b6b7a8",
      "#354846",
      58,
      true,
    );
    // A circular plaque clips the source PNG's white corners without editing
    // the institution's artwork. UVs end at the original outer blue boundary.
    const schoolLogoGeometry = new T.CircleGeometry(0.325, 80);
    const logoUV = schoolLogoGeometry.getAttribute("uv");
    for (let i = 0; i < logoUV.count; i++)
      logoUV.setXY(
        i,
        (logoUV.getX(i) - 0.5) * 0.972 + 0.5,
        (logoUV.getY(i) - 0.5) * 0.972 + 0.5,
      );
    this.geometries.push(schoolLogoGeometry);
    const schoolLogoMaterial = new T.MeshBasicMaterial({
      color: 0xffffff,
      toneMapped: false,
    });
    this.materials.add(schoolLogoMaterial);
    const schoolLogo = new T.Mesh(schoolLogoGeometry, schoolLogoMaterial);
    schoolLogo.name = "tay-nguyen-university-logo";
    schoolLogo.position.set(-4.45, 3.25, -6.72);
    room.add(schoolLogo);
    new T.TextureLoader().load(
      import.meta.env.BASE_URL + "school/tay-nguyen-university-logo.png",
      (texture) => {
        if (this.closed) {
          texture.dispose();
          return;
        }
        texture.colorSpace = T.SRGBColorSpace;
        this.textures.push(texture);
        this.schoolLogoLoaded = true;
        schoolLogoMaterial.map = texture;
        schoolLogoMaterial.needsUpdate = true;
      },
      undefined,
      () => {
        schoolLogo.visible = false;
      },
    );
    this.box(room, [1.6, 1.1, 0.65], [4.85, 0.55, -6.4], "#667e78", 0.02);
    for (const x of [4.45, 5.25]) {
      this.box(room, [0.76, 0.98, 0.025], [x, 0.58, -6.06], "#71877e");
      this.box(room, [0.11, 0.022, 0.03], [x, 0.9, -6.035], "#354846");
    }
    for (let i = 0; i < 6; i++)
      this.workstation([-3.7, 0.1, 3.8][i % 3], i < 3 ? -5 : -3.4, i);
    for (const z of [-5.5, -1.5, 2.5]) {
      this.box(room, [12, 0.16, 0.2], [0, 3.8, z], "#b6b7a8");
      for (const x of [-2.5, 2.5]) {
        this.box(room, [1.45, 0.075, 0.22], [x, 3.67, z], "#8d9992", 0.015);
        const diffuser = this.box(
          room,
          [1.3, 0.015, 0.14],
          [x, 3.62, z],
          "#e1dfc8",
        );
        const mat = new T.MeshBasicMaterial({
          color: z === -5.5 ? "#b8c3bc" : "#e4dec8",
        });
        this.materials.add(mat);
        diffuser.material = mat;
      }
    }
    this.box(room, [12.1, 0.09, 13], [0, 3.93, -0.5], "#c5c4b5");
    const fan = new T.Group();
    fan.position.set(-1, 3.35, -2.9);
    room.add(fan);
    this.cylinder(fan, 0.12, 0.24, [0, 0, 0], "#526c67");
    for (let i = 0; i < 3; i++) {
      const pivot = new T.Group();
      pivot.rotation.y = (i * Math.PI * 2) / 3;
      fan.add(pivot);
      this.box(pivot, [0.17, 0.028, 1.18], [0, 0, 0.62], "#71877e", 0.025);
    }
    for (const x of [-4, -1, 2.7, 5])
      this.box(room, [0.19, 0.12, 0.035], [x, 0.61, -6.85], "#c5c4b5", 0.012);
    this.box(room, [11.6, 0.035, 0.035], [0, 0.4, -6.85], "#b6b7a8");
    this.cylinder(room, 0.23, 0.5, [4.55, 0.25, 1.1], "#526c67", 0.19);
    this.box(
      room,
      [0.45, 0.4, 0.2],
      [-1.2, 0.22, 0.3],
      "#526c67",
      0.07,
    ).rotation.z = -0.12;
    return { door, fan };
  }
  decorateDesk(desk: T.Group, book: T.Mesh) {
    // Low profile details stay outside the notebook's slide and all projected anchors.
    this.box(desk, [3.3, 0.025, 1.24], [0, 0.915, 0], "#354846");
    for (const x of [-1.45, 1.45])
      this.box(desk, [0.11, 0.045, 1.05], [x, 0.025, 0], "#263439", 0.009);
    this.cable(desk, [
      [-0.95, 1.055, -0.4],
      [-1.48, 1.06, -0.49],
      [-1.68, 0.55, -0.43],
      [-1.5, 0.08, -0.3],
    ]);
    for (let i = 0; i < 3; i++)
      this.box(
        desk,
        [0.3, 0.005, 0.37],
        [-1.03 + i * 0.018, 1.04 + i * 0.005, 0.12],
        "#e1d6b9",
      ).rotation.y = -0.14 + i * 0.035;
    this.box(book, [0.52, 0.67, 0.008], [0, 0, -0.005], "#9b7954", 0.003);
    this.box(book, [0.018, 0.66, 0.009], [-0.246, 0, 0.001], "#354846", 0.003);
  }
  detailCharacter(
    body: T.Group,
    head: T.Group,
    arms: T.Group[],
    teacher: boolean,
  ) {
    const shirt = teacher ? "#b4a57c" : "#7b9181";
    const collar = teacher ? "#c6b88e" : "#a3b5a3";
    for (const side of [-1, 1]) {
      this.box(
        body,
        [0.11, 0.065, 0.018],
        [side * 0.064, 0.485, 0.13],
        collar,
        0.008,
      ).rotation.z = side * 0.42;
      const geo = new T.SphereGeometry(0.028, 10, 8);
      this.geometries.push(geo);
      const ear = new T.Mesh(geo, this.material("#c89e7d"));
      ear.position.set(side * 0.143, -0.008, 0);
      ear.scale.set(0.45, 1, 0.7);
      head.add(ear);
      this.box(
        head,
        [0.041, 0.006, 0.006],
        [side * 0.05, 0.047, 0.142],
        "#333a31",
        0.002,
      ).rotation.z = side * -0.08;
    }
    this.box(head, [0.039, 0.004, 0.006], [0, -0.063, 0.142], "#986f58", 0.002);
    if (!teacher) {
      const fringe = this.box(
        head,
        [0.2, 0.055, 0.07],
        [0.01, 0.115, 0.095],
        "#28352d",
        0.025,
      );
      fringe.rotation.z = -0.1;
    }
    this.box(body, [0.024, 0.28, 0.016], [0, 0.29, 0.132], shirt, 0.005);
    for (let i = 0; i < 3; i++)
      this.box(
        body,
        [0.009, 0.009, 0.009],
        [0, 0.41 - i * 0.095, 0.143],
        collar,
        0.003,
      );
    arms.forEach((arm) =>
      this.cylinder(arm, 0.066, 0.035, [0, -0.255, 0], collar, 0.063),
    );
  }
  dispose() {
    this.closed = true;
    this.geometries.forEach((g) => g.dispose());
    this.textures.forEach((t) => t.dispose());
    this.materials.forEach((m) => m.dispose());
  }
}
