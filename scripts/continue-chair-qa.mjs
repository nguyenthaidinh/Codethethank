import { spawn } from 'node:child_process';
import { createWriteStream, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
const root = resolve('docs/chair-cinematic-proof');
const read = (file) => JSON.parse(readFileSync(file, 'utf8'));
const hash = () => createHash('sha256').update(readFileSync('dist/index.html')).digest('hex');
const execution = read(resolve(root, 'qa-execution.json'));
if (hash() !== execution.build) throw Error('Production changed after primary run');
execution.correction = 'Updated the old dialogue test to wait for conversation.master rather than 1.55 seconds of dolly. Application source/build unchanged. Primary results are retained.';
const persist = () => writeFileSync(resolve(root, 'qa-execution.json'), JSON.stringify(execution, null, 2));
for (const [name, files] of [['affected', ['cinematic-voice-school.spec.ts', '-g', 'Conversation camera']], ['menu', []]]) {
  const args = ['node_modules/@playwright/test/cli.js', 'test', '--config=playwright.g2f.config.ts', ...files, '--reporter=list,json'];
  const run = { name, command: ['node', ...args].join(' '), started: new Date().toISOString(), build: hash() };
  execution.runs.push(run); persist();
  const log = createWriteStream(resolve(root, `${name}-console.log`));
  run.exitCode = await new Promise((done, reject) => {
    const child = spawn(process.execPath, args, { env: { ...process.env, G2F_SUITE: name === 'menu' ? 'menu' : 'e2e', VOICE_PROOF_OUT: 'docs/chair-cinematic-proof/runtime/voice', PLAYWRIGHT_JSON_OUTPUT_FILE: resolve(root, `${name}-results.json`) }, stdio: ['ignore', 'pipe', 'pipe'] });
    for (const stream of [child.stdout, child.stderr]) stream.on('data', (data) => { log.write(data); process.stdout.write(data); });
    child.on('error', reject); child.on('exit', (code) => log.end(() => done(code)));
  });
  run.finished = new Date().toISOString(); persist();
  if (run.exitCode !== 0) { process.exitCode = run.exitCode || 1; break; }
}
const cases = new Map();
function collect(suite, run) {
  for (const spec of suite.specs ?? []) {
    const passed = spec.tests.every((test) => test.results.at(-1)?.status === test.expectedStatus);
    cases.set(`${spec.file}:${spec.title}`, { file: spec.file, title: spec.title, passed, run });
  }
  for (const child of suite.suites ?? []) collect(child, run);
}
for (const name of ['e2e', 'affected', 'menu']) {
  const report = read(resolve(root, `${name}-results.json`));
  for (const suite of report.suites) collect(suite, name);
}
const finalCases = [...cases.values()];
const coverage = { uniqueCases: finalCases.length, passed: finalCases.filter((c) => c.passed).length, cases: finalCases };
writeFileSync(resolve(root, 'coverage.json'), JSON.stringify(coverage, null, 2));
execution.allFinalCasesPassed = coverage.uniqueCases === 30 && coverage.passed === 30;
execution.finished = new Date().toISOString(); execution.buildUnchanged = hash() === execution.build; persist();
if (!execution.allFinalCasesPassed || !execution.buildUnchanged) throw Error('Final coverage incomplete');
