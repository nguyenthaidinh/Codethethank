import { expect, test } from "@playwright/test";
import { SLICE_KEY } from "../../src/cinematic/director";
import {
  defaultPreferences,
  PREFERENCES_KEY,
} from "../../src/menu/preferences";
import { finaleReady } from "../fixtures/finaleReady";

test("AION speaks over the 2046 camera and archive with synced subtitles", async ({
  page,
}) => {
  test.setTimeout(90000);
  const errors: string[] = [];
  const requests: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (request) => {
    if (request.url().includes("/voice/")) requests.push(request.url());
  });
  await page.addInitScript(
    ({ key, save, prefsKey, prefs }) => {
      localStorage.setItem(key, JSON.stringify(save));
      localStorage.setItem(prefsKey, JSON.stringify(prefs));
      const suspendAudio = AudioContext.prototype.suspend;
      AudioContext.prototype.suspend = async function () {
        await suspendAudio.call(this);
        document.documentElement.dataset.aionAudioState = this.state;
      };
      const getContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (
        this: HTMLCanvasElement,
        ...args: Parameters<typeof getContext>
      ) {
        return String(args[0]).includes("webgl")
          ? null
          : getContext.apply(this, args);
      } as typeof getContext;
    },
    {
      key: SLICE_KEY,
      prefsKey: PREFERENCES_KEY,
      prefs: { ...defaultPreferences, muted: false },
      save: {
        ...finaleReady,
        chapter: {
          ...finaleReady.chapter,
          verdict: {
            ...finaleReady.chapter!.verdict,
            ripple: {
              ...finaleReady.chapter!.verdict!.ripple,
              phase: "world",
              elapsed: 4,
              played: [],
              memories: [],
            },
          },
        },
      },
    },
  );
  await page.goto("/");
  await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
  const telemetry = async () =>
    JSON.parse((await page.getByTestId("chapter-telemetry").textContent())!);
  const speaks = async (clip: string) => {
    await expect
      .poll(
        async () => {
          const { voice, audio } = await telemetry();
          return [voice?.status, voice?.clip, audio?.context];
        },
        { timeout: 16000 },
      )
      .toEqual(["speaking", `voice/aion-2046/${clip}.mp3`, "running"]);
  };
  await speaks("arrival");
  await expect(page.locator(".subtitle")).toContainText("Tôi là AION.");
  await page.getByRole("button", { name: "Tạm dừng", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute(
    "data-aion-audio-state",
    "suspended",
  );
  const before = (await telemetry()).voice.started;
  await page
    .getByRole("button", { name: "Tiếp tục quan sát", exact: true })
    .click();
  await speaks("arrival");
  expect((await telemetry()).voice.started).toBe(before);
  await speaks("notebook");
  await expect(page.locator(".subtitle")).toContainText("cuốn sổ năm ấy");
  await page.getByRole("button", { name: "Tắt âm thanh", exact: true }).click();
  await expect.poll(async () => (await telemetry()).voice.status).toBe("off");
  await expect(page.locator(".subtitle")).toContainText("cuốn sổ năm ấy");
  await page.getByRole("button", { name: "Bật âm thanh", exact: true }).click();
  await speaks("archive");
  await expect(page.locator(".subtitle")).toContainText("Hãy mở hồ sơ");
  await page
    .getByRole("button", { name: "Đối chiếu hồ sơ nhà sáng lập", exact: true })
    .click();
  await speaks("compare");
  await expect(page.locator(".subtitle")).toContainText("Một bản đánh giá cũ");
  await speaks("match");
  expect(
    requests.every((request) => request.includes("/voice/aion-2046/")),
  ).toBe(true);
  expect(requests.some((request) => request.endsWith("/founder.mp3"))).toBe(
    false,
  );
  await speaks("founder");
  await expect(page.locator(".subtitle")).toContainText(
    "Người đó chính là An.",
  );
  expect(errors).toEqual([]);
  await page.goto("about:blank");
});

test("the chair flashback shows its 2026 title and plays the AION line before returning to 2046", async ({
  page,
}, info) => {
  test.setTimeout(90000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1366, height: 768 });
  const save = structuredClone(finaleReady);
  Object.assign(save.chapter!.verdict!.ripple!, {
    phase: "approach",
    elapsed: 5,
    memories: [],
    played: ["reveal.music"],
  });
  await page.addInitScript(
    ({ save, key, prefs, prefsKey }) => {
      localStorage.setItem(key, JSON.stringify(save));
      localStorage.setItem(prefsKey, JSON.stringify(prefs));
    },
    {
      save,
      key: SLICE_KEY,
      prefsKey: PREFERENCES_KEY,
      prefs: {
        ...defaultPreferences,
        muted: false,
        captions: true,
        voice: true,
      },
    },
  );
  await page.goto("/");
  await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
  const chapter = page.locator(".chapter");
  const classroom = chapter.locator(".chapter-room");
  await expect(chapter).toHaveAttribute("data-ripple", "echo", {
    timeout: 18000,
  });
  await expect(page.locator(".chair-memory-title")).toContainText("HỒI ỨC");
  await expect(
    page.getByRole("heading", { name: "2026", exact: true }),
  ).toBeInViewport();
  await expect(classroom).toHaveCSS("filter", /grayscale\(1\)/);
  await expect(page.locator(".subtitle")).toContainText(
    "Ngày xưa, cô Vân cũng kéo ghế",
  );
  const voice = async () =>
    JSON.parse((await page.getByTestId("chapter-telemetry").textContent())!)
      .voice;
  await expect.poll(async () => (await voice())?.status).toBe("speaking");
  expect((await voice()).clip).toBe("voice/aion-2046/chair-memory.mp3");
  await page.screenshot({ path: info.outputPath("hoi-uc-2026.png") });
  await expect(chapter).toHaveAttribute("data-ripple", "chair", {
    timeout: 18000,
  });
  await expect(page.locator(".chair-memory-title")).toHaveCount(0);
  await expect(page.locator(".future2046")).toBeVisible();
  await expect
    .poll(
      () =>
        chapter.evaluate((element) => {
          const grade = Number(
            element.style.getPropertyValue("--chair-memory"),
          );
          return element.dataset.ripple === "chair" && grade > 0 && grade < 1;
        }),
      { intervals: [80, 120, 250], timeout: 6000 },
    )
    .toBe(true);
  await page.screenshot({ path: info.outputPath("mau-dang-tro-lai.png") });
  await expect(chapter).toHaveCSS("--chair-memory", "0");
  await expect(classroom).toHaveCSS("filter", /grayscale\(0\)/);
  await page.screenshot({ path: info.outputPath("tro-ve-2046.png") });
  expect(errors).toEqual([]);
});
