import {readFileSync,existsSync,readdirSync,statSync} from 'node:fs';
const root='docs/art2r/proof/after/';
const read=path=>JSON.parse(readFileSync(root+path,'utf8').replace(/^\uFEFF/,''));
const status=read('status.json');console.log(new Date().toISOString(),JSON.stringify(status));
const log=status.current==='complete'?'menu.log':`${status.current}.log`;
if(existsSync(root+log)){const bytes=readFileSync(root+log);console.log(bytes.toString(bytes[0]===255&&bytes[1]===254?'utf16le':'utf8').replace(/^\uFEFF/,'').split(/\r?\n/).slice(-9).join('\n'));}
if(existsSync(root+'proof-status.json'))console.log('Proof:',JSON.stringify(read('proof-status.json')));
console.log('Recent runtime:',readdirSync(root+'runtime').map(name=>({name,updated:statSync(root+'runtime/'+name).mtime.toISOString()})).sort((a,b)=>b.updated.localeCompare(a.updated)).slice(0,4));
