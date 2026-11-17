import { describe, it, expect } from "vitest";
import * as T from "three";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { ClassroomLighting } from "../src/cinematic/ClassroomLighting";
import { withoutLightingHooks } from "./helpers/classroomLightingAudit";

describe("Classroom lighting scope", () => {
  it("preserves the entire renderer except the explicit lighting hooks", () => {
    expect(
      withoutLightingHooks(
        readFileSync("src/cinematic/WorldRenderer.ts", "utf8"),
      ),
    ).toBe(
      withoutLightingHooks(
        readFileSync(
          "docs/classroom-lighting-proof/before/WorldRenderer.ts",
          "utf8",
        ),
      ),
    );
    const before = JSON.parse(
      readFileSync("docs/classroom-lighting-proof/before-hashes.json", "utf8"),
    ) as Record<string, string>;
    for (const file of [
      "src/cinematic/ClassroomCinematography.ts",
      "src/cinematic/motifs.ts",
      "src/cinematic/AudioDirector.ts",
      "src/cinematic/FallbackWorld.ts",
      "src/stayed/state.ts",
      "src/stayed/story.ts",
      "src/stayed/stayed.css",
      // Superseded by the explicitly authorized character performance pass.
      "src/art/NarrativePalette.ts",
    ])
      expect(
        createHash("sha256").update(readFileSync(file)).digest("hex"),
        file,
      ).toBe(before[file]);
    // The sole existing art-material edit enables lighting for interior paint.
    const canonical = (source: string) =>
      source.replace(/\/\/[^\n]*/g, "").replace(/\s+/g, "");
    const artBefore = readFileSync(
      "docs/classroom-lighting-proof/before/ClassroomArt.ts",
      "utf8",
    );
    expect(canonical(readFileSync("src/art/ClassroomArt.ts", "utf8"))).toBe(
      canonical(artBefore).replace(
        "constflatPaint=paint||[",
        "constflatPaint=[",
      ),
    );
  });

  it("adds one local light with no new shadow maps and releases it", () => {
    const scene = new T.Scene();
    const ambient = new T.HemisphereLight(),
      key = new T.DirectionalLight(),
      bounce = new T.DirectionalLight(),
      dialogue = new T.DirectionalLight();
    scene.add(ambient, key, bounce, dialogue);
    const originalChildren = [...scene.children];
    const rig = new ClassroomLighting(scene, key, bounce, dialogue);
    const spot = scene.children.find(
      (node): node is T.SpotLight => node instanceof T.SpotLight,
    )!;
    expect(spot).toBeDefined();
    expect(spot.castShadow).toBe(false);
    expect(
      scene.children.filter((node) => node instanceof T.Light),
    ).toHaveLength(5);
    const desk = new T.PointLight();
    const frame = () => {
      desk.intensity = 3.8;
      dialogue.intensity = 0.32;
      rig.update(desk, dialogue);
      return [desk.intensity, dialogue.intensity];
    };
    expect(frame()).toEqual(frame());
    expect(ambient.intensity).toBeLessThan(1.05);
    rig.dispose();
    expect(scene.children).toEqual(originalChildren);
  });
});
