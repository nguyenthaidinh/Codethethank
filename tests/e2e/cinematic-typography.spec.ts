import { test, expect, type Page } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { freshSlice, SLICE_KEY } from "../../src/cinematic/director";
import { freshVerdict } from "../../src/verdict/state";
import { freshStay } from "../../src/stayed/state";

const out = "docs/typography-proof";
mkdirSync(out, { recursive: true });
const sample = "Đối chiếu · Đề nghị · Về · kế tiếp · hỗ trợ · dự kiến · cô Vân";
async function usedFonts(page: Page, selector: string) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("DOM.enable");
  await cdp.send("CSS.enable");
  const doc = await cdp.send("DOM.getDocument"),
    node = await cdp.send("DOM.querySelector", {
      nodeId: doc.root.nodeId,
      selector,
    });
  const result = await cdp.send("CSS.getPlatformFontsForNode", {
    nodeId: node.nodeId,
  });
  await cdp.detach();
  return result.fonts;
}
test("Vietnamese tones use one complete font in regular bold italic and Canvas", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Bắt đầu hành trình", exact: true }),
  ).toBeVisible();
  await page.evaluate((text) => {
    const panel = document.createElement("section");
    panel.id = "font-proof";
    panel.style.cssText =
      "position:fixed;inset:0;z-index:9999;padding:24px;background:#172d40;color:#f0dfb9;overflow:auto";
    for (const [id, style] of [
      ["normal", "normal"],
      ["bold", "bold"],
      ["italic", "italic"],
    ]) {
      const p = document.createElement("p");
      p.id = "vi-" + id;
      p.style.cssText = `font:32px LessonSerif,serif;line-height:1.8;margin:8px 0;${style === "bold" ? "font-weight:700;" : style === "italic" ? "font-style:italic;" : ""}`;
      p.textContent = text;
      panel.append(p);
    }
    const p = document.createElement("p");
    p.textContent =
      "Cả dấu huyền, sắc, hỏi, ngã, nặng và chữ nhập dạng tổ hợp đều phải liền với nguyên âm.";
    p.style.font = "18px Arial";
    panel.append(p);
    const canvas = document.createElement("canvas");
    canvas.id = "canvas-font-proof";
    canvas.width = 1100;
    canvas.height = 110;
    const ctx = canvas.getContext("2d")!;
    ctx.font = "32px LessonSerif";
    ctx.fillStyle = "#f0dfb9";
    ctx.fillText(text.normalize("NFD"), 0, 55);
    canvas.style.maxWidth = "100%";
    panel.append(canvas);
    document.body.append(panel);
  }, sample);
  const fonts: Record<string, unknown> = {};
  for (const style of ["normal", "bold", "italic"]) {
    const list = await usedFonts(page, "#vi-" + style);
    fonts[style] = list;
    expect(list).toHaveLength(1);
    expect(list[0].isCustomFont).toBe(true);
    expect(list[0].familyName).toContain("Noto Serif");
  }
  const widths = await page.evaluate((text) => {
    const ctx = document.createElement("canvas").getContext("2d")!;
    ctx.font = "32px LessonSerif";
    return [
      ctx.measureText(text).width,
      ctx.measureText(text.normalize("NFD")).width,
    ];
  }, sample);
  expect(Math.abs(widths[0] - widths[1])).toBeLessThan(0.01);
  await page.setViewportSize({ width: 1200, height: 430 });
  await page.screenshot({ path: out + "/after-fonts.png" });
  writeFileSync(
    out + "/after-fonts.json",
    JSON.stringify({ fonts, widths }, null, 2),
  );
});

for (const mobile of [false, true])
  test(`Vietnamese real notebook and subtitles ${mobile ? "mobile touch" : "desktop"}`, async ({
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
    await context.addInitScript(() => {
      const original = CanvasRenderingContext2D.prototype.fillText;
      Object.assign(window, { fontPaints: [] });
      CanvasRenderingContext2D.prototype.fillText = function (
        ...args: Parameters<typeof original>
      ) {
        if (this.font.includes("LessonSerif"))
          (window as unknown as { fontPaints: unknown[] }).fontPaints.push({
            font: this.font,
            ready: document.fonts.check(this.font, args[0]),
          });
        return original.apply(this, args);
      };
    });
    const page = await context.newPage(),
      errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/");
    await page.evaluate(
      ({ key, save }) => localStorage.setItem(key, JSON.stringify(save)),
      {
        key: SLICE_KEY,
        save: {
          ...freshSlice,
          reduced: true,
          muted: true,
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
              stayed: { ...freshStay, phase: "notebook" },
            },
          },
        },
      },
    );
    await page.reload();
    const activate = async (name: string) => {
      const button = page.getByRole("button", { name, exact: true });
      if (mobile) await button.tap();
      else await button.click();
    };
    await activate("Tiếp tục");
    await activate("Xem ghi chú về kết quả");
    await expect(page.locator(".subtitle p")).toContainText("dự kiến");
    await page.waitForTimeout(1600);
    const fonts = await usedFonts(page, ".subtitle p");
    expect(fonts).toHaveLength(1);
    expect(fonts[0].familyName).toContain("Noto Serif");
    expect(fonts[0].isCustomFont).toBe(true);
    const paints = await page.evaluate(
      () =>
        (window as unknown as { fontPaints: { ready: boolean }[] }).fontPaints,
    );
    expect(paints.length).toBeGreaterThan(0);
    expect(paints.every((p) => p.ready)).toBe(true);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth === innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `${out}/${mobile ? "mobile" : "desktop"}-notebook.png`,
    });
    expect(errors).toEqual([]);
    writeFileSync(
      `${out}/${mobile ? "mobile" : "desktop"}-runtime.json`,
      JSON.stringify({ fonts, paints, errors }, null, 2),
    );
    await context.close();
  });

test("Unavailable bundled fonts keep Vietnamese readable and the menu playable", async ({
  page,
}) => {
  await page.route("**/*.woff2", (route) => route.abort());
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Bắt đầu hành trình", exact: true }),
  ).toBeVisible();
  await page.evaluate((text) => {
    const p = document.createElement("p");
    p.id = "fallback-vi";
    p.style.font = '32px LessonSerif, "Times New Roman",serif';
    p.textContent = text;
    document.body.append(p);
  }, sample);
  const fonts = await usedFonts(page, "#fallback-vi");
  expect(fonts).toHaveLength(1);
  expect(fonts[0].familyName).not.toBe("Georgia");
});
