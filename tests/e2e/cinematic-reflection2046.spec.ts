import { expect, test } from "@playwright/test";
import { SLICE_KEY } from "../../src/cinematic/director";
import { freshFinale } from "../../src/finale/state";
import {
  defaultPreferences,
  PREFERENCES_KEY,
} from "../../src/menu/preferences";
import { finaleReady } from "../fixtures/finaleReady";

test("the last conversation keeps the 2046 studio through the lesson", async ({
  page,
}, info) => {
  test.setTimeout(90000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 900 });
  const save = structuredClone(finaleReady);
  save.chapter!.verdict!.finale = {
    ...freshFinale,
    phase: "lesson",
    elapsed: 6,
  };
  await page.addInitScript(
    ({ saveKey, save, prefsKey, prefs }) => {
      localStorage.setItem(saveKey, JSON.stringify(save));
      localStorage.setItem(prefsKey, JSON.stringify(prefs));
    },
    {
      saveKey: SLICE_KEY,
      save,
      prefsKey: PREFERENCES_KEY,
      prefs: { ...defaultPreferences, muted: true, reduced: true },
    },
  );
  await page.goto("/");
  await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
  await expect(page.locator(".chapter")).toHaveAttribute(
    "data-finale",
    "lesson",
    { timeout: 25000 },
  );
  await expect(page.locator(".subtitle")).toContainText(
    /Cô cùng An đọc lại dữ liệu|Cô không làm thay bài tập|Sự tận tâm ấy/,
    { timeout: 15000 },
  );
  await expect(page.getByTestId("chapter-telemetry")).toContainText(
    '"futureWorkspace":true',
  );
  await page.screenshot({ path: info.outputPath("2046-lesson-desktop.png") });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator(".future-reflection-header")).toBeInViewport();
  await expect(page.locator(".subtitle")).toBeInViewport();
  await page.screenshot({ path: info.outputPath("2046-lesson-mobile.png") });
  await expect(page.locator(".chapter")).toHaveAttribute(
    "data-finale",
    "paper",
    { timeout: 42000 },
  );
  await expect(
    page.getByRole("button", { name: "Mở máy tính", exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
