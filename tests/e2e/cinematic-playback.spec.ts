import { expect, test } from "@playwright/test";
import { freshChapter } from "../../src/chapter/director";
import { freshSlice, SLICE_KEY } from "../../src/cinematic/director";

declare global {
  interface Window {
    scoreBus?: GainNode;
  }
}

test("global speed advances a scene outside dialogue and guide tracks the chapter", async ({ page }) => {
  await page.addInitScript(({ key, save }) => {
    if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(save));
  }, {
    key: SLICE_KEY,
    save: {
      ...freshSlice,
      beat: "explore",
      chapter: { ...freshChapter, beat: "MEMORY_TRANSITION", signal: true },
    },
  });
  await page.goto("/");
  const button = (name: string) => page.getByRole("button", { name, exact: true });
  await button("Tiếp tục").click();
  await button("×3").click();
  const stage = page.locator(".chapter");
  await expect(stage).toHaveAttribute("data-chapter", "CLASSROOM_ESTABLISHING", { timeout: 6000 });
  await expect(button("×3")).toHaveAttribute("aria-pressed", "true");
  await button("Tóm tắt & hướng dẫn").click();
  const guide = page.getByRole("dialog", { name: "Tóm tắt câu chuyện" });
  await expect(guide).toContainText("bàn máy tính");
  await guide.getByText("Điều khiển chung").click();
  await expect(guide.getByText(/dùng Tab/)).toBeVisible();
  await button("Tiếp tục chơi").click();
  await button("×1").click();
  await expect(button("×1")).toHaveAttribute("aria-pressed", "true");
});

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
