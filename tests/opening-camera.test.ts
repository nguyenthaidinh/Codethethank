import { describe, expect, it } from "vitest";
import {
  openingCameraKeys,
  openingExteriorOpacity,
  sampleOpeningCamera,
} from "../src/future/OpeningCamera";
import { narration, OPENING_DURATION } from "../src/future/direction";
import catalog from "../src/speech/catalog.json";
import { speechKey, speechText } from "../src/speech/text";
import openingTrack from "../src/speech/opening-track.json";

describe("continuous opening dolly and selected narration timing", () => {
  it("eases both ends of the entrance reveal without opacity acceleration jumps", () => {
    const h = 0.01;
    for (const edge of [30, 84]) {
      const a = openingExteriorOpacity(edge - h),
        b = openingExteriorOpacity(edge),
        c = openingExteriorOpacity(edge + h);
      expect(Math.abs((c - a) / (2 * h))).toBeLessThan(0.00001);
      expect(Math.abs((c - 2 * b + a) / (h * h))).toBeLessThan(0.00001);
    }
    expect(openingExteriorOpacity(78)).toBeLessThan(1);
    expect(openingExteriorOpacity(47)).toBeGreaterThan(0);
  });
  it("dissolves the exterior shell continuously while crossing the entrance", () => {
    expect(openingExteriorOpacity(108)).toBe(1);
    expect(openingExteriorOpacity(30)).toBe(0);
    let previous = 1;
    for (
      let t = openingCameraKeys[2].t;
      t <= openingCameraKeys[6].t;
      t += 1 / 60
    ) {
      const opacity = openingExteriorOpacity(sampleOpeningCamera(t).eye[2]);
      expect(opacity).toBeLessThanOrEqual(previous);
      expect(previous - opacity).toBeLessThan(0.012);
      previous = opacity;
    }
  });
  it("keeps velocity continuous and nonzero through intermediate shots", () => {
    const h = 0.001;
    for (const key of openingCameraKeys.slice(1, -2)) {
      const a = sampleOpeningCamera(key.t - h).eye;
      const b = sampleOpeningCamera(key.t).eye;
      const c = sampleOpeningCamera(key.t + h).eye;
      const left = b.map((v, i) => (v - a[i]) / h);
      const right = c.map((v, i) => (v - b[i]) / h);
      expect(Math.hypot(...right)).toBeGreaterThan(0.1);
      left.forEach((v, i) => expect(Math.abs(v - right[i])).toBeLessThan(0.03));
    }
    expect(sampleOpeningCamera(-1)).toEqual(sampleOpeningCamera(0));
    expect(sampleOpeningCamera(999)).toEqual(
      sampleOpeningCamera(OPENING_DURATION),
    );
  });
  it("gives each selected clip time to finish before its subtitle changes", () => {
    for (const line of narration.filter(
      (line) => line.speaker === "NGƯỜI DẪN",
    )) {
      const entry =
        catalog[speechKey(speechText(line.text)) as keyof typeof catalog];
      expect(entry.file).toContain("vi-hoaimy-calm/");
      const clip = openingTrack.clips.find(
        (clip) => clip.key === speechKey(speechText(line.text)),
      )!;
      expect(clip.end).toBeLessThan(line.end);
      expect(line.start).toBeLessThanOrEqual(clip.start);
    }
    expect(narration.at(-1)?.end).toBe(OPENING_DURATION);
  });
  it("crosses the entrance and first bridge in the open passage with gentle gaze changes", () => {
    let previous = sampleOpeningCamera(openingCameraKeys[2].t);
    const direction = (p: ReturnType<typeof sampleOpeningCamera>) => {
      const d = p.at.map((v, i) => v - p.eye[i]);
      const length = Math.hypot(...d);
      return d.map((v) => v / length);
    };
    for (
      let t = openingCameraKeys[2].t + 0.02;
      t <= openingCameraKeys[6].t;
      t += 0.02
    ) {
      const current = sampleOpeningCamera(t);
      expect(current.eye[2]).toBeLessThan(previous.eye[2]);
      if (current.eye[2] < 50 && current.eye[2] > 24) {
        expect(current.eye[1]).toBeGreaterThan(3);
        expect(current.eye[1]).toBeLessThan(6.4);
        expect(Math.abs(current.eye[0])).toBeLessThan(4);
      }
      const a = direction(previous),
        b = direction(current);
      const degreesPerSecond =
        (Math.acos(
          Math.min(
            1,
            Math.max(
              -1,
              a.reduce((sum, v, i) => sum + v * b[i], 0),
            ),
          ),
        ) *
          180) /
        Math.PI /
        0.02;
      expect(degreesPerSecond).toBeLessThan(7.5);
      previous = current;
    }
  });
  it("has continuous acceleration at camera joins", () => {
    const h = 0.001;
    for (const { t } of openingCameraKeys.slice(1, -1)) {
      const points = [-2, -1, 0, 1, 2].map((offset) =>
        sampleOpeningCamera(t + h * offset),
      );
      for (const field of ["eye", "at"] as const)
        for (let axis = 0; axis < 3; axis++) {
          const a = points.map((p) => p[field][axis]);
          const left = (a[2] - 2 * a[1] + a[0]) / (h * h);
          const right = (a[4] - 2 * a[3] + a[2]) / (h * h);
          expect(Math.abs(left - right)).toBeLessThan(0.03);
        }
    }
  });
});
