import {chromium,expect} from '@playwright/test';
import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';
const out='docs/art/g2f-proof';mkdirSync(out,{recursive:true});
const software=process.env.G2F_SOFTWARE_WEBGL==='1';
const browser=await chromium.launch({headless:true,args:!software&&process.platform==='win32'?['--use-angle=d3d11']:[]});
try {
 const results=[];
 for(const mobile of [false,true]){
  const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1280,height:720},hasTouch:mobile,isMobile:mobile});const page=await context.newPage();
  await page.goto('http://127.0.0.1:4173/?chapter=1');
  await expect.poll(async()=>JSON.parse(await page.getByTestId('chapter-telemetry').textContent()).world?.ready,{timeout:40000}).toBe(true);
  await page.getByRole('button',{name:'Bỏ qua cinematic',exact:true}).click();await page.getByRole('button',{name:'Khám phá tín hiệu',exact:true}).click();await page.waitForTimeout(5000);
  await expect.poll(async()=>JSON.parse(await page.getByTestId('chapter-telemetry').textContent()).world?.qualitySettled,{timeout:60000}).toBe(true);
  const sample=await page.evaluate(async()=>{
   const frames=[];let last=performance.now();await new Promise(resolve=>{const tick=t=>{frames.push(t-last);last=t;if(frames.length===100)resolve();else requestAnimationFrame(tick)};requestAnimationFrame(tick)});
   const canvas=document.querySelector('.chapter-future'),gl=canvas.getContext('webgl2'),debug=gl?.getExtension('WEBGL_debug_renderer_info');
   return{frames,state:JSON.parse(document.querySelector('[data-testid=chapter-telemetry]').textContent),renderer:debug?gl.getParameter(debug.UNMASKED_RENDERER_WEBGL):'unavailable',ua:navigator.userAgent};
  });
  expect(sample.state.audio?.context).toBe('running');
  const sorted=sample.frames.slice(1).sort((a,b)=>a-b);results.push({...sample,profile:mobile?'touch emulation 390×844':'desktop viewport 1280×720',p50:sorted[Math.floor(sorted.length*.5)],p90:sorted[Math.floor(sorted.length*.9)]});
  if(mobile){for(const name of ['Điều tra dự đoán ban đầu','Đối chiếu kết quả về sau'])await page.getByRole('button',{name,exact:true}).tap();await page.waitForTimeout(800);}
  await page.screenshot({path:`${out}/runtime/${mobile?'mobile':'desktop'}${software?'-software':''}-inspection.png`});
  if(software){
   if(!mobile)for(const name of ['Điều tra dự đoán ban đầu','Đối chiếu kết quả về sau'])await page.getByRole('button',{name,exact:true}).click();
   await page.getByRole('button',{name:'Chạm để mở hồ sơ 2026',exact:false}).click();
   await expect(page.locator('.chapter')).toHaveAttribute('data-chapter','CLASSROOM_EXPLORATION',{timeout:40000});
   results.at(-1).handoff=JSON.parse(await page.getByTestId('chapter-telemetry').textContent()).beat;
  }
  await context.close();
 }
 const before=JSON.parse(readFileSync(out+'/baseline/runtime.json','utf8')).frames.slice(1).sort((a,b)=>a-b);
 writeFileSync(out+`/performance${software?'-software':''}.json`,JSON.stringify({baseline:{profile:'1280×720, old Canvas2D signal scene',p50:before[Math.floor(before.length*.5)],p90:before[Math.floor(before.length*.9)]},after:results,limits:'Actual renderer reported per probe. Touch is viewport/input emulation, not a phone. Baseline Canvas used default headless Chromium; new PBR uses explicit D3D11. No recording or parallel automated browser test during this probe.'},null,2));console.log(results.map(r=>({profile:r.profile,p50:r.p50,p90:r.p90,world:r.state.world})));
}finally{await browser.close();}
