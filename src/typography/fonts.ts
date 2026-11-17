/** Canvas textures must be painted after their font is ready, not cached with fallback glyphs. */
export async function prepareTypography(): Promise<void> {
  if (!document.fonts) return;
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      Promise.all([
        document.fonts.load("16px LessonSerif"),
        document.fonts.load("700 16px LessonSerif"),
        document.fonts.load("italic 16px LessonSerif"),
      ]),
      // Font/network failures must still allow the game to start with the complete serif fallback.
      new Promise<void>((resolve) => {
        timer = setTimeout(resolve, 1500);
      }),
    ]);
  } catch {
    /* The local Times fallback remains readable when font files are unavailable. */
  } finally {
    clearTimeout(timer);
  }
}
