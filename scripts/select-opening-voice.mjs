import { readFileSync, writeFileSync, mkdirSync, renameSync, existsSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
const lines = JSON.parse(readFileSync('.voice-build/lines.json', 'utf8'));
if (Object.keys(lines).length !== 7) throw Error('Expected seven opening narrator cues');
const catalog = JSON.parse(readFileSync('src/speech/catalog.json', 'utf8'));
const manifest = JSON.parse(readFileSync('docs/voice-school-proof/voice-manifest.json', 'utf8'));
const selected = Object.fromEntries(Object.keys(lines).map((key) => {
  if (!catalog[key] || !existsSync('public/' + catalog[key].file)) throw Error('Missing opening clip');
  return [key, catalog[key]];
}));
const original = resolve('public/voice/vi'), retired = resolve('docs/voice-school-proof/retired-dialogue');
mkdirSync(retired, { recursive: true });
let moved = 0;
for (const file of readdirSync(original)) {
  if (!/^[a-f0-9]{8}\.mp3$/.test(file) || selected[file.slice(0, -4)]) continue;
  const source = join(original, file), destination = join(retired, file);
  if (existsSync(destination)) throw Error('Retired file already exists: ' + file);
  renameSync(source, destination); moved++;
}
writeFileSync('src/speech/catalog.json', JSON.stringify(selected, null, 2));
writeFileSync('docs/opening-readability-proof/voice-manifest.json', JSON.stringify({ ...manifest, scope: 'Opening narrator only; no character conversations', lines: manifest.lines.filter((line) => selected[line.key]) }, null, 2));
const review = 'docs/voice-school-proof/review.html';
writeFileSync(review, readFileSync(review, 'utf8').replace('/voice/vi/f76dbc2c.mp3', 'retired-dialogue/f76dbc2c.mp3'));
console.log('Kept seven opening clips; archived', moved, 'dialogue/unused clips outside production public/.');
