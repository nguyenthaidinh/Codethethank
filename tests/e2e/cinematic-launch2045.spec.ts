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
  test(`2045 launch review is readable and continues the story: ${mobile ? "mobile canvas" : "desktop"}`, async ({
    page,
  }, testInfo) => {
    test.setTimeout(70000);
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.setViewportSize(
      mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 },
    );
    await page.addInitScript(
      ({ key, prefsKey, save, prefs, mobile }) => {
        if (!localStorage.getItem(key))
          localStorage.setItem(key, JSON.stringify(save));
        localStorage.setItem(prefsKey, JSON.stringify(prefs));
        if (mobile) {
          const original = HTMLCanvasElement.prototype.getContext;
          HTMLCanvasElement.prototype.getContext = function (
            this: HTMLCanvasElement,
            ...args: Parameters<typeof original>
          ) {
            return String(args[0]).includes("webgl")
              ? null
              : original.apply(this, args);
          } as typeof original;
        }
      },
      {
        key: SLICE_KEY,
        prefsKey: PREFERENCES_KEY,
        mobile,
        prefs: { ...defaultPreferences, reduced: mobile },
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
                phase: "years",
                questions: ["prediction", "opportunity"],
                milestones: 2,
              },
            },
          },
        },
      },
    );
    await page.goto("/");
    await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
    const open = page.getByRole("button", {
      name: "Mở sổ kiểm thử trước ra mắt",
      exact: true,
    });
    await expect(open).toBeVisible({ timeout: 20000 });
    const review = page.getByRole("region", {
      name: "AION · Kiểm thử trước ra mắt năm 2045",
    });
    await expect(review).toBeVisible();
    await page.screenshot({
      path: testInfo.outputPath("2045-initial-layout.png"),
    });
    await expect(
      review.getByRole("heading", { name: /Trước ngày.*ra mắt/s }),
    ).toBeVisible();
    expect(
      await review.evaluate((el) => el.scrollWidth <= el.clientWidth),
    ).toBe(true);
    const bounds = await open.boundingBox();
    expect(bounds!.y + bounds!.height).toBeLessThan((mobile ? 844 : 900) - 20);
    await open.focus();
    await expect(open).toBeFocused();
    await page.waitForTimeout(500);
    await page.screenshot({
      path: testInfo.outputPath("2045-before-opening.png"),
    });
    if (!mobile) {
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.waitForTimeout(250);
      const compact = await open.boundingBox();
      expect(compact!.y + compact!.height).toBeLessThan(700);
      expect(
        await review.evaluate((el) => el.scrollWidth <= el.clientWidth),
      ).toBe(true);
      await page.screenshot({
        path: testInfo.outputPath("2045-laptop-layout.png"),
      });
      await page.setViewportSize({ width: 1440, height: 900 });
    }
    await open.click();
    await expect(page.locator(".chapter")).toHaveAttribute(
      "data-ripple",
      "milestone",
    );
    await expect(review.locator(".launch2045-note h3")).toContainText(
      "AI đề xuất.",
    );
    await expect(review.locator(".launch2045-note h3")).toContainText(
      "xem xét.",
    );
    await expect(review.getByRole("progressbar")).toBeVisible();
    await page.waitForTimeout(500);
    await page.screenshot({
      path: testInfo.outputPath("2045-open-review.png"),
    });
    await expect(page.locator(".chapter")).toHaveAttribute(
      "data-ripple",
      "world",
      { timeout: 15000 },
    );
    expect(errors).toEqual([]);
    await page.goto("about:blank");
  });
}
