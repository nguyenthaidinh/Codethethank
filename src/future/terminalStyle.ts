/** Historical uncertainty is a warning in the readout, not a broken AION. */
export const TERMINAL_ALERT = "#ff6b75";
export const TERMINAL_TEXT = "#c9dce2";
export const TERMINAL_FONT = "Consolas, ui-monospace, monospace";
export function terminalColor(text: string): string {
  return /ORIGIN UNKNOWN|NOT RECOMMENDED|UNRESOLVED|INCOMPLETE|CONTRADICTS FORECAST/.test(
    text,
  )
    ? TERMINAL_ALERT
    : TERMINAL_TEXT;
}
