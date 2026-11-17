export type FinalePhase =
  | "memory"
  | "lesson"
  | "question"
  | "paper"
  | "letter"
  | "review"
  | "transform"
  | "galaxy"
  | "closing"
  | "ending";
export const memoryFocusIds = ["evaluation", "chair", "notebook"] as const;
export type MemoryFocus = (typeof memoryFocusIds)[number];
export interface FinaleSave {
  memoryFocus?: MemoryFocus | null;
  version: 1;
  phase: FinalePhase;
  elapsed: number;
  choice: "letter" | "skip" | null;
  starSeen: boolean;
  starCue: boolean;
  completed: boolean;
}
export const freshFinale: FinaleSave = {
  memoryFocus: null,
  version: 1,
  phase: "memory",
  elapsed: 0,
  choice: null,
  starSeen: false,
  starCue: false,
  completed: false,
};
export const finaleDurations: Partial<Record<FinalePhase, number>> = {
  memory: 6,
  lesson: 20,
  question: 8,
  transform: 10,
  closing: 9,
};
const phases: FinalePhase[] = [
  "memory",
  "lesson",
  "question",
  "paper",
  "letter",
  "review",
  "transform",
  "galaxy",
  "closing",
  "ending",
];
export type FinaleAction =
  | { type: "focus-memory"; id: MemoryFocus }
  | { type: "tick"; elapsed: number }
  | { type: "advance" }
  | { type: "write" }
  | { type: "review" }
  | { type: "edit" }
  | { type: "commit" }
  | { type: "skip" }
  | { type: "star" }
  | { type: "star-cue" }
  | { type: "finish" }
  | { type: "inspect" };
const move = (s: FinaleSave, phase: FinalePhase): FinaleSave => ({
  ...s,
  phase,
  elapsed: 0,
});
export function finaleReducer(s: FinaleSave, a: FinaleAction): FinaleSave {
  if (
    a.type === "focus-memory" &&
    s.phase === "memory" &&
    memoryFocusIds.includes(a.id)
  )
    return s.memoryFocus === a.id ? s : { ...s, memoryFocus: a.id, elapsed: 0 };
  if (a.type === "tick")
    return {
      ...s,
      elapsed: Math.max(
        s.elapsed,
        Math.min(finaleDurations[s.phase] ?? 0, a.elapsed),
      ),
    };
  if (
    a.type === "advance" &&
    finaleDurations[s.phase] &&
    s.elapsed >= finaleDurations[s.phase]!
  ) {
    const phase = phases[phases.indexOf(s.phase) + 1];
    return { ...move(s, phase), completed: s.completed || phase === "ending" };
  }
  if (a.type === "write" && s.phase === "paper") return move(s, "letter");
  if (a.type === "review" && s.phase === "letter") return move(s, "review");
  if (a.type === "edit" && s.phase === "review") return move(s, "letter");
  if (a.type === "commit" && s.phase === "review")
    return { ...move(s, "transform"), choice: "letter" };
  if (a.type === "skip" && ["paper", "letter", "review"].includes(s.phase))
    return { ...move(s, "transform"), choice: "skip" };
  if (a.type === "star-cue" && s.phase === "transform")
    return { ...s, starCue: true };
  if (a.type === "star" && s.phase === "galaxy")
    return { ...s, starSeen: true };
  if (a.type === "finish" && s.phase === "galaxy")
    return move(s, s.completed ? "ending" : "closing");
  if (a.type === "inspect" && s.phase === "ending")
    return { ...move(s, "galaxy"), starSeen: true };
  return s;
}
export function readFinale(value: unknown): FinaleSave | undefined {
  if (!value || typeof value !== "object") return;
  const s = value as FinaleSave;
  if (
    s.version !== 1 ||
    !phases.includes(s.phase) ||
    !Number.isFinite(s.elapsed) ||
    s.elapsed < 0 ||
    s.elapsed > (finaleDurations[s.phase] ?? 0) ||
    !["letter", "skip", null].includes(s.choice) ||
    typeof s.starSeen !== "boolean" ||
    typeof s.starCue !== "boolean" ||
    typeof s.completed !== "boolean"
  )
    return;
  if (s.memoryFocus != null && !memoryFocusIds.includes(s.memoryFocus)) return;
  const i = phases.indexOf(s.phase);
  if (i >= 6 && s.choice === null) return;
  if (i < 6 && (s.choice !== null || s.starCue || s.starSeen || s.completed))
    return;
  if (i < 7 && s.starSeen) return;
  if (s.completed && !["ending", "galaxy"].includes(s.phase)) return;
  if (s.phase === "ending" && !s.completed) return;
  // Keep only progression fields. Personal content never enters game saves/telemetry.
  return {
    memoryFocus: s.memoryFocus ?? null,
    version: 1,
    phase: s.phase,
    elapsed: s.elapsed,
    choice: s.choice,
    starSeen: s.starSeen,
    starCue: s.starCue,
    completed: s.completed,
  };
}
