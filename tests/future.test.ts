import { describe, it, expect } from "vitest";
import { readInspection } from "../src/future/inspection";
import { futurePlace, futureCaption, channels } from "../src/future/direction";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { OPENING_PACE } from "../src/future/pacing";
describe("Opening-only world boundaries", () => {
  it("validates optional inspection progress without accepting unknown channels", () => {
    expect(
      readInspection('{"version":1,"found":["source","source","limit"]}'),
    ).toEqual(["source", "limit"]);
    for (const raw of [
      null,
      "oops",
      '{"version":2,"found":["source"]}',
      '{"version":1,"found":["founder"]}',
      '{"version":1,"found":[{}]}',
    ])
      expect(readInspection(raw)).toEqual([]);
  });
  it("keeps the shot order and leaves later dialogue to its existing source", () => {
    expect(
      [4, 16, 28, 35].map((t) =>
        futurePlace("OPENING_CINEMATIC", t * OPENING_PACE),
      ),
    ).toEqual(["city", "headquarters", "core", "anomaly"]);
    expect(futurePlace("SIGNAL_INVESTIGATION", 0)).toBe("anomaly");
    expect(futureCaption("CLASSROOM_EXPLORATION", 0)).toBeNull();
    expect(JSON.stringify(channels)).not.toMatch(
      /founder|nhà sáng lập|AION.*2026/i,
    );
  });
  it("keeps unrelated narrative and cast unchanged outside authorized UI and voice integrations", () => {
    const manifest = JSON.parse(
      readFileSync("docs/art/g2f-proof/baseline/source-hashes.json", "utf8"),
    );
    const allowed = [
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
      // N0/N1 explicitly authorizes these narrative sources, not world/audio assets.
      "src/verdict/rules.ts",
      "src/verdict/state.ts",
      "src/verdict/evidence.ts",
      "src/verdict/story.ts",
      "src/stayed/story.ts",
      "src/stayed/state.ts",
      "src/stayed/Notebook.ts",
      "src/chapter/ChapterGame.tsx",
      "src/chapter/ChapterAudio.ts",
      "src/chapter/director.ts",
      "src/art/ClassroomArt.ts",
      "src/art/narrative.css",
      "src/cinematic/AudioDirector.ts",
      "src/cinematic/CinematicGame.tsx",
      "src/cinematic/director.ts",
      "src/cinematic/WorldRenderer.ts",
      "src/cinematic/FallbackWorld.ts",
      "src/menu/preferences.ts",
      "src/menu/GameAudio.ts",
      "src/menu/MenuUI.tsx",
      "src/menu/GameShell.tsx",
      "src/menu/saveBridge.ts",
      "src/finale/FinaleControls.tsx",
      "src/future/FutureWorld.ts",
      "src/future/FutureFallback.ts",
      "src/verdict/VerdictControls.tsx",
      "src/verdict/screen.ts",
    ];
    for (const [path, record] of Object.entries(manifest)) {
      if (!path.startsWith("src/") || allowed.includes(path)) continue;
      expect(
        createHash("sha256").update(readFileSync(path)).digest("hex"),
        path,
      ).toBe((record as { sha256: string }).sha256);
    }
  });
});
