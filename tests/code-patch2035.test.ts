import { describe, it, expect } from "vitest";
import {
  freshCodePatch2035,
  codePatch2035Reducer as reduce,
  readCodePatch2035,
  evaluatePatch2035,
  type Condition2035,
  type Decision2035,
} from "../src/ripple/codePatch2035";
import {
  freshRipple,
  rippleReducer,
  readRipple,
  type RippleSave,
} from "../src/ripple/state";
import { freshExperiment2035 } from "../src/ripple/experiment2035";
const discovered = () => ({
  ...freshExperiment2035(),
  loaded: ["record", "access"] as ("record" | "access")[],
  enabled: ["record", "access"] as ("record" | "access")[],
  trials: [1, 3] as (1 | 3)[],
  selected: 3 as const,
  noteRead: true,
  marked: true,
});
const checkpoint = (): RippleSave => ({
  ...freshRipple,
  phase: "years",
  milestones: 1,
  questions: ["prediction", "opportunity"],
  lab2035: discovered(),
});
describe("2035 optional code patch", () => {
  it("runs the shown branch against all profiles; only a targeted review guard passes", () => {
    for (const c of ["low-benefit", "uncertain", "always"] as Condition2035[])
      for (const d of ["reject", "approve", "review"] as Decision2035[])
        expect(evaluatePatch2035(c, d).every((t) => t.passed)).toBe(
          c === "uncertain" && d === "review",
        );
  });
  it("permits retry after real failures and records a successful tested draft", () => {
    let s = reduce(reduce(freshCodePatch2035(), { type: "test" }), {
      type: "tick",
      elapsed: 1.8,
    });
    expect(s.status).toBe("editing");
    expect(s.checked).not.toBeNull();
    s = reduce(reduce(s, { type: "condition", value: "uncertain" }), {
      type: "decision",
      value: "review",
    });
    expect(s.checked).toBeNull();
    s = reduce(reduce(s, { type: "test" }), { type: "tick", elapsed: 1.8 });
    expect(s.status).toBe("passed");
    expect(readCodePatch2035(s)).toEqual(s);
  });
  it("opens code after discovery and prevents exit until passed or explicitly skipped", () => {
    const s = rippleReducer(checkpoint(), { type: "object" });
    expect(s.phase).toBe("years");
    expect(s.lab2035?.codePatch).toBeDefined();
    expect(rippleReducer(s, { type: "object" })).toBe(s);
    const skip = rippleReducer(s, {
      type: "lab2035",
      action: { type: "code", action: { type: "skip" } },
    });
    expect(skip.phase).toBe("milestone");
    expect(skip.lab2035?.codePatch?.status).toBe("skipped");
    expect(skip.lab2035?.codePatch?.checked).toBeNull();
    expect(skip.lab2035?.trials).toEqual([1, 3]);
    expect(readRipple(skip)).toEqual(skip);
  });
  it("cannot use the code skip to bypass the investigation", () => {
    const s = { ...checkpoint(), lab2035: freshExperiment2035() };
    expect(
      rippleReducer(s, {
        type: "lab2035",
        action: { type: "code", action: { type: "skip" } },
      }),
    ).toBe(s);
  });
  it("resumes an in-flight test without changing the draft", () => {
    let s = reduce(
      reduce(freshCodePatch2035(), { type: "condition", value: "uncertain" }),
      { type: "decision", value: "review" },
    );
    s = reduce(reduce(s, { type: "test" }), { type: "tick", elapsed: 0.7 });
    const restored = readCodePatch2035(JSON.parse(JSON.stringify(s)))!;
    expect(restored.elapsed).toBe(0.7);
    expect(reduce(restored, { type: "tick", elapsed: 1.8 }).status).toBe(
      "passed",
    );
  });
  it("rejects untested success, impossible drafts and incomplete code carried past 2035", () => {
    const s = freshCodePatch2035();
    expect(readCodePatch2035({ ...s, status: "passed" })).toBeUndefined();
    expect(readCodePatch2035({ ...s, condition: "<script>" })).toBeUndefined();
    expect(readCodePatch2035({ ...s, elapsed: Infinity })).toBeUndefined();
    expect(
      readRipple({
        ...checkpoint(),
        phase: "milestone",
        lab2035: { ...discovered(), codePatch: s },
      }),
    ).toBeUndefined();
    expect(
      readRipple({ ...checkpoint(), phase: "world", milestones: 3 }),
    ).toBeDefined();
  });
});
