import { chromium, expect } from "@playwright/test";
import { writeFileSync } from "node:fs";
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("http://127.0.0.1:5173/docs/art/REVIEW.html");
  await expect(page.locator("h1")).toContainText("G2 Art Review");
  await page.locator("img").evaluateAll(images => images.forEach(image => { image.loading = "eager"; }));
  await expect.poll(() => page.locator("img").evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0))).toBe(true);
  await page.locator("#a").click();
  await expect(page.locator("#direction")).toHaveAttribute("src", /proposal-A-grounded-wide/);
  await page.locator("#b").click();
  await expect(page.locator("#direction")).toHaveAttribute("src", /01-classroom-wide/);
  const video = page.locator("video");
  await expect.poll(() => video.evaluate(v => Number.isFinite(v.duration) && v.duration > 50)).toBe(true);
  await video.evaluate(async v => { v.muted = true; await v.play(); });
  await expect.poll(() => video.evaluate(v => v.currentTime)).toBeGreaterThan(0.1);
  await video.evaluate(v => { v.pause(); v.currentTime = 25; });
  await expect.poll(() => video.evaluate(v => !v.seeking && Math.abs(v.currentTime - 25) < 0.2)).toBe(true);
  const duration = await video.evaluate(v => v.duration);
  await page.screenshot({ path: "docs/art/proof/review-desktop.png" });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth === innerWidth)).toBe(true);
  await page.screenshot({ path: "docs/art/proof/review-mobile.png" });
  expect(errors).toEqual([]);
  writeFileSync("docs/art/proof/review-status.json", JSON.stringify({ status: "passed", images: await page.locator("img").count(), videoDuration: duration, seekSeconds: 25, desktop: [1366,900], mobile: [390,844], errors, updated: new Date().toISOString() }, null, 2));
  console.log("Review gallery PASS: all images, A/B, playback/seek, desktop/mobile");
} finally {
  await browser.close();
}
