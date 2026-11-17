import { describe, it, expect } from "vitest";
import { graphemes } from "../src/typography/text";
import { normalizeLetter, MAX_MESSAGE } from "../src/finale/letter";

describe("Vietnamese text integrity", () => {
  it("keeps every Vietnamese vowel and tone in one reveal/wrap unit", () => {
    const text = "ề ế ể ễ ệ ồ ố ổ ỗ ộ ờ ớ ở ỡ ợ ằ ắ ẳ ẵ ặ ừ ứ ử ữ ự";
    expect(graphemes(text.normalize("NFD"))).toEqual(graphemes(text));
    expect(graphemes(text).some((unit) => /^\p{M}/u.test(unit))).toBe(false);
  });
  it("composes IME text before applying the letter limit", () => {
    const result = normalizeLetter({
      version: 1,
      recipient: "Cô Vân".normalize("NFD"),
      message: "ề".normalize("NFD").repeat(MAX_MESSAGE + 1),
      local: true,
    });
    expect(result.recipient).toBe("Cô Vân");
    expect(result.message).toBe("ề".repeat(MAX_MESSAGE));
  });
  it("preserves complete emoji and accented characters across canvas wraps", () => {
    expect(graphemes("👩‍💻ề".normalize("NFD"))).toEqual(["👩‍💻", "ề"]);
  });
});
