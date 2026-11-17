import { test, expect } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { freshSlice, SLICE_KEY } from "../../src/cinematic/director";
import { freshStay } from "../../src/stayed/state";
import { freshRipple } from "../../src/ripple/state";
import { freshVerdict } from "../../src/verdict/state";
import { LETTER_KEY } from "../../src/finale/letter";
const out = process.env.GAME_PROOF_OUT
  ? `${process.env.GAME_PROOF_OUT}/finale-regression`
  : "docs/final-act-proof";
mkdirSync(out, { recursive: true });
export const checkpoint = {
  ...freshSlice,
  beat: "explore",
  chapter: {
    version: 1,
    beat: "NEXT_SCENE_READY",
    signal: true,
    evidence: ["clock", "notebook", "laptop"],
    verdict: {
      ...freshVerdict,
      phase: "chapter02",
      found: ["presentation", "notes", "data"],
      tested: ["student07", "an"],
      selected: "an",
      linked: ["presentation", "notes"],
      stayed: {
        ...freshStay,
        phase: "next",
        read: ["outcome", "support"],
        page: "support",
        written: true,
        nextInspected: true,
      },
      ripple: {
        ...freshRipple,
        phase: "finale",
        questions: ["prediction", "opportunity"],
        milestones: 3,
        memories: ["evaluation", "stayed", "design"],
        played: ["echo.chair", "chair.chair", "reveal.music"],
      },
    },
  },
};
// Replay now includes cold initialization of the opening 3D environment.
test.setTimeout(240000);
for (const fallback of [false, true])
  test(`Final Act ${fallback ? "mobile fallback skip offline" : "desktop private letter IME resume galaxy menu replay"}`, async ({
    browser,
  }) => {
    const ctx = await browser.newContext({
      viewport: fallback
        ? { width: 390, height: 844 }
        : { width: 1280, height: 720 },
      isMobile: fallback,
      hasTouch: fallback,
      reducedMotion: fallback ? "reduce" : "no-preference",
    });
    const page = await ctx.newPage();
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    if (fallback)
      await page.addInitScript(() => {
        const orig = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function (
          this: HTMLCanvasElement,
          ...args: Parameters<typeof orig>
        ) {
          return String(args[0]).includes("webgl")
            ? null
            : orig.apply(this, args);
        } as typeof orig;
      });
    const state = async () =>
      JSON.parse(
        (await page.getByTestId("chapter-telemetry").textContent()) ?? "{}",
      );
    const phase = async (s: string) =>
      expect(page.locator(".chapter")).toHaveAttribute("data-finale", s, {
        timeout: 40000,
      });
    const click = async (name: string) => {
      const b = page.getByRole("button", { name, exact: true });
      if (fallback) await b.tap();
      else await b.click();
    };
    await page.goto("/");
    await page.evaluate(
      ({ key, save }) => localStorage.setItem(key, JSON.stringify(save)),
      { key: SLICE_KEY, save: checkpoint },
    );
    await page.reload();
    if (!fallback) await click("Bật âm thanh");
    await click("Tiếp tục");
    await click("Chạm tờ giấy trắng");
    await phase("lesson");
    await expect(page.locator(".subtitle")).toContainText("HUMAN REVIEW");
    await expect(page.locator(".subtitle")).toContainText(
      "cô đã ngồi lại, lắng nghe",
      { timeout: 15000 },
    );
    await page.screenshot({
      path: `${out}/${fallback ? "fallback" : "desktop"}-lesson.png`,
    });
    await expect(page.locator(".subtitle")).toContainText(
      "cô không biết học trò",
      { timeout: 12000 },
    );
    await expect(page.locator(".subtitle")).toContainText(
      "vẫn cần một người ngồi lại",
      { timeout: 12000 },
    );
    await phase("question");
    await expect(page.locator(".subtitle")).toContainText("Ai đã từng ở lại", {
      timeout: 10000,
    });
    await phase("paper");
    await page.evaluate(() =>
      Object.assign(window, {
        finalCanvas: document.querySelector(".chapter-room"),
      }),
    );
    await page.screenshot({
      path: `${out}/${fallback ? "fallback" : "desktop"}-01-paper.png`,
    });
    if (fallback) {
      await ctx.setOffline(true);
      await click("Giữ im lặng và tiếp tục");
    } else {
      await click("Chạm tờ giấy để viết");
      await phase("letter");
      await expect(page.locator("#recipient")).toBeFocused();
      await page.locator("#recipient").fill("Cô Vân");
      await page.locator("#gratitude").dispatchEvent("compositionstart");
      await page.locator("#gratitude").fill("ấ".repeat(503));
      await expect(page.locator("#gratitude")).toHaveValue("ấ".repeat(503));
      await page.locator("#gratitude").dispatchEvent("compositionend");
      await expect(page.locator("#gratitude")).toHaveValue("ấ".repeat(500));
      await page
        .locator("#gratitude")
        .fill("Cảm ơn cô vì đã ngồi lại. <script>window.leaked=1</script>");
      await page.screenshot({ path: `${out}/desktop-02-letter.png` });
      await page.reload();
      await click("Tiếp tục");
      await phase("letter");
      await expect(page.locator("#gratitude")).toContainText("Cảm ơn cô");
      await expect
        .poll(async () => (await state()).world?.drawCalls ?? 0)
        .toBeGreaterThan(0);
      await page.evaluate(() =>
        Object.assign(window, {
          finalCanvas: document.querySelector(".chapter-room"),
        }),
      );
      await click("Đọc lại lời cảm ơn");
      await click("Tạo ngôi sao riêng tư");
    }
    await phase("transform");
    await page.waitForTimeout(6500);
    await page.screenshot({
      path: `${out}/${fallback ? "fallback" : "desktop"}-03-transform.png`,
    });
    await phase("galaxy");
    await click("Nhìn gần ngôi sao của tôi");
    await page.screenshot({
      path: `${out}/${fallback ? "fallback" : "desktop"}-04-galaxy.png`,
    });
    if (!fallback) {
      await expect(page.getByLabel("Ngôi sao của tôi")).toContainText(
        "Cảm ơn cô",
      );
      expect(
        (await page.getByTestId("chapter-telemetry").textContent())?.includes(
          "Cảm ơn cô",
        ),
      ).toBe(false);
      expect(await page.evaluate(() => Object.hasOwn(window, "leaked"))).toBe(
        false,
      );
    }
    if (fallback) {
      await expect(page.getByLabel("Ngôi sao của tôi")).toContainText(
        "không viết lời nhắn cá nhân",
      );
      expect(
        await page.evaluate((key) => localStorage.getItem(key), LETTER_KEY),
      ).toBeNull();
    }
    await expect(page.locator(".galaxy-truth")).toContainText(
      "Không phải bài đăng cộng đồng",
    );
    await click("Đi tiếp cùng ánh sáng");
    await phase("closing");
    await expect(page.locator(".subtitle")).toContainText(
      "Có những bài học không được viết thành lời.",
    );
    await expect(page.locator(".subtitle")).toContainText(
      "trao đi suốt một đời",
      { timeout: 12000 },
    );
    await phase("ending");
    await expect(page.locator(".ending-title")).toContainText(
      "Có những bài học không được viết thành lời.",
    );
    await page.screenshot({
      path: `${out}/${fallback ? "fallback" : "desktop"}-05-ending.png`,
    });
    let s = await state();
    expect(s.finale.completed).toBe(true);
    expect(
      s.audio?.events.filter((e: { cue: string }) => e.cue === "chair") ?? [],
    ).toHaveLength(0);
    expect(
      await page.evaluate(
        () =>
          document.querySelector(".chapter-room") ===
          (window as unknown as { finalCanvas: Element }).finalCanvas,
      ),
    ).toBe(true);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBe(fallback ? 390 : 1280);
    expect(errors).toEqual([]);
    writeFileSync(
      `${out}/${fallback ? "fallback" : "desktop"}-telemetry.json`,
      JSON.stringify(s, null, 2),
    );
    if (!fallback) {
      await click("Credits");
      await expect(page.getByRole("dialog")).toBeVisible();
      await page.keyboard.press("Escape");
      await click("Xem lời cảm ơn");
      await phase("galaxy");
      await click("Xóa nội dung đã lưu");
      expect(
        await page.evaluate((key) => localStorage.getItem(key), LETTER_KEY),
      ).toBeNull();
      await click("Trở lại kết thúc");
      await phase("ending");
      await click("Trở về menu");
      await click("Tiếp tục");
      await phase("ending");
      s = await state();
      expect(
        s.audio?.events.filter(
          (e: { cue: string }) => e.cue === "finale.star",
        ) ?? [],
      ).toHaveLength(0);
      await click("Chơi lại");
      await expect(page.locator(".chapter")).toHaveAttribute(
        "data-chapter",
        "OPENING_CINEMATIC",
      );
    }
    await ctx.close();
  });

test("Final Act 360px: unavailable storage/audio keeps private letter playable", async ({
  browser,
}) => {
  const ctx = await browser.newContext({
    viewport: { width: 360, height: 800 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: "reduce",
  });
  const page = await ctx.newPage();
  const save = {
    ...checkpoint,
    chapter: {
      ...checkpoint.chapter,
      verdict: {
        ...checkpoint.chapter.verdict,
        finale: {
          version: 1,
          phase: "letter",
          elapsed: 0,
          choice: null,
          starSeen: false,
          starCue: false,
          completed: false,
        },
      },
    },
  };
  await page.addInitScript(
    ({ key, save }) => {
      localStorage.setItem(key, JSON.stringify(save));
      Storage.prototype.setItem = () => {
        throw new Error("blocked");
      };
      Object.defineProperty(window, "AudioContext", { value: undefined });
    },
    { key: SLICE_KEY, save },
  );
  await page.goto("/");
  await page.getByRole("button", { name: "Tiếp tục", exact: true }).tap();
  await expect(page.locator(".chapter")).toHaveAttribute(
    "data-finale",
    "letter",
  );
  await page.getByRole("button", { name: "Bật âm thanh", exact: true }).tap();
  await expect(page.locator(".runtime-status")).toContainText(
    "Âm thanh chưa khả dụng",
  );
  await page.getByRole("button", { name: "Gợi ý 2", exact: true }).tap();
  await expect(page.locator("#letter-status")).toContainText("Chưa có bản lưu");
  await page
    .getByRole("button", { name: "Đọc lại lời cảm ơn", exact: true })
    .tap();
  await page
    .getByRole("button", { name: "Tạo ngôi sao riêng tư", exact: true })
    .tap();
  await expect(page.locator(".chapter")).toHaveAttribute(
    "data-finale",
    "galaxy",
    { timeout: 20000 },
  );
  await page
    .getByRole("button", { name: "Nhìn gần ngôi sao của tôi", exact: true })
    .tap();
  await expect(page.getByLabel("Ngôi sao của tôi")).toContainText(
    "Chỉ giữ trong phiên",
  );
  expect(
    await page.evaluate((key) => localStorage.getItem(key), LETTER_KEY),
  ).toBeNull();
  await page.screenshot({ path: `${out}/360-storage-audio-failure.png` });
  await page
    .getByRole("button", { name: "Đi tiếp cùng ánh sáng", exact: true })
    .tap();
  await expect(page.locator(".chapter")).toHaveAttribute(
    "data-finale",
    "ending",
    { timeout: 20000 },
  );
  await ctx.close();
});
