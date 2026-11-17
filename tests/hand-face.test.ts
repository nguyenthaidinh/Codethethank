import { describe, it, expect } from "vitest";
import * as T from "three";
import {
  createArticulatedHand,
  poseHand,
  blinkClosure,
} from "../src/art/CharacterActing";
import {
  performancePose,
  chairHandTarget,
} from "../src/cinematic/ClassroomPerformance";
import { freshStay } from "../src/stayed/state";

describe("articulated classroom performance", () => {
  it("routes the release outside the torso with continuous contact and rest endpoints", () => {
    const chair = new T.Group();
    chair.position.set(1.1, 0, 0.25);
    expect(chairHandTarget(chair, 0).toArray()).toEqual([1.26, 1.07, 0.5]);
    expect(
      chairHandTarget(chair, 1).distanceTo(new T.Vector3(1.25, 0.91, -0.3)),
    ).toBeLessThan(1e-8);
    for (let r = 0.25; r <= 0.75; r += 0.01)
      expect(chairHandTarget(chair, r).x).toBeGreaterThan(1.37);
    for (let r = 0.001; r <= 1; r += 0.001)
      expect(
        chairHandTarget(chair, r).distanceTo(chairHandTarget(chair, r - 0.001)),
      ).toBeLessThan(0.002);
  });
  it("curls fingers without moving the palm or accumulating pose drift", () => {
    for (const side of [-1, 1]) {
      const material = new T.MeshBasicMaterial(),
        hand = createArticulatedHand(side, material);
      const vertex = (i: number) => {
        hand.mesh.updateMatrixWorld(true);
        hand.skeleton.update();
        return hand.mesh.applyBoneTransform(
          i,
          new T.Vector3().fromBufferAttribute(
            hand.mesh.geometry.getAttribute("position"),
            i,
          ),
        );
      };
      const index =
        Array.from(
          hand.mesh.geometry.getAttribute("skinIndex").array,
        ).findIndex((x, i) => i % 4 === 0 && x === 2) / 4;
      poseHand(hand, 0, 0);
      const palm = vertex(0),
        open = vertex(index);
      poseHand(hand, 0.9, 0);
      const closed = vertex(index);
      expect(vertex(0).distanceTo(palm)).toBeLessThan(1e-6);
      expect(closed.distanceTo(open)).toBeGreaterThan(0.01);
      poseHand(hand, 0, 0);
      poseHand(hand, 0.9, 0);
      expect(vertex(index).distanceTo(closed)).toBeLessThan(1e-6);
      const weights = hand.mesh.geometry.getAttribute("skinWeight");
      for (let i = 0; i < weights.count; i++)
        expect(
          weights.getX(i) + weights.getY(i) + weights.getZ(i) + weights.getW(i),
        ).toBe(1);
      expect(hand.skeleton.bones).toHaveLength(11);
      let furthest = 0;
      for (const amount of [0, 0.25, 0.5, 0.75, 1]) {
        poseHand(hand, amount, 0);
        hand.mesh.updateMatrixWorld(true);
        hand.skeleton.update();
        const positions = hand.mesh.geometry.getAttribute("position");
        for (let i = 0; i < positions.count; i++) {
          const point = hand.mesh.applyBoneTransform(
            i,
            new T.Vector3().fromBufferAttribute(positions, i),
          );
          furthest = Math.max(
            furthest,
            point.distanceTo(hand.mesh.boundingSphere!.center),
          );
        }
      }
      expect(furthest).toBeLessThan(hand.mesh.boundingSphere!.radius);

      hand.mesh.geometry.dispose();
      hand.skeleton.dispose();
      material.dispose();
    }
  });
  it("holds through the pull and opens fingers before the hand finishes travelling", () => {
    const s = { ...freshStay, phase: "chair" as const };
    expect(performancePose(s, 1, false).acting[1].hands[0]).toBeCloseTo(0.9);
    expect(performancePose(s, 1.25, false).acting[1].hands[0]).toBeCloseTo(0.9);
    const released = performancePose(s, 1.63, false);
    expect(released.acting[1].hands[0]).toBeCloseTo(0.12);
    expect(released.release).toBeLessThan(0.5);
    expect(performancePose(s, 1.63, false)).toEqual(
      performancePose(s, 1.63, false),
    );
  });
  it("keeps lid motion continuous and disables incidental blinking for reduced motion", () => {
    let max = 0,
      min = 1,
      maxStep = 0,
      maxReduced = 0;
    for (let t = 0; t < 36; t += 0.002) {
      const value = blinkClosure(t, false);
      max = Math.max(max, value);
      min = Math.min(min, value);
      maxStep = Math.max(
        maxStep,
        Math.abs(value - blinkClosure(t - 0.002, false)),
      );
      maxReduced = Math.max(maxReduced, Math.abs(blinkClosure(t, true)));
    }
    expect(min).toBeGreaterThanOrEqual(0);
    expect(max).toBeLessThanOrEqual(1);
    expect(max).toBeGreaterThan(0.99);
    expect(maxStep).toBeLessThan(0.05);
    expect(maxReduced).toBe(0);
  });

  it("softens An after the teacher stays without a looped facial gesture", () => {
    const concerned = performancePose(
      { ...freshStay, phase: "question", line: 6 },
      2,
      false,
    ).acting[0];
    const listening = performancePose(
      { ...freshStay, phase: "question", line: 8 },
      2,
      false,
    ).acting[0];
    expect(listening.concern).toBeLessThan(concerned.concern);
    expect(listening.warmth).toBeGreaterThan(concerned.warmth);
    expect(
      performancePose({ ...freshStay, phase: "question", line: 8 }, 4, false)
        .acting,
    ).toEqual(
      performancePose({ ...freshStay, phase: "question", line: 8 }, 2, false)
        .acting,
    );
  });
});
