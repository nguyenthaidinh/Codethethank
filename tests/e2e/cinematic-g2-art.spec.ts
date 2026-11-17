import { test, expect, type Page } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { freshSlice, SLICE_KEY } from "../../src/cinematic/director";
import { freshVerdict } from "../../src/verdict/state";
import { freshStay } from "../../src/stayed/state";

const phase = process.env.ART_CAPTURE_PHASE ?? "baseline";
const out = process.env.ART_CAPTURE_OUT ?? `docs/art/proof/${phase}/runtime`;
mkdirSync(out, { recursive: true });
test.setTimeout(260000);
const telemetry = async (page: Page) =>
  JSON.parse(
    (await page.getByTestId("chapter-telemetry").textContent()) ?? "{}",
  );
async function shot(page: Page, name: string) {
  await page.mouse.move(0, 0);
  await page.screenshot({ path: `${out}/${name}.png` });
  writeFileSync(
    `${out}/${name}.json`,
    JSON.stringify(await telemetry(page), null, 2),
  );
}
test("G2 hero real menu, rain, verdict, teacher, chair and notebook", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.addInitScript(() => {
    const original = AudioContext.prototype.createMediaStreamDestination;
    AudioContext.prototype.createMediaStreamDestination = function () {
      const destination = original.call(this);
      Object.assign(window, { heroAudio: destination.stream });
      return destination;
    };
  });
  const click = async (name: string) =>
    page.getByRole("button", { name, exact: true }).click();
  const attr = async (name: string, value: string, timeout = 45000) =>
    expect(page.locator(".chapter")).toHaveAttribute(name, value, { timeout });
  const settle = async () => page.waitForTimeout(1850);
  const back = async () => {
    await page
      .getByRole("button", { name: "Nhìn lại căn phòng", exact: false })
      .click();
    await settle();
  };
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
  await attr("data-chapter", "CLASSROOM_EXPLORATION");
  await settle();
  await shot(page, "01-classroom-wide");
  const graphicsHost = await page.evaluate(() => {
    const canvas = document.querySelector(".chapter-room") as HTMLCanvasElement;
    const gl = canvas.getContext("webgl2");
    const debug = gl?.getExtension("WEBGL_debug_renderer_info");
    return {
      userAgent: navigator.userAgent,
      viewport: [innerWidth, innerHeight],
      canvas: [canvas.width, canvas.height],
      renderer:
        debug && gl
          ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL)
          : "unavailable",
      maxTextureSize: gl?.getParameter(gl.MAX_TEXTURE_SIZE),
    };
  });
  writeFileSync(
    `${out}/graphics-host.json`,
    JSON.stringify(graphicsHost, null, 2),
  );
  const frameIntervals = await page.evaluate(async () => {
    const samples: number[] = [];
    let last = performance.now();
    await new Promise<void>((resolve) => {
      const tick = (now: number) => {
        samples.push(now - last);
        last = now;
        if (samples.length < 48) requestAnimationFrame(tick);
        else resolve();
      };
      requestAnimationFrame(tick);
    });
    return samples.slice(1);
  });
  writeFileSync(
    `${out}/headless-frame-intervals.json`,
    JSON.stringify(
      {
        note: "Chromium automation host wall-clock rAF intervals; not real-device FPS or GPU timing",
        samplesMs: frameIntervals,
      },
      null,
      2,
    ),
  );
  await click("Nhìn qua cửa sổ");
  await settle();
  await shot(page, "02-rain-window");
  await back();
  for (const name of ["Nhìn đồng hồ", "Đọc tài liệu thuyết trình"]) {
    await click(name);
    await settle();
    await back();
  }
  await click("Quan sát laptop");
  await settle();
  await shot(page, "03-an-workspace");
  await page
    .getByRole("button", { name: "Chuẩn bị kiểm thử", exact: false })
    .click();
  await attr("data-verdict", "investigate");
  for (const name of [
    "Đọc bản thuyết trình",
    "Đọc sổ thiết kế",
    "Xem dữ liệu thử nghiệm",
  ]) {
    await click(name);
    await settle();
  }
  await click("Mở mô hình thử nghiệm");
  await click("Chọn hồ sơ STUDENT 07");
  await click("↵ Chạy đánh giá");
  await attr("data-verdict", "result");
  await click("Thử một hồ sơ khác trên laptop");
  await click("Chọn hồ sơ AN");
  await click("↵ Chạy đánh giá");
  await attr("data-verdict", "connect");
  for (const name of ["Đọc bản thuyết trình", "Đọc sổ thiết kế"]) {
    await click(name);
    await settle();
    if (name === "Đọc sổ thiết kế") {
      await page.evaluate(() => {
        const w = window as unknown as {
          heroAudio: MediaStream;
          heroRecorder: MediaRecorder;
          heroChunks: Blob[];
        };
        const stream = (
          document.querySelector(".chapter-room") as HTMLCanvasElement
        ).captureStream(24);
        w.heroAudio
          .getAudioTracks()
          .forEach((track) => stream.addTrack(track.clone()));
        w.heroChunks = [];
        w.heroRecorder = new MediaRecorder(stream, {
          mimeType: "video/webm;codecs=vp8,opus",
          videoBitsPerSecond: 2200000,
        });
        w.heroRecorder.ondataavailable = (event) =>
          w.heroChunks.push(event.data);
        w.heroRecorder.start(1000);
        Object.assign(window, {
          heroCanvas: document.querySelector(".chapter-room"),
        });
      });
    }
    await page
      .getByRole("button", { name: /^Đối chiếu .* với kết quả$/ })
      .click();
  }
  await attr("data-verdict", "teacher_enter");
  await page.waitForTimeout(2300);
  await shot(page, "04-teacher-entrance");
  await attr("data-stayed", "chair");
  await page.waitForTimeout(3200);
  await shot(page, "05-chair-cinematic");
  await attr("data-stayed", "notebook");
  await click("Xem ghi chú về kết quả");
  await settle();
  await shot(page, "06-notebook");
  const movieDownload = page.waitForEvent("download");
  await page.evaluate(async () => {
    const w = window as unknown as {
      heroRecorder: MediaRecorder;
      heroChunks: Blob[];
    };
    await new Promise<void>((resolve) => {
      w.heroRecorder.onstop = () => resolve();
      w.heroRecorder.stop();
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(
      new Blob(w.heroChunks, { type: "video/webm" }),
    );
    link.download = "hero-live-audio.webm";
    link.click();
    Object.assign(window, { heroDownloadURL: link.href });
  });
  await (
    await movieDownload
  ).saveAs(`${out}/teacher-chair-notebook-live-audio.webm`);
  await page.evaluate(() =>
    URL.revokeObjectURL(
      (window as unknown as { heroDownloadURL: string }).heroDownloadURL,
    ),
  );
  await click("Xem ghi chú về nhu cầu");
  await attr("data-stayed", "unwritten");
  await click("Khôi phục dòng ghi chú");
  await attr("data-stayed", "next");
  await click("Quan sát trang phác thảo");
  const final = await telemetry(page);
  expect(final.stayed.written).toBe(true);
  expect(final.stayed.nextInspected).toBe(true);
  for (const y of [...final.world.anFeetY, ...final.world.teacherFeetY])
    expect(Math.abs(y)).toBeLessThan(0.015);
  expect(
    final.audio.events.filter((e: { cue: string }) => e.cue === "chair"),
  ).toHaveLength(1);
  expect(
    await page.evaluate(
      () =>
        document.querySelector(".chapter-room") ===
        (window as unknown as { heroCanvas: Element }).heroCanvas,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
  writeFileSync(
    `${out}/desktop-complete.json`,
    JSON.stringify({ ...final, errors }, null, 2),
  );
});

for (const fallback of [false, true]) {
  test(`G2 hero ${fallback ? "fallback keyboard" : "mobile touch reduced mute resume"}`, async ({
    browser,
  }) => {
    const context = await browser.newContext({
      viewport: fallback
        ? { width: 1280, height: 720 }
        : { width: 390, height: 844 },
      hasTouch: !fallback,
      isMobile: !fallback,
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    if (fallback)
      await page.addInitScript(() => {
        const original = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function (
          this: HTMLCanvasElement,
          ...args: Parameters<typeof original>
        ) {
          return String(args[0]).includes("webgl")
            ? null
            : original.apply(this, args);
        } as typeof original;
      });
    await page.goto("/");
    await page.evaluate(
      ({ key, save }) => localStorage.setItem(key, JSON.stringify(save)),
      {
        key: SLICE_KEY,
        save: {
          ...freshSlice,
          reduced: true,
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
    await page.reload();
    const activate = async (name: string) => {
      const button = page.getByRole("button", { name, exact: true });
      if (fallback) {
        await button.focus();
        await page.keyboard.press("Enter");
      } else await button.tap();
    };
    await activate("Tiếp tục");
    if (fallback)
      await expect(page.locator(".runtime-status")).toContainText("Đồ họa 2D");
    await activate("Xem ghi chú về kết quả");
    await page.waitForTimeout(2000);
    await shot(page, fallback ? "08-fallback-notebook" : "07-mobile-notebook");
    await page.reload();
    await activate("Tiếp tục");
    expect((await telemetry(page)).stayed.read).toEqual(["outcome"]);
    await activate("Xem ghi chú về nhu cầu");
    await expect(page.locator(".chapter")).toHaveAttribute(
      "data-stayed",
      "unwritten",
      { timeout: 40000 },
    );
    await activate("Khôi phục dòng ghi chú");
    await expect(page.locator(".chapter")).toHaveAttribute(
      "data-stayed",
      "next",
      { timeout: 30000 },
    );
    expect((await telemetry(page)).audio).toBeNull();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth === innerWidth,
      ),
    ).toBe(true);
    await context.close();
  });
}

test("G2 hero narrative direction uses the same playable classroom", async ({
  page,
}) => {
  test.skip(
    phase === "baseline",
    "Art comparison is implemented after the source baseline is frozen",
  );
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/?narrative=blue-ink");
  await page.evaluate(
    ({ key, save }) => localStorage.setItem(key, JSON.stringify(save)),
    {
      key: SLICE_KEY,
      save: {
        ...freshSlice,
        beat: "explore",
        chapter: {
          version: 1,
          beat: "CLASSROOM_EXPLORATION",
          signal: true,
          evidence: [],
        },
      },
    },
  );
  await page.reload();
  await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
  await expect(page.locator(".chapter")).toHaveAttribute(
    "data-chapter",
    "CLASSROOM_EXPLORATION",
  );
  await page.waitForTimeout(2200);
  await shot(page, "proposal-blue-ink-wide");
  expect((await telemetry(page)).world.artDirection).toBe("blue-ink");
  expect((await telemetry(page)).world.characterArt).toBe(
    "sculpted-narrative-v1",
  );
  await page
    .getByRole("button", { name: "Nhìn qua cửa sổ", exact: true })
    .click();
  await page.waitForTimeout(1850);
  await shot(page, "proposal-blue-ink-window");
});

test("G2 hero renderer budget and shader diagnostics", async ({ page }) => {
  test.skip(
    phase === "baseline",
    "New renderer measurement after preserved baseline",
  );
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/");
  await page.evaluate(
    ({ key, save }) => localStorage.setItem(key, JSON.stringify(save)),
    {
      key: SLICE_KEY,
      save: {
        ...freshSlice,
        beat: "explore",
        chapter: {
          version: 1,
          beat: "CLASSROOM_EXPLORATION",
          signal: true,
          evidence: [],
        },
      },
    },
  );
  await page.reload();
  await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
  await expect(page.locator(".chapter")).toHaveAttribute(
    "data-chapter",
    "CLASSROOM_EXPLORATION",
  );
  await page.waitForTimeout(3000);
  const intervals = await page.evaluate(async () => {
    const values: number[] = [];
    let last = performance.now();
    await new Promise<void>((resolve) => {
      const frame = (now: number) => {
        values.push(now - last);
        last = now;
        if (values.length < 25) requestAnimationFrame(frame);
        else resolve();
      };
      requestAnimationFrame(frame);
    });
    return values.slice(1);
  });
  const state = await telemetry(page);
  await page.screenshot({ path: `${out}/renderer-probe.png` });
  writeFileSync(
    `${out}/renderer-budget.json`,
    JSON.stringify(
      { world: state.world, intervalsMs: intervals, errors },
      null,
      2,
    ),
  );
  expect(state.world.drawCalls).toBeLessThan(175);
  expect(state.world.triangles).toBeGreaterThan(1000);
  expect(state.world.resources.textures).toBeLessThan(40);
  for (const y of state.world.anFeetY) expect(Math.abs(y)).toBeLessThan(0.015);
  expect(errors).toEqual([]);
});
