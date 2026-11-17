import * as T from "three";
import { RAINY_CAMPUS_ASSET } from "../art/exteriorAsset";

const quad = () => {
  const plane = new T.PlaneGeometry(1, 1);
  const geometry = new T.InstancedBufferGeometry();
  geometry.setIndex(plane.index!.clone());
  geometry.setAttribute("position", plane.getAttribute("position").clone());
  geometry.setAttribute("uv", plane.getAttribute("uv").clone());
  plane.dispose();
  return geometry;
};
const random = (index: number, salt: number) => {
  const n = Math.sin(index * 127.1 + salt * 311.7) * 43758.5453;
  return n - Math.floor(n);
};

export function createRainParticles() {
  const count = 1500;
  const seeds = new Float32Array(count * 4),
    shapes = new Float32Array(count * 3),
    ranges = new Float32Array(count * 2);
  for (let i = 0; i < count; i++) {
    const west = i < 520;
    seeds.set(
      [
        west ? -6.6 - random(i, 1) * 4.8 : -18 + random(i, 1) * 44,
        random(i, 2),
        west ? -7 + random(i, 3) * 14 : 10.7 + random(i, 3) * 16,
        4.2 + random(i, 4) * 3.4,
      ],
      i * 4,
    );
    shapes.set(
      [
        0.004 + random(i, 5) * 0.005,
        0.07 + random(i, 6) * 0.13,
        0.14 + random(i, 7) * 0.2,
      ],
      i * 3,
    );
    ranges.set(west ? [0.3, 5.7] : [-0.06, 7.5], i * 2);
  }
  return { count, seeds, shapes, ranges };
}

/** Rain exists outside the glazing and beyond the covered corridor, never inside. */
export class RainExterior {
  readonly group = new T.Group();
  private geometries: T.BufferGeometry[] = [];
  private materials: T.Material[] = [];
  private textures: T.Texture[] = [];
  private clock = { value: 0 };
  private loaded = false;
  private closed = false;
  private count = 1500;
  constructor(scene: T.Scene) {
    this.group.userData.dynamic = true;
    this.group.name = "rainy-campus-exterior";
    scene.add(this.group);
    const groundCanvas = document.createElement("canvas");
    groundCanvas.width = 1024;
    groundCanvas.height = 512;
    const groundMap = new T.CanvasTexture(groundCanvas);
    groundMap.colorSpace = T.SRGBColorSpace;
    this.textures.push(groundMap);
    const ground = (image?: CanvasImageSource) => {
      const c = groundCanvas.getContext("2d")!;
      c.fillStyle = "#52686e";
      c.fillRect(0, 0, 1024, 512);
      if (image) {
        c.save();
        c.globalAlpha = 0.22;
        c.filter = "blur(10px)";
        c.translate(0, 512);
        c.scale(1, -1);
        c.drawImage(image, 0, 0, 1024, 512);
        c.restore();
      }
      for (let i = 0; i < 120; i++) {
        const x = random(i, 1) * 1024,
          y = random(i, 2) * 512;
        const radius = 15 + random(i, 3) * 100;
        const wash = c.createRadialGradient(x, y, 0, x, y, radius);
        wash.addColorStop(0, i % 2 ? "#a6bcc014" : "#152d361a");
        wash.addColorStop(1, "#52686e00");
        c.fillStyle = wash;
        c.fillRect(x - radius, y - radius, radius * 2, radius * 2);
      }
      c.strokeStyle = "#243f462b";
      c.lineWidth = 1;
      for (let x = 0; x < 1024; x += 32) {
        c.beginPath();
        c.moveTo(x, 0);
        c.lineTo(x, 512);
        c.stroke();
      }
      for (let y = 0; y < 512; y += 32) {
        c.beginPath();
        c.moveTo(0, y);
        c.lineTo(1024, y);
        c.stroke();
      }
      groundMap.needsUpdate = true;
    };
    ground();
    const panorama = new T.TextureLoader().load(
      import.meta.env.BASE_URL + RAINY_CAMPUS_ASSET,
      (texture) => {
        if (this.closed) {
          texture.dispose();
          return;
        }
        this.loaded = true;
        ground(texture.image);
      },
    );
    panorama.colorSpace = T.SRGBColorSpace;
    panorama.wrapS = T.MirroredRepeatWrapping;
    panorama.anisotropy = 4;
    this.textures.push(panorama);
    const backdrop = new T.MeshBasicMaterial({
      map: panorama,
      toneMapped: false,
      side: T.DoubleSide,
    });
    this.materials.push(backdrop);
    const west = this.plane(96, 17, backdrop);
    const westUV = west.geometry.getAttribute("uv");
    for (let i = 0; i < westUV.count; i++)
      westUV.setX(i, (westUV.getX(i) - 0.5) * (96 / 34) + 0.5);
    west.rotation.y = Math.PI / 2;
    west.position.set(-18, 4.5, -0.5);
    const courtyard = this.plane(60, 30, backdrop);
    courtyard.rotation.y = Math.PI;
    courtyard.position.set(4, 6.3, 28);
    const paving = new T.MeshPhysicalMaterial({
      map: groundMap,
      color: "#b9c5c8",
      roughness: 0.3,
      metalness: 0.08,
      clearcoat: 0.65,
      clearcoatRoughness: 0.28,
    });
    this.materials.push(paving);
    const floor = this.plane(48, 26, paving);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(4, -0.14, 23.5);
    this.buildStreaks();
    this.buildRipples();
    const glazing = this.glass(12.7, 2.08);
    glazing.rotation.y = Math.PI / 2;
    glazing.position.set(-5.94, 2.1, -0.5);
  }
  private plane(width: number, height: number, material: T.Material) {
    const geometry = new T.PlaneGeometry(width, height);
    this.geometries.push(geometry);
    const mesh = new T.Mesh(geometry, material);
    this.group.add(mesh);
    return mesh;
  }
  private buildStreaks() {
    const { seeds, shapes, ranges } = createRainParticles();
    const geometry = quad();
    geometry.instanceCount = this.count;
    geometry.setAttribute("aSeed", new T.InstancedBufferAttribute(seeds, 4));
    geometry.setAttribute("aShape", new T.InstancedBufferAttribute(shapes, 3));
    geometry.setAttribute("aRange", new T.InstancedBufferAttribute(ranges, 2));
    this.geometries.push(geometry);
    const material = new T.ShaderMaterial({
      uniforms: { uTime: this.clock },
      transparent: true,
      depthWrite: false,
      side: T.DoubleSide,
      vertexShader: `attribute vec4 aSeed; attribute vec3 aShape; attribute vec2 aRange;
      uniform float uTime; varying vec2 vUv; varying float vAlpha;
      void main(){
        float fall=mod(aSeed.y*aRange.y+uTime*aSeed.w,aRange.y);
        vec3 center=vec3(aSeed.x+fall*.055,aRange.x+aRange.y-fall,aSeed.z+fall*.02);
        vec3 direction=normalize(vec3(.055,-1.,.02));
        vec3 right=normalize(cross(direction,cameraPosition-center));
        vec3 point=center+right*position.x*aShape.x+direction*position.y*aShape.y;
        vUv=uv; vAlpha=aShape.z*exp(-length(cameraPosition-center)*.016);
        gl_Position=projectionMatrix*viewMatrix*vec4(point,1.);
      }`,
      fragmentShader: `varying vec2 vUv; varying float vAlpha;
      void main(){
        float core=pow(max(0.,1.-abs(vUv.x-.5)*2.),1.8);
        float taper=smoothstep(0.,.18,vUv.y)*(1.-smoothstep(.7,1.,vUv.y));
        gl_FragColor=vec4(.77,.86,.89,core*taper*vAlpha);
      }`,
    });
    this.materials.push(material);
    const mesh = new T.Mesh(geometry, material);
    mesh.frustumCulled = false;
    this.group.add(mesh);
  }
  private buildRipples() {
    const count = 160,
      seeds = new Float32Array(count * 4);
    for (let i = 0; i < count; i++)
      seeds.set(
        [
          -8 + random(i, 8) * 24,
          10.8 + random(i, 9) * 13,
          random(i, 10),
          0.6 + random(i, 11) * 0.7,
        ],
        i * 4,
      );
    const geometry = quad();
    geometry.instanceCount = count;
    geometry.setAttribute("aSeed", new T.InstancedBufferAttribute(seeds, 4));
    this.geometries.push(geometry);
    const material = new T.ShaderMaterial({
      uniforms: { uTime: this.clock },
      transparent: true,
      depthWrite: false,
      side: T.DoubleSide,
      vertexShader: `attribute vec4 aSeed; uniform float uTime; varying vec2 vUv; varying float vAge;
      void main(){vAge=fract(aSeed.z+uTime*aSeed.w); vUv=uv;
        float size=.08+.32*vAge; vec3 p=vec3(aSeed.x+position.x*size,-.135,aSeed.y+position.y*size);
        gl_Position=projectionMatrix*viewMatrix*vec4(p,1.);}`,
      fragmentShader: `varying vec2 vUv; varying float vAge;
      void main(){float radius=length(vUv-.5)*2.; float ring=exp(-pow((radius-.75)/.075,2.));
        gl_FragColor=vec4(.7,.82,.85,ring*.15*pow(1.-vAge,2.));}`,
    });
    this.materials.push(material);
    const mesh = new T.Mesh(geometry, material);
    mesh.frustumCulled = false;
    this.group.add(mesh);
  }
  private glass(width: number, height: number) {
    const material = new T.ShaderMaterial({
      uniforms: {
        uTime: this.clock,
        uScale: { value: new T.Vector2(width * 10, height * 16) },
      },
      transparent: true,
      depthWrite: false,
      side: T.DoubleSide,
      vertexShader: `varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
      fragmentShader: `uniform float uTime; uniform vec2 uScale; varying vec2 vUv;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      void main(){
        vec2 st=vUv*uScale; vec2 cell=floor(st); float h=hash(cell); vec2 p=fract(st)-.5;
        float sliding=step(.94,h); p.y=mix(p.y,fract(st.y+uTime*(.12+h*.12))-.5,sliding);
        p.x+=(hash(cell+4.)-.5)*.55; p.y+=(hash(cell+9.)-.5)*.25;
        float radius=length(p/vec2(.06,.17)); float rim=exp(-pow((radius-.8)*7.,2.));
        float lens=exp(-radius*radius*4.); float trail=sliding*exp(-pow(p.x/.035,2.))*smoothstep(-.48,-.12,p.y)*.15;
        float alpha=step(.74,h)*(rim*.12+lens*.025+trail);
        gl_FragColor=vec4(.73,.85,.87,alpha);
      }`,
    });
    this.materials.push(material);
    const pane = this.plane(width, height, material);
    pane.renderOrder = 1;
    return pane;
  }
  update(time: number, reduced: boolean) {
    this.clock.value = reduced ? 0 : Math.max(0, time);
  }
  snapshot() {
    return {
      backgroundLoaded: this.loaded,
      streaks: this.count,
      ripples: 160,
      time: this.clock.value,
      zones: ["west-window", "open-courtyard"],
    };
  }
  dispose() {
    this.closed = true;
    this.group.removeFromParent();
    this.geometries.forEach((item) => item.dispose());
    this.materials.forEach((item) => item.dispose());
    this.textures.forEach((item) => item.dispose());
  }
}
