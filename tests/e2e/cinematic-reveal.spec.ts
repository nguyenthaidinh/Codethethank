import { test, expect } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { finaleReady } from "../fixtures/finaleReady";
import { freshFinale } from "../../src/finale/state";
import { LETTER_KEY, blankLetter } from "../../src/finale/letter";
import { SLICE_KEY } from "../../src/cinematic/director";
// Includes timed transitions, cold Continue, forced context loss and ending replay.
test.setTimeout(180000);
const out = "docs/finale-f5-4-proof/runtime";
mkdirSync(out, { recursive: true });
for (const mode of ["desktop", "mobile", "fallback", "reduced"])
  test(`F5.4 ${mode}: reveal resume full text privacy completion`, async ({
    browser,
  }) => {
    const mobile = mode === "mobile" || mode === "fallback",
      reduced = mode === "reduced" || mode === "fallback",
      skip = mode === "reduced";
    const ctx = await browser.newContext({
      viewport: mobile
        ? { width: 390, height: 844 }
        : { width: 1280, height: 720 },
      isMobile: mobile,
      hasTouch: mobile,
      reducedMotion: reduced ? "reduce" : "no-preference",
    });
    const page = await ctx.newPage(),
      errors: string[] = [],
      posts: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("request", (r) => {
      if (r.method() === "POST") posts.push(r.url());
    });
    const save = structuredClone(finaleReady);
    save.chapter!.verdict!.finale = {
      ...freshFinale,
      phase: skip ? "paper" : "review",
    };
    const message =
      "Cảm ơn cô đã ở lại. Một câu hỏi đã giúp em bắt đầu lại.\n\n".repeat(6) +
      "<script>window.leaked=1</script>";
    const letter = {
      ...blankLetter,
      recipient: "Cô Vân",
      message,
      displayName: "Minh 🌟",
    };
    await page.addInitScript(
      ({ save, letter, saveKey, letterKey, fallback }) => {
        if (!sessionStorage.getItem("f54")) {
          localStorage.setItem(saveKey, JSON.stringify(save));
          localStorage.setItem(letterKey, JSON.stringify(letter));
          sessionStorage.setItem("f54", "1");
        }
        if (fallback) {
          const orig = HTMLCanvasElement.prototype.getContext;
          HTMLCanvasElement.prototype.getContext = function (
            ...args: Parameters<typeof orig>
          ) {
            return String(args[0]).includes("webgl")
              ? null
              : orig.apply(this, args);
          } as typeof orig;
        }
      },
      {
        save,
        letter,
        saveKey: SLICE_KEY,
        letterKey: LETTER_KEY,
        fallback: mode === "fallback",
      },
    );
    const click = async (name: string) => {
      const b = page.getByRole("button", { name, exact: true });
      if (mobile) await b.tap();
      else await b.click();
    };
    const phase = async (value: string) =>
      expect(page.locator(".chapter")).toHaveAttribute("data-finale", value, {
        timeout: 40000,
      });
    const state = async () =>
      JSON.parse(
        (await page.getByTestId("chapter-telemetry").textContent()) || "{}",
      );
    await page.goto("/");
    if (mode === "desktop") await click("Bật âm thanh");
    await click("Tiếp tục");
    await phase(skip ? "paper" : "review");
    await click(skip ? "Giữ im lặng và tiếp tục" : "Tạo ngôi sao riêng tư");
    await phase("transform");
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${out}/${mode}-01-release.png` });
    const early = await state();
    await click("Tạm dừng");
    const paused = (await state()).time;
    await page.waitForTimeout(450);
    expect(Math.abs((await state()).time - paused)).toBeLessThan(0.2);
    await click("Tiếp tục quan sát");
    if (mode === "reduced") {
      await page.waitForTimeout(2000);
      expect((await state()).world.camera).toEqual(early.world.camera);
    }
    await page.waitForFunction(
      () => {
        const el = document.querySelector('[data-testid="chapter-telemetry"]');
        if (!el) return false;
        const s = JSON.parse(el.textContent || "{}");
        return s.finale?.phase === "transform" && s.time >= 5.6;
      },
      null,
      { timeout: 15000 },
    );
    await page.screenshot({ path: `${out}/${mode}-02-arrival.png` });
    if (mode === "desktop") {
      expect(
        (await state()).audio.events.filter(
          (e: { cue: string }) => e.cue === "finale.star",
        ),
      ).toHaveLength(1);
      await page.reload();
      await click("Tiếp tục");
    }
    await phase("galaxy");
    await page.screenshot({ path: `${out}/${mode}-03-wall.png` });
    const before = await state();
    await click("Nhìn gần ngôi sao của tôi");
    await page.waitForTimeout(1400);
    const panel = page.getByLabel("Ngôi sao của tôi");
    await expect(panel).toBeVisible();
    if (mode === "desktop" || mode === "mobile")
      expect((await state()).world.camera[2]).toBeLessThan(
        before.world.camera[2],
      );
    let collected = "";
    const next = page.getByRole("button", {
      name: "Trang lời nhắn sau",
      exact: true,
    });
    for (let i = 0; i < 20; i++) {
      collected += await page.locator(".reveal-message").textContent();
      if (!(await next.count()) || (await next.isDisabled())) break;
      await next.click();
    }
    expect(collected).toBe(
      skip ? "Bạn đã chọn không viết lời nhắn cá nhân." : message,
    );
    if (skip) {
      await expect(panel).not.toContainText("Minh");
      await expect(panel).not.toContainText("Cô Vân");
    }
    expect(await page.evaluate(() => Object.hasOwn(window, "leaked"))).toBe(
      false,
    );
    expect(
      await page.getByTestId("chapter-telemetry").textContent(),
    ).not.toContain("Minh");
    await page.screenshot({ path: `${out}/${mode}-04-inspect.png` });
    if (mode === "desktop") {
      expect(
        (await state()).audio.events.filter(
          (e: { cue: string }) => e.cue === "finale.star",
        ),
      ).toHaveLength(0);
      await page.evaluate(() => {
        const canvas =
          document.querySelector<HTMLCanvasElement>(".chapter-room")!;
        canvas
          .getContext("webgl2")
          ?.getExtension("WEBGL_lose_context")
          ?.loseContext();
      });
      await expect
        .poll(async () => (await state()).world?.drawCalls, { timeout: 15000 })
        .toBe(1);
      await expect(panel).toBeVisible();
      await page.screenshot({ path: `${out}/desktop-context-loss.png` });
    }
    if (!skip) {
      await click("Xóa nội dung đã lưu");
      await expect(panel).toContainText("Không có nội dung cá nhân được lưu.");
      await expect(panel).not.toContainText("Minh");
      expect(
        await page.evaluate((key) => localStorage.getItem(key), LETTER_KEY),
      ).toBeNull();
    }
    await click("Đi tiếp cùng ánh sáng");
    await phase("closing");
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `${out}/${mode}-05-closing.png` });
    await phase("ending");
    expect((await state()).finale.completed).toBe(true);
    await click("Trở về menu");
    await click("Tiếp tục");
    await phase("ending");
    await click("Xem lời cảm ơn");
    await phase("galaxy");
    await click("Trở lại kết thúc");
    await phase("ending");
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBe(mobile ? 390 : 1280);
    expect(posts).toEqual([]);
    expect(errors).toEqual([]);
    writeFileSync(
      `${out}/${mode}-telemetry.json`,
      JSON.stringify(await state(), null, 2),
    );
    await ctx.close();
  });
