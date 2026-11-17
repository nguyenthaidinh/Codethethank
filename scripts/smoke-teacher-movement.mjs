import {chromium,expect} from '@playwright/test';
import {writeFileSync} from 'node:fs';
const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11']});
try {
 const page=await browser.newPage({viewport:{width:1280,height:720}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.goto('http://127.0.0.1:4218/_motion-preview.html');
 await page.getByRole('button',{name:'Chơi đoạn lớp học'}).click();
 await page.getByRole('button',{name:'Tiếp tục',exact:true}).click();
 const state=async()=>JSON.parse(await page.getByTestId('chapter-telemetry').textContent());
 await expect.poll(async()=>(await state()).verdict?.phase,{timeout:20000}).toBe('teacher_enter');
 await page.waitForTimeout(4200);await page.screenshot({path:'docs/movement-pass/entrance.png'});
 await expect(page.locator('.chapter')).toHaveAttribute('data-stayed','chair',{timeout:30000});
 await expect.poll(async()=>(await state()).time).toBeGreaterThan(3);
 await page.screenshot({path:'docs/movement-pass/sitting.png'});
 await expect(page.locator('.chapter')).toHaveAttribute('data-stayed','question',{timeout:15000});
 await expect.poll(async()=>(await state()).stayed?.line,{timeout:15000}).toBe(1);
 await page.screenshot({path:'docs/movement-pass/seated.png'});
 expect(errors).toEqual([]);
 writeFileSync('docs/movement-pass/smoke.json',JSON.stringify({errors,final:await state(),result:'PASS: entrance → discussion → chair → question'},null,2));
} finally {await browser.close();}
