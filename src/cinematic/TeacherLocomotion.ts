import * as T from "three";
import type { NarrativeRig } from "../art/NarrativeActors";
import { CHAIR_MOTIF } from "./motifs";
import { teacherEntrancePose, TEACHER_ENTRANCE } from "./TeacherEntrance";

const ease = (v: number) => T.MathUtils.smootherstep(v, 0, 1);
const DOWN = new T.Vector3(0, -1, 0);
const STAND = 0.8425,
  THIGH = 0.4,
  SHIN = 0.397,
  SOLE = 0.0455;

/** Analytic two-link legs and ankle compensation; no accumulated animation state. */
export function plantTeacherFeet(
  rig: NarrativeRig,
  targets: T.Vector3[],
  heading: number,
  pitches: number[] = [0, 0],
) {
  if (!rig.feet) return;
  rig.body.updateWorldMatrix(true, true);
  targets.forEach((target, i) => {
    const leg = rig.legs[i],
      shin = rig.shins[i],
      foot = rig.feet![i];
    const to = rig.body.worldToLocal(target.clone()).sub(leg.position);
    const distance = T.MathUtils.clamp(
      to.length(),
      0.06,
      THIGH + SHIN - 0.00001,
    );
    const direction = to.normalize();
    const pole = new T.Vector3(0, 0, 1)
      .addScaledVector(direction, -direction.z)
      .normalize();
    const cos = T.MathUtils.clamp(
      (THIGH * THIGH + distance * distance - SHIN * SHIN) /
        (2 * THIGH * distance),
      -1,
      1,
    );
    const knee = direction
      .clone()
      .multiplyScalar(THIGH * cos)
      .addScaledVector(pole, THIGH * Math.sqrt(1 - cos * cos));
    leg.quaternion.setFromUnitVectors(DOWN, knee.clone().normalize());
    shin.quaternion.setFromUnitVectors(
      DOWN,
      direction
        .multiplyScalar(distance)
        .sub(knee)
        .normalize()
        .applyQuaternion(leg.quaternion.clone().invert()),
    );
    shin.updateWorldMatrix(true, false);
    const flat = new T.Quaternion().setFromEuler(
      new T.Euler(pitches[i], heading, 0, "YXZ"),
    );
    foot.quaternion.copy(
      shin.getWorldQuaternion(new T.Quaternion()).invert().multiply(flat),
    );
  });
}

/** A stance foot stays at its contact point while the other foot swings through. */
export function stepOffset(distance: number, index: number, stride: number) {
  const phase = distance / (2 * stride) + index * 0.5;
  const cycle = Math.floor(phase),
    u = phase - cycle;
  const origin = (cycle - index * 0.5) * 2 * stride;
  if (u < 0.5)
    return { along: origin + stride * 0.5, lift: 0, roll: 0, swing: 0 };
  const swing = (u - 0.5) * 2;
  return {
    along: origin + stride * 0.5 + 2 * stride * ease(swing),
    lift: Math.sin(Math.PI * swing) ** 2 * 0.075,
    roll: Math.sin(2 * Math.PI * swing) * 0.12,
    swing,
  };
}

export function applyTeacherLocomotion(
  rig: NarrativeRig,
  beat: string,
  time: number,
  reduced: boolean,
  discussion = false,
  cinematicEntrance = false,
) {
  if (!rig.feet || !["enter", "chair"].includes(beat)) return;
  const chair = beat === "chair";
  const entrance =
    cinematicEntrance && !chair ? teacherEntrancePose(time, reduced) : null;
  const heading = Math.PI + 0.16;
  const start = chair
    ? new T.Vector3(1.9, 0, 0.7)
    : entrance
      ? new T.Vector3(...TEACHER_ENTRANCE.start)
      : new T.Vector3(2.7, 0, 5.8);
  const finish = new T.Vector3(chair ? 1.1 : 1.9, 0, chair ? 0.05 : 0.7);
  const path = finish.clone().sub(start),
    length = path.length(),
    direction = path.normalize();
  const duration = chair ? CHAIR_MOTIF.dragSeconds : 4.5;
  const p = entrance?.walk ?? T.MathUtils.smoothstep(time / duration, 0, 1),
    distance = p * length;
  const envelope = reduced
    ? 0
    : chair
      ? ease(time / 0.25) * (1 - ease((time - 0.88) / 0.37))
      : (entrance?.gait ?? ease(time / 0.25) * (1 - ease((time - 3.6) / 0.9)));
  const stride = chair ? 0.32 : TEACHER_ENTRANCE.stride;
  const gait = Math.sin((distance / stride) * Math.PI);
  const preparation = chair ? ease((time - 1.25) / 1.35) : 0;
  const seatedReach = Math.sqrt(0.4 * 0.4 - (0.59 - 0.4425) ** 2);
  const sit = chair
    ? ease((time - CHAIR_MOTIF.holdUntil) / CHAIR_MOTIF.sitSeconds)
    : 0;
  // First move weight over the feet, then lower onto the seat and recover upright.
  const lean = chair ? Math.sin(Math.PI * sit) * 0.16 : 0;
  const compression =
    chair && !reduced
      ? Math.sin(Math.PI * ease((time - 3.72) / 0.5)) ** 2 * 0.009
      : 0;
  rig.root.rotation.y = chair
    ? Math.PI +
      0.16 * (1 - ease(time / 0.65)) +
      0.12 * ease((time - 1.25) / 1.35)
    : heading;
  rig.body.position.set(
    reduced ? 0 : gait * 0.012 * envelope,
    STAND -
      0.2525 * sit -
      (chair
        ? 0.035
        : entrance
          ? 0.055 - Math.cos((distance / stride) * Math.PI * 2) * 0.005
          : 0.062) *
        envelope -
      compression -
      0.042 * preparation * (1 - sit),
    chair
      ? 0.14 * preparation * (1 - sit) - 0.025 * Math.sin(Math.PI * sit)
      : 0,
  );
  rig.body.rotation.set(
    0.09 * sit + lean,
    reduced ? 0 : gait * 0.025 * envelope,
    reduced ? 0 : -gait * 0.018 * envelope,
  );
  const yaw = rig.root.rotation.y;
  const targets = [-1, 1].map((side, i) => {
    const step = stepOffset(distance, i, stride);
    const lateral = new T.Vector3(side * 0.1, 0, 0).applyAxisAngle(
      new T.Vector3(0, 1, 0),
      yaw,
    );
    const target = rig.root.position.clone().add(lateral);
    target.addScaledVector(direction, (step.along - distance) * envelope);
    // Short placement steps keep the torso outside the desktop while the
    // knees unlock. Both feet finish planting before the seated descent.
    const first = chair ? ease((time - 1.25) / 0.6) : 0;
    const second = chair ? ease((time - 1.95) / 0.65) : 0;
    const other = chair ? ease((time - 1.7) / 0.85) : 0;
    const reach =
      i === 0
        ? 0.18 * first + (seatedReach - 0.18) * second
        : seatedReach * other;
    const lift =
      i === 0
        ? 0.04 * Math.sin(Math.PI * first) ** 2 +
          0.035 * Math.sin(Math.PI * second) ** 2
        : 0.045 * Math.sin(Math.PI * other) ** 2;
    if (chair)
      target.add(
        new T.Vector3(0, 0, reach).applyAxisAngle(new T.Vector3(0, 1, 0), yaw),
      );
    target.y = SOLE + step.lift * envelope + (chair && !reduced ? lift : 0);
    return target;
  });
  plantTeacherFeet(
    rig,
    targets,
    yaw,
    [-1, 1].map((_, i) => stepOffset(distance, i, stride).roll * envelope),
  );
  if (!chair && !reduced && (entrance || time < 4.5)) {
    rig.arms.forEach((arm, i) =>
      arm.rotation.set(
        (i === 0 ? 1 : -1) * gait * 0.22 * envelope - 0.06,
        0,
        (i === 0 ? 1 : -1) * 0.04,
      ),
    );
    rig.head.rotation.x = 0.04;
    rig.head.rotation.y = 0;
  }
  if (discussion) {
    rig.body.rotation.x = 0.025;
    rig.legs.forEach((leg) => (leg.rotation.x -= 0.025));
  }
}
