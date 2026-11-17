import * as T from "three";

/** Authored research props for the 2029 beat; owns every GPU resource it creates. */
export class ResearchDesk2029 {
  readonly root = new T.Group();
  private resources: { dispose(): void }[] = [];
  constructor() {
    const wood = document.createElement("canvas");
    wood.width = 512;
    wood.height = 256;
    const c = wood.getContext("2d")!;
    c.fillStyle = "#684933";
    c.fillRect(0, 0, 512, 256);
    for (let y = 0; y < 256; y += 3) {
      c.strokeStyle = `rgba(29,17,12,${0.05 + (y % 11) * 0.008})`;
      c.beginPath();
      for (let x = 0; x <= 512; x += 16) {
        const yy = y + Math.sin(x * 0.015 + y) * 1.6;
        if (x === 0) c.moveTo(x, yy);
        else c.lineTo(x, yy);
      }
      c.stroke();
    }
    const map = new T.CanvasTexture(wood);
    map.colorSpace = T.SRGBColorSpace;
    this.resources.push(map);
    const top = this.box([3.1, 0.12, 1.8], [0.2, 1, -0.75], "#bca586");
    (top.material as T.MeshStandardMaterial).map = map;
    for (const x of [-1.1, 1.5])
      for (const z of [-1.4, -0.1])
        this.box([0.065, 1, 0.065], [x, 0.5, z], "#253237");
    // Laptop: restrained status text, full keyboard deck and a bevelled bezel.
    this.box([1.12, 0.045, 0.7], [-0.5, 1.1, -1.02], "#263237");
    const bezel = this.box([1.44, 0.9, 0.045], [-0.5, 1.58, -1.49], "#162126");
    bezel.rotation.x = -0.1;
    for (let row = 0; row < 4; row++)
      for (let col = 0; col < 12; col++)
        this.box(
          [0.065, 0.012, 0.065],
          [-0.96 + col * 0.083, 1.131, -1.23 + row * 0.08],
          "#526069",
        );
    this.box([0.3, 0.006, 0.13], [-0.5, 1.131, -0.83], "#3d4b52");
    // Open notebook, cloth cover, page edges and the visible gutter.
    this.box([1.05, 0.045, 0.76], [0.74, 1.095, -0.45], "#263c3b");
    this.box([1.01, 0.025, 0.72], [0.74, 1.128, -0.45], "#c4b99f");
    const page = document.createElement("canvas");
    page.width = 1024;
    page.height = 768;
    const p = page.getContext("2d")!;
    p.fillStyle = "#e5dcc4";
    p.fillRect(0, 0, 1024, 768);
    const shade = p.createLinearGradient(0, 0, 1024, 0);
    shade.addColorStop(0, "#ffffff00");
    shade.addColorStop(0.47, "#ffffff00");
    shade.addColorStop(0.5, "#4b371b44");
    shade.addColorStop(0.53, "#ffffff00");
    shade.addColorStop(1, "#ffffff00");
    p.fillStyle = shade;
    p.fillRect(0, 0, 1024, 768);
    p.strokeStyle = "#61756b35";
    for (let y = 180; y < 700; y += 48) {
      p.beginPath();
      p.moveTo(45, y);
      p.lineTo(470, y);
      p.moveTo(555, y);
      p.lineTo(980, y);
      p.stroke();
    }
    p.fillStyle = "#384b48";
    p.font = "26px Arial";
    p.fillText("AN / NHẬT KÝ THỬ NGHIỆM", 45, 58);
    p.fillText("2029", 855, 58);
    p.font = "bold 34px Arial";
    p.fillText("KẾT QUẢ CHƯA ĐẠT", 45, 130);
    p.fillText("THỬ LẠI", 555, 130);
    p.fillStyle = "#8e4f41";
    p.font = "25px monospace";
    p.fillText("MISSING CONTEXT", 555, 230);
    p.fillStyle = "#384b48";
    p.fillText("→ REVIEW REQUIRED", 555, 280);
    p.font = "25px Arial";
    p.fillText("Xác minh hoàn cảnh.", 555, 425);
    p.fillText("Rồi quyết định hỗ trợ.", 555, 475);
    const texture = new T.CanvasTexture(page);
    texture.colorSpace = T.SRGBColorSpace;
    texture.anisotropy = 4;
    this.resources.push(texture);
    const geometry = new T.PlaneGeometry(1, 0.71),
      material = new T.MeshBasicMaterial({ map: texture });
    this.resources.push(geometry, material);
    const paper = new T.Mesh(geometry, material);
    paper.rotation.x = -Math.PI / 2;
    paper.position.set(0.74, 1.145, -0.45);
    this.root.add(paper);
    const pen = this.box([0.025, 0.025, 0.53], [1.38, 1.09, -0.45], "#c6ab71");
    pen.rotation.y = -0.24;
    // Desk lamp: localized pool of light, small shade and no shadow-map pass.
    this.box([0.34, 0.04, 0.25], [1.45, 1.09, -1.3], "#25302f");
    this.box([0.025, 0.9, 0.025], [1.45, 1.55, -1.3], "#a5926d");
    this.box([0.48, 0.12, 0.26], [1.3, 1.99, -1.25], "#33423d");
    this.box([0.38, 0.008, 0.2], [1.3, 1.925, -1.25], "#efd4a1");
    const light = new T.PointLight("#ffdca5", 5, 4, 2);
    light.position.set(1.1, 1.86, -1.05);
    this.root.add(light);
    this.box([0.28, 0.2, 0.35], [-1.05, 1.18, -0.4], "#565c48");
    this.box([0.31, 0.055, 0.39], [-1.05, 1.305, -0.4], "#c2b394");
  }
  private box(
    size: [number, number, number],
    pos: [number, number, number],
    color: string,
  ) {
    const geometry = new T.BoxGeometry(...size),
      material = new T.MeshStandardMaterial({ color, roughness: 0.85 });
    this.resources.push(geometry, material);
    const mesh = new T.Mesh(geometry, material);
    mesh.position.set(...pos);
    this.root.add(mesh);
    return mesh;
  }
  dispose() {
    this.resources.forEach((resource) => resource.dispose());
  }
}
