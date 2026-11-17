import * as T from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import type { NarrativePalette } from "./NarrativePalette";

export interface NarrativeRig {
  root: T.Group;
  body: T.Group;
  head: T.Group;
  arms: T.Group[];
  legs: T.Group[];
  shins: T.Group[];
  hero?: boolean;
  teacher?: boolean;
}
type XYZ = [number, number, number];
interface ActorDetail {
  forearms: T.Group[];
  face: T.MeshToonMaterial;
  expressions: T.Texture[];
}

/** Procedural classroom characters with painted faces and two-bone arms.
 * These remain placeholder character assets, not externally authored models. */
export class NarrativeActors {
  private geometry: T.BufferGeometry[] = [];
  private textures: T.Texture[] = [];
  private materials = new Set<T.Material>();
  private colors = new Map<string, T.MeshToonMaterial>();
  private actors = new WeakMap<T.Group, ActorDetail>();
  private ramp: T.DataTexture;
  private skinRamp: T.DataTexture;
  private outline: T.MeshBasicMaterial;
  private contact: T.MeshBasicMaterial;
  constructor(private palette: NarrativePalette) {
    this.ramp = new T.DataTexture(
      new Uint8Array([
        88, 88, 88, 255, 166, 166, 166, 255, 225, 225, 225, 255, 255, 255, 255,
        255,
      ]),
      4,
      1,
    );
    this.ramp.magFilter = this.ramp.minFilter = T.NearestFilter;
    this.ramp.generateMipmaps = false;
    this.ramp.needsUpdate = true;
    this.textures.push(this.ramp);
    // Smooth skin values retain the stylized silhouette without four abrupt
    // shading bands crossing the eyes and cheeks. Clothing keeps its old ramp.
    this.skinRamp = new T.DataTexture(
      new Uint8Array([
        96, 96, 96, 255, 128, 128, 128, 255, 159, 159, 159, 255, 186, 186, 186,
        255, 210, 210, 210, 255, 230, 230, 230, 255, 245, 245, 245, 255, 255,
        255, 255, 255,
      ]),
      8,
      1,
    );
    this.skinRamp.magFilter = this.skinRamp.minFilter = T.LinearFilter;
    this.skinRamp.generateMipmaps = false;
    this.skinRamp.needsUpdate = true;
    this.textures.push(this.skinRamp);
    this.outline = new T.MeshBasicMaterial({
      color: palette.ink,
      side: T.BackSide,
      depthWrite: false,
    });
    this.materials.add(this.outline);
    const shadowCanvas = document.createElement("canvas");
    shadowCanvas.width = shadowCanvas.height = 128;
    const shadow = shadowCanvas.getContext("2d")!,
      fade = shadow.createRadialGradient(64, 64, 5, 64, 64, 62);
    fade.addColorStop(0, "#00000070");
    fade.addColorStop(0.6, "#00000025");
    fade.addColorStop(1, "#00000000");
    shadow.fillStyle = fade;
    shadow.fillRect(0, 0, 128, 128);
    const contactTexture = new T.CanvasTexture(shadowCanvas);
    this.textures.push(contactTexture);
    this.contact = new T.MeshBasicMaterial({
      map: contactTexture,
      color: palette.ink,
      transparent: true,
      depthWrite: false,
      toneMapped: false,
    });
    this.materials.add(this.contact);
  }
  private material(color: string) {
    let material = this.colors.get(color);
    if (!material) {
      material = new T.MeshToonMaterial({ color, gradientMap: this.ramp });
      this.colors.set(color, material);
      this.materials.add(material);
    }
    return material;
  }
  private mesh(
    parent: T.Object3D,
    geometry: T.BufferGeometry,
    material: T.Material,
    position: XYZ,
    scale?: XYZ,
    ink = false,
  ) {
    this.geometry.push(geometry);
    const mesh = new T.Mesh(geometry, material);
    mesh.position.set(...position);
    if (scale) mesh.scale.set(...scale);
    mesh.castShadow = true;
    mesh.receiveShadow = false;
    parent.add(mesh);
    if (ink) {
      const edge = new T.Mesh(geometry, this.outline);
      edge.position.copy(mesh.position);
      edge.scale.copy(mesh.scale).multiplyScalar(1.035);
      parent.add(edge);
    }
    return mesh;
  }
  private sphere(
    parent: T.Object3D,
    radius: number,
    position: XYZ,
    color: string,
    scale: XYZ = [1, 1, 1],
  ) {
    return this.mesh(
      parent,
      new T.SphereGeometry(radius, 32, 24),
      this.material(color),
      position,
      scale,
    );
  }
  private box(
    parent: T.Object3D,
    size: XYZ,
    position: XYZ,
    color: string,
    radius = 0.012,
  ) {
    return this.mesh(
      parent,
      new RoundedBoxGeometry(
        ...size,
        3,
        Math.min(radius, Math.min(...size) * 0.45),
      ),
      this.material(color),
      position,
    );
  }
  private capsule(
    parent: T.Object3D,
    radius: number,
    total: number,
    position: XYZ,
    color: string,
    scale?: XYZ,
  ) {
    return this.mesh(
      parent,
      new T.CapsuleGeometry(radius, Math.max(0.01, total - 2 * radius), 6, 20),
      this.material(color),
      position,
      scale,
    );
  }
  private panel(
    parent: T.Object3D,
    points: [number, number][],
    z: number,
    color: string,
  ) {
    const shape = new T.Shape();
    shape.moveTo(...points[0]);
    points.slice(1).forEach((point) => shape.lineTo(...point));
    shape.closePath();
    return this.mesh(
      parent,
      new T.ExtrudeGeometry(shape, {
        depth: 0.012,
        bevelEnabled: true,
        bevelSize: 0.005,
        bevelThickness: 0.004,
        bevelSegments: 1,
        steps: 1,
      }),
      this.material(color),
      [0, 0, z],
    );
  }
  private torso() {
    const rings = [
      [0, 0.155, 0.104],
      [0.08, 0.175, 0.113],
      [0.24, 0.19, 0.119],
      [0.4, 0.224, 0.109],
      [0.47, 0.2, 0.09],
      [0.51, 0.09, 0.07],
    ];
    const positions: number[] = [],
      uvs: number[] = [],
      indices: number[] = [];
    for (let j = 0; j < rings.length; j++)
      for (let i = 0; i <= 20; i++) {
        const theta = (i / 20) * Math.PI * 2,
          [y, width, depth] = rings[j];
        positions.push(Math.sin(theta) * width, y, Math.cos(theta) * depth);
        uvs.push(i / 20, j / (rings.length - 1));
        if (j < rings.length - 1 && i < 20) {
          const a = j * 21 + i,
            b = a + 21;
          indices.push(a, a + 1, b, b, a + 1, b + 1);
        }
      }
    const bottom = positions.length / 3;
    positions.push(0, 0, 0);
    uvs.push(0.5, 0);
    const top = positions.length / 3;
    positions.push(0, 0.51, 0);
    uvs.push(0.5, 1);
    for (let i = 0; i < 20; i++) {
      indices.push(bottom, i + 1, i);
      const a = (rings.length - 1) * 21 + i;
      indices.push(top, a, a + 1);
    }
    const geometry = new T.BufferGeometry();
    geometry.setAttribute(
      "position",
      new T.Float32BufferAttribute(positions, 3),
    );
    geometry.setAttribute("uv", new T.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
  }
  private hair(parent: T.Object3D, teacher: boolean) {
    // A continuous sculpted shell follows the skull; the asymmetric front edge is the fringe.
    // No projected polygon chords through the face, and no intersecting mannequin hair caps.
    const positions: number[] = [],
      uvs: number[] = [],
      indices: number[] = [],
      columns = 64,
      rows = 22;
    for (let j = 0; j <= rows; j++)
      for (let i = 0; i <= columns; i++) {
        const angle = (i / columns) * Math.PI * 2,
          front = Math.max(0, Math.cos(angle));
        const fringe = teacher
          ? 0.105 + 0.012 * Math.sin(angle * 2 + 0.4)
          : 0.11 + 0.018 * Math.sin(angle * 2 - 0.45);
        const line = -0.075 + (fringe + 0.075) * front ** 1.1;
        const polar = (j / rows) * Math.acos(line / 0.194),
          y = Math.cos(polar) * 0.194;
        const jaw = T.MathUtils.smoothstep(y / 1.1, -0.167, -0.015);
        const radius =
          0.177 +
          (teacher ? 0 : 0.006 * Math.sin(angle * 3 + 0.4)) * Math.sin(polar);
        positions.push(
          Math.sin(angle) * Math.sin(polar) * radius * (0.7 + 0.18 * jaw),
          y,
          Math.cos(angle) * Math.sin(polar) * radius * (0.9 + 0.03 * jaw),
        );
        uvs.push(i / columns, j / rows);
        if (j < rows && i < columns) {
          const a = j * (columns + 1) + i,
            b = a + columns + 1;
          indices.push(a, b, a + 1, b, b + 1, a + 1);
        }
      }
    const geometry = new T.BufferGeometry();
    geometry.setAttribute(
      "position",
      new T.Float32BufferAttribute(positions, 3),
    );
    geometry.setAttribute("uv", new T.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    this.mesh(parent, geometry, this.material(this.palette.ink), [0, 0, 0]);
  }
  private faceTexture(teacher: boolean, expression: number) {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 256;
    const c = canvas.getContext("2d")!;
    c.fillStyle = this.palette.skin;
    c.fillRect(0, 0, 512, 256);
    // The face is painted into the sphere UV, not a floating eye/face billboard.
    const shade = c.createLinearGradient(65, 0, 193, 0);
    shade.addColorStop(0, "#8f676632");
    shade.addColorStop(0.48, "#f8d5a900");
    shade.addColorStop(1, "#905e5433");
    c.fillStyle = shade;
    c.fillRect(64, 67, 130, 130);
    const blush = (x: number) => {
      const g = c.createRadialGradient(x, 135, 1, x, 135, 13);
      g.addColorStop(0, "#ca6f6842");
      g.addColorStop(1, "#ca6f6800");
      c.fillStyle = g;
      c.fillRect(x - 14, 120, 28, 30);
    };
    blush(104);
    blush(152);
    c.strokeStyle = "#533d40";
    c.lineCap = "round";
    for (const side of [-1, 1]) {
      const x = 128 + side * 19,
        y = teacher ? 113 : 115;
      if (expression === 1) {
        c.lineWidth = 1.7;
        c.beginPath();
        c.moveTo(x - 7, y);
        c.quadraticCurveTo(x, y + 4, x + 7, y);
        c.stroke();
      } else {
        c.fillStyle = "#ece4cb";
        c.beginPath();
        c.moveTo(x - 10, y);
        c.quadraticCurveTo(x, y - (expression === 3 ? 2.5 : 7), x + 10, y);
        c.quadraticCurveTo(x, y + (expression === 3 ? 2 : 6), x - 10, y);
        c.fill();
        c.fillStyle = "#293b48";
        c.beginPath();
        c.ellipse(
          x - side * 0.7,
          y + 0.1,
          3.8,
          expression === 3 ? 1.8 : 4.5,
          0,
          0,
          Math.PI * 2,
        );
        c.fill();
        c.fillStyle = "#f7e8c8";
        c.beginPath();
        c.arc(x - 1.5, y - 1.1, 0.9, 0, Math.PI * 2);
        c.fill();
        c.lineWidth = 1.5;
        c.strokeStyle = "#513d40";
        c.beginPath();
        c.moveTo(x - 10, y);
        c.quadraticCurveTo(x, y - (expression === 3 ? 2.5 : 7), x + 10, y);
        c.stroke();
      }
      c.strokeStyle = "#35424a";
      c.lineWidth = teacher ? 2 : 2.4;
      c.beginPath();
      c.moveTo(x - 7, 101 + (teacher ? 0 : side));
      c.quadraticCurveTo(
        x,
        teacher ? 97 : 100,
        x + 7,
        102 - (teacher ? 0 : side),
      );
      c.stroke();
      if (!teacher) {
        c.strokeStyle = "#a77c6960";
        c.lineWidth = 0.8;
        c.beginPath();
        c.moveTo(x - 6, 122);
        c.quadraticCurveTo(x, 125, x + 6, 122);
        c.stroke();
      }
    }
    c.strokeStyle = "#a46e59";
    c.lineWidth = 1.1;
    c.beginPath();
    c.moveTo(128, 121);
    c.quadraticCurveTo(124, 133, 130, 134);
    c.stroke();
    c.strokeStyle = "#80514e";
    c.lineWidth = 1.4;
    c.beginPath();
    c.moveTo(120, 145);
    c.quadraticCurveTo(
      128,
      expression === 2 ? 149 : teacher ? 146.5 : 143,
      136,
      145,
    );
    c.stroke();
    c.strokeStyle = "#bd886a65";
    c.lineWidth = 0.8;
    c.beginPath();
    c.moveTo(123, 151);
    c.quadraticCurveTo(128, 153, 133, 151);
    c.stroke();
    const texture = new T.CanvasTexture(canvas);
    texture.colorSpace = T.SRGBColorSpace;
    texture.anisotropy = 4;
    this.textures.push(texture);
    return texture;
  }
  create(teacher: boolean): NarrativeRig {
    const p = this.palette,
      root = new T.Group(),
      body = new T.Group(),
      head = new T.Group();
    root.add(body);
    body.position.y = 0.88;
    head.position.set(0, 0.74, 0);
    body.add(head);
    const shirt = teacher ? p.van : p.an,
      trouser = p.trousers;
    this.mesh(
      body,
      this.torso(),
      this.material(shirt),
      [0, 0.015, 0],
      undefined,
      true,
    );
    this.capsule(body, 0.054, 0.14, [0, 0.565, 0], p.skin);
    this.panel(
      body,
      [
        [-0.075, 0.48],
        [0.075, 0.48],
        [0.087, 0.13],
        [-0.085, 0.13],
      ],
      0.12,
      p.paper,
    );
    for (const side of [-1, 1]) {
      this.panel(
        body,
        [
          [side * 0.04, 0.49],
          [side * 0.12, 0.48],
          [side * 0.075, 0.34],
          [side * 0.018, 0.43],
        ],
        0.13,
        teacher ? "#dfbc7c" : "#668ca2",
      );
      this.box(
        body,
        [0.009, 0.24, 0.008],
        [side * 0.108, 0.215, 0.122],
        teacher ? "#a77942" : "#31556b",
        0.003,
      );
    }
    if (teacher)
      this.sphere(body, 0.015, [0.02, 0.415, 0.15], "#568a8c", [1, 1, 0.3]);
    else {
      this.box(
        body,
        [0.1, 0.08, 0.01],
        [-0.115, 0.335, 0.125],
        "#537b94",
        0.008,
      );
      this.box(
        body,
        [0.1, 0.007, 0.012],
        [-0.115, 0.37, 0.135],
        "#7e9da9",
        0.003,
      );
    }
    const headGeometry = new T.SphereGeometry(0.167, 48, 36),
      vertices = headGeometry.getAttribute("position");
    for (let i = 0; i < vertices.count; i++) {
      const x = vertices.getX(i),
        y = vertices.getY(i),
        z = vertices.getZ(i),
        jaw = T.MathUtils.smoothstep(y, -0.167, -0.015);
      vertices.setXYZ(
        i,
        x * (0.7 + 0.18 * jaw),
        y * 1.1,
        z * (0.9 + 0.03 * jaw),
      );
    }
    headGeometry.computeVertexNormals();
    const expressions = [0, 1, 2, 3].map((expression) =>
      this.faceTexture(teacher, expression),
    );
    const face = new T.MeshToonMaterial({
      map: expressions[0],
      gradientMap: this.skinRamp,
    });
    this.materials.add(face);
    this.mesh(head, headGeometry, face, [0, 0, 0], undefined, true);
    for (const side of [-1, 1])
      this.sphere(
        head,
        0.031,
        [side * 0.139, -0.009, -0.005],
        p.skin,
        [0.48, 1, 0.73],
      );
    // Sculpted hair silhouette and swept fringe; no hemispherical mannequin cap.
    this.hair(head, teacher);
    if (teacher) {
      this.sphere(head, 0.067, [0.025, -0.006, -0.178], p.ink, [1, 0.9, 0.8]);
    }
    this.sphere(head, 0.02, [0, -0.008, 0.15], p.skin, [0.6, 0.9, 1.1]);
    const arms: T.Group[] = [],
      forearms: T.Group[] = [],
      legs: T.Group[] = [],
      shins: T.Group[] = [];
    for (const side of [-1, 1]) {
      const arm = new T.Group();
      arm.position.set(side * 0.235, 0.455, 0);
      body.add(arm);
      arms.push(arm);
      this.capsule(arm, 0.075, 0.31, [0, -0.145, 0], shirt, [1, 1, 0.9]);
      this.sphere(arm, 0.068, [0, -0.265, 0], shirt, [1, 0.9, 0.9]);
      const fore = new T.Group();
      fore.position.y = -0.28;
      arm.add(fore);
      forearms.push(fore);
      this.capsule(
        fore,
        teacher ? 0.057 : 0.046,
        0.27,
        [0, -0.125, 0],
        teacher ? shirt : p.skin,
        [1, 1, 0.85],
      );
      this.box(
        fore,
        [0.12, 0.036, 0.1],
        [0, -0.012, 0],
        teacher ? "#dfbc7c" : "#7999a9",
        0.014,
      );
      this.sphere(fore, 0.057, [0, -0.285, 0.008], p.skin, [0.73, 1.0, 0.52]);
      this.sphere(
        fore,
        0.027,
        [-side * 0.032, -0.27, 0.023],
        p.skin,
        [0.8, 1, 0.75],
      );
      const leg = new T.Group();
      leg.position.set(side * 0.1, 0, 0);
      body.add(leg);
      legs.push(leg);
      this.capsule(leg, 0.088, 0.43, [0, -0.19, 0], trouser, [1, 1, 0.91]);
      const shin = new T.Group();
      shin.position.y = -0.4;
      leg.add(shin);
      shins.push(shin);
      this.capsule(shin, 0.069, 0.4, [0, -0.19, 0], trouser, [1, 1, 0.9]);
      this.box(shin, [0.148, 0.073, 0.255], [0, -0.397, 0.05], p.ink, 0.025);
      this.box(
        shin,
        [0.153, 0.024, 0.265],
        [0, -0.4305, 0.05],
        teacher ? "#8b806f" : "#c4c9bf",
        0.01,
      );
      if (!teacher)
        for (let i = 0; i < 3; i++)
          this.box(
            shin,
            [0.068, 0.005, 0.009],
            [0, -0.358, 0.086 + i * 0.025],
            p.paper,
            0.002,
          );
    }
    root.rotation.y = Math.PI;
    const contactGeometry = new T.PlaneGeometry(0.85, 0.9);
    this.geometry.push(contactGeometry);
    const contact = new T.Mesh(contactGeometry, this.contact);
    contact.rotation.x = -Math.PI / 2;
    contact.position.set(0, 0.006, 0.18);
    root.add(contact);
    const rig = { root, body, head, arms, legs, shins, hero: true, teacher };
    this.actors.set(root, { forearms, face, expressions });
    this.batchRig(rig, forearms);
    return rig;
  }
  private batchRig(rig: NarrativeRig, forearms: T.Group[]) {
    const joints = [
        rig.root,
        rig.body,
        rig.head,
        ...rig.arms,
        ...forearms,
        ...rig.legs,
        ...rig.shins,
      ],
      jointSet = new Set<T.Object3D>(joints);
    rig.root.updateMatrixWorld(true);
    for (const joint of joints) {
      const groups = new Map<T.Material, T.Mesh[]>();
      joint.traverse((object) => {
        if (!(object instanceof T.Mesh) || Array.isArray(object.material))
          return;
        let owner: T.Object3D | null = object.parent;
        while (owner && !jointSet.has(owner)) owner = owner.parent;
        if (owner !== joint) return;
        const list = groups.get(object.material) ?? [];
        list.push(object);
        groups.set(object.material, list);
      });
      const inverse = joint.matrixWorld.clone().invert();
      for (const [material, meshes] of groups) {
        if (meshes.length < 2) continue;
        const copies = meshes.map((mesh) =>
          (mesh.geometry.index
            ? mesh.geometry.toNonIndexed()
            : mesh.geometry.clone()
          ).applyMatrix4(inverse.clone().multiply(mesh.matrixWorld)),
        );
        const merged = mergeGeometries(copies);
        copies.forEach((copy) => copy.dispose());
        if (!merged) continue;
        this.geometry.push(merged);
        const mesh = new T.Mesh(merged, material);
        mesh.castShadow = material !== this.outline;
        mesh.receiveShadow = false;
        joint.add(mesh);
        meshes.forEach((old) => old.removeFromParent());
      }
    }
  }
  relax(rig: NarrativeRig) {
    const detail = this.actors.get(rig.root);
    if (!detail) return;
    rig.arms.forEach((arm, i) =>
      arm.rotation.set(
        rig.teacher
          ? rig.body.position.y < 0.7
            ? -0.75
            : -0.25
          : i === 0
            ? -0.85
            : -1.45,
        0,
        (i === 0 ? 1 : -1) * 0.06,
      ),
    );
    detail.forearms.forEach((fore) => fore.rotation.set(-0.18, 0, 0));
  }
  reach(rig: NarrativeRig, index: number, target: T.Vector3) {
    const detail = this.actors.get(rig.root);
    if (!detail) return;
    rig.body.updateWorldMatrix(true, true);
    const arm = rig.arms[index],
      fore = detail.forearms[index],
      to = rig.body.worldToLocal(target.clone()).sub(arm.position);
    const l1 = 0.28,
      l2 = 0.285,
      d = T.MathUtils.clamp(to.length(), 0.05, l1 + l2 - 0.006),
      direction = to.normalize();
    const pole = new T.Vector3(index === 0 ? -0.7 : 0.7, -1, 0.12);
    pole.addScaledVector(direction, -pole.dot(direction)).normalize();
    const cosine = T.MathUtils.clamp(
      (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d),
      -1,
      1,
    );
    const elbow = direction
      .clone()
      .multiplyScalar(l1 * cosine)
      .addScaledVector(pole, l1 * Math.sqrt(1 - cosine * cosine));
    arm.quaternion.setFromUnitVectors(
      new T.Vector3(0, -1, 0),
      elbow.clone().normalize(),
    );
    const lower = direction
      .multiplyScalar(d)
      .sub(elbow)
      .normalize()
      .applyQuaternion(arm.quaternion.clone().invert());
    fore.quaternion.setFromUnitVectors(new T.Vector3(0, -1, 0), lower);
  }
  expression(
    rig: NarrativeRig,
    elapsed: number,
    reduced: boolean,
    relieved = false,
  ) {
    const detail = this.actors.get(rig.root);
    if (!detail) return;
    const blink = elapsed % (rig.teacher ? 6.8 : 5.4);
    const eyelid =
      !reduced && blink < 0.18
        ? blink > 0.045 && blink < 0.115
          ? 1
          : 3
        : relieved
          ? 2
          : 0;
    const texture = detail.expressions[eyelid];
    if (detail.face.map !== texture) {
      detail.face.map = texture;
      detail.face.needsUpdate = true;
    }
  }
  handWorld(rig: NarrativeRig, index: number) {
    return (
      this.actors
        .get(rig.root)
        ?.forearms[index].localToWorld(new T.Vector3(0, -0.285, 0.008))
        .toArray() ?? []
    );
  }
  dispose() {
    this.geometry.forEach((geometry) => geometry.dispose());
    this.textures.forEach((texture) => texture.dispose());
    this.materials.forEach((material) => material.dispose());
  }
}
