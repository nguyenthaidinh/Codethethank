import { test, expect } from "@playwright/test";
import { freshSlice } from "../../src/cinematic/director";
test("restored profile supports desktop drag, keyboard controls and offline completion", async ({
  page,
  context,
}) => {
  await page.addInitScript(
    (save) =>
      localStorage.setItem("project2011.cinematic.v3", JSON.stringify(save)),
    {
      ...freshSlice,
      beat: "profile",
      focus: "profile",
      observed: ["laptop", "notebook"],
      reduced: true,
      muted: true,
    },
  );
  await page.goto("/?qa=1");
  await page.getByRole("button", { name: "Chơi không âm thanh" }).click();
  await context.setOffline(true);
  await page
    .getByRole("button", { name: "Chọn hồ sơ An", exact: true })
    .dragTo(
      page.getByRole("button", {
        name: "Chạy hồ sơ An trên laptop",
        exact: true,
      }),
      { force: true },
    );
  await expect(page.locator(".cinematic")).toHaveAttribute(
    "data-beat",
    "verdict",
    { timeout: 15000 },
  );
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Tùy chỉnh", exact: true }).click();
  await page.getByLabel("Phụ đề", { exact: true }).uncheck();
  await page
    .getByRole("button", { name: "Trở lại căn phòng", exact: true })
    .click();
  await expect(page.locator(".subtitle")).toHaveCount(0);
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Tùy chỉnh", exact: true }).click();
  await page.getByLabel("Phụ đề", { exact: true }).check();
  await page
    .getByRole("button", { name: "Trở lại căn phòng", exact: true })
    .click();
  await expect(page.locator(".cinematic")).toHaveAttribute(
    "data-beat",
    "complete",
    { timeout: 35000 },
  );
  await expect(page.getByText(/FOUNDER|Nhà sáng lập/)).toHaveCount(0);
});
