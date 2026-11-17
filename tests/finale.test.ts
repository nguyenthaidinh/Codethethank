import { describe, it, expect } from "vitest";
import {
  freshFinale,
  finaleReducer,
  readFinale,
  finaleDurations,
} from "../src/finale/state";
import { normalizeLetter } from "../src/finale/letter";
import {
  freshVerdict,
  verdictReducer,
  readVerdict,
} from "../src/verdict/state";
const advance = (s: typeof freshFinale) =>
  finaleReducer(
    finaleReducer(s, { type: "tick", elapsed: finaleDurations[s.phase] ?? 0 }),
    { type: "advance" },
  );
describe("finale and private letter", () => {
  it("gates entry and ending, supports a skipped letter", () => {
    expect(verdictReducer(freshVerdict, { type: "begin-finale" })).toBe(
      freshVerdict,
    );
    let s = freshFinale;
    for (let i = 0; i < 3; i++) s = advance(s);
    expect(s.phase).toBe("paper");
    expect(finaleReducer(s, { type: "commit" })).toBe(s);
    s = finaleReducer(s, { type: "skip" });
    s = advance(s);
    expect(s.choice).toBe("skip");
    expect(s.phase).toBe("galaxy");
    s = finaleReducer(s, { type: "finish" });
    s = advance(s);
    expect(s.completed).toBe(true);
    expect(readFinale(s)).toEqual(s);
    expect(finaleReducer(s, { type: "inspect" }).phase).toBe("galaxy");
  });
  it("requires review, idempotently creates one star, resumes elapsed/cues", () => {
    const s = { ...freshFinale, phase: "paper" as const };
    let f = finaleReducer(s, { type: "write" });
    expect(finaleReducer(f, { type: "commit" })).toBe(f);
    f = finaleReducer(f, { type: "review" });
    f = finaleReducer(f, { type: "commit" });
    expect(finaleReducer(f, { type: "commit" })).toBe(f);
    f = finaleReducer(f, { type: "star-cue" });
    f = finaleReducer(f, { type: "tick", elapsed: 7 });
    expect(readFinale(f)).toEqual(f);
    expect(f.starCue).toBe(true);
  });
  it("rejects corrupt progress and strips personal content", () => {
    expect(readFinale({ ...freshFinale, phase: "ending" })).toBeUndefined();
    expect(readFinale({ ...freshFinale, phase: "transform" })).toBeUndefined();
    expect(
      readFinale({ ...freshFinale, message: "private" }),
    ).not.toHaveProperty("message");
    expect(
      readVerdict({ ...freshVerdict, finale: freshFinale }),
    ).toBeUndefined();
  });
  it("limits Unicode code points without splitting surrogate pairs", () => {
    const v = normalizeLetter({
      version: 1,
      recipient: "ắ".repeat(70),
      message: "🌟".repeat(501),
      local: true,
    });
    expect(Array.from(v.recipient)).toHaveLength(60);
    expect(Array.from(v.message)).toHaveLength(500);
    expect(v.message.endsWith("🌟")).toBe(true);
  });
});

it("V4 memory focus is optional, guarded, idempotent and resumes", () => {
  const base = { ...freshFinale, elapsed: 3 };
  const focus = finaleReducer(base, { type: "focus-memory", id: "chair" });
  expect(focus.memoryFocus).toBe("chair");
  expect(focus.elapsed).toBe(0);
  expect(finaleReducer(focus, { type: "focus-memory", id: "chair" })).toBe(
    focus,
  );
  expect(readFinale(focus)).toEqual(focus);
  const later = { ...focus, phase: "lesson" as const };
  expect(finaleReducer(later, { type: "focus-memory", id: "notebook" })).toBe(
    later,
  );
});
it("V4 migrates prior Finale saves and rejects invalid memory targets", () => {
  const legacy = { ...freshFinale };
  delete legacy.memoryFocus;
  expect(readFinale(legacy)?.memoryFocus).toBeNull();
  expect(
    readFinale({ ...freshFinale, memoryFocus: "founder" }),
  ).toBeUndefined();
});
