import {chromium,expect} from '@playwright/test';
import {writeFileSync} from 'node:fs';
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:1280,height:850}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('response',response=>{if(response.status()>=400)errors.push(`${response.status()} ${response.url()}`);});
 await page.goto('http://127.0.0.1:5173/docs/art2r/REVIEW.html');
 await expect.poll(()=>page.locator('img').evaluateAll(images=>images.every(img=>img.complete&&img.naturalWidth>0))).toBe(true);
 const pictures=await page.locator('img').count();expect(pictures).toBe(15);
 const video=page.locator('video').first();await video.evaluate(element=>{element.muted=true;return element.play();});
 await expect.poll(()=>video.evaluate(element=>element.currentTime)).toBeGreaterThan(.5);await video.evaluate(element=>element.pause());
 await page.screenshot({path:'docs/art2r/proof/after/review-desktop.png'});
 await page.setViewportSize({width:390,height:844});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth===innerWidth)).toBe(true);
 await page.screenshot({path:'docs/art2r/proof/after/review-mobile.png'});
 expect(errors).toEqual([]);
 writeFileSync('docs/art2r/proof/after/review-check.json',JSON.stringify({pictures,videoPlayed:true,mobileNoHorizontalOverflow:true,errors},null,2));
 console.log('Review pictures, runtime video playback, desktop/mobile PASS');
}finally{await browser.close();}
