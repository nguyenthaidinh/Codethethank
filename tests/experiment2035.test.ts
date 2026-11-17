import { describe, it, expect } from "vitest";
import {
  freshExperiment2035,
  experiment2035Reducer as reduce,
  readExperiment2035,
  complete2035,
} from "../src/ripple/experiment2035";
import {
  freshRipple,
  rippleReducer,
  readRipple,
  type RippleSave,
} from "../src/ripple/state";
const start: RippleSave = {
  ...freshRipple,
  phase: "years",
  milestones: 1,
  questions: ["prediction", "opportunity"],
};
const run = (s: ReturnType<typeof freshExperiment2035>) =>
  reduce(reduce(s, { type: "run" }), { type: "tick", elapsed: 2.2 });
describe("2035 experiment", () => {
  it("requires two real experiments and the missing-context discovery before moving on", () => {
    let r = rippleReducer(start, { type: "object" });
    expect(r.phase).toBe("years");
    expect(rippleReducer(r, { type: "object" })).toBe(r);
    let lab = run(reduce(r.lab2035!, { type: "load", source: "record" }));
    expect(lab.trials).toEqual([1]);
    expect(complete2035(lab)).toBe(false);
    expect(reduce(lab, { type: "mark" })).toBe(lab);
    lab = run(reduce(lab, { type: "load", source: "access" }));
    expect(complete2035(lab)).toBe(false);
    lab = reduce(lab, { type: "mark" });
    expect(complete2035(lab)).toBe(true);
    r = { ...r, lab2035: lab };
    r = rippleReducer(r, { type: "object" });
    expect(r.phase).toBe("years");
    expect(r.lab2035?.codePatch?.status).toBe("editing");
    r = rippleReducer(r, {
      type: "lab2035",
      action: { type: "code", action: { type: "skip" } },
    });
    expect(r.phase).toBe("milestone");
    expect(r.lab2035?.codePatch?.status).toBe("skipped");
  });
  it("allows the contextual experiment first, then switching off context for the control", () => {
    let s = reduce(
      reduce(freshExperiment2035(), { type: "load", source: "record" }),
      { type: "load", source: "access" },
    );
    s = run(s);
    expect(s.trials).toEqual([3]);
    s = run(reduce(s, { type: "toggle", source: "access" }));
    expect(s.trials).toEqual([3, 1]);
    expect(complete2035(reduce(s, { type: "mark" }))).toBe(true);
  });
  it("cannot run without academic data or change sources during a run", () => {
    const empty = freshExperiment2035();
    expect(reduce(empty, { type: "run" })).toBe(empty);
    let s = reduce(empty, { type: "load", source: "record" });
    s = reduce(s, { type: "run" });
    expect(reduce(s, { type: "toggle", source: "record" })).toBe(s);
    expect(reduce(s, { type: "load", source: "access" })).toBe(s);
  });
  it("resumes a partial run and retains the first output", () => {
    let s = run(
      reduce(freshExperiment2035(), { type: "load", source: "record" }),
    );
    s = reduce(reduce(s, { type: "load", source: "access" }), { type: "run" });
    s = reduce(s, { type: "tick", elapsed: 1.1 });
    const restored = readExperiment2035(JSON.parse(JSON.stringify(s)))!;
    expect(restored.running?.elapsed).toBe(1.1);
    expect(reduce(restored, { type: "tick", elapsed: 2.2 }).trials).toEqual([
      1, 3,
    ]);
  });
  it("rejects fabricated/invalid configurations and completion flags", () => {
    const s = freshExperiment2035();
    expect(readExperiment2035({ ...s, enabled: ["access"] })).toBeUndefined();
    expect(
      readExperiment2035({ ...s, marked: true, noteRead: true }),
    ).toBeUndefined();
    expect(
      readExperiment2035({
        ...s,
        trials: [3],
        selected: 3,
        loaded: ["record"],
      }),
    ).toBeUndefined();
    expect(
      readExperiment2035({ ...s, running: { mask: 1, elapsed: Infinity } }),
    ).toBeUndefined();
    expect(readRipple({ ...start, milestones: 2, lab2035: s })).toBeUndefined();
  });
  it("preserves old completed saves without inventing experiment evidence", () => {
    const old = { ...start, phase: "world" as const, milestones: 3 };
    expect(readRipple(old)).toEqual(old);
    expect(readRipple(old)?.lab2035).toBeUndefined();
    const active = { ...start, lab2035: freshExperiment2035() };
    expect(readRipple(active)).toEqual(active);
  });
});
