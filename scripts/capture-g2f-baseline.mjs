import {chromium,expect} from '@playwright/test';
import {mkdirSync,writeFileSync} from 'node:fs';
const out='docs/art/g2f-proof/baseline';mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true});
try {
 const page=await browser.newPage({viewport:{width:1280,height:720}});
 await page.addInitScript(()=>{
  const frames=[];let previous=0;
  const tick=t=>{if(previous)frames.push(t-previous);previous=t;requestAnimationFrame(tick)};
  requestAnimationFrame(tick);window.__g2fFrames=frames;
 });
 await page.goto('http://127.0.0.1:4173/?chapter=1');
 await expect(page.locator('.chapter')).toBeVisible();
 await page.waitForTimeout(12000);await page.screenshot({path:out+'/opening.png'});
 await page.getByRole('button',{name:'Bỏ qua cinematic',exact:true}).click();
 await page.waitForTimeout(2200);await page.screenshot({path:out+'/control.png'});
 await page.getByRole('button',{name:'Khám phá tín hiệu',exact:true}).click();
 await page.waitForTimeout(2200);await page.screenshot({path:out+'/signal.png'});
 const info=await page.evaluate(()=>({telemetry:JSON.parse(document.querySelector('[data-testid=chapter-telemetry]').textContent),frames:window.__g2fFrames.slice(-100),ua:navigator.userAgent}));
 writeFileSync(out+'/runtime.json',JSON.stringify(info,null,2));console.log('Baseline captured');
}finally{await browser.close()}
