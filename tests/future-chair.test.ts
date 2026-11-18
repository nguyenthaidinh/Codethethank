import { describe, expect, it } from "vitest";
import * as T from "three";
import { futureConversationShot } from "../src/ripple/FutureCinematography";
import { futureFounderPose } from "../src/ripple/FutureChairPerformance";
import { freshRipple, durations } from "../src/ripple/state";
import { rippleCaption } from "../src/ripple/story";
import { CHAIR_MOTIF } from "../src/cinematic/motifs";
import {
  chairMatchShot,
  chairMemoryGrade,
  chairReturnHold,
} from "../src/cinematic/ChairMatchCut";

describe("2046 chair scene", () => {
  it("grounds the decision to stay in an incomplete human-review case", () => {
    expect(rippleCaption({ ...freshRipple, phase: "approach" }, 0)).toContain(
      "HUMAN REVIEW",
    );
    expect(rippleCaption({ ...freshRipple, phase: "approach" }, 4)).toContain(
      "thiếu thông tin",
    );
    expect(rippleCaption({ ...freshRipple, phase: "chair" }, 4)).toContain(
      "xem hồ sơ",
    );
    expect(rippleCaption({ ...freshRipple, phase: "reflection" }, 0)).toContain(
      "chưa kiểm chứng",
    );
  });
  it("keeps the chair sound insert and existing checkpoint durations", () => {
    const shot = futureConversationShot(
      { ...freshRipple, phase: "chair" },
      0.6,
      false,
      false,
    )!;
    expect(shot).toEqual(chairMatchShot(0, false));
    expect(durations).toMatchObject({
      approach: 7,
      echo: 6,
      chair: 6,
      reflection: 4,
    });
  });
  for (const aspect of [1440 / 900, 390 / 844]) {
    it(`keeps the chair anchored across the cut at aspect ${aspect.toFixed(2)}`, () => {
      const project = (
        shot: ReturnType<typeof chairMatchShot>,
        center: [number, number, number],
      ) => {
        const camera = new T.PerspectiveCamera(shot.fov, aspect, 0.08, 65);
        camera.position.set(...shot.eye);
        camera.lookAt(new T.Vector3(...shot.at));
        camera.updateMatrixWorld(true);
        const point = new T.Vector3(...center);
        point.y = 0.48;
        return point.project(camera);
      };
      const portrait = aspect < 0.8;
      const echo = project(chairMatchShot(1, portrait), CHAIR_MOTIF.to);
      const returning = project(
        futureConversationShot(
          { ...freshRipple, phase: "chair" },
          0,
          portrait,
          false,
        )!,
        CHAIR_MOTIF.from,
      );
      expect(echo.distanceTo(returning)).toBeLessThan(0.0001);
      expect(Math.abs(returning.x)).toBeLessThan(0.3);
      expect(Math.abs(returning.y)).toBeLessThan(0.3);
    });
  }
  it("reintroduces color throughout the chair pull", () => {
    expect(chairMemoryGrade(0)).toBe(1);
    expect(chairMemoryGrade(chairReturnHold / 2)).toBeGreaterThan(0);
    expect(chairMemoryGrade(chairReturnHold / 2)).toBeLessThan(1);
    expect(chairMemoryGrade(chairReturnHold + 0.3)).toBe(0);
  });
  it("does not teleport the founder at the approach/pull/seated boundaries", () => {
    const approach = futureFounderPose("approach", 7),
      chair = futureFounderPose("chair", 0);
    expect(Math.hypot(approach.x - chair.x, approach.z - chair.z)).toBeLessThan(
      0.01,
    );
    const end = futureFounderPose("chair", 6),
      seated = futureFounderPose("reflection", 0);
    expect(Math.hypot(end.x - seated.x, end.z - seated.z)).toBeLessThan(0.01);
    expect(approach.seated).toBe(0);
    expect(end.seated).toBe(1);
  });
  for (const portrait of [false, true])
    it(`frames both faces above the desk without monitor occlusion (${portrait ? "portrait" : "desktop"})`, () => {
      const shot = futureConversationShot(
        { ...freshRipple, phase: "reflection" },
        0,
        portrait,
        false,
      )!;
      const camera = new T.PerspectiveCamera(
        shot.fov,
        portrait ? 390 / 844 : 1440 / 900,
        0.08,
        65,
      );
      camera.position.set(...shot.eye);
      camera.lookAt(new T.Vector3(...shot.at));
      camera.updateMatrixWorld(true);
      const monitor = new T.Mesh(
        new T.BoxGeometry(1.46, 0.91, 0.055),
        new T.MeshBasicMaterial(),
      );
      monitor.position.set(-0.5, 1.58, -1.49);
      monitor.updateMatrixWorld(true);
      for (const x of [-0.5, 1.1]) {
        const face = new T.Vector3(x, 1.5, 0.3),
          projection = face.clone().project(camera);
        expect(Math.abs(projection.x)).toBeLessThan(0.86);
        expect(Math.abs(projection.y)).toBeLessThan(0.8);
        const distance = camera.position.distanceTo(face),
          ray = new T.Raycaster(
            camera.position,
            face.clone().sub(camera.position).normalize(),
            0,
            distance,
          );
        expect(ray.intersectObject(monitor)).toHaveLength(0);
      }
      monitor.geometry.dispose();
      (monitor.material as T.Material).dispose();
    });
  it("keeps reduced motion in a stable conversation shot", () => {
    const s = { ...freshRipple, phase: "chair" as const };
    expect(futureConversationShot(s, 0, true, true)).toEqual(
      futureConversationShot(s, 5, true, true),
    );
  });
});
