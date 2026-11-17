import { describe, it, expect } from "vitest";
import ts from "typescript";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { finaleCaption, prompts } from "../src/finale/story";
import { freshFinale, finaleDurations, readFinale } from "../src/finale/state";
const layout = (text: string) => {
  const file = ts.createSourceFile(
    "ui.tsx",
    text,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const result = ts.transform(file, [
    (ctx) => (root) => {
      const visit: ts.Visitor = (node) =>
        ts.isJsxText(node)
          ? ts.factory.createJsxText("TEXT")
          : ts.visitEachChild(node, visit, ctx);
      return ts.visitNode(root, visit) as ts.SourceFile;
    },
  ]);
  // F5.3 replaces authoring/review. Keep guarding unrelated memory, desk,
  // ending and credits structure rather than freezing the retired editor.
  const preserved: ts.Node[] = [];
  const collect = (node: ts.Node) => {
    if (
      ts.isJsxExpression(node) &&
      node.expression &&
      ts.isBinaryExpression(node.expression)
    ) {
      const condition = node.expression.left.getText(file);
      if (
        [
          's.phase === "memory"',
          's.phase === "paper"',
          's.phase === "ending"',
          "credits",
        ].includes(condition)
      ) {
        preserved.push(node.expression.right);
        return;
      }
    }
    ts.forEachChild(node, collect);
  };
  collect(result.transformed[0]);
  expect(preserved).toHaveLength(4);
  const printer = ts.createPrinter({ removeComments: true });
  expect(preserved).toHaveLength(4);
  const printed = preserved
    .map((node) =>
      printer.printNode(ts.EmitHint.Unspecified, node, result.transformed[0]),
    )
    .join("\n");
  result.dispose();
  return printed;
};
describe("N4 unwritten act and private gratitude", () => {
  it("keeps non-editor UI structure and unrelated runtime modules", () => {
    expect(layout(readFileSync("src/finale/FinaleControls.tsx", "utf8"))).toBe(
      layout(
        readFileSync("docs/story/n4-proof/FinaleControls.before.tsx", "utf8"),
      ),
    );
    const rows = JSON.parse(
      readFileSync("docs/story/n4-proof/before-hashes.json", "utf8").replace(
        /^\uFEFF/,
        "",
      ),
    ) as { path: string; hash: string }[];
    for (const { path, hash } of rows) {
      if (
        [
          "src/finale/story.ts",
          "src/finale/FinaleControls.tsx",
          "src/finale/letter.ts",
          // F5.4 presentation only; state, story timing and audio stay unchanged.
          "src/finale/FinaleVisual.ts",
          "src/finale/Fallback.ts",
          // UI/chair polish: explicitly authorized classroom framing and scoped CSS only.
          "src/cinematic/ClassroomCinematography.ts",
          "src/stayed/stayed.css",
          // Character performance pass: classroom faces/eyelids and rig motion only.
          "src/art/NarrativeActors.ts",
          // Classroom lighting only, guarded structurally in classroom-lighting.test.ts.
          "src/cinematic/WorldRenderer.ts",
          "src/art/ClassroomArt.ts",
        ].includes(path)
      )
        continue;
      expect(
        createHash("sha256")
          .update(readFileSync(path))
          .digest("hex")
          .toUpperCase(),
        path,
      ).toBe(hash);
    }
  });
  it("distinguishes the written principle from staying without promising success", () => {
    const s = { ...freshFinale, phase: "lesson" as const };
    expect(finaleCaption(s, 0)).toContain("kiểm tra cả câu hỏi");
    expect(finaleCaption(s, 5)).toBe("");
    expect(finaleCaption(s, 7)).toContain("Cô cùng An đọc lại dữ liệu");
    expect(finaleCaption(s, 12)).toContain("Cô không làm thay bài tập");
    expect(finaleCaption(s, 17)).toContain("Sự tận tâm ấy");
    expect(
      finaleCaption({ ...freshFinale, memoryFocus: "notebook" }, 0),
    ).toContain("không tự động duyệt hỗ trợ");
    expect(finaleDurations).toMatchObject({
      memory: 6,
      lesson: 20,
      question: 8,
      transform: 10,
      closing: 9,
    });
    expect(readFinale({ ...s, elapsed: 12 })).toMatchObject({
      phase: "lesson",
      elapsed: 12,
    });
  });
  it("bridges to the player's own thanks and keeps the silent path truthful", () => {
    expect(finaleCaption({ ...freshFinale, phase: "question" }, 4)).toContain(
      "người thầy, người cô nào",
    );
    expect(
      finaleCaption({ ...freshFinale, phase: "transform", choice: "skip" }, 0),
    ).toContain("Không có lời nhắn cá nhân nào được tạo");
    expect(
      finaleCaption(
        { ...freshFinale, phase: "transform", choice: "letter" },
        0,
      ),
    ).toContain("Chưa công khai");
    expect(finaleCaption({ ...freshFinale, phase: "closing" }, 6)).toBe(
      "Nhưng chúng có thể được trao đi suốt một đời.",
    );
    expect(prompts).toHaveLength(3);
  });
});
