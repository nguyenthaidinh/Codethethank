import { test, expect } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { finaleReady } from "../fixtures/finaleReady";
import { freshFinale } from "../../src/finale/state";
import { SLICE_KEY } from "../../src/cinematic/director";
const baseline = !!process.env.ROOM_BASELINE;
const out =
  process.env.ROOM_PROOF_OUT ??
  `docs/finale-v5-1-proof/${baseline ? "before" : "after"}`;
mkdirSync(out, { recursive: true });
for (const mode of ["desktop", "mobile", "fallback"]) {
  test(`Player Room ${mode}`, async ({ browser }) => {
    const ctx = await browser.newContext({
      viewport:
        mode === "desktop"
          ? { width: 1280, height: 720 }
          : { width: 390, height: 844 },
      isMobile: mode !== "desktop",
      hasTouch: mode !== "desktop",
      reducedMotion: mode === "fallback" ? "reduce" : "no-preference",
    });
    const page = await ctx.newPage(),
      errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    const save = structuredClone(finaleReady);
    save.chapter!.verdict!.finale = { ...freshFinale, phase: "paper" };
    writeFileSync(`${out}/checkpoint.json`, JSON.stringify(save));
    await page.addInitScript(
      ({ key, save, fallback }) => {
        if (!sessionStorage.getItem("room-seeded")) {
          localStorage.setItem(key, JSON.stringify(save));
          sessionStorage.setItem("room-seeded", "1");
        }
        if (fallback) {
          const orig = HTMLCanvasElement.prototype.getContext;
          HTMLCanvasElement.prototype.getContext = function (
            ...args: Parameters<typeof orig>
          ) {
            return String(args[0]).includes("webgl")
              ? null
              : orig.apply(this, args);
          } as typeof orig;
        }
      },
      { key: SLICE_KEY, save, fallback: mode === "fallback" },
    );
    await page.goto("/");
    await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
    await expect(page.locator(".chapter")).toHaveAttribute(
      "data-finale",
      "paper",
    );
    await page.waitForTimeout(3000);
    const perf = await page.evaluate(async () => {
      const frames: number[] = [];
      let last = performance.now();
      await new Promise<void>((resolve) => {
        const frame = (now: number) => {
          frames.push(now - last);
          last = now;
          if (frames.length < 120) requestAnimationFrame(frame);
          else resolve();
        };
        requestAnimationFrame(frame);
      });
      const sorted = frames.slice(1).sort((a, b) => a - b);
      return {
        medianMs: sorted[Math.floor(sorted.length * 0.5)],
        p95Ms: sorted[Math.floor(sorted.length * 0.95)],
        samples: sorted.length,
        devicePixelRatio,
      };
    });
    const telemetry = JSON.parse(
      (await page.getByTestId("chapter-telemetry").textContent()) || "{}",
    );
    await page.screenshot({ path: `${out}/${mode}-room.png` });
    writeFileSync(
      `${out}/${mode}-performance.json`,
      JSON.stringify({ perf, telemetry, errors }, null, 2),
    );
    if (!baseline) {
      const monitor = page.getByRole("button", {
        name: "Mở máy tính",
        exact: true,
      });
      await expect(monitor).toBeVisible();
      const box = await monitor.boundingBox();
      expect(box!.width).toBeGreaterThan(44);
      expect(box!.height).toBeGreaterThan(44);
      if (mode === "desktop") {
        await monitor.focus();
        await page.keyboard.press("Enter");
      } else await monitor.tap();
      await expect(page.locator(".chapter")).toHaveAttribute(
        "data-finale",
        "letter",
      );
      await page.waitForTimeout(2200);
      await page.screenshot({ path: `${out}/${mode}-computer.png` });
      if (mode !== "fallback") {
        const zoomed = JSON.parse(
          (await page.getByTestId("chapter-telemetry").textContent()) || "{}",
        );
        expect(zoomed.world.camera[2]).toBeLessThan(telemetry.world.camera[2]);
      }
      await page.locator("#recipient").fill("Cô Vân");
      await page.locator("#gratitude").fill("Cảm ơn cô đã ở lại.");
      await page.reload();
      await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
      // Continue cold-loads the renderer; await the actual scene before checking draft data.
      await expect(page.locator(".chapter")).toHaveAttribute(
        "data-finale",
        "letter",
        { timeout: 30000 },
      );
      await expect(page.locator("#gratitude")).toHaveValue(
        "Cảm ơn cô đã ở lại.",
      );
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBe(mode === "desktop" ? 1280 : 390);
    }
    expect(errors).toEqual([]);
    await ctx.close();
  });
}
