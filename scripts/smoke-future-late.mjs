import {chromium,expect} from '@playwright/test';
import {readFileSync,writeFileSync} from 'node:fs';
const base=JSON.parse(readFileSync('docs/future-late-art-pass/checkpoint.json','utf8'));
const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11']});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4231/');
 await page.evaluate(save=>localStorage.setItem('project2011.cinematic.v3',JSON.stringify(save)),base);await page.reload();
 await page.getByRole('button',{name:'Tiếp tục',exact:true}).click();
 const state=async()=>JSON.parse(await page.getByTestId('chapter-telemetry').textContent());
 await expect.poll(async()=>(await state()).ripple?.phase,{timeout:30000}).toBe('record');
 await page.waitForTimeout(1800);await page.screenshot({path:'docs/future-late-art-pass/desktop-record.png'});
 await page.getByRole('button',{name:'Đối chiếu hồ sơ nhà sáng lập',exact:false}).click();
 await expect.poll(async()=>(await state()).ripple?.phase,{timeout:15000}).toBe('reveal');
 await page.waitForTimeout(5700);await page.screenshot({path:'docs/future-late-art-pass/desktop-reveal.png'});
 await expect.poll(async()=>(await state()).ripple?.phase,{timeout:45000}).toBe('reconstruct');
 await page.waitForTimeout(1700);await page.screenshot({path:'docs/future-late-art-pass/desktop-memories.png'});
 for(const name of ['Chạm hồ sơ đánh giá 2026','Chạm chiếc ghế được giữ lại','Chạm cuốn sổ thiết kế'])await page.getByRole('button',{name,exact:true}).click();
 await page.getByRole('button',{name:'Khớp ba ký ức',exact:false}).click();
 await expect.poll(async()=>(await state()).ripple?.phase).toBe('principle');
 expect(errors).toEqual([]);
 writeFileSync('docs/future-late-art-pass/desktop.json',JSON.stringify({result:'PASS',errors,state:await state()},null,2));await page.close();
 const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 await mobile.goto('http://127.0.0.1:4231/');await mobile.evaluate(save=>localStorage.setItem('project2011.cinematic.v3',JSON.stringify(save)),base);await mobile.reload();await mobile.getByRole('button',{name:'Tiếp tục',exact:true}).tap();
 await expect(mobile.getByRole('button',{name:'Đối chiếu hồ sơ nhà sáng lập',exact:false})).toBeVisible({timeout:30000});await mobile.waitForTimeout(1800);await mobile.screenshot({path:'docs/future-late-art-pass/mobile-record.png'});await mobile.close();
 console.log('PASS: 2046 record → reveal → chair callback → three memories → principle; mobile record UI.');
}finally{await browser.close();}
