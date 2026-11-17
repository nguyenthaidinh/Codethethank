import { chromium, expect } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const out = resolve('docs/chair-cinematic-proof/runtime');
const framesDir = resolve('test-results/chair-cinematic-recording-frames');
mkdirSync(out, { recursive: true }); mkdirSync(framesDir, { recursive: true });
const save = {
  version: 3, beat: 'explore', observed: [], selected: false, focus: 'wide', reduced: false, muted: false, captions: true, voice: true, volume: .8, music: true, sfx: true,
  chapter: { version: 1, beat: 'NEXT_SCENE_READY', signal: true, evidence: ['clock', 'notebook', 'laptop'], verdict: { version: 1, phase: 'teacher_enter', found: ['presentation', 'notes', 'data'], selected: 'an', tested: ['mai', 'an'], linked: ['presentation', 'notes'], carried: null } },
};
const browser = await chromium.launch({ headless: true, args: process.platform === 'win32' ? ['--use-angle=d3d11'] : [] });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errors = []; page.on('pageerror', (e) => errors.push(e.message));
  await page.addInitScript(() => {
    const original = AudioContext.prototype.createMediaStreamDestination;
    AudioContext.prototype.createMediaStreamDestination = function () { const node = original.call(this); window.__voiceStream = node.stream; return node; };
  });
  await page.goto('http://127.0.0.1:4173/');
  await page.evaluate((s) => localStorage.setItem('project2011.cinematic.v3', JSON.stringify(s)), save);
  await page.reload();
  await page.getByRole('button', { name: 'Bật âm thanh', exact: true }).click();
  await page.getByRole('button', { name: 'Tiếp tục', exact: true }).click();
  const state = async () => JSON.parse(await page.getByTestId('chapter-telemetry').textContent());
  await expect.poll(async () => (await state()).world?.school?.logoLoaded, { timeout: 40000 }).toBe(true);
  const hardware = await page.evaluate(() => { const gl = document.querySelector('.chapter-room').getContext('webgl2'); const d = gl?.getExtension('WEBGL_debug_renderer_info'); return { renderer: d ? gl.getParameter(d.UNMASKED_RENDERER_WEBGL) : 'unavailable', userAgent: navigator.userAgent }; });
  const cdp = await page.context().newCDPSession(page), frames = [];
  cdp.on('Page.screencastFrame', async (event) => {
    const name = String(frames.length).padStart(6, '0') + '.jpg';
    writeFileSync(resolve(framesDir, name), Buffer.from(event.data, 'base64'));
    frames.push({ name, time: event.metadata.timestamp });
    await cdp.send('Page.screencastFrameAck', { sessionId: event.sessionId });
  });
  const audioStart = await page.evaluate(() => {
    const stream = new MediaStream(window.__voiceStream.getAudioTracks().map((t) => t.clone()));
    window.__voiceChunks = []; window.__voiceRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
    window.__voiceRecorder.ondataavailable = (e) => { if (e.data.size) window.__voiceChunks.push(e.data); };
    window.__voiceRecorder.start(100); return Date.now() / 1000;
  });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 86, maxWidth: 1280, maxHeight: 720, everyNthFrame: 2 });
  await page.screenshot({ path: resolve(out, 'teacher-arrival-school.png') });
  await expect(page.locator('.chapter')).toHaveAttribute('data-stayed', 'discussion', { timeout: 30000 });
  await expect.poll(async () => (await state()).voice?.status).toBe('off');
  await page.waitForTimeout(1000); await page.screenshot({ path: resolve(out, 'van-reading.png') });
  await expect.poll(async () => (await state()).stayed?.line, { timeout: 15000 }).toBe(1);
  await page.waitForTimeout(1400); await page.screenshot({ path: resolve(out, 'an-reading.png') });
  await expect(page.locator('.chapter')).toHaveAttribute('data-stayed', 'chair', { timeout: 20000 });
  await expect.poll(async () => (await state()).time).toBeGreaterThan(.7);
  await page.screenshot({path:resolve(out,'chair-insert.png')});
  await expect.poll(async () => (await state()).world?.shot).toBe('chair.sit');
  await page.waitForTimeout(450);await page.screenshot({path:resolve(out,'sit-down.png')});
  await expect.poll(async () => (await state()).time).toBeGreaterThan(4.5);
  await page.screenshot({path:resolve(out,'quiet-seated.png')});
  await expect(page.locator('.chapter')).toHaveAttribute('data-stayed', 'question', { timeout: 30000 });
  await page.waitForTimeout(1800); await page.screenshot({ path: resolve(out, 'both-reading.png') });
  await page.waitForTimeout(5500);
  const final = await state();
  await cdp.send('Page.stopScreencast');
  const data = await page.evaluate(async () => {
    const recorder = window.__voiceRecorder;
    await new Promise((done) => { recorder.onstop = done; recorder.stop(); });
    recorder.stream.getTracks().forEach((t) => t.stop());
    return Array.from(new Uint8Array(await new Blob(window.__voiceChunks, { type: recorder.mimeType }).arrayBuffer()));
  });
  writeFileSync(resolve(out, 'voice-scene-live-audio.webm'), Buffer.from(data));
  const offsets = frames.map((f, i) => ({ file: f.name, duration: i < frames.length - 1 ? Math.max(.001, frames[i + 1].time - f.time) : .08 }));
  writeFileSync(resolve(framesDir, 'frames.txt'), offsets.map((f) => `file '${f.file}'\nduration ${f.duration}\n`).join('') + `file '${frames.at(-1).name}'\n`);
  const offset = Math.max(0, frames[0].time - audioStart);
  await browser.close();
  const encode = spawnSync('ffmpeg.exe', ['-y', '-f', 'concat', '-safe', '0', '-i', resolve(framesDir, 'frames.txt'), '-ss', String(offset), '-i', resolve(out, 'voice-scene-live-audio.webm'), '-vf', 'fps=24', '-c:v', 'libx264', '-preset', 'fast', '-crf', '22', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-shortest', '-movflags', '+faststart', resolve(out, 'chair-cinematic.mp4')], { encoding: 'utf8', maxBuffer: 8e6 });
  writeFileSync(resolve(out, 'video-encode.log'), encode.stderr ?? '');
  if (encode.status !== 0) throw Error('Video encoding failed');
  const record = { capture: 'Real Chromium CDP frames and the live shared game audio bus, with environmental audio, music and subtitles. There is no spoken character dialogue in the past scene; only the opening narrator is voiced. 24fps is encoding cadence, not a render performance claim.', hardware, frames: frames.length, seconds: frames.at(-1).time - frames[0].time, audioVideoOffset: offset, final, errors };
  writeFileSync(resolve(out, 'recording.json'), JSON.stringify(record, null, 2));
  expect(final.voice.started).toBe(0); expect(final.voice.completed).toBe(0); expect(errors).toEqual([]);
  console.log('Recorded', frames.length, 'runtime frames;', record.seconds, 'seconds with live audio.');
} finally { await browser.close(); }
