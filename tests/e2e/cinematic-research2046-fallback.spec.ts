import { test, expect } from "@playwright/test";
import { finaleReady } from "../fixtures/finaleReady";
import { SLICE_KEY } from "../../src/cinematic/director";
import { freshRipple } from "../../src/ripple/state";
import {
  defaultPreferences,
  PREFERENCES_KEY,
} from "../../src/menu/preferences";

test("2046 archive works without WebGL, with reduced motion and pause", async ({
  page,
}, info) => {
  test.setTimeout(60000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(
    ({ key, prefsKey, save, prefs }) => {
      localStorage.setItem(key, JSON.stringify(save));
      localStorage.setItem(prefsKey, JSON.stringify(prefs));
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (
        this: HTMLCanvasElement,
        ...args: Parameters<typeof original>
      ) {
        return String(args[0]).includes("webgl")
          ? null
          : original.apply(this, args);
      } as typeof original;
    },
    {
      key: SLICE_KEY,
      prefsKey: PREFERENCES_KEY,
      prefs: { ...defaultPreferences, reduced: true },
      save: {
        ...finaleReady,
        chapter: {
          ...finaleReady.chapter,
          verdict: {
            ...finaleReady.chapter!.verdict,
            ripple: {
              ...freshRipple,
              phase: "record",
              questions: ["prediction", "opportunity"],
              milestones: 3,
            },
          },
        },
      },
    },
  );
  await page.goto("/");
  await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
  const open = page.getByRole("button", {
    name: "Đối chiếu hồ sơ nhà sáng lập",
    exact: true,
  });
  await expect(open).toBeVisible({ timeout: 20000 });
  expect(
    await page
      .locator(".future2046")
      .evaluate((el) => el.scrollWidth <= el.clientWidth),
  ).toBe(true);
  await page.screenshot({ path: info.outputPath("2046-canvas-archive.png") });
  await open.click();
  const progress = page.getByRole("progressbar", { name: "Tiến độ đối chiếu" });
  await expect(progress).toBeVisible();
  await page.getByRole("button", { name: "Tạm dừng", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Tạm dừng", exact: true })).toBeVisible();
  // Telemetry publishes at 10 Hz; let the last pre-pause frame reach the DOM.
  await page.waitForTimeout(200);
  const before = JSON.parse(
    (await page.getByTestId("chapter-telemetry").textContent())!,
  ).time;
  await page.waitForTimeout(450);
  expect(
    JSON.parse((await page.getByTestId("chapter-telemetry").textContent())!)
      .time,
  ).toBe(before);
  await page
    .getByRole("button", { name: "Tiếp tục quan sát", exact: true })
    .click();
  await expect(progress).toBeVisible();
  await expect(page.locator(".chapter")).toHaveAttribute(
    "data-ripple",
    "reveal",
    { timeout: 15000 },
  );
  await expect(page.locator(".future2046-founder")).toBeVisible({
    timeout: 10000,
  });
  expect(errors).toEqual([]);
  await page.goto("about:blank");
});
