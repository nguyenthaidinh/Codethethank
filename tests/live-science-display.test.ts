import { describe, expect, it } from "vitest";
import { MeshBasicMaterial, type WebGLRenderer } from "three";
import { animateScienceDisplay } from "../src/future/LiveScienceDisplay";
import { OpeningRenderBudget } from "../src/future/OpeningRenderBudget";

describe("atrium sharp live displays", () => {
  it("uses one shared time uniform and retains the static full-resolution map", () => {
    const material = new MeshBasicMaterial(),
      clock = { value: 0 };
    animateScienceDisplay(material, clock);
    const shader = {
      uniforms: {},
      fragmentShader: "#include <map_fragment>",
      vertexShader: "",
    } as Parameters<typeof material.onBeforeCompile>[0];
    material.onBeforeCompile(shader, {} as WebGLRenderer);
    expect(shader.fragmentShader).toContain("#include <map_fragment>");
    expect(shader.fragmentShader).toContain("1024.0");
    expect(shader.fragmentShader).toContain("fwidth(pixel.y)");
    expect(shader.uniforms.aionDisplayTime).toBe(clock);
    clock.value = 12;
    expect(shader.uniforms.aionDisplayTime.value).toBe(12);
    material.dispose();
  });
  it("keeps the sharpness floor despite prolonged load and does not oscillate during cinematic", () => {
    const budget = new OpeningRenderBudget();
    let scale = 1;
    for (let i = 0; i < 900; i++)
      scale = budget.push(1 / 30, scale, 0.85, 1, false);
    expect(scale).toBe(0.85);
    expect(budget.changes).toBe(2);
    for (let i = 0; i < 1200; i++)
      scale = budget.push(1 / 60, scale, 0.85, 1, false);
    expect(scale).toBe(0.85);
  });
});
