import { test, expect, type Page } from "@playwright/test";
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { freshSlice, SLICE_KEY } from "../../src/cinematic/director";
import { freshVerdict } from "../../src/verdict/state";
import { OPENING_TIMING } from "../../src/future/direction";
import { freshStay } from "../../src/stayed/state";
const catalog = JSON.parse(
  readFileSync("src/speech/catalog.json", "utf8"),
) as Record<string, { file: string }>;
const out =
  process.env.VOICE_PROOF_OUT ?? "docs/opening-readability-proof/runtime";
mkdirSync(out, { recursive: true });
test.setTimeout(150000);
const state = async (page: Page) =>
  JSON.parse(
    (await page.getByTestId("chapter-telemetry").textContent()) ?? "{}",
  );
const click = (page: Page, name: string) =>
  page.getByRole("button", { name, exact: true }).click();
const classroom = {
  ...freshSlice,
  beat: "explore",
  chapter: {
    version: 1,
    beat: "CLASSROOM_EXPLORATION",
    signal: true,
    evidence: [],
  },
};
const question = {
  ...classroom,
  chapter: {
    ...classroom.chapter,
    beat: "NEXT_SCENE_READY",
    evidence: ["clock", "notebook", "laptop"],
    verdict: {
      ...freshVerdict,
      phase: "chapter02",
      found: ["presentation", "notes", "data"],
      tested: ["student07", "an"],
      selected: "an",
      linked: ["presentation", "notes"],
      stayed: { ...freshStay, phase: "question" },
    },
  },
};
async function resume(page: Page, save: unknown) {
  await page.goto("/");
  await page.evaluate(
    ({ key, save }) => localStorage.setItem(key, JSON.stringify(save)),
    { key: SLICE_KEY, save },
  );
  await page.reload();
  await click(page, "Bật âm thanh");
  await click(page, "Tiếp tục");
}

test("Opening narrator only: gesture, pause, separate subtitles, then no AION or past voice", async ({
  page,
}) => {
  const requests: string[] = [],
    errors: string[] = [];
  page.on("request", (r) => {
    if (r.url().includes("/voice/")) requests.push(r.url());
  });
  page.on("pageerror", (e) => errors.push(e.message));
  await page.addInitScript(() => {
    const original = AudioContext.prototype.createMediaStreamDestination;
    AudioContext.prototype.createMediaStreamDestination = function () {
      Object.assign(window, { testAudioContext: this });
      return original.call(this);
    };
  });
  await page.goto("/");
  expect(requests).toHaveLength(0);
  await click(page, "Bật âm thanh");
  await click(page, "Bắt đầu hành trình");
  await expect
    .poll(async () => (await state(page)).voice?.status, { timeout: 45000 })
    .toBe("speaking");
  await page.keyboard.press("Escape");
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as unknown as { testAudioContext: AudioContext })
            .testAudioContext.state,
      ),
    )
    .toBe("suspended");
  const paused = await state(page);
  await page.waitForTimeout(500);
  expect((await state(page)).voice.started).toBe(paused.voice.started);
  await page.getByLabel("Giọng dẫn và AION", { exact: true }).uncheck();
  await page.keyboard.press("Escape");
  await expect.poll(async () => (await state(page)).voice?.status).toBe("off");
  await expect(page.locator(".subtitle")).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByLabel("Giọng dẫn và AION", { exact: true }).check();
  await page.getByLabel("Phụ đề", { exact: true }).uncheck();
  await page.keyboard.press("Escape");
  await expect
    .poll(async () => (await state(page)).voice?.status)
    .toBe("speaking");
  await expect(page.locator(".subtitle")).toHaveCount(0);
  await click(page, "Tắt âm thanh");
  await expect.poll(async () => (await state(page)).voice?.status).toBe("off");
  await click(page, "Bật âm thanh");
  await page.keyboard.press("Escape");
  await page.getByLabel("Phụ đề", { exact: true }).check();
  await page.keyboard.press("Escape");
  await expect
    .poll(async () => (await state(page)).time, { timeout: 65000 })
    .toBeGreaterThan(OPENING_TIMING.silent);
  await expect.poll(async () => (await state(page)).voice?.status).toBe("off");
  const count = requests.length;
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
  await click(page, "Nhìn đồng hồ");
  await page.waitForTimeout(500);
  expect((await state(page)).voice.status).toBe("off");
  expect(requests).toHaveLength(count);
  const allowed = new Set(
    Object.values(catalog).map(
      (entry) => new URL(entry.file, "http://127.0.0.1:4173/").href,
    ),
  );
  expect(requests.every((url) => allowed.has(url))).toBe(true);
  expect(errors).toEqual([]);
  writeFileSync(
    `${out}/opening-voice-policy.json`,
    JSON.stringify({ requests, state: await state(page), errors }, null, 2),
  );
});

for (const mobile of [false, true])
  test(`School and silent past: ${mobile ? "touch Canvas reduced" : "desktop WebGL"}`, async ({
    browser,
  }) => {
    const context = await browser.newContext({
      viewport: mobile
        ? { width: 390, height: 844 }
        : { width: 1280, height: 720 },
      isMobile: mobile,
      hasTouch: mobile,
      reducedMotion: mobile ? "reduce" : "no-preference",
    });
    const page = await context.newPage(),
      requests: string[] = [],
      errors: string[] = [];
    page.on("request", (r) => {
      if (r.url().includes("/voice/")) requests.push(r.url());
    });
    page.on("pageerror", (e) => errors.push(e.message));
    if (mobile)
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
    await resume(page, classroom);
    await expect
      .poll(async () => (await state(page)).world?.school?.logoLoaded, {
        timeout: 40000,
      })
      .toBe(true);
    await page.waitForTimeout(1700);
    await page.screenshot({
      path: `${out}/school-${mobile ? "mobile-fallback" : "desktop"}.png`,
    });
    const target = page.getByRole("button", {
      name: "Nhìn đồng hồ",
      exact: true,
    });
    if (mobile) await target.tap();
    else await target.click();
    await expect(page.locator(".subtitle")).toContainText("17:05");
    await page.waitForTimeout(400);
    expect((await state(page)).voice.status).toBe("off");
    expect(requests).toEqual([]);
    expect(errors).toEqual([]);
    writeFileSync(
      `${out}/school-${mobile ? "mobile-fallback" : "desktop"}.json`,
      JSON.stringify(await state(page), null, 2),
    );
    await context.close();
  });

test("Missing opening narration stays readable and can be skipped", async ({
  page,
}) => {
  await page.route("**/voice/**/*.mp3", (route) => route.abort());
  await page.goto("/");
  await click(page, "Bật âm thanh");
  await click(page, "Bắt đầu hành trình");
  await expect
    .poll(async () => (await state(page)).voice?.status, { timeout: 40000 })
    .toBe("unavailable");
  await expect(page.locator(".runtime-status")).toContainText("lời dẫn");
  await expect(page.locator(".subtitle")).toBeVisible();
  await click(page, "Bỏ qua cinematic");
  await expect(page.locator(".chapter")).toHaveAttribute(
    "data-chapter",
    "PLAYER_CONTROL_ENABLED",
  );
  await expect.poll(async () => (await state(page)).voice?.status).toBe("off");
});

for (const mobile of [false, true])
  test(`Conversation camera and reading space: ${mobile ? "mobile WebGL touch" : "desktop WebGL keyboard"}`, async ({
    browser,
  }) => {
    const context = await browser.newContext({
      viewport: mobile
        ? { width: 390, height: 844 }
        : { width: 1280, height: 720 },
      isMobile: mobile,
      hasTouch: mobile,
      reducedMotion: mobile ? "reduce" : "no-preference",
    });
    const page = await context.newPage(),
      requests: string[] = [],
      errors: string[] = [];
    page.on("request", (r) => {
      if (r.url().includes("/voice/")) requests.push(r.url());
    });
    page.on("pageerror", (e) => errors.push(e.message));
    await resume(page, question);
    await expect
      .poll(async () => (await state(page)).world?.focus)
      .toBe("faces");
    // The dialogue is now a cut, so waiting for the old 1.4s dolly can cross
    // the automatic three-second line boundary on a cold GPU.
    await expect
      .poll(async () => (await state(page)).world?.shot)
      .toBe("conversation.master");
    const s = await state(page),
      subtitle = (await page.locator(".subtitle").boundingBox())!;
    for (const point of Object.values(s.world.portraits) as {
      x: number;
      y: number;
      visible: boolean;
    }[]) {
      expect(point.visible).toBe(true);
      expect(point.x).toBeGreaterThan(20);
      expect(point.x).toBeLessThan((mobile ? 390 : 1280) - 20);
      expect(point.y).toBeLessThan(subtitle.y - 30);
    }
    expect(s.world.fov).toBeLessThan(50);
    await expect(page.locator(".subtitle-speaker")).toHaveText("Cô Vân");
    await page.screenshot({
      path: `${out}/${mobile ? "mobile" : "desktop"}-two-shot.png`,
    });
    const next = page.getByRole("button", { name: "Tiếp lời", exact: false });
    if (mobile) await next.tap();
    else {
      await next.focus();
      await page.keyboard.press("Enter");
    }
    await expect(page.locator(".subtitle-speaker")).toHaveText("An");
    await expect.poll(async () => (await state(page)).world?.focus).toBe("an");
    await page.screenshot({
      path: `${out}/${mobile ? "mobile" : "desktop"}-an-close.png`,
    });
    const final = await state(page);
    expect(final.voice.status).toBe("off");
    expect(final.voice.started).toBe(0);
    expect(requests).toEqual([]);
    expect(errors).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth === innerWidth,
      ),
    ).toBe(true);
    writeFileSync(
      `${out}/${mobile ? "mobile" : "desktop"}-framing.json`,
      JSON.stringify({ twoShot: s, final, requests, errors }, null, 2),
    );
    await context.close();
  });
