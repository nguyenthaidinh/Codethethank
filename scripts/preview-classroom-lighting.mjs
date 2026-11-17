import {chromium,expect} from '@playwright/test';
import {mkdirSync,writeFileSync} from 'node:fs';
const out=process.env.CHAIR_OUT||'docs/ui-chair-polish-proof/before';mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11']});
const save={version:3,beat:'explore',observed:[],selected:false,focus:'wide',reduced:false,muted:true,captions:true,voice:true,volume:.8,music:true,sfx:true,chapter:{version:1,beat:'NEXT_SCENE_READY',signal:true,evidence:['clock','notebook','laptop'],verdict:{version:1,narrativeRevision:4,phase:'chapter02',found:['presentation','notes','data'],selected:'an',tested:['student07','an'],linked:['presentation','notes'],carried:null,stayed:{version:1,narrativeRevision:4,phase:'question',line:1,read:[],page:null,written:false,seen:[],nextInspected:false}}}};
try { for(const mobile of [false,true]){
const page=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:1280,height:720},isMobile:mobile,hasTouch:mobile});
await page.goto(process.env.CHAIR_URL||'http://127.0.0.1:5173/');
await page.evaluate(s=>localStorage.setItem('project2011.cinematic.v3',JSON.stringify(s)),save);await page.reload();
await page.getByRole('button',{name:'Tiếp tục',exact:true}).click();
await expect(page.locator('.chapter')).toHaveAttribute('data-stayed','question',{timeout:45000});
await expect.poll(async()=>JSON.parse(await page.getByTestId('chapter-telemetry').textContent()).world?.shot).toBe('conversation.master');
await expect(page.locator('.menu-game-reveal')).toBeHidden({timeout:10000}); await page.waitForTimeout(400);await page.screenshot({path:`${out}/${mobile?'mobile':'desktop'}-two-shot.png`});
writeFileSync(`${out}/${mobile?'mobile':'desktop'}.json`,await page.getByTestId('chapter-telemetry').textContent());await page.close();
}} finally {await browser.close();}

