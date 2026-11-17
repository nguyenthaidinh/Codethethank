import { describe, it, expect } from "vitest";
import { classroomShot } from "../src/cinematic/ClassroomCinematography";
import { CHAIR_MOTIF } from "../src/cinematic/motifs";
describe("The chair cinematic", () => {
  it("preserves the shared chair insert and shows the sit after the hold", () => {
    const insert = classroomShot("chair", "chair_insert", 1, false, false)!;
    expect(insert.eye).toEqual(CHAIR_MOTIF.eye);
    expect(insert.at).toEqual(CHAIR_MOTIF.at);
    expect(classroomShot("chair", "chair_insert", 2.59, false, false)?.id).toBe(
      "chair.insert",
    );
    expect(classroomShot("chair", "chair_insert", 2.6, false, false)?.id).toBe(
      "chair.sit",
    );
  });
  it("holds the seating camera until the weight has settled, then connects to the dialogue master", () => {
    expect(
      classroomShot("chair", "chair_insert", 2.6, false, false)?.eye,
    ).toEqual(classroomShot("chair", "chair_insert", 3.8, false, false)?.eye);
    expect(
      classroomShot("chair", "chair_insert", 6, false, false)?.eye,
    ).toEqual(classroomShot("question", "faces", 0, false, false)?.eye);
    expect(
      classroomShot("chair", "chair_insert", 2.7, false, true)?.eye,
    ).toEqual(classroomShot("chair", "chair_insert", 5.5, false, true)?.eye);
    expect(classroomShot("notebook", "book", 0, false, false)).toBeNull();
  });
});
