import {chromium,expect} from '@playwright/test';
import {writeFileSync} from 'node:fs';
const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11']});
try{
 const page=await browser.newPage({viewport:{width:1280,height:720}}),errors=[],voices=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{if(r.url().includes('/voice/'))voices.push(r.url());});
 await page.goto('http://127.0.0.1:4227/');
 await page.getByRole('button',{name:'Bật âm thanh',exact:true}).click();
 await page.getByRole('button',{name:'Bắt đầu hành trình',exact:true}).click();
 await expect(page.locator('.chapter')).toHaveAttribute('data-chapter','PLAYER_CONTROL_ENABLED',{timeout:65000});
 const state=JSON.parse(await page.getByTestId('chapter-telemetry').textContent());
 expect(state.voice.started).toBe(7);expect(state.voice.completed).toBe(7);
 expect(voices.every(url=>url.includes('/vi-andrew-fast/'))).toBe(true);expect(errors).toEqual([]);
 await page.screenshot({path:'docs/opening-pace-pass/runtime.png'});
 writeFileSync('docs/opening-pace-pass/runtime.json',JSON.stringify({result:'PASS',errors,voices,state},null,2));
 console.log('PASS: faster opening → control; all seven Andrew clips completed.');
}finally{await browser.close();}
