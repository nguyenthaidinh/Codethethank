import { test, expect } from "@playwright/test";
import { freshSlice, SLICE_KEY } from "../../src/cinematic/director";
import { freshVerdict } from "../../src/verdict/state";
import { freshStay } from "../../src/stayed/state";
import { mkdirSync } from "node:fs";
const out = "docs/story/proof/notebook-final";
mkdirSync(out, { recursive: true });
for (const mobile of [false, true])
  test(`V4 principle readable on right page ${mobile ? "touch Canvas" : "WebGL"}`, async ({
    browser,
  }) => {
    const context = await browser.newContext({
      viewport: mobile
        ? { width: 390, height: 844 }
        : { width: 1280, height: 720 },
      hasTouch: mobile,
      isMobile: mobile,
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    await page.addInitScript(
      ({ mobile }) => {
        if (mobile) {
          const original = HTMLCanvasElement.prototype.getContext;
          HTMLCanvasElement.prototype.getContext = function (
            ...args: Parameters<typeof original>
          ) {
            return String(args[0]).includes("webgl")
              ? null
              : original.apply(this, args);
          } as typeof original;
        }
        const original = CanvasRenderingContext2D.prototype.fillText;
        Object.assign(window, {
          principlePaints: [] as { text: string; x: number }[],
        });
        CanvasRenderingContext2D.prototype.fillText = function (
          ...args: Parameters<typeof original>
        ) {
          if (
            args[0].includes("Khi chưa hiểu đủ") ||
            args[0].includes("đừng vội xem") ||
            args[0].includes("là câu trả lời cuối cùng")
          )
            (
              window as unknown as {
                principlePaints: { text: string; x: number }[];
              }
            ).principlePaints.push({ text: args[0], x: args[1] });
          return original.apply(this, args);
        };
      },
      { mobile },
    );
    await page.goto("/");
    await page.evaluate(
      ({ key, save }) => localStorage.setItem(key, JSON.stringify(save)),
      {
        key: SLICE_KEY,
        save: {
          ...freshSlice,
          beat: "explore",
          chapter: {
            version: 1,
            signal: true,
            beat: "NEXT_SCENE_READY",
            evidence: ["laptop"],
            verdict: {
              ...freshVerdict,
              phase: "chapter02",
              found: ["presentation", "notes", "data"],
              tested: ["student07", "an"],
              selected: "an",
              linked: ["presentation", "notes"],
              stayed: {
                ...freshStay,
                phase: "written",
                read: ["outcome", "support"],
                written: true,
              },
            },
          },
        },
      },
    );
    await page.reload();
    await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
    await expect
      .poll(
        async () =>
          page.evaluate(() =>
            [
              "Khi chưa hiểu đủ một con người,",
              "đừng vội xem một dự đoán",
              "là câu trả lời cuối cùng.",
            ].every((text) =>
              (
                window as unknown as {
                  principlePaints: { text: string; x: number }[];
                }
              ).principlePaints.some((p) => p.text === text && p.x === 540),
            ),
          ),
        { timeout: 30000 },
      )
      .toBe(true);
    await page.screenshot({
      path: `${out}/${mobile ? "mobile-canvas" : "desktop"}.png`,
    });
    await context.close();
  });
