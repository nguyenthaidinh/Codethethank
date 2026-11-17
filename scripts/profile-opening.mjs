import { chromium, expect } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
const [url = 'http://127.0.0.1:4220/', label = 'before'] = process.argv.slice(2);
const out = process.env.PROFILE_OUT ?? 'docs/opening-performance-pass'; mkdirSync(out, {recursive:true});
const endTime = Number(process.env.PROFILE_END ?? 35);
const browser = await chromium.launch({headless:true,args:['--use-angle=d3d11']});
try {
 const page = await browser.newPage({viewport:{width:1280,height:720}});
 await page.addInitScript(()=>{
   window.textureUploads={calls:0,ms:0,maxMs:0,liveCanvas:0};
   window.gpuAllocations={buffers:0,programs:0,resizes:[]};
   for(const name of ['bufferData','linkProgram']) {
     const fn=WebGL2RenderingContext.prototype[name];
     WebGL2RenderingContext.prototype[name]=function(...args){
       window.gpuAllocations[name==='bufferData'?'buffers':'programs']++;
       return fn.apply(this,args);
     };
   }
   for(const name of ['width','height']) {
     const descriptor=Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype,name);
     Object.defineProperty(HTMLCanvasElement.prototype,name,{...descriptor,set(value){
       if(this.classList.contains('chapter-room')) window.gpuAllocations.resizes.push({dimension:name,value,time:performance.now()});
       descriptor.set.call(this,value);
     }});
   }
   const original=WebGL2RenderingContext.prototype.texSubImage2D;
   WebGL2RenderingContext.prototype.texSubImage2D=function(...args){
     const start=performance.now();const result=original.apply(this,args);const ms=performance.now()-start;
     const counter=window.textureUploads;counter.calls++;counter.ms+=ms;counter.maxMs=Math.max(counter.maxMs,ms);
     if(args.some(a=>a instanceof HTMLCanvasElement&&a.width===1024&&a.height===512)) counter.liveCanvas++;
     return result;
   };
 });
 const errors=[]; page.on('pageerror',e=>errors.push(e.message));
 page.on('console',message=>{if(message.type()==='error') errors.push(message.text());});
 await page.goto(url);
 await page.getByRole('button',{name:'Bật âm thanh',exact:true}).click();
 await page.getByRole('button',{name:'Bắt đầu hành trình',exact:true}).click();
 const state=async()=>JSON.parse(await page.getByTestId('chapter-telemetry').textContent());
 await expect.poll(async()=>(await state()).voice?.status,{timeout:45000}).toBe('speaking');
 if(process.env.PROFILE_CITY_CAPTURE==='1') await page.screenshot({path:`${out}/${label}-city.png`});
 const cdp=await page.context().newCDPSession(page);
 await cdp.send('Performance.enable');
 await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval',{interval:2000}); await cdp.send('Profiler.start');
 const initial=await cdp.send('Performance.getMetrics');
 const start=await state();
 await page.evaluate(t=>{
   window.textureUploads={calls:0,ms:0,maxMs:0,liveCanvas:0};
   window.gpuAllocations={buffers:0,programs:0,resizes:[]};
   const start=performance.now();let last=start;window.frames=[];
   const tick=now=>{window.frames.push([t+(now-start)/1000,now-last]);last=now;window.frame=requestAnimationFrame(tick);};
   window.frame=requestAnimationFrame(tick);
 },start.time);
 await expect.poll(async()=>(await state()).time,{timeout:60000,intervals:[500]}).toBeGreaterThan(endTime);
 const final=await state();
 const frames=await page.evaluate(()=>{cancelAnimationFrame(window.frame);return window.frames;});
 const metrics=await cdp.send('Performance.getMetrics');
 const {profile}=await cdp.send('Profiler.stop');
 const nodes=new Map(profile.nodes.map(n=>[n.id,n]));const counts=new Map();
 for(const id of profile.samples??[]) counts.set(id,(counts.get(id)??0)+1);
 const cpu=[...counts].sort((a,b)=>b[1]-a[1]).slice(0,18).map(([id,count])=>({count,...nodes.get(id).callFrame}));
 const hardware=await page.evaluate(()=>{const gl=document.querySelector('.chapter-room').getContext('webgl2');const ext=gl?.getExtension('WEBGL_debug_renderer_info');return ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):'unknown';});
 const summarize=(a)=>{const values=a.map(f=>f[1]).sort((a,b)=>a-b);return {count:values.length,medianMs:values[Math.floor(values.length*.5)],p95Ms:values[Math.floor(values.length*.95)],over50ms:values.filter(v=>v>50).length,meanMs:values.reduce((a,b)=>a+b,0)/values.length};};
 const textureUploads=await page.evaluate(()=>window.textureUploads);
 const gpuAllocations=await page.evaluate(()=>window.gpuAllocations);
 const result={label,url,hardware,errors,cpu,initial,metrics,final,textureUploads,gpuAllocations,city:summarize(frames.filter(f=>f[0]>=3&&f[0]<15)),entrance:summarize(frames.filter(f=>f[0]>=15&&f[0]<25)),atrium:summarize(frames.filter(f=>f[0]>=25&&f[0]<endTime)),frames};
 writeFileSync(`${out}/${label}.json`,JSON.stringify(result,null,2));
 await page.screenshot({path:`${out}/${label}.png`});
 console.log(JSON.stringify({hardware,errors,textureUploads,gpuAllocations,city:result.city,entrance:result.entrance,atrium:result.atrium,cpu:cpu.slice(0,6)},null,2));
 if(label==='final') {
   await expect(page.locator('.chapter')).toHaveAttribute('data-chapter','PLAYER_CONTROL_ENABLED',{timeout:65000});
   const end=await state(); expect(end.voice.started).toBe(7); expect(end.voice.completed).toBe(7); expect(errors).toEqual([]);
   const checks={opening:'PASS',maleClips:end.voice.completed,errors,mobile:[],final:end};
   await page.close();
   for(const fallback of [false,true]) {
     const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
     if(fallback) await mobile.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(kind,...args){return kind==='webgl2'||kind==='webgl'?null:get.call(this,kind,...args);};});
     await mobile.goto(url); await mobile.getByRole('button',{name:'Bắt đầu hành trình',exact:true}).tap();
     await expect(mobile.locator('.chapter')).toHaveAttribute('data-chapter','OPENING_CINEMATIC',{timeout:30000});
     const info=async()=>JSON.parse(await mobile.getByTestId('chapter-telemetry').textContent());
     if(fallback) await expect.poll(async()=>(await info()).world?.renderer).toBe('future-canvas-fallback');
     else await expect.poll(async()=>(await info()).world?.ready,{timeout:40000}).toBe(true);
     await mobile.getByRole('button',{name:'Bỏ qua cinematic',exact:true}).tap();
     await expect(mobile.locator('.chapter')).toHaveAttribute('data-chapter','PLAYER_CONTROL_ENABLED');
     checks.mobile.push({fallback,result:'PASS',world:(await info()).world}); await mobile.close();
   }
   writeFileSync(`${out}/regression.json`,JSON.stringify(checks,null,2));
   console.log('PASS: opening to control; seven male clips; mobile touch and disabled-WebGL skip.');
 }
} finally {await browser.close();}
