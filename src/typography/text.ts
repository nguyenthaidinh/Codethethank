const segmenter =
  typeof Intl.Segmenter === "function"
    ? new Intl.Segmenter("vi", { granularity: "grapheme" })
    : null;

/** Keep the vowel and all its tone marks together when wrapping or revealing text. */
export function graphemes(text: string): string[] {
  const normalized = text.normalize("NFC");
  return segmenter
    ? Array.from(segmenter.segment(normalized), (part) => part.segment)
    : Array.from(normalized);
}
