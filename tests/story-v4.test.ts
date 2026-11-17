import { describe, it, expect } from "vitest";
import {
  freshVerdict,
  verdictReducer as step,
  readVerdict,
} from "../src/verdict/state";
import { evaluate } from "../src/verdict/rules";
import { evidence } from "../src/verdict/evidence";
import { freshStay, readStay } from "../src/stayed/state";
import { stayLines, finalNote, notes } from "../src/stayed/story";
describe("Story V4 historical evidence and migration", () => {
  it("requires Student 07 before An or optional samples on new journeys", () => {
    let s = freshVerdict;
    for (const id of ["presentation", "notes", "data"] as const)
      s = step(s, { type: "inspect", id });
    s = step(s, { type: "prepare" });
    for (const id of ["an", "mai", "minh"] as const)
      expect(step(s, { type: "choose", id })).toBe(s);
    expect(
      readVerdict({ ...s, selected: "an", tested: ["mai"] }),
    ).toBeUndefined();
    s = step(
      step(step(s, { type: "choose", id: "student07" }), { type: "run" }),
      { type: "finish" },
    );
    expect(evaluate("student07").label).toBe("NOT RECOMMENDED");
    expect(evaluate("an").label).toBe("NOT RECOMMENDED");
    expect(step(s, { type: "choose", id: "an" }).selected).toBe("an");
    expect(evidence.presentation.text).toContain("ẩn danh");
    expect(evidence.presentation.text).toContain("phòng máy");
    expect(evidence.data.text).toContain("chưa ghi nhận");
  });
  it("preserves validated legacy completion without inventing Student 07", () => {
    const old = {
      ...freshVerdict,
      narrativeRevision: undefined,
      phase: "connect",
      found: ["presentation", "notes", "data"],
      tested: ["mai", "an"],
      selected: "an",
    };
    expect(readVerdict(old)?.tested).toEqual(["mai", "an"]);
    expect(readVerdict({ ...old, narrativeRevision: 4 })).toBeUndefined();
    expect(readVerdict({ ...old, narrativeRevision: 99 })).toBeUndefined();
    expect(
      readStay({
        ...freshStay,
        narrativeRevision: undefined,
        phase: "question",
        line: 4,
        seen: ["question.0"],
      }),
    ).toMatchObject({
      phase: "question",
      line: 0,
      seen: [],
      narrativeRevision: 4,
    });
    expect(
      readStay({
        ...freshStay,
        narrativeRevision: undefined,
        phase: "question",
        line: 5,
      }),
    ).toBeUndefined();
    expect(readStay({ ...freshStay, phase: "question", line: 9 })?.line).toBe(
      9,
    );
  });
  it("separates review from approval and preserves the unwritten act and chair", () => {
    const text = JSON.stringify(stayLines);
    expect(text).toContain("Nếu sửa bài này, em sẽ kiểm tra điều gì trước?");
    expect(text).toContain("Cô không thể hứa mọi lần thử đều thành công.");
    expect(text).not.toMatch(/founder|nhà sáng lập|sáng tạo ra AION/i);
    expect(JSON.stringify(evidence)).not.toContain("AION");
    expect(stayLines.chair).toHaveLength(1);
    expect(stayLines.chair?.[0].seconds).toBe(6);
    expect(notes.support.title).toContain("REVIEW REQUIRED");
    expect(notes.support.detail).toContain("không tự động");
    expect(finalNote).toBe(
      "Khi chưa hiểu đủ một con người, đừng vội xem một dự đoán là câu trả lời cuối cùng.",
    );
  });
});
