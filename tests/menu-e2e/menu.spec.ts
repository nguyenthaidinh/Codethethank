import { test, expect } from "@playwright/test";
import { freshSlice, SLICE_KEY } from "../../src/cinematic/director";
import { PREFERENCES_KEY } from "../../src/menu/preferences";

test("branding, valid save gating, settings persistence and modal keyboard focus", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.locator(".menu-scene")).toHaveAttribute(
    "data-assets-ready",
    "true",
  );
  await expect(page).toHaveTitle("THE UNWRITTEN LESSON");
  await expect(
    page.getByRole("button", { name: "Tiếp tục", exact: true }),
  ).toBeDisabled();
  await expect(page.getByText("PROJECT 20:11")).toHaveCount(0);
  await page.getByRole("button", { name: "Cài đặt", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Đóng", exact: true }),
  ).toBeFocused();
  await page.getByLabel("Giảm chuyển động", { exact: true }).check();
  await page.getByLabel("Hiển thị phụ đề", { exact: true }).uncheck();
  await page.getByLabel("Đồ họa môi trường menu").selectOption("low");
  await page.getByLabel("Âm lượng nhạc").fill("0.25");
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Cài đặt", exact: true }),
  ).toBeFocused();
  await page.reload();
  await page.getByRole("button", { name: "Cài đặt", exact: true }).click();
  await expect(
    page.getByLabel("Giảm chuyển động", { exact: true }),
  ).toBeChecked();
  await expect(
    page.getByLabel("Hiển thị phụ đề", { exact: true }),
  ).not.toBeChecked();
  await expect(page.getByLabel("Âm lượng nhạc")).toHaveValue("0.25");
  await expect(page.getByLabel("Đồ họa môi trường menu")).toHaveValue("low");
  await page.keyboard.press("Escape");
  await page.evaluate((key) => localStorage.setItem(key, "{broken"), SLICE_KEY);
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Tiếp tục", exact: true }),
  ).toBeDisabled();
  expect(errors).toEqual([]);
});

test("continue resumes the real checkpoint, with settings passed to gameplay", async ({
  page,
}) => {
  await page.addInitScript(
    ({ save, key, preferencesKey }) => {
      localStorage.setItem(key, JSON.stringify(save));
      localStorage.setItem(
        preferencesKey,
        JSON.stringify({ reduced: true, captions: false, muted: true }),
      );
    },
    {
      save: {
        ...freshSlice,
        beat: "profile",
        focus: "profile",
        observed: ["laptop", "notebook"],
      },
      key: SLICE_KEY,
      preferencesKey: PREFERENCES_KEY,
    },
  );
  await page.goto("/");
  await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
  await expect(page.locator(".cinematic")).toHaveAttribute(
    "data-beat",
    "profile",
  );
  await expect(page.locator(".entry-screen")).toHaveCount(0);
  await expect(page.locator(".subtitle")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Chọn hồ sơ An", exact: true }),
  ).toBeVisible();
});

test("new journey confirms overwrite and starts Chapter 00", async ({
  page,
}) => {
  await page.addInitScript(
    ({ save, key }) => localStorage.setItem(key, JSON.stringify(save)),
    {
      save: {
        ...freshSlice,
        beat: "profile",
        focus: "profile",
        observed: ["laptop", "notebook"],
      },
      key: SLICE_KEY,
    },
  );
  await page.goto("/");
  await page.getByRole("button", { name: "Bắt đầu hành trình" }).click();
  await page.getByRole("button", { name: "Giữ lại hành trình" }).click();
  await expect(
    page.getByRole("button", { name: "Tiếp tục", exact: true }),
  ).toBeEnabled();
  await page.getByRole("button", { name: "Bắt đầu hành trình" }).click();
  await page.getByRole("button", { name: "Bắt đầu lại", exact: true }).click();
  await expect(page.locator(".cinematic")).toHaveAttribute(
    "data-chapter",
    "OPENING_CINEMATIC",
  );
  await expect(page.locator(".entry-screen")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Tạm dừng", exact: true }),
  ).toBeVisible();
});

for (const viewport of [
  { width: 1366, height: 768 },
  { width: 1920, height: 1080 },
  { width: 390, height: 844 },
  { width: 360, height: 640 },
  { width: 844, height: 390 },
]) {
  test(`layout ${viewport.width}x${viewport.height} and reduced motion`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.locator(".menu-world")).toBeVisible();
    for (const name of ["Bắt đầu hành trình", "Cài đặt", "Giới thiệu"]) {
      const button = page.getByRole("button", { name, exact: true });
      await expect(button).toBeInViewport();
      const box = await button.boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(42);
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(
      await page
        .locator(".menu-world")
        .evaluate((element) => getComputedStyle(element).animationName),
    ).toBe("none");
    await page.getByRole("button", { name: "Giới thiệu", exact: true }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText(/Founder|Nhà sáng lập/)).toHaveCount(0);
    await page.keyboard.press("Escape");
  });
}

test("storage and audio failure still permit a silent journey", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new Error("Storage blocked");
    };
    Storage.prototype.getItem = () => {
      throw new Error("Storage blocked");
    };
    window.AudioContext = class {
      constructor() {
        throw new Error("Audio blocked");
      }
    } as unknown as typeof AudioContext;
  });
  await page.goto("/");
  await expect(page.locator(".menu-error")).toContainText("Không thể lưu");
  await page.getByRole("button", { name: "Bật âm thanh", exact: true }).click();
  await expect(page.locator(".menu-error")).toContainText(
    "Không thể mở âm thanh",
  );
  await page.getByRole("button", { name: "Bắt đầu hành trình" }).click();
  await expect(
    page.getByRole("button", { name: "Tạm dừng", exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
