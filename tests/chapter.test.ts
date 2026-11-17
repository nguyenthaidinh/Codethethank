import { describe, it, expect } from "vitest";
import {
  chapterReducer as reduce,
  freshChapter,
  readChapter,
  ready,
} from "../src/chapter/director";
import { freshSlice, readSlice } from "../src/cinematic/director";
describe("Chapter 00 action gates and compatible checkpoints", () => {
  it("skip never unlocks a case or fabricates evidence", () => {
    const s = reduce(freshChapter, { type: "skip" });
    expect(s.signal).toBe(false);
    expect(s.evidence).toEqual([]);
    expect(reduce(s, { type: "open" })).toEqual(s);
    expect(reduce(s, { type: "continue" })).toEqual(s);
  });
  it("allows laptop-first access without fabricating optional room observations", () => {
    let s = reduce(
      reduce(reduce(freshChapter, { type: "skip" }), { type: "signal" }),
      { type: "open" },
    );
    s = reduce(reduce(s, { type: "arrive" }), { type: "explore" });
    expect(ready(s)).toBe(false);
    expect(reduce(s, { type: "continue" }).beat).not.toBe("NEXT_SCENE_READY");
    s = reduce(s, { type: "observe", id: "laptop" });
    expect(ready(s)).toBe(true);
    const entered = reduce(s, { type: "continue" });
    expect(entered.beat).toBe("NEXT_SCENE_READY");
    expect(entered.evidence).toEqual(["laptop"]);
    expect(entered.verdict?.phase).toBe("investigate");
    expect(entered.verdict?.found).toEqual([]);
  });
  it("reloads laptop-first checkpoints and still rejects an unvisited laptop", () => {
    const next = {
      ...freshChapter,
      signal: true,
      beat: "NEXT_SCENE_READY",
      evidence: ["laptop"],
    };
    expect(readChapter(next)?.beat).toBe("NEXT_SCENE_READY");
    expect(readChapter(next)?.evidence).toEqual(["laptop"]);
    expect(readChapter({ ...next, evidence: [] })).toBeUndefined();
  });
  it("restores a classroom checkpoint and preserves legacy S03 saves", () => {
    expect(
      readChapter({ ...freshChapter, signal: true, beat: "MEMORY_TRANSITION" })
        ?.beat,
    ).toBe("CLASSROOM_ESTABLISHING");
    expect(
      readChapter({ ...freshChapter, beat: "CLASSROOM_EXPLORATION" }),
    ).toBeUndefined();
    expect(
      readChapter({ ...freshChapter, evidence: ["__proto__"] }),
    ).toBeUndefined();
    const old = {
      ...freshSlice,
      beat: "profile",
      focus: "profile",
      observed: ["laptop", "notebook"],
    };
    expect(readSlice(JSON.stringify(old)).beat).toBe("profile");
    const next = {
      ...freshSlice,
      beat: "explore",
      chapter: { ...freshChapter, beat: "PLAYER_CONTROL_ENABLED" },
    };
    expect(readSlice(JSON.stringify(next)).chapter?.beat).toBe(
      "PLAYER_CONTROL_ENABLED",
    );
  });
  it("resumes interrupted introductions and never moves their progress backwards", () => {
    const start = {
      ...freshChapter,
      signal: true,
      beat: "CLASSROOM_ESTABLISHING" as const,
    };
    const midway = reduce(start, { type: "intro-tick", elapsed: 24 });
    expect(readChapter(midway)?.introElapsed).toBe(24);
    expect(reduce(midway, { type: "intro-tick", elapsed: 5 })).toBe(midway);
    expect(reduce(midway, { type: "intro-tick", elapsed: Number.NaN })).toBe(
      midway,
    );
    expect(readChapter({ ...start, introElapsed: -1 })).toBeUndefined();
    expect(readChapter({ ...start, introElapsed: Infinity })).toBeUndefined();
    const complete = reduce(midway, { type: "introduction-complete" });
    expect(readChapter(complete)?.verdict?.phase).toBe("review");
    expect(reduce(complete, { type: "intro-tick", elapsed: 0 })).toBe(complete);
    expect(readChapter({ ...start, introElapsed: 39 })?.verdict?.phase).toBe(
      "review",
    );
  });
  it("opens dossier review after showing the first refusal", () => {
    for (const beat of [
      "CLASSROOM_ESTABLISHING",
      "CLASSROOM_EXPLORATION",
      "LAPTOP_INVESTIGATION",
    ] as const) {
      const s = { ...freshChapter, signal: true, beat };
      const introduced = reduce(s, { type: "introduction-complete" });
      expect(introduced.beat).toBe("NEXT_SCENE_READY");
      expect(introduced.evidence).toEqual(["notebook", "laptop"]);
      expect(introduced.verdict?.phase).toBe("review");
      expect(introduced.verdict?.found).toEqual([
        "presentation",
        "notes",
        "data",
      ]);
      expect(introduced.verdict?.tested).toEqual(["student07"]);
      expect(readChapter(introduced)?.verdict?.phase).toBe("review");
      expect(reduce(introduced, { type: "introduction-complete" })).toBe(
        introduced,
      );
    }
    expect(reduce(freshChapter, { type: "introduction-complete" })).toBe(
      freshChapter,
    );
  });
  it("restores old room and laptop checkpoints into the guided introduction", () => {
    for (const beat of [
      "CLASSROOM_EXPLORATION",
      "LAPTOP_INVESTIGATION",
    ] as const) {
      const s = readChapter({
        ...freshChapter,
        signal: true,
        beat,
        evidence: ["clock"],
      });
      expect(s?.beat).toBe("CLASSROOM_ESTABLISHING");
      expect(s?.evidence).toEqual(["clock"]);
      expect(s?.verdict).toBeUndefined();
    }
  });
});
