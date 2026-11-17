import { expect, test } from "@playwright/test";
import { freshSlice, SLICE_KEY } from "../../src/cinematic/director";
import { freshChapter } from "../../src/chapter/director";
import { classroomReview } from "../../src/verdict/state";
import { freshStay } from "../../src/stayed/state";
import { freshRipple } from "../../src/ripple/state";
import {
  defaultPreferences,
  PREFERENCES_KEY,
} from "../../src/menu/preferences";

for (const mobile of [false, true]) {
  test(`2046 research arrival and archive: ${mobile ? "mobile" : "desktop"}`, async ({
    page,
  }, info) => {
    test.setTimeout(120000);
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.setViewportSize(
      mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 },
    );
    await page.addInitScript(
      ({ key, prefsKey, save, prefs }) => {
        localStorage.setItem(key, JSON.stringify(save));
        localStorage.setItem(prefsKey, JSON.stringify(prefs));
      },
      {
        key: SLICE_KEY,
        prefsKey: PREFERENCES_KEY,
        prefs: { ...defaultPreferences, reduced: false },
        save: {
          ...freshSlice,
          beat: "explore",
          chapter: {
            ...freshChapter,
            beat: "NEXT_SCENE_READY",
            signal: true,
            evidence: ["laptop"],
            verdict: {
              ...classroomReview,
              phase: "chapter02",
              selected: "an",
              tested: ["student07", "an"],
              stayed: {
                ...freshStay,
                phase: "next",
                written: true,
                read: ["outcome", "support"],
                page: "support",
                nextInspected: true,
              },
              ripple: {
                ...freshRipple,
                phase: "world",
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
    await expect(page.locator(".chapter")).toHaveAttribute(
      "data-ripple",
      "world",
      { timeout: 20000 },
    );
    await page.waitForTimeout(6500);
    expect(
      Number(
        await page
          .locator(".subtitle")
          .evaluate((el) => getComputedStyle(el).zIndex),
      ),
    ).toBeGreaterThan(
      Number(
        await page
          .locator(".future2046")
          .evaluate((el) => getComputedStyle(el).zIndex),
      ),
    );
    await page.screenshot({ path: info.outputPath("2046-arrival.png") });
    const record = page.getByRole("button", {
      name: "Đối chiếu hồ sơ nhà sáng lập",
      exact: true,
    });
    await expect(record).toBeVisible({ timeout: 25000 });
    const hud = page.getByRole("region", {
      name: "AION 2046 · Không gian nghiên cứu",
    });
    const fits = async () => {
      expect(await hud.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(
        true,
      );
      const bounds = await record.boundingBox();
      expect(bounds!.x).toBeGreaterThan(10);
      expect(bounds!.y + bounds!.height).toBeLessThan(
        (mobile ? 844 : 900) * 0.84,
      );
    };
    await fits();
    await page.waitForTimeout(1700);
    await page.screenshot({ path: info.outputPath("2046-archive.png") });
    if (!mobile) {
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.waitForTimeout(200);
      const bounds = await record.boundingBox();
      expect(bounds!.y + bounds!.height).toBeLessThan(620);
      await page.screenshot({ path: info.outputPath("2046-laptop.png") });
      await page.setViewportSize({ width: 1440, height: 900 });
    }
    await record.focus();
    await expect(record).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(
      page.getByRole("progressbar", { name: "Tiến độ đối chiếu" }),
    ).toBeVisible();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: info.outputPath("2046-align.png") });
    await expect(page.locator(".chapter")).toHaveAttribute(
      "data-ripple",
      "reveal",
      { timeout: 15000 },
    );
    await page.waitForTimeout(9000);
    await expect(page.locator(".future2046-founder")).toBeVisible();
    await page.screenshot({ path: info.outputPath("2046-founder.png") });
    await expect(page.locator(".chapter")).toHaveAttribute(
      "data-ripple",
      "reconstruct",
      { timeout: 35000 },
    );
    const objects = [
      "Chạm hồ sơ đánh giá 2026",
      "Chạm chiếc ghế được giữ lại",
      "Chạm cuốn sổ thiết kế",
    ];
    for (const name of objects)
      await page.getByRole("button", { name, exact: true }).click();
    await page.screenshot({ path: info.outputPath("2046-memories.png") });
    const unlock = page.getByRole("button", {
      name: "Khớp ba ký ức",
      exact: true,
    });
    await unlock.focus();
    await page.keyboard.press("Enter");
    await expect(page.locator(".chapter")).toHaveAttribute(
      "data-ripple",
      "principle",
    );
    expect(errors).toEqual([]);
    await page.goto("about:blank");
  });
}
