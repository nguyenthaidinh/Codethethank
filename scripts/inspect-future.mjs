import {chromium,expect} from '@playwright/test';
import{mkdirSync,writeFileSync}from'node:fs';
const out='docs/art/g2f-proof/runtime';mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true,args:process.platform==='win32'?['--use-angle=d3d11']:[]});
try{
 const page=await browser.newPage({viewport:{width:1280,height:720}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 // Freeze only after a real rendered frame so screenshot readback cannot move
 // a city shot into the atrium. This capture hook is never used for video.
 await page.addInitScript(()=>{
  const raf=window.requestAnimationFrame.bind(window),times=[4,17,28];let index=0;
  window.requestAnimationFrame=callback=>raf(now=>{
   callback(now);
   const node=document.querySelector('[data-testid="chapter-telemetry"]');
   if(!node||index===times.length)return;
   const state=JSON.parse(node.textContent);
   if(state.beat==='OPENING_CINEMATIC'&&state.world?.ready&&state.time>=times[index]){
    index++;setTimeout(()=>{debugger;},0);
   }
  });
 });
 const cdp=await page.context().newCDPSession(page);await cdp.send('Debugger.enable');
 let paused=new Promise(resolve=>cdp.once('Debugger.paused',resolve));
 const navigation=page.goto((process.argv[2]??'http://127.0.0.1:5173')+'/?chapter=1');
 for(const [name,t]of[['city',4],['headquarters',17],['core',28]]){
  let timer;const event=await Promise.race([paused,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Rendered shot not reached: '+name)),90000)})]);clearTimeout(timer);
  const frozen=await cdp.send('Debugger.evaluateOnCallFrame',{callFrameId:event.callFrames[0].callFrameId,expression:'document.querySelector("[data-testid=chapter-telemetry]").textContent',returnByValue:true});
  const state=JSON.parse(frozen.result.value);expect(state.world.place).toBe(name);expect(state.time).toBeGreaterThanOrEqual(t);
  const png=await cdp.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
  writeFileSync(`${out}/${name}.png`,Buffer.from(png.data,'base64'));
  writeFileSync(`${out}/${name}.json`,JSON.stringify({...state,capture:'Paused after actual matching browser frame; no state or pixels modified.'},null,2));
  paused=new Promise(resolve=>cdp.once('Debugger.paused',resolve));await cdp.send('Debugger.resume');
 }
 await navigation;await cdp.detach();
 await expect(page.locator('.chapter')).toHaveAttribute('data-chapter','PLAYER_CONTROL_ENABLED',{timeout:15000});
 await page.getByRole('button',{name:'Khám phá tín hiệu',exact:true}).click();
 await page.getByRole('button',{name:'Điều tra dự đoán ban đầu',exact:true}).click();
 await page.waitForTimeout(1700);await page.screenshot({path:out+'/source.png'});
 await page.getByRole('button',{name:'Đối chiếu kết quả về sau',exact:true}).click();
 await page.waitForTimeout(1000);await page.screenshot({path:out+'/anomaly.png'});
 await page.getByRole('button',{name:'Chạm để mở hồ sơ 2026',exact:false}).click();
 await expect(page.locator('.chapter')).toHaveAttribute('data-chapter','CLASSROOM_EXPLORATION',{timeout:30000});
 writeFileSync(out+'/inspection.json',JSON.stringify({state:JSON.parse(await page.getByTestId('chapter-telemetry').textContent()),errors},null,2));
 await page.screenshot({path:out+'/classroom-preserved.png'});expect(errors).toEqual([]);console.log('Future inspected',errors);
}finally{await browser.close()}
