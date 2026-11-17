import { chromium, expect } from '@playwright/test';
import { writeFileSync } from 'node:fs';
const browser = await chromium.launch({ headless: true, args: ['--use-angle=d3d11', '--single-process', '--no-zygote', '--js-flags=--max-old-space-size=128'] });
const out = 'docs/opening-male-pass';
try {
  const page = await browser.newPage({ viewport: { width: 1120, height: 630 } });
  const errors = [], requests = [], samples = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('request', r => { if (r.url().includes('/voice/')) requests.push(r.url()); });
  await page.goto('http://127.0.0.1:4219/');
  await page.getByRole('button', { name: 'Bật âm thanh', exact: true }).click();
  await page.getByRole('button', { name: 'Bắt đầu hành trình', exact: true }).click();
  const state = async () => JSON.parse(await page.getByTestId('chapter-telemetry').textContent());
  await expect.poll(async () => (await state()).voice?.status, { timeout: 40000 }).toBe('speaking');
  for (const time of [10, 24, 40, 55]) {
    await expect.poll(async () => (await state()).time, { timeout: 30000 }).toBeGreaterThan(time);
    samples.push(await state());
    await page.screenshot({ path: `${out}/opening-${time}.png` });
  }
  await expect(page.locator('.chapter')).toHaveAttribute('data-chapter', 'PLAYER_CONTROL_ENABLED', { timeout: 15000 });
  const final = await state();
  expect(final.voice.started).toBe(7);
  expect(final.voice.completed).toBe(7);
  expect(requests).toHaveLength(7);
  expect(requests.every(url => url.includes('/vi-namminh/'))).toBe(true);
  expect(errors).toEqual([]);
  writeFileSync(`${out}/runtime.json`, JSON.stringify({ result: 'PASS', errors, requests, samples, final }, null, 2));
  console.log('PASS: 7 male clips completed, 60-second opening reached player control.');
} finally { await browser.close(); }
