import { expect, test } from "@playwright/test";

test("audio starts only on interaction and menu context closes before game audio", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const NativeAudio = window.AudioContext;
    const contexts: AudioContext[] = [];
    Object.assign(window, { menuTestContexts: contexts });
    window.AudioContext = class extends NativeAudio {
      constructor(options?: AudioContextOptions) {
        super(options);
        contexts.push(this);
      }
    };
  });
  await page.goto("/");
  const states = () =>
    page.evaluate(() =>
      (
        window as unknown as { menuTestContexts: AudioContext[] }
      ).menuTestContexts.map((c) => c.state),
    );
  expect(await states()).toEqual([]);
  await page.getByRole("button", { name: "Bật âm thanh", exact: true }).click();
  await expect.poll(states).toEqual(["running"]);
  await page.getByRole("button", { name: "Bắt đầu hành trình" }).click();
  // The dev-server suite can compile the lazy game chunk on this first launch.
  // Wait for the actual game UI before asserting the audio context handoff.
  await expect(
    page.getByRole("button", { name: "Tạm dừng", exact: true }),
  ).toBeVisible({ timeout: 30000 });
  await expect.poll(states).toEqual(["closed", "running"]);
});

test("missing art falls back to the animated vector environment", async ({
  page,
}) => {
  await page.route("**/menu/*.webp", (route) => route.abort());
  await page.goto("/");
  await expect(page.locator(".menu-scene")).toHaveAttribute(
    "data-assets-ready",
    "false",
  );
  await expect(page.locator(".menu-aion")).toBeVisible();
  await page.getByRole("button", { name: "Bắt đầu hành trình" }).click();
  await expect(
    page.getByRole("button", { name: "Tạm dừng", exact: true }),
  ).toBeVisible();
});
