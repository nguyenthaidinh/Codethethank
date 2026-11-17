import { NarrativeActors } from "../art/NarrativeActors";
import { narrativeDirection, narrativeColor } from "../art/NarrativePalette";
import { FXAAShader } from "three/addons/shaders/FXAAShader.js";
import { ClassroomArt } from "../art/ClassroomArt";
import type { FinaleSave } from "../finale/state";
import type { Letter } from "../finale/letter";
import { RippleWorld } from "../ripple/RippleWorld";
import type { RippleSave } from "../ripple/state";
import * as T from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import type { Beat, Focus, SliceSave, Caption } from "./director";
import { drawOverlay } from "./overlay";
import { drawEvaluation } from "../verdict/screen";
import type { VerdictSave } from "../verdict/state";
import type { StaySave } from "../stayed/state";
import { drawNotebook } from "../stayed/Notebook";
import { CHAIR_MOTIF } from "./motifs";
import { TERMINAL_ALERT } from "../future/terminalStyle";
import { classroomShot, type ClassroomShot } from "./ClassroomCinematography";
import { ClassroomLighting } from "./ClassroomLighting";

type XYZ = [number, number, number];
interface Rig {
  root: T.Group;
  body: T.Group;
  head: T.Group;
  arms: T.Group[];
  legs: T.Group[];
  shins: T.Group[];
  hero?: boolean;
  teacher?: boolean;
}
export interface PropPosition {
  id: Focus;
  x: number;
  y: number;
  visible: boolean;
}
const smooth = (v: number) => {
  const x = T.MathUtils.clamp(v, 0, 1);
  return x * x * (3 - 2 * x);
};
const cameras: Record<Focus, { eye: XYZ; at: XYZ; fov: number }> = {
  book: { eye: [0.5, 2.7, 1.15], at: [0.65, 1.047, -0.1], fov: 46 },
  teacher: { eye: [3.0, 1.72, -1.9], at: [1.75, 1.45, 0.55], fov: 38 },
  chair_insert: {
    eye: CHAIR_MOTIF.eye,
    at: CHAIR_MOTIF.at,
    fov: CHAIR_MOTIF.fov,
  },
  notes: { eye: [2.25, 2.08, 0.5], at: [1.15, 0.9, -0.85], fov: 43 },
  an: { eye: [0.9, 1.57, -0.86], at: [-0.45, 1.32, 0.02], fov: 40 },
  clock: { eye: [2.45, 2.65, -3.8], at: [2.45, 2.65, -6.7], fov: 40 },
  door: { eye: [2.45, 1.78, 5.35], at: [-0.3, 1.3, -0.4], fov: 50 },
  wide: { eye: [3.9, 1.9, 3.6], at: [-0.15, 1.13, -1.0], fov: 48 },
  window: { eye: [-0.7, 2.1, 1.9], at: [-5.7, 2, -2.4], fov: 53 },
  laptop: { eye: [0.75, 1.9, 0.35], at: [-0.48, 1.28, -1.03], fov: 42 },
  notebook: { eye: [0.5, 2.7, 1.15], at: [0.65, 1.047, -0.1], fov: 46 },
  chair: { eye: [3.8, 1.7, 2.8], at: [0.7, 0.85, 0.2], fov: 50 },
  profile: { eye: [1.7, 2.05, 1.0], at: [0.35, 0.99, -0.65], fov: 45 },
  faces: { eye: [1.7, 1.65, -2.8], at: [0.25, 1.22, 0.04], fov: 45 },
  paper: { eye: [0.5, 2.7, 1.15], at: [0.65, 1.047, -0.1], fov: 44 },
};
export class WorldRenderer {
  renderer: T.WebGLRenderer;
  scene = new T.Scene();
  camera = new T.PerspectiveCamera(54, 1, 0.08, 70);
  private target = new T.Vector3();
  private eye = new T.Vector3();
  private targetEye = new T.Vector3();
  private targetAt = new T.Vector3();
  private goalFov = 54;
  private cameraFrom = new T.Vector3();
  private targetFrom = new T.Vector3();
  private fovFrom = 54;
  private cameraProgress = 1;
  private activeShot: ClassroomShot["id"] | null = null;
  private art: ClassroomArt;
  private actors: NarrativeActors;
  private legacyActor = false;
  private legacyMaterials = new Map<string, T.MeshLambertMaterial>();
  private geometries: T.BufferGeometry[] = [];
  private textures: T.Texture[] = [];
  private an!: Rig;
  private teacher!: Rig;
  private chair!: T.Group;
  private door!: T.Group;
  private fan!: T.Group;
  private paper!: T.Mesh;
  private card!: T.Mesh;
  private notebook!: T.Mesh;
  private rain!: T.LineSegments;
  private rainPositions!: Float32Array;
  private drops: { y: number; speed: number; x: number; z: number }[] = [];
  private screenCanvas!: HTMLCanvasElement;
  private screenTexture!: T.CanvasTexture;
  private screenKey = "";
  private studyBook!: T.Mesh;
  private pen!: T.Mesh;
  private bookLeaf!: T.Group;
  private bookCanvas = document.createElement("canvas");
  private bookTexture!: T.CanvasTexture;
  private bookKey = "";
  private lastPage: string | null = null;
  private pageTurn = 1;
  private finale: FinaleSave | null = null;
  private letter: Letter | null = null;
  setFinale(s: FinaleSave | null, letter: Letter | null) {
    this.finale = s;
    this.letter = letter;
  }
  private ripple: RippleSave | null = null;
  private rippleWorld: RippleWorld | null = null;
  setRipple(value: RippleSave | null) {
    this.ripple = value;
  }
  private stayed: StaySave | null = null;
  setStayed(value: StaySave | null) {
    this.stayed = value;
  }
  private evaluation: VerdictSave | null = null;
  setEvaluation(value: VerdictSave | null) {
    this.evaluation = value;
  }
  private screenMesh!: T.Mesh;
  private warmLight!: T.PointLight;
  private propAnchors: Record<string, T.Vector3> = {};
  private width = 1280;
  private height = 720;
  private focus: Focus = "door";
  private lastBeat: Beat = "arrival";
  private pointer = new T.Vector2();
  private ready = false;
  private frameSamples: number[] = [];
  private frameCount = 0;
  private resolution = 0.75;
  private overlayScene = new T.Scene();
  private overlayCamera = new T.OrthographicCamera(-1, 1, 1, -1, 0, 2);
  private overlayCanvas = document.createElement("canvas");
  private overlayTexture: T.CanvasTexture;
  private overlayKey = "";
  private overlayEnabled = false;
  private renderTarget = new T.WebGLRenderTarget(960, 540);
  private captionPlane!: T.Mesh;
  private imageMaterial: T.ShaderMaterial;
  private worldCalls = 0;
  private worldTriangles = 0;
  private keyLight: T.DirectionalLight;
  private conversationFill = new T.DirectionalLight("#f4dec0", 0);
  private classroomLighting: ClassroomLighting;
  private shadowBeat: Beat | null = null;
  private shadowTime = -1;
  private shadowRefreshed = false;
  constructor(public canvas: HTMLCanvasElement) {
    this.renderer = new T.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: false,
      powerPreference: "high-performance",
      preserveDrawingBuffer: false,
    });
    this.art = new ClassroomArt(this.scene, narrativeDirection());
    this.actors = new NarrativeActors(this.art.palette);
    this.renderer.setPixelRatio(1);
    // Multisample targets are too costly on software/mobile renderers.
    this.renderTarget.samples = 0;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = T.PCFSoftShadowMap;
    this.renderer.outputColorSpace = T.SRGBColorSpace;
    this.renderer.toneMapping = T.ACESFilmicToneMapping;
    const palette = this.art.palette;
    this.renderer.toneMappingExposure = palette.exposure;
    this.scene.background = new T.Color(palette.sky);
    this.scene.fog = new T.FogExp2(palette.sky, 0.018);
    this.scene.add(
      new T.HemisphereLight("#c8e1ec", palette.ink, palette.ambient),
    );
    const sun = new T.DirectionalLight(palette.windowKey, palette.key);
    this.keyLight = sun;
    sun.position.set(-10, 3.3, -3);
    sun.target.position.set(-0.5, 1, -1.4);
    this.scene.add(sun.target);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.autoUpdate = false;
    sun.shadow.needsUpdate = true;
    sun.shadow.camera.left = -9;
    sun.shadow.camera.right = 9;
    sun.shadow.camera.top = 8;
    sun.shadow.camera.bottom = -8;
    sun.shadow.normalBias = 0.018;
    sun.shadow.bias = -0.00008;
    sun.shadow.camera.far = 35;
    this.scene.add(sun);
    const fill = new T.DirectionalLight(palette.bounce, 1.65);
    fill.position.set(2.5, 2.5, -3);
    this.scene.add(fill);
    this.conversationFill.position.set(0.3, 2.3, -3.5);
    this.conversationFill.target.position.set(0.3, 1.3, 0.05);
    this.scene.add(this.conversationFill, this.conversationFill.target);
    this.classroomLighting = new ClassroomLighting(
      this.scene,
      sun,
      fill,
      this.conversationFill,
    );
    this.overlayTexture = new T.CanvasTexture(this.overlayCanvas);
    this.overlayTexture.colorSpace = T.SRGBColorSpace;
    this.textures.push(this.overlayTexture);
    this.renderTarget.texture.colorSpace = T.SRGBColorSpace;
    this.imageMaterial = new T.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: this.renderTarget.texture },
        resolution: { value: new T.Vector2(1 / 960, 1 / 540) },
        uAA: { value: 1 },
      },
      vertexShader: FXAAShader.vertexShader,
      fragmentShader:
        "uniform float uAA;\n" +
        FXAAShader.fragmentShader.replace(
          "gl_FragColor = ApplyFXAA( tDiffuse, resolution.xy, vUv );",
          "if (uAA > 0.5) { gl_FragColor = ApplyFXAA( tDiffuse, resolution.xy, vUv ); } else { gl_FragColor = texture2D( tDiffuse, vUv ); }\n#include <colorspace_fragment>",
        ),
      depthTest: false,
      depthWrite: false,
      toneMapped: false,
    });
    const image = new T.Mesh(new T.PlaneGeometry(2, 2), this.imageMaterial);
    image.position.z = -1.5;
    this.overlayScene.add(image);
    const overlay = new T.Mesh(
      new T.PlaneGeometry(2, 2),
      new T.MeshBasicMaterial({
        map: this.overlayTexture,
        transparent: true,
        depthTest: false,
        depthWrite: false,
      }),
    );
    overlay.position.z = -1;
    this.captionPlane = overlay;
    this.overlayScene.add(overlay);
    this.buildRoom();
    this.buildDesk();
    this.buildPeople();
    this.buildRain();
    this.batchStaticWorld();
    this.focusOn("door", true);
    this.ready = true;
  }
  private batchStaticWorld() {
    [
      this.door,
      this.fan,
      this.paper,
      this.card,
      this.notebook,
      this.screenMesh,
      this.an.root,
      this.teacher.root,
      this.chair,
    ].forEach((o) => (o.userData.dynamic = true));
    this.scene.updateMatrixWorld(true);
    const groups = new Map<
      string,
      { material: T.Material; meshes: T.Mesh[] }
    >();
    this.scene.traverse((o) => {
      if (!(o instanceof T.Mesh) || Array.isArray(o.material)) return;
      let parent: T.Object3D | null = o;
      while (parent) {
        if (parent.userData.dynamic) return;
        parent = parent.parent;
      }
      const key = `${o.material.uuid}:${o.castShadow}:${o.receiveShadow}`;
      const group = groups.get(key) ?? {
        material: o.material,
        meshes: [] as T.Mesh[],
      };
      group.meshes.push(o);
      groups.set(key, group);
    });
    for (const { material, meshes } of groups.values()) {
      if (meshes.length < 2) continue;
      // RoundedBoxGeometry is non-indexed. Normalize before merging mixed props.
      const copies = meshes.map((m) =>
        (m.geometry.index
          ? m.geometry.toNonIndexed()
          : m.geometry.clone()
        ).applyMatrix4(m.matrixWorld),
      );
      const geometry = mergeGeometries(copies);
      copies.forEach((g) => g.dispose());
      if (!geometry) continue;
      this.geometries.push(geometry);
      const merged = new T.Mesh(geometry, material);
      merged.castShadow = meshes[0].castShadow;
      merged.receiveShadow = meshes[0].receiveShadow;
      this.scene.add(merged);
      meshes.forEach((m) => m.removeFromParent());
    }
  }
  private material(color: string) {
    return this.legacyActor
      ? this.legacyMaterial(color)
      : this.art.material(color);
  }
  private legacyMaterial(color: string) {
    let material = this.legacyMaterials.get(color);
    if (!material) {
      material = new T.MeshLambertMaterial({ color });
      this.legacyMaterials.set(color, material);
    }
    return material;
  }
  private box(parent: T.Object3D, size: XYZ, pos: XYZ, color: string) {
    const g = new T.BoxGeometry(...size);
    this.geometries.push(g);
    const m = new T.Mesh(g, this.material(color));
    m.position.set(...pos);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  }
  private cylinder(
    parent: T.Object3D,
    r: number,
    h: number,
    pos: XYZ,
    color: string,
    r2 = r,
  ) {
    const g = new T.CylinderGeometry(r, r2, h, 12);
    this.geometries.push(g);
    const m = new T.Mesh(g, this.material(color));
    m.position.set(...pos);
    m.castShadow = true;
    parent.add(m);
    return m;
  }
  private sphere(
    parent: T.Object3D,
    r: number,
    pos: XYZ,
    color: string,
    scale: XYZ = [1, 1, 1],
  ) {
    const g = new T.SphereGeometry(r, 16, 12);
    this.geometries.push(g);
    const m = new T.Mesh(g, this.material(color));
    m.position.set(...pos);
    m.scale.set(...scale);
    m.castShadow = true;
    parent.add(m);
    return m;
  }
  private print(
    lines: string[],
    w = 1024,
    h = 512,
    bg = "#d5cfb7",
    fg = "#333e35",
    font = 45,
  ) {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const x = c.getContext("2d")!;
    x.fillStyle = narrativeColor(bg, this.art.palette);
    x.fillRect(0, 0, w, h);
    x.fillStyle = narrativeColor(fg, this.art.palette);
    x.font = `${font}px Arial`;
    lines.forEach((line, i) => x.fillText(line, 48, 75 + i * (font * 1.5)));
    const tx = new T.CanvasTexture(c);
    tx.colorSpace = T.SRGBColorSpace;
    tx.anisotropy = 4;
    this.textures.push(tx);
    return tx;
  }
  private sign(
    parent: T.Object3D,
    lines: string[],
    size: [number, number],
    pos: XYZ,
    bg: string,
    fg: string,
    font = 45,
  ) {
    const g = new T.PlaneGeometry(...size);
    this.geometries.push(g);
    const material = new T.MeshBasicMaterial({
      map: this.print(lines, 1024, 512, bg, fg, font),
      toneMapped: false,
      side: T.DoubleSide,
    });
    const mesh = new T.Mesh(g, material);
    mesh.position.set(...pos);
    parent.add(mesh);
    return mesh;
  }
  private buildRoom() {
    this.propAnchors.clock = new T.Vector3(2.45, 2.65, -6.7);
    this.propAnchors.door = new T.Vector3(2.5, 1.6, 5.7);
    this.propAnchors.window = new T.Vector3(-5.7, 2, -1.8);
    const room = this.art.build();
    this.door = room.door;
    this.fan = room.fan;
  }
  private makeChair(future = false) {
    const chair = this.art.chair();
    if (future)
      chair.traverse((o) => {
        if (o instanceof T.Mesh && !Array.isArray(o.material)) {
          const material = o.material as T.MeshStandardMaterial;
          o.material = this.legacyMaterial(
            material.name || `#${material.color.getHexString()}`,
          );
        }
      });
    return chair;
  }
  private buildDesk() {
    const g = new T.Group();
    g.position.set(0, -0.16, -0.85);
    this.scene.add(g);
    this.art.box(g, [3.35, 0.11, 1.3], [0, 0.98, 0], "#a89972", 0.025);
    this.box(g, [3.25, 0.07, 1.2], [0, 0.91, 0], "#6b735d");
    for (const x of [-1.45, 1.45])
      for (const z of [-0.48, 0.48])
        this.box(g, [0.07, 0.92, 0.07], [x, 0.45, z], "#394b40");
    const laptop = new T.Group();
    laptop.position.set(-0.48, 1.045, -0.16);
    g.add(laptop);
    this.box(laptop, [1.03, 0.045, 0.67], [0, 0, 0.22], "#2b3432");
    for (let row = 0; row < 4; row++)
      for (let key = 0; key < 11; key++)
        this.box(
          laptop,
          [0.064, 0.006, 0.043],
          [-0.4 + key * 0.08, 0.027, 0.03 + row * 0.063],
          "#68736b",
        );
    this.box(laptop, [0.26, 0.006, 0.15], [0, 0.026, 0.43], "#505f55");
    const lid = new T.Group();
    lid.rotation.x = -0.1;
    lid.position.set(0, 0.02, -0.08);
    laptop.add(lid);
    this.box(lid, [1.06, 0.68, 0.045], [0, 0.34, 0], "#222e29");
    this.screenCanvas = document.createElement("canvas");
    this.screenCanvas.width = 1200;
    this.screenCanvas.height = 720;
    this.screenTexture = new T.CanvasTexture(this.screenCanvas);
    this.screenTexture.colorSpace = T.SRGBColorSpace;
    this.screenTexture.anisotropy = 8;
    this.textures.push(this.screenTexture);
    const sg = new T.PlaneGeometry(0.97, 0.58);
    this.geometries.push(sg);
    this.screenMesh = new T.Mesh(
      sg,
      new T.MeshBasicMaterial({ map: this.screenTexture, toneMapped: false }),
    );
    this.screenMesh.position.set(0, 0.35, 0.025);
    lid.add(this.screenMesh);
    this.notebook = this.sign(
      g,
      [
        "STUDENT 07 / ĐÃ ẨN DANH",
        "ĐỀ NGHỊ HỖ TRỢ",
        "Thiếu thiết bị học tập.",
        "Xin thêm giờ dùng phòng máy.",
        "Cô Vân cung cấp cho bài học.",
      ],
      [0.6, 0.8],
      [0.65, 1.042, -0.13],
      "#d8d0ad",
      "#46554a",
      47,
    );
    this.notebook.rotation.x = -Math.PI / 2;
    this.notebook.rotation.z = -0.13;
    const notes = this.sign(
      g,
      [
        "SỔ THIẾT KẾ / AN",
        "Ưu tiên cải thiện dự đoán.",
        "Suất hỗ trợ có giới hạn.",
        "Nhu cầu: chưa đưa vào luật.",
      ],
      [0.5, 0.65],
      [1.25, 1.047, -0.15],
      "#c6c4a2",
      "#344e40",
      49,
    );
    notes.rotation.x = -Math.PI / 2;
    notes.rotation.z = 0.1;
    this.studyBook = notes;
    notes.userData.originalMap = (notes.material as T.MeshBasicMaterial).map;
    notes.userData.dynamic = true;
    this.bookCanvas.width = 1000;
    this.bookCanvas.height = 720;
    this.bookTexture = new T.CanvasTexture(this.bookCanvas);
    this.bookTexture.colorSpace = T.SRGBColorSpace;
    this.textures.push(this.bookTexture);
    this.bookLeaf = new T.Group();
    this.bookLeaf.position.z = 0.004;
    notes.add(this.bookLeaf);
    const leaf = new T.Mesh(
      new T.PlaneGeometry(0.25, 0.65),
      new T.MeshBasicMaterial({ color: "#e7ddba", side: T.DoubleSide }),
    );
    leaf.position.x = 0.125;
    this.bookLeaf.add(leaf);
    this.bookLeaf.visible = false;
    this.propAnchors.notes = new T.Vector3(1.25, 0.92, -1.0);
    this.card = this.sign(
      g,
      ["AN", "SINH VIÊN CNTT", "Kiểm thử: thấp", "Trình bày: vừa thất bại"],
      [0.45, 0.3],
      [0.15, 1.049, 0.38],
      "#e7ddbc",
      "#334c3d",
      70,
    );
    this.card.rotation.x = -Math.PI / 2;
    this.card.rotation.z = 0.07;
    this.paper = this.sign(
      g,
      ["Người dùng cần được", "giúp điều gì?"],
      [0.64, 0.45],
      [1.15, 1.05, 0.29],
      "#ebe2c4",
      "#4a5846",
      64,
    );
    this.paper.rotation.x = -Math.PI / 2;
    this.paper.rotation.z = -0.07;
    this.paper.visible = false;
    const mug = this.cylinder(g, 0.09, 0.17, [-1.26, 1.12, -0.3], "#a4b6a0");
    this.cylinder(mug, 0.07, 0.005, [0, 0.089, 0], "#293e32");
    this.pen = this.box(g, [0.026, 0.024, 0.26], [1.3, 1.055, -0.1], "#48574b");
    this.pen.rotation.y = 0.3;
    this.pen.userData.dynamic = true;
    // Warm lamp pool develops when the teacher sits, instead of a music swell.
    this.cylinder(g, 0.17, 0.04, [-1.4, 1.06, 0.27], "#344d40");
    this.cylinder(g, 0.025, 0.5, [-1.4, 1.3, 0.27], "#53654b");
    const shade = this.cylinder(
      g,
      0.13,
      0.22,
      [-1.4, 1.56, 0.27],
      "#b6ad7d",
      0.23,
    );
    shade.rotation.z = 0.25;
    this.warmLight = new T.PointLight(this.art.palette.bounce, 0.9, 4, 2);
    this.warmLight.position.set(-1.4, 1.24, -0.57);
    this.scene.add(this.warmLight);
    this.art.decorateDesk(g, notes);
    this.propAnchors.laptop = new T.Vector3(-0.48, 1.26, -1.08);
    this.propAnchors.notebook = new T.Vector3(0.66, 0.92, -0.96);
    this.propAnchors.profile = new T.Vector3(0.15, 0.94, -0.47);
    this.propAnchors.paper = new T.Vector3(1.15, 0.94, -0.56);
    this.propAnchors.chair = new T.Vector3(1.3, 0.8, 0.35);
  }
  private human(shirt: string, teacher = false, hero = false): Rig {
    if (hero) return this.actors.create(teacher);
    const previous = this.legacyActor;
    this.legacyActor = !hero;
    const root = new T.Group(),
      body = new T.Group(),
      head = new T.Group();
    root.add(body);
    body.position.y = 0.88;
    const torso = hero
      ? this.art.box(body, [0.42, 0.49, 0.25], [0, 0.27, 0], shirt, 0.065)
      : this.box(body, [0.4, 0.49, 0.23], [0, 0.27, 0], shirt);
    torso.rotation.x = 0.04;
    this.cylinder(body, 0.06, 0.12, [0, 0.57, 0], "#bd9271");
    head.position.set(0, 0.74, 0);
    body.add(head);
    this.sphere(head, 0.16, [0, 0, 0], "#c89e7d", [
      hero ? 0.9 : 0.84,
      1.13,
      0.92,
    ]);
    this.sphere(
      head,
      0.161,
      [0, 0.065, -0.035],
      teacher ? "#333a31" : "#28352d",
      [0.88, 0.8, 0.9],
    );
    if (teacher) this.sphere(head, 0.075, [0, 0.02, -0.16], "#333a31");
    this.sphere(head, 0.025, [0, -0.005, 0.141], "#bd9170", [0.6, 0.8, 1]);
    for (const x of [-0.049, 0.049]) {
      if (hero)
        this.sphere(head, 0.016, [x, 0.022, 0.144], "#d9d5c3", [1, 0.55, 0.35]);
      this.sphere(
        head,
        hero ? 0.008 : 0.012,
        [x, 0.022, hero ? 0.15 : 0.137],
        "#344239",
        [1, 0.65, 0.5],
      );
    }
    const arms: T.Group[] = [],
      legs: T.Group[] = [],
      shins: T.Group[] = [];
    for (const side of [-1, 1]) {
      const arm = new T.Group();
      arm.position.set(side * 0.24, 0.46, 0);
      body.add(arm);
      this.cylinder(arm, 0.065, 0.29, [0, -0.14, 0], shirt, 0.06);
      const fore = new T.Group();
      fore.position.y = -0.27;
      fore.rotation.x = hero ? -0.03 : -0.28;
      arm.add(fore);
      this.cylinder(fore, 0.047, 0.25, [0, -0.12, 0], "#bf9573", 0.04);
      this.sphere(fore, 0.052, [0, -0.26, 0], "#c69b76", [0.7, 1.1, 0.65]);
      arms.push(arm);
      const leg = new T.Group();
      leg.position.set(side * 0.1, 0, 0);
      body.add(leg);
      this.cylinder(
        leg,
        0.085,
        0.4,
        [0, -0.2, 0],
        teacher ? "#485548" : "#30433e",
        0.07,
      );
      const shin = new T.Group();
      shin.position.y = -0.4;
      leg.add(shin);
      this.cylinder(
        shin,
        0.065,
        0.39,
        [0, -0.19, 0],
        teacher ? "#485548" : "#30433e",
        0.05,
      );
      this.box(shin, [0.14, 0.085, 0.27], [0, -0.4, 0.05], "#26382e");
      legs.push(leg);
      shins.push(shin);
    }
    root.rotation.y = Math.PI;
    if (hero) this.art.detailCharacter(body, head, arms, teacher);
    this.legacyActor = previous;
    return { root, body, head, arms, legs, shins, hero, teacher };
  }
  private sit(r: Rig, amount: number) {
    r.body.position.y = r.hero
      ? 0.8425 - 0.2525 * amount
      : 0.88 - 0.29 * amount;
    r.body.rotation.x =
      (r.hero
        ? r.teacher
          ? this.stayed?.phase === "second_chance" && this.stayed.line === 2
            ? 0.27
            : 0.09
          : 0.18
        : 0.06) * amount;
    if (r.hero) {
      // A 0.4 thigh and a 0.4425 knee-to-sole distance: flat feet on world y=0.
      // Cancel torso lean at the ankle rather than lifting the feet with the torso.
      const thigh = -Math.acos(
        T.MathUtils.clamp((r.body.position.y - 0.4425) / 0.4, 0, 1),
      );
      r.legs.forEach((l) => (l.rotation.x = thigh - r.body.rotation.x));
      r.shins.forEach((l) => (l.rotation.x = -thigh));
    } else {
      r.legs.forEach((l) => (l.rotation.x = (-Math.PI / 2) * amount));
      r.shins.forEach((l) => (l.rotation.x = (Math.PI / 2) * amount));
    }
    r.arms.forEach(
      (a, i) =>
        (a.rotation.x =
          (r.hero && !r.teacher && i === 1 ? -1.66 : -0.65) * amount +
          (i === 0 ? 0.1 : 0)),
    );
  }
  private buildPeople() {
    this.an = this.human("#7b9181", false, true);
    this.an.root.position.set(-0.45, 0, 0);
    this.scene.add(this.an.root);
    this.sit(this.an, 1);
    const ac = this.makeChair();
    ac.position.set(-0.45, 0, -0.02);
    this.scene.add(ac);
    this.chair = this.makeChair();
    this.chair.position.set(2.3, 0, 0.6);
    this.chair.rotation.y = -0.2;
    this.scene.add(this.chair);
    this.teacher = this.human("#b4a57c", true, true);
    this.teacher.root.position.set(2.7, 0, 6.2);
    this.scene.add(this.teacher.root);
  }
  private buildRain() {
    const count = 380;
    this.rainPositions = new Float32Array(count * 6);
    for (let i = 0; i < count; i++)
      this.drops.push({
        x: -6.3 - (i % 13) * 0.18,
        y: (i * 0.379) % 5,
        z: -6.5 + ((i * 0.419) % 12),
        speed: 1.7 + (i % 7) * 0.16,
      });
    const geo = new T.BufferGeometry();
    geo.setAttribute("position", new T.BufferAttribute(this.rainPositions, 3));
    this.geometries.push(geo);
    this.rain = new T.LineSegments(
      geo,
      new T.LineBasicMaterial({
        color: "#d4e9e1",
        transparent: true,
        opacity: 0.4,
        depthWrite: false,
      }),
    );
    this.scene.add(this.rain);
  }
  resize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.renderer.setPixelRatio(Math.min(1, 1440 / width));
    this.renderer.setSize(width, height, false);
    this.renderTarget.setSize(
      Math.round(width * this.resolution),
      Math.round(height * this.resolution),
    );
    this.imageMaterial.uniforms.resolution.value.set(
      1 / this.renderTarget.width,
      1 / this.renderTarget.height,
    );
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.focusOn(this.focus, false);
  }
  focusOn(focus: Focus, immediate = false) {
    this.cameraFrom.copy(this.eye);
    this.targetFrom.copy(this.target);
    this.fovFrom = this.camera.fov;
    this.cameraProgress = immediate ? 1 : 0;
    this.focus = focus;
    const p = cameras[focus];
    this.targetEye.set(...p.eye);
    this.targetAt.set(...p.at);
    this.goalFov = p.fov;
    if (this.width / this.height < 0.85) {
      if (focus === "wide" || focus === "door") {
        this.targetEye.set(2.4, 2.7, 3.8);
        this.targetAt.set(0, 0.95, -0.75);
        this.goalFov = 55;
      } else if (focus === "faces") {
        this.targetEye.set(2.6, 1.7, -4.55);
        this.targetAt.set(0.25, 0.65, 0.04);
        this.goalFov = 48;
      } else if (focus === "chair") {
        this.targetEye.set(2.0, 1.65, 2.6);
        this.targetAt.set(0.25, 1.26, -0.05);
        this.goalFov = 60;
      } else this.goalFov = focus === "an" ? 42 : focus === "laptop" ? 63 : 65;
    }
    if (immediate) {
      this.eye.copy(this.targetEye);
      this.target.copy(this.targetAt);
      this.camera.position.copy(this.eye);
      this.camera.lookAt(this.target);
      this.camera.fov = this.goalFov;
      this.camera.updateProjectionMatrix();
      this.cameraFrom.copy(this.eye);
      this.targetFrom.copy(this.target);
      this.fovFrom = this.goalFov;
    }
  }
  look(x: number, y: number) {
    this.pointer.set(x, y);
  }
  setOverlay(enabled: boolean, caption: Caption | null, hint: string) {
    this.overlayEnabled = enabled;
    if (!enabled) return;
    const key = JSON.stringify([caption, hint, this.width, this.height]);
    if (key === this.overlayKey) return;
    this.overlayKey = key;
    this.overlayCanvas.width = this.width;
    this.overlayCanvas.height = this.height;
    drawOverlay(this.overlayCanvas, caption, hint);
    this.overlayTexture.needsUpdate = true;
  }
  adaptQuality(raw: number) {
    this.frameCount++;
    // Ignore shader warm-up outliers; keep geometry and input identical across tiers.
    if (this.frameCount > 4 && this.frameCount <= 36)
      this.frameSamples.push(raw);
    if (this.frameCount === 36) {
      const samples = this.frameSamples.sort((a, b) => a - b);
      const median = samples[Math.floor(samples.length / 2)];
      this.resolution = median > 0.06 ? 0.65 : median > 0.033 ? 0.85 : 1;
      this.imageMaterial.uniforms.uAA.value = median > 0.06 ? 0 : 1;
      this.renderTarget.setSize(
        Math.round(this.width * this.resolution),
        Math.round(this.height * this.resolution),
      );
      this.imageMaterial.uniforms.resolution.value.set(
        1 / this.renderTarget.width,
        1 / this.renderTarget.height,
      );
    }
  }
  private screen(s: SliceSave, t: number) {
    if (this.evaluation) {
      const key =
        JSON.stringify(this.evaluation) +
        (this.evaluation.phase === "running" ? Math.floor(t * 12) : "");
      if (key !== this.screenKey) {
        this.screenKey = key;
        drawEvaluation(this.screenCanvas.getContext("2d")!, this.evaluation, t);
        this.screenTexture.needsUpdate = true;
      }
      return;
    }
    const verdict = ["verdict", "response", "paper", "complete"].includes(
        s.beat,
      ),
      processing = s.beat === "evaluate";
    const key = `${verdict}-${processing}-${s.selected}-${processing ? Math.floor(t * 2) : 0}`;
    if (key === this.screenKey) return;
    this.screenKey = key;
    const c = this.screenCanvas,
      x = c.getContext("2d")!;
    x.fillStyle = "#16251f";
    x.fillRect(0, 0, c.width, c.height);
    x.fillStyle = "#afc3a8";
    x.font = "25px monospace";
    x.fillText("AN / PROTOTYPE HỖ TRỢ HỌC TẬP · 2026", 55, 65);
    x.fillStyle = "#526e59";
    x.fillRect(55, 95, 1090, 2);
    x.fillStyle = verdict ? TERMINAL_ALERT : "#dae0bc";
    x.font = "bold 61px monospace";
    x.fillText(
      verdict
        ? "NOT RECOMMENDED"
        : processing
          ? "ĐANG KIỂM THỬ" + ".".repeat(Math.floor(t * 2) % 4)
          : "ƯU TIÊN HỖ TRỢ",
      55,
      240,
    );
    x.font = "34px Arial";
    x.fillStyle = "#b6c7ac";
    const lines = verdict
      ? [
          "HỒ SƠ: AN",
          "Dự báo theo thành tích hiện tại.",
          "Đầu ra: không được đề xuất hỗ trợ.",
        ]
      : processing
        ? ["HỒ SƠ: AN", "Điểm kiểm thử thấp. Trình bày vừa thất bại."]
        : s.selected
          ? ["HỒ SƠ AN ĐÃ CHỌN", "Chạm laptop để thử hồ sơ."]
          : [
              "Mục tiêu: ưu tiên cải thiện dự đoán cao.",
              "Dự đoán thấp → không ưu tiên hỗ trợ.",
              "Dữ liệu hôm nay. Cơ hội ngày mai?",
            ];
    lines.forEach((l, i) => x.fillText(l, 55, 350 + i * 70));
    x.fillStyle = "#76957a";
    x.font = "25px monospace";
    x.fillText(
      verdict ? "EVALUATION COMPLETE" : "LOCAL MODEL / FINAL JUDGMENT",
      55,
      655,
    );
    this.screenTexture.needsUpdate = true;
  }
  render(s: SliceSave, t: number, dt: number, elapsed: number) {
    if (!this.ready) return;
    if (
      this.ripple &&
      !["sketch", "change", "echo"].includes(this.ripple.phase)
    ) {
      this.rippleWorld ??= new RippleWorld({
        human: (shirt, teacher) => this.human(shirt, teacher),
        chair: () => this.makeChair(true),
        sit: (r, p) => this.sit(r, p),
      });
      this.rippleWorld.setFinale(this.finale, this.letter);
      this.rippleWorld.update(
        this.ripple,
        t,
        dt,
        s.reduced,
        this.width / this.height,
      );
      // Retain the established exposure of the separate 2046 environments.
      this.renderer.toneMappingExposure = 1.1;
      this.renderer.setRenderTarget(this.renderTarget);
      this.renderer.render(this.rippleWorld.scene, this.rippleWorld.camera);
      this.worldCalls = this.renderer.info.render.calls;
      this.worldTriangles = this.renderer.info.render.triangles;
      this.renderer.setRenderTarget(null);
      this.captionPlane.visible = this.overlayEnabled;
      this.renderer.render(this.overlayScene, this.overlayCamera);
      return;
    }
    this.renderer.toneMappingExposure = this.art.palette.exposure;
    const conversation =
      !this.ripple &&
      !!this.stayed &&
      ["discussion", "question", "second_chance"].includes(this.stayed.phase);
    const shot = !this.ripple
      ? classroomShot(
          this.stayed?.phase,
          s.focus,
          t,
          this.width / this.height < 0.85,
          s.reduced,
        )
      : null;
    if (!shot && (s.focus !== this.focus || this.activeShot))
      this.focusOn(
        s.focus,
        s.reduced ||
          (conversation && ["an", "teacher", "faces"].includes(s.focus)),
      );
    this.activeShot = shot?.id ?? null;
    if (s.beat !== this.lastBeat) {
      this.lastBeat = s.beat;
      this.screenKey = "";
    }
    this.cameraProgress = Math.min(1, this.cameraProgress + dt / 1.4);
    const alpha = s.reduced ? 1 : smooth(this.cameraProgress);
    this.eye.lerpVectors(this.cameraFrom, this.targetEye, alpha);
    this.target.lerpVectors(this.targetFrom, this.targetAt, alpha);
    if (shot) {
      this.focus = s.focus;
      this.eye.set(...shot.eye);
      this.target.set(...shot.at);
      this.cameraFrom.copy(this.eye);
      this.targetFrom.copy(this.target);
      this.targetEye.copy(this.eye);
      this.targetAt.copy(this.target);
      this.goalFov = this.fovFrom = shot.fov;
      this.cameraProgress = 1;
    }
    this.camera.position.copy(this.eye);
    if (!s.reduced && !shot && !conversation) {
      this.camera.position.x += this.pointer.x * 0.045;
      this.camera.position.y += this.pointer.y * 0.025;
    }
    this.camera.lookAt(this.target);
    this.camera.fov = T.MathUtils.lerp(this.fovFrom, this.goalFov, alpha);
    this.camera.updateProjectionMatrix();
    this.fan.rotation.y = s.reduced ? 0 : elapsed * 1.9;
    const hasTeacher =
      !this.evaluation ||
      ["teacher_enter", "chapter02"].includes(this.evaluation.phase);
    const entered =
        hasTeacher &&
        [
          "chair",
          "invitation",
          "profile",
          "evaluate",
          "verdict",
          "response",
          "paper",
          "complete",
        ].includes(s.beat),
      seated =
        hasTeacher &&
        [
          "invitation",
          "profile",
          "evaluate",
          "verdict",
          "response",
          "paper",
          "complete",
        ].includes(s.beat);
    this.teacher.root.visible = hasTeacher && (s.beat === "enter" || entered);
    if (s.beat === "enter") {
      const p = smooth(t / 4.5);
      this.door.rotation.y = -0.65 - p * 0.75;
      this.teacher.root.position.set(
        T.MathUtils.lerp(2.7, 1.9, p),
        0,
        T.MathUtils.lerp(5.8, 0.7, p),
      );
      this.teacher.root.rotation.y = Math.PI + 0.16;
      this.sit(this.teacher, 0);
      this.teacher.legs.forEach(
        (l, i) =>
          (l.rotation.x = s.reduced
            ? 0
            : Math.sin(t * 7 + i * Math.PI) * 0.25 * (1 - p)),
      );
      this.teacher.arms.forEach(
        (a, i) =>
          (a.rotation.x = s.reduced
            ? 0
            : Math.sin(t * 7 - i * Math.PI) * 0.2 * (1 - p)),
      );
    }
    if (s.beat === "chair") {
      const motif = this.stayed?.phase === "chair";
      const p = smooth(t / (motif ? CHAIR_MOTIF.dragSeconds : 2.4));
      this.chair.position.set(
        CHAIR_MOTIF.from[0] + (CHAIR_MOTIF.to[0] - CHAIR_MOTIF.from[0]) * p,
        0,
        CHAIR_MOTIF.from[2] + (CHAIR_MOTIF.to[2] - CHAIR_MOTIF.from[2]) * p,
      );
      this.chair.rotation.y = -0.2 * (1 - p);
      this.teacher.root.position.set(1.9 - 0.8 * p, 0, 0.7 - 0.65 * p);
      this.teacher.root.rotation.y = Math.PI;
      this.sit(
        this.teacher,
        smooth((t - (motif ? CHAIR_MOTIF.holdUntil : 2.5)) / 1.3),
      );
      this.teacher.arms[0].rotation.x = t < 2.5 ? -0.8 : -0.6;
    }
    if (seated) {
      this.chair.position.set(1.1, 0, 0.25);
      this.chair.rotation.y = 0;
      this.teacher.root.position.set(1.1, 0, 0.05);
      this.teacher.root.rotation.y = Math.PI + 0.12;
      this.sit(this.teacher, 1);
      this.teacher.head.rotation.y =
        s.beat === "response" || s.beat === "invitation" ? 0.3 : 0;
    }
    if (!entered && s.beat !== "enter") {
      this.chair.position.set(2.3, 0, 0.6);
      this.chair.rotation.y = -0.2;
    }
    this.an.head.rotation.x = ["verdict", "response"].includes(s.beat)
      ? 0.3
      : 0.1;
    this.an.head.rotation.y = s.beat === "response" ? -0.2 : 0;
    if (!s.reduced) {
      this.an.body.position.y = 0.59 + Math.sin(elapsed * 1.9) * 0.004;
      this.an.arms[1].rotation.x = s.beat === "evaluate" ? -1.7 : -1.66;
    }
    this.warmLight.intensity = seated
      ? 3.8
      : s.beat === "chair"
        ? 0.9 + smooth(t / 4) * 2.9
        : 0.9;
    this.conversationFill.intensity =
      this.stayed && !this.ripple
        ? this.stayed.phase === "chair"
          ? smooth((t - CHAIR_MOTIF.holdUntil) / CHAIR_MOTIF.sitSeconds) * 0.32
          : this.stayed.phase === "discussion"
            ? 0.06
            : 0.32
        : 0;
    this.paper.visible = s.beat === "paper" || s.beat === "complete";
    if (this.paper.visible) this.paper.position.x = 1.15 - smooth(t / 2) * 0.3;
    this.card.position.y = 1.049 + (s.selected ? 0.1 : 0);
    this.card.rotation.z = s.selected ? -0.06 : 0.07;
    this.screen(s, t);
    if (this.ripple && ["sketch", "change"].includes(this.ripple.phase)) {
      const x = this.screenCanvas.getContext("2d")!;
      x.fillStyle = "#162d25";
      x.fillRect(0, 0, this.screenCanvas.width, this.screenCanvas.height);
      x.fillStyle = "#d4dcb4";
      x.font = "38px Arial";
      x.fillText("PROTOTYPE / AN · 2026", 40, 70);
      x.font = "bold 48px Arial";
      x.fillText(
        this.ripple.phase === "change" ? "REVIEW REQUIRED" : "FINAL JUDGMENT",
        40,
        210,
      );
      x.font = "30px Arial";
      x.fillText(
        this.ripple.phase === "change"
          ? "MISSING CONTEXT / LOW CONFIDENCE"
          : "AN · NOT RECOMMENDED",
        40,
        310,
      );
      if (this.ripple.phase === "change") {
        x.fillText("HUMAN REVIEW / Xác minh hoàn cảnh.", 40, 410);
        x.fillText("Xem xét thêm, không tự động duyệt hỗ trợ.", 40, 500);
      }
      this.screenTexture.needsUpdate = true;
      this.screenKey = "";
    }
    if (this.stayed) {
      const st = this.stayed;
      const bookOpen = !["discussion", "chair", "question"].includes(st.phase);
      if (!bookOpen) {
        this.studyBook.position.set(1.25, 1.047, -0.15);
        this.studyBook.scale.set(1, 1, 1);
        this.studyBook.rotation.z = 0.1;
        (this.studyBook.material as T.MeshBasicMaterial).map =
          this.studyBook.userData.originalMap;
        this.bookLeaf.visible = false;
        this.pen.position.set(1.3, 1.055, -0.1);
        if (st.phase === "discussion")
          this.chair.position.set(...CHAIR_MOTIF.from);
      }
      if (bookOpen) {
        const key =
          JSON.stringify(st) +
          (st.phase === "written" ? Math.floor(t * 12) : "");
        if (key !== this.bookKey) {
          this.bookKey = key;
          drawNotebook(this.bookCanvas, st, t);
          this.bookTexture.needsUpdate = true;
        }
        (this.studyBook.material as T.MeshBasicMaterial).map = this.bookTexture;
        const pushed =
          ["unwritten", "written", "closing", "next"].includes(st.phase) ||
          (st.phase === "second_chance" && st.line === 2);
        const slide = st.phase === "second_chance" ? smooth(t / 2) : 1;
        this.studyBook.position.x = 0.75 - (pushed ? 0.3 * slide : 0);
        this.studyBook.position.z = pushed ? 0.2 * slide : -0.1;
        this.studyBook.scale.set(2, 1.35, 1);
        const page = st.page ?? "outcome";
        if (page !== this.lastPage) {
          this.lastPage = page;
          this.pageTurn = 0;
        }
        this.pageTurn = Math.min(1, this.pageTurn + dt / 0.7);
        this.bookLeaf.visible = !s.reduced && this.pageTurn < 1;
        this.bookLeaf.rotation.y =
          -Math.sin(this.pageTurn * Math.PI) * Math.PI * 0.85;
        this.studyBook.rotation.z = 0.06;
        if (st.phase === "second_chance" && st.line === 2)
          this.teacher.arms[0].rotation.x = -1.55;
        if (["unwritten", "written", "closing", "next"].includes(st.phase)) {
          this.an.head.rotation.x = st.phase === "unwritten" ? 0.18 : 0.06;
          this.an.arms[1].rotation.x = -1.6;
          this.pen.position.set(
            0.02 +
              (st.phase === "written"
                ? Math.min(1, t / 2.8)
                : st.phase === "unwritten"
                  ? 0
                  : 1) *
                0.16,
            1.09,
            0.37,
          );
          this.pen.rotation.y = -0.65;
        }
      }
      if (st.phase === "discussion") {
        this.an.head.rotation.x = 0.25;
        this.teacher.head.rotation.x = 0.08;
      }
      if (st.phase === "closing" || st.phase === "next")
        this.warmLight.intensity = 3.8 + smooth(t / 4) * 0.5;
    }
    this.classroomLighting.update(this.warmLight, this.conversationFill);
    this.poseNarrative(s, t, elapsed);
    for (let i = 0; i < this.drops.length; i++) {
      const d = this.drops[i];
      if (!s.reduced) d.y -= dt * d.speed;
      if (d.y < 0.6) d.y = 4.6;
      const j = i * 6;
      this.rainPositions[j] = d.x;
      this.rainPositions[j + 1] = d.y;
      this.rainPositions[j + 2] = d.z;
      this.rainPositions[j + 3] = d.x + 0.02;
      this.rainPositions[j + 4] = d.y - 0.18;
      this.rainPositions[j + 5] = d.z + 0.015;
    }
    (
      this.rain.geometry.getAttribute("position") as T.BufferAttribute
    ).needsUpdate = true;
    this.propAnchors.chair.copy(this.chair.position).y += 0.8;
    this.shadowRefreshed =
      this.shadowBeat !== s.beat ||
      (["enter", "chair"].includes(s.beat) && elapsed - this.shadowTime > 0.2);
    if (this.shadowRefreshed) {
      this.keyLight.shadow.needsUpdate = true;
      this.shadowBeat = s.beat;
      this.shadowTime = elapsed;
    }
    this.renderer.setRenderTarget(this.renderTarget);
    this.renderer.render(this.scene, this.camera);
    this.worldCalls = this.renderer.info.render.calls;
    this.worldTriangles = this.renderer.info.render.triangles;
    this.renderer.setRenderTarget(null);
    this.captionPlane.visible = this.overlayEnabled;
    this.renderer.render(this.overlayScene, this.overlayCamera);
  }
  private poseNarrative(s: SliceSave, t: number, elapsed: number) {
    const st = this.stayed;
    const writing =
      st && ["unwritten", "written", "closing", "next"].includes(st.phase);
    this.actors.relax(this.an);
    this.actors.relax(this.teacher);
    const settled =
      st && st.phase !== "discussion"
        ? st.phase === "chair"
          ? smooth((t - CHAIR_MOTIF.holdUntil) / CHAIR_MOTIF.sitSeconds)
          : 1
        : 0;
    this.actors.reach(
      this.an,
      1,
      new T.Vector3(-0.64, 0.91, -0.54).lerp(
        new T.Vector3(-0.55, 0.91, -0.3),
        settled,
      ),
    );
    if (writing) {
      this.actors.reach(
        this.an,
        0,
        this.pen
          .getWorldPosition(new T.Vector3())
          .add(new T.Vector3(0, 0.012, 0)),
      );
      this.an.head.rotation.set(0.27, -0.06, -0.025);
    } else if (st) {
      this.an.head.rotation.set(
        st.phase === "discussion" ? 0.2 : 0.2 - 0.12 * settled,
        -0.85,
        -0.02,
      );
    }
    if (s.beat === "chair") {
      this.actors.reach(
        this.teacher,
        0,
        this.chair
          .localToWorld(new T.Vector3(-0.1, 1.02, 0.25))
          .lerp(new T.Vector3(1.25, 0.91, -0.3), smooth((t - 2.3) / 1.8)),
      );
    } else if (st?.phase === "second_chance" && st.line === 2) {
      this.actors.reach(
        this.teacher,
        1,
        this.studyBook.localToWorld(new T.Vector3(0.1, -0.28, 0.015)),
      );
    } else if (st && !["discussion", "chair"].includes(st.phase)) {
      this.actors.reach(this.teacher, 0, new T.Vector3(1.25, 0.91, -0.3));
    }
    if (st && !["discussion", "chair"].includes(st.phase))
      this.teacher.head.rotation.set(0.1, 0.85, 0.015);
    if (st?.phase === "chair")
      this.teacher.head.rotation.set(0.08, 0.85 * settled, 0.015 * settled);
    this.actors.expression(
      this.an,
      elapsed,
      s.reduced,
      !!st && ["written", "closing", "next"].includes(st.phase),
    );
    this.actors.expression(this.teacher, elapsed + 1.8, s.reduced);
  }
  project(): PropPosition[] {
    return Object.entries(this.propAnchors).map(([id, p]) => {
      const v = p.clone().project(this.camera);
      return {
        id: id as Focus,
        x: ((v.x + 1) / 2) * this.width,
        y: ((1 - v.y) / 2) * this.height,
        visible:
          v.z < 1 && v.x > -0.95 && v.x < 0.95 && v.y > -0.85 && v.y < 0.9,
      };
    });
  }
  snapshot() {
    if (
      this.rippleWorld &&
      this.ripple &&
      !["sketch", "change", "echo"].includes(this.ripple.phase)
    )
      return {
        ...this.rippleWorld.snapshot(),
        drawCalls: this.worldCalls,
        resolution: this.resolution,
      };
    const portrait = (rig: Rig) => {
      const p = rig.head.getWorldPosition(new T.Vector3()).project(this.camera);
      return {
        x: ((p.x + 1) * this.width) / 2,
        y: ((1 - p.y) * this.height) / 2,
        visible: Math.abs(p.x) < 1 && Math.abs(p.y) < 1 && p.z > -1 && p.z < 1,
      };
    };
    return {
      school: {
        name: "Trường Đại học Tây Nguyên",
        logoLoaded: this.art.schoolLogoLoaded,
      },
      camera: this.camera.position.toArray(),
      shot: this.activeShot,
      teacherBodyY: this.teacher.body.position.y,
      portraits: { an: portrait(this.an), teacher: portrait(this.teacher) },
      laptopLid: [
        [-0.54, -0.34],
        [0.54, -0.34],
        [0.54, 0.34],
        [-0.54, 0.34],
      ].map(([x, y]) => {
        const p = this.screenMesh
          .localToWorld(new T.Vector3(x, y, -0.025))
          .project(this.camera);
        return {
          x: ((p.x + 1) * this.width) / 2,
          y: ((1 - p.y) * this.height) / 2,
        };
      }),
      target: this.target.toArray(),
      fov: this.camera.fov,
      artDirection: this.art.direction,
      characterArt: "sculpted-narrative-v1",
      anHand: this.actors.handWorld(this.an, 1),
      focus: this.focus,
      teacher: this.teacher.root.position.toArray(),
      teacherVisible: this.teacher.root.visible,
      anHead: this.an.head.rotation.x,
      anFeetY: this.an.shins.map(
        (shin) => shin.localToWorld(new T.Vector3(0, -0.4425, 0.05)).y,
      ),
      teacherFeetY: this.teacher.shins.map(
        (shin) => shin.localToWorld(new T.Vector3(0, -0.4425, 0.05)).y,
      ),
      notebookPage: this.stayed?.page ?? null,
      notebookPosition: this.studyBook.position.toArray(),
      pageTurn: this.pageTurn,
      chair: this.chair.position.toArray(),
      drawCalls: this.worldCalls,
      triangles: this.worldTriangles,
      shadowRefreshed: this.shadowRefreshed,
      resources: {
        geometries: this.renderer.info.memory.geometries,
        textures: this.renderer.info.memory.textures,
        programs: this.renderer.info.programs?.length ?? 0,
        renderTarget: [this.renderTarget.width, this.renderTarget.height],
        samples: this.renderTarget.samples,
        output: [this.canvas.width, this.canvas.height],
        shadowMap: [1024, 1024],
      },
      resolution: this.resolution,
    };
  }
  dispose() {
    this.classroomLighting.dispose();
    this.rippleWorld?.dispose();
    this.renderTarget.dispose();
    this.art.dispose();
    this.actors.dispose();
    this.legacyMaterials.forEach((m) => m.dispose());
    for (const t of this.textures) t.dispose();
    for (const g of this.geometries) g.dispose();
    this.overlayScene.traverse((o) => {
      if (o instanceof T.Mesh) {
        o.geometry.dispose();
        const materials = Array.isArray(o.material) ? o.material : [o.material];
        materials.forEach((m) => m.dispose());
      }
    });
    this.scene.traverse((o) => {
      if (o instanceof T.Mesh || o instanceof T.LineSegments) {
        const ms = Array.isArray(o.material) ? o.material : [o.material];
        ms.forEach((m) => m.dispose());
      }
    });
    this.renderer.dispose();
  }
}
