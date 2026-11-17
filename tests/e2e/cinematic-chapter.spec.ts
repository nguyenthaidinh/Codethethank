import { test, expect, type Page } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
const out = "docs/chapter-00-proof";
mkdirSync(out, { recursive: true });
// Includes cold 3D asset setup and context teardown on software WebGL hosts.
test.setTimeout(240000);
const beat = (page: Page, value: string) =>
  expect(page.locator(".chapter")).toHaveAttribute("data-chapter", value, {
    timeout: 60000,
  });
test("Chapter 00: 360px no WebGL, audio or storage still reaches next scene", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setViewportSize({ width: 360, height: 800 });
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
  await page.goto("/?chapter=1");
  await page.getByRole("button", { name: "Bỏ qua cinematic" }).click();
  await page.getByRole("button", { name: "Khám phá tín hiệu" }).click();
  await page
    .getByRole("button", { name: "Kiểm tra nguyên tắc HUMAN REVIEW", exact: true })
    .click();
  await page
    .getByRole("button", {
      name: "Truy dấu nguồn gốc năm 2026",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", { name: "Chạm để mở hồ sơ 2026", exact: false })
    .click();
  await beat(page, "CLASSROOM_EXPLORATION");
  await expect(page.locator(".runtime-status")).toContainText("Đồ họa 2D");
  await expect(page.locator(".runtime-status")).toContainText(
    "Tiến trình chỉ lưu trong phiên",
  );
  await object(page, "Nhìn đồng hồ");
  await object(page, "Đọc tài liệu thuyết trình");
  await object(page, "Quan sát laptop", false);
  await page.screenshot({ path: `${out}/07-fallback-360.png` });
  await page
    .getByRole("button", { name: "Chuẩn bị kiểm thử", exact: false })
    .click();
  await expect(page.locator(".cinematic")).toHaveAttribute(
    "data-verdict",
    "investigate",
  );
  expect(errors).toEqual([]);
});
const telemetry = async (page: Page) =>
  JSON.parse(
    (await page.getByTestId("chapter-telemetry").textContent()) ?? "{}",
  );
async function object(page: Page, name: string, back = true, touch = false) {
  const button = page.getByRole("button", { name, exact: true });
  if (touch) await button.tap();
  else await button.click();
  await page.waitForTimeout(1700);
  if (back) {
    const b = page.getByRole("button", {
      name: "Nhìn lại căn phòng",
      exact: false,
    });
    if (touch) await b.tap();
    else await b.click();
    await page.waitForTimeout(1600);
  }
}
test("Chapter 00: real menu start, 53s cinema, signal, transition, six props, then Chapter 01", async ({
  page,
}) => {
  mkdirSync(out, { recursive: true });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/");
  await page.getByRole("button", { name: "Bật âm thanh", exact: true }).click();
  await page
    .getByRole("button", { name: "Bắt đầu hành trình", exact: true })
    .click();
  await beat(page, "OPENING_CINEMATIC");
  await expect
    .poll(async () => (await telemetry(page)).world?.ready, { timeout: 40000 })
    .toBe(true);
  await expect
    .poll(async () => (await telemetry(page)).time, { timeout: 20000 })
    .toBeGreaterThan(11);
  await expect
    .poll(async () => (await telemetry(page)).world?.place)
    .toBe("headquarters");
  await expect
    .poll(async () => {
      const state = await telemetry(page);
      return (
        state.audio.buses.music / (state.voice?.status === "speaking" ? 0.3 : 1)
      );
    })
    .toBeCloseTo(0.075 * 0.55, 2);
  expect((await telemetry(page)).audio.buses.effects).toBeCloseTo(0.65, 2);
  await page.screenshot({ path: `${out}/01-summit-desktop.png` });
  await beat(page, "PLAYER_CONTROL_ENABLED");
  await page
    .getByRole("button", { name: "Khám phá tín hiệu", exact: true })
    .click();
  await beat(page, "SIGNAL_INVESTIGATION");
  await page
    .getByRole("button", { name: "Kiểm tra nguyên tắc HUMAN REVIEW", exact: true })
    .click();
  await page
    .getByRole("button", {
      name: "Truy dấu nguồn gốc năm 2026",
      exact: true,
    })
    .click();
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${out}/02-case-2026.png` });
  await page
    .getByRole("button", { name: "Chạm để mở hồ sơ 2026", exact: false })
    .click();
  await beat(page, "MEMORY_TRANSITION");
  await beat(page, "CLASSROOM_ESTABLISHING");
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${out}/03-rain-window.png` });
  await beat(page, "CLASSROOM_EXPLORATION");
  for (const name of [
    "Nhìn qua cửa sổ",
    "Nhìn đồng hồ",
    "Đọc tài liệu thuyết trình",
    "Quan sát ghế trống",
    "Lắng nghe ngoài cửa",
  ])
    await object(page, name);
  await object(page, "Quan sát laptop", false);
  await beat(page, "LAPTOP_INVESTIGATION");
  await page.screenshot({ path: `${out}/04-laptop-desktop.png` });
  const info = await telemetry(page);
  expect(info.evidence).toHaveLength(6);
  expect(
    info.audio.events.filter((e: { cue: string }) => e.cue === "bell"),
  ).toHaveLength(1);
  expect(info.audio.context).toBe("running");
  writeFileSync(`${out}/desktop-telemetry.json`, JSON.stringify(info, null, 2));
  await page
    .getByRole("button", { name: "Chuẩn bị kiểm thử", exact: false })
    .click();
  await expect(page.locator(".cinematic")).toHaveAttribute(
    "data-verdict",
    "investigate",
  );
  expect(page.url()).toBe("http://127.0.0.1:4173/");
  expect(
    await page.evaluate(
      () => performance.getEntriesByType("navigation").length,
    ),
  ).toBe(1);
  expect(errors).toEqual([]);
});
test("Chapter 00 mobile: skip, tap, reduced motion, checkpoint Continue without replay", async ({
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
  await page.goto("/");
  await page
    .getByRole("button", { name: "Bắt đầu hành trình", exact: true })
    .tap();
  await page.getByRole("button", { name: "Bỏ qua cinematic" }).tap();
  await beat(page, "PLAYER_CONTROL_ENABLED");
  await page.getByRole("button", { name: "Khám phá tín hiệu" }).tap();
  await page
    .getByRole("button", { name: "Kiểm tra nguyên tắc HUMAN REVIEW", exact: true })
    .tap();
  await page
    .getByRole("button", {
      name: "Truy dấu nguồn gốc năm 2026",
      exact: true,
    })
    .tap();
  await page.waitForTimeout(1800);
  await page.screenshot({ path: `${out}/05-signal-mobile.png` });
  await page
    .getByRole("button", { name: "Chạm để mở hồ sơ 2026", exact: false })
    .tap();
  await beat(page, "CLASSROOM_EXPLORATION");
  await object(page, "Nhìn đồng hồ", true, true);
  await object(page, "Đọc tài liệu thuyết trình", true, true);
  await page.reload();
  await page.getByRole("button", { name: "Tiếp tục", exact: true }).tap();
  await beat(page, "CLASSROOM_EXPLORATION");
  expect((await telemetry(page)).evidence).toEqual(["clock", "notebook"]);
  await object(page, "Quan sát laptop", false, true);
  await page.screenshot({ path: `${out}/06-laptop-mobile.png` });
  await page.getByRole("button", { name: "Tạm dừng", exact: true }).tap();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByLabel("Giảm chuyển động")).toBeChecked();
  await page.getByLabel("Phụ đề", { exact: true }).uncheck();
  await page.getByRole("button", { name: "Tiếp tục quan sát" }).tap();
  await expect(page.locator(".subtitle")).toHaveCount(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth === innerWidth,
    ),
  ).toBe(true);
  expect((await telemetry(page)).audio).toBeNull();
  await page
    .getByRole("button", { name: "Chuẩn bị kiểm thử", exact: false })
    .tap();
  await expect(page.locator(".cinematic")).toHaveAttribute(
    "data-verdict",
    "investigate",
  );
  expect(errors).toEqual([]);
  await context.close();
});
