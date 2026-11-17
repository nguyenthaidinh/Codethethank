import { describe, it, expect } from "vitest";
import {
  freshRipple,
  rippleReducer,
  readRipple,
  durations,
  founderRevealed,
  type RippleSave,
} from "../src/ripple/state";
import {
  freshVerdict,
  verdictReducer,
  readVerdict,
} from "../src/verdict/state";
import { freshStay } from "../src/stayed/state";
const advance = (s: RippleSave) =>
  rippleReducer(
    rippleReducer(s, { type: "tick", elapsed: durations[s.phase] ?? 0 }),
    { type: "advance" },
  );
describe("Ripple progression and checkpoints", () => {
  it("requires the full Chapter 02 boundary", () => {
    const v = {
      ...freshVerdict,
      phase: "chapter02" as const,
      stayed: freshStay,
    };
    expect(verdictReducer(v, { type: "begin-ripple" })).toBe(v);
    const done = {
      ...v,
      stayed: {
        ...freshStay,
        phase: "next" as const,
        read: ["outcome", "support"] as ("outcome" | "support")[],
        written: true,
        nextInspected: true,
      },
    };
    expect(verdictReducer(done, { type: "begin-ripple" }).ripple?.phase).toBe(
      "sketch",
    );
  });
  it("walks all milestones, reveal, callback and all memories with valid saves", () => {
    let s = freshRipple;
    expect(rippleReducer(s, { type: "reframe" })).toBe(s);
    for (const id of ["prediction", "opportunity"] as const)
      s = rippleReducer(s, { type: "question", id });
    s = rippleReducer(s, { type: "reframe" });
    s = advance(s);
    for (let i = 0; i < 3; i++) {
      expect(s.milestones).toBe(i);
      expect(founderRevealed(s)).toBe(false);
      s = rippleReducer(s, { type: "object" });
      if (i === 1) {
        expect(s.phase).toBe("years");
        expect(s.lab2035).toBeDefined();
        const lab = (
          action: import("../src/ripple/experiment2035").Experiment2035Action,
        ) => {
          s = rippleReducer(s, { type: "lab2035", action });
        };
        lab({ type: "load", source: "record" });
        lab({ type: "run" });
        lab({ type: "tick", elapsed: 2.2 });
        lab({ type: "load", source: "access" });
        lab({ type: "run" });
        lab({ type: "tick", elapsed: 2.2 });
        lab({ type: "mark" });
        s = rippleReducer(s, { type: "object" });
        for (const action of [
          { type: "condition", value: "uncertain" },
          { type: "decision", value: "review" },
          { type: "test" },
          { type: "tick", elapsed: 1.8 },
        ] as import("../src/ripple/codePatch2035").CodePatch2035Action[])
          s = rippleReducer(s, {
            type: "lab2035",
            action: { type: "code", action },
          });
        expect(s.lab2035?.codePatch?.status).toBe("passed");
        s = rippleReducer(s, { type: "object" });
      }
      s = advance(s);
      expect(readRipple(s)).toEqual(s);
    }
    s = advance(s);
    s = rippleReducer(s, { type: "record" });
    expect(founderRevealed(s)).toBe(false);
    s = advance(s);
    expect(founderRevealed(s)).toBe(true);
    while (s.phase !== "reconstruct") s = advance(s);
    expect(rippleReducer(s, { type: "unlock" })).toBe(s);
    for (const id of ["evaluation", "stayed", "design"] as const)
      s = rippleReducer(s, { type: "memory", id });
    s = rippleReducer(s, { type: "unlock" });
    s = advance(s);
    expect(s.phase).toBe("finale");
    expect(readRipple(s)).toEqual(s);
  });
  it("rejects corrupt and premature checkpoints", () => {
    expect(readRipple({ ...freshRipple, phase: "reveal" })).toBeUndefined();
    expect(readRipple({ ...freshRipple, milestones: 3 })).toBeUndefined();
    expect(readRipple({ ...freshRipple, elapsed: Infinity })).toBeUndefined();
    expect(
      readRipple({ ...freshRipple, played: ["chair.chair"] }),
    ).toBeUndefined();
    expect(
      readVerdict({ ...freshVerdict, ripple: freshRipple }),
    ).toBeUndefined();
  });
  it("resumes timed cues and claims a chair event once", () => {
    const s = {
      ...freshRipple,
      phase: "chair" as const,
      questions: ["prediction", "opportunity"] as (
        "prediction" | "opportunity"
      )[],
      milestones: 3,
      elapsed: 1,
    };
    const once = rippleReducer(s, { type: "played", id: "chair.chair" });
    expect(rippleReducer(once, { type: "played", id: "chair.chair" })).toBe(
      once,
    );
    expect(readRipple(once)?.elapsed).toBe(1);
    expect(rippleReducer(once, { type: "advance" })).toBe(once);
  });
});
