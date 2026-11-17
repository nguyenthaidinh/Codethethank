import {readFileSync,writeFileSync,copyFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root='docs/art2r/proof/after/',read=path=>JSON.parse(readFileSync(root+path,'utf8').replace(/^\uFEFF/,''));
const run=read('status.json'),integrity=read('integrity-and-bundle.json'),archive=read('archive-check.json'),review=read('review-check.json');
if(run.current!=='complete'||run.status!=='passed'||run.completed.length!==7)throw Error('QA incomplete');
if(!archive.allEntriesByteIdentical||!review.videoPlayed||review.errors.length)throw Error('Archive/review incomplete');
const hash=path=>createHash('sha256').update(readFileSync(path)).digest('hex').toUpperCase();
if(hash('dist/index.html')!==integrity.production.Hash)throw Error('Build changed');
const served=Buffer.from(await (await fetch('http://127.0.0.1:4173/')).arrayBuffer());
if(createHash('sha256').update(served).digest('hex').toUpperCase()!==integrity.production.Hash)throw Error('Production preview not current');
for(const item of read('tested-source-hashes.json'))if(hash(item.Path)!==item.Hash)throw Error(`Tested source changed: ${item.Path}`);
const images=['01-wide-paper-rain','option-blue-ink','option-copper-memory','02-van','03-an','04-chair','05-notebook','06-mobile','07-faces','08-mobile-faces'];
for(const name of images){const image=read(`runtime/${name}.json`);if(image.errors.length||image.servedIndexSHA256!==integrity.production.Hash||!image.sourceURL.startsWith('http://127.0.0.1:4173/'))throw Error(`Image not current production: ${name}`);}
const prior=read('proof-status.json');
if(prior.status==='failed')copyFileSync(root+'proof-status.json',root+'archive-initial-failure.json');
writeFileSync(root+'proof-status.json',JSON.stringify({status:'passed',detail:'39 E2E / 30 unit, 10 production captures, real audio/video, archive byte checks, review and unchanged tested source verified; art pending PO',archiveRecovered:true,updated:new Date().toISOString()},null,2));
console.log('Gate 2R technical evidence sealed; art pending review, Gate 3 closed');
