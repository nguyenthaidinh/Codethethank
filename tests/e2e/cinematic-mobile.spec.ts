import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";
test.setTimeout(150000);
test("mobile 390: tap full slice, muted reduced motion, pause and save/resume", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  mkdirSync("docs/proof-of-feel", { recursive: true });
  await page.goto("/?record=1&qa=1");
  await page.getByRole("button", { name: "Chơi không âm thanh" }).tap();
  await expect(page.locator(".cinematic")).toHaveAttribute(
    "data-beat",
    "explore",
    { timeout: 20000 },
  );
  await page
    .getByRole("button", { name: "Quan sát laptop", exact: true })
    .tap();
  await page.waitForTimeout(1000);
  await page
    .getByRole("button", { name: "Đọc bản báo cáo", exact: true })
    .tap();
  await expect(page.locator(".cinematic")).toHaveAttribute(
    "data-beat",
    "profile",
    { timeout: 40000 },
  );
  await page.screenshot({ path: "docs/proof-of-feel/mobile-390-profile.png" });
  // Finish this actual recording before reload; this clip proves mobile tap and choreography.
  await page.getByRole("button", { name: "Chọn hồ sơ An", exact: true }).tap();
  await page.getByRole("button", { name: "Tạm dừng", exact: true }).tap();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Tải bản ghi demo" }).tap();
  await (await downloadPromise).saveAs("docs/proof-of-feel/mobile-muted.webm");
  await page.reload();
  await page.getByRole("button", { name: "Chơi không âm thanh" }).tap();
  await expect(page.locator(".cinematic")).toHaveAttribute(
    "data-beat",
    "profile",
  );
  await page
    .getByRole("button", { name: "Chạy hồ sơ An trên laptop", exact: true })
    .tap();
  await expect(page.locator(".cinematic")).toHaveAttribute(
    "data-beat",
    "verdict",
    { timeout: 15000 },
  );
  await page.screenshot({ path: "docs/proof-of-feel/mobile-390-verdict.png" });
  await expect(page.locator(".cinematic")).toHaveAttribute(
    "data-beat",
    "complete",
    { timeout: 40000 },
  );
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth === innerWidth &&
        document.documentElement.scrollHeight === innerHeight,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
  await context.close();
});
test("360: failed audio and storage, keyboard pause, GPU fallback is playable", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 360, height: 800 },
  });
  const page = await context.newPage();
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      ...args: Parameters<typeof original>
    ) {
      if (String(args[0]).includes("webgl")) return null;
      return original.apply(this, args);
    } as typeof original;
    Object.defineProperty(window, "AudioContext", { value: undefined });
    Storage.prototype.setItem = () => {
      throw new Error("blocked");
    };
  });
  await page.goto("/?qa=1");
  await page
    .getByRole("button", { name: "Bước vào căn phòng", exact: false })
    .focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".runtime-status")).toContainText("Đồ họa 2D");
  await expect(page.locator(".runtime-status")).toContainText(
    "Âm thanh không khả dụng",
  );
  await expect(page.locator(".cinematic")).toHaveAttribute(
    "data-beat",
    "explore",
    { timeout: 15000 },
  );
  await page
    .getByRole("button", { name: "Quan sát laptop", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Đọc bản báo cáo", exact: true })
    .click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.screenshot({ path: "docs/proof-of-feel/mobile-360-fallback.png" });
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.locator(".cinematic")).toHaveAttribute(
    "data-beat",
    "profile",
    { timeout: 35000 },
  );
  await page
    .getByRole("button", { name: "Chọn hồ sơ An", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Chạy hồ sơ An trên laptop", exact: true })
    .click();
  await expect(page.locator(".cinematic")).toHaveAttribute(
    "data-beat",
    "verdict",
    { timeout: 10000 },
  );
  await context.close();
});
