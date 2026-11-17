import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";
test.setTimeout(150000);
test("proof of feel: real camera, spatial audio, teacher, chair, verdict and recorded audio", async ({
  page,
}) => {
  mkdirSync("docs/proof-of-feel", { recursive: true });
  await page.setViewportSize({ width: 1280, height: 720 });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/?record=1&qa=1");
  await page
    .getByRole("button", { name: "Bước vào căn phòng", exact: false })
    .click();
  await expect(page.locator(".cinematic")).toHaveAttribute(
    "data-beat",
    "explore",
    { timeout: 20000 },
  );
  await page.screenshot({ path: "docs/proof-of-feel/01-room-desktop.png" });
  await page
    .getByRole("button", { name: "Nhìn mưa ngoài cửa sổ", exact: true })
    .click();
  await page.waitForTimeout(3000);
  let telemetry = JSON.parse(
    (await page.getByTestId("telemetry").textContent()) ?? "{}",
  );
  expect(telemetry.audio.mix.rain).toBe(0.38);
  await page.screenshot({ path: "docs/proof-of-feel/02-window.png" });
  await page
    .getByRole("button", { name: "Quan sát laptop", exact: true })
    .click();
  await page.waitForTimeout(3000);
  telemetry = JSON.parse(
    (await page.getByTestId("telemetry").textContent()) ?? "{}",
  );
  expect(telemetry.audio.mix.rain).toBe(0.14);
  await page.screenshot({ path: "docs/proof-of-feel/03-laptop.png" });
  await page
    .getByRole("button", { name: "Đọc bản báo cáo", exact: true })
    .click();
  await expect(page.locator(".cinematic")).toHaveAttribute(
    "data-beat",
    "chair",
    { timeout: 25000 },
  );
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "docs/proof-of-feel/04-chair.png" });
  await expect(page.locator(".cinematic")).toHaveAttribute(
    "data-beat",
    "profile",
    { timeout: 20000 },
  );
  await page
    .getByRole("button", { name: "Chọn hồ sơ An", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Chạy hồ sơ An trên laptop", exact: true })
    .click();
  await expect(page.locator(".cinematic")).toHaveAttribute(
    "data-beat",
    "verdict",
    { timeout: 10000 },
  );
  await page.waitForTimeout(1000);
  telemetry = JSON.parse(
    (await page.getByTestId("telemetry").textContent()) ?? "{}",
  );
  expect(telemetry.audio.mix.ambience).toBe(0.18);
  expect(telemetry.audio.mix.music).toBe(0);
  await page.screenshot({ path: "docs/proof-of-feel/05-verdict.png" });
  await expect(page.locator(".cinematic")).toHaveAttribute(
    "data-beat",
    "complete",
    { timeout: 45000 },
  );
  await page.screenshot({ path: "docs/proof-of-feel/06-stay.png" });
  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Tải bản ghi demo" })
    .click();
  await (
    await downloadPromise
  ).saveAs("docs/proof-of-feel/desktop-with-audio.webm");
  expect(errors).toEqual([]);
  telemetry = JSON.parse(
    (await page.getByTestId("telemetry").textContent()) ?? "{}",
  );
  expect(
    telemetry.audio.events.some((e: { cue: string }) => e.cue === "chair"),
  ).toBe(true);
  expect(telemetry.audio.events.filter((e:{cue:string})=>e.cue==='chair')).toHaveLength(1);
  expect(telemetry.audio.events.filter((e:{cue:string})=>e.cue==='verdict')).toHaveLength(1);
  console.log("CINEMATIC_TELEMETRY", JSON.stringify(telemetry));
});
