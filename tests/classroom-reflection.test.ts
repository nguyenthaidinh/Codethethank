import { describe, expect, it } from "vitest";
import { freshStay, readStay, stayReducer, cueKey } from "../src/stayed/state";
import { stayAutoDelay, stayLine } from "../src/stayed/story";
import { performancePose } from "../src/cinematic/ClassroomPerformance";

describe("learning from the threshold suggestion", () => {
  it.each(["belief", "failure"] as const)(
    "lets An reflect and reach a concrete lesson after choosing %s",
    (id) => {
      let s = stayReducer(
        { ...freshStay, interactive: true, phase: "question", line: 9 },
        { type: "reply", id },
      );
      s = stayReducer(s, { type: "advance", cue: cueKey(s) });
      expect(stayLine(s)?.text).toContain(
        id === "belief" ? "bắt đầu từ điều còn thiếu" : "hiểu thêm điều gì",
      );
      expect(stayAutoDelay(s)).toBe(10);
      s = stayReducer(s, { type: "advance", cue: cueKey(s) });
      expect(stayLine(s)?.reflection).toBe(true);
      expect(stayAutoDelay(s)).toBe(5);
      expect(readStay(s)).toEqual(s);
      const dialogue: string[] = [];
      while (s.phase === "question") {
        dialogue.push(stayLine(s)!.text);
        s = stayReducer(s, { type: "advance", cue: cueKey(s) });
      }
      expect(dialogue.join(" ")).toContain("không cần được giúp");
      expect(dialogue.join(" ")).toContain("không thể quyết định tất cả");
      expect(dialogue.join(" ")).toContain("dữ liệu em đưa vào");
      expect(dialogue.join(" ")).toContain("hỏi người trong cuộc");
      expect(dialogue.join(" ")).toContain("không thể giao hết cho máy");
      expect(dialogue.join(" ")).toContain(
        "xin xác minh hoàn cảnh, rồi thử lại",
      );
      expect(dialogue.at(-1)).toContain("ghi lại nguyên tắc");
      expect(s.phase).toBe("notebook");
      expect(readStay(s)).toEqual(s);
    },
  );

  it("lowers An's gaze, lets his hands rest and returns his attention to her", () => {
    const s = { ...freshStay, phase: "question" as const, line: 11 };
    const thinking = performancePose(s, 2, false);
    const ready = performancePose(s, 4.9, false);
    expect(thinking.heads[0][0]).toBeGreaterThan(ready.heads[0][0]);
    expect(thinking.acting[0].gaze[1]).toBeGreaterThan(ready.acting[0].gaze[1]);
    expect(thinking.acting[0].hands[1]).toBeLessThan(0.2);
    expect(thinking.acting[1].warmth).toBeGreaterThan(0.4);
    expect(performancePose(s, 0, true)).toEqual(performancePose(s, 4.9, true));
  });
});
