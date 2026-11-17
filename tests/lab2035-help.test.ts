import { describe, it, expect } from "vitest";
import {
  freshExperiment2035,
  experiment2035Reducer as reduce,
} from "../src/ripple/experiment2035";
import { lab2035Help } from "../src/ripple/lab2035Help";
const loaded = () =>
  reduce(reduce(freshExperiment2035(), { type: "load", source: "record" }), {
    type: "load",
    source: "access",
  });
const run = (s: ReturnType<typeof loaded>) =>
  reduce(reduce(s, { type: "run" }), { type: "tick", elapsed: 2.2 });
describe("2035 contextual guidance", () => {
  it("explains the exact B-first situation without technical jargon", () => {
    const s = run(loaded()),
      hint = lab2035Help(s);
    expect(hint.title).toContain("thiếu bản A");
    expect(hint.target).toBe("access");
    expect(hint.steps[0]).toContain("Đang tắt");
    expect(hint.steps.join(" ")).not.toContain("đối chứng");
    expect(s.trials).toEqual([3]);
  });
  it("moves the highlight to Run after context is disabled", () => {
    const s = reduce(run(loaded()), { type: "toggle", source: "access" });
    expect(lab2035Help(s).target).toBe("run");
    expect(lab2035Help(s).steps[0]).toContain("Chạy thử");
  });
  it("prioritizes loading or enabling required data instead of a disabled Run button", () => {
    expect(lab2035Help(freshExperiment2035()).target).toBe("record");
    expect(
      lab2035Help(reduce(loaded(), { type: "toggle", source: "record" }))
        .target,
    ).toBe("record");
    const a = run(
      reduce(freshExperiment2035(), { type: "load", source: "record" }),
    );
    expect(lab2035Help(a).title).toContain("thiếu bản B");
    expect(lab2035Help(a).target).toBe("access");
  });
  it("guides discovery and exit only after both outputs actually exist", () => {
    let s = run(loaded());
    s = run(reduce(s, { type: "toggle", source: "access" }));
    expect(lab2035Help(s).target).toBe("mark");
    expect(lab2035Help(reduce(s, { type: "mark" })).target).toBe("finish");
  });
  it("never points at disabled actions while the machine is running", () => {
    expect(lab2035Help(reduce(loaded(), { type: "run" })).target).toBeNull();
  });
});
