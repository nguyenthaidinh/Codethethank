import { test, expect } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { freshSlice, SLICE_KEY } from "../../src/cinematic/director";
import { freshStay } from "../../src/stayed/state";
import { solveLab2035 } from "./helpers/lab2035";
import { freshVerdict } from "../../src/verdict/state";
const out = process.env.RIPPLE_PROOF_OUT ?? "docs/chapter-03-proof";
mkdirSync(out, { recursive: true });
const checkpoint = {
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
      },
    },
  },
};
test.setTimeout(240000);
for (const { mobile, gpuFallback } of [
  { mobile: false, gpuFallback: false },
  { mobile: true, gpuFallback: false },
  { mobile: true, gpuFallback: true },
])
  test(`Ripple end-to-end ${mobile ? (gpuFallback ? "fallback touch muted reduced resume" : "mobile WebGL touch reduced resume") : "desktop audio match cut and recording"}`, async ({
    browser,
  }) => {
    // Browser video flushing is artifact overhead; gameplay phase deadlines stay unchanged.
    if (!mobile) test.setTimeout(300000);
    const ctx = await browser.newContext({
      viewport: mobile
        ? { width: 390, height: 844 }
        : { width: 1280, height: 720 },
      hasTouch: mobile,
      isMobile: mobile,
      reducedMotion: mobile ? "reduce" : "no-preference",
    });
    const page = await ctx.newPage();
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    if (gpuFallback)
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
    else
      await page.addInitScript(() => {
        const original = AudioContext.prototype.createMediaStreamDestination;
        AudioContext.prototype.createMediaStreamDestination = function () {
          const d = original.call(this);
          Object.assign(window, { rippleAudio: d.stream });
          return d;
        };
      });
    await page.goto("/");
    await page.evaluate(
      ({ key, save }) => localStorage.setItem(key, JSON.stringify(save)),
      { key: SLICE_KEY, save: checkpoint },
    );
    await page.reload();
    const click = async (name: string) => {
      const b = page.getByRole("button", { name, exact: true });
      if (mobile) await b.tap({ timeout: 15000 });
      else await b.click({ timeout: 15000 });
    };
    const phase = async (s: string) =>
      expect(page.locator(".chapter")).toHaveAttribute("data-ripple", s, {
        timeout: 35000,
      });
    const state = async () =>
      JSON.parse(
        (await page.getByTestId("chapter-telemetry").textContent()) ?? "{}",
      );
    if (!mobile) await click("Bật âm thanh");
    await click("Tiếp tục");
    await expect(page.locator(".chapter-room")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Nối hai câu hỏi", exact: true }),
    ).toHaveCount(0);
    await click("Quan sát trang phác thảo");
    await click("Nối hai câu hỏi");
    await phase("sketch");
    await page.evaluate(() =>
      Object.assign(window, {
        rippleCanvas: document.querySelector(".chapter-room"),
      }),
    );
    await click("Ai dễ tiến bộ nhất?");
    await click("Ai còn cần cơ hội?");
    await click("Khôi phục HUMAN REVIEW");
    await phase("change");
    await page.waitForTimeout(1500);
    await page.screenshot({
      path: `${out}/${gpuFallback ? "fallback" : mobile ? "mobile" : "desktop"}-01-change.png`,
    });
    for (const name of [
      "Mở nhật ký thử nghiệm",
      "Bắt đầu thử nghiệm",
      "Mở sổ kiểm thử trước ra mắt",
    ]) {
      await phase("years");
      await click(name);
      if (name === "Bắt đầu thử nghiệm") await solveLab2035(page, mobile);
      await phase("milestone");
      await page.waitForTimeout(1800);
      await page.screenshot({
        path: `${out}/${gpuFallback ? "fallback" : mobile ? "mobile" : "desktop"}-${[2029, 2035, 2045][(await state()).ripple.milestones]}-milestone.png`,
      });
    }
    await phase("record");
    expect(await page.locator(".subtitle").textContent()).not.toMatch(
      /AN — FOUNDER|An là|chính là An/,
    );
    expect((await state()).ripple.phase).toBe("record");
    await page.screenshot({
      path: `${out}/${gpuFallback ? "fallback" : mobile ? "mobile" : "desktop"}-02-world.png`,
    });
    expect((await state()).ripple.milestones).toBe(3);
    await click("Đối chiếu hồ sơ nhà sáng lập");
    await phase("align");
    expect(await page.locator(".subtitle").textContent()).not.toMatch(
      /AN — FOUNDER|An là|chính là An/,
    );
    await phase("reveal");
    await expect(page.locator(".subtitle")).toContainText(
      "AN — FOUNDER OF AION",
    );
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: `${out}/${gpuFallback ? "fallback" : mobile ? "mobile" : "desktop"}-03-reveal.png`,
    });
    if (!mobile)
      await page.evaluate(() => {
        const w = window as unknown as {
          rippleAudio: MediaStream;
          rippleRecorder: MediaRecorder;
          rippleChunks: Blob[];
        };
        const canvas = document.querySelector(
          ".chapter-room",
        ) as HTMLCanvasElement;
        const stream = canvas.captureStream(12);
        w.rippleAudio
          .getAudioTracks()
          .forEach((t) => stream.addTrack(t.clone()));
        w.rippleChunks = [];
        w.rippleRecorder = new MediaRecorder(stream, {
          mimeType: "video/webm;codecs=vp8,opus",
          videoBitsPerSecond: 1000000,
        });
        w.rippleRecorder.ondataavailable = (e) => w.rippleChunks.push(e.data);
        w.rippleRecorder.start(1000);
      });
    await phase("echo");
    await page.waitForTimeout(3200);
    await page.screenshot({
      path: `${out}/${gpuFallback ? "fallback" : mobile ? "mobile" : "desktop"}-04-2026-chair.png`,
    });
    await phase("chair");
    await page.waitForTimeout(3200);
    await page.screenshot({
      path: `${out}/${gpuFallback ? "fallback" : mobile ? "mobile" : "desktop"}-05-2046-chair.png`,
    });
    const chair = await state();
    expect(chair.ripple.played).toContain("chair.chair");
    if (mobile) {
      await page.reload();
      await click("Tiếp tục");
      await expect(page.locator(".chapter-room")).toBeVisible();
      await page.evaluate(() =>
        Object.assign(window, {
          rippleCanvas: document.querySelector(".chapter-room"),
        }),
      );
    }
    await phase("reflection");
    await expect(page.locator(".subtitle")).toContainText(
      "Vậy thì chúng ta xem điều gì mình vẫn chưa hiểu.",
    );
    await page.screenshot({
      path: `${out}/${gpuFallback ? "fallback" : mobile ? "mobile" : "desktop"}-reflection.png`,
    });
    await phase("reconstruct");
    if (!mobile) {
      const bytes = await page.evaluate(async () => {
        const w = window as unknown as {
          rippleRecorder: MediaRecorder;
          rippleChunks: Blob[];
        };
        await new Promise<void>((resolve) => {
          w.rippleRecorder.onstop = () => resolve();
          w.rippleRecorder.stop();
        });
        return await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result).split(",")[1]);
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(new Blob(w.rippleChunks));
        });
      });
      writeFileSync(
        `${out}/desktop-live-audio.webm`,
        Buffer.from(bytes, "base64"),
      );
    }
    await click("Chạm hồ sơ đánh giá 2026");
    await click("Chạm chiếc ghế được giữ lại");
    if (mobile) {
      await page.reload();
      await click("Tiếp tục");
      await expect(page.locator(".chapter-room")).toBeVisible();
      await expect
        .poll(async () => (await state()).world?.drawCalls ?? 0)
        .toBeGreaterThan(0);
      await page.evaluate(() =>
        Object.assign(window, {
          rippleCanvas: document.querySelector(".chapter-room"),
        }),
      );
      expect((await state()).ripple.memories).toHaveLength(2);
    }
    await click("Chạm cuốn sổ thiết kế");
    const unlock = page.getByRole("button", {
      name: "Khớp ba ký ức",
      exact: true,
    });
    await unlock.focus();
    await page.keyboard.press("Enter");
    await phase("principle");
    await expect(page.locator(".subtitle")).toContainText(
      "Tôi đã tìm thấy nguồn gốc",
    );
    await expect(page.locator(".subtitle")).toContainText(
      "Nó không bắt đầu bằng một dòng mã.",
      { timeout: 8000 },
    );
    await expect(page.locator(".subtitle")).toContainText(
      "Nó bắt đầu khi một người quyết định ở lại.",
      { timeout: 8000 },
    );
    await phase("finale");
    await page.screenshot({
      path: `${out}/${gpuFallback ? "fallback" : mobile ? "mobile" : "desktop"}-06-finale.png`,
    });
    const final = await state();
    expect(final.ripple.memories).toHaveLength(3);
    expect(
      final.ripple.played.filter((x: string) => x === "chair.chair"),
    ).toHaveLength(1);
    if (!mobile) {
      expect(
        final.audio.events.filter((e: { cue: string }) => e.cue === "chair"),
      ).toHaveLength(2);
      expect(final.world.motif).toBe("chair.the-one-who-stayed");
    } else expect(final.audio).toBeNull();
    expect(errors).toEqual([]);
    expect(
      await page.evaluate(
        () =>
          document.querySelector(".chapter-room") ===
          (window as unknown as { rippleCanvas: Element }).rippleCanvas,
      ),
    ).toBe(true);
    expect(
      await page.evaluate(() => ({
        width: document.documentElement.scrollWidth,
        viewport: innerWidth,
      })),
    ).toEqual({ width: mobile ? 390 : 1280, viewport: mobile ? 390 : 1280 });
    writeFileSync(
      `${out}/${gpuFallback ? "fallback" : mobile ? "mobile" : "desktop"}-telemetry.json`,
      JSON.stringify({ ...final, errors }, null, 2),
    );
    await page.reload();
    await click("Tiếp tục");
    await phase("finale");
    expect((await state()).ripple.played).toContain("chair.chair");
    await ctx.close();
  });

test("Ripple resumes claimed chair audio without replay and finishes by keyboard", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const save = {
    ...checkpoint,
    chapter: {
      ...checkpoint.chapter,
      verdict: {
        ...checkpoint.chapter.verdict,
        stayed: { ...checkpoint.chapter.verdict.stayed, nextInspected: true },
        ripple: {
          version: 1,
          phase: "chair",
          questions: ["prediction", "opportunity"],
          milestones: 3,
          memories: [],
          selected: null,
          elapsed: 3,
          played: ["reveal.music", "echo.chair", "chair.chair"],
        },
      },
    },
  };
  await page.goto("/");
  await page.evaluate(
    ({ key, save }) => localStorage.setItem(key, JSON.stringify(save)),
    { key: SLICE_KEY, save },
  );
  await page.reload();
  await page.getByRole("button", { name: "Bật âm thanh", exact: true }).click();
  await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
  await expect(page.locator(".chapter")).toHaveAttribute(
    "data-ripple",
    "reconstruct",
    { timeout: 15000 },
  );
  for (const name of [
    "Chạm hồ sơ đánh giá 2026",
    "Chạm chiếc ghế được giữ lại",
    "Chạm cuốn sổ thiết kế",
    "Khớp ba ký ức",
  ]) {
    await page.getByRole("button", { name, exact: true }).focus();
    await page.keyboard.press("Enter");
  }
  await expect(page.locator(".chapter")).toHaveAttribute(
    "data-ripple",
    "finale",
    { timeout: 20000 },
  );
  await page.waitForTimeout(1000);
  console.log(
    "LAYOUT",
    await page.evaluate(() => ({
      vw: innerWidth,
      scroll: document.documentElement.scrollWidth,
      offenders: [...document.querySelectorAll("*")]
        .filter((e) => e.getBoundingClientRect().right > innerWidth + 1)
        .map((e) => ({
          tag: e.tagName,
          cls: e.className,
          right: e.getBoundingClientRect().right,
        }))
        .slice(0, 8),
    })),
  );
  const s = JSON.parse(
    (await page.getByTestId("chapter-telemetry").textContent()) ?? "{}",
  );
  expect(
    s.audio.events.filter((e: { cue: string }) => e.cue === "chair"),
  ).toHaveLength(0);
  expect(s.ripple.phase).toBe("finale");
});
