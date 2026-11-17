import { test, expect, type Locator } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { finaleReady } from "../fixtures/finaleReady";
import { SLICE_KEY } from "../../src/cinematic/director";
import { LETTER_KEY } from "../../src/finale/letter";
const out = "docs/v4-proof/runtime";
mkdirSync(out, { recursive: true });
test.setTimeout(180000);
for (const touch of [false, true])
  test(`V4 Finale focus and mid-transform resume ${touch ? "touch Canvas fallback" : "keyboard-only WebGL"}`, async ({
    browser,
  }) => {
    const ctx = await browser.newContext({
      viewport: touch
        ? { width: 390, height: 844 }
        : { width: 1280, height: 720 },
      isMobile: touch,
      hasTouch: touch,
      reducedMotion: "reduce",
    });
    const page = await ctx.newPage();
    const errors: string[] = [],
      posts: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("request", (r) => {
      if (r.method() === "POST") posts.push(r.url());
    });
    if (touch)
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
    const tabTo = async (b: Locator) => {
      await expect(b).toBeVisible();
      for (let i = 0; i < 40; i++) {
        if (await b.evaluate((el) => el === document.activeElement)) return;
        await page.keyboard.press("Tab");
      }
      throw new Error("Keyboard target not reachable");
    };
    const button = async (name: string) => {
      const b = page.getByRole("button", { name, exact: true });
      if (touch) await b.tap();
      else {
        await tabTo(b);
        await page.keyboard.press("Enter");
      }
    };
    const phase = async (value: string) =>
      expect(page.locator(".chapter")).toHaveAttribute("data-finale", value, {
        timeout: 45000,
      });
    const state = async () =>
      JSON.parse(
        (await page.getByTestId("chapter-telemetry").textContent()) ?? "{}",
      );
    await page.goto("/");
    await page.evaluate(
      ({ key, save }) => localStorage.setItem(key, JSON.stringify(save)),
      { key: SLICE_KEY, save: finaleReady },
    );
    await page.reload();
    await button("Bật âm thanh");
    await button("Tiếp tục");
    await button("Chạm tờ giấy trắng");
    await phase("memory");
    await button("Nhìn chiếc ghế");
    expect((await state()).finale.memoryFocus).toBe("chair");
    await page.waitForTimeout(700);
    await page.screenshot({
      path: `${out}/${touch ? "touch" : "keyboard"}-memory-chair.png`,
    });
    await button("Nhìn cuốn sổ");
    await expect
      .poll(async () => (await state()).finale.memoryFocus)
      .toBe("notebook");
    await phase("paper");
    await button("Chạm tờ giấy để viết");
    await phase("letter");
    const recipient = page.locator("#recipient"),
      message = page.locator("#gratitude");
    if (touch) await recipient.tap();
    else await tabTo(recipient);
    await page.keyboard.insertText("Một người thầy");
    if (touch) await message.tap();
    else await tabTo(message);
    await page.keyboard.insertText(
      "V4_PRIVATE_ỨNG_DỤNG: Cảm ơn vì đã giúp tôi thử tiếp.",
    );
    const local = page.getByRole("checkbox", {
      name: "Lưu riêng bản nháp trên thiết bị này",
      exact: true,
    });
    if (touch) await local.tap();
    else {
      await tabTo(local);
      await page.keyboard.press("Space");
    }
    await expect(local).not.toBeChecked();
    expect(
      await page.evaluate((key) => localStorage.getItem(key), LETTER_KEY),
    ).toBeNull();
    await button("Đọc lại lời cảm ơn");
    await button("Tạo ngôi sao riêng tư");
    await phase("transform");
    await page.waitForTimeout(2200);
    const before = await state();
    await page.waitForTimeout(4100);
    const mid = await state();
    expect(mid.finale.starCue).toBe(true);
    expect(
      mid.audio.events.filter((e: { cue: string }) => e.cue === "finale.star"),
    ).toHaveLength(1);
    if (!touch) expect(mid.world.camera).toEqual(before.world.camera);
    expect(JSON.stringify(mid)).not.toContain("V4_PRIVATE");
    await page.screenshot({
      path: `${out}/${touch ? "touch" : "keyboard"}-reduced-transform.png`,
    });
    await page.reload();
    await button("Tiếp tục");
    await phase("galaxy");
    await button("Nhìn gần ngôi sao của tôi");
    const resumed = await state();
    expect(
      resumed.audio.events.filter(
        (e: { cue: string }) => e.cue === "finale.star",
      ),
    ).toHaveLength(0);
    expect(
      resumed.audio.events.filter((e: { cue: string }) => e.cue === "chair"),
    ).toHaveLength(0);
    await expect(page.getByLabel("Ngôi sao của tôi")).toContainText(
      "Không có nội dung cá nhân được lưu.",
    );
    await page.screenshot({
      path: `${out}/${touch ? "touch" : "keyboard"}-resumed-galaxy.png`,
    });
    await button("Đi tiếp cùng ánh sáng");
    await phase("ending");
    await button("Credits");
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Tab");
    await expect(
      page.getByRole("button", { name: "Đóng Credits", exact: true }),
    ).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.locator(".pause-screen")).toHaveCount(0);
    await button("Trở về menu");
    await button("Tiếp tục");
    await phase("ending");
    const final = await state();
    expect(final.finale.completed).toBe(true);
    expect(posts).toEqual([]);
    expect(errors).toEqual([]);
    writeFileSync(
      `${out}/${touch ? "touch" : "keyboard"}-telemetry.json`,
      JSON.stringify({ ...final, errors, posts }, null, 2),
    );
    await ctx.close();
  });
