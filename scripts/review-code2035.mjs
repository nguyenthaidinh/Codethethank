import { chromium, expect } from '@playwright/test';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const out = 'docs/code2035-pass';
mkdirSync(out, { recursive: true });
// Review checkpoint: isolate the new optional stage after the existing investigation.
const base = JSON.parse(readFileSync('docs/future-late-art-pass/checkpoint.json', 'utf8'));
base.chapter.verdict.ripple = {
  version: 1, phase: 'years', questions: ['prediction', 'opportunity'],
  milestones: 1, memories: [], selected: null, elapsed: 0, played: [],
  lab2035: {
    version: 1, loaded: ['record', 'access'], enabled: ['record', 'access'],
    trials: [1, 3], selected: 3, running: null, noteRead: true, marked: true,
  },
};
const browser = await chromium.launch({ headless: true, args: ['--use-angle=d3d11'] });
const state = async p => JSON.parse(await p.getByTestId('chapter-telemetry').textContent());
const button = (p, name) => p.getByRole('button', { name, exact: true });
async function enter(p, save = base) {
  await p.goto('http://127.0.0.1:4198/');
  await p.evaluate(v => localStorage.setItem('project2011.cinematic.v3', JSON.stringify(v)), save);
  await p.reload();
  await button(p, 'Tiếp tục').click();
  await button(p, 'Tiếp: sửa logic').click({ timeout: 20000 });
  await expect(p.getByRole('region', { name: 'Thử thách sửa logic 2035' })).toBeVisible();
}
try {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, recordVideo: { dir: out, size: { width: 1280, height: 800 } } });
  const p = await ctx.newPage(), errors = [];
  p.on('pageerror', e => errors.push(e.message));
  await enter(p);
  await p.screenshot({ path: `${out}/desktop-editor.png` });
  await button(p, 'Chạy kiểm thử').click();
  await expect.poll(async () => (await state(p)).ripple.lab2035.codePatch.checked, { timeout: 12000 }).not.toBeNull();
  expect((await state(p)).ripple.lab2035.codePatch.status).toBe('editing');
  await expect(p.locator('.code2035-feedback')).toContainText('chưa đạt');
  await p.screenshot({ path: `${out}/desktop-failed.png` });
  await button(p, 'Chọn điều kiện').click();
  await button(p, 'Khi thiếu bối cảnh hoặc chưa đủ tin cậy').click();
  await button(p, 'Chuyển người phụ trách xem xét').click();
  await button(p, 'Chạy kiểm thử').focus();
  await p.keyboard.press('Enter');
  await expect.poll(async () => (await state(p)).ripple.lab2035.codePatch.elapsed, { timeout: 4000 }).toBeGreaterThan(.3);
  await p.reload();
  await button(p, 'Tiếp tục').click();
  await expect.poll(async () => (await state(p)).ripple.lab2035.codePatch.status, { timeout: 15000 }).toBe('passed');
  await expect(p.locator('.code2035-tests-title')).toContainText('4/4 ca đạt');
  await p.screenshot({ path: `${out}/desktop-passed.png` });
  await button(p, 'Lưu bản sửa và tiếp tục').click();
  await expect(p.locator('.chapter')).toHaveAttribute('data-ripple', 'milestone');
  expect(errors).toEqual([]);
  writeFileSync(`${out}/desktop.json`, JSON.stringify({ result: 'PASS', errors, state: await state(p) }, null, 2));
  const video = p.video();
  await ctx.close();
  await video.saveAs(`${out}/desktop-muted.webm`);
  for (const fallback of [false, true]) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
    const m = await context.newPage(), failures = [];
    m.on('pageerror', e => failures.push(e.message));
    if (fallback) await m.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (...args) { return String(args[0]).includes('webgl') ? null : original.apply(this, args); };
    });
    await enter(m, { ...base, reduced: true });
    const skip = await button(m, 'Bỏ qua thử thách code').boundingBox();
    expect(skip.y).toBeGreaterThan(0);
    expect(skip.y + skip.height).toBeLessThan(844);
    await m.screenshot({ path: `${out}/${fallback ? 'fallback' : 'mobile'}-editor.png` });
    await button(m, 'Bỏ qua thử thách code').tap();
    await expect(m.locator('.chapter')).toHaveAttribute('data-ripple', 'milestone');
    const s = await state(m);
    expect(s.ripple.lab2035.trials).toEqual([1, 3]);
    expect(s.ripple.lab2035.marked).toBe(true);
    expect(s.ripple.lab2035.codePatch.status).toBe('skipped');
    expect(s.ripple.lab2035.codePatch.attempts).toBe(0);
    expect(s.ripple.lab2035.codePatch.checked).toBeNull();
    expect(failures).toEqual([]);
    writeFileSync(`${out}/${fallback ? 'fallback' : 'mobile'}.json`, JSON.stringify({ result: 'PASS', errors: failures, state: s }, null, 2));
    await context.close();
  }
  console.log('PASS: failed/retry/passed code, keyboard Run, reload mid-test, mobile visible skip, reduced motion and Canvas fallback; skip preserves investigation and is not a pass.');
} finally {
  await browser.close();
}
