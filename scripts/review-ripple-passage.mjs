import {chromium,expect} from '@playwright/test';
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
const out='docs/ripple-time-pass';mkdirSync(out,{recursive:true});
const base=JSON.parse(readFileSync('docs/future-late-art-pass/checkpoint.json','utf8'));
base.chapter.verdict.ripple={version:1,phase:'sketch',questions:[],milestones:0,memories:[],selected:null,elapsed:0,played:[]};
const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11']});
try {
 const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4198/');await page.evaluate(save=>localStorage.setItem('project2011.cinematic.v3',JSON.stringify(save)),base);await page.reload();await page.getByRole('button',{name:'Tiếp tục',exact:true}).click();
 const phase=async name=>expect(page.locator('.chapter')).toHaveAttribute('data-ripple',name,{timeout:25000});
 const inspect=page.getByRole('button',{name:'Khôi phục HUMAN REVIEW',exact:true});
 await phase('sketch');await expect(inspect).toBeDisabled();
 await page.getByRole('button',{name:'Ai dễ tiến bộ nhất?',exact:true}).focus();await page.keyboard.press('Enter');await expect(inspect).toBeDisabled();
 await page.getByRole('button',{name:'Ai còn cần cơ hội?',exact:true}).click();await expect(inspect).toBeEnabled();
 await page.screenshot({path:`${out}/sketch.png`});await inspect.click();await phase('change');
 for(const [i,name]of ['Mở nhật ký thử nghiệm','Bắt đầu thử nghiệm','Mở sổ kiểm thử trước ra mắt'].entries()) {
  await phase('years');await expect(page.locator('.ripple-time-passage')).toHaveAttribute('data-year',String([2029,2035,2045][i]));
  await page.waitForTimeout(500);await page.screenshot({path:`${out}/year-${[2029,2035,2045][i]}.png`});
  await expect(page.locator('.ripple-time-passage')).toHaveCount(0,{timeout:8000});
  await page.getByRole('button',{name,exact:true}).click();
  if(i===1){
   const click=async name=>page.getByRole('button',{name,exact:true}).click();
   await click('Dữ liệu học tập');await click('Chạy thử nghiệm');
   await expect(page.getByRole('article',{name:'Kết quả A'})).toContainText('NOT RECOMMENDED',{timeout:12000});
   await click('Nhật ký dùng máy');await click('Chạy thử nghiệm');
   await expect(page.getByRole('article',{name:'Kết quả B'})).toContainText('REVIEW REQUIRED',{timeout:12000});
   await click('Đánh dấu dữ liệu bị bỏ sót ↗');await click('Tiếp: sửa logic');await click('Bỏ qua thử thách code');
  }
  await phase('milestone');
 }
 await phase('world');await page.waitForTimeout(600);await page.screenshot({path:`${out}/year-2046.png`});
 await expect(page.locator('.ripple-time-passage')).toHaveCount(0,{timeout:8000});await page.waitForTimeout(400);
 await page.screenshot({path:`${out}/aion-introduction.png`});await phase('record');
 const state=JSON.parse(await page.getByTestId('chapter-telemetry').textContent());expect(state.ripple.milestones).toBe(3);expect(state.ripple.questions).toHaveLength(2);expect(errors).toEqual([]);
 writeFileSync(`${out}/desktop.json`,JSON.stringify({result:'PASS',errors,state},null,2));await page.close();
 const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
 await mobile.goto('http://127.0.0.1:4198/');await mobile.evaluate(save=>localStorage.setItem('project2011.cinematic.v3',JSON.stringify(save)),base);await mobile.reload();await mobile.getByRole('button',{name:'Tiếp tục',exact:true}).tap();
 for(const name of ['Ai dễ tiến bộ nhất?','Ai còn cần cơ hội?'])await mobile.getByRole('button',{name,exact:true}).tap();
 await mobile.screenshot({path:`${out}/mobile-sketch.png`});await mobile.getByRole('button',{name:'Khôi phục HUMAN REVIEW',exact:true}).tap();
 await expect(mobile.locator('.chapter')).toHaveAttribute('data-ripple','years',{timeout:15000});
 await expect(mobile.locator('.ripple-time-passage')).toHaveClass(/is-still/);await mobile.waitForTimeout(400);await mobile.screenshot({path:`${out}/mobile-year.png`});
 await expect(mobile.getByRole('button',{name:'Mở nhật ký thử nghiệm',exact:true})).toBeVisible({timeout:5000});
 await mobile.reload();await mobile.getByRole('button',{name:'Tiếp tục',exact:true}).tap();
 await expect(mobile.getByRole('button',{name:'Mở nhật ký thử nghiệm',exact:true})).toBeVisible({timeout:8000});
 await mobile.close();console.log('PASS: clear two-note interaction, keyboard, 2029 → 2035 → 2045 → 2046 transitions, AION intro, touch/reduced-motion and year resume.');
} finally {await browser.close();}
