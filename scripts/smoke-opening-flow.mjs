import { chromium, expect } from '@playwright/test';
import { writeFileSync } from 'node:fs';
const browser = await chromium.launch({ headless: true, args: ['--use-angle=d3d11'] });
const out = 'docs/opening-flow-pass';
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errors = [], requests = [], samples = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('request', r => { if (r.url().includes('/voice/')) requests.push(r.url()); });
  await page.goto('http://127.0.0.1:4220/');
  await page.getByRole('button', { name: 'Bật âm thanh', exact: true }).click();
  await page.getByRole('button', { name: 'Bắt đầu hành trình', exact: true }).click();
  const state = async () => JSON.parse(await page.getByTestId('chapter-telemetry').textContent());
  await expect.poll(async () => (await state()).voice?.status, { timeout: 45000 }).toBe('speaking');
  await page.evaluate(() => {
    window.flowFrames = [];
    let last = performance.now();
    const tick = now => {
      window.flowFrames.push(now-last); last = now;
      if(window.flowFrames.length < 10000) window.flowFrame = requestAnimationFrame(tick);
    };
    window.flowFrame = requestAnimationFrame(tick);
  });
  for (const time of [15, 21, 25, 30, 40, 55]) {
    await expect.poll(async () => (await state()).time, { timeout: 25000 }).toBeGreaterThan(time);
    samples.push(await state());
    if (time < 40) await page.screenshot({ path: `${out}/opening-${time}.png` });
  }
  await expect(page.locator('.chapter')).toHaveAttribute('data-chapter', 'PLAYER_CONTROL_ENABLED', { timeout: 15000 });
  const final = await state();
  expect(final.voice.started).toBe(7);
  expect(final.voice.completed).toBe(7);
  expect(requests).toHaveLength(7);
  expect(requests.every(url => url.includes('/vi-namminh/'))).toBe(true);
  expect(errors).toEqual([]);
  const frameTimes = await page.evaluate(() => { cancelAnimationFrame(window.flowFrame); return window.flowFrames; });
  const sorted = frameTimes.slice().sort((a,b) => a-b);
  const frames = { count: sorted.length, medianMs: sorted[Math.floor(sorted.length*.5)], p95Ms: sorted[Math.floor(sorted.length*.95)], maxMs: sorted.at(-1), note: 'Headless desktop, includes screenshot capture overhead; not a physical device benchmark.' };
  writeFileSync(`${out}/runtime.json`, JSON.stringify({ result: 'PASS', errors, requests, frames, samples, final }, null, 2));
  console.log('PASS: full opening, city → atrium → Nexus → player control; seven male clips completed.', frames);
  await page.close();
  const mobile = await browser.newPage({ viewport:{width:390,height:844}, isMobile:true, hasTouch:true, reducedMotion:'reduce' });
  await mobile.goto('http://127.0.0.1:4220/');
  await mobile.getByRole('button',{name:'Bắt đầu hành trình',exact:true}).tap();
  await expect(mobile.locator('.chapter')).toHaveAttribute('data-chapter','OPENING_CINEMATIC',{timeout:30000});
  await expect.poll(async()=>JSON.parse(await mobile.getByTestId('chapter-telemetry').textContent()).world?.ready,{timeout:45000}).toBe(true);
  await mobile.screenshot({path:`${out}/mobile-reduced.png`});
  await mobile.getByRole('button',{name:'Bỏ qua cinematic',exact:true}).tap();
  await expect(mobile.locator('.chapter')).toHaveAttribute('data-chapter','PLAYER_CONTROL_ENABLED');
  console.log('PASS: mobile touch + reduced motion + skip.');
} finally { await browser.close(); }
