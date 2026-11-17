import {chromium,expect} from '@playwright/test';
import {mkdirSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {resolve} from 'node:path';
const out=resolve('docs/art/g2f1-proof/runtime'),framesDir=resolve('test-results/g2f1-recording-frames');
mkdirSync(out,{recursive:true});mkdirSync(framesDir,{recursive:true});
const browser=await chromium.launch({headless:true,args:process.platform==='win32'?['--use-angle=d3d11']:[]});
try {
 const page=await browser.newPage({viewport:{width:1280,height:720}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{
  const original=AudioContext.prototype.createMediaStreamDestination;
  AudioContext.prototype.createMediaStreamDestination=function(){const node=original.call(this);window.__openingStream=node.stream;return node;};
 });
 await page.goto('http://127.0.0.1:4173/');
 await page.getByRole('button',{name:'Bật âm thanh',exact:true}).click();
 await page.getByRole('button',{name:'Bắt đầu hành trình',exact:true}).click();
 await page.getByTestId('chapter-telemetry').waitFor({state:'attached'});
 await expect.poll(async()=>JSON.parse(await page.getByTestId('chapter-telemetry').textContent()).world?.ready,{timeout:40000}).toBe(true);
 const hardware=await page.evaluate(()=>{const gl=document.querySelector('.chapter-future').getContext('webgl2'),debug=gl?.getExtension('WEBGL_debug_renderer_info');return{renderer:debug?gl.getParameter(debug.UNMASKED_RENDERER_WEBGL):'unavailable',userAgent:navigator.userAgent}});
 const cdp=await page.context().newCDPSession(page),frames=[];
 cdp.on('Page.screencastFrame',async e=>{
  const name=String(frames.length).padStart(6,'0')+'.jpg';
  writeFileSync(resolve(framesDir,name),Buffer.from(e.data,'base64'));frames.push({name,time:e.metadata.timestamp});
  await cdp.send('Page.screencastFrameAck',{sessionId:e.sessionId});
 });
 const audioStart=await page.evaluate(()=>{
  const stream=new MediaStream(window.__openingStream.getAudioTracks().map(t=>t.clone()));
  window.__openingChunks=[];window.__openingRecorder=new MediaRecorder(stream,{mimeType:'audio/webm;codecs=opus'});
  window.__openingRecorder.ondataavailable=e=>{if(e.data.size)window.__openingChunks.push(e.data)};
  window.__openingRecorder.start(100);return Date.now()/1000;
 });
 await cdp.send('Page.startScreencast',{format:'jpeg',quality:86,maxWidth:1280,maxHeight:720,everyNthFrame:2});
 const click=name=>page.getByRole('button',{name,exact:true}).click({timeout:60000});
 await click('Khám phá tín hiệu');await click('Điều tra dự đoán ban đầu');await page.waitForTimeout(10500);
 await page.screenshot({path:resolve(out,'source.png')});
 await click('Đối chiếu kết quả về sau');await page.waitForTimeout(10500);
 await page.screenshot({path:resolve(out,'anomaly.png')});
 const investigation=JSON.parse(await page.getByTestId('chapter-telemetry').textContent());
 await page.getByRole('button',{name:'Chạm để mở hồ sơ 2026',exact:false}).click();
 const transition=[];
 for(const threshold of [3.2,5.7]){
  await page.waitForFunction(t=>{const s=JSON.parse(document.querySelector('[data-testid=chapter-telemetry]').textContent);return s.beat==='MEMORY_TRANSITION'&&s.time>=t;},threshold,{timeout:15000});
  transition.push(JSON.parse(await page.getByTestId('chapter-telemetry').textContent()));
 }
 await expect(page.locator('.chapter')).toHaveAttribute('data-chapter','CLASSROOM_EXPLORATION',{timeout:40000});
 await page.waitForTimeout(1500);await page.screenshot({path:resolve(out,'classroom-preserved.png')});
 const final=JSON.parse(await page.getByTestId('chapter-telemetry').textContent());
 await cdp.send('Page.stopScreencast');
 const data=await page.evaluate(async()=>{
  const r=window.__openingRecorder;await new Promise(resolve=>{r.onstop=resolve;r.stop()});r.stream.getTracks().forEach(t=>t.stop());
  return Array.from(new Uint8Array(await new Blob(window.__openingChunks,{type:r.mimeType}).arrayBuffer()));
 });
 writeFileSync(resolve(out,'live-audio.webm'),Buffer.from(data));
 const offsets=frames.map((f,i)=>({file:f.name,duration:i<frames.length-1?Math.max(.001,frames[i+1].time-f.time):.08}));
 writeFileSync(resolve(framesDir,'frames.txt'),offsets.map(f=>`file '${f.file}'\nduration ${f.duration}\n`).join('')+`file '${frames.at(-1).name}'\n`);
 const offset=Math.max(0,frames[0].time-audioStart);
 await browser.close(); // Release live rendering before encoding captured media.
 const ff=spawnSync('ffmpeg.exe',['-y','-f','concat','-safe','0','-i',resolve(framesDir,'frames.txt'),'-ss',String(offset),'-i',resolve(out,'live-audio.webm'),'-vf','fps=24','-c:v','libx264','-preset','fast','-crf','22','-pix_fmt','yuv420p','-c:a','aac','-b:a','128k','-shortest','-movflags','+faststart',resolve(out,'opening-runtime-with-audio.mp4')],{encoding:'utf8',maxBuffer:8e6});
 writeFileSync(resolve(out,'video-encode.log'),ff.stderr??'');if(ff.status!==0)throw Error('ffmpeg failed');
 writeFileSync(resolve(out,'recording.json'),JSON.stringify({capture:'Actual Chromium CDP frames, including game UI, muxed with the live chapter master audio bus. fps=24 is encoding cadence, not a claimed render rate.',hardware,frames:frames.length,seconds:frames.at(-1).time-frames[0].time,audioVideoOffset:offset,investigation,transition,final,errors},null,2));
 expect(errors).toEqual([]);console.log('Recorded',frames.length,'frames',frames.at(-1).time-frames[0].time,'seconds');
}finally{await browser.close();}
