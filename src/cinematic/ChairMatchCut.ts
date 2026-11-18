import { CHAIR_MOTIF } from "./motifs";

export function chairEase(value: number) {
  const p = Math.min(1, Math.max(0, value));
  return p * p * (3 - 2 * p);
}

// Keep the cut on the chair feet, which occupy the same point in both eras.
export function chairMatchShot(progress: number, portrait: boolean) {
  const { from, to } = CHAIR_MOTIF;
  const dx = (to[0] - from[0]) * progress;
  const dz = (to[2] - from[2]) * progress;
  return {
    eye: [3.32 + dx, 0.55, 2.13 + dz] as [number, number, number],
    at: [2.24 + dx, 0.44, 0.55 + dz] as [number, number, number],
    fov: portrait ? 57 : 43,
  };
}

export const chairReturnHold = 0.1 + CHAIR_MOTIF.dragSeconds;

/** Full monochrome through the cut, then color returns on the chair pull. */
export function chairMemoryGrade(time: number) {
  return 1 - chairEase(time / (chairReturnHold + 0.3));
}
