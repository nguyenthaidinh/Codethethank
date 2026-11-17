import { describe, expect, it } from "vitest";
import { Vector3 } from "three";
import {
  characterHead,
  hairLock,
  handGeometry,
  sleeveGeometry,
} from "../src/art/CharacterGeometry";

describe("classroom model surfaces", () => {
  it("produces finite geometry with normals and UVs for batching and disposal", () => {
    const geometries = [
      characterHead(false),
      characterHead(true),
      sleeveGeometry(true),
      sleeveGeometry(false),
      ...handGeometry(-1),
      ...handGeometry(1),
    ];
    for (const geometry of geometries) {
      for (const name of ["position", "normal", "uv"]) {
        const attr = geometry.getAttribute(name);
        expect(attr.count).toBeGreaterThan(0);
        expect(Array.from(attr.array).every(Number.isFinite)).toBe(true);
      }
      geometry.computeBoundingBox();
      expect(geometry.boundingBox!.isEmpty()).toBe(false);
      geometry.dispose();
    }
  });
  it("keeps fingers within the existing forearm and hand contact envelope", () => {
    for (const side of [-1, 1]) {
      const hand = handGeometry(side);
      expect(hand).toHaveLength(6); // palm, four fingers, opposed thumb
      hand.forEach((g) => {
        g.computeBoundingBox();
        expect(g.boundingBox!.min.y).toBeGreaterThan(-0.36);
        expect(g.boundingBox!.max.y).toBeLessThan(-0.22);
        expect(g.boundingBox!.min.x).toBeGreaterThan(-0.06);
        expect(g.boundingBox!.max.x).toBeLessThan(0.06);
        g.dispose();
      });
    }
  });
  it("faces scalp ribbons outward so single-sided hair remains visible", () => {
    const g = hairLock(
      [
        [0.05, 0.18, 0],
        [0, 0.2, 0.08],
        [-0.08, 0.13, 0.14],
      ],
      0.025,
    );
    const positions = g.getAttribute("position"),
      normals = g.getAttribute("normal");
    let outward = 0;
    for (let i = 0; i < positions.count; i++) {
      if (
        new Vector3()
          .fromBufferAttribute(positions, i)
          .dot(new Vector3().fromBufferAttribute(normals, i)) > 0
      )
        outward++;
    }
    expect(outward / positions.count).toBeGreaterThan(0.95);
    g.dispose();
  });
});
