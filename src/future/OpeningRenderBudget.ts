/** Opening-only resolution control. UI and camera coordinates stay in CSS pixels. */
export class OpeningRenderBudget {
  private samples: number[] = [];
  private elapsed = 0;
  private recovery = 0;
  changes = 0;
  push(
    seconds: number,
    current: number,
    minimum: number,
    maximum: number,
    allowRecovery = true,
    locked = false,
  ): number {
    if (locked) {
      this.samples.length = 0;
      this.elapsed = 0;
      this.recovery = 0;
      return current;
    }
    // Ignore suspension/debugger stalls; never react to one long frame.
    if (!Number.isFinite(seconds) || seconds < 0.004 || seconds > 0.2)
      return current;
    this.samples.push(seconds);
    this.elapsed += seconds;
    if (this.elapsed < 1.5 || this.samples.length < 24) return current;
    const sorted = this.samples.sort((a, b) => a - b);
    const p75 = sorted[Math.floor(sorted.length * 0.75)];
    this.samples = [];
    this.elapsed = 0;
    let next = current;
    if (p75 > 0.025) {
      next = Math.max(minimum, Math.round((current - 0.1) * 100) / 100);
      this.recovery = 0;
    } else if (p75 < 0.018 && allowRecovery) {
      // Recover slowly, so the city/atrium boundary cannot cause oscillation.
      if (++this.recovery >= 5) {
        next = Math.min(maximum, Math.round((current + 0.05) * 100) / 100);
        this.recovery = 0;
      }
    } else this.recovery = 0;
    if (next !== current) this.changes++;
    return next;
  }
}
