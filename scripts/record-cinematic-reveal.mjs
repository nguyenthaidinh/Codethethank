import {chromium,expect} from '@playwright/test';
import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {resolve} from 'node:path';
const out=resolve('docs/finale-f5-4-proof/video'),framesDir=resolve('docs/finale-f5-4-proof/recording-frames');
mkdirSync(out,{recursive:true});mkdirSync(framesDir,{recursive:true});
const browser=await chromium.launch({headless:true,args:process.platform==='win32'?['--use-angle=d3d11']:[]});
try{
 const page=await browser.newPage({viewport:{width:1280,height:720}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 const checkpoint=JSON.parse(readFileSync('docs/finale-v5-1-proof/before/checkpoint.json','utf8'));
 checkpoint.chapter.verdict.finale.phase='paper';
 await page.addInitScript(save=>{
  localStorage.setItem('project2011.cinematic.v3',JSON.stringify(save));
  const original=AudioContext.prototype.createMediaStreamDestination;
  AudioContext.prototype.createMediaStreamDestination=function(){const node=original.call(this);window.__roomStream=node.stream;return node;};
 },checkpoint);
 await page.goto('http://127.0.0.1:4194/');
 await page.getByRole('button',{name:'Bật âm thanh',exact:true}).click();
 await page.getByRole('button',{name:'Tiếp tục',exact:true}).click();
 await page.getByTestId('chapter-telemetry').waitFor({state:'attached'});
 await expect.poll(()=>page.evaluate(()=>!!window.__roomStream),{timeout:30000}).toBe(true);
 const cdp=await page.context().newCDPSession(page),frames=[];
 cdp.on('Page.screencastFrame',async e=>{const name=String(frames.length).padStart(6,'0')+'.jpg';writeFileSync(resolve(framesDir,name),Buffer.from(e.data,'base64'));frames.push({name,time:e.metadata.timestamp});await cdp.send('Page.screencastFrameAck',{sessionId:e.sessionId});});
 const audioStart=await page.evaluate(()=>{
  const stream=new MediaStream(window.__roomStream.getAudioTracks().map(t=>t.clone()));
  window.__roomChunks=[];window.__roomRecorder=new MediaRecorder(stream,{mimeType:'audio/webm;codecs=opus'});
  window.__roomRecorder.ondataavailable=e=>{if(e.data.size)window.__roomChunks.push(e.data)};window.__roomRecorder.start(100);return Date.now()/1000;
 });
 await cdp.send('Page.startScreencast',{format:'jpeg',quality:90,maxWidth:1280,maxHeight:720,everyNthFrame:2});
 await expect(page.locator('.chapter')).toHaveAttribute('data-finale','paper',{timeout:30000});
 await page.waitForTimeout(3500);await page.screenshot({path:resolve(out,'player-room-desktop.png')});
 const before=JSON.parse(await page.getByTestId('chapter-telemetry').textContent());
 await page.getByRole('button',{name:'Mở máy tính',exact:true}).hover();await page.waitForTimeout(1200);
 await page.getByRole('button',{name:'Mở máy tính',exact:true}).click();
 await page.waitForTimeout(2200);
 await page.locator('#recipient').fill('Cô Vân');
 await page.locator('#gratitude').pressSequentially('Cảm ơn cô đã ngồi lại cùng em. Một câu hỏi của cô đã giúp em bắt đầu lại.',{delay:35});
 await page.locator('#display-name').fill('Minh');
 await page.screenshot({path:resolve(out,'desktop-live-preview.png')});
 await page.waitForTimeout(1500);
 await page.getByRole('button',{name:'Đọc lại lời cảm ơn',exact:true}).click();
 await page.waitForTimeout(1000);
 await page.getByRole('button',{name:'Tạo ngôi sao riêng tư',exact:true}).click();
 const shots=[];
 for(const threshold of [1.2,5.8]){
  await page.waitForFunction(threshold=>{const s=JSON.parse(document.querySelector('[data-testid="chapter-telemetry"]').textContent);return s.finale.phase!=='transform'||s.time>=threshold},threshold);
  await page.screenshot({path:resolve(out,`reveal-${threshold}.png`)});
  shots.push(JSON.parse(await page.getByTestId('chapter-telemetry').textContent()));
 }
 await expect(page.locator('.chapter')).toHaveAttribute('data-finale','galaxy',{timeout:30000});
 await page.waitForTimeout(1500);await page.screenshot({path:resolve(out,'personal-wall.png')});
 await page.getByRole('button',{name:'Nhìn gần ngôi sao của tôi',exact:true}).click();
 await page.waitForTimeout(2200);await page.screenshot({path:resolve(out,'personal-wall-close.png')});
 const next=page.getByRole('button',{name:'Trang lời nhắn sau',exact:true});if(await next.count()&&!await next.isDisabled()){await next.click();await page.waitForTimeout(2000);}
 await page.getByRole('button',{name:'Đi tiếp cùng ánh sáng',exact:true}).click();
 await page.waitForTimeout(3800);await page.screenshot({path:resolve(out,'camera-withdrawal.png')});
 await expect(page.locator('.chapter')).toHaveAttribute('data-finale','ending',{timeout:20000});
 await page.waitForTimeout(2000);await page.screenshot({path:resolve(out,'ending.png')});
 const after=JSON.parse(await page.getByTestId('chapter-telemetry').textContent());
 await cdp.send('Page.stopScreencast');
 const data=await page.evaluate(async()=>{const r=window.__roomRecorder;await new Promise(resolve=>{r.onstop=resolve;r.stop()});r.stream.getTracks().forEach(t=>t.stop());return Array.from(new Uint8Array(await new Blob(window.__roomChunks,{type:r.mimeType}).arrayBuffer()));});
 writeFileSync(resolve(out,'live-audio.webm'),Buffer.from(data));
 writeFileSync(resolve(framesDir,'frames.txt'),frames.map((f,i)=>`file '${f.name}'\nduration ${i<frames.length-1?Math.max(.001,frames[i+1].time-f.time):.08}\n`).join('')+`file '${frames.at(-1).name}'\n`);
 const offset=Math.max(0,frames[0].time-audioStart);await browser.close();
 const ff=spawnSync('ffmpeg.exe',['-y','-f','concat','-safe','0','-i',resolve(framesDir,'frames.txt'),'-ss',String(offset),'-i',resolve(out,'live-audio.webm'),'-vf','fps=24','-c:v','libx264','-preset','fast','-crf','21','-pix_fmt','yuv420p','-c:a','aac','-b:a','128k','-shortest','-movflags','+faststart',resolve(out,'cinematic-reveal-with-audio.mp4')],{encoding:'utf8',maxBuffer:8e6});
 writeFileSync(resolve(out,'video-encode.log'),ff.stderr??'');if(ff.status!==0)throw Error('ffmpeg failed');
 writeFileSync(resolve(out,'recording.json'),JSON.stringify({capture:'Actual Chromium CDP frames and live master audio bus, no substituted soundtrack. 24fps is export cadence.',frames:frames.length,seconds:frames.at(-1).time-frames[0].time,offset,before,shots,after,errors},null,2));
 expect(errors).toEqual([]);console.log('Recorded',frames.length,'frames');
}finally{await browser.close();}
