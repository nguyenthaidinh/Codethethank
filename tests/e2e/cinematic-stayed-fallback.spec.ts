import { test, expect } from "@playwright/test";
import { freshSlice, SLICE_KEY } from "../../src/cinematic/director";
import { freshStay } from "../../src/stayed/state";
import { freshVerdict } from "../../src/verdict/state";
test("Chapter 02 keyboard and Canvas fallback restore both pages and finish", async ({
  page,
}) => {
  await page.addInitScript(
    ({ key, save }) => {
      localStorage.setItem(key, JSON.stringify(save));
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (
        this: HTMLCanvasElement,
        ...args: Parameters<typeof original>
      ) {
        return String(args[0]).includes("webgl")
          ? null
          : original.apply(this, args);
      } as typeof original;
    },
    {
      key: SLICE_KEY,
      save: {
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
            stayed: { ...freshStay, phase: "notebook" },
          },
        },
      },
    },
  );
  await page.goto("/");
  await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
  await expect(page.locator(".runtime-status")).toContainText("Đồ họa 2D");
  const key = async (name: string) => {
    const b = page.getByRole("button", { name, exact: true });
    await b.focus();
    await page.keyboard.press("Enter");
  };
  await key("Xem ghi chú về kết quả");
  await key("Xem ghi chú về nhu cầu");
  await expect(page.locator(".chapter")).toHaveAttribute(
    "data-stayed",
    "second_chance",
    { timeout: 10000 },
  );
  for (let i = 0; i < 3; i++) await key("Tiếp lời ↵");
  await key("Khôi phục dòng ghi chú");
  await expect(page.locator(".chapter")).toHaveAttribute(
    "data-stayed",
    "next",
    { timeout: 20000 },
  );
  await key("Quan sát trang phác thảo");
  await page.screenshot({
    path: "docs/chapter-02-proof/fallback-keyboard.png",
  });
  const t = JSON.parse(
    (await page.getByTestId("chapter-telemetry").textContent()) ?? "{}",
  );
  expect(t.stayed.nextInspected).toBe(true);
  expect(t.stayed.read).toHaveLength(2);
});
