import { test, expect, type Page } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { freshSlice, SLICE_KEY } from "../../src/cinematic/director";
import { TERMINAL_ALERT } from "../../src/future/terminalStyle";
const out = process.env.LAPTOP_PROOF_OUT ?? "docs/laptop-flow-proof/runtime";
mkdirSync(out, { recursive: true });
test.setTimeout(180000);
type Paint = { text: string; color: string; font: string };
const state = async (page: Page) =>
  JSON.parse(
    (await page.getByTestId("chapter-telemetry").textContent()) ?? "{}",
  );
async function captureTerminal(page: Page) {
  await page.addInitScript(() => {
    const original = CanvasRenderingContext2D.prototype.fillText;
    Object.assign(window, { statusPaints: [] });
    CanvasRenderingContext2D.prototype.fillText = function (
      ...args: Parameters<typeof original>
    ) {
      if (
        /NOT RECOMMENDED|ORIGIN UNKNOWN|UNRESOLVED|INCOMPLETE|CONTRADICTS FORECAST/.test(
          args[0],
        )
      )
        (window as unknown as { statusPaints: Paint[] }).statusPaints.push({
          text: args[0],
          color: String(this.fillStyle),
          font: this.font,
        });
      return original.apply(this, args);
    };
  });
}
const paints = (page: Page) =>
  page.evaluate(
    () => (window as unknown as { statusPaints: Paint[] }).statusPaints,
  );
for (const mode of ["desktop", "touch-canvas", "keyboard"] as const)
  test(`Laptop first is playable through An evaluation: ${mode}`, async ({
    browser,
  }) => {
    const touch = mode === "touch-canvas",
      keyboard = mode === "keyboard";
    const context = await browser.newContext({
      viewport: touch
        ? { width: 390, height: 844 }
        : { width: 1280, height: 720 },
      hasTouch: touch,
      isMobile: touch,
      reducedMotion: touch ? "reduce" : "no-preference",
    });
    const page = await context.newPage(),
      errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await captureTerminal(page);
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
    const activate = async (name: string) => {
      const button = page.getByRole("button", { name, exact: true });
      if (touch) await button.tap();
      else if (keyboard) {
        await button.focus();
        await page.keyboard.press("Enter");
      } else await button.click();
    };
    await page.goto("/");
    if (mode === "desktop") {
      await activate("Bắt đầu hành trình");
      await activate("Bỏ qua cinematic");
      await activate("Khám phá tín hiệu");
      await expect
        .poll(
          async () =>
            (await paints(page)).filter((p) =>
              /ORIGIN UNKNOWN|NOT RECOMMENDED/.test(p.text),
            ).length,
          { timeout: 30000 },
        )
        .toBeGreaterThan(0);
      await page.screenshot({ path: `${out}/future-red-terminal.png` });
      await activate("Kiểm tra nguyên tắc HUMAN REVIEW");
      await activate("Truy dấu nguồn gốc năm 2026");
      await page
        .getByRole("button", { name: "Chạm để mở hồ sơ 2026", exact: false })
        .click();
      await expect(page.locator(".chapter")).toHaveAttribute(
        "data-chapter",
        "CLASSROOM_EXPLORATION",
        { timeout: 30000 },
      );
    } else {
      await page.evaluate(
        ({ key, save }) => localStorage.setItem(key, JSON.stringify(save)),
        {
          key: SLICE_KEY,
          save: {
            ...freshSlice,
            beat: "explore",
            chapter: {
              version: 1,
              beat: "CLASSROOM_EXPLORATION",
              signal: true,
              evidence: [],
            },
          },
        },
      );
      await page.reload();
      await activate("Tiếp tục");
    }
    expect((await state(page)).evidence).toEqual([]);
    await activate("Quan sát laptop");
    await expect(
      page.getByRole("button", { name: "Chuẩn bị kiểm thử", exact: false }),
    ).toBeVisible();
    expect((await state(page)).evidence).toEqual(["laptop"]);
    await page.screenshot({ path: `${out}/${mode}-laptop-first.png` });
    const start = page.getByRole("button", {
      name: "Chuẩn bị kiểm thử",
      exact: false,
    });
    if (touch) await start.tap();
    else if (keyboard) {
      await start.focus();
      await page.keyboard.press("Enter");
    } else await start.click();
    await expect(page.locator(".chapter")).toHaveAttribute(
      "data-verdict",
      "investigate",
    );
    await expect(
      page.getByRole("status").filter({ hasText: "0/3 dấu vết" }),
    ).toBeVisible();
    // Reload the formerly impossible checkpoint: only laptop observed, no fake clues.
    await page.reload();
    await activate("Tiếp tục");
    await expect(page.locator(".chapter")).toHaveAttribute(
      "data-verdict",
      "investigate",
    );
    expect((await state(page)).evidence).toEqual(["laptop"]);
    expect((await state(page)).verdict.found).toEqual([]);
    // Read in different orders; the final clue deliberately is NOT the laptop/data.
    const order = touch
      ? ["Đọc sổ thiết kế", "Xem dữ liệu thử nghiệm", "Đọc bản thuyết trình"]
      : ["Xem dữ liệu thử nghiệm", "Đọc bản thuyết trình", "Đọc sổ thiết kế"];
    for (const name of order) {
      await activate(name);
      await page.waitForTimeout(500);
    }
    await expect(
      page.getByRole("button", { name: "Mở mô hình thử nghiệm", exact: true }),
    ).toBeVisible();
    await activate("Mở mô hình thử nghiệm");
    await expect(
      page.getByRole("button", { name: "Chọn hồ sơ AN", exact: true }),
    ).toBeDisabled();
    await activate("Chọn hồ sơ STUDENT 07");
    await activate("↵ Chạy đánh giá");
    await expect(page.locator(".chapter")).toHaveAttribute(
      "data-verdict",
      "result",
    );
    await expect
      .poll(async () =>
        (await paints(page)).some(
          (p) => p.text === "NOT RECOMMENDED" && p.color === TERMINAL_ALERT,
        ),
      )
      .toBe(true);
    await page.screenshot({ path: `${out}/${mode}-red-result.png` });
    await activate("Thử một hồ sơ khác trên laptop");
    await activate("Chọn hồ sơ AN");
    await activate("↵ Chạy đánh giá");
    await expect(page.locator(".chapter")).toHaveAttribute(
      "data-verdict",
      "connect",
      { timeout: 20000 },
    );
    const final = await state(page);
    expect(final.verdict.tested).toEqual(["student07", "an"]);
    expect(final.verdict.found).toHaveLength(3);
    expect(final.evidence).toEqual(["laptop"]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth === innerWidth,
      ),
    ).toBe(true);
    expect(errors).toEqual([]);
    writeFileSync(
      `${out}/${mode}-flow.json`,
      JSON.stringify({ final, paints: await paints(page), errors }, null, 2),
    );
    await context.close();
  });

test("Future Canvas uses red monospace warnings too", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await captureTerminal(page);
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
  await page
    .getByRole("button", { name: "Bắt đầu hành trình", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Bỏ qua cinematic", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Khám phá tín hiệu", exact: true })
    .click();
  await expect
    .poll(async () =>
      (await paints(page)).some(
        (p) =>
          p.text.includes("DESIGN ORIGIN: INCOMPLETE") &&
          p.color === TERMINAL_ALERT &&
          /monospace/.test(p.font),
      ),
    )
    .toBe(true);
  await page.screenshot({ path: `${out}/future-red-canvas-mobile.png` });
  writeFileSync(
    `${out}/future-red-canvas.json`,
    JSON.stringify(await paints(page), null, 2),
  );
});
