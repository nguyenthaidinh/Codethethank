import * as T from "three";
import type { NarrativeActors, NarrativeRig } from "../art/NarrativeActors";

type XYZ = [number, number, number];
export const TEACHER_ENTRANCE = {
  lead: 3.2,
  openFrom: 0.45,
  openTo: 1.5,
  walkFrom: 1.55,
  walkTo: 7.35,
  settled: 8.4,
  greetAt: 12,
  askAt: 17,
  duration: 22,
  stride: 0.55,
  start: [2.7, 0, 6.18] as XYZ,
  finish: [1.9, 0, 0.7] as XYZ,
};
const clamp = (v: number) => Math.max(0, Math.min(1, v));
const smooth = (v: number) => {
  const p = clamp(v);
  return p * p * (3 - 2 * p);
};
const ease = (v: number) => {
  const p = clamp(v);
  return p * p * p * (p * (p * 6 - 15) + 10);
};
const range = (t: number, a: number, b: number) => clamp((t - a) / (b - a));

/** One clock drives the handle, clearance, gait, camera and final eye contact. */
export function teacherEntrancePose(time: number, reduced = false) {
  const t = Math.max(0, time),
    timing = TEACHER_ENTRANCE;
  const walk = smooth(range(t, timing.walkFrom, timing.walkTo));
  const position = timing.start.map(
    (v, i) => v + (timing.finish[i] - v) * walk,
  ) as XYZ;
  const distance =
    Math.hypot(...timing.finish.map((v, i) => v - timing.start[i])) * walk;
  const settle = ease(range(t, timing.walkTo - 0.6, timing.settled));
  return {
    position,
    walk,
    distance,
    door: 1.4 * ease(range(t, timing.openFrom, timing.openTo)),
    grip: reduced ? 0 : ease(t / 0.4) * (1 - ease(range(t, 0.65, 0.95))),
    gait: reduced
      ? 0
      : ease(range(t, timing.walkFrom, timing.walkFrom + 0.45)) *
        (1 - ease(range(t, timing.walkTo - 0.65, timing.walkTo))),
    look: reduced ? 0.55 : 0.08 + 0.47 * ease(range(t, 2.8, timing.settled)),
    nod: reduced
      ? 0
      : Math.sin(Math.PI * range(t, timing.walkTo + 0.1, timing.settled)) ** 2 *
        0.035,
    warmth: 0.16 + settle * 0.2,
  };
}

// Footfall sounds occur when a swing foot lands, even through the ease-out.
const length = Math.hypot(
  ...TEACHER_ENTRANCE.finish.map((v, i) => v - TEACHER_ENTRANCE.start[i]),
);
export const teacherFootfalls = Array.from(
  { length: Math.floor(length / TEACHER_ENTRANCE.stride) },
  (_, i) => {
    const target = (i + 1) * TEACHER_ENTRANCE.stride;
    let lo = TEACHER_ENTRANCE.walkFrom,
      hi = TEACHER_ENTRANCE.walkTo;
    for (let j = 0; j < 32; j++) {
      const mid = (lo + hi) / 2;
      if (teacherEntrancePose(mid).distance < target) lo = mid;
      else hi = mid;
    }
    return (lo + hi) / 2;
  },
);

export function applyTeacherEntrance(
  actors: Pick<NarrativeActors, "reach" | "handWorld" | "articulate">,
  rig: NarrativeRig,
  door: T.Group,
  time: number,
  reduced: boolean,
) {
  const pose = teacherEntrancePose(time, reduced);
  actors.articulate(rig, {
    hands: [0.12 + 0.7 * pose.grip, 0.14],
    wrists: [-0.12 * pose.grip, 0.03],
    concern: 0.1,
    warmth: pose.warmth,
    gaze: [-0.24 * pose.look, -0.04],
  });
  rig.head.rotation.set(0.035 + pose.nod, pose.look, -0.015 * pose.gait);
  if (pose.grip > 0) {
    const hand = actors.handWorld(rig, 0);
    if (hand.length === 3)
      actors.reach(
        rig,
        0,
        new T.Vector3()
          .fromArray(hand)
          .lerp(door.localToWorld(new T.Vector3(1.31, 1.2, 0.11)), pose.grip),
      );
  }
}
