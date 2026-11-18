import { test, expect, type Page } from "@playwright/test";
import { freshSlice, SLICE_KEY } from "../../src/cinematic/director";
import { freshChapter } from "../../src/chapter/director";
import { classroomReview } from "../../src/verdict/state";
import { freshStay, type StaySave } from "../../src/stayed/state";
import { TEACHER_ENTRANCE } from "../../src/cinematic/TeacherEntrance";
import {
  defaultPreferences,
  PREFERENCES_KEY,
} from "../../src/menu/preferences";

const read = async (page: Page) =>
  JSON.parse(
    (await page.getByTestId("chapter-telemetry").textContent()) ?? "{}",
  );
async function start(
  page: Page,
  entrance = false,
  fallback = false,
  stay: StaySave = { ...freshStay, interactive: true },
) {
  await page.addInitScript(
    ({ key, save, prefsKey, prefs, fallback }) => {
      if (!localStorage.getItem(key))
        localStorage.setItem(key, JSON.stringify(save));
      localStorage.setItem(prefsKey, JSON.stringify(prefs));
      if (fallback) {
        const original = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function (
          this: HTMLCanvasElement,
          ...args: Parameters<typeof original>
        ) {
          return String(args[0]).includes("webgl")
            ? null
            : original.apply(this, args);
        } as typeof original;
      }
    },
    {
      key: SLICE_KEY,
      prefsKey: PREFERENCES_KEY,
      prefs: defaultPreferences,
      fallback,
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
            phase: entrance ? "teacher_enter" : "chapter02",
            selected: "an",
            tested: ["student07", "an"],
            stayed: entrance ? undefined : stay,
          },
        },
      },
    },
  );
  await page.goto("/");
  await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
}

for (const fallback of [false, true]) {
  test(`chosen dialogue advances automatically and still accepts Next: ${fallback ? "mobile canvas" : "desktop"}`, async ({
    page,
  }, testInfo) => {
    test.setTimeout(90000);
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.setViewportSize(
      fallback ? { width: 390, height: 844 } : { width: 1440, height: 900 },
    );
    await start(page, false, fallback);
    const choices = page.getByRole("region", { name: "Chọn lời đáp của An" });
    await expect(choices).toBeVisible({ timeout: 20000 });
    await page.waitForTimeout(fallback ? 1200 : 10500);
    await expect(choices).toBeVisible();
    await page
      .getByRole("button", {
        name: "Em không biết mình đang sai ở đâu.",
        exact: true,
      })
      .click();
    await expect(page.locator(".subtitle")).toContainText(
      "không biết mình sai ở đâu nữa",
    );
    await expect.poll(async () => (await read(page)).time).toBeLessThan(2);
    await expect(page.locator(".dialogue-auto-note")).toContainText(
      "Tự chuyển sau 5s",
    );
    await page.waitForTimeout(1800);
    await page.getByRole("button", { name: "Tạm dừng", exact: true }).click();
    const paused = await read(page);
    await page.waitForTimeout(1200);
    expect((await read(page)).stayed.line).toBe(0);
    expect((await read(page)).time).toBeCloseTo(paused.time, 1);
    await page
      .getByRole("button", { name: "Tiếp tục quan sát", exact: true })
      .click();
    await page.waitForTimeout(400);
    await page.screenshot({
      path: testInfo.outputPath(
        `${fallback ? "mobile" : "desktop"}-automatic-dialogue.png`,
      ),
    });
    await expect(page.locator(".subtitle")).toContainText(
      "Em đang thử làm gì vậy?",
      {
        timeout: 4000,
      },
    );
    expect((await read(page)).stayed.line).toBe(1);
    await page.getByRole("button", { name: "Tiếp lời", exact: true }).click();
    await expect(page.locator(".subtitle")).toContainText(
      "xếp ưu tiên giờ thực hành",
    );
    await page.getByRole("button", { name: "Tiếp lời", exact: true }).click();
    await expect(page.locator(".chapter")).toHaveAttribute(
      "data-stayed",
      "chair",
    );
    expect(errors).toEqual([]);
    await page.goto("about:blank");
  });
}

test("the threshold suggestion gives An time to reflect before stating his lesson", async ({
  page,
}, testInfo) => {
  test.setTimeout(90000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 900 });
  await start(page, false, false, {
    ...freshStay,
    interactive: true,
    phase: "question",
    line: 9,
  });
  await page
    .getByRole("button", {
      name: "Hay em hạ ngưỡng để máy chọn bạn?",
      exact: true,
    })
    .click();
  await page.getByRole("button", { name: "Tiếp lời", exact: true }).click();
  await expect(page.locator(".subtitle")).toContainText("hiểu thêm điều gì");
  await expect(page.locator(".dialogue-auto-note")).toContainText("10s");
  await page.waitForTimeout(5300);
  expect((await read(page)).stayed.line).toBe(10);
  await expect(page.locator(".subtitle")).toContainText("An ngừng tay", {
    timeout: 6500,
  });
  await expect.poll(async () => (await read(page)).time).toBeGreaterThan(1.6);
  await page.getByRole("button", { name: "Tạm dừng", exact: true }).click();
  const thinking = await read(page);
  expect(thinking.stayed.line).toBe(11);
  expect(thinking.world.anHead).toBeGreaterThan(0.28);
  expect(thinking.world.portraits.an.visible).toBe(true);
  await page.screenshot({
    path: testInfo.outputPath("an-reflecting.png"),
    style: ".pause-screen { visibility: hidden !important; }",
  });
  await page
    .getByRole("button", { name: "Tiếp tục quan sát", exact: true })
    .click();
  await expect(page.locator(".subtitle")).toContainText("em cần hỏi lại bạn", {
    timeout: 6000,
  });
  await page.getByRole("button", { name: "Tiếp lời", exact: true }).click();
  await expect(page.locator(".subtitle")).toContainText("Điểm số kể một phần");
  await page.getByRole("button", { name: "Tiếp lời", exact: true }).click();
  await expect(page.locator(".subtitle")).toContainText("không cần được giúp");
  await page.screenshot({
    path: testInfo.outputPath("an-names-the-lesson.png"),
  });
  await page.getByRole("button", { name: "Tiếp lời", exact: true }).click();
  await expect(page.locator(".subtitle")).toContainText(
    "không thể quyết định tất cả",
  );
  await page.getByRole("button", { name: "Tiếp lời", exact: true }).click();
  await expect(page.locator(".subtitle")).toContainText(
    "xin xác minh hoàn cảnh",
  );
  await page.getByRole("button", { name: "Tiếp lời", exact: true }).click();
  await expect(page.locator(".subtitle")).toContainText("dữ liệu em đưa vào");
  await page.getByRole("button", { name: "Tiếp lời", exact: true }).click();
  await expect(page.locator(".subtitle")).toContainText(
    "không thể giao hết cho máy",
  );
  await page.getByRole("button", { name: "Tiếp lời", exact: true }).click();
  await expect(page.locator(".subtitle")).toContainText("ghi lại nguyên tắc");
  await page.getByRole("button", { name: "Tiếp lời", exact: true }).click();
  await expect(page.locator(".chapter")).toHaveAttribute(
    "data-stayed",
    "notebook",
  );
  expect(errors).toEqual([]);
  await page.goto("about:blank");
});

test("mobile teacher opens the handle before walking into the room", async ({
  page,
}, testInfo) => {
  test.setTimeout(70000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 390, height: 844 });
  await start(page, true);
  await expect
    .poll(async () => (await read(page)).time, {
      timeout: 15000,
      intervals: [100],
    })
    .toBeGreaterThan(TEACHER_ENTRANCE.lead + 0.6);
  await page.getByRole("button", { name: "Tạm dừng", exact: true }).click();
  const handle = await read(page);
  expect(handle.world.shot).toBe("teacher.entrance");
  expect(handle.world.teacher[2]).toBeCloseTo(6.18);
  await page.screenshot({
    path: testInfo.outputPath("teacher-hand-on-door.png"),
    style: ".pause-screen { visibility: hidden !important; }",
  });
  await page
    .getByRole("button", { name: "Tiếp tục quan sát", exact: true })
    .click();
  await expect
    .poll(async () => (await read(page)).time, {
      timeout: 10000,
      intervals: [100],
    })
    .toBeGreaterThan(TEACHER_ENTRANCE.lead + 1.25);
  await page.screenshot({
    path: testInfo.outputPath("teacher-opening-door.png"),
  });
  await expect
    .poll(async () => (await read(page)).time, {
      timeout: 10000,
      intervals: [100],
    })
    .toBeGreaterThan(TEACHER_ENTRANCE.lead + 3.5);
  const walking = await read(page);
  expect(Math.abs(walking.world.doorRotation)).toBeCloseTo(1.4);
  expect(walking.world.teacher[2]).toBeLessThan(handle.world.teacher[2] - 1);
  await page.screenshot({ path: testInfo.outputPath("teacher-walking.png") });
  await expect
    .poll(async () => (await read(page)).time, {
      timeout: 15000,
      intervals: [100],
    })
    .toBeGreaterThan(TEACHER_ENTRANCE.lead + TEACHER_ENTRANCE.settled);
  const arrived = await read(page);
  expect(arrived.world.teacher[2]).toBeCloseTo(0.7);
  expect(arrived.world.portraits.teacher.visible).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("teacher-arrived.png") });
  await expect(
    page.getByRole("region", { name: "Chọn lời đáp của An" }),
  ).toBeVisible({ timeout: 12000 });
  expect(errors).toEqual([]);
  await page.goto("about:blank");
});

test("dialogue skip stops at both replies and the notebook on a first playthrough", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await start(page, false, true, {
    ...freshStay,
    interactive: true,
    phase: "question",
  });
  const skip = page.getByRole("button", {
    name: "Bỏ qua hội thoại",
    exact: true,
  });
  const button = (name: string) =>
    page.getByRole("button", { name, exact: true });
  await skip.focus();
  await page.keyboard.press("Enter");
  await expect(skip).toHaveCount(0);
  const guide = page.getByRole("dialog", { name: "Tóm tắt câu chuyện" });
  await expect(
    guide.getByRole("heading", { name: "Hướng dẫn chơi" }),
  ).toBeVisible();
  await button("Tiếp tục chơi").click();
  await button("Dữ liệu chưa kể hết hoàn cảnh của bạn ấy.").click();
  await skip.click();
  await expect(skip).toHaveCount(0);
  await page.reload();
  await button("Tiếp tục").click();
  await button("Em sẽ tìm dữ kiện còn thiếu trước.").click();
  await skip.click();
  await expect(guide).toContainText("Chạm «02 · Nhu cầu»");
  await button("Tiếp tục chơi").click();
  await expect(button("Xem ghi chú về kết quả")).toBeVisible();
  await expect(button("Xem ghi chú về nhu cầu")).toBeVisible();
  await expect(skip).toHaveCount(0);
});

test("dialogue speed and manual guide control the current line", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await start(page, false, true, { ...freshStay, phase: "question" });
  const rate = (speed: number) =>
    page.getByRole("button", { name: `×${speed}`, exact: true });
  await rate(2).click();
  await expect(rate(2)).toHaveAttribute("aria-pressed", "true");
  await rate(3).click();
  await expect(rate(3)).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Tóm tắt & hướng dẫn" }).click();
  const progress = await page
    .locator(".dialogue-advance")
    .getAttribute("style");
  await page.waitForTimeout(1200);
  await expect(page.locator(".dialogue-advance")).toHaveAttribute(
    "style",
    progress!,
  );
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.locator(".subtitle")).toContainText(
    "Dữ liệu ghi bạn làm bài chưa đều",
    { timeout: 5000 },
  );
});
