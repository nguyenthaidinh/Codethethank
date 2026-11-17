import { describe, it, expect } from "vitest";
import ts from "typescript";
import { withoutLightingHooks } from "./helpers/classroomLightingAudit";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { rippleCaption, memories, milestones } from "../src/ripple/story";
import {
  freshRipple,
  founderRevealed,
  durations,
  type RipplePhase,
} from "../src/ripple/state";
const tokens = (text: string) => {
  const file = ts.createSourceFile(
    "scene.ts",
    withoutLightingHooks(text),
    ts.ScriptTarget.Latest,
    true,
  );
  const transformed = ts.transform(file, [
    (context) => (root) => {
      const visit: ts.Visitor = (node) =>
        ts.isStringLiteral(node)
          ? ts.factory.createStringLiteral("STRING")
          : ts.visitEachChild(node, visit, context);
      return ts.visitNode(root, visit) as ts.SourceFile;
    },
  ]);
  const printed = ts
    .createPrinter({ removeComments: true })
    .printFile(transformed.transformed[0]);
  transformed.dispose();
  return printed;
};
describe("N3 historical principle and inherited action", () => {
  it("keeps camera geometry animation and timings outside authorized lighting hooks", () => {
    for (const file of [
      "src/ripple/RippleWorld.ts",
      "src/ripple/Fallback.ts",
      "src/cinematic/WorldRenderer.ts",
      "src/cinematic/FallbackWorld.ts",
    ]) {
      expect(tokens(readFileSync(file, "utf8")), file).toEqual(
        tokens(readFileSync("docs/story/n3-proof/baseline/" + file, "utf8")),
      );
    }
    const baseline = JSON.parse(
      readFileSync("docs/story/n3-proof/before-hashes.json", "utf8").replace(
        /^\uFEFF/,
        "",
      ),
    ) as { path: string; hash: string }[];
    const allowed = [
      // Classroom light pass: interior paint now receives light; geometry unchanged.
      "src/art/ClassroomArt.ts",
      // F5.4 authorizes Finale rendering; progression and audio remain guarded.
      "src/finale/FinaleVisual.ts",
      "src/finale/Fallback.ts",
      // F5.3 authorizes the backward-compatible letter draft model.
      "src/finale/letter.ts",
      // UI/chair polish: explicitly authorized classroom framing and scoped CSS only.
      "src/cinematic/ClassroomCinematography.ts",
      "src/stayed/stayed.css",
      // Character performance pass: classroom faces/eyelids and rig motion only.
      "src/art/NarrativeActors.ts",
      // N4 authorizes Finale narrative and ending text, with existing layout/behavior preserved.
      "src/finale/story.ts",
      "src/finale/FinaleControls.tsx",
      "src/ripple/story.ts",
      "src/ripple/RippleControls.tsx",
      "src/ripple/RippleWorld.ts",
      "src/ripple/Fallback.ts",
      "src/cinematic/WorldRenderer.ts",
      "src/cinematic/FallbackWorld.ts",
    ];
    for (const { path, hash } of baseline) {
      if (allowed.includes(path)) continue;
      expect(
        createHash("sha256")
          .update(readFileSync(path))
          .digest("hex")
          .toUpperCase(),
        path,
      ).toBe(hash);
    }
    expect(durations.echo).toBe(6);
    expect(durations.chair).toBe(6);
  });
  it("reveals only at reveal and preserves a twenty-year collaborative history", () => {
    for (const phase of [
      "sketch",
      "change",
      "years",
      "milestone",
      "world",
      "record",
      "align",
    ] as RipplePhase[]) {
      const s = { ...freshRipple, phase };
      expect(founderRevealed(s)).toBe(false);
      for (const t of [0, 4, 7])
        expect(rippleCaption(s, t)).not.toMatch(
          /AN — FOUNDER|chính là An|An là.*sáng lập/i,
        );
    }
    expect(rippleCaption({ ...freshRipple, phase: "reveal" }, 0)).toBe(
      "AN — FOUNDER OF AION",
    );
    expect(milestones.map((m) => m.year)).toEqual([2029, 2035, 2045]);
    expect(milestones[1].text).toContain("đồng đội");
  });
  it("distinguishes human review from approval and names the unwritten action", () => {
    expect(rippleCaption({ ...freshRipple, phase: "change" }, 4)).toContain(
      "Không tự động duyệt hỗ trợ",
    );
    expect(memories.evaluation.text).toContain("vẫn giữ nguyên");
    expect(memories.stayed.text).toContain("không được viết thành lời");
    expect(rippleCaption({ ...freshRipple, phase: "reflection" }, 0)).toContain(
      "điều gì mình vẫn chưa kiểm chứng",
    );
    expect(rippleCaption({ ...freshRipple, phase: "principle" }, 6)).toContain(
      "một người cô kiên nhẫn dạy học trò",
    );
  });
});
