import { chromium, expect } from '@playwright/test';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
const mode=process.argv[2]??'after',out=`docs/future-chair-pass/${mode}`;
mkdirSync(out,{recursive:true});
const base=JSON.parse(readFileSync('docs/future-late-art-pass/checkpoint.json','utf8'));
base.chapter.verdict.ripple.phase='approach';base.muted=false;
const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11']});
try {
 const ctx=await browser.newContext({viewport:{width:1440,height:900}}),page=await ctx.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{const original=AudioContext.prototype.createMediaStreamDestination;AudioContext.prototype.createMediaStreamDestination=function(){const result=original.call(this);window.reviewAudio=result.stream;return result;};});
 await page.goto('http://127.0.0.1:4231/');await page.evaluate(save=>localStorage.setItem('project2011.cinematic.v3',JSON.stringify(save)),base);await page.reload();
 const unmute=page.getByRole('button',{name:'Bật âm thanh',exact:true});
 if(mode==='after'&&await unmute.isVisible())await unmute.click();
 await page.getByRole('button',{name:'Tiếp tục',exact:true}).click();
 if(mode==='after'&&await unmute.isVisible())await unmute.click();
 const phase=async name=>expect(page.locator('.chapter')).toHaveAttribute('data-ripple',name,{timeout:25000});
 await phase('approach');
 if(mode==='after')await page.evaluate(()=>{const stream=document.querySelector('.chapter-room').captureStream(15);if(!window.reviewAudio?.getAudioTracks().length)throw new Error('Game audio capture is unavailable');window.reviewAudio.getAudioTracks().forEach(track=>stream.addTrack(track.clone()));window.reviewChunks=[];window.reviewRecorder=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp8,opus',videoBitsPerSecond:1800000});window.reviewRecorder.ondataavailable=e=>window.reviewChunks.push(e.data);window.reviewRecorder.start(1000);});
 await page.waitForTimeout(1600);await page.screenshot({path:`${out}/approach.png`});
 await phase('chair');await page.waitForTimeout(600);await page.screenshot({path:`${out}/chair-pull.png`});
 await page.waitForTimeout(3000);await page.screenshot({path:`${out}/chair-seated.png`});
 await phase('reflection');await page.waitForTimeout(900);await page.screenshot({path:`${out}/two-shot.png`});
 await phase('reconstruct');
 if(mode==='after'){
  const result=await page.evaluate(async()=>{const recorder=window.reviewRecorder;await new Promise(resolve=>{recorder.onstop=resolve;recorder.stop();});return await new Promise(resolve=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.readAsDataURL(new Blob(window.reviewChunks));});});
  writeFileSync(`${out}/chair-live-audio.webm`,Buffer.from(result,'base64'));
  for(const name of ['Chạm hồ sơ đánh giá 2026','Chạm chiếc ghế được giữ lại','Chạm cuốn sổ thiết kế'])await page.getByRole('button',{name,exact:true}).click();
  await page.getByRole('button',{name:'Khớp ba ký ức',exact:false}).click();await phase('principle');
 }
 const telemetry=JSON.parse(await page.getByTestId('chapter-telemetry').textContent());
 expect(telemetry.ripple.played.filter(id=>id==='chair.chair')).toHaveLength(1);expect(errors).toEqual([]);
 writeFileSync(`${out}/runtime.json`,JSON.stringify({result:'PASS',errors,telemetry},null,2));
 await ctx.close();console.log(`PASS: ${mode} approach → echo → chair → reflection → reconstruct${mode==='after'?' → principle with live audio capture':''}`);
 if(mode==='after') {
  const touch=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'}),p=await touch.newPage();
  const save=structuredClone(base);save.muted=true;save.reduced=true;save.chapter.verdict.ripple.phase='chair';
  const failures=[];p.on('pageerror',e=>failures.push(e.message));
  await p.goto('http://127.0.0.1:4231/');await p.evaluate(value=>localStorage.setItem('project2011.cinematic.v3',JSON.stringify(value)),save);await p.reload();
  await p.getByRole('button',{name:'Tiếp tục',exact:true}).tap();
  await expect(p.locator('.chapter')).toHaveAttribute('data-ripple','chair',{timeout:15000});
  await p.waitForTimeout(1200);await p.screenshot({path:`${out}/portrait-reduced.png`});
  await p.reload();await p.getByRole('button',{name:'Tiếp tục',exact:true}).tap();
  await expect(p.locator('.chapter')).toHaveAttribute('data-ripple','reflection',{timeout:15000});
  const state=JSON.parse(await p.getByTestId('chapter-telemetry').textContent());
  expect(state.ripple.played.filter(id=>id==='chair.chair')).toHaveLength(1);expect(state.audio).toBeNull();expect(failures).toEqual([]);
  writeFileSync(`${out}/touch-resume.json`,JSON.stringify({result:'PASS',errors:failures,telemetry:state},null,2));
  await touch.close();console.log('PASS: touch + reduced motion + mute + reload during chair; cue remains idempotent.');
 }
}finally{await browser.close();}
