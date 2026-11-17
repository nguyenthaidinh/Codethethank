import { chromium, expect } from "@playwright/test";
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import assert from "node:assert/strict";

const base = "http://127.0.0.1:8057",
    out = resolve("proof-f57/runtime"),
    open = process.argv.includes("--open");
mkdirSync(out, { recursive: true });
const fixture = spawnSync(
    "F:/laragon/bin/php/php-8.3.30-Win32-vs16-x64/php.exe",
    ["-d", "extension=pdo_pgsql", "scripts/wall-fixture.php"],
    {
        encoding: "utf8",
        timeout: 120000,
        env: {
            ...process.env,
            APP_ENV: "local",
            DB_DATABASE: "gratitude_wall_review",
        },
    },
);
if (fixture.status !== 0) throw Error(fixture.stderr);
const { email, password } = JSON.parse(fixture.stdout);
const browser = await chromium.launch({ headless: !open });
const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    locale: "vi-VN",
});
const stage = await context.newPage(),
    errors = [],
    checks = [];
const check = (text) => {
    checks.push(text);
    console.log("CHECK:", text);
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
observe(stage);
await stage.goto(`${base}/admin/login`);
await stage.getByLabel("Email quản trị").fill(email);
await stage.getByLabel("Mật khẩu", { exact: true }).fill(password);
await stage.getByRole("button", { name: "Vào không gian quản trị" }).click();
await stage.waitForURL(`${base}/admin`);
await stage.goto(`${base}/admin/stage`);
const displayName = `Máy chiếu QA ${Date.now()}`;
await stage.locator("#display-name").fill(displayName);
await stage.getByRole("button", { name: "Tạo liên kết ghép màn hình" }).click();
const paired = await stage.locator("#paired-screen").getAttribute("href"); // Never log token or capture the pairing page.
const projectionContext = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    locale: "vi-VN",
});
const screen = await projectionContext.newPage();
observe(screen);
await screen.goto(paired);
await expect(screen.locator("#blackout")).toBeHidden({ timeout: 20000 });
await expect(screen.locator("#message")).not.toBeEmpty();
await screen.evaluate(() => document.fonts.ready);
assert.equal(new URL(screen.url()).hash, "");
check("paired screen receives content; fragment removed");
await stage.goto(`${base}/admin/stage`);
await stage.evaluate(() => document.fonts.ready);
const command = async (action) => {
    const result = await stage.evaluate(async (action) => {
        const state = await (
            await fetch("/admin/stage/state", {
                headers: { Accept: "application/json" },
            })
        ).json();
        const response = await fetch("/admin/stage/command", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Accept: "application/json",
            },
            body: new URLSearchParams({
                _token: document.querySelector("[name=_token]").value,
                action,
                revision: state.revision,
            }),
            redirect: "follow",
        });
        return response.status;
    }, action);
    assert.equal(result, 200);
};
if (open) {
    await screen.keyboard.press("b");
    await expect(screen.locator("#blackout")).toBeVisible();
    for (const selector of [
        "#message",
        "#recipient",
        "#sender",
        "#page-number",
    ])
        assert.equal(await screen.locator(selector).textContent(), "");
    assert.equal(
        await screen.evaluate(
            () =>
                document.elementFromPoint(innerWidth - 40, innerHeight - 35).id,
        ),
        "blackout",
    );
    await screen.keyboard.press("r");
    await expect(screen.locator("#blackout")).toBeHidden({ timeout: 10000 });
    await screen.waitForTimeout(1600);
    await screen.screenshot({ path: resolve(out, "live-wall-review.png") });
    const fallbackContext = await browser.newContext({
        viewport: { width: 390, height: 844 },
    });
    await fallbackContext.addInitScript(() => {
        HTMLCanvasElement.prototype.getContext = () => null;
    });
    const fallback = await fallbackContext.newPage();
    await fallback.goto(paired);
    await expect(fallback.locator("#blackout")).toBeHidden({ timeout: 10000 });
    await expect(fallback.locator("#message")).not.toBeEmpty();
    await fallback.waitForTimeout(1600);
    await fallback.screenshot({
        path: resolve(out, "canvas-fallback-mobile.png"),
    });
    await fallbackContext.close();
    writeFileSync(
        resolve(out, "final-blank-check.json"),
        JSON.stringify({
            result: "PASS",
            allTextScrubbed: true,
            blackoutCoversFullscreenButton: true,
        }),
    );
    const share = await context.newPage();
    await share.goto(`${base}/gratitude`);
    await screen.bringToFront();
    console.log(
        "LIVE_WALL_REVIEW_READY: stage and paired projection open; isolated demo data.",
    );
    await new Promise((resolve) => browser.once("disconnected", resolve));
} else
    try {
        await screen.waitForTimeout(9000);
        await screen.screenshot({
            path: resolve(out, "live-wall-desktop.png"),
        });
        await stage.screenshot({
            path: resolve(out, "stage-desktop.png"),
            fullPage: true,
        });
        assert.equal(
            (
                await context.request.post(`${base}/admin/stage/command`, {
                    form: { action: "blank" },
                })
            ).status(),
            419,
        );
        check("real HTTP stage CSRF enforced");
        const shareContext = await browser.newContext({
            viewport: { width: 390, height: 844 },
            locale: "vi-VN",
            isMobile: true,
            hasTouch: true,
        });
        const share = await shareContext.newPage();
        observe(share);
        await share.goto(`${base}/gratitude`);
        await expect(share.locator("#send")).toBeEnabled();
        await share.evaluate(() => document.fonts.ready);
        await share.screenshot({
            path: resolve(out, "share-mobile.png"),
            fullPage: true,
        });
        await share.locator("#recipient").fill("Cô thử nghiệm");
        await share
            .locator("#message")
            .fill(
                "Một lời chúc vừa gửi trực tiếp từ điện thoại. <script>window.wallXss=true</script>",
            );
        await share.locator("#display_name").fill("QA · minh họa");
        await share.locator("#consent").check();
        const submitted = share.waitForResponse(
            (r) =>
                r.url().endsWith("/api/v1/submissions") &&
                r.request().method() === "POST",
        );
        const sentAt = Date.now();
        await share.locator("#send").click();
        const body = await (await submitted).json();
        assert.equal(body.data.status, "approved");
        await expect(screen.locator("#wishes")).toContainText(
            "Một lời chúc vừa gửi",
            { timeout: 10000 },
        );
        const latency = Date.now() - sentAt;
        assert.equal(await screen.evaluate(() => window.wallXss), undefined);
        check("public opt-in appears in Auto without approval; HTML inert");
        await command("manual");
        await screen.waitForTimeout(1500);
        const held = await screen.locator("#message").textContent();
        await screen.waitForTimeout(13000);
        assert.equal(await screen.locator("#message").textContent(), held);
        check("Manual holds chosen short message beyond Auto interval");
        await command("auto");
        await expect(screen.locator("#wishes")).toContainText(
            "Một lời chúc vừa gửi",
            { timeout: 10000 },
        );
        await share.locator("#withdraw").click();
        await expect(share.locator("#share-status")).toContainText("Đã gỡ");
        await expect(screen.locator("#wishes")).not.toContainText(
            "Một lời chúc vừa gửi",
            { timeout: 10000 },
        );
        check("sender withdrawal removes floating content");
        await command("blank");
        await expect(screen.locator("#blackout")).toBeVisible({
            timeout: 7000,
        });
        assert.equal(await screen.locator("#message").textContent(), "");
        await screen.screenshot({ path: resolve(out, "emergency-blank.png") });
        await command("resume");
        await expect(screen.locator("#blackout")).toBeHidden({ timeout: 7000 });
        check("remote Emergency Blank scrubs content; deliberate resume");
        await screen.keyboard.press("b");
        await expect(screen.locator("#blackout")).toBeVisible();
        await screen.waitForTimeout(1500);
        await expect(screen.locator("#blackout")).toBeVisible();
        await screen.keyboard.press("r");
        await expect(screen.locator("#blackout")).toBeHidden({ timeout: 7000 });
        check("local B latch survives polling; R releases");
        await projectionContext.setOffline(true);
        await expect(screen.locator("#blackout")).toBeVisible({
            timeout: 7500,
        });
        assert.equal(await screen.locator("#message").textContent(), "");
        await projectionContext.setOffline(false);
        await expect(screen.locator("#blackout")).toBeHidden({
            timeout: 10000,
        });
        check("offline display fails closed within lease and reconnects");
        await screen.emulateMedia({ reducedMotion: "reduce" });
        await screen.waitForTimeout(1500);
        assert.equal(
            await screen
                .locator(".flying-wish")
                .first()
                .evaluate((el) => getComputedStyle(el).animationName),
            "none",
        );
        await screen.screenshot({ path: resolve(out, "reduced-motion.png") });
        await screen.emulateMedia({ reducedMotion: "no-preference" });
        await stage.setViewportSize({ width: 390, height: 844 });
        await stage.screenshot({
            path: resolve(out, "stage-mobile.png"),
            fullPage: true,
        });
        assert.ok(
            await stage.evaluate(
                () => document.documentElement.scrollWidth <= innerWidth,
            ),
        );
        assert.ok(
            await share.evaluate(
                () => document.documentElement.scrollWidth <= innerWidth,
            ),
        );
        check("mobile stage/share no horizontal overflow; reduced motion");
        const perf = await screen.evaluate(
            () =>
                new Promise((resolve) => {
                    const frames = [];
                    let start = performance.now(),
                        last = start;
                    function tick(now) {
                        frames.push(now - last);
                        last = now;
                        if (now - start < 3000) requestAnimationFrame(tick);
                        else {
                            frames.sort((a, b) => a - b);
                            resolve({
                                rafMedianMs:
                                    frames[Math.floor(frames.length * 0.5)],
                                rafP95Ms:
                                    frames[Math.floor(frames.length * 0.95)],
                                canvasPixels:
                                    document.querySelector("canvas").width *
                                    document.querySelector("canvas").height,
                                domNodes: document.querySelectorAll("*").length,
                            });
                        }
                    }
                    requestAnimationFrame(tick);
                }),
        );
        // Record only the projection, without pairing secrets or administrative session details.
        const videoContext = await browser.newContext({
            viewport: { width: 1920, height: 1080 },
            recordVideo: { dir: out, size: { width: 1920, height: 1080 } },
        });
        const videoPage = await videoContext.newPage();
        await videoPage.goto(paired);
        await expect(videoPage.locator("#blackout")).toBeHidden({
            timeout: 10000,
        });
        await videoPage.waitForTimeout(25000);
        await videoContext.close();
        const video = await videoPage.video().path();
        const fallbackContext = await browser.newContext({
            viewport: { width: 390, height: 844 },
        });
        await fallbackContext.addInitScript(() => {
            HTMLCanvasElement.prototype.getContext = () => null;
        });
        const fallback = await fallbackContext.newPage();
        observe(fallback);
        await fallback.goto(paired);
        await expect(fallback.locator("#message")).not.toBeEmpty({
            timeout: 10000,
        });
        await expect(fallback.locator("#blackout")).toBeHidden();
        await fallback.screenshot({
            path: resolve(out, "canvas-fallback-mobile.png"),
        });
        await fallbackContext.close();
        check("canvas unavailable: public text and controls still work");
        const noJsContext = await browser.newContext({
            javaScriptEnabled: false,
            storageState: await context.storageState(),
        });
        const noJs = await noJsContext.newPage();
        await noJs.goto(`${base}/admin/stage`);
        await noJs
            .getByRole("button", { name: "Emergency Blank", exact: true })
            .click();
        await expect(screen.locator("#blackout")).toBeVisible({
            timeout: 7000,
        });
        await noJs
            .getByRole("button", { name: "Mở lại màn hình", exact: true })
            .click();
        await expect(screen.locator("#blackout")).toBeHidden({ timeout: 7000 });
        await noJsContext.close();
        check("no-JavaScript stage forms can blank and resume");
        await stage.goto(`${base}/admin/stage`);
        await stage
            .locator(".revoke-row")
            .filter({ hasText: displayName })
            .getByRole("button", { name: "Thu hồi" })
            .click();
        await expect(screen.locator("#blackout")).toBeVisible({
            timeout: 7000,
        });
        assert.equal(await screen.locator("#message").textContent(), "");
        check("revoked display token clears projector");
        assert.deepEqual(errors, []);
        writeFileSync(
            resolve(out, "qa.json"),
            JSON.stringify(
                {
                    checks,
                    errors,
                    submitToDisplayMs: latency,
                    performance: perf,
                    video,
                },
                null,
                2,
            ),
        );
        check(
            "runtime screenshots, 25-second video and performance sample captured",
        );
    } finally {
        await browser.close();
    }
