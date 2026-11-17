import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
mkdirSync("menu-artifacts", { recursive: true });
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  page.on("pageerror", (error) => console.log("PAGE ERROR", error.message));
  for (const [name, width, height] of [
    ["desktop", 1366, 768],
    ["wide", 1920, 1080],
    ["mobile", 390, 844],
    ["small", 360, 640],
    ["landscape", 844, 390],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto(process.env.MENU_TEST_URL ?? "http://127.0.0.1:4187/");
    await page.locator('.menu-scene[data-assets-ready="true"]').waitFor();
    await page.screenshot({ path: `menu-artifacts/${name}.png` });
    console.log(
      name,
      await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        scrollHeight: document.documentElement.scrollHeight,
        viewport: [innerWidth, innerHeight],
      })),
    );
  }
} finally {
  await browser.close();
}
