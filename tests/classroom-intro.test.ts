import { describe, it, expect } from "vitest";
import {
  CLASSROOM_INTRO_DURATION,
  classroomIntroCue,
  classroomIntroShot,
} from "../src/chapter/ClassroomIntro";

describe("guided classroom context", () => {
  it("shows the screen first and settles on the desk for dossier review", () => {
    const shot = classroomIntroShot(CLASSROOM_INTRO_DURATION, false, false);
    expect(shot).toEqual({
      eye: [1.7, 2.05, 1],
      at: [0.35, 0.99, -0.65],
      fov: 45,
    });
    expect(classroomIntroShot(999, false, false)).toEqual(shot);
    expect(classroomIntroShot(-1, false, false)).toEqual(
      classroomIntroShot(0, false, false),
    );
    expect(classroomIntroShot(CLASSROOM_INTRO_DURATION, true, false).fov).toBe(
      65,
    );
    expect(classroomIntroShot(10, false, false)).toEqual(
      classroomIntroShot(20, false, false),
    );
  });
  it("keeps the dolly above the desk and avoids camera jumps in either orientation", () => {
    for (const vertical of [false, true]) {
      let previous = classroomIntroShot(0, vertical, false);
      for (let t = 1 / 60; t <= CLASSROOM_INTRO_DURATION; t += 1 / 60) {
        const shot = classroomIntroShot(t, vertical, false);
        expect(shot.eye[1]).toBeGreaterThan(1.8);
        expect(
          Math.hypot(...shot.eye.map((v, i) => v - previous.eye[i])),
        ).toBeLessThan(0.04);
        expect(
          Math.hypot(...shot.at.map((v, i) => v - previous.at[i])),
        ).toBeLessThan(0.04);
        expect(Math.abs(shot.fov - previous.fov)).toBeLessThan(0.08);
        previous = shot;
      }
    }
  });
  it("retains all context with stable reduced-motion shots", () => {
    expect(classroomIntroCue(0).text).toContain("An");
    expect(classroomIntroCue(6).text).toContain("NOT RECOMMENDED");
    expect(classroomIntroCue(14).text).toContain("An:");
    expect(classroomIntroCue(22).text).toContain("STUDENT 07");
    for (const [from, to] of [
      [0, 5.9],
      [6, 13.9],
      [14, 21.9],
      [22, 30.9],
      [31, 39],
    ]) {
      expect(classroomIntroShot(from, false, true)).toEqual(
        classroomIntroShot(to, false, true),
      );
    }
  });
});
