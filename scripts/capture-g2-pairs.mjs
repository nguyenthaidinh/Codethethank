import { chromium, expect } from "@playwright/test";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";

// Screenshot metrology only: validated Continue checkpoints in each real production build.
// Reduced motion makes both camera presets exact; normal moving gameplay is recorded separately.
const phase = process.argv[2];
const baseURL = process.argv[3];
if (!["baseline", "after"].includes(phase) || !baseURL) throw Error("Usage: capture-g2-pairs.mjs baseline|after URL");
const digest = buffer => createHash("sha256").update(buffer).digest("hex");
const buildHash = digest(readFileSync(phase === "baseline" ? "docs/art/proof/baseline/build/index.html" : "dist/index.html"));
expect(digest(Buffer.from(await (await fetch(baseURL)).arrayBuffer()))).toBe(buildHash);
const out = `docs/art/proof/${phase}/runtime`;
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ headless: true });
try {
  for (const chair of [false, true]) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, reducedMotion: "reduce" });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    const save = {
      version: 3, beat: "explore", observed: [], selected: false, focus: "door", reduced: true, muted: true,
      captions: true, volume: 0.65, music: true, sfx: true,
      chapter: {
        version: 1, beat: "NEXT_SCENE_READY", signal: true, evidence: ["clock", "notebook", "laptop"],
        verdict: {
          version: 1, phase: "chapter02",
          found: ["presentation", "notes", "data"], tested: ["mai", "an"], selected: "an", linked: ["presentation", "notes"], carried: null,
          stayed: { version: 1, phase: chair ? "chair" : "discussion", line: 0, read: [], page: null, written: false, seen: [], nextInspected: false },
        },
      },
    };
    await page.goto(baseURL);
    await page.evaluate(save => localStorage.setItem("project2011.cinematic.v3", JSON.stringify(save)), save);
    await page.reload();
    await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
    const state = async () => JSON.parse(await page.getByTestId("chapter-telemetry").textContent());
    await expect.poll(async () => (await state()).time, { timeout: 25000 }).toBeGreaterThanOrEqual(chair ? 3.2 : 1.2);
    const snapshot = await state();
    expect(snapshot.stayed.phase).toBe(chair ? "chair" : "discussion");
    expect(snapshot.world.focus).toBe(chair ? "chair_insert" : "teacher");
    const eye = chair ? [2.9, 0.48, 1.65] : [3.5, 1.8, -1.7];
    expect(Math.hypot(...eye.map((value, i) => value - snapshot.world.camera[i]))).toBeLessThan(0.001);
    // Freeze the browser debugger for metrology, without displaying the game's pause HUD.
    // CaptureScreenshot is the real composited browser frame; no pixels/objects are edited.
    const cdp = await context.newCDPSession(page);
    await cdp.send("Debugger.enable");
    const paused = new Promise(resolve => cdp.once("Debugger.paused", resolve));
    const freeze = cdp.send("Runtime.evaluate", { expression: "debugger;" });
    await paused;
    const capture = await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
    writeFileSync(`${out}/${chair ? "05-chair-cinematic" : "04-teacher-entrance"}-matched.png`, Buffer.from(capture.data, "base64"));
    await cdp.send("Debugger.resume");
    await freeze;
    await cdp.detach();
    writeFileSync(`${out}/${chair ? "05-chair-cinematic" : "04-teacher-entrance"}-matched.json`, JSON.stringify({ ...snapshot, captureMode: "reduced motion, validated Continue checkpoint, exact camera preset, debugger-frozen browser capture", errors }, null, 2));
    expect(errors).toEqual([]);
    await context.close();
  }
  // Same audio-enabled, warmed-up workload in each archived/current build.
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(baseURL);
  await page.evaluate(() => localStorage.setItem("project2011.cinematic.v3", JSON.stringify({
    version: 3, beat: "explore", observed: [], selected: false, focus: "wide", reduced: false, muted: false,
    captions: true, volume: 0.65, music: true, sfx: true,
    chapter: { version: 1, beat: "CLASSROOM_EXPLORATION", signal: true, evidence: [] },
  })));
  await page.reload();
  await page.getByRole("button", { name: "Bật âm thanh", exact: true }).click();
  await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
  await expect(page.locator(".chapter")).toHaveAttribute("data-chapter", "CLASSROOM_EXPLORATION");
  await page.waitForTimeout(10000);
  const framesMs = await page.evaluate(async () => {
    const values = []; let last = performance.now();
    await new Promise(resolve => {
      const frame = now => { values.push(now-last);last=now;if(values.length<48)requestAnimationFrame(frame);else resolve(); };
      requestAnimationFrame(frame);
    });
    return values.slice(1);
  });
  const snapshot = JSON.parse(await page.getByTestId("chapter-telemetry").textContent());
  expect(snapshot.audio.context).toBe("running");
  expect(errors).toEqual([]);
  writeFileSync(`${out}/warm-wide.json`, JSON.stringify({ note: "same validated classroom state, audio on, 10s warm-up; host rAF intervals, not GPU time/device FPS", world: snapshot.world, audioContext: snapshot.audio.context, framesMs, errors }, null, 2));
  await context.close();
} finally {
  await browser.close();
}
writeFileSync(`docs/art/proof/${phase}/matched-status.json`, JSON.stringify({ status: "passed", captures: 2, baseURL, buildHash, updated: new Date().toISOString() }, null, 2));
console.log(`${phase}: 2 matched in-game camera captures + audio-enabled warm probe PASS`);
