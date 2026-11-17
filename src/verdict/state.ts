import {
  freshFinale,
  readFinale,
  finaleReducer,
  type FinaleSave,
  type FinaleAction,
} from "../finale/state";
import {
  freshRipple,
  readRipple,
  rippleReducer,
  type RippleSave,
  type RippleAction,
} from "../ripple/state";
import { evidenceIds, type EvidenceId } from "./evidence";
import { profiles, type ProfileId } from "./rules";
import {
  freshStay,
  readStay,
  stayReducer,
  type StaySave,
  type StayAction,
} from "../stayed/state";
export type VerdictPhase =
  | "investigate"
  | "review"
  | "choose"
  | "running"
  | "result"
  | "reaction"
  | "connect"
  | "comparison"
  | "teacher_enter"
  | "chapter02";
export interface VerdictSave {
  flow?: "screen-first";
  preview?: ProfileId | null;
  reviewed?: ProfileId[];
  narrativeRevision?: 4;
  stayed?: StaySave;
  ripple?: RippleSave;
  finale?: FinaleSave;
  version: 1;
  phase: VerdictPhase;
  found: EvidenceId[];
  selected: ProfileId | null;
  tested: ProfileId[];
  linked: EvidenceId[];
  carried: EvidenceId | null;
}
export const freshVerdict: VerdictSave = {
  narrativeRevision: 4,
  version: 1,
  phase: "investigate",
  found: [],
  selected: null,
  tested: [],
  linked: [],
  carried: null,
};
/** The first refusal is already on screen before the player reaches the desk. */
export const initialClassroomCase: VerdictSave = {
  ...freshVerdict,
  flow: "screen-first",
  phase: "result",
  found: [...evidenceIds],
  selected: "student07",
  tested: ["student07"],
  preview: null,
  reviewed: [],
};
export const classroomReview: VerdictSave = {
  ...initialClassroomCase,
  phase: "review",
};
export const anUnlocked = (s: VerdictSave) =>
  s.found.length === 3 &&
  (s.narrativeRevision === 4
    ? s.tested.includes("student07")
    : s.tested.some((p) => p !== "an"));
export const profileUnlocked = (s: VerdictSave, id: ProfileId) =>
  s.flow === "screen-first"
    ? id !== "student07"
    : id === "an"
      ? anUnlocked(s)
      : s.narrativeRevision !== 4 ||
        id === "student07" ||
        s.tested.includes("student07");
export type VerdictAction =
  | { type: "review-profile"; id: ProfileId }
  | { type: "back-to-profiles" }
  | { type: "begin-finale" }
  | { type: "finale"; action: FinaleAction }
  | { type: "begin-ripple" }
  | { type: "ripple"; action: RippleAction }
  | { type: "stay"; action: StayAction }
  | { type: "inspect"; id: EvidenceId }
  | { type: "prepare" }
  | { type: "choose"; id: ProfileId }
  | { type: "run" }
  | { type: "finish" }
  | { type: "acknowledge" }
  | { type: "settle" }
  | { type: "link" }
  | { type: "compared" }
  | { type: "arrived" };
export function verdictReducer(s: VerdictSave, a: VerdictAction): VerdictSave {
  if (
    a.type === "back-to-profiles" &&
    s.flow === "screen-first" &&
    s.phase === "choose"
  )
    return { ...s, phase: "review", selected: "student07" };
  if (
    a.type === "review-profile" &&
    s.flow === "screen-first" &&
    s.phase === "review"
  )
    return {
      ...s,
      preview: a.id,
      reviewed: [...new Set([...(s.reviewed ?? []), a.id])],
    };
  if (
    a.type === "prepare" &&
    s.phase === "review" &&
    s.preview &&
    s.preview !== "student07"
  )
    return { ...s, phase: "choose", selected: s.preview };
  if (
    a.type === "begin-finale" &&
    s.phase === "chapter02" &&
    s.stayed?.written &&
    s.stayed.nextInspected &&
    s.stayed.read.length === 2 &&
    s.ripple?.phase === "finale" &&
    s.ripple.milestones === 3 &&
    s.ripple.questions.length === 2 &&
    s.ripple.memories.length === 3 &&
    !s.finale
  )
    return { ...s, finale: freshFinale };
  if (a.type === "finale" && s.finale)
    return { ...s, finale: finaleReducer(s.finale, a.action) };
  if (
    a.type === "begin-ripple" &&
    s.phase === "chapter02" &&
    s.stayed?.phase === "next" &&
    s.stayed.nextInspected &&
    s.stayed.written &&
    s.stayed.read.length === 2 &&
    !s.ripple
  )
    return { ...s, ripple: freshRipple };
  if (a.type === "ripple" && s.ripple)
    return { ...s, ripple: rippleReducer(s.ripple, a.action) };
  if (a.type === "stay" && s.phase === "chapter02" && !s.ripple)
    return { ...s, stayed: stayReducer(s.stayed ?? freshStay, a.action) };
  if (
    a.type === "inspect" &&
    ["investigate", "choose", "result", "connect"].includes(s.phase)
  ) {
    const found = [...new Set([...s.found, a.id])];
    return { ...s, found, carried: s.phase === "connect" ? a.id : null };
  }
  if (a.type === "prepare" && s.phase === "investigate" && s.found.length === 3)
    return { ...s, phase: "choose" };
  if (
    a.type === "choose" &&
    ["choose", "result"].includes(s.phase) &&
    profileUnlocked(s, a.id)
  )
    return { ...s, selected: a.id, phase: "choose" };
  if (a.type === "run" && s.phase === "choose" && s.selected)
    return { ...s, phase: "running" };
  if (a.type === "finish" && s.phase === "running" && s.selected)
    return {
      ...s,
      tested: [...new Set([...s.tested, s.selected])],
      phase:
        s.flow === "screen-first" || s.selected === "an"
          ? "reaction"
          : "result",
    };
  if (a.type === "acknowledge" && s.phase === "result")
    return { ...s, phase: "choose", selected: null };
  if (a.type === "settle" && s.phase === "reaction")
    return {
      ...s,
      phase: s.flow === "screen-first" ? "teacher_enter" : "connect",
      carried: null,
    };
  if (
    a.type === "link" &&
    s.phase === "connect" &&
    s.carried &&
    !s.linked.includes(s.carried)
  ) {
    const linked = [...new Set([...s.linked, s.carried])];
    return { ...s, linked, phase: "comparison" };
  }
  if (a.type === "compared" && s.phase === "comparison")
    return {
      ...s,
      carried: null,
      phase: s.linked.length >= 2 ? "teacher_enter" : "connect",
    };
  if (a.type === "arrived" && s.phase === "teacher_enter")
    return {
      ...s,
      phase: "chapter02",
      stayed: { ...freshStay, interactive: s.flow === "screen-first" },
    };
  return s;
}
export function readVerdict(raw: unknown): VerdictSave | undefined {
  if (!raw || typeof raw !== "object") return;
  const s = raw as VerdictSave;
  if (
    s.version !== 1 ||
    (s.flow !== undefined && s.flow !== "screen-first") ||
    (s.narrativeRevision !== undefined && s.narrativeRevision !== 4) ||
    ![
      "investigate",
      "review",
      "choose",
      "running",
      "result",
      "reaction",
      "connect",
      "comparison",
      "teacher_enter",
      "chapter02",
    ].includes(s.phase)
  )
    return;
  if (
    !Array.isArray(s.found) ||
    !Array.isArray(s.linked) ||
    !Array.isArray(s.tested) ||
    s.found.some((v) => !evidenceIds.includes(v)) ||
    s.linked.some((v) => !evidenceIds.includes(v)) ||
    s.tested.some((v) => !Object.keys(profiles).includes(v))
  )
    return;
  if (s.selected !== null && !Object.keys(profiles).includes(s.selected))
    return;
  if (
    s.flow === "screen-first" &&
    ["choose", "running"].includes(s.phase) &&
    s.selected === "student07"
  )
    return;
  if (
    (s.preview != null && !Object.keys(profiles).includes(s.preview)) ||
    (s.reviewed !== undefined &&
      (!Array.isArray(s.reviewed) ||
        s.reviewed.some((id) => !Object.keys(profiles).includes(id)) ||
        new Set(s.reviewed).size !== s.reviewed.length)) ||
    (s.preview != null && !s.reviewed?.includes(s.preview)) ||
    (s.flow === "screen-first" &&
      (!s.tested.includes("student07") || s.found.length !== 3)) ||
    (s.phase === "review" &&
      (s.flow !== "screen-first" || s.selected !== "student07"))
  )
    return;
  if (s.carried !== null && !evidenceIds.includes(s.carried)) return;
  if (
    new Set(s.found).size !== s.found.length ||
    new Set(s.tested).size !== s.tested.length ||
    new Set(s.linked).size !== s.linked.length
  )
    return;
  if (s.phase !== "investigate" && s.found.length !== 3) return;
  if (
    s.narrativeRevision === 4 &&
    !s.tested.includes("student07") &&
    (s.tested.length > 0 || (s.selected !== null && s.selected !== "student07"))
  )
    return;
  if (
    ["running", "result", "reaction"].includes(s.phase) &&
    s.selected === null
  )
    return;
  if ((s.selected === "an" || s.tested.includes("an")) && !anUnlocked(s))
    return;
  if (
    [
      "reaction",
      "connect",
      "comparison",
      "teacher_enter",
      "chapter02",
    ].includes(s.phase) &&
    (s.flow === "screen-first"
      ? s.selected === null ||
        !s.tested.includes(s.selected) ||
        s.tested.length < 2
      : !s.tested.includes("an") || s.selected !== "an")
  )
    return;
  if (s.phase === "comparison" && (!s.carried || !s.linked.includes(s.carried)))
    return;
  if (
    s.linked.some((id) => !s.found.includes(id)) ||
    (s.carried && !s.found.includes(s.carried))
  )
    return;
  if (
    s.flow !== "screen-first" &&
    ["teacher_enter", "chapter02"].includes(s.phase) &&
    s.linked.length < 2
  )
    return;
  const stayed =
    s.phase === "chapter02" ? (readStay(s.stayed) ?? freshStay) : undefined;
  const ripple = s.ripple ? readRipple(s.ripple) : undefined;
  if (
    s.ripple &&
    (!ripple ||
      !stayed?.nextInspected ||
      !stayed.written ||
      stayed.read.length !== 2)
  )
    return;
  const finale = s.finale ? readFinale(s.finale) : undefined;
  if (
    s.finale &&
    (!finale || ripple?.phase !== "finale" || ripple.memories.length !== 3)
  )
    return;
  // A completed revelation is never replayed on Continue. Interrupted runs return to selection.
  return {
    ...s,
    stayed,
    ripple,
    finale,
    phase:
      s.phase === "running"
        ? "choose"
        : s.phase === "reaction"
          ? s.flow === "screen-first"
            ? "teacher_enter"
            : "connect"
          : s.phase,
  };
}
