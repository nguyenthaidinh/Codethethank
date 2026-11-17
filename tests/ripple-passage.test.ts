import { describe, expect, it } from "vitest";
import {
  durations,
  freshRipple,
  readRipple,
  type RippleSave,
} from "../src/ripple/state";
import { rippleTimePassage, rippleClockStep } from "../src/ripple/timePassage";

describe("Ripple time passage", () => {
  it("cannot skip a year title or its closing fade on one stalled GPU frame", () => {
    for (const phase of ["change", "milestone", "world", "years"] as const) {
      const s = { ...freshRipple, phase };
      const step = rippleClockStep(s, 0, 20, false);
      expect(step).toBeLessThan(0.2);
    }
    expect(rippleClockStep(null, 0, 2, false)).toBe(2);
    expect(
      rippleClockStep({ ...freshRipple, phase: "chair" }, 0, 2, false),
    ).toBe(2);
  });
  it("keeps the screen covered on both sides of every year change", () => {
    for (const reduced of [false, true]) {
      const pairs: [RippleSave, RippleSave][] = [
        [
          { ...freshRipple, phase: "change" },
          { ...freshRipple, phase: "years" },
        ],
        ...[0, 1, 2].map((milestones): [RippleSave, RippleSave] => [
          { ...freshRipple, phase: "milestone", milestones },
          {
            ...freshRipple,
            phase: milestones === 2 ? "world" : "years",
            milestones: milestones + 1,
          },
        ]),
      ];
      for (const [from, to] of pairs) {
        const exit = rippleTimePassage(from, durations[from.phase]!, reduced)!;
        const enter = rippleTimePassage(to, 0, reduced)!;
        expect(exit.cover).toBe(1);
        expect(enter.cover).toBe(1);
        expect(exit.chapter.year).toBe(enter.chapter.year);
      }
    }
  });
  it("releases interaction after the introduction instead of trapping a year", () => {
    for (const reduced of [false, true])
      for (const milestones of [0, 1, 2]) {
        const s = { ...freshRipple, phase: "years" as const, milestones };
        expect(rippleTimePassage(s, 0, reduced)).not.toBeNull();
        expect(rippleTimePassage(s, 5, reduced)).toBeNull();
      }
  });
  it("is independent of wall-clock timers, so pausing cannot finish a transition", () => {
    const s = { ...freshRipple, phase: "world" as const };
    const before = rippleTimePassage(s, 1.2, false);
    expect(rippleTimePassage(s, 1.2, false)).toEqual(before);
    expect(rippleTimePassage(s, 4.2, false)).toBeNull();
  });
  it("accepts the previous 2046 timed save without replaying its introduction", () => {
    const old = {
      ...freshRipple,
      phase: "world" as const,
      questions: ["prediction", "opportunity"] as RippleSave["questions"],
      milestones: 3,
      elapsed: 9,
    };
    expect(readRipple(old)).toEqual(old);
    expect(rippleTimePassage(old, old.elapsed, false)).toBeNull();
  });
  it("does not cover the chair, founder reveal or Finale handoff", () => {
    for (const phase of [
      "sketch",
      "reveal",
      "chair",
      "reflection",
      "reconstruct",
      "principle",
      "finale",
    ] as const)
      expect(rippleTimePassage({ ...freshRipple, phase }, 0, false)).toBeNull();
  });
});
