import { CHAIR_MOTIF } from "./motifs";
import type { StayPhase } from "../stayed/story";
import { TEACHER_ENTRANCE, teacherEntrancePose } from "./TeacherEntrance";
import { AN_SETBACK } from "./AnSetback";

type XYZ = [number, number, number];
export interface ClassroomShot {
  id:
    | "chair.insert"
    | "chair.sit"
    | "conversation.master"
    | "an.setback"
    | "teacher.entrance"
    | "classroom.introduction";
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

/** Look toward the actual doorway, then track her walk into the room. */
export function teacherEntranceShot(
  time: number,
  vertical: boolean,
  reduced: boolean,
): ClassroomShot {
  const p = teacherEntrancePose(time, reduced).walk;
  return {
    id: "teacher.entrance",
    eye: reduced
      ? [0.2, 2.05, -1.8]
      : blend([0.2, 1.8, 2.1], [-0.2, 1.7, -1.4], p),
    at: reduced
      ? [2.2, 1.3, 3.2]
      : blend([2.45, 1.45, 5.8], [1.9, 1.3, 0.7], p),
    fov: reduced ? (vertical ? 65 : 50) : (vertical ? 65 : 50) - p * 3,
  };
}

/** Continue the final shot of An, travelling along the aisle before the door opens. */
export function teacherArrivalShot(
  time: number,
  vertical: boolean,
  reduced: boolean,
): ClassroomShot {
  const incoming = teacherEntranceShot(
    Math.max(0, time - TEACHER_ENTRANCE.lead),
    vertical,
    reduced,
  );
  if (reduced || time >= TEACHER_ENTRANCE.lead) return incoming;
  const from = anSetbackShot(vertical, AN_SETBACK.duration, false);
  const u = Math.max(0, time / TEACHER_ENTRANCE.lead);
  const p = u * u * u * (u * (u * 6 - 15) + 10);
  return {
    id: "teacher.entrance",
    eye: blend(from.eye, incoming.eye, p),
    at: blend(from.at, incoming.at, p),
    fov: from.fov + (incoming.fov - from.fov) * p,
  };
}

export const seatedMaster = {
  eye: [0.75, 1.5, -1.25] as XYZ,
  at: [0.3, 1.22, 0.03] as XYZ,
  fov: 64,
};

/** Keep An's face, striking hand and the clear edge of the desk in one frame. */
export function anSetbackShot(
  vertical: boolean,
  time = AN_SETBACK.showAnAt,
  reduced = false,
): ClassroomShot {
  const settle = reduced ? 0 : ease((time - 9.3) / (AN_SETBACK.quietAt - 9.3));
  return {
    id: "an.setback",
    eye: vertical
      ? blend([1.9, 2.05, -1.3], [0.8, 1.75, -1.8], settle)
      : blend([1.3, 1.75, -0.85], [0.45, 1.52, -1.35], settle),
    at: blend(
      [-0.45, 1.08, -0.22],
      vertical ? [-0.45, 1.15, -0.1] : [-0.5, 1.21, -0.02],
      settle,
    ),
    fov: vertical ? 55 : 46,
  };
}
function portrait(
  shot: ClassroomShot,
  vertical: boolean,
  push = 1,
): ClassroomShot {
  if (!vertical || shot.id === "chair.insert") return shot;
  // The portrait composition keeps both faces outside the laptop silhouette.
  return {
    ...shot,
    eye: blend([2.6, 1.86, -3.0], [2.3, 1.7, -2.65], push),
    at: blend([0.4, 1.03, 0.05], [0.4, 0.98, 0.04], push),
    fov: 65,
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
        eye: blend([0.85, 1.7, -1.55], seatedMaster.eye, push),
        at: blend([0.3, 1.3, 0.08], seatedMaster.at, push),
        fov: 64,
      },
      vertical,
      push,
    );
  }
  if (focus === "faces" && (phase === "question" || phase === "second_chance"))
    return portrait({ id: "conversation.master", ...seatedMaster }, vertical);
  return null;
}
