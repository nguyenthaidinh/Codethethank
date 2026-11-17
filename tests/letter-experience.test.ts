import { afterEach, describe, expect, it, vi } from "vitest";
import {
  LETTER_KEY,
  normalizeLetter,
  readLetter,
  saveLetter,
  removeLetter,
  blankLetter,
} from "../src/finale/letter";
const store = () => {
  const values = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    getItem: (k: string) => values.get(k) ?? null,
    setItem: (k: string, v: string) => values.set(k, v),
    removeItem: (k: string) => values.delete(k),
  });
  return values;
};
afterEach(() => vi.unstubAllGlobals());
describe("F5.3 letter compatibility and privacy", () => {
  it("migrates existing v1 drafts privately without a new key", () => {
    const values = store();
    values.set(
      LETTER_KEY,
      JSON.stringify({
        ...blankLetter,
        recipient: "Cô Vân",
        message: "Cảm ơn cô",
      }),
    );
    expect(readLetter()).toMatchObject({
      version: 1,
      recipient: "Cô Vân",
      audience: "private",
      displayName: "",
    });
  });
  it("round trips new fields locally but never stores consent or a submitted state", () => {
    const values = store();
    const draft = {
      ...blankLetter,
      displayName: "An",
      audience: "public" as const,
      consent: true,
      submitted: true,
    };
    expect(saveLetter(draft)).toBe(true);
    expect(readLetter()).toMatchObject({
      displayName: "An",
      audience: "public",
    });
    expect(JSON.parse(values.get(LETTER_KEY)!)).not.toHaveProperty("consent");
    expect(JSON.parse(values.get(LETTER_KEY)!)).not.toHaveProperty("submitted");
    expect(saveLetter({ ...draft, local: false })).toBe(false);
    expect(values.has(LETTER_KEY)).toBe(false);
  });
  it("normalizes Vietnamese and bounds display names without splitting surrogate pairs", () => {
    expect(
      normalizeLetter({ ...blankLetter, displayName: "a\u0302\u0301" })
        .displayName,
    ).toBe("ấ");
    expect(
      Array.from(
        normalizeLetter({ ...blankLetter, displayName: "🌟".repeat(41) })
          .displayName!,
      ),
    ).toHaveLength(40);
    const values = store();
    values.set(
      LETTER_KEY,
      JSON.stringify({
        ...blankLetter,
        displayName: { evil: 1 },
        audience: "approved",
      }),
    );
    expect(readLetter()).toMatchObject({
      displayName: "",
      audience: "private",
    });
  });
  it("survives corrupt and unavailable storage without falsely claiming persistence", () => {
    const values = store();
    values.set(LETTER_KEY, "not json");
    expect(readLetter()).toEqual(blankLetter);
    vi.stubGlobal("localStorage", {
      getItem() {
        throw Error("denied");
      },
      setItem() {
        throw Error("quota");
      },
      removeItem() {
        throw Error("denied");
      },
    });
    expect(readLetter()).toEqual(blankLetter);
    expect(saveLetter(blankLetter)).toBe(false);
    expect(removeLetter()).toBe(false);
  });
});
