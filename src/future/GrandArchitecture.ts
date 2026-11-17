import * as T from "three";
type Vec = [number, number, number];
export interface GrandKit {
  inside: T.Group;
  exterior: T.Group;
  city: T.Group;
  mat(
    color: string,
    metalness?: number,
    roughness?: number,
    emissive?: boolean,
  ): T.MeshStandardMaterial;
  box(
    material: T.Material,
    position: Vec,
    size: Vec,
    parent?: T.Group,
    radius?: number,
    batch?: boolean,
  ): T.Mesh;
  part(
    geometry: T.BufferGeometry,
    material: T.Material,
    position: Vec,
    scale?: Vec,
    rotation?: Vec,
    parent?: T.Group,
    batch?: boolean,
  ): T.Mesh;
  label(text: string, sub: string, width: number, height: number): T.Mesh;
  arch(
    width: number,
    height: number,
    thickness: number,
    depth: number,
  ): T.BufferGeometry;
  ownMaterial(material: T.Material): void;
  ownGeometry(geometry: T.BufferGeometry): void;
}
/** Authored composition in metres: a civic campus, a deep atrium, a working Nexus.
 * Original project geometry, not a claim of purchased production environment art. */
export function buildGrandArchitecture(k: GrandKit) {
  const { inside, exterior, city } = k;
  const silver = k.mat("#a7b9c6", 0.72, 0.3),
    graphite = k.mat("#132534", 0.55, 0.38),
    dark = k.mat("#07121d", 0.25, 0.5),
    stone = k.mat("#4a6170", 0.2, 0.66),
    porcelain = k.mat("#becad1", 0.15, 0.55),
    light = k.mat("#b9e7eb", 0.1, 0.5, true),
    warm = k.mat("#c7ae83", 0.1, 0.65),
    skin = k.mat("#a69889", 0, 0.8),
    uniform = k.mat("#344d5d", 0.05, 0.8);
  const screen = new T.MeshBasicMaterial({ color: "#a7d5df" });
  k.ownMaterial(screen);
  // Thin architectural glazing needs a tint and light response, not a second
  // full PBR/IBL evaluation over every visible wall and bridge fragment.
  // Keep the reflective metal, floor and Nexus materials on the PBR path.
  const glass = new T.MeshLambertMaterial({
    color: "#42778d",
    transparent: true,
    opacity: 0.19,
    depthWrite: false,
  });
  k.ownMaterial(glass);
  const b = k.box.bind(k),
    p = k.part.bind(k);
  const floor = b(stone, [0, -0.5, -18], [96, 1, 160], inside, 0.15, false);
  floor.name = "licensed-tile-floor";
  b(dark, [0, -1.3, -30], [1100, 0.5, 1000], city);
  // Terraced plinth and two low research wings establish a horizontal campus.
  for (let tier = 0; tier < 3; tier++)
    b(
      stone,
      [0, -0.9 - tier * 0.6, -35],
      [144 + tier * 18, 0.6, 174 + tier * 12],
      exterior,
      0.3,
    );
  for (const side of [-1, 1]) {
    b(graphite, [side * 58, 16, -22], [25, 32, 90], exterior, 0.8);
    b(graphite, [side * 48, 30, -72], [22, 60, 42], exterior, 0.8);
    for (let y = 4; y <= 60; y += 6) {
      b(silver, [side * 48, y, -50.8], [22, 0.16, 0.2], exterior);
      if (y < 32) b(glass, [side * 58, y, 23.1], [23, 4.9, 0.05], exterior);
    }
    for (const y of [24, 48])
      b(silver, [side * 25, y, -66], [40, 1.4, 6], exterior, 0.2);
  }
  // Central hexagonal tower and split structural crowns: landmark silhouette.
  p(
    new T.CylinderGeometry(12, 24, 154, 6),
    graphite,
    [0, 77, -76],
    undefined,
    [0, Math.PI / 6, 0],
    exterior,
  );
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    b(
      silver,
      [Math.cos(a) * 18, 76, -76 + Math.sin(a) * 18],
      [0.55, 145, 0.55],
      exterior,
      0.1,
    );
    for (let j = 0; j < 17; j++)
      b(
        light,
        [Math.cos(a) * 18, 9 + j * 8, -76 + Math.sin(a) * 18],
        [0.65, 0.12, 0.65],
        exterior,
      );
  }
  for (const z of [-80, -72])
    p(
      k.arch(61, 169, 2.1, 1.3),
      silver,
      [0, 0, z],
      undefined,
      undefined,
      exterior,
    );
  for (const y of [36, 72, 108])
    p(
      new T.CylinderGeometry(23, 23, 0.7, 6),
      silver,
      [0, y, -76],
      undefined,
      [0, Math.PI / 6, 0],
      exterior,
    );
  const crest = k.label("AION", "CITADEL / 2046", 24, 6);
  crest.position.set(0, 37, 27.3);
  exterior.add(crest);
  // The atrium: five occupied terraces, deep glazing and suspended crosswalks.
  b(graphite, [0, 24, -94], [94, 48, 1], inside);
  for (const side of [-1, 1]) {
    b(graphite, [side * 46, 24, -25], [1, 48, 140], inside);
    for (const y of [0, 8, 16, 24, 32]) {
      b(porcelain, [side * 37, y - 0.2, -22], [16, 0.5, 124], inside, 0.12);
      b(graphite, [side * 28.8, y + 0.6, -22], [0.18, 1.2, 124]);
      b(light, [side * 28.65, y + 1.22, -22], [0.05, 0.045, 122]);
      b(glass, [side * 28.9, y + 0.65, -22], [0.06, 1.1, 124]);
      for (let z = -72; z < 34; z += 18) {
        b(silver, [side * 35, y + 1.05, z], [5, 0.12, 2.2], inside, 0.08);
        b(graphite, [side * 35, y + 1.7, z - 0.6], [2.8, 1.2, 0.12]);
        b(screen, [side * 35, y + 1.7, z - 0.52], [2.5, 0.95, 0.02]);
        // Small human scale, deliberately background silhouettes.
        p(new T.CapsuleGeometry(0.22, 0.78, 2, 6), uniform, [
          side * 35,
          y + 1.12,
          z + 1.5,
        ]);
        p(new T.SphereGeometry(0.16, 8, 6), skin, [
          side * 35,
          y + 1.8,
          z + 1.5,
        ]);
      }
    }
    for (let z = -82; z <= 40; z += 20) {
      b(silver, [side * 44, 23, z], [0.35, 46, 0.6]);
      b(light, [side * 43.8, 23, z], [0.06, 40, 0.08]);
    }
  }
  for (const [y, z] of [
    [8, 28],
    [16, 12],
    [24, -5],
    [32, -88],
  ]) {
    b(graphite, [0, y - 0.35, z], [58, 0.7, 5.5], inside, 0.1);
    for (const dz of [-2.7, 2.7]) {
      b(glass, [0, y + 0.7, z + dz], [58, 1.4, 0.06]);
      b(silver, [0, y + 1.45, z + dz], [58, 0.09, 0.08]);
    }
    for (const x of [-17, -5, 9, 20]) {
      p(new T.CapsuleGeometry(0.22, 0.8, 2, 6), uniform, [x, y + 0.78, z]);
      p(new T.SphereGeometry(0.16, 8, 6), skin, [x, y + 1.5, z]);
    }
  }
  // Sparse structural ribs, staggered gaps and a high clerestory, not a low roof.
  for (let z = -88; z <= 46; z += 22) {
    p(k.arch(90, 49, 0.5, 0.5), silver, [0, 0, z]);
    b(light, [0, 48.1, z], [48, 0.08, 0.12]);
  }
  for (const x of [-45, 45]) b(glass, [x, 24, -20], [0.06, 48, 140]);
  for (const x of [-24, -12, 12, 24]) b(silver, [x, 23, 47], [0.2, 46, 0.3]);
  b(glass, [0, 28, 47], [90, 38, 0.06]);
  for (const x of [-23, 23]) b(light, [x, 0.035, -18], [0.05, 0.03, 146]);
  const title = k.label(
    "AION NEXUS",
    "INTELLIGENCE / A CONTINUOUS FRONTIER",
    24,
    5.5,
  );
  title.position.set(0, 37, -92.9);
  inside.add(title);
  // Six vertical compute pylons. Each has service levels and a segmented bus.
  const statusMaterial = k.mat("#75b8c7", 0.1, 0.6, true),
    statuses: T.Mesh[] = [];
  const pillars: [number, number][] = [
    [-21, -52],
    [21, -52],
    [-27, -69],
    [27, -69],
    [-16, -82],
    [16, -82],
  ];
  for (const [i, [x, z]] of pillars.entries()) {
    p(new T.CylinderGeometry(2.4, 3.6, 35, 8), graphite, [x, 17.5, z]);
    for (let y = 2; y < 35; y += 4) {
      p(new T.CylinderGeometry(3.7, 3.7, 0.14, 8), silver, [x, y, z]);
      for (const dx of [-1.7, 1.7])
        b(dark, [x + dx, y + 1.6, z + 2.5], [1.5, 2.5, 0.15]);
    }
    const node = p(
      new T.CylinderGeometry(0.085, 0.085, 31, 6),
      statusMaterial,
      [x, 17, z + 3.2],
      undefined,
      undefined,
      inside,
      false,
    );
    node.userData.sequence = i;
    statuses.push(node);
  }
  // A suspended, addressable intelligence structure above a real service void.
  const nexus = new T.Group();
  nexus.position.set(0, 0, -67);
  inside.add(nexus);
  p(
    new T.CylinderGeometry(12, 14, 1.4, 64),
    dark,
    [0, 0.7, 0],
    undefined,
    undefined,
    nexus,
  );
  for (const y of [3, 17, 31]) {
    p(
      new T.TorusGeometry(12, 0.18, 6, 80),
      silver,
      [0, y, 0],
      undefined,
      [Math.PI / 2, 0, 0],
      nexus,
    );
    p(
      new T.TorusGeometry(11.6, 0.05, 4, 80),
      light,
      [0, y + 0.1, 0],
      undefined,
      [Math.PI / 2, 0, 0],
      nexus,
    );
  }
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    p(
      new T.CylinderGeometry(0.14, 0.14, 33, 6),
      silver,
      [Math.cos(a) * 12, 17, Math.sin(a) * 12],
      undefined,
      undefined,
      nexus,
    );
  }
  const leafGeometry = new T.BoxGeometry(2.5, 0.13, 2.5);
  k.ownGeometry(leafGeometry);
  const leaves = new T.InstancedMesh(leafGeometry, silver, 144);
  leaves.instanceMatrix.setUsage(T.DynamicDrawUsage);
  nexus.add(leaves);
  for (const side of [-1, 1])
    for (const y of [6, 18, 30]) {
      b(graphite, [side * 20, y, -67], [14, 0.55, 4]);
      b(light, [side * 20, y + 0.45, -65], [13, 0.06, 0.06]);
    }
  const lift = new T.Group();
  inside.add(lift);
  for (const x of [-26, 26]) {
    for (const dx of [-1.8, 1.8]) b(silver, [x + dx, 23, 30], [0.12, 46, 0.12]);
    b(graphite, [x, 0, 30], [3.8, 0.25, 3.5], lift, 0.1);
    b(glass, [x, 1.6, 30], [3.6, 3.2, 3.4], lift);
    b(light, [x, 3.3, 30], [3.8, 0.1, 3.5], lift);
  }
  // Reused GLBs remain around the actual campus; arterial roads give depth.
  for (const x of [-108, 108])
    b(graphite, [x, -0.9, -25], [13, 0.15, 700], city);
  for (const z of [-270, -135, 95, 220])
    b(graphite, [0, -0.9, z], [1000, 0.15, 12], city);
  const trafficGeometry = new T.BoxGeometry(2.7, 0.4, 0.9);
  k.ownGeometry(trafficGeometry);
  const traffic = new T.InstancedMesh(trafficGeometry, light, 34);
  city.add(traffic);
  return { screen, traffic, lift, leaves, statuses, statusMaterial, warm };
}
