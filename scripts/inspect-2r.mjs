import { chromium, expect } from "@playwright/test";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import {createHash} from 'node:crypto';
const out = "docs/art2r/proof/after/runtime";
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ headless: true });
const baseURL = process.argv[2] ?? "http://127.0.0.1:5173/";
const servedIndexSHA256=createHash('sha256').update(Buffer.from(await (await fetch(baseURL)).arrayBuffer())).digest('hex').toUpperCase();
if(new URL(baseURL).port==='4173')expect(servedIndexSHA256).toBe(JSON.parse(readFileSync('docs/art2r/proof/after/production-hash.json','utf8').replace(/^\uFEFF/,'')).Hash);
const rootSave = { version: 3, beat: "explore", observed: [], selected: false, focus: "wide", reduced: true, muted: true, captions: true, volume: .65, music: true, sfx: true };
const verdict = { version: 1, phase: "chapter02", found: ["presentation", "notes", "data"], tested: ["mai", "an"], selected: "an", linked: ["presentation", "notes"], carried: null };
const stay = { version: 1, phase: "discussion", line: 0, read: [], page: null, written: false, seen: [], nextInspected: false };
const cases = [
  { name: "01-wide-paper-rain", mode: "paper-rain", scene: "explore", focus: "wide" },
  { name: "option-blue-ink", mode: "blue-ink", scene: "explore", focus: "wide" },
  { name: "option-copper-memory", mode: "copper-memory", scene: "explore", focus: "wide" },
  { name: "02-van", mode: "paper-rain", scene: "discussion", focus: "teacher" },
  { name: "03-an", mode: "paper-rain", scene: "question", line: 1, focus: "an" },
  { name: "04-chair", mode: "paper-rain", scene: "chair", wait: 3.2, focus: "chair_insert" },
  { name: "05-notebook", mode: "paper-rain", scene: "notebook", focus: "book" },
  { name: "06-mobile", mode: "paper-rain", scene: "explore", mobile: true, focus: "wide" },
  { name: "07-faces", mode: "paper-rain", scene: "question", line: 2, wait: .5, focus: "faces" },
  { name: "08-mobile-faces", mode: "paper-rain", scene: "question", line: 2, wait: .5, mobile: true, focus: "faces" },
];
try {
  for (const c of cases.filter(item => !process.argv[3] || item.name.includes(process.argv[3]))) {
    const context = await browser.newContext({ viewport: c.mobile ? { width: 390, height: 844 } : { width: 1280, height: 720 }, hasTouch: !!c.mobile, isMobile: !!c.mobile, reducedMotion: "reduce" });
    // Pause after an actual matching rendered frame; no game state/props/pixels are modified.
    // Moving gameplay video has no capture hook.
    await context.addInitScript(capture => {
      const original = window.requestAnimationFrame.bind(window);
      let captured = false;
      window.requestAnimationFrame = callback => original(now => {
        callback(now);
        if (captured) return;
        const node = document.querySelector('[data-testid="chapter-telemetry"]');
        if (!node) return;
        const state = JSON.parse(node.textContent);
        const phaseMatches = capture.scene === "explore" ? state.beat === "CLASSROOM_EXPLORATION" : state.stayed?.phase === capture.scene;
        const lineMatches = !["question", "discussion"].includes(capture.scene) || state.stayed?.line === (capture.line ?? 0);
        const readMatches = capture.scene !== "notebook" || state.stayed?.read.includes("outcome");
        if (phaseMatches && lineMatches && readMatches && state.world?.focus === capture.focus && state.time >= (capture.wait ?? 1.2)) {
          captured = true;
          setTimeout(() => { debugger; }, 0);
        }
      });
    }, c);
    const page = await context.newPage(), errors = [];
    page.on("pageerror", e => errors.push(e.message));
    page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
    const url = new URL(`?narrative=${c.mode}`, baseURL).href;
    await page.goto(url);
    const chapter = c.scene === "explore" ? { version: 1, beat: "CLASSROOM_EXPLORATION", signal: true, evidence: [] } : { version: 1, beat: "NEXT_SCENE_READY", signal: true, evidence: ["clock", "notebook", "laptop"], verdict: { ...verdict, stayed: { ...stay, phase: c.scene, line: c.line ?? 0 } } };
    await page.evaluate(save => localStorage.setItem("project2011.cinematic.v3", JSON.stringify(save)), { ...rootSave, chapter });
    await page.reload();
    const cdp = await context.newCDPSession(page);
    await cdp.send("Debugger.enable");
    const paused = new Promise(resolve => cdp.once("Debugger.paused", resolve));
    const click = page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
    let readClick;
    if (c.scene === "notebook") {
      await click;
      readClick = page.getByRole("button", { name: "Xem ghi chú về kết quả", exact: true }).click();
    }
    let deadline;
    const event = await Promise.race([paused, new Promise((_, reject) => { deadline = setTimeout(() => reject(Error(`Frame not reached: ${c.name}`)), 30000); })]);
    clearTimeout(deadline);
    const frozen = await cdp.send("Debugger.evaluateOnCallFrame", { callFrameId: event.callFrames[0].callFrameId, expression: `JSON.stringify({...JSON.parse(document.querySelector('[data-testid="chapter-telemetry"]').textContent),hotspots:[...document.querySelectorAll('.world-hotspot')].map(button=>({name:button.getAttribute('aria-label'),left:button.style.left,top:button.style.top,width:button.getBoundingClientRect().width,height:button.getBoundingClientRect().height}))})`, returnByValue: true });
    const snapshot = { ...JSON.parse(frozen.result.value), sourceURL: url, servedIndexSHA256, capture: "browser debugger after matching rendered frame; validated Continue; reduced motion" };
    const png = await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
    writeFileSync(`${out}/${c.name}.png`, Buffer.from(png.data, "base64"));
    await cdp.send("Debugger.resume");
    await click;
    if (readClick) await readClick;
    await cdp.detach();
    writeFileSync(`${out}/${c.name}.json`, JSON.stringify({ ...snapshot, errors }, null, 2));
    expect(errors).toEqual([]);
    expect(snapshot.world.focus).toBe(c.focus);
    if (c.line !== undefined) expect(snapshot.stayed.line).toBe(c.line);
    await context.close();
    console.log(c.name, "PASS");
  }
} finally { await browser.close(); }
