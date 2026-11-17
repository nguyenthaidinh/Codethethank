import { spawn } from 'node:child_process';
import { createWriteStream, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
const root = resolve('docs/chair-cinematic-proof');
const hash = () => createHash('sha256').update(readFileSync('dist/index.html')).digest('hex');
const execution = { started: new Date().toISOString(), build: hash(), runs: [] };
const persist = () => writeFileSync(resolve(root, 'qa-execution.json'), JSON.stringify(execution, null, 2));
persist();
for (const [name, files] of [
  ['e2e', ['cinematic-chair.spec.ts', 'cinematic-stayed.spec.ts', 'cinematic-stayed-fallback.spec.ts', 'cinematic-fullgame.spec.ts', 'cinematic-voice-school.spec.ts', 'cinematic-typography.spec.ts', 'cinematic-mobile.spec.ts']],
  ['menu', []],
]) {
  const args = ['node_modules/@playwright/test/cli.js', 'test', '--config=playwright.g2f.config.ts', ...files, '--reporter=list,json'];
  const run = { name, command: `node ${args.join(' ')}`, started: new Date().toISOString() };
  execution.runs.push(run); persist();
  const log = createWriteStream(resolve(root, `${name}-console.log`));
  run.exitCode = await new Promise((done, reject) => {
    const child = spawn(process.execPath, args, { env: { ...process.env, G2F_SUITE: name, GAME_PROOF_OUT: 'docs/chair-cinematic-proof/runtime/journey', VOICE_PROOF_OUT: 'docs/chair-cinematic-proof/runtime/voice', STAY_PROOF_OUT: 'docs/chair-cinematic-proof/runtime/stayed', PLAYWRIGHT_JSON_OUTPUT_FILE: resolve(root, `${name}-results.json`) }, stdio: ['ignore', 'pipe', 'pipe'] });
    for (const stream of [child.stdout, child.stderr]) stream.on('data', (data) => { log.write(data); process.stdout.write(data); });
    child.on('error', reject);
    child.on('exit', (code) => log.end(() => done(code)));
  });
  run.finished = new Date().toISOString(); persist();
  if (run.exitCode !== 0) { process.exitCode = run.exitCode || 1; break; }
}
execution.finished = new Date().toISOString(); execution.buildUnchanged = hash() === execution.build; persist();
if (!execution.buildUnchanged) throw Error('Build changed during browser verification');
