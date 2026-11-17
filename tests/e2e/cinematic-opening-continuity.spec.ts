import { test, expect, type Page } from "@playwright/test";
import { freshSlice, SLICE_KEY } from "../../src/cinematic/director";
import { freshChapter } from "../../src/chapter/director";
import {
  defaultPreferences,
  PREFERENCES_KEY,
} from "../../src/menu/preferences";
import { OPENING_TIMING, OPENING_DURATION } from "../../src/future/direction";
const state = async (page: Page) =>
  JSON.parse(
    (await page.getByTestId("chapter-telemetry").textContent()) ?? "{}",
  );
async function canvasOnly(page: Page) {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      ...args: Parameters<typeof original>
    ) {
      return String(args[0]).includes("webgl")
        ? null
        : original.apply(this, args);
    } as typeof original;
  });
}

test("one narration track stays continuous across subtitles and pause", async ({
  page,
}) => {
  test.setTimeout(80000);
  const requests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/voice/")) requests.push(request.url());
  });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await canvasOnly(page);
  await page.goto("/");
  await page.getByRole("button", { name: "Bật âm thanh", exact: true }).click();
  await page
    .getByRole("button", { name: "Bắt đầu hành trình", exact: true })
    .click();
  await expect
    .poll(async () => (await state(page)).voice?.continuous, { timeout: 15000 })
    .toBe(true);
  await expect
    .poll(async () => (await state(page)).time, { timeout: 12000 })
    .toBeGreaterThan(8);
  expect((await state(page)).voice.started).toBe(1);
  await page.getByRole("button", { name: "Tạm dừng", exact: true }).click();
  const paused = await state(page);
  await page.waitForTimeout(700);
  expect((await state(page)).time).toBeCloseTo(paused.time, 1);
  await page
    .getByRole("button", { name: "Tiếp tục quan sát", exact: true })
    .click();
  await expect
    .poll(async () => (await state(page)).time, { timeout: 35000 })
    .toBeGreaterThan(OPENING_TIMING.silent);
  expect((await state(page)).voice.started).toBe(1);
  expect((await state(page)).voice.completed).toBe(1);
  expect(
    requests.filter((url) => url.includes("opening-continuous.mp3")),
  ).toHaveLength(1);
  expect(requests).toHaveLength(1);
  await expect(page.locator(".chapter")).toHaveAttribute(
    "data-chapter",
    "PLAYER_CONTROL_ENABLED",
    { timeout: (OPENING_DURATION - OPENING_TIMING.silent + 3) * 1000 },
  );
  expect(errors).toEqual([]);
  await page.goto("about:blank");
});

test("classroom resumes its saved camera position instead of playing the introduction twice", async ({
  page,
}, testInfo) => {
  test.setTimeout(50000);
  await canvasOnly(page);
  await page.addInitScript(
    ({ key, preferencesKey, save, preferences }) => {
      if (!localStorage.getItem(key))
        localStorage.setItem(key, JSON.stringify(save));
      localStorage.setItem(preferencesKey, JSON.stringify(preferences));
    },
    {
      key: SLICE_KEY,
      preferencesKey: PREFERENCES_KEY,
      preferences: defaultPreferences,
      save: {
        ...freshSlice,
        beat: "explore",
        chapter: {
          ...freshChapter,
          signal: true,
          beat: "CLASSROOM_ESTABLISHING",
          introElapsed: 21,
        },
      },
    },
  );
  await page.goto("/");
  await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
  await expect(page.locator(".subtitle")).toContainText("Cô Vân để lại hồ sơ", {
    timeout: 12000,
  });
  await expect.poll(async () => (await state(page)).time).toBeGreaterThan(24);
  const before = await state(page);
  await page.reload();
  await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
  await expect(page.locator(".subtitle")).toContainText("Cô Vân để lại hồ sơ", {
    timeout: 12000,
  });
  const resumed = await state(page);
  expect(resumed.time).toBeGreaterThanOrEqual(Math.floor(before.time));
  await page.screenshot({
    path: testInfo.outputPath("resumed-dossier-context.png"),
  });
  await expect(page.locator(".chapter")).toHaveAttribute(
    "data-verdict",
    "review",
    { timeout: 18000 },
  );
  await page.waitForTimeout(1200);
  await expect(page.locator(".chapter")).toHaveAttribute(
    "data-verdict",
    "review",
  );
  await page.reload();
  await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
  await expect(
    page.getByRole("region", { name: "Hồ sơ trên bàn" }),
  ).toBeVisible({ timeout: 10000 });
  expect((await state(page)).beat).toBe("NEXT_SCENE_READY");
  await page.goto("about:blank");
});

test("a fresh 3D journey introduces the classroom exactly once", async ({
  page,
}) => {
  test.setTimeout(150000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page
    .getByRole("button", { name: "Bắt đầu hành trình", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Bỏ qua cinematic", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Khám phá tín hiệu", exact: true })
    .click();
  await page
    .getByRole("button", {
      name: "Kiểm tra nguyên tắc HUMAN REVIEW",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", { name: "Truy dấu nguồn gốc năm 2026", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Chạm để mở hồ sơ 2026", exact: false })
    .click();
  await expect(page.locator(".chapter")).toHaveAttribute(
    "data-chapter",
    "CLASSROOM_ESTABLISHING",
    { timeout: 25000 },
  );
  await page.evaluate(() => {
    const samples: { time: number; caption: string }[] = [];
    Object.assign(window, { introSamples: samples });
    const timer = setInterval(() => {
      const telemetry = document.querySelector(
        '[data-testid="chapter-telemetry"]',
      )?.textContent;
      const s = JSON.parse(telemetry ?? "{}");
      if (s.beat !== "CLASSROOM_ESTABLISHING") {
        clearInterval(timer);
        return;
      }
      samples.push({
        time: s.time,
        caption: document.querySelector(".subtitle p")?.textContent ?? "",
      });
    }, 100);
  });
  await expect(page.locator(".chapter")).toHaveAttribute(
    "data-verdict",
    "review",
    { timeout: 48000 },
  );
  const samples = await page.evaluate(
    () =>
      (
        window as unknown as {
          introSamples: { time: number; caption: string }[];
        }
      ).introSamples,
  );
  for (let i = 1; i < samples.length; i++)
    expect(samples[i].time).toBeGreaterThanOrEqual(samples[i - 1].time);
  const captions = samples
    .filter(
      (sample, index) =>
        sample.caption && sample.caption !== samples[index - 1]?.caption,
    )
    .map((sample) => sample.caption);
  expect(
    captions.filter((caption) => caption.includes("Cô Vân để lại hồ sơ")),
  ).toHaveLength(1);
  expect(captions).toHaveLength(5);
  expect((await state(page)).world.drawCalls).toBeGreaterThan(1);
  await page.waitForTimeout(1500);
  await expect(page.locator(".chapter")).toHaveAttribute(
    "data-verdict",
    "review",
  );
  expect(errors).toEqual([]);
  await page.goto("about:blank");
});
