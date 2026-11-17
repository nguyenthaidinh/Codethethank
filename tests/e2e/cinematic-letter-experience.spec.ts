import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { finaleReady } from "../fixtures/finaleReady";
import { freshFinale } from "../../src/finale/state";
import { LETTER_KEY } from "../../src/finale/letter";
import { SLICE_KEY } from "../../src/cinematic/director";
const out = process.env.LETTER_PROOF_OUT ?? "docs/finale-f5-3-proof/runtime";
mkdirSync(out, { recursive: true });
for (const mode of ["desktop", "mobile", "fallback"])
  test(`F5.3 ${mode}: IME preview consent privacy and resume`, async ({
    browser,
  }) => {
    const mobile = mode !== "desktop";
    const ctx = await browser.newContext({
      viewport: mobile
        ? { width: 390, height: 844 }
        : { width: 1440, height: 900 },
      isMobile: mobile,
      hasTouch: mobile,
      reducedMotion: mobile ? "reduce" : "no-preference",
    });
    const page = await ctx.newPage(),
      errors: string[] = [],
      posts: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("request", (r) => {
      if (r.method() === "POST") posts.push(r.url());
    });
    const save = structuredClone(finaleReady);
    save.chapter!.verdict!.finale = { ...freshFinale, phase: "paper" };
    await page.addInitScript(
      ({ save, key, fallback }) => {
        if (!sessionStorage.getItem("f53")) {
          localStorage.setItem(key, JSON.stringify(save));
          sessionStorage.setItem("f53", "1");
        }
        if (fallback) {
          const original = HTMLCanvasElement.prototype.getContext;
          HTMLCanvasElement.prototype.getContext = function (
            ...args: Parameters<typeof original>
          ) {
            return String(args[0]).includes("webgl")
              ? null
              : original.apply(this, args);
          } as typeof original;
        }
      },
      { save, key: SLICE_KEY, fallback: mode === "fallback" },
    );
    const click = async (name: string) => {
      const b = page.getByRole("button", { name, exact: true });
      if (mobile) await b.tap();
      else await b.click();
    };
    await page.route("**/api/v1/sharing-policy", (route) =>
      route.fulfill({
        json: {
          data: {
            version: "public-wall-live-v2",
            text: "Tôi đồng ý công khai lời chúc ngay, không chờ duyệt.",
          },
        },
      }),
    );
    await page.goto("/");
    await click("Tiếp tục");
    await click("Mở máy tính");
    await expect(page.locator("#recipient")).toBeFocused();
    await page.locator("#recipient").fill("Cô Vân");
    await page.locator("#gratitude").dispatchEvent("compositionstart");
    await page.locator("#gratitude").fill("ấ".repeat(503));
    await expect(
      page.getByRole("button", { name: "Đọc lại lời cảm ơn", exact: true }),
    ).toBeDisabled();
    await expect(page.locator("#gratitude")).toHaveValue("ấ".repeat(503));
    await page.locator("#gratitude").dispatchEvent("compositionend");
    await expect(page.locator("#gratitude")).toHaveValue("ấ".repeat(500));
    const message =
      "Cảm ơn cô đã ngồi lại cùng em.\nNhờ câu hỏi của cô, em đã tìm thấy cách bắt đầu lại.";
    await page
      .locator("#gratitude")
      .fill(message + "<script>window.leaked=1</script>");
    await page.locator("#display-name").fill("Minh 🌟");
    await page.locator("#recipient").scrollIntoViewIfNeeded();
    if (mobile) await click("Xem trước");
    await expect(
      page.getByRole("article", { name: "Bản xem trước lời cảm ơn" }),
    ).toContainText("Minh 🌟");
    await expect(
      page.getByRole("article", { name: "Bản xem trước lời cảm ơn" }),
    ).toContainText("<script>window.leaked=1</script>");
    expect(await page.evaluate(() => Object.hasOwn(window, "leaked"))).toBe(
      false,
    );
    if (mobile) await click("Soạn lời nhắn");
    await page.locator("#gratitude").fill(message);
    if (mobile) await click("Xem trước");
    await page.screenshot({ path: `${out}/${mode}-preview.png` });
    if (mobile) await click("Soạn lời nhắn");
    await page
      .getByRole("radio", { name: "Muốn chia sẻ công khai", exact: true })
      .check();
    await click("Lưu bản nháp riêng tư");
    await expect(page.locator("#letter-status")).toContainText(
      "Bản nháp lưu riêng trên thiết bị này.",
    );
    await click("Đọc lại lời cảm ơn");
    const commit = page.getByRole("button", {
      name: "Tạo ngôi sao riêng tư",
      exact: true,
    });
    await expect(commit).toBeEnabled();
    const send = page.getByRole("button", {
      name: "Gửi lên Live Wall",
      exact: true,
    });
    await expect(send).toBeDisabled();
    const consent = page.getByRole("checkbox", {
      name: /Tôi đồng ý công khai/,
    });
    await consent.check();
    await expect(send).toBeEnabled();
    await expect(commit).toBeEnabled();
    await page.screenshot({ path: `${out}/${mode}-public-choice.png` });
    expect(await page.evaluate(() => Object.hasOwn(window, "leaked"))).toBe(
      false,
    );
    expect(
      await page.getByTestId("chapter-telemetry").textContent(),
    ).not.toContain("Minh");
    const stored = await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!),
      LETTER_KEY,
    );
    expect(stored.audience).toBe("public");
    expect(stored).not.toHaveProperty("consent");
    await page.reload();
    await click("Tiếp tục");
    await expect(consent).not.toBeChecked();
    await expect(commit).toBeEnabled();
    await expect(send).toBeDisabled();
    await click("Sửa lời nhắn");
    await expect(page.locator("#display-name")).toHaveValue("Minh 🌟");
    await expect(page.locator("#gratitude")).toHaveValue(message);
    await page
      .getByRole("radio", { name: "Giữ riêng tư", exact: true })
      .check();
    await page
      .getByRole("checkbox", {
        name: "Lưu riêng bản nháp trên thiết bị này",
        exact: true,
      })
      .uncheck();
    expect(
      await page.evaluate((key) => localStorage.getItem(key), LETTER_KEY),
    ).toBeNull();
    await click("Đọc lại lời cảm ơn");
    await expect(commit).toBeEnabled();
    await click("Sửa lời nhắn");
    await click("Xóa nội dung đã lưu");
    await expect(page.locator("#display-name")).toHaveValue("");
    await expect(page.locator("#gratitude")).toHaveValue("");
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBe(mobile ? 390 : 1440);
    expect(posts).toEqual([]);
    expect(errors).toEqual([]);
    await ctx.close();
  });
