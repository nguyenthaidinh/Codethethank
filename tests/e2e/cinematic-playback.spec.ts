import { expect, test } from "@playwright/test";

declare global {
  interface Window {
    scoreBus?: GainNode;
  }
}

for (const touch of [false, true]) {
  test.describe(touch ? "Touch playback controls" : "Desktop playback controls", () => {
    test.use({ hasTouch: touch, viewport: touch ? { width: 375, height: 812 } : { width: 1280, height: 720 } });

    test("fullscreen, independent score, and pause work during gameplay", async ({ page }) => {
      await page.addInitScript(() => {
        const connect = AudioBufferSourceNode.prototype.connect;
        AudioBufferSourceNode.prototype.connect = function (destination: AudioNode, ...ports: number[]) {
          if (this.loop && (this.buffer?.duration ?? 0) > 30 && destination instanceof GainNode) {
            window.scoreBus = destination;
          }
          return Reflect.apply(connect, this, [destination, ...ports]);
        } as typeof connect;
      });
      await page.goto("/");
      const button = (name: string) => page.getByRole("button", { name, exact: true });
      const press = (name: string) => touch ? button(name).tap() : button(name).click();
      await press("Bắt đầu hành trình");
      await press("Mở toàn màn hình");
      await expect.poll(() => page.evaluate(() => document.fullscreenElement === document.documentElement)).toBe(true);
      await press("Thoát toàn màn hình");
      await expect(button("Mở toàn màn hình")).toBeVisible();

      const score = page.waitForResponse(response =>
        response.url().includes("after-class-lofi") && response.ok()
      );
      await press("Bật nhạc lo-fi");
      await score;
      const telemetry = () => page.getByTestId("chapter-telemetry").evaluate(el => JSON.parse(el.textContent!).audio);
      const scoreGain = () => page.evaluate(() => window.scoreBus?.gain.value ?? 0);
      await expect.poll(scoreGain, { timeout: 12000 }).toBeGreaterThan(.001);
      await press("Tắt nhạc lo-fi");
      await expect.poll(scoreGain).toBeLessThan(.001);
      await expect(button("Tắt âm thanh")).toBeVisible();
      await expect.poll(async () => (await telemetry()).buses.effects).toBeGreaterThan(0);
      await press("Bật nhạc lo-fi");
      await expect.poll(scoreGain).toBeGreaterThan(.001);
      await press("Tạm dừng");
      await expect(button("Tiếp tục quan sát")).toBeVisible();
      await press("Tiếp tục quan sát");
      await expect.poll(() => page.evaluate(() => window.scoreBus?.context.state)).toBe("running");
      await press("Tắt âm thanh");
      await expect(button("Bật nhạc lo-fi")).toBeVisible();
    });
  });
}
