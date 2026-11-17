import { test, expect, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { finaleReady } from "../fixtures/finaleReady";
import { freshFinale } from "../../src/finale/state";
import { SLICE_KEY } from "../../src/cinematic/director";
import {
  PREFERENCES_KEY,
  defaultPreferences,
} from "../../src/menu/preferences";

async function ending(page: Page, reduced = false) {
  const save = structuredClone(finaleReady);
  save.chapter!.verdict!.finale = {
    ...freshFinale,
    phase: "ending",
    choice: "skip",
    completed: true,
    starSeen: true,
    starCue: true,
  };
  await page.goto("/");
  await page.evaluate(
    ({ key, save, prefKey, preferences }) => {
      localStorage.setItem(key, JSON.stringify(save));
      localStorage.setItem(prefKey, JSON.stringify(preferences));
    },
    {
      key: SLICE_KEY,
      save,
      prefKey: PREFERENCES_KEY,
      preferences: { ...defaultPreferences, muted: true, reduced },
    },
  );
  await page.reload();
  await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
  await page
    .getByRole("button", { name: "Trở lại màn kết", exact: true })
    .click();
  await expect(page.locator(".ending-screen")).toBeVisible();
  await page
    .locator(".ending-campus")
    .evaluate(async (img: HTMLImageElement) => {
      try {
        await img.decode();
      } catch {
        /* fallback tested separately */
      }
    });
}

test("ending artwork, fireworks toggle, credits, letter and menu remain functional", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setViewportSize({ width: 1440, height: 900 });
  await ending(page);
  await expect(page.locator(".ending-fireworks")).toHaveAttribute(
    "data-active",
    "true",
  );
  await expect
    .poll(() => page.locator(".ending-fireworks").getAttribute("data-frames"))
    .not.toBeNull();
  await page.waitForTimeout(1700);
  mkdirSync("ending-artifacts", { recursive: true });
  await page.screenshot({ path: "ending-artifacts/desktop.png" });
  await page.getByRole("button", { name: "Tắt pháo hoa" }).click();
  await expect(page.locator(".ending-fireworks")).toHaveAttribute(
    "data-active",
    "false",
  );
  await page.getByRole("button", { name: "Bật pháo hoa" }).click();
  await page.getByRole("button", { name: "Credits", exact: true }).click();
  await expect(
    page.getByRole("dialog", { name: "THE UNWRITTEN LESSON", exact: true }),
  ).toBeVisible();
  await page.screenshot({ path: "ending-artifacts/credits-desktop.png" });
  await page.getByText("Công nghệ & nguồn sử dụng", { exact: false }).click();
  await expect(page.getByRole("link", { name: /Piper/ })).toBeVisible();
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: "Xem lời cảm ơn", exact: true })
    .click();
  await expect(page.locator(".chapter")).toHaveAttribute(
    "data-finale",
    "galaxy",
  );
  await expect(page.locator(".ending-fireworks")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Trở lại kết thúc", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Trở lại màn kết", exact: true })
    .click();
  await page.getByRole("button", { name: "Trở về menu", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Bắt đầu hành trình", exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

for (const [name, width, height] of [
  ["mobile", 390, 844],
  ["small", 360, 640],
  ["landscape", 844, 390],
] as const) {
  test(`ending fits ${name} and respects reduced motion`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await ending(page);
    await expect(page.locator(".ending-fireworks")).toHaveAttribute(
      "data-active",
      "false",
    );
    await expect(
      page.getByRole("button", { name: "Đã giảm chuyển động" }),
    ).toBeDisabled();
    for (const name of [
      "Xem tri ân thầy cô",
      "Trở về menu",
      "Chơi lại",
      "Xem lời cảm ơn",
      "Credits",
    ])
      await expect(
        page.getByRole("button", { name, exact: true }),
      ).toBeInViewport();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    );
    expect(overflow).toBe(false);
    await page.screenshot({ path: `ending-artifacts/${name}.png` });
    if (name === "mobile") {
      await page.getByRole("button", { name: "Credits", exact: true }).click();
      await expect(page.getByRole("dialog")).toBeVisible();
      await page.screenshot({ path: "ending-artifacts/credits-mobile.png" });
      await page.keyboard.press("Escape");
      await expect(
        page.getByRole("button", { name: "Credits", exact: true }),
      ).toBeFocused();
    }
  });
}

test("in-game reduced motion stops fireworks and replay restarts the story", async ({
  page,
}) => {
  await ending(page, true);
  await expect(page.locator(".ending-fireworks")).toHaveAttribute(
    "data-active",
    "false",
  );
  await page.getByRole("button", { name: "Chơi lại", exact: true }).click();
  await expect(page.locator(".ending-screen")).toHaveCount(0);
  await expect(page.locator(".chapter")).not.toHaveAttribute(
    "data-finale",
    "ending",
  );
});

test("missing background preserves a readable ending", async ({ page }) => {
  await page.route("**/ending/school-twilight.webp", (route) => route.abort());
  const save = structuredClone(finaleReady);
  save.chapter!.verdict!.finale = {
    ...freshFinale,
    phase: "ending",
    choice: "skip",
    completed: true,
  };
  await page.goto("/");
  await page.evaluate(
    ({ key, save }) => localStorage.setItem(key, JSON.stringify(save)),
    { key: SLICE_KEY, save },
  );
  await page.reload();
  await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
  await page
    .getByRole("button", { name: "Trở lại màn kết", exact: true })
    .click();
  await expect(page.locator(".ending-scenery-fallback")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Trở về menu", exact: true }),
  ).toBeVisible();
});
