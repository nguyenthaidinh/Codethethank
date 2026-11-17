import * as T from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export interface ActingFrame {
  hands: [number, number];
  wrists: [number, number];
  palmRoll?: [number, number];
  concern: number;
  warmth: number;
  gaze: [number, number];
  frustration?: number;
  sadness?: number;
}
export const REST_ACTING: ActingFrame = {
  hands: [0.12, 0.12],
  wrists: [0, 0],
  concern: 0,
  warmth: 0,
  gaze: [0, 0],
};
export interface ArticulatedHand {
  mesh: T.SkinnedMesh;
  fingers: { root: T.Bone; tip: T.Bone; rest: T.Euler }[];
  skeleton: T.Skeleton;
}

/** Two joints per digit, one batched skin per hand; wrist remains on the existing forearm. */
export function createArticulatedHand(
  side: number,
  material: T.Material,
): ArticulatedHand {
  const base = new T.Bone(),
    bones = [base],
    parts: T.BufferGeometry[] = [];
  const fingers: ArticulatedHand["fingers"] = [];
  const weighted = (g: T.BufferGeometry, bone: T.Bone) => {
    base.updateMatrixWorld(true);
    g.applyMatrix4(bone.matrixWorld);
    const count = g.getAttribute("position").count,
      indices = new Uint16Array(count * 4),
      weights = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) {
      indices[i * 4] = bones.indexOf(bone);
      weights[i * 4] = 1;
    }
    g.setAttribute("skinIndex", new T.Uint16BufferAttribute(indices, 4));
    g.setAttribute("skinWeight", new T.Float32BufferAttribute(weights, 4));
    parts.push(g);
  };
  const palm = new T.SphereGeometry(1, 20, 12);
  palm.scale(0.029, 0.039, 0.016);
  palm.translate(0, -0.03, 0.008);
  weighted(palm, base);
  for (let i = 0; i < 5; i++) {
    const thumb = i === 4,
      length = thumb ? 0.044 : [0.045, 0.057, 0.054, 0.041][i];
    const root = new T.Bone(),
      tip = new T.Bone();
    root.position.set(
      thumb ? -side * 0.025 : (i - 1.5) * 0.014,
      thumb ? -0.029 : -0.056,
      0.012,
    );
    root.rotation.set(
      thumb ? -0.35 : 0,
      0,
      thumb ? -side * 0.65 : (i - 1.5) * 0.045,
    );
    base.add(root);
    tip.position.y = -length * 0.52;
    root.add(tip);
    bones.push(root, tip);
    const radius = thumb ? 0.009 : 0.007;
    for (const [bone, len] of [
      [root, length * 0.52],
      [tip, length * 0.48],
    ] as const) {
      const part = new T.CapsuleGeometry(
        radius,
        Math.max(0.001, len - 2 * radius),
        4,
        8,
      );
      part.translate(0, -len / 2, 0);
      weighted(part, bone);
    }
    fingers.push({ root, tip, rest: root.rotation.clone() });
  }
  const geometry = mergeGeometries(parts)!;
  parts.forEach((g) => g.dispose());
  const mesh = new T.SkinnedMesh(geometry, material);
  mesh.add(base);
  mesh.updateMatrixWorld(true);
  const skeleton = new T.Skeleton(bones);
  mesh.bind(skeleton);
  mesh.position.set(0, -0.235, 0);
  mesh.castShadow = true;
  // Conservative local envelope for every clamped finger/wrist pose. Keep
  // off-screen hands cullable without recomputing skinned bounds each frame.
  mesh.boundingSphere = new T.Sphere(new T.Vector3(0, -0.04, 0), 0.16);
  mesh.frustumCulled = true;
  mesh.userData.articulated = true;
  return { mesh, skeleton, fingers };
}
export function poseHand(
  hand: ArticulatedHand,
  amount: number,
  wrist: number,
  roll = 0,
) {
  const curl = T.MathUtils.clamp(amount, 0, 1);
  hand.mesh.rotation.x = T.MathUtils.clamp(wrist, -0.35, 0.35);
  hand.mesh.rotation.y = T.MathUtils.clamp(roll, -Math.PI / 2, Math.PI / 2);
  hand.fingers.forEach(({ root, tip, rest }, i) => {
    root.rotation.copy(rest);
    root.rotation.x -=
      i === 4 ? 0.15 + curl * 0.55 : 0.12 + curl * (0.85 + i * 0.035);
    tip.rotation.x = -(0.1 + curl * (i === 4 ? 0.65 : 1.0));
  });
}
/** Smooth, asymmetric lid closure; deterministic and disabled for reduced motion. */
export function blinkClosure(elapsed: number, reduced: boolean) {
  if (reduced) return 0;
  const t = ((elapsed % 17.3) + 17.3) % 17.3;
  for (const at of [1.1, 6.7, 12.4]) {
    const d = t - at;
    if (d >= 0 && d < 0.07) return T.MathUtils.smoothstep(d, 0, 0.07);
    if (d >= 0.07 && d < 0.23) return 1 - T.MathUtils.smoothstep(d, 0.07, 0.23);
  }
  return 0;
}

export function facialUniforms(
  pupils: T.Texture,
  closed: T.Texture,
  teacher: boolean,
) {
  return {
    faceAct: { value: new T.Vector4() },
    faceMood: { value: new T.Vector2() },
    faceBlink: { value: 0 },
    facePupils: { value: pupils },
    faceClosed: { value: closed },
    faceEyeY: { value: 1 - (teacher ? 113 : 115) / 256 },
  };
}
export type FacialUniforms = ReturnType<typeof facialUniforms>;
export function installFaceActing(
  material: T.MeshToonMaterial,
  uniforms: FacialUniforms,
) {
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.fragmentShader =
      `uniform vec4 faceAct; uniform vec2 faceMood; uniform float faceBlink; uniform float faceEyeY; uniform sampler2D facePupils; uniform sampler2D faceClosed;\n` +
      shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <map_fragment>",
      `
      #ifdef USE_MAP
      vec2 uv=vMapUv;
      float dx=min(abs(uv.x-109.0/512.0),abs(uv.x-147.0/512.0))*512.0;
      float eyeMask=(1.0-smoothstep(10.0,13.0,dx))*(1.0-smoothstep(7.0,10.0,abs(uv.y-faceEyeY)*256.0));
      float aperture=max(.1,1.0-faceBlink*.88-faceMood.x*.18-faceMood.y*.12);
      uv.y=mix(uv.y,faceEyeY+(uv.y-faceEyeY)/aperture,eyeMask);
      float browMask=exp(-pow((uv.y-(1.0-101.0/256.0))*256.0/5.0,2.0))*(1.0-smoothstep(8.0,14.0,dx));
      float inner=1.0-smoothstep(14.0,28.0,abs(uv.x-.25)*512.0);
      uv.y-=browMask*(faceAct.x*(inner*3.0-.7)+faceAct.y*.7-faceMood.x*(inner*2.4-.4)+faceMood.y*(inner*2.1-.4))/256.0;
      float mouth=exp(-pow((uv.y-(1.0-145.0/256.0))*256.0/6.0,2.0))*(1.0-smoothstep(9.0,13.0,abs(uv.x-.25)*512.0));
      float corners=smoothstep(1.0,8.0,abs(uv.x-.25)*512.0);
      uv.y-=mouth*corners*(faceAct.y*2.0-faceAct.x*1.0-faceMood.x*.45-faceMood.y*1.3)/256.0;
      vec4 skin=texture2D(map,uv);
      skin=mix(skin,texture2D(faceClosed,vMapUv),eyeMask*smoothstep(.7,1.0,faceBlink));
      vec4 iris=texture2D(facePupils,vMapUv-vec2(faceAct.z/512.0,-faceAct.w/256.0));
      float eyeClip=1.0-smoothstep(.7,1.0,pow(dx/9.0,2.0)+pow((vMapUv.y-faceEyeY)*256.0/(3.8*aperture),2.0));
      skin.rgb=mix(skin.rgb,iris.rgb,iris.a*eyeClip*(1.0-smoothstep(.7,1.0,faceBlink)));
      diffuseColor*=skin;
      #endif
    `,
    );
  };
  material.customProgramCacheKey = () => "classroom-face-acting-v2";
}
