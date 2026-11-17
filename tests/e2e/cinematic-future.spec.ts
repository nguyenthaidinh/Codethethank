import { mkdirSync } from "node:fs";
const out = "docs/story/n2-proof/runtime";
mkdirSync(out, { recursive: true });
import { test, expect, type Page } from "@playwright/test";
import { freshSlice, SLICE_KEY } from "../../src/cinematic/director";
import { freshChapter } from "../../src/chapter/director";
const info = async (page: Page) =>
  JSON.parse(
    (await page.getByTestId("chapter-telemetry").textContent()) ?? "{}",
  );
const button = (page: Page, name: string) =>
  page.getByRole("button", { name, exact: true });
test.setTimeout(150000);
test("G2F city, occupied headquarters, reactive core, inspection resume and unchanged room", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await button(page, "Bắt đầu hành trình").click();
  await expect
    .poll(async () => (await info(page)).world?.assetsComplete, {
      timeout: 40000,
    })
    .toBe(true);
  await expect
    .poll(async () => (await info(page)).time, { timeout: 30000 })
    .toBeGreaterThan(5);
  expect((await info(page)).world.assetErrors).toEqual([]);
  expect((await info(page)).world.landmark).toBe("aion-citadel-v2");
  expect((await info(page)).world.historicalAnalysis).toBeNull();
  await expect
    .poll(async () => (await info(page)).world?.place, { timeout: 30000 })
    .toBe("headquarters");
  await expect
    .poll(async () => (await info(page)).world?.place, { timeout: 30000 })
    .toBe("core");
  await expect
    .poll(async () => (await info(page)).world?.place, { timeout: 30000 })
    .toBe("anomaly");
  expect((await info(page)).world.historicalAnalysis).toMatchObject({
    principle: "HUMAN REVIEW",
    function: "VERIFIED",
    origin: "INCOMPLETE",
    year: 2026,
  });
  expect(JSON.stringify((await info(page)).world)).not.toMatch(
    /founder|nhà sáng lập/i,
  );
  await button(page, "Nhìn về khu nghiên cứu").click();
  await expect.poll(async () => (await info(page)).world?.view).toBe("atrium");
  await page
    .getByRole("button", { name: "Trở lại bàn đối chiếu", exact: false })
    .click();
  await button(page, "Khám phá tín hiệu").click();
  await page.screenshot({
    path: `${out}/audit-${test.info().title.includes("lost WebGL") ? "fallback-start" : "desktop"}.png`,
  });
  await expect(
    page.getByRole("button", { name: "Chạm để mở hồ sơ 2026", exact: false }),
  ).toHaveCount(0);
  await button(page, "Kiểm tra nguyên tắc HUMAN REVIEW").focus();
  await page.keyboard.press("Enter");
  await expect
    .poll(async () => (await info(page)).world?.investigated)
    .toEqual(["source"]);
  await page.screenshot({ path: `${out}/principle.png` });
  await page.reload();
  await button(page, "Tiếp tục").click();
  await expect(
    button(page, "Kiểm tra nguyên tắc HUMAN REVIEW"),
  ).toHaveAttribute("aria-pressed", "true");
  await button(page, "Truy dấu nguồn gốc năm 2026").focus();
  await page.keyboard.press("Enter");
  await expect
    .poll(async () => (await info(page)).world?.selected)
    .toBe("limit");
  await page.screenshot({ path: `${out}/origin.png` });
  await page
    .getByRole("button", { name: "Chạm để mở hồ sơ 2026", exact: false })
    .click();
  await expect(page.locator(".chapter")).toHaveAttribute(
    "data-chapter",
    "CLASSROOM_EXPLORATION",
    { timeout: 30000 },
  );
  expect((await info(page)).world.characterArt).toBe("sculpted-narrative-v1");
  expect(
    await page
      .locator(".chapter-future")
      .evaluate((node) =>
        (node as HTMLCanvasElement).getContext("webgl2")?.isContextLost(),
      ),
  ).toBe(true);
  expect(errors).toEqual([]);
});
test("G2F touch, reduced motion and muted play keep inspection usable", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  try {
    await page.goto("/");
    await button(page, "Bắt đầu hành trình").tap();
    await button(page, "Bỏ qua cinematic").tap();
    await button(page, "Khám phá tín hiệu").tap();
    for (const label of [
      "Kiểm tra nguyên tắc HUMAN REVIEW",
      "Truy dấu nguồn gốc năm 2026",
    ]) {
      const b = button(page, label);
      await b.tap();
      const box = await b.boundingBox();
      expect(box?.width).toBeGreaterThanOrEqual(44);
      expect(box?.height).toBeGreaterThanOrEqual(44);
    }
    await page.screenshot({ path: `${out}/mobile-origin.png` });
    const before = (await info(page)).world.camera;
    await page.waitForTimeout(500);
    expect((await info(page)).world.camera).toEqual(before);
    expect((await info(page)).audio).toBeNull();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth === innerWidth,
      ),
    ).toBe(true);
    await page
      .getByRole("button", { name: "Chạm để mở hồ sơ 2026", exact: false })
      .tap();
    await expect(page.locator(".chapter")).toHaveAttribute(
      "data-chapter",
      "CLASSROOM_EXPLORATION",
      { timeout: 30000 },
    );
  } finally {
    await context.close();
  }
});
test("G2F missing city assets and lost WebGL retain a playable Canvas path", async ({
  page,
}) => {
  await page.route("**/future/**", (r) => r.abort());
  await page.goto("/");
  await button(page, "Bắt đầu hành trình").click();
  await button(page, "Bỏ qua cinematic").click();
  await button(page, "Khám phá tín hiệu").click();
  await expect
    .poll(async () => (await info(page)).world?.assetErrors?.length, {
      timeout: 20000,
    })
    .toBeGreaterThan(0);
  await page
    .locator(".chapter-future")
    .evaluate((node) =>
      (node as HTMLCanvasElement)
        .getContext("webgl2")
        ?.getExtension("WEBGL_lose_context")
        ?.loseContext(),
    );
  await expect
    .poll(async () => (await info(page)).world?.renderer)
    .toBe("future-canvas-fallback");
  await button(page, "Kiểm tra nguyên tắc HUMAN REVIEW").click();
  await button(page, "Truy dấu nguồn gốc năm 2026").click();
  await page.screenshot({ path: `${out}/canvas-origin.png` });
  await page
    .getByRole("button", { name: "Chạm để mở hồ sơ 2026", exact: false })
    .click();
  await expect(page.locator(".chapter")).toHaveAttribute(
    "data-chapter",
    "CLASSROOM_EXPLORATION",
    { timeout: 30000 },
  );
});
test("G2F later checkpoints request no future world module or environment assets", async ({
  page,
}) => {
  const requests: string[] = [];
  page.on("request", (r) => {
    if (r.url().includes("/future/") || /\/FutureWorld-/.test(r.url()))
      requests.push(r.url());
  });
  await page.goto("/");
  await page.evaluate(
    ({ key, save }) => localStorage.setItem(key, JSON.stringify(save)),
    {
      key: SLICE_KEY,
      save: {
        ...freshSlice,
        muted: true,
        beat: "explore",
        chapter: {
          ...freshChapter,
          beat: "CLASSROOM_EXPLORATION",
          signal: true,
        },
      },
    },
  );
  await page.reload();
  await button(page, "Tiếp tục").click();
  await expect(page.locator(".chapter")).toHaveAttribute(
    "data-chapter",
    "CLASSROOM_EXPLORATION",
  );
  await expect
    .poll(async () => (await info(page)).world?.characterArt, {
      timeout: 20000,
    })
    .toBe("sculpted-narrative-v1");
  expect(requests).toEqual([]);
});
