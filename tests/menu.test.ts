import { describe, expect, it } from "vitest";
import { decodePreferences, defaultPreferences } from "../src/menu/preferences";
describe("menu preferences", () => {
  it("recovers corrupt or unavailable storage", () => {
    for (const raw of [null, "{broken", "false", "[]"])
      expect(decodePreferences(raw)).toEqual(defaultPreferences);
  });
  it("validates each stored preference and clamps mix levels", () => {
    expect(
      decodePreferences(
        JSON.stringify({
          music: 8,
          effects: -1,
          muted: "false",
          captions: false,
          reduced: true,
          quality: "ultra",
        }),
      ),
    ).toEqual({
      music: 1,
      effects: 0,
      muted: true,
      captions: false,
      voice: true,
      reduced: true,
      quality: "auto",
    });
  });
  it("roundtrips user choices", () => {
    const settings = {
      ...defaultPreferences,
      music: 0.25,
      effects: 0.8,
      muted: false,
      voice: false,
      quality: "low" as const,
    };
    expect(decodePreferences(JSON.stringify(settings))).toEqual(settings);
  });
});
