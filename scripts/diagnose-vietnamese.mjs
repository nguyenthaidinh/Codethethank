import {chromium} from '@playwright/test';
import {mkdirSync,writeFileSync} from 'node:fs';
const out='docs/typography-proof';mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true});
try{
const page=await browser.newPage({viewport:{width:1050,height:500}});
await page.setContent('<body style="background:#172d40;color:#f0dfb9;padding:20px"><p id="georgia" style="font:36px Georgia">Đối chiếu · Đề nghị · Về · kế tiếp · hỗ trợ · dự kiến · cô Vân</p><p id="times" style="font:36px Times New Roman">Đối chiếu · Đề nghị · Về · kế tiếp · hỗ trợ · dự kiến · cô Vân</p><p id="arial" style="font:36px Arial">Đối chiếu · Đề nghị · Về · kế tiếp · hỗ trợ · dự kiến · cô Vân</p></body>');
const cdp=await page.context().newCDPSession(page);await cdp.send('DOM.enable');await cdp.send('CSS.enable');
const doc=await cdp.send('DOM.getDocument'),result={};
for(const id of ['georgia','times','arial']){const node=await cdp.send('DOM.querySelector',{nodeId:doc.root.nodeId,selector:'#'+id});result[id]=await cdp.send('CSS.getPlatformFontsForNode',{nodeId:node.nodeId});}
await page.screenshot({path:out+'/before-fonts.png'});writeFileSync(out+'/before-fonts.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
}finally{await browser.close();}
