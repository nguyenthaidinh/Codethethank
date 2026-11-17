import * as T from "three";
import type { NarrativeActors, NarrativeRig } from "../art/NarrativeActors";
import type { StaySave } from "../stayed/state";
import { stayLines } from "../stayed/story";
import { CHAIR_MOTIF } from "./motifs";

type Angles = [number, number, number];
const ease = (value: number) => T.MathUtils.smoothstep(value, 0, 1);
const pulse = (time: number, start: number, duration: number) =>
  time > start && time < start + duration
    ? Math.sin(((time - start) / duration) * Math.PI) ** 2
    : 0;
const gaze = (focus: string | undefined): [Angles, Angles] => {
  if (focus === "book")
    return [
      [0.26, -0.35, -0.02],
      [0.23, 0.5, 0.01],
    ];
  if (focus === "laptop")
    return [
      [0.24, -0.08, -0.02],
      [0.18, 0.78, 0.01],
    ];
  if (focus === "an")
    return [
      [0.14, -0.62, -0.02],
      [0.1, 0.75, 0.015],
    ];
  return [
    [0.08, -0.78, -0.02],
    [0.1, 0.75, 0.015],
  ];
};

/** Clock-based rather than accumulated deltas: the same checkpoint produces
 * the same performance after reload, on a slow phone or with reduced motion. */
export function performancePose(s: StaySave, time: number, reduced: boolean) {
  const chair = s.phase === "chair";
  const seated = chair
    ? ease((time - CHAIR_MOTIF.holdUntil) / CHAIR_MOTIF.sitSeconds)
    : s.phase === "discussion"
      ? 0
      : 1;
  const focus = stayLines[s.phase]?.[s.line]?.focus;
  const previousFocus =
    s.line > 0 ? stayLines[s.phase]?.[s.line - 1]?.focus : "faces";
  const from = gaze(previousFocus),
    to = gaze(focus);
  let progress = reduced ? 1 : ease(time / 0.75);
  if (s.phase === "discussion") {
    if (s.line === 0) {
      to[0] = [0.22, -0.08, -0.02];
      to[1] = [0.12, 0.35, 0.01];
    } else {
      to[0] = [0.16, -0.5, -0.02];
      to[1] = [0.1, 0.55, 0.015];
    }
  }
  if (chair) {
    from[0] = [0.16, -0.5, -0.02];
    from[1] = [0.1, 0.55, 0.015];
    to[0] = [0.08, -0.78, -0.02];
    to[1] = [0.1, 0.75, 0.015];
    progress = reduced ? 1 : ease((time - 1.3) / 3.0);
  }
  const heads = from.map(
    (angles, person) =>
      angles.map((angle, axis) =>
        T.MathUtils.lerp(angle, to[person][axis], progress),
      ) as Angles,
  );
  if (!reduced && s.phase === "question") {
    // A single listening response, never a continuous nodding loop.
    if ([4, 8].includes(s.line)) heads[0][0] += 0.045 * pulse(time, 0.8, 1.4);
    if ([2, 6, 9, 11].includes(s.line))
      heads[1][0] += 0.025 * pulse(time, 0.7, 1.2);
  }
  return {
    heads,
    seated,
    anticipation: !reduced && chair ? 0.12 * pulse(time, 1.3, 2.8) : 0,
    release: chair ? ease((time - 3.9) / 1.0) : 1,
  };
}

export function applyClassroomPerformance(
  actors: Pick<NarrativeActors, "reach" | "handWorld">,
  an: NarrativeRig,
  teacher: NarrativeRig,
  chair: T.Group,
  state: StaySave | null | undefined,
  time: number,
  reduced: boolean,
) {
  if (
    !state ||
    !["discussion", "chair", "question", "second_chance"].includes(state.phase)
  )
    return;
  const pose = performancePose(state, time, reduced);
  // Lean from the hip before lowering weight, and preserve the existing world
  // orientation of thighs/shins so the soles stay on the floor.
  teacher.body.rotation.x += pose.anticipation;
  teacher.legs.forEach((leg) => {
    leg.rotation.x -= pose.anticipation;
  });
  an.head.rotation.set(...pose.heads[0]);
  teacher.head.rotation.set(...pose.heads[1]);
  if (state.phase === "chair") {
    const grip = chair.localToWorld(new T.Vector3(-0.1, 1.02, 0.25));
    const target = grip.lerp(new T.Vector3(1.25, 0.91, -0.3), pose.release);
    target.y += Math.sin(pose.release * Math.PI) * 0.09;
    actors.reach(teacher, 0, target);
  }
  if (pose.seated > 0) {
    const hand = actors.handWorld(teacher, 1);
    if (hand.length === 3)
      actors.reach(
        teacher,
        1,
        new T.Vector3()
          .fromArray(hand)
          .lerp(new T.Vector3(0.95, 0.67, -0.17), pose.seated),
      );
  }
}
