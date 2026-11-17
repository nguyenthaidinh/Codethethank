import * as T from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { futureArrivalCue } from "./FutureArrival";
import type { RippleSave } from "./state";
type Vec = [number, number, number];

/** Physical 2046 workspace. The inherited menu skyline is only the distant window view. */
export class FutureStudio2046 {
  readonly root = new T.Group();
  private resources: { dispose(): void }[] = [];
  private materials = new Map<string, T.MeshStandardMaterial>();
  private closed = false;
  private leaves: T.InstancedMesh;
  private dummy = new T.Object3D();
  private motionTime = 0;
  private skylineMaterial: T.MeshBasicMaterial;
  private skylineDusk = new T.Color("#557487");
  private skylineDay = new T.Color("#b8cbd4");
  private skylight = new T.PointLight("#ffd5a1", 10, 22, 2);
  constructor() {
    this.box([20, 0.16, 22], [0, -0.08, -4], "#475e69");
    this.box([6.8, 0.025, 5.7], [0.2, 0.016, -0.55], "#849ba1");
    for (const x of [-3.25, 3.65])
      this.box([0.025, 0.016, 5.6], [x, 0.036, -0.55], "#b7d8dc", true);
    // Floor seams and luminous perimeter lines keep the room's scale legible.
    for (let x = -9; x <= 9; x += 2)
      this.box([0.012, 0.005, 20], [x, 0.005, -4], "#263d48");
    for (let z = -12; z <= 5; z += 2)
      this.box([19, 0.005, 0.012], [0, 0.005, z], "#263d48");
    this.box([19, 0.2, 0.7], [0, 0.1, -9.2], "#213846");
    for (let x = -9; x <= 9; x += 3) {
      this.box([0.12, 5.7, 0.17], [x, 2.85, -9.6], "#233d4c");
      this.box([0.024, 4.8, 0.025], [x + 0.08, 2.9, -9.49], "#b0cbd2", true);
    }
    this.box([19, 0.06, 0.08], [0, 1.03, -9.5], "#8da9b2");
    const windowGeometry = new T.PlaneGeometry(32, 16);
    const windowMaterial = new T.MeshBasicMaterial({
      color: "#b8cbd4",
      toneMapped: false,
    });
    this.skylineMaterial = windowMaterial;
    const window = new T.Mesh(windowGeometry, windowMaterial);
    window.position.set(0, 5.4, -10.2);
    this.root.add(window);
    const oppositeWindow = new T.Mesh(windowGeometry, windowMaterial);
    oppositeWindow.position.set(0, 5.4, 7.2);
    oppositeWindow.rotation.y = Math.PI;
    this.root.add(oppositeWindow);
    for (let x = -9; x <= 9; x += 3) {
      this.box([0.12, 5.7, 0.17], [x, 2.85, 6.8], "#233d4c");
      this.box([0.025, 4.5, 0.025], [x - 0.08, 2.9, 6.7], "#b7d0d1", true);
    }
    this.box([19, 0.1, 0.12], [0, 1, 6.8], "#7898a4");
    this.resources.push(windowGeometry, windowMaterial);
    new T.TextureLoader().load(
      import.meta.env.BASE_URL + "menu/city-sunset.webp",
      (texture) => {
        if (this.closed) {
          texture.dispose();
          return;
        }
        texture.colorSpace = T.SRGBColorSpace;
        texture.anisotropy = 4;
        windowMaterial.map = texture;
        windowMaterial.needsUpdate = true;
        this.resources.push(texture);
      },
    );
    // Sculpted side wall, service ribs and suspended architectural light loops.
    for (const side of [-1, 1]) {
      this.box([0.4, 5.5, 15], [side * 9.4, 2.75, -3], "#192f3e");
      for (let z = -8; z < 4; z += 2) {
        this.box([0.16, 4.8, 0.28], [side * 9.13, 2.4, z], "#617e8a");
        this.box([0.025, 3.9, 0.04], [side * 9.02, 2.6, z], "#a8cdd5", true);
      }
    }
    for (const z of [-5.8, -0.5]) {
      const geometry = new T.TorusGeometry(3.3, 0.065, 6, 80);
      const ring = new T.Mesh(geometry, this.mat("#bacbd0"));
      ring.rotation.x = Math.PI / 2;
      ring.scale.set(1.45, 1, 1);
      ring.position.set(0, 4.6, z);
      this.root.add(ring);
      this.resources.push(geometry);
      const innerGeometry = new T.TorusGeometry(3.2, 0.025, 4, 80);
      const inner = new T.Mesh(innerGeometry, this.mat("#d9e6d5", true));
      inner.rotation.copy(ring.rotation);
      inner.scale.copy(ring.scale);
      inner.position.copy(ring.position).y -= 0.05;
      this.root.add(inner);
      this.resources.push(innerGeometry);
    }
    // Research compute banks: crafted framing, inset bays and restrained status light.
    for (const side of [-1, 1])
      for (let rack = 0; rack < 2; rack++) {
        const x = side * (5.5 + rack * 1.2),
          z = -6.8;
        this.box([0.95, 3, 0.75], [x, 1.5, z], "#1a303e");
        this.box([0.82, 2.8, 0.035], [x, 1.5, z + 0.4], "#304e5d");
        for (let row = 0; row < 9; row++) {
          this.box(
            [0.7, 0.17, 0.025],
            [x, 0.3 + row * 0.3, z + 0.43],
            "#142c3b",
          );
          this.box(
            [0.018, 0.08, 0.018],
            [x + 0.28, 0.3 + row * 0.3, z + 0.45],
            "#9bd3cf",
            true,
          );
        }
      }
    // AION's data loom: a volumetric structure, not a decorative glowing orb.
    const geometry = new T.BoxGeometry(1.35, 0.045, 0.68);
    this.resources.push(geometry);
    this.leaves = new T.InstancedMesh(geometry, this.mat("#a6c1c8"), 72);
    this.leaves.instanceMatrix.setUsage(T.DynamicDrawUsage);
    this.root.add(this.leaves);
    const baseGeometry = new T.CylinderGeometry(1.4, 1.6, 0.16, 40);
    const base = new T.Mesh(baseGeometry, this.mat("#294756"));
    base.position.set(3.5, 0.1, -5.1);
    this.root.add(base);
    this.resources.push(baseGeometry);
    for (const y of [0.3, 2.8]) {
      const g = new T.TorusGeometry(1.3, 0.024, 4, 64);
      const m = new T.Mesh(g, this.mat("#b4e2dc", true));
      m.position.set(3.5, y, -5.1);
      m.rotation.x = Math.PI / 2;
      this.root.add(m);
      this.resources.push(g);
    }
    this.label(
      "AION",
      "RESEARCH / HUMAN REVIEW",
      [2.8, 0.85],
      [-3.5, 2.9, -8.8],
    );
    // The desk keeps existing interaction coordinates and the original notebook.
    this.box([3.2, 0.14, 1.9], [0.2, 1, -0.75], "#a9b8b8");
    this.box([3.08, 0.025, 1.78], [0.2, 1.065, -0.75], "#253f50");
    this.box([2.95, 0.015, 0.018], [0.2, 0.96, 0.21], "#b8dcd6", true);
    for (const x of [-1.14, 1.54])
      this.box([0.11, 1, 0.9], [x, 0.5, -0.75], "#3c5666");
    this.box([1.46, 0.91, 0.055], [-0.5, 1.58, -1.49], "#183344");
    this.box([1, 0.035, 0.36], [-0.5, 1.12, -0.5], "#172d3a");
    for (let row = 0; row < 4; row++)
      for (let col = 0; col < 13; col++)
        this.box(
          [0.052, 0.008, 0.043],
          [-0.94 + col * 0.07, 1.143, -0.62 + row * 0.072],
          "#a2b5b5",
        );
    // Greenery and warm accent balance the cool equipment.
    this.box([0.6, 0.12, 0.6], [-0.5, 0.61, 0.42], "#294350");
    this.box([0.58, 0.78, 0.12], [-0.5, 1.04, 0.74], "#2a4857");
    this.box([0.32, 0.16, 0.12], [-0.5, 1.51, 0.79], "#46616b");
    for (const x of [-0.83, -0.17])
      this.box([0.08, 0.07, 0.4], [x, 0.87, 0.4], "#4b6570");
    this.box([0.1, 0.5, 0.1], [-0.5, 0.31, 0.42], "#607985");
    this.box([0.75, 0.08, 0.58], [-0.5, 0.06, 0.42], "#2a4554");
    for (const side of [-1, 1]) {
      this.box([0.8, 0.7, 0.8], [side * 7.6, 0.35, -8.2], "#526b70");
      for (let i = 0; i < 5; i++) {
        const g = new T.SphereGeometry(0.32, 10, 8);
        const mesh = new T.Mesh(g, this.mat(i % 2 ? "#386257" : "#567e68"));
        mesh.scale.set(0.55, 1.8, 0.65);
        mesh.rotation.z = (i - 2) * 0.32;
        mesh.position.set(
          side * 7.6 + (i - 2) * 0.13,
          0.95 + Math.abs(i - 2) * 0.1,
          -8.2,
        );
        this.root.add(mesh);
        this.resources.push(g);
      }
    }
    this.skylight.position.set(0, 4, -7);
    this.root.add(this.skylight);
    this.batch();
    this.update(0, true);
  }
  update(
    time: number,
    reduced: boolean,
    phase: RippleSave["phase"] = "record",
    dt = 0,
  ) {
    const cue = futureArrivalCue(phase, time, reduced);
    if (!reduced) this.motionTime += Math.min(dt, 0.1);
    this.skylineMaterial.color.lerpColors(
      this.skylineDusk,
      this.skylineDay,
      cue.daylight,
    );
    this.skylight.intensity = 3 + 7 * cue.daylight;
    for (const [key, material] of this.materials) {
      if (!key.endsWith("true")) continue;
      const activation =
        key.startsWith("#9bd3cf") || key.startsWith("#b4e2dc")
          ? cue.core
          : cue.architecture;
      material.emissiveIntensity = 0.06 + 0.64 * activation;
    }
    const dataMaterial = this.leaves.material as T.MeshStandardMaterial;
    dataMaterial.emissive.set("#2e6470");
    dataMaterial.emissiveIntensity = 0.08 + 0.25 * cue.core;
    for (let i = 0; i < 72; i++) {
      const row = Math.floor(i / 3),
        angle =
          ((i % 3) * Math.PI * 2) / 3 +
          row * (0.055 + 0.055 * cue.core) +
          (reduced ? 0 : this.motionTime * 0.08);
      this.dummy.position.set(
        3.5 + Math.cos(angle) * (0.35 + 0.18 * cue.core),
        0.35 + row * (0.072 + 0.026 * cue.core),
        -5.1 + Math.sin(angle) * (0.35 + 0.18 * cue.core),
      );
      this.dummy.rotation.set(0, angle, 0);
      this.dummy.updateMatrix();
      this.leaves.setMatrixAt(i, this.dummy.matrix);
    }
    this.leaves.instanceMatrix.needsUpdate = true;
  }
  private mat(color: string, emissive = false) {
    const key = color + emissive;
    let material = this.materials.get(key);
    if (!material) {
      material = new T.MeshStandardMaterial({
        color,
        roughness: 0.4,
        metalness: 0.35,
        ...(emissive ? { emissive: color, emissiveIntensity: 0.7 } : {}),
      });
      this.materials.set(key, material);
      this.resources.push(material);
    }
    return material;
  }
  private box(size: Vec, position: Vec, color: string, emissive = false) {
    const geometry = new RoundedBoxGeometry(
      ...size,
      1,
      Math.min(0.035, Math.min(...size) * 0.24),
    );
    this.resources.push(geometry);
    const mesh = new T.Mesh(geometry, this.mat(color, emissive));
    mesh.position.set(...position);
    this.root.add(mesh);
    return mesh;
  }
  private label(
    title: string,
    sub: string,
    size: [number, number],
    position: Vec,
  ) {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 320;
    const c = canvas.getContext("2d")!;
    c.fillStyle = "#153242";
    c.fillRect(0, 0, 1024, 320);
    c.fillStyle = "#dae6df";
    c.font = "64px Arial";
    c.fillText(title, 65, 142);
    c.font = "24px Arial";
    c.fillStyle = "#8fb8bd";
    c.fillText(sub, 65, 235);
    const texture = new T.CanvasTexture(canvas);
    texture.colorSpace = T.SRGBColorSpace;
    const geometry = new T.PlaneGeometry(...size),
      material = new T.MeshBasicMaterial({ map: texture });
    const mesh = new T.Mesh(geometry, material);
    mesh.position.set(...position);
    this.root.add(mesh);
    this.resources.push(texture, geometry, material);
  }
  private batch() {
    const groups = new Map<T.Material, T.Mesh[]>();
    for (const object of this.root.children)
      if (
        object instanceof T.Mesh &&
        !(object instanceof T.InstancedMesh) &&
        object.material instanceof T.MeshStandardMaterial
      ) {
        const list = groups.get(object.material) ?? [];
        list.push(object);
        groups.set(object.material, list);
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
      const geometry = mergeGeometries(geometries);
      if (geometry) {
        this.resources.push(geometry);
        for (const mesh of meshes) this.root.remove(mesh);
        this.root.add(new T.Mesh(geometry, material));
      }
      geometries.forEach((g) => g.dispose());
    }
  }
  dispose() {
    this.closed = true;
    this.leaves.dispose();
    this.resources.forEach((resource) => resource.dispose());
  }
}
