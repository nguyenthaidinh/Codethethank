import { test, expect } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { freshSlice, SLICE_KEY } from "../../src/cinematic/director";
import { freshVerdict } from "../../src/verdict/state";
import { freshStay } from "../../src/stayed/state";
const out = process.env.CHAIR_PROOF_OUT ?? "docs/chair-cinematic-proof/runtime";
function inside(
  point: { x: number; y: number },
  polygon: { x: number; y: number }[],
) {
  let hit = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i],
      b = polygon[j];
    if (
      a.y > point.y !== b.y > point.y &&
      point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x
    )
      hit = !hit;
  }
  return hit;
}
mkdirSync(out, { recursive: true });
test.setTimeout(90000);
const save = {
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
      stayed: { ...freshStay, phase: "discussion", line: 1 },
    },
  },
};
for (const mode of ["desktop", "mobile", "canvas"] as const)
  test(`Chair: insert, visible sit and quiet two-shot ${mode}`, async ({
    browser,
  }) => {
    const mobile = mode !== "desktop",
      fallback = mode === "canvas";
    const context = await browser.newContext({
      viewport: mobile
        ? { width: 390, height: 844 }
        : { width: 1280, height: 720 },
      hasTouch: mobile,
      isMobile: mobile,
      reducedMotion: mobile ? "reduce" : "no-preference",
    });
    const page = await context.newPage(),
      errors: string[] = [],
      voices: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("request", (r) => {
      if (r.url().includes("/voice/vi/")) voices.push(r.url());
    });
    if (fallback)
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
    await page.goto("/");
    await page.evaluate(
      ({ key, save }) => localStorage.setItem(key, JSON.stringify(save)),
      { key: SLICE_KEY, save },
    );
    await page.reload();
    await page
      .getByRole("button", { name: "Bật âm thanh", exact: true })
      .click();
    // Warm the renderer during the real preceding line and collect transient
    // shots in-page: cross-process screenshot latency must not move the sample.
    await page.evaluate(() => {
      const samples: Record<string, unknown>[] = [];
      Object.assign(window, { chairSamples: samples });
      new MutationObserver(() => {
        const raw = document.querySelector(
          '[data-testid="chapter-telemetry"]',
        )?.textContent;
        if (!raw) return;
        const value = JSON.parse(raw);
        if (samples.length < 2000) samples.push(value);
      }).observe(document.body, {
        subtree: true,
        childList: true,
        characterData: true,
      });
    });
    await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
    const state = async () =>
      JSON.parse(
        (await page.getByTestId("chapter-telemetry").textContent()) ?? "{}",
      );
    type ShotSample = {
      time: number;
      stayed?: { phase: string };
      world?: { shot: string; camera: number[]; teacherBodyY: number };
    };
    const sample = async (kind: string) =>
      page.evaluate(
        ({ kind, fallback }) => {
          const samples = (window as unknown as { chairSamples: ShotSample[] })
            .chairSamples;
          return samples.find(
            (s) =>
              s.stayed?.phase === "chair" &&
              (kind === "insert"
                ? s.world?.shot === "chair.insert" &&
                  s.time >= 0.7 &&
                  s.time < 2.5
                : kind === "sit"
                  ? s.world?.shot ===
                      (fallback ? "conversation.master" : "chair.sit") &&
                    s.time >= 2.6 &&
                    s.time < 3.9
                  : s.world?.shot ===
                      (fallback ? "conversation.master" : "chair.sit") &&
                    s.time >= 4.6 &&
                    s.time < 6),
          );
        },
        { kind, fallback },
      );
    await expect.poll(() => sample("insert"), { timeout: 25000 }).toBeTruthy();
    const insert = (await sample("insert"))!;
    await page.screenshot({ path: `${out}/${mode}-chair-insert.png` });
    await expect.poll(() => sample("sit"), { timeout: 15000 }).toBeTruthy();
    const sitting = (await sample("sit"))!;
    expect(sitting.world!.shot).toBe(
      fallback ? "conversation.master" : "chair.sit",
    );
    await expect.poll(() => sample("seated"), { timeout: 15000 }).toBeTruthy();
    const seated = (await sample("seated"))!;
    await page.screenshot({ path: `${out}/${mode}-sitting.png` });
    if (!fallback) {
      expect(insert.world!.teacherBodyY).toBeGreaterThan(0.8);
      expect(seated.world!.teacherBodyY).toBeLessThan(0.61);
      if (mobile) expect(seated.world!.camera).toEqual(sitting.world!.camera);
    }
    await expect(page.locator(".chapter")).toHaveAttribute(
      "data-stayed",
      "question",
    );
    await expect
      .poll(async () => (await state()).world?.shot, { timeout: 12000 })
      .toBe("conversation.master");
    // Canvas uses the same master for the preceding paper line too. Synchronize
    // to the actual Story V4 line before advancing to An, not renderer speed.
    await expect
      .poll(async () => (await state()).stayed?.line, { timeout: 12000 })
      .toBe(1);
    await expect(page.locator(".subtitle-speaker")).toHaveText("Cô Vân");
    const subtitle = (await page.locator(".subtitle").boundingBox())!,
      master = await state();
    if (!fallback)
      for (const point of Object.values(master.world.portraits) as {
        x: number;
        y: number;
        visible: boolean;
      }[]) {
        expect(point.visible).toBe(true);
        expect(
          inside(point, master.world.laptopLid),
          "Laptop must not cover a face",
        ).toBe(false);
        expect(point.x).toBeGreaterThan(16);
        expect(point.x).toBeLessThan((mobile ? 390 : 1280) - 16);
        expect(point.y).toBeLessThan(subtitle.y - 30);
      }
    await page.screenshot({ path: `${out}/${mode}-seated-dialogue.png` });
    if (mode === "desktop") {
      await page.evaluate(() =>
        (document.activeElement as HTMLElement)?.blur(),
      );
      await page.keyboard.press("Enter");
    } else
      await page.getByRole("button", { name: "Tiếp lời", exact: false }).tap();
    await expect(page.locator(".subtitle-speaker")).toHaveText("An");
    const final = await state();
    expect(final.voice.started).toBe(0);
    expect(voices).toEqual([]);
    expect(errors).toEqual([]);
    expect(
      final.audio.events.filter((e: { cue: string }) => e.cue === "chair"),
    ).toHaveLength(1);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth === innerWidth,
      ),
    ).toBe(true);
    writeFileSync(
      `${out}/${mode}-choreography.json`,
      JSON.stringify(
        { insert, sitting, seated, master, final, errors, voices },
        null,
        2,
      ),
    );
    await context.close();
  });
