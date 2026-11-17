import {readdirSync,readFileSync,writeFileSync} from 'node:fs';
const walk=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(dir+'/'+e.name):[dir+'/'+e.name]);
const changed=[];
for(const path of walk('src').filter(path=>/\.(tsx?|css)$/.test(path)&&!path.startsWith('src/typography/'))){
 const old=readFileSync(path,'utf8');let next=old.replace(/\bGeorgia\b/g,'LessonSerif');
 // The English-only title treatment is unrelated to the Vietnamese glyph fallback bug.
 if(path==='src/menu/menu.css')next=next.replace('font-family: LessonSerif, "Times New Roman", serif;','font-family: Georgia, "Times New Roman", serif;');
 if(path==='src/cinematic/WorldRenderer.ts')next=next.normalize('NFC');
 if(next!==old){writeFileSync(path,next);changed.push(path);}
}
const index=readFileSync('index.html','utf8');
if(!index.includes('/fonts/lesson-serif-vi-normal.woff2'))writeFileSync('index.html',index.replace('</head>','<link rel="preload" href="/fonts/lesson-serif-vi-normal.woff2" as="font" type="font/woff2" crossorigin/><link rel="preload" href="/fonts/lesson-serif-vi-italic.woff2" as="font" type="font/woff2" crossorigin/></head>'));
for(const path of ['index.html','docs/art/REVIEW.html','docs/art2r/REVIEW.html']){
 let html=readFileSync(path,'utf8');
 if(!html.includes('/fonts/lesson-serif.css'))html=html.includes('</head>')?html.replace('</head>','<link rel="stylesheet" href="/fonts/lesson-serif.css"/></head>'):html.replace('<style>','<link rel="stylesheet" href="/fonts/lesson-serif.css"/><style>');
 if(path!=='index.html')html=html.replace(/\bGeorgia\b/g,'LessonSerif,"Times New Roman"');
 writeFileSync(path,html);
}
console.log(changed.join('\n'));
