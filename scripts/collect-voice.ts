import {writeFileSync} from 'node:fs';
import {narration} from '../src/future/direction';
import {speechText,speechKey} from '../src/speech/text';
const lines=Object.fromEntries(narration.filter(line=>line.speaker==='NGƯỜI DẪN').map(line=>{const text=speechText(line.text);return [speechKey(text),{text,caption:line.text}]}));
writeFileSync('.voice-build/lines.json',JSON.stringify(lines,null,2));
console.log('Opening narrator only:',Object.keys(lines).length,'clips');
