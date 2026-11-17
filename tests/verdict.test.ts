import { describe, it, expect } from "vitest";
import { evaluate } from "../src/verdict/rules";
import {
  freshVerdict,
  verdictReducer as step,
  readVerdict,
  anUnlocked,
} from "../src/verdict/state";
import { readChapter } from "../src/chapter/director";
function studied() {
  let s = freshVerdict;
  for (const id of ["presentation", "notes", "data"] as const)
    s = step(s, { type: "inspect", id });
  return step(s, { type: "prepare" });
}
function testedAn() {
  let s = studied();
  for (const id of ["student07", "an"] as const) {
    s = step(s, { type: "choose", id });
    s = step(step(s, { type: "run" }), { type: "finish" });
    if (id === "student07") s = step(s, { type: "acknowledge" });
  }
  return s;
}
describe("The Verdict model and narrative gates", () => {
  it("uses one deterministic predicted-gain rule for every fictional profile", () => {
    expect(evaluate("mai")).toMatchObject({
      predictedGain: 9,
      recommended: false,
    });
    expect(evaluate("minh")).toMatchObject({
      predictedGain: 7,
      recommended: false,
    });
    expect(evaluate("an")).toMatchObject({
      predictedGain: 5,
      label: "NOT RECOMMENDED",
    });
    expect(evaluate("an")).toEqual(evaluate("an"));
  });
  it("requires all clues and a sample evaluation before selecting An", () => {
    expect(step(freshVerdict, { type: "prepare" })).toBe(freshVerdict);
    const s = studied();
    expect(anUnlocked(s)).toBe(false);
    expect(step(s, { type: "choose", id: "an" })).toBe(s);
    const done = step(
      step(step(s, { type: "choose", id: "student07" }), { type: "run" }),
      { type: "finish" },
    );
    expect(anUnlocked(done)).toBe(true);
  });
  it("guards double-run/double-finish and needs two distinct comparisons, without moral scoring", () => {
    let s = studied();
    s = step(step(s, { type: "choose", id: "student07" }), { type: "run" });
    expect(step(s, { type: "run" })).toBe(s);
    s = step(s, { type: "finish" });
    expect(step(s, { type: "finish" })).toBe(s);
    s = step(testedAn(), { type: "settle" });
    expect(step(s, { type: "arrived" })).toBe(s);
    for (const id of ["data", "notes"] as const) {
      s = step(s, { type: "inspect", id });
      s = step(s, { type: "link" });
      expect(step(s, { type: "link" })).toBe(s);
      s = step(s, { type: "compared" });
    }
    expect(s.phase).toBe("teacher_enter");
    expect(s.linked).toEqual(["data", "notes"]);
    expect(step(s, { type: "arrived" }).phase).toBe("chapter02");
  });
  it("checkpoints preserve evidence, runs and links without replaying An revelation", () => {
    const s = testedAn();
    expect(readVerdict(s)?.phase).toBe("connect");
    const running = step(step(studied(), { type: "choose", id: "student07" }), {
      type: "run",
    });
    expect(readVerdict(running)?.phase).toBe("choose");
    expect(readVerdict(running)?.tested).toEqual([]);
    const c = readChapter({
      version: 1,
      beat: "NEXT_SCENE_READY",
      signal: true,
      evidence: ["window", "laptop", "notebook"],
      verdict: s,
    });
    expect(c?.verdict?.tested).toEqual(["student07", "an"]);
    expect(c?.verdict?.found).toHaveLength(3);
  });
  it("rejects corrupt saves and fabricated entry to teacher scene", () => {
    expect(
      readVerdict({ ...freshVerdict, phase: "teacher_enter" }),
    ).toBeUndefined();
    expect(
      readVerdict({ ...freshVerdict, found: ["__proto__"] }),
    ).toBeUndefined();
    expect(readVerdict({ ...testedAn(), tested: ["an"] })).toBeUndefined();
    expect(
      readVerdict({ ...testedAn(), linked: ["data", "data"] }),
    ).toBeUndefined();
  });
});
