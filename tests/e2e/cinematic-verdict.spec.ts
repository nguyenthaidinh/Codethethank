import { test, expect, type Page } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { freshSlice, SLICE_KEY } from "../../src/cinematic/director";
import { freshVerdict } from "../../src/verdict/state";
const out = process.env.VERDICT_PROOF_OUT ?? "docs/chapter-01-proof";
mkdirSync(out, { recursive: true });
test.setTimeout(180000);
const state = async (p: Page) =>
  JSON.parse((await p.getByTestId("chapter-telemetry").textContent()) ?? "{}");
const phase = (p: Page, s: string) =>
  expect(p.locator(".chapter")).toHaveAttribute("data-verdict", s, {
    timeout: 25000,
  });
async function click(p: Page, name: string, touch = false) {
  const b = p.getByRole("button", { name, exact: true });
  if (touch) await b.tap();
  else await b.click();
}
async function study(p: Page, touch = false) {
  for (const name of [
    "Đọc bản thuyết trình",
    "Đọc sổ thiết kế",
    "Xem dữ liệu thử nghiệm",
  ]) {
    await click(p, name, touch);
    await p.waitForTimeout(1600);
  }
  await click(p, "Mở mô hình thử nghiệm", touch);
  await phase(p, "choose");
}
async function run(p: Page, name: string, touch = false) {
  await click(p, `Chọn hồ sơ ${name}`, touch);
  await p.waitForTimeout(400);
  await click(p, "↵ Chạy đánh giá", touch);
}
async function connect(p: Page, label: string, touch = false) {
  await click(p, label, touch);
  await p.waitForTimeout(1600);
  const b = p.getByRole("button", { name: /^Đối chiếu .* với kết quả$/ });
  if (touch) await b.tap();
  else await b.click();
  await phase(p, "comparison");
}
const checkpoint = {
  ...freshSlice,
  beat: "explore",
  chapter: {
    version: 1,
    beat: "NEXT_SCENE_READY",
    signal: true,
    evidence: ["clock", "notebook", "laptop"],
    verdict: freshVerdict,
  },
};
test("Chapter 00 → 01 → 02: same room/audio, samples, An, two comparisons, teacher", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.addInitScript(() => {
    const Original = AudioContext;
    const contexts: AudioContext[] = [];
    Object.assign(window, { verdictContexts: contexts });
    window.AudioContext = class extends Original {
      constructor() {
        super();
        contexts.push(this);
      }
    };
  });
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/");
  await click(page, "Bật âm thanh");
  await click(page, "Bắt đầu hành trình");
  await click(page, "Bỏ qua cinematic");
  await click(page, "Khám phá tín hiệu");
  await click(page, "Kiểm tra nguyên tắc HUMAN REVIEW");
  await click(page, "Truy dấu nguồn gốc năm 2026");
  await page
    .getByRole("button", { name: "Chạm để mở hồ sơ 2026", exact: false })
    .click();
  await expect(page.locator(".chapter")).toHaveAttribute(
    "data-chapter",
    "CLASSROOM_EXPLORATION",
    { timeout: 30000 },
  );
  for (const name of ["Nhìn đồng hồ", "Đọc tài liệu thuyết trình"]) {
    await click(page, name);
    await page.waitForTimeout(1500);
    await page
      .getByRole("button", { name: "Nhìn lại căn phòng", exact: false })
      .click();
    await page.waitForTimeout(1500);
  }
  await click(page, "Quan sát laptop");
  await page.waitForTimeout(1600);
  await page.evaluate(() =>
    Object.assign(window, {
      verdictCanvas: document.querySelector(".chapter-room"),
    }),
  );
  await page
    .getByRole("button", { name: "Chuẩn bị kiểm thử", exact: false })
    .click();
  await phase(page, "investigate");
  const began = Date.now();
  expect(
    await page.evaluate(
      () =>
        document.querySelector(".chapter-room") ===
        (window as unknown as { verdictCanvas: Element }).verdictCanvas,
    ),
  ).toBe(true);
  expect((await state(page)).world.teacherVisible).toBe(false);
  await study(page);
  await expect(
    page.getByRole("button", { name: "Chọn hồ sơ AN", exact: true }),
  ).toBeDisabled();
  await run(page, "STUDENT 07");
  await phase(page, "result");
  await page.screenshot({ path: `${out}/01-sample-result.png` });
  expect((await state(page)).verdict.tested).toEqual(["student07"]);
  await click(page, "Thử một hồ sơ khác trên laptop");
  await run(page, "AN");
  await phase(page, "reaction");
  await page.waitForTimeout(2700);
  const reaction = await state(page);
  expect(reaction.world.focus).toBe("an");
  expect(reaction.world.teacherVisible).toBe(false);
  expect(reaction.world.anHead).toBe(0.3);
  expect(reaction.audio.mix.ambience).toBe(0.18);
  await page.screenshot({ path: `${out}/02-an-reaction.png` });
  await phase(page, "connect");
  await connect(page, "Đọc bản thuyết trình");
  await page.screenshot({ path: `${out}/03-comparison.png` });
  await phase(page, "connect");
  expect((await state(page)).world.teacherVisible).toBe(false);
  await connect(page, "Đọc sổ thiết kế");
  await phase(page, "teacher_enter");
  await page.waitForTimeout(5000);
  await page.screenshot({ path: `${out}/04-teacher-arrival.png` });
  await phase(page, "chapter02");
  const mainPathSeconds = (Date.now() - began) / 1000;
  await expect(page.locator(".chapter")).toHaveAttribute(
    "data-stayed",
    "chair",
    { timeout: 15000 },
  );
  await page.waitForTimeout(4000);
  const final = await state(page);
  expect(final.verdict.linked).toHaveLength(2);
  expect(final.world.teacherVisible).toBe(true);
  expect(
    final.audio.events.filter((e: { cue: string }) => e.cue === "verdict"),
  ).toHaveLength(1);
  expect(
    final.audio.events.filter((e: { cue: string }) => e.cue === "chair"),
  ).toHaveLength(1);
  expect(
    await page.evaluate(() =>
      (
        window as unknown as { verdictContexts: AudioContext[] }
      ).verdictContexts.map((c) => c.state),
    ),
  ).toEqual(["closed", "running"]);
  expect(
    await page.evaluate(
      () =>
        document.querySelector(".chapter-room") ===
        (window as unknown as { verdictCanvas: Element }).verdictCanvas,
    ),
  ).toBe(true);
  expect(
    await page.evaluate(
      () => performance.getEntriesByType("navigation").length,
    ),
  ).toBe(1);
  writeFileSync(
    `${out}/desktop-telemetry.json`,
    JSON.stringify({ ...final, mainPathSeconds }, null, 2),
  );
  expect(errors).toEqual([]);
});
test("Chapter 01 mobile: silent reduced motion, hint, save/reload after comparison, second evidence", async ({
  browser,
}) => {
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    reducedMotion: "reduce",
  });
  const page = await ctx.newPage();
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page.evaluate(
    ({ key, save }) => localStorage.setItem(key, JSON.stringify(save)),
    { key: SLICE_KEY, save: checkpoint },
  );
  await page.reload();
  await click(page, "Tiếp tục", true);
  await phase(page, "investigate");
  await expect(page.locator(".verdict-hint")).toBeVisible({ timeout: 15000 });
  await study(page, true);
  await run(page, "STUDENT 07", true);
  await phase(page, "result");
  await click(page, "Thử một hồ sơ khác trên laptop", true);
  await run(page, "AN", true);
  await phase(page, "reaction");
  await page.waitForTimeout(2600);
  await page.screenshot({ path: `${out}/05-mobile-reaction.png` });
  await phase(page, "connect");
  await connect(page, "Xem dữ liệu thử nghiệm", true);
  await phase(page, "connect");
  await page.reload();
  await click(page, "Tiếp tục", true);
  await phase(page, "connect");
  expect((await state(page)).verdict.tested).toEqual(["student07", "an"]);
  expect((await state(page)).verdict.linked).toEqual(["data"]);
  expect((await state(page)).audio).toBeNull();
  await connect(page, "Đọc sổ thiết kế", true);
  await phase(page, "teacher_enter");
  await phase(page, "chapter02");
  await page.screenshot({ path: `${out}/06-mobile-chapter02.png` });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth === innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
  await ctx.close();
});
test("Chapter 01 GPU/storage/audio fallback remains playable to Chapter 02", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.addInitScript(
    ({ key, save }) => {
      localStorage.setItem(key, JSON.stringify(save));
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (
        this: HTMLCanvasElement,
        ...args: Parameters<typeof original>
      ) {
        return String(args[0]).includes("webgl")
          ? null
          : original.apply(this, args);
      } as typeof original;
      Object.defineProperty(window, "AudioContext", { value: undefined });
      Storage.prototype.setItem = () => {
        throw new Error("blocked");
      };
    },
    { key: SLICE_KEY, save: checkpoint },
  );
  await page.goto("/");
  await click(page, "Tiếp tục");
  await phase(page, "investigate");
  await expect(page.locator(".runtime-status")).toContainText("Đồ họa 2D");
  await click(page, "Bật âm thanh");
  await expect(page.locator(".runtime-status")).toContainText(
    "Âm thanh chưa khả dụng",
  );
  await study(page);
  await run(page, "STUDENT 07");
  await phase(page, "result");
  await click(page, "Thử một hồ sơ khác trên laptop");
  await run(page, "AN");
  await phase(page, "connect");
  await connect(page, "Đọc bản thuyết trình");
  await phase(page, "connect");
  await connect(page, "Đọc sổ thiết kế");
  await phase(page, "chapter02");
  await page.screenshot({ path: `${out}/07-fallback.png` });
  expect(errors).toEqual([]);
});
