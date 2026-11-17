import { chromium, expect } from '@playwright/test';
import { writeFileSync } from 'node:fs';
const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11']});
const checks=[];
try {
  for(const fallback of [false,true]) {
    const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    if(fallback) await page.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(kind,...args){return kind==='webgl2'||kind==='webgl'?null:get.call(this,kind,...args);};});
    await page.goto('http://127.0.0.1:4221/');
    await page.getByRole('button',{name:'Bắt đầu hành trình',exact:true}).tap();
    const state=async()=>JSON.parse(await page.getByTestId('chapter-telemetry').textContent());
    await expect(page.locator('.chapter')).toHaveAttribute('data-chapter','OPENING_CINEMATIC',{timeout:30000});
    if(fallback) await expect.poll(async()=>(await state()).world?.renderer).toBe('future-canvas-fallback');
    else await expect.poll(async()=>(await state()).world?.ready,{timeout:40000}).toBe(true);
    await page.getByRole('button',{name:'Bỏ qua cinematic',exact:true}).tap();
    await expect(page.locator('.chapter')).toHaveAttribute('data-chapter','PLAYER_CONTROL_ENABLED');
    expect(errors).toEqual([]);
    checks.push({fallback,result:'PASS',errors,state:await state()});
    await page.close();
  }
  writeFileSync('docs/opening-performance-pass/mobile.json',JSON.stringify(checks,null,2));
  console.log('PASS: touch/reduced-motion preference, WebGL and Canvas, skip to control.');
}finally{await browser.close();}
