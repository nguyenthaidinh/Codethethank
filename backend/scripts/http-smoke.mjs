import assert from 'node:assert/strict';
import {randomBytes, randomUUID} from 'node:crypto';
import {writeFileSync} from 'node:fs';

const base = process.env.GRATITUDE_API_URL ?? 'http://127.0.0.1:8055';
if (new URL(base).hostname !== '127.0.0.1' && new URL(base).hostname !== 'localhost') throw Error('Smoke test is local-only.');
const headers = {'Content-Type': 'application/json', Accept: 'application/json', 'Idempotency-Key': randomUUID(), 'X-Receipt-Token': randomBytes(32).toString('hex')};
const payload = {recipient: 'QA synthetic teacher', message: 'QA only — Cảm ơn cô.', display_name: 'QA synthetic', consent: {accepted: true, version: 'public-wall-v1'}};
const proof = [];
async function request(path, method, body, customHeaders = headers) {
  const response = await fetch(base + path, {method, headers: customHeaders, body: body === undefined ? undefined : JSON.stringify(body)});
  const result = await response.json();
  proof.push({method, path: path.replace(/[0-9a-f]{8}-[0-9a-f-]{27}/g, ':id'), status: response.status});
  assert.ok(response.headers.get('cache-control')?.includes('no-store'));
  return {status: response.status, result};
}
let id;
try {
  assert.equal((await request('/api/v1/sharing-policy', 'GET')).status, 200);
  assert.equal((await request('/api/v1/submissions', 'POST', {...payload, consent: {accepted: false, version: 'public-wall-v1'}})).status, 422);
  const created = await request('/api/v1/submissions', 'POST', payload);
  assert.equal(created.status, 201); id = created.result.data.id;
  assert.equal(created.result.data.status, 'pending');
  const replay = await request('/api/v1/submissions', 'POST', payload);
  assert.equal(replay.status, 200); assert.equal(replay.result.data.id, id);
  assert.equal((await request(`/api/v1/submissions/${id}`, 'GET', undefined, {Accept:'application/json'})).status, 404);
  const receipt = await request(`/api/v1/submissions/${id}`, 'GET');
  assert.equal(receipt.status, 200); assert.equal(receipt.result.data.message, undefined);
  assert.equal((await request('/api/v1/auth/me', 'GET')).status, 401);
  assert.equal((await request(`/api/v1/submissions/${id}`, 'DELETE')).result.data.status, 'withdrawn');
  assert.equal((await request('/api/v1/submissions', 'POST', payload)).result.data.status, 'withdrawn');
  writeFileSync(new URL('../proof/http-smoke.json', import.meta.url), JSON.stringify({checks:proof, result:'PASS'},null,2));
  console.log(`PASS: ${proof.length} real HTTP requests; synthetic letter withdrawn. No credentials recorded.`);
} finally {
  if (id) await fetch(`${base}/api/v1/submissions/${id}`, {method:'DELETE',headers});
}
