import { describe, it, expect } from "vitest";
import { revealLetter, revealPages, revealTiming } from "../src/finale/reveal";
import { blankLetter } from "../src/finale/letter";
import { freshFinale, finaleDurations } from "../src/finale/state";
import { graphemes } from "../src/typography/text";
describe("F5.4 reveal presentation contract", () => {
  it("preserves long Unicode letters, empty paragraphs and trailing newlines across pages", () => {
    for (const text of [
      "",
      "ấ".repeat(500),
      "\n".repeat(500),
      "👨‍👩‍👧‍👦".repeat(200),
      "Cảm ơn cô.\n\n".repeat(40),
    ]) {
      const pages = revealPages(text);
      expect(pages.join("")).toBe(text);
      expect(pages.length).toBeGreaterThan(0);
      for (const page of pages)
        expect(graphemes(page).length).toBeLessThanOrEqual(180);
    }
  });
  it("never reveals the saved draft when the player chose silence", () => {
    const view = revealLetter(
      { ...freshFinale, choice: "skip" },
      {
        ...blankLetter,
        recipient: "PRIVATE_NAME",
        message: "PRIVATE_TEXT",
        displayName: "PRIVATE_SENDER",
        audience: "public",
      },
    );
    expect(JSON.stringify(view)).not.toContain("PRIVATE_");
    expect(view.message).toContain("không viết lời nhắn");
    expect(view.private).toBe(true);
  });
  it("keeps public intent a private local reveal, including empty/erased letters", () => {
    const view = revealLetter(
      { choice: "letter" },
      {
        ...blankLetter,
        recipient: "Cô Vân",
        message: "Cảm ơn",
        audience: "public",
      },
    );
    expect(view.private).toBe(true);
    expect(view.message).toBe("Cảm ơn");
    expect(revealLetter({ choice: "letter" }, blankLetter).message).toContain(
      "Không có nội dung",
    );
  });
  it("resumes deterministically, arrives with the existing five-second cue and preserves durations", () => {
    expect(finaleDurations.transform).toBe(10);
    expect(finaleDurations.closing).toBe(9);
    expect(revealTiming("transform", 5, false).travel).toBe(1);
    expect(revealTiming("transform", 6, false)).toEqual(
      revealTiming("transform", 6, false),
    );
    expect(revealTiming("transform", 10, false).arrival).toBe(1);
    expect(revealTiming("closing", 9, false).close).toBe(
      revealTiming("ending", 0, false).close,
    );
    expect(revealTiming("transform", 3.4, false).veil).toBe(1);
    expect(revealTiming("transform", 3.4, true)).toMatchObject({
      room: false,
      veil: 0,
      reduced: true,
    });
  });
});
