import { test, expect } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { freshSlice, SLICE_KEY } from "../../src/cinematic/director";
import { freshVerdict } from "../../src/verdict/state";
const out = process.env.STAY_PROOF_OUT ?? "docs/chapter-02-proof";
mkdirSync(out, { recursive: true });
test.setTimeout(240000);
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
      phase: "teacher_enter",
      found: ["presentation", "notes", "data"],
      tested: ["student07", "an"],
      selected: "an",
      linked: ["presentation", "notes"],
    },
  },
};
for (const mobile of [false, true])
  test(`Chapter 02 complete ${mobile ? "mobile silent reduced resume" : "desktop audio choreography"}`, async ({
    browser,
  }) => {
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
    await page.addInitScript(() => {
      const original = AudioContext.prototype.createMediaStreamDestination;
      AudioContext.prototype.createMediaStreamDestination = function () {
        const d = original.call(this);
        Object.assign(window, { storyAudio: d.stream });
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
      if (mobile) await b.tap();
      else await b.click();
    };
    if (!mobile) await click("Bật âm thanh");
    await click("Tiếp tục");
    const phase = async (s: string) =>
      expect(page.locator(".chapter")).toHaveAttribute("data-stayed", s, {
        timeout: 120000,
      });
    const state = async () =>
      JSON.parse(
        (await page.getByTestId("chapter-telemetry").textContent()) ?? "{}",
      );
    await expect(page.locator(".chapter-room")).toBeVisible();
    await page.evaluate(() =>
      Object.assign(window, {
        savedCanvas: document.querySelector(".chapter-room"),
      }),
    );
    await page.evaluate(() => {
      Object.assign(window, { dialogueSeen: [] as string[] });
      new MutationObserver(() => {
        const text = document.querySelector(".subtitle")?.textContent ?? "";
        const w = window as unknown as { dialogueSeen: string[] };
        if (text && !w.dialogueSeen.includes(text)) w.dialogueSeen.push(text);
      }).observe(document.body, {
        subtree: true,
        childList: true,
        characterData: true,
      });
    });
    const began = Date.now();
    await phase("chair");
    if (!mobile)
      await page.evaluate(() => {
        const w = window as unknown as {
          storyAudio: MediaStream;
          storyRecording: Promise<number[]>;
        };
        const stream = (
          document.querySelector(".chapter-room") as HTMLCanvasElement
        ).captureStream(24);
        w.storyAudio
          .getAudioTracks()
          .forEach((t) => stream.addTrack(t.clone()));
        w.storyRecording = new Promise((resolve) => {
          const chunks: Blob[] = [];
          const recorder = new MediaRecorder(stream, {
            mimeType: "video/webm;codecs=vp8,opus",
            videoBitsPerSecond: 1200000,
          });
          recorder.ondataavailable = (e) => chunks.push(e.data);
          recorder.onstop = async () =>
            resolve(
              Array.from(new Uint8Array(await new Blob(chunks).arrayBuffer())),
            );
          recorder.start(1000);
          setTimeout(() => recorder.stop(), 20000);
        });
      });
    await page.waitForTimeout(3200);
    await page.screenshot({
      path: `${out}/${mobile ? "mobile" : "desktop"}-chair.png`,
    });
    const chair = await state();
    if (!mobile)
      expect(
        chair.audio.events.filter((e: { cue: string }) => e.cue === "chair"),
      ).toHaveLength(1);
    await phase("notebook");
    const dialogue = await page.evaluate(() =>
      (window as unknown as { dialogueSeen: string[] }).dialogueSeen.join("\n"),
    );
    expect(dialogue).toContain("Vậy mà cô đang ngồi ở đây.");
    expect(dialogue).toContain("Cô không biết.");
    expect(dialogue).toContain("sinh viên 07");
    expect(dialogue).not.toMatch(/nhà sáng lập|founder/i);
    writeFileSync(
      `${out}/${mobile ? "mobile" : "desktop"}-dialogue.json`,
      JSON.stringify(dialogue),
    );
    await click("Xem ghi chú về kết quả");
    await page.waitForTimeout(900);
    if (mobile) {
      await page.reload();
      await click("Tiếp tục");
      await phase("notebook");
      expect((await state()).stayed.read).toEqual(["outcome"]);
      await page.evaluate(() =>
        Object.assign(window, {
          savedCanvas: document.querySelector(".chapter-room"),
        }),
      );
    }
    await click("Xem ghi chú về nhu cầu");
    await page.waitForTimeout(900);
    await page.screenshot({
      path: `${out}/${mobile ? "mobile" : "desktop"}-notebook.png`,
    });
    await phase("unwritten");
    const pen = page.getByRole("button", { name: "Khôi phục dòng ghi chú" });
    if (mobile) await pen.tap();
    else {
      const box = (await pen.boundingBox())!;
      await page.mouse.move(box.x + 10, box.y + 15);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width - 10, box.y + 15, { steps: 12 });
      await page.mouse.up();
    }
    await phase("written");
    await page.waitForTimeout(3200);
    await page.screenshot({
      path: `${out}/${mobile ? "mobile" : "desktop"}-written.png`,
    });
    await phase("next");
    await click("Quan sát trang phác thảo");
    const final = await state();
    expect(final.stayed.written).toBe(true);
    expect(final.stayed.nextInspected).toBe(true);
    if (mobile) expect(final.audio).toBeNull();
    else expect(final.audio.mix.rain).toBe(0.07);
    expect(
      await page.evaluate(
        () =>
          document.querySelector(".chapter-room") ===
          (window as unknown as { savedCanvas: Element }).savedCanvas,
      ),
    ).toBe(true);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth === innerWidth,
      ),
    ).toBe(true);
    writeFileSync(
      `${out}/${mobile ? "mobile" : "desktop"}-telemetry.json`,
      JSON.stringify(
        { ...final, elapsedSeconds: (Date.now() - began) / 1000, errors },
        null,
        2,
      ),
    );
    if (!mobile) {
      const recording = await page.evaluate(
        () =>
          (window as unknown as { storyRecording: Promise<number[]> })
            .storyRecording,
      );
      writeFileSync(`${out}/chapter02-live-audio.webm`, Buffer.from(recording));
    }
    expect(errors).toEqual([]);
    await click("Xem lại ký ức");
    await phase("discussion");
    await click("Bỏ qua đoạn đã xem");
    await ctx.close();
  });
