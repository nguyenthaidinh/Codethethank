import {chromium,expect} from '@playwright/test';
import {writeFileSync} from 'node:fs';
const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11']});
try {
 for(const mobile of [false,true]) {
  const page=await browser.newPage(mobile?{viewport:{width:390,height:844},isMobile:true,hasTouch:true}:{viewport:{width:1440,height:900}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4231/_research-review.html');
  await page.getByRole('button',{name:'Xem đoạn năm 2029'}).click();
  await page.getByRole('button',{name:'Tiếp tục',exact:true}).click();
  const trigger=page.getByRole('button',{name:'Mở nhật ký thử nghiệm',exact:true});
  await expect(trigger).toBeVisible({timeout:30000});
  await page.waitForTimeout(1600);
  await page.screenshot({path:`docs/research-cinematic-pass/${mobile?'mobile':'desktop'}-desk.png`});
  await trigger.click();
  await expect(page.getByRole('region',{name:'Hai trang nhật ký thử nghiệm'})).toBeVisible();
  await page.waitForTimeout(800);
  await page.screenshot({path:`docs/research-cinematic-pass/${mobile?'mobile':'desktop'}-open.png`});
  await expect(page.getByRole('button',{name:'Bắt đầu thử nghiệm',exact:true})).toBeVisible({timeout:12000});
  await page.waitForTimeout(2200);
  await page.screenshot({path:`docs/research-cinematic-pass/${mobile?"mobile":"desktop"}-2035.png`});
  expect(errors).toEqual([]);
  writeFileSync(`docs/research-cinematic-pass/${mobile?'mobile':'desktop'}.json`,JSON.stringify({result:'PASS',errors,flow:'2029 desk → open notebook → 2035',state:JSON.parse(await page.getByTestId('chapter-telemetry').textContent())},null,2));
  await page.close();
 }
 console.log('PASS: 2029 notebook → 2035, desktop and touch viewport.');
} finally {await browser.close();}
