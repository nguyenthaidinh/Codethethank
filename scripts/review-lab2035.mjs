import {chromium,expect} from '@playwright/test';
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
const out='docs/lab2035-pass';mkdirSync(out,{recursive:true});
const base=JSON.parse(readFileSync('docs/future-late-art-pass/checkpoint.json','utf8'));
base.chapter.verdict.ripple={version:1,phase:'years',questions:['prediction','opportunity'],milestones:1,memories:[],selected:null,elapsed:0,played:[]};
const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11']});
const state=async p=>JSON.parse(await p.getByTestId('chapter-telemetry').textContent());
const button=(p,name)=>p.getByRole('button',{name,exact:true});
const trial=async(p,n)=>expect.poll(async()=>(await state(p)).ripple.lab2035.trials,{timeout:12000}).toContain(n);
async function enter(p,save=base){await p.goto('http://127.0.0.1:4198/');await p.evaluate(v=>localStorage.setItem('project2011.cinematic.v3',JSON.stringify(v)),save);await p.reload();await button(p,'Tiếp tục').click();}
async function start(p){await button(p,'Bắt đầu thử nghiệm').click({timeout:20000});await expect(p.getByRole('region',{name:'Bàn thử nghiệm năm 2035'})).toBeVisible();}
async function drag(p,name){const a=await button(p,name).boundingBox(),b=await p.getByTestId('lab2035-input').boundingBox();await p.mouse.move(a.x+a.width*.4,a.y+a.height*.4);await p.mouse.down();await p.mouse.move(b.x+b.width*.5,b.y+b.height*.5,{steps:12});await p.mouse.up();}
try {
 const ctx=await browser.newContext({viewport:{width:1440,height:900},recordVideo:{dir:out,size:{width:1280,height:800}}}),p=await ctx.newPage(),errors=[];
 p.on('pageerror',e=>errors.push(e.message));await enter(p);await start(p);
 await expect(button(p,'Chạy thử nghiệm')).toBeDisabled();await p.screenshot({path:`${out}/desktop-start.png`});
 await drag(p,'Dữ liệu học tập');await expect(button(p,'Dữ liệu học tập')).toHaveAttribute('aria-pressed','true');
 await button(p,'Chạy thử nghiệm').click();await trial(p,1);await p.screenshot({path:`${out}/desktop-control.png`});
 await p.waitForTimeout(6500);expect((await state(p)).ripple.phase).toBe('years');
 await drag(p,'Nhật ký dùng máy');await button(p,'Chạy thử nghiệm').click();
 await expect.poll(async()=>(await state(p)).ripple.lab2035.running?.elapsed??0,{timeout:3000}).toBeGreaterThan(.3);
 await p.reload();await button(p,'Tiếp tục').click();await trial(p,3);
 await p.screenshot({path:`${out}/desktop-compared.png`});
 await button(p,'Đánh dấu dữ liệu bị bỏ sót ↗').click();await expect(button(p,'Tiếp: sửa logic')).toBeVisible();
 await p.screenshot({path:`${out}/desktop-discovery.png`});await button(p,'Tiếp: sửa logic').click();await button(p,'Bỏ qua thử thách code').click();
 await expect(p.locator('.chapter')).toHaveAttribute('data-ripple','milestone');
 await expect.poll(async()=>(await state(p)).ripple.milestones,{timeout:15000}).toBe(2);
 expect(errors).toEqual([]);writeFileSync(`${out}/desktop.json`,JSON.stringify({result:'PASS',errors,state:await state(p)},null,2));
 const video=p.video();await ctx.close();await video.saveAs(`${out}/desktop-muted.webm`);
 for(const fallback of [false,true]){
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'}),m=await context.newPage(),failures=[];
  m.on('pageerror',e=>failures.push(e.message));
  if(fallback)await m.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(...args){return String(args[0]).includes('webgl')?null:original.apply(this,args);};});
  await enter(m,{...base,reduced:true});await start(m);
  // Contextual trial first proves that the game is not a fixed click sequence.
  await button(m,'Dữ liệu học tập').tap();await button(m,'Nhật ký dùng máy').tap();await button(m,'Chạy thử nghiệm').tap();await trial(m,3);
  await button(m,'Nhật ký dùng máy').tap();await button(m,'Chạy thử nghiệm').focus();await m.keyboard.press('Enter');await trial(m,1);
  await m.screenshot({path:`${out}/${fallback?'fallback':'mobile'}-compared.png`});
  await button(m,'Đánh dấu dữ liệu bị bỏ sót ↗').tap();await button(m,'Tiếp: sửa logic').tap();await button(m,'Bỏ qua thử thách code').tap();
  await expect(m.locator('.chapter')).toHaveAttribute('data-ripple','milestone');expect(failures).toEqual([]);
  writeFileSync(`${out}/${fallback?'fallback':'mobile'}.json`,JSON.stringify({result:'PASS',errors:failures,state:await state(m)},null,2));await context.close();
 }
 console.log('PASS: desktop drag/drop, baseline/context experiments, mid-run reload, no auto-skip, discovery → 2045; reverse-order touch/keyboard reduced-motion + Canvas fallback.');
}finally{await browser.close();}
