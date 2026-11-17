import * as T from "three";
import type { NarrativeActors, NarrativeRig } from "../art/NarrativeActors";
import type { StaySave } from "../stayed/state";
import { stayLines } from "../stayed/story";
import type { ActingFrame } from "../art/CharacterActing";
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

function actingFor(
  s: StaySave,
  time: number,
  reduced: boolean,
): [ActingFrame, ActingFrame] {
  const mood = (line: number) => {
    if (s.phase === "discussion") return [0.7, 0, 0.15, 0.16];
    if (s.phase === "second_chance") return [0.22, 0.3, 0.06, 0.5];
    if (line <= 4) return [0.48, 0, 0.18, 0.28];
    if (line <= 7) return [0.83, 0, 0.25, 0.18];
    if (line === 8) return [0.48, 0.12, 0.05, 0.6];
    if (line <= 11) return [0.5, 0.06, 0.1, 0.4];
    return [0.28, 0.26, 0.05, 0.55];
  };
  const a =
      s.phase === "question" && s.line === 0
        ? [0.5, 0, 0, 0.44]
        : mood(Math.max(0, s.line - 1)),
    b = mood(s.line),
    u = reduced ? 1 : ease(time / 0.85);
  const m = a.map((x, i) => T.MathUtils.lerp(x, b[i], u));
  const chair = s.phase === "chair",
    settled = ease((time - 2.6) / 1.3);
  const focus = stayLines[s.phase]?.[s.line]?.focus;
  const down = focus === "book" || focus === "laptop";
  const eyeLead = reduced ? 1 : ease(time / 0.32);
  const an: ActingFrame = {
    hands: [0.2, 0.12 + m[0] * 0.32],
    wrists: [0, -0.05],
    concern: m[0],
    warmth: m[1],
    gaze: [-1.4 * eyeLead, down ? 1.7 : 0],
  };
  const teacher: ActingFrame = {
    hands: [0.12, 0.18],
    wrists: [-0.06, 0],
    concern: m[2],
    warmth: m[3],
    gaze: [1.3 * eyeLead, down ? 1.6 : 0],
  };
  if (chair) {
    const opening = ease((time - 3.9) / 0.32);
    teacher.hands[0] = T.MathUtils.lerp(
      0.35 + 0.55 * ease(time / 0.24),
      0.12,
      opening,
    );
    teacher.wrists[0] = T.MathUtils.lerp(-0.2, -0.06, ease((time - 3.9) / 1));
    teacher.concern = 0.12 * (1 - settled);
    teacher.warmth = 0.16 + 0.28 * settled;
    teacher.gaze = [
      1.3 * ease((time - 2.1) / 1.2),
      1.7 * (1 - ease((time - 2.1) / 1.2)),
    ];
    if (reduced) teacher.gaze = [1.3, 0];
    an.concern = 0.7 - 0.2 * settled;
    an.warmth = 0;
    an.hands[1] = 0.35 - 0.07 * settled;
  }
  return [an, teacher];
}

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
    acting: actingFor(s, time, reduced),
    seated,
    anticipation: !reduced && chair ? 0.12 * pulse(time, 1.3, 2.8) : 0,
    release: chair ? ease((time - 3.9) / 1.0) : 1,
  };
}

/** Keep the release on the outside of the teacher's shoulder, not through her torso. */
export function chairHandTarget(chair: T.Group, release: number) {
  const r = T.MathUtils.clamp(release, 0, 1);
  const target = chair
    .localToWorld(new T.Vector3(0.16, 1.07, 0.25))
    .lerp(new T.Vector3(1.25, 0.91, -0.3), r);
  target.x += Math.sin(r * Math.PI) * 0.18;
  target.y += Math.sin(r * Math.PI) * 0.09;
  return target;
}

export function applyClassroomPerformance(
  actors: Pick<NarrativeActors, "reach" | "handWorld" | "articulate">,
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
  actors.articulate(an, pose.acting[0]);
  actors.articulate(teacher, pose.acting[1]);
  // Lean from the hip before lowering weight, and preserve the existing world
  // orientation of thighs/shins so the soles stay on the floor.
  teacher.body.rotation.x += pose.anticipation;
  teacher.legs.forEach((leg) => {
    leg.rotation.x -= pose.anticipation;
  });
  an.head.rotation.set(...pose.heads[0]);
  teacher.head.rotation.set(...pose.heads[1]);
  if (state.phase === "chair") {
    actors.reach(teacher, 0, chairHandTarget(chair, pose.release));
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
