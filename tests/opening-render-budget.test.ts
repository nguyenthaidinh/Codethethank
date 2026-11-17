import { describe, expect, it } from "vitest";
import { OpeningRenderBudget } from "../src/future/OpeningRenderBudget";

describe("opening render budget", () => {
  it("never reallocates during a locked cinematic, even under sustained load", () => {
    const budget = new OpeningRenderBudget();
    let scale = 1;
    for (let i = 0; i < 1800; i++)
      scale = budget.push(1 / 24, scale, 0.85, 1, false, true);
    expect(scale).toBe(1);
    expect(budget.changes).toBe(0);
    // Opening samples must not leak into subsequent interactive adaptation.
    expect(budget.push(1 / 60, scale, 0.85, 1, true, false)).toBe(1);
    for (let i = 0; i < 200; i++)
      scale = budget.push(1 / 30, scale, 0.85, 1, true, false);
    expect(scale).toBe(0.85);
  });
  it("holds a stable buffer during the cinematic rather than reallocating on recovery", () => {
    const budget = new OpeningRenderBudget();
    let scale = 0.8;
    for (let i = 0; i < 1800; i++)
      scale = budget.push(1 / 60, scale, 0.6, 1, false);
    expect(scale).toBe(0.8);
    expect(budget.changes).toBe(0);
    for (let i = 0; i < 500; i++)
      scale = budget.push(1 / 60, scale, 0.6, 1, true);
    expect(scale).toBe(0.85);
  });
  it("responds to sustained atrium load even after the original 80-frame startup window", () => {
    const budget = new OpeningRenderBudget();
    let scale = 1;
    for (let i = 0; i < 150; i++) scale = budget.push(1 / 60, scale, 0.6, 1);
    expect(scale).toBe(1);
    for (let i = 0; i < 300; i++) scale = budget.push(1 / 30, scale, 0.6, 1);
    expect(scale).toBe(0.6);
    expect(budget.changes).toBe(4);
  });
  it("ignores pauses, does not lower quality for a single hitch, and recovers slowly", () => {
    const budget = new OpeningRenderBudget();
    let scale = 0.8;
    for (const value of [0, NaN, 1, 10])
      expect(budget.push(value, scale, 0.6, 1)).toBe(scale);
    for (let i = 0; i < 180; i++)
      scale = budget.push(i === 60 ? 0.12 : 1 / 60, scale, 0.6, 1);
    expect(scale).toBe(0.8);
    for (let i = 0; i < 360; i++) scale = budget.push(1 / 60, scale, 0.6, 1);
    expect(scale).toBe(0.85);
    expect(budget.changes).toBe(1);
  });
  it("keeps software and portrait resolution within their limits", () => {
    const budget = new OpeningRenderBudget();
    let scale = 0.65;
    for (let i = 0; i < 200; i++) scale = budget.push(0.08, scale, 0.45, 0.75);
    expect(scale).toBe(0.45);
    for (let i = 0; i < 4000; i++)
      scale = budget.push(1 / 60, scale, 0.45, 0.75);
    expect(scale).toBe(0.75);
  });
});
