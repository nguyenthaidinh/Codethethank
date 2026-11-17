import { describe, it, expect } from "vitest";
import * as T from "three";
import {
  applyTeacherLocomotion,
  stepOffset,
} from "../src/cinematic/TeacherLocomotion";
import type { NarrativeRig } from "../src/art/NarrativeActors";
import {
  teacherEntrancePose,
  TEACHER_ENTRANCE,
} from "../src/cinematic/TeacherEntrance";
const rig = (): NarrativeRig => {
  const root = new T.Group(),
    body = new T.Group(),
    head = new T.Group();
  root.add(body);
  body.add(head);
  root.position.set(1.1, 0, 0.05);
  const legs = [-1, 1].map((side) => {
    const node = new T.Group();
    node.position.x = side * 0.1;
    body.add(node);
    return node;
  });
  const shins = legs.map((leg) => {
    const node = new T.Group();
    node.position.y = -0.4;
    leg.add(node);
    return node;
  });
  const feet = shins.map((shin) => {
    const node = new T.Group();
    node.position.y = -0.397;
    shin.add(node);
    return node;
  });
  return {
    root,
    body,
    head,
    legs,
    shins,
    feet,
    arms: [new T.Group(), new T.Group()],
    teacher: true,
    hero: true,
  };
};
describe("teacher locomotion", () => {
  it("keeps walking soles above the floor with one foot supporting the teacher", () => {
    for (let t = 0; t <= TEACHER_ENTRANCE.settled; t += 0.05) {
      const actor = rig();
      actor.root.position.set(...teacherEntrancePose(t).position);
      applyTeacherLocomotion(actor, "enter", t, false, false, true);
      const soles = actor.feet!.map(
        (foot) => foot.localToWorld(new T.Vector3(0, -0.0455, 0)).y,
      );
      soles.forEach((height) => expect(height).toBeGreaterThan(-0.003));
      expect(Math.min(...soles)).toBeLessThan(0.003);
      expect(Math.max(...soles)).toBeLessThan(0.09);
    }
  });
  it("locks stance and lifts only the swing foot", () => {
    expect(stepOffset(0.05, 0, 0.55).along).toBe(
      stepOffset(0.1, 0, 0.55).along,
    );
    expect(stepOffset(0.05, 0, 0.55).lift).toBe(0);
    expect(stepOffset(0.825, 0, 0.55).lift).toBeGreaterThan(0.07);
  });
  it("keeps soles planted through the seated weight transfer and lands on the existing pose", () => {
    for (let t = 2.6; t <= 4.5; t += 0.05) {
      const actor = rig();
      applyTeacherLocomotion(actor, "chair", t, false);
      actor.feet!.forEach((foot) =>
        expect(
          Math.abs(foot.localToWorld(new T.Vector3(0, -0.0455, 0)).y),
        ).toBeLessThan(0.002),
      );
    }
    const actor = rig();
    applyTeacherLocomotion(actor, "chair", 6, false);
    expect(actor.body.position.y).toBeCloseTo(0.59);
    expect(actor.body.position.z).toBeCloseTo(0);
    expect(actor.root.rotation.y).toBeCloseTo(Math.PI + 0.12);
  });
  it("samples the same checkpoint without accumulating displacement", () => {
    const actor = rig();
    applyTeacherLocomotion(actor, "chair", 3.1, false);
    const before = actor.body.position.clone();
    applyTeacherLocomotion(actor, "chair", 3.1, false);
    expect(actor.body.position.distanceTo(before)).toBe(0);
  });
});
