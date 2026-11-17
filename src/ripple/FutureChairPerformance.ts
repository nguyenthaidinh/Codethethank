import * as T from "three";
import type { NarrativeActors, NarrativeRig } from "../art/NarrativeActors";
import { CHAIR_MOTIF } from "../cinematic/motifs";
import type { RippleSave } from "./state";

const ease = (t: number) => T.MathUtils.smoothstep(t, 0, 1);
const lerp = T.MathUtils.lerp;
export function futureFounderPose(phase: RippleSave["phase"], time: number) {
  let x = 3.5,
    z = 1.15,
    seated = 0,
    grip = 0,
    walk = 0;
  if (phase === "approach") {
    const p = ease(time / 4.8);
    x = lerp(3.5, 2.05, p);
    walk = Math.sin(Math.PI * p);
    grip = ease((time - 5.3) / 1.2);
  } else if (phase === "chair") {
    const drag = ease((time - 0.1) / CHAIR_MOTIF.dragSeconds);
    const step = ease((time - 1.4) / 1.2);
    const cx = lerp(CHAIR_MOTIF.from[0], CHAIR_MOTIF.to[0], drag);
    const cz = lerp(CHAIR_MOTIF.from[2], CHAIR_MOTIF.to[2], drag);
    // Pass around the side of the backrest before lowering onto the seat.
    x = cx - 0.25 * (1 - step) + Math.sin(step * Math.PI) * 0.55;
    z = lerp(cz + 0.55, 0.2, step);
    grip = 1 - ease((time - 1.4) / 0.55);
    seated = ease(
      (time - 0.1 - CHAIR_MOTIF.holdUntil) / CHAIR_MOTIF.sitSeconds,
    );
    walk = Math.sin(Math.PI * step) * 0.5;
  } else if (
    ["reflection", "reconstruct", "principle", "finale"].includes(phase)
  ) {
    x = 1.1;
    z = 0.2;
    seated = 1;
  }
  return { x, z, seated, grip, walk };
}

export type FutureActing = Pick<
  NarrativeActors,
  "relax" | "reach" | "expression" | "articulate" | "handWorld"
>;
export function applyFutureConversation(
  actors: FutureActing,
  sit: (rig: NarrativeRig, amount: number) => void,
  founder: NarrativeRig,
  researcher: NarrativeRig,
  chair: T.Group,
  s: RippleSave,
  time: number,
  reduced: boolean,
) {
  const pose = futureFounderPose(s.phase, time);
  founder.root.position.set(pose.x, 0, pose.z);
  founder.root.rotation.y = Math.PI;
  sit(founder, pose.seated);
  actors.relax(founder);
  const previousLean = founder.body.rotation.x;
  const lean =
    s.phase === "chair"
      ? Math.sin(Math.PI * ease((time - 2.25) / 1.9)) * 0.13
      : 0;
  founder.body.rotation.x = 0.055 * pose.seated + lean;
  // Preserve sole placement after adding the anticipatory torso lean.
  founder.legs.forEach((leg, i) => {
    leg.rotation.x -= founder.body.rotation.x - previousLean;
    if (!reduced)
      leg.rotation.x += Math.sin(time * 5 + i * Math.PI) * 0.16 * pose.walk;
  });
  founder.arms.forEach((arm, i) =>
    arm.rotation.set(
      -0.12 -
        0.4 * pose.seated +
        (reduced ? 0 : Math.sin(time * 5 + i * Math.PI) * 0.1 * pose.walk),
      0,
      (i ? -1 : 1) * 0.045,
    ),
  );
  const listening =
    s.phase === "approach" ? ease((time - 3.5) / 2) : pose.seated;
  founder.head.rotation.set(0.04 + 0.045 * pose.seated, 0.45 * listening, 0);
  actors.expression(founder, time, reduced, pose.seated > 0.8);
  actors.articulate(founder, {
    hands: [0.15 + pose.grip * 0.65, 0.16],
    wrists: [pose.grip * 0.1, 0],
    concern: 0.08,
    warmth: 0.24 + 0.12 * pose.seated,
    gaze: [0.1 * listening, -0.02],
  });
  if (pose.grip > 0) {
    chair.updateWorldMatrix(true, false);
    const target = chair.localToWorld(new T.Vector3(0.18, 1.055, 0.25));
    const rest = actors.handWorld(founder, 0);
    if (rest.length === 3)
      target.lerpVectors(new T.Vector3().fromArray(rest), target, pose.grip);
    actors.reach(founder, 0, target);
  }
  if (pose.seated > 0) {
    // Rest the free hand on the thigh, then bring the other hand back from the chair.
    for (const i of [0, 1]) {
      const rest = actors.handWorld(founder, i);
      const lap = founder.root.localToWorld(
        new T.Vector3(i ? 0.19 : -0.19, 0.66, 0.19),
      );
      if (rest.length === 3)
        lap.lerpVectors(new T.Vector3().fromArray(rest), lap, pose.seated);
      actors.reach(founder, i, lap);
    }
  }
  const attention = s.phase === "approach" ? ease((time - 3) / 2.7) : 1;
  researcher.head.rotation.set(
    0.1 - 0.06 * attention,
    -0.12 - 0.48 * attention,
    -0.015 * attention,
  );
  actors.expression(researcher, time + 1.7, reduced);
  actors.articulate(researcher, {
    hands: [0.14, 0.16],
    wrists: [0, 0],
    concern: 0.35 - 0.2 * pose.seated,
    warmth: 0.08 + 0.14 * pose.seated,
    gaze: [-0.18 * attention, 0],
  });
}
