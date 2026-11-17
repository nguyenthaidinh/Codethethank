import { describe, it, expect } from "vitest";
import { freshStay, readStay, stayReducer } from "../src/stayed/state";
describe("stayed checkpoints and meaningful actions", () => {
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
