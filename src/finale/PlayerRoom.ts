import * as T from "three";
import type { FinalePhase } from "./state";

export const ROOM_COLORS = {
  midnight: "#0B1422",
  steel: "#24384A",
  cyan: "#72B7C9",
  amber: "#D5A76B",
  ivory: "#F0EEE8",
} as const;
export const isPlayerRoom = (phase: FinalePhase) =>
  ["question", "paper", "letter", "review"].includes(phase);
const smooth = (n: number) => {
  const p = T.MathUtils.clamp(n, 0, 1);
  return p * p * (3 - 2 * p);
};

/** Finale-only room. Owns its resources; reuses the game's renderer and audio clock. */
export class PlayerRoom {
  readonly root = new T.Group();
  private resources: (T.BufferGeometry | T.Material | T.Texture)[] = [];
  private dust: T.Points;
  private curtain: T.Mesh;
  private screen: T.Mesh;
  private eye = new T.Vector3();
  private at = new T.Vector3();
  private corner = new T.Vector3();
  private closeEye = new T.Vector3();
  private closeTarget = new T.Vector3(0.2, 1.66, -0.72);
  private materials = new Map<string, T.MeshStandardMaterial>();
  constructor(scene: T.Scene) {
    this.root.name = "finale-player-room-v5.1";
    const box = (
      size: [number, number, number],
      pos: [number, number, number],
      color: string,
      roughness = 0.8,
    ) => {
      const g = new T.BoxGeometry(...size);
      let m = this.materials.get(color);
      if (!m) {
        m = new T.MeshStandardMaterial({ color, roughness });
        this.materials.set(color, m);
        this.resources.push(m);
      }
      const mesh = new T.Mesh(g, m);
      mesh.position.set(...pos);
      this.resources.push(g);
      this.root.add(mesh);
      return mesh;
    };
    const c = ROOM_COLORS;
    box([9, 0.12, 9], [0, -0.08, 0], c.midnight);
    box([9, 4, 0.12], [0, 1.9, -2.4], c.steel);
    box([0.12, 4, 7], [3.5, 1.9, 0], c.midnight);
    // Architectural recess, not a decorative glass panel.
    box([2.65, 2.4, 0.09], [-2, 2, -2.3], "#111e2b");
    const sky = document.createElement("canvas");
    sky.width = 64;
    sky.height = 256;
    const x = sky.getContext("2d")!;
    const gradient = x.createLinearGradient(0, 0, 0, 256);
    gradient.addColorStop(0, "#48677a");
    gradient.addColorStop(0.65, "#abb5b2");
    gradient.addColorStop(1, c.amber);
    x.fillStyle = gradient;
    x.fillRect(0, 0, 64, 256);
    const texture = new T.CanvasTexture(sky);
    texture.colorSpace = T.SRGBColorSpace;
    const glass = new T.MeshBasicMaterial({ map: texture });
    const plane = new T.PlaneGeometry(2.45, 2.2);
    const window = new T.Mesh(plane, glass);
    window.position.set(-2, 2, -2.22);
    this.root.add(window);
    this.resources.push(texture, glass, plane);
    for (const px of [-3.23, -2, -0.77])
      box([0.045, 2.25, 0.07], [px, 2, -2.16], "#152433");
    box([2.6, 0.08, 0.3], [-2, 0.88, -2.13], c.steel);
    box([2.45, 0.04, 0.07], [-2, 2, -2.15], c.steel);
    for (let i = 0; i < 8; i++)
      box(
        [0.19, 0.2 + (i % 3) * 0.12, 0.03],
        [-3 + i * 0.28, 1, -2.19],
        "#647980",
      );
    this.curtain = box([0.32, 2.4, 0.035], [-3.36, 2, -2.05], "#4f626b");
    // Working desk: visible edges, supports, keyboard, cable, notebook and everyday objects.
    box([3.5, 0.12, 1.65], [0, 0.77, -0.3], "#554c43");
    box([3.48, 0.025, 1.63], [0, 0.84, -0.3], "#796b57");
    for (const px of [-1.5, 1.5])
      box([0.065, 0.76, 1.35], [px, 0.38, -0.3], "#182733");
    box([1.9, 0.015, 0.75], [0.15, 0.865, -0.2], "#1b2b38");
    box([0.65, 0.04, 0.34], [0.2, 0.9, -0.68], c.midnight);
    box([0.08, 0.3, 0.08], [0.2, 1.04, -0.72], c.steel);
    box([1.62, 1.02, 0.09], [0.2, 1.66, -0.77], "#101a26");
    const display = document.createElement("canvas");
    display.width = 1024;
    display.height = 640;
    const d = display.getContext("2d")!;
    d.fillStyle = c.midnight;
    d.fillRect(0, 0, 1024, 640);
    d.fillStyle = c.cyan;
    d.fillRect(90, 118, 44, 3);
    d.font = "20px Arial";
    d.fillText("THE UNWRITTEN LESSON", 90, 92);
    d.fillStyle = c.ivory;
    d.font = "44px Arial";
    d.fillText("Một lời chưa nói.", 90, 265);
    d.fillStyle = "#a6b4bd";
    d.font = "23px Arial";
    d.fillText("Dành một khoảnh khắc cho người đã ở lại.", 90, 322);
    d.strokeStyle = c.steel;
    d.strokeRect(90, 425, 844, 105);
    d.fillStyle = c.cyan;
    d.font = "25px Arial";
    d.fillText("Chạm để bắt đầu", 365, 487);
    const displayTexture = new T.CanvasTexture(display);
    displayTexture.colorSpace = T.SRGBColorSpace;
    const displayMat = new T.MeshBasicMaterial({ map: displayTexture });
    const displayGeo = new T.PlaneGeometry(1.5, 0.9);
    this.screen = new T.Mesh(displayGeo, displayMat);
    this.screen.position.set(0.2, 1.66, -0.718);
    this.root.add(this.screen);
    this.resources.push(displayTexture, displayMat, displayGeo);
    box([1.06, 0.045, 0.35], [0.2, 0.9, 0.12], "#344552");
    // Instancing keeps individual keys inexpensive.
    const keyGeo = new T.BoxGeometry(0.057, 0.018, 0.05),
      keyMat = new T.MeshStandardMaterial({ color: "#849098", roughness: 0.8 });
    const keys = new T.InstancedMesh(keyGeo, keyMat, 56),
      matrix = new T.Matrix4();
    for (let i = 0; i < 56; i++) {
      matrix.makeTranslation(
        -0.26 + (i % 14) * 0.07,
        0.932,
        0.015 + Math.floor(i / 14) * 0.075,
      );
      keys.setMatrixAt(i, matrix);
    }
    this.root.add(keys);
    this.resources.push(keyGeo, keyMat);
    box([0.17, 0.055, 0.25], [0.96, 0.91, 0.12], c.steel);
    const notebook = box([0.49, 0.06, 0.64], [-1.03, 0.91, 0.08], "#2e4857");
    notebook.rotation.y = -0.16;
    const pages = box([0.46, 0.027, 0.6], [-1.03, 0.935, 0.08], "#cdc8b6");
    pages.rotation.y = -0.16;
    box([0.025, 0.025, 0.48], [-0.69, 0.945, 0.04], c.amber).rotation.y = -0.22;
    const mugGeo = new T.CylinderGeometry(0.105, 0.085, 0.22, 24);
    const mugMat = new T.MeshStandardMaterial({
      color: "#86918e",
      roughness: 0.9,
    });
    const mug = new T.Mesh(mugGeo, mugMat);
    mug.position.set(1.25, 0.96, -0.48);
    this.root.add(mug);
    const coffeeGeo = new T.CircleGeometry(0.087, 24),
      coffeeMat = new T.MeshBasicMaterial({ color: "#302923" });
    const coffee = new T.Mesh(coffeeGeo, coffeeMat);
    coffee.rotation.x = -Math.PI / 2;
    coffee.position.set(1.25, 1.073, -0.48);
    this.root.add(coffee);
    this.resources.push(mugGeo, mugMat, coffeeGeo, coffeeMat);
    box([0.9, 0.04, 0.25], [1.9, 1.83, -2.2], "#58616a");
    for (let i = 0; i < 5; i++)
      box(
        [0.1, 0.28 + (i % 2) * 0.07, 0.18],
        [1.6 + i * 0.12, 2, -2.2],
        i % 2 ? "#586c78" : "#aa9b82",
      );
    const ambient = new T.HemisphereLight("#9fbaca", "#292019", 2.1);
    this.root.add(ambient);
    const sunlight = new T.DirectionalLight(c.amber, 3.2);
    sunlight.position.set(-3, 4, 2);
    this.root.add(sunlight);
    const screenLight = new T.PointLight(c.cyan, 1.8, 3, 2);
    screenLight.position.set(0.2, 1.5, -0.4);
    this.root.add(screenLight);
    // A soft projected shaft across the wall/desk, with no bloom/postprocess dependency.
    const shaftGeo = new T.PlaneGeometry(2.3, 1.35),
      shaftMat = new T.MeshBasicMaterial({
        color: c.amber,
        transparent: true,
        opacity: 0.07,
        depthWrite: false,
        side: T.DoubleSide,
      });
    const shaft = new T.Mesh(shaftGeo, shaftMat);
    shaft.rotation.x = -Math.PI / 2;
    shaft.rotation.z = -0.48;
    shaft.position.set(-0.7, 0.862, -0.2);
    this.root.add(shaft);
    this.resources.push(shaftGeo, shaftMat);
    const dustGeo = new T.BufferGeometry(),
      positions = new Float32Array(48 * 3);
    for (let i = 0; i < 48; i++) {
      positions[i * 3] = -2.8 + ((i * 37) % 101) / 30;
      positions[i * 3 + 1] = 1 + ((i * 19) % 97) / 65;
      positions[i * 3 + 2] = -1.8 + ((i * 13) % 89) / 50;
    }
    dustGeo.setAttribute("position", new T.BufferAttribute(positions, 3));
    const dustMat = new T.PointsMaterial({
      color: c.ivory,
      size: 0.009,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    });
    this.dust = new T.Points(dustGeo, dustMat);
    this.root.add(this.dust);
    this.resources.push(dustGeo, dustMat);
    scene.add(this.root);
    this.root.visible = false;
  }
  update(
    phase: FinalePhase,
    t: number,
    reduced: boolean,
    camera: T.PerspectiveCamera,
  ) {
    this.root.visible = isPlayerRoom(phase);
    if (!this.root.visible) return;
    const close = phase === "letter" || phase === "review";
    const q = close ? (reduced || phase === "review" ? 1 : smooth(t / 1.8)) : 0;
    const portrait = camera.aspect < 0.8;
    this.screen.visible = !close;
    this.eye
      .set(0.2, 1.58, portrait ? 5.6 : 2.15)
      .lerp(this.closeEye.set(0.2, 1.66, portrait ? 1.65 : 0.8), q);
    this.at.set(0.2, 1.38, -0.72).lerp(this.closeTarget, q);
    if (phase === "question" && !reduced)
      this.eye.z += 0.35 * (1 - smooth(t / 5));
    camera.position.copy(this.eye);
    camera.lookAt(this.at);
    camera.fov = 44;
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    this.dust.position.y = reduced ? 0 : Math.sin(t * 0.15) * 0.045;
    this.curtain.rotation.y = reduced ? 0 : Math.sin(t * 0.35) * 0.035;
    // Project the actual monitor plane into the native accessible interaction target.
    const button = document.querySelector<HTMLElement>(".player-room-monitor");
    if (button) {
      this.corner.set(-0.55, 2.11, -0.718).project(camera);
      const left = (this.corner.x + 1) * 50,
        top = (1 - this.corner.y) * 50;
      this.corner.set(0.95, 1.21, -0.718).project(camera);
      button.style.left = `${left}%`;
      button.style.top = `${top}%`;
      button.style.width = `${(this.corner.x + 1) * 50 - left}%`;
      button.style.height = `${(1 - this.corner.y) * 50 - top}%`;
    }
  }
  dispose() {
    this.root.removeFromParent();
    this.resources.forEach((r) => r.dispose());
  }
}
