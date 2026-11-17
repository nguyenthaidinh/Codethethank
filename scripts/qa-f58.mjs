import { chromium, expect as baseExpect } from "@playwright/test";
const expect = baseExpect.configure({ timeout: 20000 });
import { spawnSync } from "node:child_process";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import assert from "node:assert/strict";
process.on("uncaughtException", (error) => {
  console.error(
    String(error).replace(/#token=[a-f0-9]+/g, "#token=[redacted]"),
  );
  process.exit(1);
});
const out = resolve("backend/proof-f58/runtime");
mkdirSync(out, { recursive: true });
const open = process.argv.includes("--open");
const fixture = spawnSync(
  "F:/laragon/bin/php/php-8.3.30-Win32-vs16-x64/php.exe",
  ["-d", "extension=pdo_pgsql", "scripts/wall-fixture.php"],
  {
    cwd: resolve("backend"),
    encoding: "utf8",
    env: {
      ...process.env,
      APP_ENV: "local",
      DB_DATABASE: "gratitude_wall_review",
    },
    timeout: 120000,
  },
);
if (fixture.status !== 0) throw Error(fixture.stderr);
const { email, password } = JSON.parse(fixture.stdout);
const browser = await chromium.launch({
  headless: !open,
  args: ["--use-angle=d3d11"],
});
const errors = [],
  checks = [];
const check = (value) => {
  checks.push(value);
  console.log("CHECK:", value);
};
const observe = (page) => {
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (
      message.type() === "error" &&
      /Content Security Policy|Refused to/.test(message.text())
    )
      errors.push(message.text());
  });
};
const operator = await browser.newContext({
    viewport: { width: 1440, height: 960 },
  }),
  stage = await operator.newPage();
observe(stage);
await stage.goto("http://127.0.0.1:8057/admin/login");
await stage.getByLabel("Email quản trị").fill(email);
await stage.getByLabel("Mật khẩu", { exact: true }).fill(password);
await stage.getByRole("button", { name: "Vào không gian quản trị" }).click();
await stage.waitForURL("**/admin");
await stage.goto("http://127.0.0.1:8057/admin/stage");
await stage.locator("#display-name").fill("F5.8 · Máy chiếu duyệt");
await stage.getByRole("button", { name: "Tạo liên kết ghép màn hình" }).click();
const paired = await stage.locator("#paired-screen").getAttribute("href");
const displayContext = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  }),
  screen = await displayContext.newPage();
observe(screen);
await screen.goto(paired);
await expect(screen.locator("#blackout")).toBeHidden({ timeout: 15000 });
await stage.goto("http://127.0.0.1:8057/admin/stage");
const checkpoint = JSON.parse(
  readFileSync("docs/finale-v5-1-proof/before/checkpoint.json", "utf8"),
);
if (!open) await operator.close();
checkpoint.chapter.verdict.finale.phase = "paper";
async function gameContext(mode) {
  const mobile = mode !== "desktop";
  const context = await browser.newContext({
    viewport: mobile
      ? { width: 390, height: 844 }
      : { width: 1440, height: 960 },
    isMobile: mobile,
    hasTouch: mobile,
    reducedMotion: mobile ? "reduce" : "no-preference",
  });
  await context.addInitScript(
    ({ checkpoint, fallback }) => {
      if (!sessionStorage.getItem("f58-seeded")) {
        localStorage.setItem(
          "project2011.cinematic.v3",
          JSON.stringify(checkpoint),
        );
        sessionStorage.setItem("f58-seeded", "1");
      }
      if (fallback) {
        const original = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function (...args) {
          return String(args[0]).includes("webgl")
            ? null
            : original.apply(this, args);
        };
      }
    },
    { checkpoint, fallback: mode === "fallback" },
  );
  const page = await context.newPage();
  observe(page);
  await page.goto("http://127.0.0.1:4198/");
  await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
  await page.getByRole("button", { name: "Mở máy tính", exact: true }).click();
  await expect(page.locator("#recipient")).toBeVisible({ timeout: 15000 });
  return { context, page };
}
try {
  if (open) {
    const { page } = await gameContext("desktop");
    await page.bringToFront();
    console.log(
      "F58_READY: game editor, stage and upgraded paired Live Wall open.",
    );
    await new Promise((resolve) => browser.once("disconnected", resolve));
  } else {
    const measurements = [];
    for (const mode of process.argv.includes("--recovery-only")
      ? []
      : ["desktop", "mobile", "fallback"]) {
      const { context, page } = await gameContext(mode);
      const posts = [];
      page.on("request", (request) => {
        if (
          request.method() === "POST" &&
          request.url().includes("/api/v1/submissions")
        )
          posts.push(request);
      });
      await page.locator("#recipient").fill("Cô Vân");
      const message = `${mode} · Cảm ơn cô đã chọn ở lại. Một ánh sáng từ câu chuyện của em.`;
      await page.locator("#gratitude").fill(message);
      await page.locator("#display-name").fill("F5.8 · Minh An");
      await page
        .getByRole("button", { name: "Đọc lại lời cảm ơn", exact: true })
        .click();
      await expect(
        page.getByRole("button", {
          name: "Tạo ngôi sao riêng tư",
          exact: true,
        }),
      ).toBeEnabled();
      assert.equal(posts.length, 0);
      assert.equal(await page.locator(".public-sharing").count(), 0);
      await page
        .getByRole("button", { name: "Sửa lời nhắn", exact: true })
        .click();
      await page
        .getByRole("radio", { name: "Muốn chia sẻ công khai", exact: true })
        .check();
      await page
        .getByRole("button", { name: "Đọc lại lời cảm ơn", exact: true })
        .click();
      const consent = page.locator(".public-sharing input[type=checkbox]");
      const send = page.getByRole("button", {
        name: "Gửi lên Live Wall",
        exact: true,
      });
      await expect(consent).toBeEnabled({ timeout: 15000 });
      await expect(send).toBeDisabled();
      assert.equal(posts.length, 0);
      await consent.check();
      const started = Date.now();
      const submitted = page.waitForResponse(
        (r) =>
          r.request().method() === "POST" &&
          r.url().includes("/api/v1/submissions"),
      );
      await send.click();
      const result = await (await submitted).json();
      assert.equal(result.data.status, "approved");
      await expect(
        screen.locator(`[data-id="${result.data.id}"]`),
      ).toContainText(message.slice(0, 30), { timeout: 15000 });
      measurements.push({ mode, sendToWallMs: Date.now() - started });
      assert.equal(posts.length, 1);
      const body = posts[0].postDataJSON();
      assert.deepEqual(Object.keys(body).sort(), [
        "consent",
        "display_name",
        "message",
        "recipient",
      ]);
      const draftBefore = await page.evaluate(() =>
        localStorage.getItem("project2011.gratitude.v1"),
      );
      assert.ok(draftBefore.includes(message));
      await page.screenshot({ path: resolve(out, `${mode}-sent.png`) });
      await page.reload();
      await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
      await expect(
        page.getByRole("button", { name: "Gỡ bản công khai", exact: true }),
      ).toBeVisible();
      assert.equal(posts.length, 1);
      await page
        .getByRole("button", { name: "Tạo ngôi sao riêng tư", exact: true })
        .click();
      await expect(page.locator(".chapter")).toHaveAttribute(
        "data-finale",
        "galaxy",
        { timeout: 15000 },
      );
      await page.locator(".reveal-public-receipt > summary").click();
      await page
        .getByRole("button", { name: "Gỡ bản công khai", exact: true })
        .click();
      await expect(page.locator(".public-receipt")).toContainText(
        "Đã gỡ bản công khai",
        { timeout: 15000 },
      );
      await expect(screen.locator(`[data-id="${result.data.id}"]`)).toHaveCount(
        0,
        { timeout: 10000 },
      );
      assert.equal(
        await page.evaluate(() =>
          localStorage.getItem("project2011.gratitude.v1"),
        ),
        draftBefore,
      );
      await page
        .getByRole("button", { name: "Đi tiếp cùng ánh sáng", exact: true })
        .click();
      await expect(page.locator(".chapter")).toHaveAttribute(
        "data-finale",
        "ending",
        { timeout: 15000 },
      );
      const saved = await page.evaluate(() =>
        JSON.parse(localStorage.getItem("project2011.cinematic.v3")),
      );
      assert.equal(saved.chapter.verdict.finale.completed, true);
      check(
        `${mode}: private/no POST; explicit publish; reload/no resend; reveal withdrawal; completion and draft preserved`,
      );
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      );
      await context.close();
    }
    const { context, page } = await gameContext("fallback");
    await page.locator("#recipient").fill("Cô kiểm tra");
    await page
      .locator("#gratitude")
      .fill("Lời chúc kiểm tra mất phản hồi, chỉ tạo một bản.");
    await page
      .getByRole("radio", { name: "Muốn chia sẻ công khai", exact: true })
      .check();
    await page
      .getByRole("button", { name: "Đọc lại lời cảm ơn", exact: true })
      .click();
    let firstId,
      firstHeaders,
      attempts = 0;
    await page.route("**/api/v1/submissions", async (route) => {
      attempts++;
      if (attempts === 1) {
        firstHeaders = route.request().headers();
        const response = await route.fetch();
        firstId = (await response.json()).data.id;
        await route.abort("failed");
      } else await route.continue();
    });
    await page.locator(".public-sharing input[type=checkbox]").check();
    await page
      .getByRole("button", { name: "Gửi lên Live Wall", exact: true })
      .click();
    await expect(page.locator(".public-receipt")).toContainText(
      "Kết nối gián đoạn",
      { timeout: 15000 },
    );
    await page.reload();
    await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
    assert.equal(attempts, 1);
    const retry = page.getByRole("button", {
      name: "Thử lại cùng lời chúc",
      exact: true,
    });
    await expect(retry).toBeDisabled();
    await page.locator(".public-receipt input[type=checkbox]").check();
    const retried = page.waitForResponse(
      (r) =>
        r.request().method() === "POST" &&
        r.url().includes("/api/v1/submissions"),
    );
    await retry.click();
    const retryResponse = await retried;
    assert.equal((await retryResponse.json()).data.id, firstId);
    assert.equal(
      retryResponse.request().headers()["idempotency-key"],
      firstHeaders["idempotency-key"],
    );
    await page
      .getByRole("button", { name: "Gỡ bản công khai", exact: true })
      .click();
    await expect(page.locator(".public-receipt")).toContainText(
      "Đã gỡ bản công khai",
    );
    await context.close();
    check(
      "server accepted but response lost: reload never auto-posts; explicit retry returns same id; withdrawal works",
    );
    await screen.waitForTimeout(1600);
    await screen.screenshot({ path: resolve(out, "lanterns-desktop.png") });
    const perf = await screen.evaluate(
      () =>
        new Promise((resolve) => {
          let previous = performance.now(),
            start = previous;
          const samples = [];
          function tick(now) {
            samples.push(now - previous);
            previous = now;
            if (now - start < 3000) requestAnimationFrame(tick);
            else {
              samples.sort((a, b) => a - b);
              resolve({
                rafMedianMs: samples[Math.floor(samples.length * 0.5)],
                rafP95Ms: samples[Math.floor(samples.length * 0.95)],
                canvasPixels:
                  document.querySelector("canvas").width *
                  document.querySelector("canvas").height,
              });
            }
          }
          requestAnimationFrame(tick);
        }),
    );
    await displayContext.close();
    const videoContext = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      recordVideo: { dir: out, size: { width: 1920, height: 1080 } },
    });
    const videoPage = await videoContext.newPage();
    await videoPage.goto(paired);
    await expect(videoPage.locator("#blackout")).toBeHidden({ timeout: 15000 });
    await videoPage.waitForTimeout(18000);
    await videoContext.close();
    const video = await videoPage.video().path();
    assert.deepEqual(errors, []);
    writeFileSync(
      resolve(out, "qa.json"),
      JSON.stringify(
        { checks, measurements, errors, performance: perf, video },
        null,
        2,
      ),
    );
    console.log("F58_QA_PASS");
  }
} finally {
  writeFileSync(
    resolve(out, "last-run.json"),
    JSON.stringify({ checks, errors }, null, 2),
  );
  await browser.close();
}
