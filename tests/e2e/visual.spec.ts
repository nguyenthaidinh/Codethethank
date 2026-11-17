import {test,expect} from '@playwright/test';
import {mkdirSync} from 'node:fs';
for(const [width,height] of [[360,800],[390,844],[768,1024],[1280,720],[1440,900]]){
 test(`real screenshots and overflow ${width}x${height}`,async({page})=>{
 await page.setViewportSize({width,height});mkdirSync('docs/screenshots',{recursive:true});await page.goto('/');
 await page.screenshot({path:`docs/screenshots/S00-${width}.png`,fullPage:true});
 await page.getByRole('button',{name:'Chạm lõi AION',exact:false}).click();await page.getByRole('button',{name:'Ai có nguy cơ bị bỏ lại?',exact:true}).click();await page.getByRole('button',{name:'Trở về năm 2026',exact:false}).click();
 for(const name of ['Mục tiêu mô hình','Danh sách bị loại','Giới hạn hỗ trợ'])await page.getByRole('button',{name:`Khám phá ${name}`,exact:true}).click();
 await page.screenshot({path:`docs/screenshots/S02-${width}.png`,fullPage:true});await expect(page.getByRole('button',{name:'Có người vẫn ở lại',exact:false})).toBeEnabled();await page.getByRole('button',{name:'Có người vẫn ở lại',exact:false}).click();await page.getByRole('button',{name:'HỒ SƠ SINH VIÊN',exact:false}).click();await page.getByRole('button',{name:'Thử hồ sơ An',exact:false}).click();await page.getByRole('button',{name:'Điều nó chưa biết là gì?'}).click();
 await page.screenshot({path:`docs/screenshots/S03-${width}.png`,fullPage:true});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 });
}
