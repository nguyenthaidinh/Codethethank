import { expect, test, type Page } from "@playwright/test";
import { SLICE_KEY } from "../../src/cinematic/director";
import { freshFinale } from "../../src/finale/state";
import {
  defaultPreferences,
  PREFERENCES_KEY,
} from "../../src/menu/preferences";
import teachers from "../../backend/resources/tribute-teachers.json" with { type: "json" };
import { finaleReady } from "../fixtures/finaleReady";

async function openTribute(page: Page, reduced = false) {
  const save = structuredClone(finaleReady);
  save.chapter!.verdict!.finale = {
    ...freshFinale,
    phase: "ending",
    choice: "skip",
    completed: true,
    starSeen: true,
    starCue: true,
  };
  await page.addInitScript(
    ({ save, key, preferences, prefKey }) => {
      localStorage.setItem(key, JSON.stringify(save));
      localStorage.setItem(prefKey, JSON.stringify(preferences));
      const getContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (
        this: HTMLCanvasElement,
        ...args: Parameters<typeof getContext>
      ) {
        return String(args[0]).includes("webgl")
          ? null
          : getContext.apply(this, args);
      } as typeof getContext;
    },
    {
      save,
      key: SLICE_KEY,
      preferences: { ...defaultPreferences, reduced },
      prefKey: PREFERENCES_KEY,
    },
  );
  await page.goto("/");
  await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
  const dialog = page.getByRole("dialog", {
    name: "Tri ân thầy cô",
    exact: true,
  });
  await expect(dialog).toBeVisible({ timeout: 20000 });
  const list = dialog.getByRole("region", { name: "Danh sách thầy cô" });
  await expect(list.getByRole("listitem")).toHaveText(
    teachers.map(({ name }) => name),
  );
  return { dialog, list, roll: list.locator(".game-tribute-roll") };
}

test("teacher names roll upward once and settle on the closing message", async ({
  page,
}, info) => {
  test.setTimeout(65000);
  await page.setViewportSize({ width: 1440, height: 900 });
  const { dialog, list, roll } = await openTribute(page);
  const first = list.getByRole("listitem").first();
  const top = async () => (await first.boundingBox())!.y;
  const start = await top();
  await expect.poll(top).toBeLessThan(start - 5);
  await expect(
    dialog.getByRole("button", { name: "Trở lại màn kết" }),
  ).toBeInViewport();

  await dialog.getByRole("button", { name: "Tạm dừng danh sách" }).click();
  const pausedAt = await top();
  await page.waitForTimeout(350);
  expect(await top()).toBeCloseTo(pausedAt, 1);
  await dialog.getByRole("button", { name: "Tiếp tục danh sách" }).click();
  await expect.poll(top).toBeLessThan(pausedAt - 5);
  await page.screenshot({ path: info.outputPath("teacher-names-rolling.png") });

  const duration = await roll.evaluate((element) => {
    const animation = element.getAnimations()[0];
    const duration = Number(animation.effect!.getTiming().duration);
    animation.currentTime = duration;
    return duration;
  });
  expect(duration).toBeGreaterThan(15000);
  const again = dialog.getByRole("button", { name: "Chạy lại danh sách" });
  await expect(again).toBeVisible();
  const finalOffset = await roll
    .locator(".game-tribute-last > span")
    .evaluate((element) => {
      const message = element.getBoundingClientRect();
      const window = element
        .closest(".game-tribute-window")!
        .getBoundingClientRect();
      return Math.abs(
        (message.top + message.bottom - window.top - window.bottom) / 2,
      );
    });
  expect(finalOffset).toBeLessThan(2);
  await page.screenshot({ path: info.outputPath("teacher-names-closing.png") });
  await again.click();
  await expect(
    dialog.getByRole("button", { name: "Tạm dừng danh sách" }),
  ).toBeVisible();
  expect(await top()).toBeGreaterThan(start - 30);
  await page.keyboard.press("Escape");
  const reopen = page.getByRole("button", { name: "Xem tri ân thầy cô" });
  await expect(reopen).toBeFocused();
  await reopen.click();
  await expect(
    dialog.getByRole("button", { name: "Tạm dừng danh sách" }),
  ).toBeVisible();
  await page.goto("about:blank");
});

test("the tribute offers explicit playback on a small reduced-motion screen", async ({
  page,
}, info) => {
  test.setTimeout(65000);
  await page.setViewportSize({ width: 360, height: 640 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  const { dialog, list, roll } = await openTribute(page, true);
  await expect(dialog).toHaveAttribute("data-roll", "still");
  expect(await roll.evaluate((element) => element.getAnimations().length)).toBe(
    0,
  );
  const play = dialog.getByRole("button", {
    name: "Chạy danh sách",
    exact: true,
  });
  await expect(play).toBeInViewport();
  await play.click();
  const first = list.getByRole("listitem").first();
  const start = (await first.boundingBox())!.y;
  await expect
    .poll(async () => (await first.boundingBox())!.y)
    .toBeLessThan(start - 5);
  await expect(
    dialog.getByRole("button", { name: "Trở lại màn kết" }),
  ).toBeInViewport();
  await page.screenshot({ path: info.outputPath("teacher-names-mobile.png") });
  await page.goto("about:blank");
});
