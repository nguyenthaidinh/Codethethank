import { chromium, expect } from '@playwright/test';
import {writeFileSync} from 'node:fs';
const browser=await chromium.launch({headless:true});
try{
 const context=await browser.newContext({viewport:{width:1280,height:720}}),page=await context.newPage(),errors=[];
 page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
 await page.goto('http://127.0.0.1:4173/');
 await page.evaluate(()=>localStorage.setItem('project2011.cinematic.v3',JSON.stringify({version:3,beat:'explore',observed:[],selected:false,focus:'wide',reduced:false,muted:false,captions:true,volume:.65,music:true,sfx:true,chapter:{version:1,beat:'CLASSROOM_EXPLORATION',signal:true,evidence:[]}})));
 await page.reload();await page.getByRole('button',{name:'Bật âm thanh',exact:true}).click();await page.getByRole('button',{name:'Tiếp tục',exact:true}).click();
 await expect(page.locator('.chapter')).toHaveAttribute('data-chapter','CLASSROOM_EXPLORATION');
 await page.waitForTimeout(10000);
 const framesMs=await page.evaluate(async()=>{const samples=[];let last=performance.now();await new Promise(resolve=>{function tick(now){samples.push(now-last);last=now;if(samples.length<48)requestAnimationFrame(tick);else resolve();}requestAnimationFrame(tick);});return samples.slice(1);});
 const snapshot=JSON.parse(await page.getByTestId('chapter-telemetry').textContent());
 expect(snapshot.audio.context).toBe('running');expect(errors).toEqual([]);
 const graphics=await page.evaluate(()=>{const gl=document.querySelector('.chapter-room').getContext('webgl2'),debug=gl.getExtension('WEBGL_debug_renderer_info');return{renderer:debug?gl.getParameter(debug.UNMASKED_RENDERER_WEBGL):'unavailable',userAgent:navigator.userAgent};});
 const sorted=[...framesMs].sort((a,b)=>a-b);
 const result={note:'Same audio-on Continue state as before/warm-wide.json; 10s warm-up, no video or concurrent browser workload. Host rAF intervals, not GPU timer/device FPS.',graphics,world:snapshot.world,audioContext:snapshot.audio.context,framesMs,p50Ms:sorted[Math.floor(sorted.length*.5)],p90Ms:sorted[Math.floor(sorted.length*.9)],errors};
 writeFileSync('docs/art2r/proof/after/runtime/warm-wide.json',JSON.stringify(result,null,2));console.log(JSON.stringify({p50Ms:result.p50Ms,p90Ms:result.p90Ms,errors}));
 await context.close();
}finally{await browser.close();}
