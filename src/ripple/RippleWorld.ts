import { FinaleVisual } from "../finale/FinaleVisual";
import type { FinaleSave } from "../finale/state";
import type { Letter } from "../finale/letter";
import * as T from "three";
import { CHAIR_MOTIF } from "../cinematic/motifs";
import { founderRevealed, type RippleSave } from "./state";
import { milestones } from "./story";
import { ResearchDesk2029 } from "./ResearchDesk2029";
import { ResearchStudio } from "./ResearchStudio";
import { ResearchLighting, researchShot } from "./ResearchCinematography";
import { FutureStudio2046 } from "./FutureStudio2046";
import {
  futureArrivalCue,
  futureArrivalShot,
  futureArchiveShot,
} from "./FutureArrival";
import {
  FutureLighting2046,
  futureConversationShot,
} from "./FutureCinematography";
import {
  applyFutureConversation,
  type FutureActing,
} from "./FutureChairPerformance";
type XYZ = [number, number, number];
interface Rig {
  root: T.Group;
  body: T.Group;
  head: T.Group;
  arms: T.Group[];
  legs: T.Group[];
  shins: T.Group[];
}
interface Props {
  acting: FutureActing;
  human: (shirt: string, teacher?: boolean) => Rig;
  chair: () => T.Group;
  sit: (r: Rig, p: number) => void;
  researcher: () => Rig;
  poseResearcher: (r: Rig, time: number, reduced: boolean) => void;
}
const ease = (t: number) => {
  const p = T.MathUtils.clamp(t, 0, 1);
  return p * p * (3 - 2 * p);
};
/** A physical research stage sharing the classroom's actors, chair geometry and renderer. */
export class RippleWorld {
  private finaleVisual: FinaleVisual | null = null;
  private finale: FinaleSave | null = null;
  private letter: Letter | null = null;
  setFinale(s: FinaleSave | null, letter: Letter | null) {
    this.finale = s;
    this.letter = letter;
  }
  scene = new T.Scene();
  camera = new T.PerspectiveCamera(48, 1, 0.08, 65);
  private resources: (T.BufferGeometry | T.Material | T.Texture)[] = [];
  private an: Rig;
  private young: Rig;
  private researcher: Rig;
  private oldSeat: T.Group;
  private legacyRoom = new T.Group();
  private futureStudio: FutureStudio2046 | null = null;
  private founderHero: Rig | null = null;
  private studio = new ResearchStudio();
  private researchLighting = new ResearchLighting();
  private futureLighting = new FutureLighting2046();
  private team: Rig[] = [];
  private chair: T.Group;
  private notebook: T.Mesh;
  private record: T.Mesh;
  private blank: T.Mesh;
  private brand: T.Group;
  private workshop: T.Group;
  private desk2029 = new ResearchDesk2029();
  private standardDesk = new T.Group();
  private lab: T.Group;
  private canvas = document.createElement("canvas");
  private texture: T.CanvasTexture;
  private key = "";
  private screen: T.Mesh;
  private simulation: T.Group;
  private links: T.Line;
  private light: T.PointLight;
  private ambient: T.HemisphereLight;
  private keyLight: T.DirectionalLight;
  private era = 2029;
  private shot = "";
  private progress = 1;
  private fromEye = new T.Vector3();
  private fromAt = new T.Vector3();
  private fromFov = 48;
  private at = new T.Vector3();
  private target = new T.Vector3();
  private eye = new T.Vector3();
  constructor(private props: Props) {
    this.scene.background = new T.Color("#172b33");
    this.scene.fog = new T.FogExp2("#172b33", 0.024);
    this.ambient = new T.HemisphereLight("#cfebed", "#24353b", 2.4);
    this.scene.add(this.ambient);
    const sun = new T.DirectionalLight("#b7e1ef", 3);
    this.keyLight = sun;
    sun.position.set(-3, 8, 4);
    this.scene.add(sun);
    this.light = new T.PointLight("#f0c891", 6, 8);
    this.light.position.set(0.5, 3, 1);
    this.scene.add(this.light);
    this.scene.add(this.legacyRoom);
    this.box(this.legacyRoom, [16, 0.14, 18], [0, -0.08, -3], "#40515a");
    for (const x of [-6.5, 6.5]) {
      this.box(this.legacyRoom, [0.2, 4.5, 16], [x, 2, -3], "#72868c");
      for (let z = -9; z < 4; z += 2)
        this.box(this.legacyRoom, [0.24, 4, 0.24], [x, 2, z], "#a5bbbc");
    }
    // Deep windows, a real city silhouette and repeated structural ribs.
    for (let i = 0; i < 16; i++)
      this.box(
        this.legacyRoom,
        [0.65, 1.5 + (i % 5) * 0.6, 0.8],
        [-7 + i * 0.9, 1.5, -13],
        "#718a90",
      );
    this.box(this.legacyRoom, [14, 0.12, 0.2], [0, 1.1, -10], "#8aa3aa");
    for (let x = -6; x <= 6; x += 2)
      this.box(this.legacyRoom, [0.1, 4.5, 0.1], [x, 2, -10], "#9fb9bb");
    this.lab = new T.Group();
    this.scene.add(this.lab);
    for (const [x, z] of [
      [-3, -4],
      [3, -5],
      [-3, -8],
    ]) {
      this.box(this.lab, [2.2, 0.12, 1.1], [x, 1.05, z], "#728d94");
      this.box(this.lab, [1.7, 0.06, 0.7], [x, 1.13, z], "#d1ddda");
      this.box(this.lab, [0.12, 1, 0.6], [x - 0.8, 0.5, z], "#304954");
      this.box(this.lab, [0.12, 1, 0.6], [x + 0.8, 0.5, z], "#304954");
      this.sign(
        this.lab,
        ["NGHIÊN CỨU / AION", "KHOA HỌC · Y TẾ · GIÁO DỤC"],
        [1.5, 0.45],
        [x, 1.65, z - 0.3],
      );
    }
    this.workshop = new T.Group();
    this.scene.add(this.workshop);
    this.scene.add(
      this.desk2029.root,
      this.standardDesk,
      this.studio.root,
      this.researchLighting.root,
      this.futureLighting.root,
    );
    for (let i = 0; i < 5; i++)
      this.box(
        this.workshop,
        [0.48, 0.16, 0.55],
        [3 + i * 0.5, 0.1, -3],
        "#9e8d72",
      );
    this.sign(
      this.workshop,
      ["THỬ NGHIỆM / 2029", "KẾT QUẢ CHƯA ĐẠT"],
      [1.2, 0.6],
      [2.8, 1.5, -2],
    );
    // The foreground table follows the same coordinates as the 2026 classroom.
    this.box(this.standardDesk, [3.1, 0.12, 1.8], [0.2, 1, -0.75], "#b9c4b8");
    for (const x of [-1.1, 1.5])
      for (const z of [-1.4, -0.1])
        this.box(this.standardDesk, [0.08, 1, 0.08], [x, 0.5, z], "#405760");
    this.box(
      this.standardDesk,
      [1.15, 0.06, 0.72],
      [-0.5, 1.1, -1.05],
      "#243d48",
    );
    this.canvas.width = 1200;
    this.canvas.height = 720;
    this.texture = new T.CanvasTexture(this.canvas);
    this.texture.colorSpace = T.SRGBColorSpace;
    this.resources.push(this.texture);
    this.screen = new T.Mesh(
      new T.PlaneGeometry(1.35, 0.81),
      new T.MeshBasicMaterial({ map: this.texture }),
    );
    this.resources.push(
      this.screen.geometry,
      this.screen.material as T.Material,
    );
    this.screen.position.set(-0.5, 1.58, -1.45);
    this.screen.rotation.x = -0.1;
    this.scene.add(this.screen);
    this.notebook = this.sign(
      this.scene,
      ["AN · 2026 →", "HUMAN REVIEW", "Xác minh. Xem xét. Quyết định."],
      [0.8, 0.6],
      [0.6, 1.08, -0.6],
    );
    this.notebook.rotation.x = -Math.PI / 2;
    this.record = this.sign(
      this.scene,
      ["2046 · FOUNDER PROTOCOL", "DANH TÍNH CHƯA MỞ"],
      [1, 0.64],
      [1, 1.08, -1.25],
    );
    this.record.rotation.x = -Math.PI / 2;
    this.blank = this.sign(this.scene, [], [0.65, 0.5], [0.4, 1.095, -0.1]);
    this.blank.rotation.x = -Math.PI / 2;
    this.blank.visible = false;
    this.brand = new T.Group();
    this.scene.add(this.brand);
    this.sign(
      this.brand,
      ["AION", "GLOBAL INTELLIGENCE SUMMIT · 2046"],
      [4, 1.2],
      [0, 3, -7],
    );
    this.simulation = new T.Group();
    this.scene.add(this.simulation);
    this.simulation.position.set(-3, 1.6, -4);
    for (let i = 0; i < 10; i++) {
      const g = new T.SphereGeometry(0.07, 6, 6);
      const m = new T.MeshBasicMaterial({
        color: i % 2 ? "#b5d1b3" : "#7ec8cf",
      });
      this.resources.push(g, m);
      const n = new T.Mesh(g, m);
      n.position.set(
        Math.sin(i * 2) * 0.5,
        Math.cos(i * 2) * 0.5,
        Math.sin(i) * 0.3,
      );
      this.simulation.add(n);
    }
    const pts = [
      new T.Vector3(0.6, 1.1, -0.6),
      new T.Vector3(1.1, 0.4, 0.25),
      new T.Vector3(-0.5, 1.55, -1.4),
    ];
    const geom = new T.BufferGeometry().setFromPoints(pts);
    const mat = new T.LineBasicMaterial({
      color: "#c8dbae",
      transparent: true,
      opacity: 0.8,
    });
    this.resources.push(geom, mat);
    this.links = new T.Line(geom, mat);
    this.scene.add(this.links);
    this.an = props.human("#566d60");
    this.box(this.an.head, [0.025, 0.06, 0.08], [-0.13, 0.04, 0.01], "#b2b5a6");
    this.box(this.an.head, [0.025, 0.06, 0.08], [0.13, 0.04, 0.01], "#b2b5a6");
    this.young = props.human("#7e9b9d");
    this.scene.add(this.an.root, this.young.root);
    this.young.root.position.set(-0.45, 0, 0.18);
    this.young.root.rotation.y = Math.PI;
    props.sit(this.young, 1);
    const seat = props.chair();
    this.oldSeat = seat;
    seat.position.set(-0.45, 0, 0.25);
    this.scene.add(seat);
    this.researcher = props.researcher();
    this.researcher.root.position.set(-0.5, 0, 0.38);
    this.researcher.root.rotation.y = Math.PI;
    this.researcher.root.scale.set(1.12, 1.14, 1.12);
    this.researcher.body.scale.x = 1.06;
    this.researcher.head.scale.setScalar(0.92);
    this.scene.add(this.researcher.root);
    this.chair = props.chair();
    this.scene.add(this.chair);
    for (let i = 0; i < 2; i++) {
      const r = props.human(i ? "#76847d" : "#b3a482");
      r.root.position.set(i ? 3 : -3, 0, -5);
      this.team.push(r);
      this.scene.add(r.root);
    }
    this.camera.position.set(4.5, 2.8, 4.4);
    this.at.set(-0.5, 1.05, -1.4);
  }
  private box(parent: T.Object3D, size: XYZ, pos: XYZ, color: string) {
    const g = new T.BoxGeometry(...size);
    const m = new T.MeshLambertMaterial({ color });
    this.resources.push(g, m);
    const mesh = new T.Mesh(g, m);
    mesh.position.set(...pos);
    parent.add(mesh);
    return mesh;
  }
  private sign(
    parent: T.Object3D,
    lines: string[],
    size: [number, number],
    pos: XYZ,
  ) {
    const c = document.createElement("canvas");
    c.width = 1000;
    c.height = 500;
    const x = c.getContext("2d")!;
    x.fillStyle = "#dae0c9";
    x.fillRect(0, 0, 1000, 500);
    x.fillStyle = "#24434a";
    lines.forEach((l, i) => {
      x.font = i ? "36px Arial" : "bold 68px Arial";
      x.fillText(l, 40, 100 + i * 100);
    });
    const tex = new T.CanvasTexture(c);
    tex.colorSpace = T.SRGBColorSpace;
    const g = new T.PlaneGeometry(...size);
    const m = new T.MeshBasicMaterial({ map: tex, side: T.DoubleSide });
    this.resources.push(tex, g, m);
    const mesh = new T.Mesh(g, m);
    mesh.position.set(...pos);
    parent.add(mesh);
    return mesh;
  }
  update(
    s: RippleSave,
    t: number,
    dt: number,
    reduced: boolean,
    aspect: number,
  ) {
    this.era = ["years", "milestone"].includes(s.phase)
      ? milestones[s.milestones].year
      : 2046;
    const modern = this.era >= 2035;
    const journal2029 = this.era === 2029;
    const research =
      this.era === 2029 || this.era === 2035 || this.era === 2045;
    const future = this.era === 2046 && !this.finale;
    if (future && !this.futureStudio) {
      this.futureStudio = new FutureStudio2046();
      this.scene.add(this.futureStudio.root);
      this.founderHero = this.props.researcher();
      this.founderHero.root.scale.set(1.1, 1.12, 1.1);
      const clones = new Map<T.Material, T.Material>();
      this.founderHero.root.traverse((object) => {
        if (
          !(object instanceof T.Mesh) ||
          Array.isArray(object.material) ||
          !("color" in object.material)
        )
          return;
        const material = object.material as T.MeshToonMaterial;
        if (
          !["426e88", "416f9d", "64879a", "7d9eae"].includes(
            material.color.getHexString(),
          )
        )
          return;
        let clone = clones.get(material);
        if (!clone) {
          clone = material.clone();
          (clone as T.MeshToonMaterial).color.set("#3e5663");
          clones.set(material, clone);
          this.resources.push(clone);
        }
        object.material = clone;
      });
      this.scene.add(this.founderHero.root);
    }
    if (this.futureStudio) {
      this.futureStudio.root.visible = future;
      if (future) this.futureStudio.update(t, reduced, s.phase, dt);
    }
    this.legacyRoom.visible = !future;
    this.researchLighting.update(research, this.era);
    this.futureLighting.update(future, s.phase, t, reduced);
    this.studio.root.visible = research;
    this.studio.setModern(this.era >= 2035);
    if (this.era === 2035) this.studio.updateExperiment(s.lab2035);
    this.researcher.root.visible = research || future;
    this.young.root.visible = !research && !future;
    this.oldSeat.visible = !research && !future;
    this.chair.visible = !research;
    if (research || future)
      this.props.poseResearcher(this.researcher, t, reduced);
    if (research || future) this.researcher.head.rotation.y = -0.55;
    const arrival = futureArrivalCue(s.phase, t, reduced);
    this.ambient.intensity = future
      ? 0.2 + 0.2 * arrival.architecture
      : research
        ? 0.65
        : 2.4;
    this.keyLight.intensity = future ? 0.2 : research ? 0.65 : 3;
    this.light.intensity = future ? 1.3 : 6;
    this.keyLight.color.set(journal2029 ? "#e5d6b9" : "#b7e1ef");
    this.desk2029.root.visible = journal2029;
    this.standardDesk.visible = !research && !future;
    this.screen.visible = this.era !== 2035 && this.era !== 2045;
    this.notebook.visible = !journal2029;
    this.notebook.position.y = this.era === 2035 ? 1.106 : 1.08;
    this.lab.visible = modern && !research && !future;
    this.workshop.visible = !modern && !research;
    this.brand.visible = this.era >= 2045 && !research && !future;
    this.record.visible = this.era === 2046;
    if (founderRevealed(s))
      (this.record.material as T.MeshBasicMaterial).map = this.texture;
    this.team.forEach((r, i) => {
      r.root.visible = modern;
      // Keep background staff beside the compute bays, outside the data loom.
      r.root.position.set(
        future ? (i ? 6.7 : -4.5) : i ? 3 : -3,
        0,
        future ? -8 : -5,
      );
      r.head.rotation.x = 0.1;
    });
    this.scene.background = new T.Color(
      future ? "#30475b" : modern ? "#192f39" : "#253c3b",
    );
    this.scene.fog!.color.copy(this.scene.background as T.Color);
    this.light.color.set(modern ? "#badfe4" : "#f0c891");
    this.simulation.visible = modern && !future;
    this.simulation.rotation.y = reduced ? 0 : t * 0.2;
    const experiment = this.era === 2035 ? s.lab2035 : undefined;
    this.simulation.scale.setScalar(
      experiment?.running
        ? 1 + Math.sin((experiment.running.elapsed / 2.2) * Math.PI) * 0.14
        : 1,
    );
    this.simulation.children.forEach((node, i) => {
      if (node instanceof T.Mesh)
        (node.material as T.MeshBasicMaterial).color.set(
          experiment
            ? experiment.enabled.includes("access")
              ? "#dfbe7f"
              : "#8ebfc9"
            : i % 2
              ? "#b5d1b3"
              : "#7ec8cf",
        );
    });
    const key = `${s.phase}.${s.milestones}.${s.memories.join()}`;
    if (key !== this.key) {
      this.key = key;
      const x = this.canvas.getContext("2d")!;
      x.fillStyle = "#142d37";
      x.fillRect(0, 0, 1200, 720);
      x.fillStyle = "#c3e4df";
      x.font = "30px Arial";
      x.fillText(this.era + " · TƯ LIỆU THẾ GIỚI HƯ CẤU", 50, 65);
      const lines =
        this.era < 2046
          ? [...milestones[s.milestones].lines]
          : founderRevealed(s)
            ? [
                "AN — FOUNDER OF AION",
                "HỒ SƠ 2026: AN · SINH VIÊN CNTT",
                "HUMAN REVIEW / NGUYÊN TẮC THIẾT KẾ",
              ]
            : s.phase === "align"
              ? [
                  "HỒ SƠ ĐỐI CHIẾU · 2026",
                  "DANH TÍNH ẨN · NOT RECOMMENDED",
                  "2046 · KHỚP DẤU BÚT / HỒ SƠ",
                ]
              : [
                  "AION · 2046",
                  "AI ĐA NĂNG #1 THẾ GIỚI",
                  "MÔ PHỎNG · Y TẾ · GIÁO DỤC",
                ];
      lines.forEach((l, i) => {
        x.font = i ? "32px Arial" : "bold 45px Arial";
        x.fillText(l, 50, 200 + i * 130);
      });
      this.texture.needsUpdate = true;
    }
    const revealed = founderRevealed(s);
    this.blank.visible = s.phase === "finale";
    if (this.blank.visible) this.blank.position.x = 0.7 - 0.3 * ease(t / 2);
    const callback = [
      "approach",
      "chair",
      "reflection",
      "reconstruct",
      "principle",
      "finale",
    ].includes(s.phase);
    this.an.root.visible = revealed;
    this.an.root.position.set(callback ? 1.9 : 1.1, 0, callback ? 0.7 : 0.2);
    this.an.root.rotation.y = Math.PI;
    this.props.sit(this.an, callback ? 0 : 1);
    this.young.head.rotation.x = 0.28;
    this.young.arms[1].rotation.x = -0.65;
    this.chair.position.set(...CHAIR_MOTIF.from);
    this.chair.rotation.y = -0.2;
    if (
      s.phase === "chair" ||
      ["reflection", "reconstruct", "principle", "finale"].includes(s.phase)
    ) {
      const p =
        s.phase === "chair"
          ? ease(Math.max(0, t - 0.1) / CHAIR_MOTIF.dragSeconds)
          : 1;
      this.chair.position.set(
        CHAIR_MOTIF.from[0] + (CHAIR_MOTIF.to[0] - CHAIR_MOTIF.from[0]) * p,
        0,
        CHAIR_MOTIF.from[2] + (CHAIR_MOTIF.to[2] - CHAIR_MOTIF.from[2]) * p,
      );
      this.chair.rotation.y = -0.2 * (1 - p);
      this.an.root.position.set(1.9 - 0.8 * p, 0, 0.7 - 0.5 * p);
      this.props.sit(
        this.an,
        s.phase === "chair"
          ? ease((t - 0.1 - CHAIR_MOTIF.holdUntil) / CHAIR_MOTIF.sitSeconds)
          : 1,
      );
      this.an.arms[0].rotation.x = t < 2.6 ? -0.8 : -0.6;
    } else if (s.phase === "approach") {
      this.an.root.position.x = 3.5 - 1.6 * ease(t / 5);
      this.an.arms.forEach(
        (a, i) =>
          (a.rotation.x = reduced ? 0 : Math.sin(t * 5 + i * Math.PI) * 0.13),
      );
    }
    if (this.founderHero) {
      this.founderHero.root.visible = future && revealed;
      if (future && revealed) {
        applyFutureConversation(
          this.props.acting,
          this.props.sit,
          this.founderHero,
          this.researcher,
          this.chair,
          s,
          t,
          reduced,
        );
        this.an.root.visible = false;
      }
    }
    this.links.visible =
      s.phase === "principle" ||
      s.phase === "finale" ||
      (s.phase === "reconstruct" && s.memories.length === 3);
    this.notebook.rotation.z = reduced ? 0 : Math.sin(t * 0.8) * 0.008;
    let eye: XYZ = [4.5, 2.8, 4.4],
      at: XYZ = [-0.5, 1.05, -1.4],
      fov = 48;
    if (future && ["world", "record"].includes(s.phase)) {
      ({ eye, at, fov } = futureArrivalShot(
        s.phase,
        t,
        aspect < 0.8,
        reduced,
      )!);
    }
    if (["years", "milestone"].includes(s.phase)) {
      eye = s.phase === "years" ? [3.5, 2.6, 3.4] : [1.8, 2.2, 0.1];
      at = [0.2, 1.2, -0.8];
      if (research) {
        ({ eye, at, fov } = researchShot(
          t,
          aspect < 0.8,
          reduced,
          s.phase === "milestone",
        ));
      }
    }
    if ((s.phase === "record" && !future) || s.phase === "align") {
      eye = [1.8, 2.5, 0.1];
      at = [0.3, 1.12, -1.2];
      fov = 43;
    }
    if (s.phase === "reveal") {
      eye = t < 4 ? [1.8, 2.6, 0.1] : [2.4, 1.6, -2.4];
      at = t < 4 ? [1, 1.08, -1.25] : [1.1, 1.3, 0.2];
      fov = t < 4 ? 38 : 36;
    }
    if (this.era === 2035 && s.lab2035 && s.phase === "years") {
      eye = aspect < 0.8 ? [0.45, 3.0, 3.4] : [1.6, 2.65, 2.5];
      at = aspect < 0.8 ? [0.2, 1.5, -1.1] : [0.2, 1.3, -1.2];
      fov = aspect < 0.8 ? 62 : 46;
    }
    if (s.phase === "chair") {
      eye = CHAIR_MOTIF.eye;
      at = CHAIR_MOTIF.at;
      fov = CHAIR_MOTIF.fov;
    }
    if (["approach", "reflection"].includes(s.phase)) {
      eye = [-2.8, 1.65, -3];
      at = [0.3, 1.15, 0.1];
    }
    if (["reconstruct", "principle", "finale"].includes(s.phase)) {
      eye = [3.8, 2.6, 3.4];
      at = [0.4, 1, -0.5];
    }
    if (s.phase === "reconstruct" && s.selected) {
      if (s.selected === "evaluation") {
        eye = [2.5, 2.6, 0.2];
        at = [1, 1.08, -1.25];
      }
      if (s.selected === "design") {
        eye = [1.8, 2.6, 0.6];
        at = [0.6, 1.08, -0.6];
      }
      if (s.selected === "stayed") {
        eye = [3.4, 1.5, 2];
        at = [1.1, 0.7, 0.25];
      }
      fov = 43;
    }
    const conversationShot = future
      ? futureConversationShot(s, t, aspect < 0.8, reduced)
      : null;
    if (conversationShot) ({ eye, at, fov } = conversationShot);
    const authoredShot = future
      ? (futureArrivalShot(s.phase, t, aspect < 0.8, reduced) ??
        futureArchiveShot(s.phase, t, aspect < 0.8, reduced))
      : null;
    if (authoredShot) ({ eye, at, fov } = authoredShot);
    const shot =
      s.phase === "reconstruct"
        ? `${s.phase}.${s.selected}`
        : s.phase === "reveal"
          ? `reveal.${t < 4 ? "record" : "an"}`
          : s.phase;
    if (this.shot !== shot) {
      this.shot = shot;
      this.progress = 0;
      this.fromEye.copy(this.camera.position);
      this.fromAt.copy(this.at);
      this.fromFov = this.camera.fov;
      if (s.phase === "chair") {
        this.fromEye.set(...eye);
        this.fromAt.set(...at);
        this.fromFov = fov;
      }
    }
    this.progress = Math.min(1, this.progress + dt / 1.5);
    this.eye.set(...eye);
    this.target.set(...at);
    // Portrait moves back rather than cropping the action.
    if (
      aspect < 0.8 &&
      s.phase !== "chair" &&
      !research &&
      !conversationShot &&
      !authoredShot
    )
      this.eye.sub(this.target).multiplyScalar(1.4).add(this.target);
    this.camera.aspect = aspect;
    const cameraBlend = reduced || authoredShot ? 1 : ease(this.progress);
    this.camera.fov = T.MathUtils.lerp(this.fromFov, fov, cameraBlend);
    this.camera.position.lerpVectors(this.fromEye, this.eye, cameraBlend);
    this.at.lerpVectors(this.fromAt, this.target, cameraBlend);
    this.camera.lookAt(this.at);
    this.camera.updateProjectionMatrix();
    if (this.finale && this.letter) {
      this.finaleVisual ??= new FinaleVisual(this.scene, this.blank);
      this.finaleVisual.update(
        this.finale,
        this.letter,
        t,
        reduced,
        this.camera,
      );
    }
  }
  snapshot() {
    return {
      era: this.era,
      camera: this.camera.position.toArray(),
      cameraTarget: this.at.toArray(),
      cameraFov: this.camera.fov,
      chair: this.chair.position.toArray(),
      teacher: (this.founderHero?.root.visible
        ? this.founderHero
        : this.an
      ).root.position.toArray(),
      focus: this.shot,
      notebook: true,
      motif: CHAIR_MOTIF.id,
      futureWorkspace: this.futureStudio?.root.visible ?? false,
    };
  }
  dispose() {
    this.futureStudio?.dispose();
    this.studio.dispose();
    this.desk2029.dispose();
    this.finaleVisual?.dispose();
    this.resources.forEach((r) => r.dispose());
  }
}
