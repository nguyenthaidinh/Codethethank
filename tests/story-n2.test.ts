import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import {
  narration,
  originAudit,
  channels,
  futureCaption,
  OPENING_DURATION,
} from "../src/future/direction";
import { terminalColor, TERMINAL_ALERT } from "../src/future/terminalStyle";
describe("N2 verified principle and historical origin", () => {
  it("preserves every narrator line and its timing", () => {
    const baseline = JSON.parse(
      readFileSync("docs/story/n2-proof/narrator-baseline.json", "utf8"),
    );
    expect(narration.filter((n) => n.speaker === "NGƯỜI DẪN")).toEqual(
      baseline,
    );
    expect(OPENING_DURATION).toBe(53);
    expect(futureCaption("OPENING_CINEMATIC", 49)).toContain("nguồn gốc");
  });
  it("investigates origin, not malfunction or future success", () => {
    expect(originAudit).toMatchObject({
      principle: "HUMAN REVIEW",
      function: "VERIFIED",
      origin: "INCOMPLETE",
    });
    expect(channels.source.lines).toContain("FUNCTION: VERIFIED");
    expect(channels.limit.lines).toContain("STUDENT 07: NOT RECOMMENDED");
    expect(channels.limit.lines.join(" ")).toContain("độc lập năm 2026");
    expect(JSON.stringify({ originAudit, channels })).not.toMatch(
      /CONTRADICTS FORECAST|UNEXPLAINED VARIABLE|founder|nhà sáng lập|An là/i,
    );
    expect(futureCaption("SIGNAL_INVESTIGATION", 10, null, true)).toContain(
      "hồ sơ 07",
    );
    expect(terminalColor("DESIGN ORIGIN: INCOMPLETE")).toBe(TERMINAL_ALERT);
    expect(terminalColor("FUNCTION: VERIFIED")).not.toBe(TERMINAL_ALERT);
  });
  it("keeps all other runtime modules unchanged", () => {
    const allowed = [
      // Authorized classroom lighting: interior paint receives light, geometry preserved.
      "src/art/ClassroomArt.ts",
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
      // N3 authorizes Ripple narrative and existing prop text only.
      "src/ripple/story.ts",
      "src/ripple/RippleControls.tsx",
      "src/ripple/RippleWorld.ts",
      "src/ripple/Fallback.ts",
      "src/cinematic/WorldRenderer.ts",
      "src/cinematic/FallbackWorld.ts",
      // F5.1 + F5.2 authorizes Finale presentation only; state/story/audio remain guarded.
      "src/finale/Fallback.ts",
      "src/finale/FinaleVisual.ts",
      "src/finale/FinaleControls.tsx",
      "src/future/direction.ts",
      "src/future/FutureWorld.ts",
      "src/future/FutureFallback.ts",
      "src/future/terminalStyle.ts",
    ];
    const before = JSON.parse(
      readFileSync("docs/story/n2-proof/before-hashes.json", "utf8").replace(
        /^\uFEFF/,
        "",
      ),
    ) as { path: string; hash: string }[];
    for (const { path, hash } of before) {
      if (allowed.includes(path)) continue;
      expect(existsSync(path), path).toBe(true);
      expect(
        createHash("sha256")
          .update(readFileSync(path))
          .digest("hex")
          .toUpperCase(),
        path,
      ).toBe(hash);
    }
  });
});
