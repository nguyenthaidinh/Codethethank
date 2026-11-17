import { spawn } from 'node:child_process';
import { createWriteStream, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
const root = resolve('docs/chair-cinematic-proof');
const read = (file) => JSON.parse(readFileSync(file, 'utf8'));
const hash = () => createHash('sha256').update(readFileSync('dist/index.html')).digest('hex');
const execution = read(resolve(root, 'qa-execution.json'));
if (hash() !== execution.build) throw Error('Production changed');
const args = ['node_modules/@playwright/test/cli.js', 'test', '--config=playwright.g2f.config.ts', 'menu-audio.spec.ts', '-g', 'audio starts only', '--reporter=list,json'];
const run = { name: 'menu-cold-start', command: ['node', ...args].join(' '), started: new Date().toISOString(), build: hash() };
execution.runs.push(run);
execution.testCorrections = ['Dialogue test now waits for conversation.master instead of the removed dolly.', 'Menu dev-server cold launch now waits up to 30s for real game UI before checking the same closed/running audio context assertion. No application changes after primary QA.'];
const persist = () => writeFileSync(resolve(root, 'qa-execution.json'), JSON.stringify(execution, null, 2));
persist();
const log = createWriteStream(resolve(root, 'menu-cold-start-console.log'));
run.exitCode = await new Promise((done, reject) => {
  const child = spawn(process.execPath, args, { env: { ...process.env, G2F_SUITE: 'menu', PLAYWRIGHT_JSON_OUTPUT_FILE: resolve(root, 'menu-cold-start-results.json') }, stdio: ['ignore', 'pipe', 'pipe'] });
  for (const stream of [child.stdout, child.stderr]) stream.on('data', (data) => { log.write(data); process.stdout.write(data); });
  child.on('error', reject); child.on('exit', (code) => log.end(() => done(code)));
});
run.finished = new Date().toISOString(); persist();
if (run.exitCode !== 0) throw Error('Menu handoff still failing');
const cases = new Map();
function collect(suite, run) {
  for (const spec of suite.specs ?? []) cases.set(`${spec.file}:${spec.title}`, { file: spec.file, title: spec.title, passed: spec.tests.every((test) => test.results.at(-1)?.status === test.expectedStatus), run });
  for (const child of suite.suites ?? []) collect(child, run);
}
for (const name of ['e2e', 'affected', 'menu', 'menu-cold-start']) for (const suite of read(resolve(root, `${name}-results.json`)).suites) collect(suite, name);
const coverage = { uniqueCases: cases.size, passed: [...cases.values()].filter((c) => c.passed).length, cases: [...cases.values()] };
writeFileSync(resolve(root, 'coverage.json'), JSON.stringify(coverage, null, 2));
execution.allFinalCasesPassed = coverage.uniqueCases === 30 && coverage.passed === 30;
execution.finished = new Date().toISOString(); execution.buildUnchanged = hash() === execution.build; persist();
if (!execution.allFinalCasesPassed || !execution.buildUnchanged) throw Error('Final coverage incomplete');
