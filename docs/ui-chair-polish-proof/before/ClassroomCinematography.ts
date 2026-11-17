import { CHAIR_MOTIF } from "./motifs";
import type { StayPhase } from "../stayed/story";

type XYZ = [number, number, number];
export interface ClassroomShot {
  id: "chair.insert" | "chair.sit" | "conversation.master";
  eye: XYZ;
  at: XYZ;
  fov: number;
}
const ease = (value: number) => {
  const p = Math.max(0, Math.min(1, value));
  return p * p * (3 - 2 * p);
};
const blend = (a: XYZ, b: XYZ, t: number): XYZ =>
  a.map((v, i) => v + (b[i] - v) * t) as XYZ;

export const seatedMaster = {
  eye: [1.2, 1.8, -1.5] as XYZ,
  at: [0.25, 1.15, 0.03] as XYZ,
  fov: 48,
};
function portrait(
  shot: ClassroomShot,
  vertical: boolean,
  push = 1,
): ClassroomShot {
  if (!vertical || shot.id === "chair.insert") return shot;
  // The portrait composition keeps both faces outside the laptop silhouette.
  return {
    ...shot,
    eye: blend([2.9, 1.8, -5.15], [2.6, 1.7, -4.55], push),
    at: blend([0.35, 0.7, 0.05], [0.25, 0.65, 0.04], push),
    fov: 48,
  };
}

/** A neutral insert resets the axis, then a cut lets the audience see her sit.
 * The quiet push begins only after the seat has taken her weight. */
export function classroomShot(
  phase: StayPhase | undefined,
  focus: string,
  time: number,
  vertical: boolean,
  reduced: boolean,
): ClassroomShot | null {
  if (phase === "chair") {
    if (time < CHAIR_MOTIF.holdUntil)
      return {
        id: "chair.insert",
        eye: CHAIR_MOTIF.eye,
        at: CHAIR_MOTIF.at,
        fov: CHAIR_MOTIF.fov,
      };
    const push = reduced
      ? 1
      : ease((time - (CHAIR_MOTIF.holdUntil + CHAIR_MOTIF.sitSeconds)) / 1.8);
    return portrait(
      {
        id: "chair.sit",
        eye: blend([1.4, 1.86, -1.95], seatedMaster.eye, push),
        at: blend([0.3, 1.07, 0.08], seatedMaster.at, push),
        fov: 49 - push,
      },
      vertical,
      push,
    );
  }
  if (focus === "faces" && (phase === "question" || phase === "second_chance"))
    return portrait({ id: "conversation.master", ...seatedMaster }, vertical);
  return null;
}
