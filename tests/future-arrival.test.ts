import { describe, it, expect } from "vitest";
import * as T from "three";
import {
  futureArrivalCue,
  futureArrivalShot,
  futureArchiveShot,
} from "../src/ripple/FutureArrival";
import { durations } from "../src/ripple/state";

describe("2046 cinematic arrival", () => {
  it("settles into the record camera with no pose or lens reset", () => {
    for (const portrait of [false, true])
      for (const reduced of [false, true])
        expect(
          futureArrivalShot("world", durations.world!, portrait, reduced),
        ).toEqual(futureArrivalShot("record", 0, portrait, reduced));
  });
  it("stays inside the room and moves continuously while the cover opens", () => {
    for (const portrait of [false, true]) {
      let previous = futureArrivalShot("world", 0, portrait, false)!;
      for (let t = 0.1; t <= 13; t += 0.1) {
        const shot = futureArrivalShot("world", t, portrait, false)!;
        expect(
          Math.hypot(...shot.eye.map((n, i) => n - previous.eye[i])),
        ).toBeLessThan(0.25);
        expect(shot.eye[0]).toBeLessThan(9);
        expect(shot.eye[2]).toBeLessThan(6.7);
        expect(shot.eye[2]).toBeGreaterThan(-9);
        previous = shot;
      }
    }
  });
  it("reveals architectural light before the core and desk, without exceeding normal light", () => {
    expect(futureArrivalCue("world", 3.5).architecture).toBeGreaterThan(
      futureArrivalCue("world", 3.5).core,
    );
    expect(futureArrivalCue("world", 5).core).toBeGreaterThan(
      futureArrivalCue("world", 5).desk,
    );
    for (let t = 0; t <= 13; t += 0.5)
      for (const value of Object.values(futureArrivalCue("world", t)))
        expect(value).toBeGreaterThanOrEqual(0);
    expect(futureArrivalCue("world", 13)).toEqual(
      futureArrivalCue("record", 0),
    );
  });
  it("provides a static fully lit reduced-motion view", () => {
    for (const t of [0, 2.5, 5, 9, 13])
      expect(futureArrivalShot("world", t, true, true)).toEqual(
        futureArrivalShot("record", 0, true, true),
      );
  });
  it("joins the desk, archive and founder without a position, aim or lens jump", () => {
    for (const portrait of [false, true]) {
      expect(futureArrivalShot("record", 0, portrait, false)).toEqual(
        futureArchiveShot("align", 0, portrait, false),
      );
      expect(
        futureArchiveShot("align", durations.align!, portrait, false),
      ).toEqual(futureArchiveShot("reveal", 0, portrait, false));
      for (const phase of ["align", "reveal"] as const) {
        let previous = futureArchiveShot(phase, 0, portrait, false)!;
        for (let time = 0.02; time <= durations[phase]!; time += 0.02) {
          const shot = futureArchiveShot(phase, time, portrait, false)!;
          expect(
            Math.hypot(...shot.eye.map((n, i) => n - previous.eye[i])),
          ).toBeLessThan(0.06);
          expect(
            Math.hypot(...shot.at.map((n, i) => n - previous.at[i])),
          ).toBeLessThan(0.06);
          expect(Math.abs(shot.fov - previous.fov)).toBeLessThan(0.15);
          expect(shot.eye[1]).toBeGreaterThan(2);
          previous = shot;
        }
      }
    }
  });
  it("leaves clear space beside the founder's face for the identity title", () => {
    for (const portrait of [false, true]) {
      const shot = futureArchiveShot("reveal", 12, portrait, false)!;
      const camera = new T.PerspectiveCamera(
        shot.fov,
        portrait ? 390 / 844 : 1440 / 900,
        0.08,
        65,
      );
      camera.position.set(...shot.eye);
      camera.lookAt(new T.Vector3(...shot.at));
      camera.updateMatrixWorld(true);
      const face = new T.Vector3(3.5, 1.7, 1.15).project(camera);
      expect(Math.abs(face.x)).toBeLessThan(0.8);
      expect(Math.abs(face.y)).toBeLessThan(0.55);
      if (!portrait) expect(face.x).toBeGreaterThan(0.2);
      else expect(face.y).toBeLessThan(0.2);
    }
  });
  it("leaves the conversation and chair camera to their existing controller", () => {
    for (const phase of [
      "approach",
      "chair",
      "reflection",
      "finale",
    ] as const) {
      expect(futureArrivalShot(phase, 3, false, false)).toBeNull();
      expect(futureArrivalCue(phase, 3)).toEqual(futureArrivalCue("record", 0));
    }
  });
});
