import { Color, type MeshBasicMaterial, type IUniform } from "three";

/** Keep labels in a full-resolution texture; draw moving curves on the GPU.
 * This replaces repeated canvas uploads, without reducing display resolution. */
export function animateScienceDisplay(
  material: MeshBasicMaterial,
  time: IUniform<number>,
) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.aionDisplayTime = time;
    shader.uniforms.aionCurveColor = { value: new Color("#5ba1b3") };
    shader.fragmentShader =
      "uniform float aionDisplayTime;\nuniform vec3 aionCurveColor;\n" +
      shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <map_fragment>",
      `
      #include <map_fragment>
      #ifdef USE_MAP
        vec2 pixel = vec2(vMapUv.x * 1024.0, (1.0 - vMapUv.y) * 512.0);
        float row = clamp(floor((pixel.y - 130.0) / 56.0 + 0.5), 0.0, 4.0);
        float curveY = 130.0 + row * 56.0 + sin((pixel.x - 60.0) / 9.0 * 0.11 + aionDisplayTime + row) * 20.0;
        float distanceToCurve = abs(pixel.y - curveY);
        float coverage = 1.0 - smoothstep(0.7, 0.7 + max(fwidth(pixel.y), 0.5), distanceToCurve);
        coverage *= step(60.0, pixel.x) * step(pixel.x, 951.0);
        diffuseColor.rgb = mix(diffuseColor.rgb, aionCurveColor, coverage);
      #endif
    `,
    );
  };
  material.customProgramCacheKey = () => "aion-science-display-v1";
  material.needsUpdate = true;
}
