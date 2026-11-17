import {
  stayLines,
  notes,
  replyMoments,
  stayChoice,
  type StayPhase,
  type NoteId,
  type ReplyMoment,
  type ReplyId,
} from "./story";
export interface StaySave {
  interactive?: boolean;
  responses?: Partial<Record<ReplyMoment, ReplyId>>;
  narrativeRevision?: 4;
  version: 1;
  phase: StayPhase;
  line: number;
  read: NoteId[];
  page: NoteId | null;
  written: boolean;
  seen: string[];
  nextInspected: boolean;
}
export const freshStay: StaySave = {
  narrativeRevision: 4,
  version: 1,
  phase: "discussion",
  line: 0,
  read: [],
  page: null,
  written: false,
  seen: [],
  nextInspected: false,
};
const phases: StayPhase[] = [
  "discussion",
  "chair",
  "question",
  "notebook",
  "second_chance",
  "unwritten",
  "written",
  "closing",
  "next",
];
export const cueKey = (s: StaySave) => `${s.phase}.${s.line}`;
export type StayAction =
  | { type: "reply"; id: ReplyId }
  | { type: "advance"; cue?: string }
  | { type: "skip" }
  | { type: "read"; id: NoteId }
  | { type: "finish-notes" }
  | { type: "write" }
  | { type: "inspect-next" }
  | { type: "replay" };
export function stayReducer(s: StaySave, a: StayAction): StaySave {
  if (a.type === "reply") {
    const choice = stayChoice(s);
    if (!choice || !choice.options.some((option) => option.id === a.id))
      return s;
    return { ...s, responses: { ...s.responses, [choice.key]: a.id } };
  }
  if (a.type === "read" && s.phase === "notebook")
    return { ...s, page: a.id, read: [...new Set([...s.read, a.id])] };
  if (
    a.type === "finish-notes" &&
    s.phase === "notebook" &&
    s.read.length === 2
  )
    return { ...s, phase: "second_chance", line: 0 };
  if (a.type === "write" && s.phase === "unwritten" && s.read.length === 2)
    return { ...s, written: true, phase: "written", line: 0 };
  if (a.type === "inspect-next" && s.phase === "next")
    return { ...s, nextInspected: true };
  if (a.type === "replay" && s.phase === "next")
    return { ...freshStay, interactive: s.interactive, seen: [...s.seen] };
  if (a.type === "advance" || a.type === "skip") {
    if (a.type === "advance" && a.cue !== undefined && a.cue !== cueKey(s))
      return s;
    if (stayChoice(s)) return s;
    const lines = stayLines[s.phase];
    if (!lines || (a.type === "skip" && !s.seen.includes(cueKey(s)))) return s;
    const seen = [...new Set([...s.seen, cueKey(s)])];
    if (s.line + 1 < lines.length) return { ...s, seen, line: s.line + 1 };
    return { ...s, seen, phase: phases[phases.indexOf(s.phase) + 1], line: 0 };
  }
  return s;
}
export function readStay(raw: unknown): StaySave | undefined {
  if (!raw || typeof raw !== "object") return;
  const s = raw as StaySave;
  const oldLengths: Partial<Record<StayPhase, number>> = {
    discussion: 2,
    chair: 1,
    question: 5,
    second_chance: 3,
    written: 1,
    closing: 1,
  };
  const legacy = s.narrativeRevision === undefined;
  const script = legacy
    ? Object.fromEntries(
        Object.entries(oldLengths).map(([k, n]) => [k, Array(n).fill(null)]),
      )
    : stayLines;
  const keys = Object.entries(script).flatMap(([p, lines]) =>
    lines.map((_, i) => `${p}.${i}`),
  );
  if (
    s.version !== 1 ||
    (s.interactive !== undefined && typeof s.interactive !== "boolean") ||
    (s.responses !== undefined &&
      (!s.responses ||
        typeof s.responses !== "object" ||
        Array.isArray(s.responses) ||
        Object.entries(s.responses).some(
          ([key, id]) =>
            !(key in replyMoments) ||
            !replyMoments[key as ReplyMoment].options.some(
              (option) => option.id === id,
            ),
        ))) ||
    (s.narrativeRevision !== undefined && s.narrativeRevision !== 4) ||
    !phases.includes(s.phase) ||
    !Number.isInteger(s.line) ||
    s.line < 0 ||
    s.line >=
      (legacy
        ? (oldLengths[s.phase] ?? 1)
        : (stayLines[s.phase]?.length ?? 1)) ||
    typeof s.written !== "boolean" ||
    typeof s.nextInspected !== "boolean" ||
    !Array.isArray(s.read) ||
    s.read.some((id) => !Object.keys(notes).includes(id)) ||
    new Set(s.read).size !== s.read.length ||
    !Array.isArray(s.seen) ||
    s.seen.some((id) => !keys.includes(id)) ||
    (s.page !== null && !Object.keys(notes).includes(s.page))
  )
    return;
  if (s.page && !s.read.includes(s.page)) return;
  if (phases.indexOf(s.phase) > 3 && s.read.length !== 2) return;
  if (phases.indexOf(s.phase) >= 6 && !s.written) return;
  if (s.nextInspected && s.phase !== "next") return;
  return {
    ...s,
    narrativeRevision: 4,
    line: legacy ? 0 : s.line,
    read: [...s.read],
    seen: legacy ? [] : [...new Set(s.seen)],
  };
}
