import { describe, expect, it } from "vitest";
import { stayAutoDelay, stayLine } from "../src/stayed/story";
import { freshStay, stayReducer as step, cueKey } from "../src/stayed/state";

describe("automatic dialogue with an optional next button", () => {
  it("waits for the player's answer, then gives short lines five seconds and long lines ten", () => {
    const pending = { ...freshStay, interactive: true };
    expect(stayAutoDelay(pending)).toBeNull();
    const answered = step(pending, { type: "reply", id: "doubt" });
    expect(stayAutoDelay(answered)).toBe(5);
    const response = step(answered, { type: "advance", cue: cueKey(answered) });
    expect(stayLine(response)?.text).toContain("Cứ kể cô nghe đã");
    expect(stayAutoDelay(response)).toBe(5);
    expect(stayAutoDelay({ ...freshStay, phase: "question", line: 1 })).toBe(
      10,
    );
    expect(stayAutoDelay({ ...freshStay, phase: "second_chance" })).toBe(10);
    expect(stayAutoDelay(freshStay)).toBe(10);
  });
  it("does not skip two lines when the timer and click arrive together", () => {
    const initial = {
      ...freshStay,
      interactive: true,
      responses: { "discussion.0": "doubt" as const },
    };
    const action = { type: "advance" as const, cue: cueKey(initial) };
    const next = step(initial, action);
    expect(next.line).toBe(1);
    expect(step(next, action)).toBe(next);
    const explanation = step(next, { type: "advance", cue: cueKey(next) });
    expect(stayLine(explanation)?.text).toContain("xếp ưu tiên giờ thực hành");
    expect(stayAutoDelay(explanation)).toBe(10);
    expect(
      step(explanation, { type: "advance", cue: cueKey(explanation) }).phase,
    ).toBe("chair");
  });
  it("keeps physical holds and required interactions separate from dialogue timing", () => {
    expect(stayAutoDelay({ ...freshStay, phase: "chair" })).toBe(6);
    expect(stayAutoDelay({ ...freshStay, phase: "written" })).toBe(6);
    expect(stayAutoDelay({ ...freshStay, phase: "notebook" })).toBeNull();
    expect(stayAutoDelay({ ...freshStay, phase: "unwritten" })).toBeNull();
    expect(
      stayAutoDelay({
        ...freshStay,
        interactive: true,
        phase: "question",
        line: 2,
      }),
    ).toBeNull();
  });
});
