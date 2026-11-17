import { test, expect } from "@playwright/test";
import { freshSlice, SLICE_KEY } from "../../src/cinematic/director";
import { freshChapter } from "../../src/chapter/director";
import { classroomReview } from "../../src/verdict/state";
import { freshStay } from "../../src/stayed/state";

test("portrait reply keeps An's face above the choices", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(
    ({ key, save }) => localStorage.setItem(key, JSON.stringify(save)),
    {
      key: SLICE_KEY,
      save: {
        ...freshSlice,
        beat: "explore",
        chapter: {
          ...freshChapter,
          beat: "NEXT_SCENE_READY",
          signal: true,
          evidence: ["laptop"],
          verdict: {
            ...classroomReview,
            phase: "chapter02",
            selected: "minh",
            tested: ["student07", "minh"],
            stayed: { ...freshStay, interactive: true },
          },
        },
      },
    },
  );
  await page.goto("/");
  await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
  const choices = page.getByRole("region", { name: "Chọn lời đáp của An" });
  await expect(choices).toBeVisible({ timeout: 15000 });
  await expect
    .poll(async () => {
      const s = JSON.parse(
        (await page.getByTestId("chapter-telemetry").textContent()) ?? "{}",
      );
      return s.world?.fov;
    })
    .toBeCloseTo(50, 0);
  const s = JSON.parse(
    (await page.getByTestId("chapter-telemetry").textContent()) ?? "{}",
  );
  const face = s.world.portraits.an;
  expect(face.visible).toBe(true);
  expect(face.x).toBeGreaterThan(390 * 0.15);
  expect(face.x).toBeLessThan(390 * 0.85);
  const box = await choices.boundingBox();
  expect(face.y + 50).toBeLessThan(box!.y);
  await page.screenshot({ path: testInfo.outputPath("portrait-reply.png") });
  await page.goto("about:blank");
});
