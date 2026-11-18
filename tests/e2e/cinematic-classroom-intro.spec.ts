import { test, expect, type Page } from "@playwright/test";
import { freshSlice, SLICE_KEY } from "../../src/cinematic/director";
import { freshChapter } from "../../src/chapter/director";
import { classroomReview } from "../../src/verdict/state";
import {
  defaultPreferences,
  PREFERENCES_KEY,
} from "../../src/menu/preferences";

const state = async (page: Page) =>
  JSON.parse(
    (await page.getByTestId("chapter-telemetry").textContent()) ?? "{}",
  );

for (const mode of ["desktop", "mobile", "fallback"] as const) {
  test(`screen refusal, dossiers, failed retry and chosen dialogue: ${mode}`, async ({
    browser,
  }, testInfo) => {
    test.setTimeout(150000);
    const context = await browser.newContext({
      viewport:
        mode === "desktop"
          ? { width: 1440, height: 900 }
          : { width: 390, height: 844 },
      reducedMotion: mode === "fallback" ? "reduce" : "no-preference",
      hasTouch: mode !== "desktop",
    });
    const page = await context.newPage();
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.addInitScript(
      ({ key, save, fallback, preferencesKey, preferences }) => {
        localStorage.setItem(preferencesKey, JSON.stringify(preferences));
        if (!localStorage.getItem(key))
          localStorage.setItem(key, JSON.stringify(save));
        Object.assign(window, { rejections: [] });
        const fill = CanvasRenderingContext2D.prototype.fillText;
        CanvasRenderingContext2D.prototype.fillText = function (
          ...args: Parameters<typeof fill>
        ) {
          if (args[0] === "NOT RECOMMENDED")
            (window as unknown as { rejections: string[] }).rejections.push(
              String(this.fillStyle),
            );
          return fill.apply(this, args);
        };
        if (fallback) {
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
        save: {
          ...freshSlice,
          beat: "explore",
          chapter:
            mode === "fallback"
              ? {
                  ...freshChapter,
                  beat: "NEXT_SCENE_READY",
                  signal: true,
                  evidence: ["notebook", "laptop"],
                  verdict: classroomReview,
                }
              : {
                  ...freshChapter,
                  beat: "CLASSROOM_ESTABLISHING",
                  signal: true,
                },
        },
        fallback: mode === "fallback",
        preferencesKey: PREFERENCES_KEY,
        preferences: { ...defaultPreferences, captions: false },
      },
    );
    await page.goto("/");
    await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
    const chapter = page.locator(".chapter");
    if (mode !== "fallback") {
      await expect(chapter).toHaveAttribute(
        "data-chapter",
        "CLASSROOM_ESTABLISHING",
      );
      await expect(page.locator(".subtitle")).toContainText(
        "An vẫn chưa tắt máy",
      );
      await expect(page.locator(".world-hotspot")).toHaveCount(0);
      await expect(page.locator(".subtitle")).toContainText("NOT RECOMMENDED", {
        timeout: 12000,
      });
      await expect
        .poll(async () => (await state(page)).time)
        .toBeGreaterThan(10);
      await page.screenshot({
        path: testInfo.outputPath(`${mode}-first-refusal.png`),
      });
      await page.getByRole("button", { name: "Tạm dừng", exact: true }).click();
      const paused = await state(page);
      await page.waitForTimeout(700);
      expect((await state(page)).world.camera).toEqual(paused.world.camera);
      await page
        .getByRole("button", { name: "Tiếp tục quan sát", exact: true })
        .click();
      await expect(page.locator(".subtitle")).toContainText(
        "Mình đã kiểm tra lại",
        { timeout: 10000 },
      );
      await expect(page.locator(".subtitle")).toContainText(
        "Cô Vân để lại hồ sơ",
        { timeout: 12000 },
      );
      await expect(chapter).toHaveAttribute("data-verdict", "review", {
        timeout: 22000,
      });
    }
    await expect(
      page.getByRole("region", { name: "Hồ sơ trên bàn" }),
    ).toBeVisible();
    expect((await state(page)).verdict.tested).toEqual(["student07"]);
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            (window as unknown as { rejections: string[] }).rejections.length,
        ),
      )
      .toBeGreaterThan(0);
    for (const name of ["STUDENT 07", "MAI", "MINH", "AN"]) {
      await page
        .getByRole("button", { name: `Xem hồ sơ ${name}`, exact: true })
        .click();
      await expect(page.locator(".dossier-story h3")).toHaveText(name);
    }
    const name = mode === "desktop" ? "MAI" : mode === "mobile" ? "MINH" : "AN";
    const id = name.toLowerCase();
    await page
      .getByRole("button", { name: `Xem hồ sơ ${name}`, exact: true })
      .click();
    await page.screenshot({
      path: testInfo.outputPath(`${mode}-dossiers.png`),
    });
    await page.waitForTimeout(1200);
    await expect(chapter).toHaveAttribute("data-verdict", "review");
    await page
      .getByRole("button", { name: `Thử lại với hồ sơ ${name}`, exact: false })
      .click();
    await expect(chapter).toHaveAttribute("data-verdict", "choose");
    await page.reload();
    await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
    await expect(chapter).toHaveAttribute("data-verdict", "choose");
    expect((await state(page)).verdict.selected).toBe(id);
    await page
      .getByRole("button", { name: "↵ Chạy đánh giá", exact: true })
      .click();
    await expect(chapter).toHaveAttribute("data-verdict", "reaction");
    await expect(page.locator(".subtitle")).toContainText("NOT RECOMMENDED");
    await page.screenshot({
      path: testInfo.outputPath(`${mode}-retry-refused.png`),
    });
    expect((await state(page)).verdict.tested).toEqual(["student07", id]);
    await expect(chapter).toHaveAttribute("data-verdict", "teacher_enter", {
      timeout: 16000,
    });
    expect((await state(page)).verdict.linked).toEqual([]);
    if (mode !== "fallback") {
      await expect
        .poll(async () => Math.abs((await state(page)).world.doorRotation))
        .toBeGreaterThan(1);
      expect((await state(page)).world.shot).toBe("teacher.entrance");
      await page.screenshot({
        path: testInfo.outputPath(`${mode}-door-opening.png`),
      });
    }
    const choices = page.getByRole("region", { name: "Chọn lời đáp của An" });
    await expect(choices).toBeVisible({ timeout: 18000 });
    await page.waitForTimeout(2500);
    await expect(choices).toBeVisible();
    await page.screenshot({
      path: testInfo.outputPath(`${mode}-reply-choice.png`),
    });
    await page
      .getByRole("button", {
        name: "Em không biết mình đang sai ở đâu.",
        exact: true,
      })
      .click();
    await expect(page.locator(".subtitle")).toContainText(
      "không biết mình sai ở đâu nữa",
    );
    await page.waitForTimeout(2500);
    await expect(page.locator(".subtitle")).toContainText(
      "không biết mình sai ở đâu nữa",
    );
    await page.getByRole("button", { name: "Tiếp lời", exact: false }).click();
    await expect(page.locator(".subtitle")).toContainText("Em đang thử làm gì vậy?");
    await page.reload();
    await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
    await expect(page.locator(".subtitle")).toContainText("Em đang thử làm gì vậy?");
    expect((await state(page)).stayed.responses["discussion.0"]).toBe("doubt");
    for (let steps = 0; steps < 24; steps++) {
      const s = (await state(page)).stayed;
      if (s.phase === "question" && s.line === 9) break;
      if (await choices.isVisible())
        await choices.getByRole("button").first().click();
      else if (
        await page
          .getByRole("button", { name: "Tiếp lời", exact: false })
          .isVisible()
      )
        await page
          .getByRole("button", { name: "Tiếp lời", exact: false })
          .click();
      else await page.waitForTimeout(700);
    }
    await expect(choices).toBeVisible();
    await page
      .getByRole("button", {
        name: "Nếu em lại thất bại thì sao?",
        exact: true,
      })
      .click();
    await page.getByRole("button", { name: "Tiếp lời", exact: false }).click();
    await expect(page.locator(".subtitle")).toContainText(
      "không khiến em mất quyền được học tiếp",
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(errors).toEqual([]);
    await context.close();
  });
}
