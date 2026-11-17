import * as T from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import {
  type Experiment2035,
  results2035,
  RUN2035_SECONDS,
} from "./experiment2035";
import {
  conditions2035,
  decisions2035,
  evaluatePatch2035,
} from "./codePatch2035";
type Vec = [number, number, number];

/** Research suite and adult-scale task chair, isolated from the 2026 set. */
export class ResearchStudio {
  readonly root = new T.Group();
  private workstation = new T.Group();
  private resources: { dispose(): void }[] = [];
  private materials = new Map<string, T.MeshStandardMaterial>();
  private labDisplays: {
    canvas: HTMLCanvasElement;
    texture: T.CanvasTexture;
  }[] = [];
  private labKey = "";
  constructor() {
    this.root.add(this.workstation);
    // Built-in storage, raised service wall and layered light make a room,
    // rather than a table floating against a city silhouette.
    this.box([12, 0.06, 12], [0, 0.015, -3], "#27383e");
    this.box([11, 3.8, 0.16], [0, 1.9, -8.2], "#12252f");
    for (const x of [-4.7, -3.3, 3.3, 4.7]) {
      this.box([1.25, 2, 0.55], [x, 1, -7.8], "#263943");
      this.box([1.13, 0.62, 0.035], [x, 1.34, -7.5], "#3c5059");
      this.box([1.13, 0.62, 0.035], [x, 0.65, -7.5], "#33464e");
      this.box([0.18, 0.025, 0.045], [x, 1.18, -7.47], "#a5b5b5");
    }
    for (const z of [-6.8, -4.3, -1.8]) {
      this.box([0.18, 3.5, 0.22], [-4.5, 1.75, z], "#182c35");
      this.box([0.05, 2.9, 0.06], [-4.38, 1.9, z], "#9ab2b3", this.root, true);
    }
    for (const x of [-2.5, 2.5]) {
      this.box([0.12, 0.09, 7], [x, 3.6, -3.7], "#1b3038");
      this.box([0.06, 0.015, 6.5], [x, 3.54, -3.7], "#e7d5b6", this.root, true);
    }
    // Research bench, rack-mounted compute and visible ventilation details.
    this.box([3.4, 0.12, 0.95], [2.1, 1.02, -4.9], "#687c80");
    for (const x of [0.65, 3.55])
      this.box([0.1, 1, 0.72], [x, 0.5, -4.9], "#1d3037");
    this.box([0.75, 1.4, 0.7], [3.8, 0.74, -4.4], "#14272f");
    for (let i = 0; i < 7; i++) {
      this.box([0.65, 0.12, 0.035], [3.8, 0.22 + i * 0.17, -4.03], "#334751");
      this.box(
        [0.025, 0.025, 0.015],
        [4.05, 0.22 + i * 0.17, -4.005],
        "#91c0b9",
        this.root,
        true,
      );
    }
    this.monitor([1.8, 1.57, -5.15], 0, 1.35, 0.73, "RESEARCH / CONTEXT");
    // Foreground workstation, 2035: a proper dual-display setup and compute tower.
    this.box([3.3, 0.13, 1.85], [0.2, 1, -0.75], "#6b7c80", this.workstation);
    this.box(
      [3.18, 0.025, 1.72],
      [0.2, 1.079, -0.75],
      "#314750",
      this.workstation,
    );
    for (const x of [-1.13, 1.54])
      this.box([0.075, 1, 0.65], [x, 0.5, -0.75], "#1b2e36", this.workstation);
    this.labDisplays.push(
      this.monitor(
        [-0.55, 1.72, -1.43],
        0.03,
        1.25,
        0.77,
        "HUMAN REVIEW",
        this.workstation,
      ),
    );
    this.labDisplays.push(
      this.monitor(
        [0.8, 1.72, -1.33],
        -0.18,
        1.25,
        0.77,
        "CONTEXT / VERIFY",
        this.workstation,
      ),
    );
    this.box([1, 0.035, 0.37], [-0.53, 1.12, -0.32], "#182b33", this.root);
    for (let row = 0; row < 4; row++)
      for (let col = 0; col < 13; col++)
        this.box(
          [0.05, 0.008, 0.045],
          [-0.96 + col * 0.067, 1.142, -0.45 + row * 0.07],
          "#819294",
          this.root,
        );
    this.box([0.1, 0.04, 0.16], [0.12, 1.12, -0.22], "#9da8a1", this.root);
    this.box([0.48, 0.8, 0.8], [1.3, 0.46, -0.8], "#152830", this.workstation);
    for (let i = 0; i < 9; i++)
      this.box(
        [0.32, 0.025, 0.025],
        [1.3, 0.2 + i * 0.055, -0.385],
        "#3b515b",
        this.workstation,
      );
    this.box(
      [0.018, 0.4, 0.018],
      [1.47, 0.49, -0.37],
      "#87beb8",
      this.workstation,
      true,
    );
    // Adjustable chair: correct adult seat height, lumbar support, arms, five casters.
    const cx = -0.5,
      cz = 0.42;
    this.box([0.6, 0.12, 0.58], [cx, 0.61, cz], "#22343c");
    const back = this.box([0.58, 0.72, 0.13], [cx, 1.02, cz + 0.34], "#21343b");
    back.rotation.x = -0.12;
    this.box([0.48, 0.18, 0.09], [cx, 0.85, cz + 0.25], "#465d61");
    this.box([0.35, 0.17, 0.12], [cx, 1.48, cz + 0.41], "#344b50");
    for (const x of [cx - 0.34, cx + 0.34]) {
      this.box([0.055, 0.27, 0.065], [x, 0.72, cz + 0.08], "#66797c");
      this.box([0.095, 0.06, 0.36], [x, 0.87, cz + 0.02], "#263d44");
    }
    this.cylinder(0.045, 0.5, [cx, 0.29, cz], "#8a9b9e");
    for (let i = 0; i < 5; i++) {
      const a = (i * Math.PI * 2) / 5;
      const spoke = this.box(
        [0.055, 0.045, 0.44],
        [cx + Math.sin(a) * 0.21, 0.11, cz + Math.cos(a) * 0.21],
        "#52686e",
      );
      spoke.rotation.y = a;
      const wheel = this.cylinder(
        0.066,
        0.065,
        [cx + Math.sin(a) * 0.42, 0.075, cz + Math.cos(a) * 0.42],
        "#14272e",
      );
      wheel.rotation.z = Math.PI / 2;
    }
    // Static furniture is merged per material and parent to keep draw cost bounded.
    this.batch(this.root);
    this.batch(this.workstation);
  }
  setModern(modern: boolean) {
    this.workstation.visible = modern;
  }
  updateExperiment(lab: Experiment2035 | undefined) {
    if (!lab) return;
    const key = JSON.stringify([
      lab.loaded,
      lab.enabled,
      lab.trials,
      lab.marked,
      lab.running?.mask,
      Math.floor((lab.running?.elapsed ?? 0) * 8),
      lab.codePatch?.condition,
      lab.codePatch?.decision,
      lab.codePatch?.status,
      Math.floor((lab.codePatch?.elapsed ?? 0) * 8),
    ]);
    if (key === this.labKey) return;
    this.labKey = key;
    this.labDisplays.forEach(({ canvas, texture }, i) => {
      const c = canvas.getContext("2d")!,
        mask = i === 0 ? 1 : 3,
        printed = lab.trials.includes(mask);
      c.fillStyle = "#0d202b";
      c.fillRect(0, 0, 1024, 640);
      if (lab.codePatch) {
        const patch = lab.codePatch;
        c.fillStyle = "#9abdc0";
        c.font = "25px Arial";
        c.fillText("2035 / TÁI DỰNG THIẾT KẾ", 40, 55);
        if (i === 0) {
          c.fillStyle = "#d4dfc5";
          c.font = "35px Consolas";
          c.fillText("if (", 40, 150);
          c.font = "26px Consolas";
          c.fillText(conditions2035[patch.condition].code, 65, 215, 900);
          c.fillText(") {", 40, 280);
          c.fillStyle = "#d9c18d";
          c.fillText(
            "return " + decisions2035[patch.decision].code + ";",
            65,
            355,
            900,
          );
          c.fillStyle = "#a3c7c9";
          c.fillText("return NEXT_SUPPORT_STEP;", 40, 470);
        } else {
          c.fillStyle = patch.status === "passed" ? "#c0d5a3" : "#d7c493";
          c.font = "bold 40px Arial";
          c.fillText(
            patch.status === "testing"
              ? "ĐANG KIỂM THỬ"
              : patch.status === "passed"
                ? "KIỂM THỬ ĐẠT"
                : patch.status === "skipped"
                  ? "ĐÃ BỎ QUA PHẦN CODE"
                  : "CHỌN NHÁNH XỬ LÝ",
            40,
            140,
          );
          c.font = "27px Arial";
          evaluatePatch2035(patch.condition, patch.decision).forEach(
            (test, row) => {
              c.fillStyle = patch.checked
                ? test.passed
                  ? "#b8cfa4"
                  : "#df9f8f"
                : "#8aaeb5";
              c.fillText(
                (patch.checked ? (test.passed ? "✓ " : "× ") : "· ") +
                  test.label,
                40,
                240 + row * 75,
                930,
              );
            },
          );
        }
        texture.needsUpdate = true;
        return;
      }
      c.fillStyle = "#91b7bc";
      c.font = "23px Arial";
      c.fillText("2035 / HỒ SƠ MÔ PHỎNG 12", 40, 50);
      c.fillStyle = "#dbe3d8";
      c.font = "38px Arial";
      c.fillText(i === 0 ? "DỮ LIỆU HỌC TẬP" : "ĐIỀU KIỆN THỰC HÀNH", 40, 125);
      c.fillStyle = "#9ab5b5";
      c.font = "29px Arial";
      c.fillText(
        i === 0
          ? "Điểm thực hành thấp. Bài nộp muộn."
          : "45 phút dùng máy mỗi ngày.",
        40,
        205,
      );
      c.fillText(
        i === 0
          ? "Chưa ghi nhận điều kiện học tập."
          : "Cần xác minh nhu cầu hỗ trợ.",
        40,
        255,
      );
      c.fillStyle = printed ? (i === 0 ? "#ed9a8c" : "#e4c795") : "#9cbec3";
      c.font = "bold 48px Consolas";
      c.fillText(
        lab.running
          ? "ĐANG THỬ NGHIỆM…"
          : printed
            ? results2035[mask].title
            : "CHỜ LƯỢT THỬ",
        40,
        385,
      );
      c.fillStyle = "#25434c";
      c.fillRect(40, 450, 930, 7);
      c.fillStyle = "#c8c697";
      c.fillRect(
        40,
        450,
        930 *
          (lab.running
            ? lab.running.elapsed / RUN2035_SECONDS
            : printed
              ? 1
              : 0),
        7,
      );
      c.font = "25px Arial";
      c.fillText(
        lab.marked
          ? "PHÁT HIỆN: BỐI CẢNH BỊ BỎ SÓT"
          : "Cùng một người. Chỉ thay nguồn thông tin.",
        40,
        550,
      );
      texture.needsUpdate = true;
    });
  }
  private mat(color: string, emissive = false) {
    const key = color + emissive;
    let material = this.materials.get(key);
    if (!material) {
      material = new T.MeshStandardMaterial({
        color,
        roughness: 0.65,
        metalness: color === "#8a9b9e" ? 0.6 : 0.12,
        ...(emissive ? { emissive: color, emissiveIntensity: 0.55 } : {}),
      });
      this.materials.set(key, material);
      this.resources.push(material);
    }
    return material;
  }
  private box(
    size: Vec,
    pos: Vec,
    color: string,
    parent = this.root,
    emissive = false,
  ) {
    const geometry = new RoundedBoxGeometry(
      ...size,
      1,
      Math.min(0.025, Math.min(...size) * 0.2),
    );
    this.resources.push(geometry);
    const mesh = new T.Mesh(geometry, this.mat(color, emissive));
    mesh.position.set(...pos);
    parent.add(mesh);
    return mesh;
  }
  private cylinder(radius: number, height: number, pos: Vec, color: string) {
    const geometry = new T.CylinderGeometry(radius, radius, height, 16);
    this.resources.push(geometry);
    const mesh = new T.Mesh(geometry, this.mat(color));
    mesh.position.set(...pos);
    this.root.add(mesh);
    return mesh;
  }
  private monitor(
    pos: Vec,
    angle: number,
    w: number,
    h: number,
    title: string,
    parent = this.root,
  ) {
    const group = new T.Group();
    group.position.set(...pos);
    group.rotation.y = angle;
    parent.add(group);
    this.box([w + 0.06, h + 0.06, 0.065], [0, 0, 0], "#14252e", group);
    this.box(
      [0.045, 0.48, 0.04],
      [0, -h * 0.5 - 0.17, -0.07],
      "#596e75",
      group,
    );
    this.box([0.4, 0.035, 0.22], [0, -h * 0.5 - 0.36, 0.02], "#2a404b", group);
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 640;
    const c = canvas.getContext("2d")!;
    c.fillStyle = "#0d202b";
    c.fillRect(0, 0, 1024, 640);
    c.fillStyle = "#83b1b8";
    c.font = "21px Arial";
    c.fillText("AN / RESEARCH WORKSPACE", 40, 47);
    c.fillStyle = "#d6e1d6";
    c.font = "32px Arial";
    c.fillText(title, 40, 110);
    c.strokeStyle = "#66a89e";
    c.lineWidth = 2;
    for (let row = 0; row < 3; row++) {
      c.beginPath();
      for (let x = 0; x < 940; x += 4) {
        const y =
          220 +
          row * 120 +
          Math.sin(x * 0.018 + row) * 25 +
          Math.cos(x * 0.009) * 12;
        if (x === 0) c.moveTo(40 + x, y);
        else c.lineTo(40 + x, y);
      }
      c.stroke();
    }
    const texture = new T.CanvasTexture(canvas);
    texture.colorSpace = T.SRGBColorSpace;
    texture.anisotropy = 4;
    const geometry = new T.PlaneGeometry(w, h),
      material = new T.MeshBasicMaterial({ map: texture });
    this.resources.push(texture, geometry, material);
    const screen = new T.Mesh(geometry, material);
    screen.position.z = 0.034;
    group.add(screen);
    this.batch(group);
    return { canvas, texture };
  }
  private batch(parent: T.Group) {
    parent.updateMatrixWorld(true);
    const groups = new Map<T.Material, T.Mesh[]>();
    for (const child of parent.children) {
      if (
        child instanceof T.Mesh &&
        !Array.isArray(child.material) &&
        !(child.material instanceof T.MeshBasicMaterial)
      ) {
        const list = groups.get(child.material) ?? [];
        list.push(child);
        groups.set(child.material, list);
      }
    }
    for (const [material, meshes] of groups) {
      if (meshes.length < 2) continue;
      const geometries = meshes.map((mesh) => {
        mesh.updateMatrix();
        return (
          mesh.geometry.index
            ? mesh.geometry.toNonIndexed()
            : mesh.geometry.clone()
        ).applyMatrix4(mesh.matrix);
      });
      const merged = mergeGeometries(geometries);
      if (merged) {
        this.resources.push(merged);
        for (const mesh of meshes) parent.remove(mesh);
        parent.add(new T.Mesh(merged, material));
      }
      geometries.forEach((geometry) => geometry.dispose());
    }
  }
  dispose() {
    this.resources.forEach((resource) => resource.dispose());
  }
}
