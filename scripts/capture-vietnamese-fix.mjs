import {chromium,expect} from '@playwright/test';
import {writeFileSync} from 'node:fs';
const browser=await chromium.launch({headless:true});
try{
const page=await browser.newPage({viewport:{width:1100,height:330}});
await page.goto('http://127.0.0.1:4173/');await page.getByRole('button',{name:'Bắt đầu hành trình',exact:true}).waitFor();
await page.evaluate(()=>{
const panel=document.createElement('section');panel.style.cssText='position:fixed;inset:0;z-index:9999;padding:20px 26px;background:#172d40;color:#f0dfb9';
const text='Đối chiếu · Đề nghị · Về · kế tiếp · hỗ trợ · dự kiến · cô Vân';
for(const [id,title,font]of [['before','Trước — font Georgia gây tách dấu','Georgia'],['after','Sau — font tiếng Việt đầy đủ','LessonSerif']]){
const label=document.createElement('div');label.textContent=title;label.style.cssText='font:16px Arial;color:#a8c6cf;margin-top:6px';panel.append(label);
const line=document.createElement('p');line.id=id;line.textContent=text;line.style.cssText=`font:36px ${font};line-height:1.4;margin:7px 0 18px`;panel.append(line);
}document.body.append(panel);
});
const cdp=await page.context().newCDPSession(page);await cdp.send('DOM.enable');await cdp.send('CSS.enable');const doc=await cdp.send('DOM.getDocument'),fonts={};
for(const id of ['before','after']){const node=await cdp.send('DOM.querySelector',{nodeId:doc.root.nodeId,selector:'#'+id});fonts[id]=(await cdp.send('CSS.getPlatformFontsForNode',{nodeId:node.nodeId})).fonts;}
expect(fonts.after).toHaveLength(1);expect(fonts.after[0].familyName).toContain('Noto Serif');
await page.screenshot({path:'docs/typography-proof/before-after-matched.png'});writeFileSync('docs/typography-proof/paired-fonts.json',JSON.stringify(fonts,null,2));console.log('Matched font screenshot PASS');
}finally{await browser.close();}
