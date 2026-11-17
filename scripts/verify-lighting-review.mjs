import {chromium,expect} from '@playwright/test';
import {writeFileSync} from 'node:fs';
const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11']});
try {
 const page=await browser.newPage({viewport:{width:1280,height:800}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5173/docs/classroom-lighting-proof/review.html');
 await expect.poll(()=>page.locator('video').evaluate(v=>v.readyState)).toBeGreaterThanOrEqual(1);
 await expect.poll(()=>page.locator('img').evaluateAll(imgs=>imgs.every(i=>i.complete&&i.naturalWidth>0))).toBe(true);
 const video=await page.locator('video').evaluate(v=>({duration:v.duration,width:v.videoWidth,height:v.videoHeight}));
 await page.screenshot({path:'docs/classroom-lighting-proof/review-page.png',fullPage:true});
 await page.goto('http://127.0.0.1:4192/_lighting-review.html');await page.getByRole('button',{name:'Chơi đoạn lớp học'}).click();await page.getByRole('button',{name:'Tiếp tục',exact:true}).click();
 await expect(page.locator('.chapter')).toHaveAttribute('data-stayed','discussion',{timeout:45000});
 writeFileSync('docs/classroom-lighting-proof/review-check.json',JSON.stringify({video,errors,checkpointLauncher:'PASS'},null,2));expect(errors).toEqual([]);
} finally {await browser.close();}
