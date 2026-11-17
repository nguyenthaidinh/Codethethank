export type RipplePhase =
  | "sketch"
  | "change"
  | "years"
  | "milestone"
  | "world"
  | "record"
  | "align"
  | "reveal"
  | "approach"
  | "echo"
  | "chair"
  | "reflection"
  | "reconstruct"
  | "principle"
  | "finale";
import {
  freshExperiment2035,
  experiment2035Reducer,
  readExperiment2035,
  complete2035,
  type Experiment2035,
  type Experiment2035Action,
} from "./experiment2035";
import { freshCodePatch2035, resolvedCodePatch2035 } from "./codePatch2035";
export type MemoryId = "evaluation" | "stayed" | "design";
export interface RippleSave {
  version: 1;
  phase: RipplePhase;
  questions: ("prediction" | "opportunity")[];
  milestones: number;
  memories: MemoryId[];
  selected: MemoryId | null;
  elapsed: number;
  played: string[];
  lab2035?: Experiment2035;
}
export const freshRipple: RippleSave = {
  version: 1,
  phase: "sketch",
  questions: [],
  milestones: 0,
  memories: [],
  selected: null,
  elapsed: 0,
  played: [],
};
export const durations: Partial<Record<RipplePhase, number>> = {
  change: 7,
  milestone: 6,
  world: 13,
  align: 8,
  reveal: 12,
  approach: 7,
  echo: 6,
  chair: 6,
  reflection: 4,
  principle: 9,
};
const order: RipplePhase[] = [
  "sketch",
  "change",
  "years",
  "milestone",
  "world",
  "record",
  "align",
  "reveal",
  "approach",
  "echo",
  "chair",
  "reflection",
  "reconstruct",
  "principle",
  "finale",
];
export const memoryIds: MemoryId[] = ["evaluation", "stayed", "design"];
export type RippleAction =
  | { type: "question"; id: "prediction" | "opportunity" }
  | { type: "reframe" }
  | { type: "object" }
  | { type: "record" }
  | { type: "memory"; id: MemoryId }
  | { type: "unlock" }
  | { type: "advance" }
  | { type: "tick"; elapsed: number }
  | { type: "played"; id: string }
  | { type: "lab2035"; action: Experiment2035Action };
const move = (s: RippleSave, phase: RipplePhase): RippleSave => ({
  ...s,
  phase,
  elapsed: 0,
});
export function rippleReducer(s: RippleSave, a: RippleAction): RippleSave {
  if (a.type === "tick")
    return {
      ...s,
      elapsed: Math.max(
        s.elapsed,
        Math.min(durations[s.phase] ?? 0, a.elapsed),
      ),
    };
  if (a.type === "played")
    return s.played.includes(a.id) ? s : { ...s, played: [...s.played, a.id] };
  if (a.type === "question" && s.phase === "sketch")
    return { ...s, questions: [...new Set([...s.questions, a.id])] };
  if (a.type === "reframe" && s.phase === "sketch" && s.questions.length === 2)
    return move(s, "change");
  if (
    a.type === "lab2035" &&
    s.phase === "years" &&
    s.milestones === 1 &&
    s.lab2035
  ) {
    const lab2035 = experiment2035Reducer(s.lab2035, a.action);
    if (lab2035 === s.lab2035) return s;
    const next = { ...s, lab2035 };
    return lab2035.codePatch?.status === "skipped"
      ? move(next, "milestone")
      : next;
  }
  if (a.type === "object" && s.phase === "years") {
    if (s.milestones === 1) {
      if (!s.lab2035) return { ...s, lab2035: freshExperiment2035() };
      if (!complete2035(s.lab2035)) return s;
      if (!s.lab2035.codePatch)
        return {
          ...s,
          lab2035: { ...s.lab2035, codePatch: freshCodePatch2035() },
        };
      if (!resolvedCodePatch2035(s.lab2035.codePatch)) return s;
    }
    return move(s, "milestone");
  }
  if (a.type === "record" && s.phase === "record") return move(s, "align");
  if (a.type === "memory" && s.phase === "reconstruct")
    return {
      ...s,
      selected: a.id,
      memories: [...new Set([...s.memories, a.id])],
    };
  if (
    a.type === "unlock" &&
    s.phase === "reconstruct" &&
    s.memories.length === 3
  )
    return move(s, "principle");
  if (
    a.type === "advance" &&
    durations[s.phase] &&
    s.elapsed >= durations[s.phase]!
  ) {
    if (s.phase === "milestone") {
      const milestones = s.milestones + 1;
      return { ...move(s, milestones === 3 ? "world" : "years"), milestones };
    }
    if (s.phase === "change") return move(s, "years");
    if (s.phase === "world") return move(s, "record");
    return move(s, order[order.indexOf(s.phase) + 1]);
  }
  return s;
}
export function founderRevealed(s: RippleSave) {
  return order.indexOf(s.phase) >= order.indexOf("reveal");
}
export function readRipple(value: unknown): RippleSave | undefined {
  if (!value || typeof value !== "object") return;
  const s = value as RippleSave;
  if (
    s.version !== 1 ||
    !order.includes(s.phase) ||
    !Number.isInteger(s.milestones) ||
    s.milestones < 0 ||
    s.milestones > 3 ||
    !Number.isFinite(s.elapsed) ||
    s.elapsed < 0 ||
    s.elapsed > (durations[s.phase] ?? 0) ||
    !Array.isArray(s.questions) ||
    s.questions.some((id) => !["prediction", "opportunity"].includes(id)) ||
    new Set(s.questions).size !== s.questions.length ||
    !Array.isArray(s.memories) ||
    s.memories.some((id) => !memoryIds.includes(id)) ||
    new Set(s.memories).size !== s.memories.length ||
    !Array.isArray(s.played) ||
    s.played.some(
      (id) => !["echo.chair", "chair.chair", "reveal.music"].includes(id),
    ) ||
    (s.selected !== null && !s.memories.includes(s.selected))
  )
    return;
  if (s.phase !== "sketch" && s.questions.length !== 2) return;
  const index = order.indexOf(s.phase);
  const lab2035 =
    s.lab2035 === undefined ? undefined : readExperiment2035(s.lab2035);
  if (s.lab2035 !== undefined && !lab2035) return;
  if (
    lab2035?.codePatch &&
    (s.milestones > 1 || index >= 4 || s.phase === "milestone") &&
    !resolvedCodePatch2035(lab2035.codePatch)
  )
    return;
  if (
    lab2035 &&
    (index < 2 ||
      s.milestones < 1 ||
      ((s.milestones > 1 ||
        index >= 4 ||
        (s.phase === "milestone" && s.milestones === 1)) &&
        !complete2035(lab2035)))
  )
    return;
  if (index >= 4 && s.milestones !== 3) return;
  if (index < 4 && s.milestones === 3) return;
  if (index < 12 && s.memories.length) return;
  if (index >= 13 && s.memories.length !== 3) return;
  if (s.played.includes("chair.chair") && index < 10) return;
  if (s.played.includes("echo.chair") && index < 9) return;
  if (s.played.includes("reveal.music") && index < 7) return;
  return {
    ...s,
    questions: [...s.questions],
    memories: [...s.memories],
    played: [...new Set(s.played)],
    ...(lab2035 ? { lab2035 } : {}),
  };
}
