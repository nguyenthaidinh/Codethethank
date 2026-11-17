import { describe, expect, it } from "vitest";
import {
  teacherEntrancePose as pose,
  teacherFootfalls,
  TEACHER_ENTRANCE as timing,
} from "../src/cinematic/TeacherEntrance";
import { teacherEntranceShot } from "../src/cinematic/ClassroomCinematography";

describe("motivated teacher entrance", () => {
  it("reaches for the door, releases the handle, then walks through a clear aperture", () => {
    expect(pose(0).position).toEqual(timing.start);
    expect(pose(0.65).grip).toBe(1);
    expect(pose(0.65).walk).toBe(0);
    expect(pose(timing.walkFrom).grip).toBe(0);
    expect(pose(timing.walkFrom).door).toBeCloseTo(1.4);
    pose(timing.settled).position.forEach((value, index) =>
      expect(value).toBeCloseTo(timing.finish[index], 12),
    );
    expect(pose(timing.settled).gait).toBe(0);
    expect(pose(timing.settled).look).toBeCloseTo(0.55);
  });
  it("opens into the room without sweeping through the teacher's body", () => {
    for (let t = 0; t <= timing.walkTo; t += 0.01) {
      const current = pose(t);
      const dx = current.position[0] - 1.7,
        dz = current.position[2] - 5.8;
      const x = Math.cos(current.door),
        z = -Math.sin(current.door);
      const along = Math.max(0, Math.min(1.5, dx * x + dz * z));
      expect(Math.hypot(dx - along * x, dz - along * z)).toBeGreaterThan(0.22);
    }
  });
  it("places every footfall sound on a real step instead of an arbitrary interval", () => {
    teacherFootfalls.forEach((t, index) => {
      expect(pose(t).distance).toBeCloseTo((index + 1) * timing.stride, 6);
      expect(t).toBeGreaterThan(timing.walkFrom);
      expect(t).toBeLessThan(timing.walkTo);
    });
  });
  it("has continuous position and gaze and a stable reduced-motion camera", () => {
    let previous = pose(0);
    let previousShot = teacherEntranceShot(0, false, false);
    for (let t = 1 / 60; t <= timing.settled; t += 1 / 60) {
      const current = pose(t);
      expect(
        Math.hypot(...current.position.map((v, i) => v - previous.position[i])),
      ).toBeLessThan(0.026);
      expect(Math.abs(current.door - previous.door)).toBeLessThan(0.05);
      const shot = teacherEntranceShot(t, false, false);
      expect(
        Math.hypot(...shot.at.map((v, i) => v - previousShot.at[i])),
      ).toBeLessThan(0.026);
      previous = current;
      previousShot = shot;
    }
    expect(teacherEntranceShot(0, true, true)).toEqual(
      teacherEntranceShot(9, true, true),
    );
    expect(pose(4, true).gait).toBe(0);
    expect(pose(4, true).grip).toBe(0);
  });
});
