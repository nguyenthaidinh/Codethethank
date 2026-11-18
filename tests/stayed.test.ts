import { describe, it, expect } from "vitest";
import { cueKey, freshStay, readStay, stayReducer, type StaySave } from "../src/stayed/state";
describe("stayed checkpoints and meaningful actions", () => {
  const skipDialogue = (s: StaySave) => stayReducer(s, { type: "skip-dialogue", cue: cueKey(s) });
  it("stops at each unanswered reply and resumes at the same prompt", () => {
    let s: StaySave = { ...freshStay, interactive: true, phase: "question" };
    for (const [line, reply] of [[2, "context"], [9, "belief"]] as const) {
      const before = s;
      s = skipDialogue(s);
      expect(s.line).toBe(line);
      expect(s.seen).toEqual([]);
      expect(readStay(s)).toEqual(s);
      expect(skipDialogue(s)).toBe(s);
      expect(stayReducer(s, { type: "skip-dialogue", cue: cueKey(before) })).toBe(s);
      s = stayReducer(s, { type: "reply", id: reply });
    }
    s = skipDialogue(s);
    expect(s).toMatchObject({ phase: "notebook", read: [], written: false });
    expect(skipDialogue(s)).toBe(s);
  });
  it("preserves the chair scene and leaves the notebook stroke to the player", () => {
    const chair = skipDialogue(freshStay);
    expect(chair.phase).toBe("chair");
    expect(skipDialogue(chair)).toBe(chair);
    const pen = skipDialogue({ ...freshStay, phase: "second_chance", read: ["outcome", "support"] });
    expect(pen).toMatchObject({ phase: "unwritten", written: false });
    expect(skipDialogue(pen)).toBe(pen);
  });
  it("requires both notes and writes once", () => {
    const s = { ...freshStay, phase: "notebook" as const };
    expect(stayReducer(s, { type: "finish-notes" })).toBe(s);
    const a = stayReducer(s, { type: "read", id: "outcome" });
    expect(stayReducer(a, { type: "write" })).toBe(a);
    const b = stayReducer(a, { type: "read", id: "support" });
    let c = stayReducer(b, { type: "finish-notes" });
    for (let i = 0; i < 3; i++) c = stayReducer(c, { type: "advance" });
    expect(c.phase).toBe("unwritten");
    c = stayReducer(c, { type: "write" });
    expect(c.written).toBe(true);
    expect(stayReducer(c, { type: "write" })).toBe(c);
    expect(readStay(c)).toEqual(c);
  });
  it("skips only watched cues and validates prerequisites", () => {
    expect(stayReducer(freshStay, { type: "skip" })).toBe(freshStay);
    expect(
      stayReducer({ ...freshStay, seen: ["discussion.0"] }, { type: "skip" })
        .line,
    ).toBe(1);
    expect(
      readStay({ ...freshStay, phase: "written", written: true }),
    ).toBeUndefined();
    expect(readStay({ ...freshStay, line: 99 })).toBeUndefined();
  });
});
