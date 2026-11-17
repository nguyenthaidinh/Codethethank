import { describe, expect, it } from "vitest";
import { evaluate, profiles, type ProfileId } from "../src/verdict/rules";
import {
  classroomReview,
  verdictReducer as step,
  readVerdict,
} from "../src/verdict/state";
import { freshChapter, readChapter } from "../src/chapter/director";
import { freshStay, stayReducer, readStay } from "../src/stayed/state";
import { stayChoice, stayLine } from "../src/stayed/story";
import { teacherEntranceShot } from "../src/cinematic/ClassroomCinematography";
import { TEACHER_ENTRANCE } from "../src/cinematic/TeacherEntrance";

describe("screen, dossiers, failed retry, then the teacher", () => {
  it("rejects every supplied profile under the same rule", () => {
    for (const id of Object.keys(profiles) as ProfileId[]) {
      const result = evaluate(id);
      expect(result.label).toBe("NOT RECOMMENDED");
      expect(result.predictedGain).toBeLessThan(result.threshold);
    }
  });
  it("requires reading a different profile, then lets every retry lead directly to her entrance", () => {
    expect(step(classroomReview, { type: "prepare" })).toBe(classroomReview);
    expect(step(classroomReview, { type: "run" })).toBe(classroomReview);
    const same = step(classroomReview, {
      type: "review-profile",
      id: "student07",
    });
    expect(step(same, { type: "prepare" })).toBe(same);
    for (const id of ["mai", "minh", "an"] as const) {
      const reviewed = step(classroomReview, { type: "review-profile", id });
      const prepared = step(reviewed, { type: "prepare" });
      expect(prepared.selected).toBe(id);
      expect(readVerdict(prepared)?.phase).toBe("choose");
      const running = step(prepared, { type: "run" });
      expect(step(running, { type: "run" })).toBe(running);
      const failed = step(running, { type: "finish" });
      expect(failed.phase).toBe("reaction");
      expect(failed.tested).toEqual(["student07", id]);
      expect(step(failed, { type: "finish" })).toBe(failed);
      const arrival = step(failed, { type: "settle" });
      expect(arrival.phase).toBe("teacher_enter");
      expect(arrival.linked).toEqual([]);
      expect(readVerdict(arrival)?.phase).toBe("teacher_enter");
      expect(readVerdict(failed)?.phase).toBe("teacher_enter");
      expect(step(arrival, { type: "arrived" }).stayed?.interactive).toBe(true);
    }
  });
  it("rejects forged teacher arrivals and resumes the old comparison checkpoint at her entrance", () => {
    expect(
      readVerdict({ ...classroomReview, phase: "teacher_enter" }),
    ).toBeUndefined();
    expect(
      readVerdict({ ...classroomReview, phase: "choose" }),
    ).toBeUndefined();
    const old = readChapter({
      ...freshChapter,
      signal: true,
      beat: "NEXT_SCENE_READY",
      evidence: ["laptop"],
      verdict: {
        ...classroomReview,
        flow: undefined,
        phase: "connect",
        selected: "an",
        tested: ["student07", "an"],
      },
    });
    expect(old?.verdict?.phase).toBe("teacher_enter");
    expect(old?.verdict?.flow).toBe("screen-first");
  });
  it("frames the door before following her walk and keeps reduced motion stable", () => {
    const first = teacherEntranceShot(0, false, false);
    expect(first.at[2]).toBeGreaterThan(first.eye[2]);
    expect(first.at[2]).toBe(5.8);
    expect(
      teacherEntranceShot(TEACHER_ENTRANCE.settled, false, false).at[2],
    ).toBeCloseTo(0.7);
    expect(teacherEntranceShot(0, true, true)).toEqual(
      teacherEntranceShot(8, true, true),
    );
  });
});

describe("An's replies", () => {
  it("holds the conversation until a valid reply and saves the chosen words and her response", () => {
    let s = { ...freshStay, interactive: true };
    expect(stayChoice(s)?.options).toHaveLength(2);
    expect(stayReducer(s, { type: "advance" })).toBe(s);
    expect(stayReducer(s, { type: "reply", id: "failure" })).toBe(s);
    s = stayReducer(s, { type: "reply", id: "doubt" });
    expect(stayChoice(s)).toBeNull();
    expect(stayLine(s)?.text).toContain("không biết mình sai ở đâu nữa");
    expect(readStay(s)?.responses).toEqual({ "discussion.0": "doubt" });
    s = stayReducer(s, { type: "advance" });
    expect(stayLine(s)?.text).toContain("Cứ kể cô nghe đã");
    expect(
      readStay({ ...s, responses: { "question.999": "doubt" } }),
    ).toBeUndefined();
  });
  it("gives each concern a distinct response without scoring the player", () => {
    for (const [line, ids] of [
      [2, ["context", "limited"]],
      [9, ["belief", "failure"]],
    ] as const) {
      const lines = ids.map((id) => {
        const s = stayReducer(
          { ...freshStay, interactive: true, phase: "question", line },
          { type: "reply", id },
        );
        expect(readStay(s)).toBeDefined();
        return stayLine(stayReducer(s, { type: "advance" }))?.text;
      });
      expect(lines[0]).not.toBe(lines[1]);
    }
  });
});
