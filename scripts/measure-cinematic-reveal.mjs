import {chromium,expect} from '@playwright/test';
import {readFileSync,writeFileSync} from 'node:fs';
const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11']});
const results=[];
try{
 for(const [version,port] of [['F5.3',4193],['F5.4',4194]]){
  const page=await browser.newPage({viewport:{width:1280,height:720},reducedMotion:'reduce'});
  const save=JSON.parse(readFileSync('docs/finale-v5-1-proof/before/checkpoint.json','utf8'));
  Object.assign(save.chapter.verdict.finale,{phase:'galaxy',choice:'letter',starCue:true,elapsed:0,starSeen:false});
  await page.addInitScript(save=>{localStorage.setItem('project2011.cinematic.v3',JSON.stringify(save));localStorage.setItem('project2011.gratitude.v1',JSON.stringify({version:1,recipient:'Cô Vân',message:'Cảm ơn cô đã ở lại.',displayName:'Minh',audience:'private',local:true}));},save);
  await page.goto(`http://127.0.0.1:${port}/`);await page.getByRole('button',{name:'Tiếp tục',exact:true}).click();
  await expect(page.locator('.chapter')).toHaveAttribute('data-finale','galaxy',{timeout:40000});await page.waitForTimeout(3000);
  const measured=await page.evaluate(async()=>{
   let previous=performance.now();const intervals=[];await new Promise(resolve=>{const step=now=>{intervals.push(now-previous);previous=now;if(intervals.length<180)requestAnimationFrame(step);else resolve()};requestAnimationFrame(step)});
   const sorted=intervals.slice(1).sort((a,b)=>a-b);const gl=document.querySelector('.chapter-room').getContext('webgl2'),debug=gl?.getExtension('WEBGL_debug_renderer_info');
   return {medianMs:sorted[Math.floor(sorted.length*.5)],p95Ms:sorted[Math.floor(sorted.length*.95)],samples:sorted.length,renderer:debug?gl.getParameter(debug.UNMASKED_RENDERER_WEBGL):'unavailable',telemetry:JSON.parse(document.querySelector('[data-testid="chapter-telemetry"]').textContent)};
  });results.push({version,...measured});await page.close();
 }
 writeFileSync('docs/finale-f5-4-proof/performance.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results.map(({version,medianMs,p95Ms,telemetry})=>({version,medianMs,p95Ms,drawCalls:telemetry.world?.drawCalls})),null,2));
}finally{await browser.close();}
