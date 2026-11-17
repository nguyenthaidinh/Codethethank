import openingTrack from "../speech/opening-track.json" with { type: "json" };

// Match each reveal to the continuous recording, without long per-clip holds.
const original = [0, 7.6, 12, 18.6, 23.1, 27.3, 33, 37.5, 41.5];
const continuous = [
  0,
  ...openingTrack.clips.slice(1).map((clip) => clip.start),
  openingTrack.seconds,
  openingTrack.seconds + 4.8,
];
export function openingTime(time: number): number {
  if (time <= 0) return 0;
  const next = original.findIndex((at) => at > time);
  if (next < 0) return continuous.at(-1)!;
  const p = (time - original[next - 1]) / (original[next] - original[next - 1]);
  return continuous[next - 1] + (continuous[next] - continuous[next - 1]) * p;
}
export const OPENING_PACE = continuous.at(-1)! / original.at(-1)!;
