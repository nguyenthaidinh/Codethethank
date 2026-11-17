import { describe, it, expect } from "vitest";
import {
  freshSlice,
  readSlice,
  sliceReducer,
  captionFor,
} from "../src/cinematic/director";
describe("cinematic director gates", () => {
  it("does not skip evidence, teacher or evaluation gates", () => {
    expect(sliceReducer(freshSlice, { type: "beat", beat: "profile" })).toEqual(
      freshSlice,
    );
    const explore = { ...freshSlice, beat: "explore" as const };
    expect(sliceReducer(explore, { type: "beat", beat: "enter" })).toEqual(
      explore,
    );
    const observed = sliceReducer(
      sliceReducer(explore, { type: "observe", prop: "laptop" }),
      { type: "observe", prop: "notebook" },
    );
    expect(sliceReducer(observed, { type: "beat", beat: "enter" }).beat).toBe(
      "enter",
    );
    const profile = { ...observed, beat: "profile" as const };
    expect(sliceReducer(profile, { type: "evaluate" }).beat).toBe("profile");
    expect(
      sliceReducer(sliceReducer(profile, { type: "select" }), {
        type: "evaluate",
      }).beat,
    ).toBe("evaluate");
  });
  it("restores valid mid-scene progress and resets corrupt data without disturbing V2", () => {
    const s = {
      ...freshSlice,
      beat: "profile" as const,
      observed: ["laptop", "notebook"],
      selected: true,
    };
    expect(readSlice(JSON.stringify(s))).toEqual(s);
    for (const value of [
      "bad",
      "null",
      JSON.stringify({ ...s, version: 1 }),
      JSON.stringify({ ...s, selected: false, beat: "verdict" }),
      JSON.stringify({ ...s, observed: [] }),
      JSON.stringify({ ...s, volume: "oops" }),
    ])
      expect(readSlice(value)).toEqual(freshSlice);
  });
  it("holds silence at verdict and avoids early founder reveal in all captions", () => {
    expect(captionFor({ ...freshSlice, beat: "verdict" }, 1)).toBeNull();
    expect(captionFor({ ...freshSlice, beat: "verdict" }, 3)?.speaker).toBe(
      "AN",
    );
    expect(
      JSON.stringify(captionFor({ ...freshSlice, beat: "response" }, 4)),
    ).not.toContain("FOUNDER");
  });
});
