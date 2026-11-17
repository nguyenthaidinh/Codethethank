import { describe, expect, it } from "vitest";
import {
  anSetbackShot,
  teacherArrivalShot,
  teacherEntranceShot,
} from "../src/cinematic/ClassroomCinematography";
import { TEACHER_ENTRANCE } from "../src/cinematic/TeacherEntrance";
import { AN_SETBACK } from "../src/cinematic/AnSetback";
import { createRainParticles } from "../src/cinematic/RainExterior";

describe("the camera leaves An and discovers the doorway", () => {
  it.each([false, true])(
    "matches both ends and travels continuously, portrait=%s",
    (vertical) => {
      const last = anSetbackShot(vertical, AN_SETBACK.duration);
      const first = teacherArrivalShot(0, vertical, false);
      expect(first.eye).toEqual(last.eye);
      expect(first.at).toEqual(last.at);
      expect(first.fov).toBe(last.fov);
      expect(
        teacherArrivalShot(TEACHER_ENTRANCE.lead, vertical, false),
      ).toEqual(teacherEntranceShot(0, vertical, false));
      let previous = first;
      for (let t = 1 / 120; t < TEACHER_ENTRANCE.lead; t += 1 / 120) {
        const next = teacherArrivalShot(t, vertical, false);
        expect(
          Math.hypot(...next.eye.map((v, i) => v - previous.eye[i])),
        ).toBeLessThan(0.025);
        expect(
          Math.hypot(...next.at.map((v, i) => v - previous.at[i])),
        ).toBeLessThan(0.04);
        expect(next.eye[0]).toBeGreaterThan(0.1);
        expect(next.eye[1]).toBeGreaterThan(1.4);
        previous = next;
      }
      expect(teacherArrivalShot(0, vertical, true)).toEqual(
        teacherArrivalShot(3, vertical, true),
      );
    },
  );
});

describe("layered rain outside the room", () => {
  it("keeps drops out of the room and covered corridor, with varied sizes and speeds", () => {
    const { count, seeds, shapes, ranges } = createRainParticles();
    const speeds = new Set<number>(),
      lengths = new Set<number>();
    for (let i = 0; i < count; i++) {
      const x = seeds[i * 4],
        z = seeds[i * 4 + 2],
        height = ranges[i * 2 + 1];
      expect(x + height * 0.055 < -6 || z >= 10.7).toBe(true);
      expect(shapes[i * 3]).toBeLessThan(0.012);
      expect(shapes[i * 3 + 2]).toBeLessThan(0.4);
      speeds.add(seeds[i * 4 + 3]);
      lengths.add(shapes[i * 3 + 1]);
    }
    expect(speeds.size).toBeGreaterThan(count * 0.9);
    expect(lengths.size).toBeGreaterThan(count * 0.9);
    expect(createRainParticles().seeds).toEqual(seeds);
  });
});
