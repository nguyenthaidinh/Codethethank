import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { performancePose } from "../src/cinematic/ClassroomPerformance";
import { applyClassroomPerformance } from "../src/cinematic/ClassroomPerformance";
import * as T from "three";
import { freshStay } from "../src/stayed/state";
import { withoutLightingHooks } from "./helpers/classroomLightingAudit";

describe("Classroom performance", () => {
  it("keeps planted feet fixed while the torso anticipates sitting", () => {
    const rig = () => {
      const root = new T.Group(),
        body = new T.Group(),
        head = new T.Group();
      root.add(body);
      body.add(head);
      body.position.y = 0.8425;
      const legs = [-0.1, 0.1].map((x) => {
        const joint = new T.Group();
        joint.position.x = x;
        body.add(joint);
        return joint;
      });
      const shins = legs.map((leg) => {
        const joint = new T.Group();
        joint.position.y = -0.4;
        leg.add(joint);
        return joint;
      });
      return {
        root,
        body,
        head,
        legs,
        shins,
        arms: [new T.Group(), new T.Group()],
      };
    };
    const teacher = rig(),
      an = rig();
    const feet = () =>
      teacher.shins.map((shin) =>
        shin.localToWorld(new T.Vector3(0, -0.4425, 0.05)),
      );
    const before = feet();
    applyClassroomPerformance(
      { reach: () => {}, handWorld: () => [], articulate: () => {} },
      an,
      teacher,
      new T.Group(),
      { ...freshStay, phase: "chair" },
      2.6,
      false,
    );
    expect(teacher.body.rotation.x).toBeGreaterThan(0.1);
    feet().forEach((foot, index) =>
      expect(foot.distanceTo(before[index])).toBeLessThan(1e-8),
    );
  });
  it("holds the chair during the pull, then releases before shifting weight to sit", () => {
    const s = { ...freshStay, phase: "chair" as const };
    expect(performancePose(s, 1.25, false).release).toBe(0);
    expect(performancePose(s, 2.25, false).release).toBe(1);
    expect(performancePose(s, 2.6, false).anticipation).toBeGreaterThan(0.1);
    expect(performancePose(s, 4.2, false).anticipation).toBe(0);
    for (let t = 0.01; t < 6; t += 0.01) {
      const a = performancePose(s, t - 0.01, false),
        b = performancePose(s, t, false);
      expect(Math.abs(a.heads[1][1] - b.heads[1][1])).toBeLessThan(0.01);
    }
    expect(performancePose(s, 4.5, false)).toEqual(
      performancePose(s, 4.5, false),
    );
    expect(performancePose(s, 2.6, true).anticipation).toBe(0);
  });
  it("keeps the approved camera, lighting, story, state and Finale sources", () => {
    const before = JSON.parse(
      readFileSync(
        "docs/character-performance-proof/before-hashes.json",
        "utf8",
      ),
    ) as Record<string, string>;
    for (const [path, hash] of Object.entries(before)) {
      if (
        [
          "src/cinematic/ClassroomPerformance.ts",
          "src/art/NarrativeActors.ts",
          "src/cinematic/WorldRenderer.ts",
        ].includes(path)
      )
        continue;
      expect(
        createHash("sha256").update(readFileSync(path)).digest("hex"),
        path,
      ).toBe(hash);
    }
    expect(
      withoutLightingHooks(
        readFileSync("src/cinematic/WorldRenderer.ts", "utf8"),
      ),
    ).toBe(
      withoutLightingHooks(
        readFileSync(
          "docs/character-performance-proof/before/WorldRenderer.ts",
          "utf8",
        ),
      ),
    );
  });
});
