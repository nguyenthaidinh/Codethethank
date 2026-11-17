import { spawn } from 'node:child_process';
import { createWriteStream, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';

// Persist progress as it happens; an interrupted run is never reported as PASS.
const root = resolve('docs/art/g2f1-proof');
const buildHash = () => createHash('sha256').update(readFileSync('dist/index.html')).digest('hex');
const execution = { started: new Date().toISOString(), build: buildHash(), runs: [] };
const persist = () => writeFileSync(resolve(root, 'qa-execution.json'), JSON.stringify(execution, null, 2));
persist();
for (const [name, args] of [
  ['e2e', ['test', '--config=playwright.g2f.config.ts', '--reporter=list,json']],
  ['menu', ['test', '--config=playwright.g2f.config.ts', '--reporter=list,json']],
]) {
  const run = { name, command: `node node_modules/@playwright/test/cli.js ${args.join(' ')}`, started: new Date().toISOString() };
  execution.runs.push(run); persist();
  const log = createWriteStream(resolve(root, `${name}-console.log`));
  const result = await new Promise((done, reject) => {
    const child = spawn(process.execPath, ['node_modules/@playwright/test/cli.js', ...args], {
      env: { ...process.env, G2F_SUITE: name, ART_CAPTURE_PHASE: "after", ART_CAPTURE_OUT: "docs/art/g2f1-proof/preserved-classroom", PLAYWRIGHT_JSON_OUTPUT_FILE: resolve(root, `${name}-results.json`) },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    for (const stream of [child.stdout, child.stderr]) stream.on('data', data => { log.write(data); process.stdout.write(data); });
    child.on('error', reject);
    child.on('exit', code => log.end(() => done(code)));
  });
  run.exitCode = result; run.finished = new Date().toISOString(); persist();
  if (result !== 0) { process.exitCode = result || 1; break; }
}
execution.finished = new Date().toISOString(); execution.buildUnchanged = buildHash() === execution.build; persist();
if (!execution.buildUnchanged) throw Error('Production build changed during QA');
