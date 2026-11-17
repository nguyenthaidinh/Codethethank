import { expect, test, type Page } from "@playwright/test";
import { freshSlice, SLICE_KEY } from "../../src/cinematic/director";
import { freshChapter } from "../../src/chapter/director";
import { classroomReview } from "../../src/verdict/state";
import { TEACHER_ENTRANCE } from "../../src/cinematic/TeacherEntrance";
import {
  defaultPreferences,
  PREFERENCES_KEY,
} from "../../src/menu/preferences";

const state = async (page: Page) =>
  JSON.parse(
    (await page.getByTestId("chapter-telemetry").textContent()) ?? "{}",
  );

async function freezeAt(page: Page, at: number, phase = "reaction") {
  await page.evaluate(
    ({ at, phase }) =>
      new Promise<void>((resolve) => {
        const freeze = () => {
          const snapshot = JSON.parse(
            document.querySelector('[data-testid="chapter-telemetry"]')
              ?.textContent ?? "{}",
          );
          if (snapshot.verdict?.phase === phase && snapshot.time >= at) {
            document
              .querySelector<HTMLButtonElement>(
                'button[aria-label="Tạm dừng"]',
              )!
              .click();
            resolve();
          } else requestAnimationFrame(freeze);
        };
        freeze();
      }),
    { at, phase },
  );
}

for (const mobile of [false, true]) {
  test(`An strikes the desk once, settles, then hears her greeting: ${mobile ? "mobile" : "desktop"}`, async ({
    page,
  }, testInfo) => {
    test.setTimeout(90000);
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (
        message.type() === "error" &&
        message.text().includes("THREE.WebGLProgram")
      )
        errors.push(message.text());
    });
    await page.setViewportSize(
      mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 },
    );
    await page.addInitScript(
      ({ saveKey, prefsKey, save, prefs }) => {
        localStorage.setItem(saveKey, JSON.stringify(save));
        localStorage.setItem(prefsKey, JSON.stringify(prefs));
      },
      {
        saveKey: SLICE_KEY,
        prefsKey: PREFERENCES_KEY,
        prefs: { ...defaultPreferences, muted: false },
        save: {
          ...freshSlice,
          muted: false,
          beat: "explore",
          chapter: {
            ...freshChapter,
            beat: "NEXT_SCENE_READY",
            signal: true,
            evidence: ["laptop"],
            verdict: {
              ...classroomReview,
              selected: "an",
              tested: ["student07"],
              phase: "choose",
            },
          },
        },
      },
    );
    await page.goto("/");
    await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
    await page
      .getByRole("button", { name: "↵ Chạy đánh giá", exact: true })
      .click();
    await expect(page.locator(".chapter")).toHaveAttribute(
      "data-verdict",
      "reaction",
    );
    // Freeze inside the page so an automation round trip cannot miss the brief lift.
    await freezeAt(page, 8.3);
    const raised = await state(page);
    expect(raised.world.shot).toBe("an.setback");
    expect(
      raised.world.anHand[1],
      `lift sampled at ${raised.time}s`,
    ).toBeGreaterThan(1.1);
    expect(raised.world.teacherVisible).toBe(false);
    expect(raised.world.portraits.an.visible).toBe(true);
    await page.screenshot({
      path: testInfo.outputPath("an-raises-his-hand.png"),
      style: ".pause-screen { visibility: hidden !important; }",
    });
    await page
      .getByRole("button", { name: "Tiếp tục quan sát", exact: true })
      .click();
    await expect
      .poll(async () => (await state(page)).time, {
        timeout: 6000,
        intervals: [50],
      })
      .toBeGreaterThan(10.3);
    await page.getByRole("button", { name: "Tạm dừng", exact: true }).click();
    const hit = await state(page);
    expect(hit.world.anHand[1]).toBeLessThan(1.04);
    expect(hit.world.teacherVisible).toBe(false);
    expect(hit.world.doorRotation).toBe(0);
    expect(
      hit.audio.events.filter((event: { cue: string }) => event.cue === "desk"),
    ).toHaveLength(1);
    await page
      .getByRole("button", { name: "Tiếp tục quan sát", exact: true })
      .click();
    await expect(page.locator(".subtitle")).toContainText("chỉ còn tiếng mưa", {
      timeout: 5000,
    });
    await freezeAt(page, 12.4);
    const sad = await state(page);
    expect(sad.world.anHead).toBeGreaterThan(0.35);
    expect(sad.world.anBodyLean).toBeGreaterThan(0.22);
    for (const y of sad.world.anFeetY) expect(Math.abs(y)).toBeLessThan(0.002);
    expect(sad.world.teacherVisible).toBe(false);
    expect(sad.world.doorRotation).toBe(0);
    await page.screenshot({
      path: testInfo.outputPath("an-lowers-his-head-in-silence.png"),
      style: ".pause-screen { visibility: hidden !important; }",
    });
    await page.evaluate(() => {
      const samples: { time: number; camera: number[]; target: number[] }[] =
        [];
      Object.assign(window, { doorPanSamples: samples });
      const timer = setInterval(() => {
        const s = JSON.parse(
          document.querySelector('[data-testid="chapter-telemetry"]')
            ?.textContent ?? "{}",
        );
        if (s.verdict?.phase === "teacher_enter") {
          if (samples.at(-1)?.time !== s.time)
            samples.push({
              time: s.time,
              camera: s.world.camera,
              target: s.world.target,
            });
          if (s.time > 3.5) clearInterval(timer);
        }
      }, 30);
    });
    await page
      .getByRole("button", { name: "Tiếp tục quan sát", exact: true })
      .click();
    await expect(page.locator(".chapter")).toHaveAttribute(
      "data-verdict",
      "teacher_enter",
      { timeout: 8000 },
    );
    expect((await state(page)).world.anHead).toBeGreaterThan(0.35);
    await freezeAt(page, TEACHER_ENTRANCE.lead * 0.55, "teacher_enter");
    const pan = await state(page);
    expect(
      Math.hypot(
        ...pan.world.camera.map(
          (v: number, i: number) => v - sad.world.camera[i],
        ),
      ),
    ).toBeGreaterThan(0.5);
    expect(pan.world.doorRotation).toBe(0);
    await page.screenshot({
      path: testInfo.outputPath("an-to-door-pan.png"),
      style: ".pause-screen { visibility: hidden !important; }",
    });
    await page
      .getByRole("button", { name: "Tiếp tục quan sát", exact: true })
      .click();
    await freezeAt(page, TEACHER_ENTRANCE.lead + 0.1, "teacher_enter");
    const doorway = await state(page);
    expect(doorway.world.doorRotation).toBe(0);
    expect(doorway.world.weather.backgroundLoaded).toBe(true);
    expect(doorway.world.weather.streaks).toBeGreaterThan(500);
    const samples = await page.evaluate(
      () =>
        (
          window as unknown as {
            doorPanSamples: {
              time: number;
              camera: number[];
              target: number[];
            }[];
          }
        ).doorPanSamples,
    );
    expect(samples.length).toBeGreaterThan(10);
    expect(
      Math.hypot(...samples[0].camera.map((v, i) => v - sad.world.camera[i])),
    ).toBeLessThan(0.4);
    for (let i = 1; i < samples.length; i++) {
      const dt = samples[i].time - samples[i - 1].time;
      expect(
        Math.hypot(
          ...samples[i].camera.map((v, k) => v - samples[i - 1].camera[k]),
        ),
      ).toBeLessThan(dt * 3 + 0.08);
    }
    await page.waitForTimeout(400);
    expect((await state(page)).world.weather.time).toBeCloseTo(
      doorway.world.weather.time,
      3,
    );
    await page
      .getByRole("button", { name: "Tiếp tục quan sát", exact: true })
      .click();
    await freezeAt(page, TEACHER_ENTRANCE.lead + 1.45, "teacher_enter");
    await page.screenshot({
      path: testInfo.outputPath("rainy-courtyard-through-door.png"),
      style: ".pause-screen { visibility: hidden !important; }",
    });
    await page
      .getByRole("button", { name: "Tiếp tục quan sát", exact: true })
      .click();
    await expect(page.locator(".subtitle")).toContainText(
      "Em vẫn chưa về sao",
      { timeout: 15000 },
    );
    await page.screenshot({
      path: testInfo.outputPath("teacher-sees-the-light.png"),
    });
    await expect(page.locator(".subtitle")).toContainText(
      "Có chỗ nào chưa làm được",
      { timeout: 6500 },
    );
    await expect(
      page.getByRole("region", { name: "Chọn lời đáp của An" }),
    ).toBeVisible({ timeout: 6500 });
    expect(
      (await state(page)).audio.events.filter(
        (event: { cue: string }) => event.cue === "desk",
      ),
    ).toHaveLength(1);
    expect(errors).toEqual([]);
    await page.goto("about:blank");
  });
}
