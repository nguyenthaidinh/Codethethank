import { test, expect } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { solveLab2035 } from "./helpers/lab2035";
const out = process.env.GAME_PROOF_OUT ?? "docs/final-act-proof";
mkdirSync(out, { recursive: true });
test.setTimeout(600000);
test("Full game from real menu to completed gratitude ending without checkpoints", async ({
  page,
}) => {
  const errors: string[] = [];
  const failedVoice: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("response", (r) => {
    if (r.url().includes("/voice/vi/") && !r.ok()) failedVoice.push(r.url());
  });
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.addInitScript(() => {
    const original = AudioContext.prototype.createMediaStreamDestination;
    AudioContext.prototype.createMediaStreamDestination = function () {
      const d = original.call(this);
      Object.assign(window, { finalAudio: d.stream });
      return d;
    };
  });
  const click = async (name: string) =>
    page.getByRole("button", { name, exact: true }).click({ timeout: 20000 });
  const attr = async (name: string, value: string, timeout = 45000) =>
    expect(page.locator(".chapter")).toHaveAttribute(name, value, { timeout });
  const wait = async () => page.waitForTimeout(1600);
  await page.goto("/");
  await click("Bật âm thanh");
  await click("Bắt đầu hành trình");
  await click("Bỏ qua cinematic");
  await click("Khám phá tín hiệu");
  await click("Kiểm tra nguyên tắc HUMAN REVIEW");
  await click("Truy dấu nguồn gốc năm 2026");
  await page
    .getByRole("button", { name: "Chạm để mở hồ sơ 2026", exact: false })
    .click();
  await attr("data-chapter", "CLASSROOM_ESTABLISHING");
  await expect(page.locator(".world-hotspot")).toHaveCount(0);
  await attr("data-verdict", "review");
  await click("Xem hồ sơ AN");
  await page
    .getByRole("button", { name: "Thử lại với hồ sơ AN", exact: false })
    .click();
  await click("↵ Chạy đánh giá");
  await attr("data-verdict", "teacher_enter");
  await attr("data-stayed", "discussion");
  for (let steps = 0; steps < 60; steps++) {
    if (
      (await page.locator(".chapter").getAttribute("data-stayed")) ===
      "notebook"
    )
      break;
    const choices = page.getByRole("region", { name: "Chọn lời đáp của An" });
    const next = page.getByRole("button", { name: "Tiếp lời", exact: false });
    if (await choices.isVisible())
      await choices.getByRole("button").first().click();
    else if (await next.isVisible()) await next.click();
    else await page.waitForTimeout(500);
  }
  await attr("data-stayed", "notebook", 120000);
  await click("Xem ghi chú về kết quả");
  await wait();
  await click("Xem ghi chú về nhu cầu");
  await attr("data-stayed", "unwritten");
  await click("Khôi phục dòng ghi chú");
  await attr("data-stayed", "next");
  await click("Quan sát trang phác thảo");
  await click("Nối hai câu hỏi");
  await page.evaluate(() =>
    Object.assign(window, {
      journeyCanvas: document.querySelector(".chapter-room"),
    }),
  );
  await click("Ai dễ tiến bộ nhất?");
  await click("Ai còn cần cơ hội?");
  await click("Khôi phục HUMAN REVIEW");
  for (const name of [
    "Mở nhật ký thử nghiệm",
    "Bắt đầu thử nghiệm",
    "Mở sổ kiểm thử trước ra mắt",
  ]) {
    await attr("data-ripple", "years");
    await click(name);
    if (name === "Bắt đầu thử nghiệm") await solveLab2035(page);
  }
  await attr("data-ripple", "record");
  await click("Đối chiếu hồ sơ nhà sáng lập");
  await attr("data-ripple", "reconstruct", 65000);
  for (const name of [
    "Chạm hồ sơ đánh giá 2026",
    "Chạm chiếc ghế được giữ lại",
    "Chạm cuốn sổ thiết kế",
  ])
    await click(name);
  await click("Khớp ba ký ức");
  await attr("data-ripple", "finale");
  await click("Chạm tờ giấy trắng");
  await attr("data-finale", "paper");
  await click("Chạm tờ giấy để viết");
  await click("Gợi ý 1");
  await page.locator("#recipient").fill("Người đã ngồi lại");
  await click("Đọc lại lời cảm ơn");
  await page.evaluate(() => {
    const w = window as unknown as {
      finalAudio: MediaStream;
      record: MediaRecorder;
      chunks: Blob[];
    };
    const stream = (
      document.querySelector(".chapter-room") as HTMLCanvasElement
    ).captureStream(24);
    w.finalAudio.getAudioTracks().forEach((t) => stream.addTrack(t.clone()));
    w.chunks = [];
    w.record = new MediaRecorder(stream, {
      mimeType: "video/webm;codecs=vp8,opus",
      videoBitsPerSecond: 1800000,
    });
    w.record.ondataavailable = (e) => w.chunks.push(e.data);
    w.record.start(1000);
  });
  await click("Tạo ngôi sao riêng tư");
  await attr("data-finale", "galaxy");
  await click("Nhìn gần ngôi sao của tôi");
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${out}/full-game-galaxy.png` });
  await click("Đi tiếp cùng ánh sáng");
  await attr("data-finale", "ending");
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${out}/full-game-ending.png` });
  const data = await page.evaluate(async () => {
    const w = window as unknown as { record: MediaRecorder; chunks: Blob[] };
    await new Promise<void>((resolve) => {
      w.record.onstop = () => resolve();
      w.record.stop();
    });
    return Array.from(new Uint8Array(await new Blob(w.chunks).arrayBuffer()));
  });
  writeFileSync(`${out}/finale-live-audio.webm`, Buffer.from(data));
  const state = JSON.parse(
    (await page.getByTestId("chapter-telemetry").textContent()) ?? "{}",
  );
  expect(state.finale.completed).toBe(true);
  expect(state.voice.status).toBe("off");
  expect(state.voice.busy).toBe(false);
  expect(failedVoice).toEqual([]);
  expect(state.verdict.tested).toContain("an");
  expect(state.stayed.written).toBe(true);
  expect(state.ripple.milestones).toBe(3);
  expect(state.ripple.memories).toHaveLength(3);
  expect(
    state.audio.events.filter((e: { cue: string }) => e.cue === "finale.star"),
  ).toHaveLength(1);
  expect(errors).toEqual([]);
  expect(
    await page.evaluate(
      () =>
        document.querySelector(".chapter-room") ===
        (window as unknown as { journeyCanvas: Element }).journeyCanvas,
    ),
  ).toBe(true);
  expect(
    await page.evaluate(
      () => performance.getEntriesByType("navigation").length,
    ),
  ).toBe(1);
  writeFileSync(
    `${out}/full-game-telemetry.json`,
    JSON.stringify(state, null, 2),
  );
  await click("Credits");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.screenshot({ path: `${out}/full-game-credits.png` });
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await attr("data-finale", "ending");
  expect(errors).toEqual([]);
});
