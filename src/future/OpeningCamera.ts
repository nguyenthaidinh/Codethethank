import { openingTime } from "./pacing";
type Vec = [number, number, number];
type Key = { t: number; eye: Vec; at: Vec };

/** Start the reveal before the doorway; settle without an acceleration kick. */
export function openingExteriorOpacity(cameraZ: number): number {
  const p = Math.max(0, Math.min(1, (cameraZ - 30) / 54));
  return p * p * p * (p * (p * 6 - 15) + 10);
}

/** One continuous dolly. Enter below the glazing and first suspended bridge. */
const originalCameraKeys: Key[] = [
  { t: 0.0, eye: [155, 140, 420], at: [0, 55, -65] },
  { t: 7.2, eye: [62, 64, 245], at: [0, 30, -58] },
  { t: 12.0, eye: [12, 16, 108], at: [0, 12, -55] },
  { t: 15.26471, eye: [2.5, 5.8, 56], at: [0, 6, -58] },
  { t: 17.87647, eye: [1.6, 5.6, 30], at: [0, 8, -60] },
  { t: 20.48824, eye: [0.4, 5.6, 9], at: [0, 12, -64] },
  { t: 23.1, eye: [-3, 7, -12], at: [0, 16, -67] },
  { t: 28.38, eye: [24, 20, -26], at: [0, 17, -67] },
  { t: 33.0, eye: [-20, 14, -32], at: [0, 16, -67] },
  { t: 38.83333, eye: [3, 3.2, -10], at: [0, 2.55, -15.6] },
  { t: 41.5, eye: [3, 3.2, -10], at: [0, 2.55, -15.6] },
];
export const openingCameraKeys = originalCameraKeys.map((key) => ({
  ...key,
  t: openingTime(key.t),
}));

function tangent(i: number, field: "eye" | "at", axis: number) {
  const keys = openingCameraKeys;
  if (i === 0)
    return (
      (keys[1][field][axis] - keys[0][field][axis]) / (keys[1].t - keys[0].t)
    );
  if (i >= keys.length - 2) return 0; // Settle only at the final reveal.
  const before = keys[i - 1],
    current = keys[i],
    after = keys[i + 1];
  const left =
    (current[field][axis] - before[field][axis]) / (current.t - before.t);
  const right =
    (after[field][axis] - current[field][axis]) / (after.t - current.t);
  // Limit overshoot at direction changes; no excursions through walls/floors.
  if (left * right <= 0) return 0;
  return (2 * left * right) / (left + right);
}

export function sampleOpeningCamera(time: number): { eye: Vec; at: Vec } {
  const keys = openingCameraKeys;
  const t = Math.max(0, Math.min(keys.at(-1)!.t, time));
  let i = keys.findIndex((key) => key.t > t) - 1;
  if (i < 0) i = keys.length - 2;
  const a = keys[i],
    b = keys[i + 1],
    duration = b.t - a.t;
  const u = (t - a.t) / duration;
  // Septic Hermite keeps velocity, acceleration and jerk continuous at joins,
  // including when the narration brings successive reveals closer together.
  const sample = (field: "eye" | "at"): Vec =>
    a[field].map((value, axis) => {
      const delta = b[field][axis] - value;
      const v0 = duration * tangent(i, field, axis);
      const v1 = duration * tangent(i + 1, field, axis);
      const c4 = 35 * delta - 20 * v0 - 15 * v1;
      const c5 = -84 * delta + 45 * v0 + 39 * v1;
      const c6 = 70 * delta - 36 * v0 - 34 * v1;
      const c7 = -20 * delta + 10 * v0 + 10 * v1;
      return value + u * v0 + u ** 4 * (c4 + u * (c5 + u * (c6 + u * c7)));
    }) as Vec;
  return { eye: sample("eye"), at: sample("at") };
}
