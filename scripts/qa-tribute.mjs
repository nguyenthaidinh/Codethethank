import { chromium, expect } from '@playwright/test';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { mkdirSync, writeFileSync } from 'node:fs';
const open = process.argv.includes('--open');
process.on('uncaughtException', error => {
    console.error(String(error).replace(/[a-f0-9]{64}/gi, '[redacted]').replace(/#token=[^\s]+/g, '#token=[redacted]'));
    process.exit(1);
});
const out = resolve('backend/proof-tribute');
mkdirSync(out, { recursive: true });
const fixture = spawnSync('F:/laragon/bin/php/php-8.3.30-Win32-vs16-x64/php.exe', ['-d', 'extension=pdo_pgsql', 'scripts/tribute-fixture.php'], { cwd: resolve('backend'), encoding: 'utf8', env: { ...process.env, APP_ENV: 'local', DB_DATABASE: 'gratitude_wall_review' } });
if (fixture.status !== 0) throw Error('Tribute fixture failed');
const credentials = JSON.parse(fixture.stdout);
const browser = await chromium.launch({ headless: !open });
const context = await browser.newContext({ viewport: { width: 1440, height: 960 } });
const stage = await context.newPage();
const errors = [];
stage.on('pageerror', e => errors.push(e.message));
async function command(action) {
    for (let attempt = 0; attempt < 3; attempt++) {
        const status = await stage.evaluate(async action => {
            const state = await (await fetch('/admin/stage/state')).json();
            const data = new FormData(document.querySelector(action === 'tribute-start' ? '#tribute-form' : '[data-command=resume]').closest('form'));
            data.set('revision', state.revision);
            if (action !== 'tribute-start') data.set('action', action);
            else data.set('seconds', '4');
            return (await fetch(action === 'tribute-start' ? '/admin/stage/tribute' : '/admin/stage/command', { method: 'POST', body: data })).status;
        }, action);
        if (status === 200) { await stage.goto('http://127.0.0.1:8057/admin/stage'); return; }
        if (status !== 409) throw Error(`Command failed: ${status}`);
    }
    throw Error('Stage revision changed repeatedly');
}
await stage.goto('http://127.0.0.1:8057/admin/login');
await stage.getByLabel('Email quản trị').fill(credentials.email);
await stage.getByLabel('Mật khẩu', { exact: true }).fill(credentials.password);
await stage.getByRole('button', { name: 'Vào không gian quản trị' }).click();
await stage.waitForURL('**/admin');
await stage.goto('http://127.0.0.1:8057/admin/stage');
await command('resume');
await stage.locator('#display-name').fill('Tri ân · Máy chiếu duyệt');
await stage.getByRole('button', { name: 'Tạo liên kết ghép màn hình' }).click();
const paired = await stage.locator('#paired-screen').getAttribute('href');
const display = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
await display.addInitScript(() => {
    const NativeAudio = window.Audio;
    window.Audio = function(...args) { const audio = new NativeAudio(...args); window.tributeAudio = audio; return audio; };
});
const screen = await display.newPage();
screen.on('pageerror', e => errors.push(e.message));
let offset = null, offline = false;
await screen.route('**/api/v1/wall/snapshot?*', async route => {
    if (offline) return route.abort();
    const response = await route.fetch();
    const data = await response.json();
    if (offset !== null && data.tribute) data.server_now_ms = data.tribute.started_at_ms + offset;
    await route.fulfill({ response, json: data });
});
await screen.goto(paired);
// A gesture on the projector itself grants browser playback permission.
await screen.locator('body').click({ position: { x: 20, y: 20 } });
await stage.goto('http://127.0.0.1:8057/admin/stage');
await command('tribute-start');
await expect(screen.locator('.tribute-roll-name').first()).toHaveText('Cô Như', { timeout: 20000 });
await expect(screen.locator('.tribute-roll-name')).toHaveCount(13);
await expect(screen.locator('.tribute-dedication-header h2')).toHaveText('Tri ân thầy cô');
await expect.poll(() => screen.locator('.tribute-roll').evaluate(el => el.getAnimations()[0]?.effect.getTiming().duration)).toBe(52000);
await expect(screen.locator('#wishes .flying-wish').first()).toBeAttached();
await expect.poll(() => screen.evaluate(() => !window.tributeAudio.paused && window.tributeAudio.currentTime > 0)).toBe(true);
await screen.locator('#tribute-audio').click();
await screen.waitForTimeout(1800);
await expect.poll(() => screen.evaluate(() => window.tributeAudio.paused)).toBe(true);
await screen.locator('#tribute-audio').click();
await expect.poll(() => screen.evaluate(() => !window.tributeAudio.paused)).toBe(true);
await screen.evaluate(() => { window.tributeAudio.currentTime = window.tributeAudio.duration - 0.3; });
await expect.poll(() => screen.evaluate(() => window.tributeAudio.currentTime < 5 && !window.tributeAudio.paused), { timeout: 10000 }).toBe(true);
await screen.waitForTimeout(1600);
if (!open) { offset = 14000; await screen.waitForTimeout(1500); }
await screen.screenshot({ path: `${out}/teachers-desktop.png` });
await stage.screenshot({ path: `${out}/stage.png`, fullPage: true });
if (open) { console.log('TRIBUTE_REVIEW_READY'); await new Promise(() => {}); }
offset = 12 * 4000;
await expect(screen.locator('.tribute-roll-name').filter({ hasText: 'Thầy Tuấn' })).toHaveCount(2);
await expect.poll(() => screen.locator('.tribute-roll').evaluate(el => el.getAnimations().length)).toBe(1);
offset = 120000;
await expect(screen.locator('.tribute-name')).toHaveText('Cảm ơn vì đã ở đây.', { timeout: 15000 });
await expect.poll(() => screen.evaluate(() => !window.tributeAudio.paused)).toBe(true);
offset = null;
await command('tribute-start');
await expect(screen.locator('.tribute-roll-name').first()).toHaveText('Cô Như', { timeout: 15000 });
await expect.poll(() => screen.evaluate(() => !window.tributeAudio.paused)).toBe(true);
await screen.keyboard.press('b');
await expect.poll(() => screen.evaluate(() => window.tributeAudio.paused)).toBe(true);
await expect(screen.locator('#blackout')).toBeVisible();
await screen.keyboard.press('r');
await expect(screen.locator('#blackout')).toBeHidden({ timeout: 15000 });
offline = true;
await expect(screen.locator('#blackout')).toBeVisible({ timeout: 12000 });
await expect.poll(() => screen.evaluate(() => window.tributeAudio.paused)).toBe(true);
offline = false;
await expect(screen.locator('#blackout')).toBeHidden({ timeout: 15000 });
await command('blank');
await expect(screen.locator('#blackout')).toBeVisible({ timeout: 15000 });
await expect.poll(() => screen.evaluate(() => window.tributeAudio.paused)).toBe(true);
await command('resume');
await command('tribute-start');
await expect(screen.locator('.tribute-roll-name').first()).toHaveText('Cô Như', { timeout: 15000 });
await screen.setViewportSize({ width: 390, height: 844 });
await screen.emulateMedia({ reducedMotion: 'reduce' });
await expect(screen.locator('.tribute-roll-window')).toHaveClass(/is-static/);
await screen.screenshot({ path: `${out}/teachers-mobile.png` });
await expect.poll(() => screen.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
await screen.setViewportSize({ width: 1920, height: 1080 });
writeFileSync(`${out}/qa.json`, JSON.stringify({ checks: ['continuous credits roll with 13 ordered names and two Tuấn entries', 'side wishes remain visible', 'actual audio playback and loop', 'offline audio fails closed', 'music continues looping at ending', 'local blank', 'server blank', 'restart', 'mobile reduced motion'], errors }, null, 2));
if (errors.length) throw Error(JSON.stringify(errors));
console.log('TRIBUTE_QA_PASS');
if (open) { console.log('TRIBUTE_REVIEW_READY'); await new Promise(() => {}); }
else { await screen.unrouteAll({ behavior: 'ignoreErrors' }); await browser.close(); }
