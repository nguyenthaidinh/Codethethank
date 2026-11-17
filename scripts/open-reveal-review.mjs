// Launch an isolated, visible review session. Never uses the user's browser profile.
import { chromium, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
const checkpoint = JSON.parse(readFileSync('docs/finale-v5-1-proof/before/checkpoint.json', 'utf8'));
checkpoint.chapter.verdict.finale.phase = 'paper';
const browser = await chromium.launch({ headless: false, args: ['--window-size=1440,950', '--use-angle=d3d11'] });
try {
  const context = await browser.newContext({ viewport: null });
  const page = await context.newPage();
  await page.addInitScript(save => {
    if (!sessionStorage.getItem('f54-review-seeded')) {
      localStorage.setItem('project2011.cinematic.v3', JSON.stringify(save));
      sessionStorage.setItem('f54-review-seeded', '1');
    }
  }, checkpoint);
  await page.goto('http://127.0.0.1:4194/');
  await page.getByRole('button', { name: 'Bật âm thanh', exact: true }).click();
  await page.getByRole('button', { name: 'Tiếp tục', exact: true }).click();
  await expect(page.locator('.chapter')).toHaveAttribute('data-finale', 'paper', { timeout: 30000 });
  await expect(page.getByRole('button', { name: 'Mở máy tính', exact: true })).toBeVisible();
  await page.evaluate(() => { document.title = "F5.4 · Dùng thử riêng · THE UNWRITTEN LESSON"; });
  await page.bringToFront();
  console.log('PLAYER_ROOM_READY: isolated visible F5.4 review, audio enabled; click Mở máy tính to write.');
  await new Promise(resolve => browser.once('disconnected', resolve));
} finally { await browser.close(); }
