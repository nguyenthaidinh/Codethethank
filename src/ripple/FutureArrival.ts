import { durations, type RippleSave } from "./state";

type Vec = [number, number, number];
export interface FutureShot {
  eye: Vec;
  at: Vec;
  fov: number;
}
const smooth = (n: number) => {
  const p = Math.max(0, Math.min(1, n));
  return p * p * p * (p * (p * 6 - 15) + 10);
};
const ramp = (time: number, start: number, end: number) =>
  smooth((time - start) / (end - start));
const bezier = (a: Vec, b: Vec, c: Vec, d: Vec, p: number): Vec => {
  const q = 1 - p;
  return a.map(
    (n, i) =>
      q * q * q * n +
      3 * q * q * p * b[i] +
      3 * q * p * p * c[i] +
      p * p * p * d[i],
  ) as Vec;
};

/** The title, renderer and lights use one chapter clock; no independent timers. */
export function futureArrivalCue(
  phase: RippleSave["phase"],
  time: number,
  reduced = false,
) {
  if (phase !== "world" || reduced)
    return { architecture: 1, core: 1, desk: 1, daylight: 1, travel: 1 };
  return {
    architecture: ramp(time, 2.1, 4.6),
    core: ramp(time, 3.0, 6.6),
    desk: ramp(time, 6.0, 10.6),
    daylight: ramp(time, 2.4, 6.0),
    travel: ramp(time, 2.3, durations.world!),
  };
}

/** A wide reveal becomes a desk-side arc, with one continuous lens movement. */
export function futureArrivalShot(
  phase: RippleSave["phase"],
  time: number,
  portrait: boolean,
  reduced: boolean,
): FutureShot | null {
  if (phase !== "world" && phase !== "record") return null;
  const p = futureArrivalCue(phase, time, reduced).travel;
  return portrait
    ? {
        eye: bezier(
          [3.6, 3.3, 5.8],
          [5.8, 3.1, 3.7],
          [5.5, 2.6, -1.7],
          [4.5, 2.45, -3.8],
          p,
        ),
        at: bezier(
          [1.6, 1.9, -4.5],
          [1.5, 1.7, -3.4],
          [0.2, 1.35, -0.6],
          [0.2, 1.28, -0.15],
          p,
        ),
        fov: 64 - 8 * p,
      }
    : {
        eye: bezier(
          [7.2, 3.25, 5.6],
          [7.1, 2.95, 2.5],
          [5.7, 2.4, -1.5],
          [4.3, 2.35, -3.3],
          p,
        ),
        at: bezier(
          [1.2, 1.9, -4.3],
          [1.8, 1.65, -3.4],
          [0.7, 1.35, -0.5],
          [0.3, 1.3, 0.5],
          p,
        ),
        fov: 54 - 6 * p,
      };
}

const blend = (a: FutureShot, b: FutureShot, p: number): FutureShot =>
  p <= 0
    ? a
    : p >= 1
      ? b
      : {
          eye: a.eye.map((n, i) => n + (b.eye[i] - n) * p) as Vec,
          at: a.at.map((n, i) => n + (b.at[i] - n) * p) as Vec,
          fov: a.fov + (b.fov - a.fov) * p,
        };

/** The dossier, held reveal, and founder share their exact boundary poses. */
export function futureArchiveShot(
  phase: RippleSave["phase"],
  time: number,
  portrait: boolean,
  reduced: boolean,
): FutureShot | null {
  if (phase !== "align" && phase !== "reveal") return null;
  const desk = futureArrivalShot("record", 0, portrait, reduced)!;
  const archive: FutureShot = {
    eye: portrait ? [2.7, 3.25, -0.1] : [2.65, 2.95, -0.2],
    at: portrait ? [0.7, 1.1, -0.8] : [1.05, 1.08, -0.85],
    fov: portrait ? 57 : 44,
  };
  if (phase === "align")
    return blend(desk, archive, reduced ? 1 : ramp(time, 0, 4.8));
  const founder: FutureShot = {
    eye: portrait ? [5.7, 2.3, -4.5] : [5.4, 2.05, -2.8],
    at: portrait ? [3.5, 1.48, 1.15] : [4.35, 1.45, 1.15],
    fov: portrait ? 51 : 40,
  };
  return blend(archive, founder, reduced ? 1 : ramp(time, 4, 8.2));
}
