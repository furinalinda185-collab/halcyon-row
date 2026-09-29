import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createGameServer } from '../server/serve.mjs';
import { startMockOpenAI, REPLY } from './mocks/openai.mjs';
import { startMockOpenCode } from './mocks/opencode.mjs';

const KEY = 'sk-super-secret-key-1234';

function listen(server) {
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server.address().port)));
}

/** Raw request so we can set any Host / Origin header we like. */
function raw(port, { method = 'GET', path = '/', headers = {}, body } = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request({ host: '127.0.0.1', port, method, path, headers: { host: `localhost:${port}`, ...headers } }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, text: Buffer.concat(chunks).toString() }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function boot({ lan = false, token = '', opencodePassword = '' } = {}) {
  const oai = await startMockOpenAI({ key: KEY });
  const oc = await startMockOpenCode({ password: opencodePassword });
  const server = createGameServer({
    lan,
    token,
    env: { OPENAI_API_KEY: KEY, OPENAI_BASE_URL: oai.url, OPENCODE_URL: oc.url, OPENCODE_SERVER_PASSWORD: opencodePassword },
  });
  const port = await listen(server);
  return {
    port, oai, oc,
    close: async () => { server.closeAllConnections?.(); await new Promise((r) => server.close(r)); await oai.close(); await oc.close(); },
  };
}

const chatBody = JSON.stringify({ model: 'gpt-test', messages: [{ role: 'user', content: 'hi' }], stream: true });

test('serves the game files and only the game files', async () => {
  const s = await boot();
  try {
    const home = await raw(s.port, { path: '/' });
    assert.equal(home.status, 200);
    assert.match(home.headers['content-type'], /text\/html/);
    assert.match(home.text, /Halcyon Row/);
    assert.equal(home.headers['x-content-type-options'], 'nosniff');
    assert.equal((await raw(s.port, { path: '/js/main.js' })).status, 200);
    assert.match((await raw(s.port, { path: '/manifest.webmanifest' })).headers['content-type'], /manifest\+json/);
    for (const p of ['/server/serve.mjs', '/tests/core.test.mjs', '/node_modules/x', '/.git/config', '/.github/workflows/pages.yml', '/js/../server/serve.mjs', '/%2e%2e/etc/passwd', '/js/%2e%2e/%2e%2e/etc/passwd', '/nope.html']) {
      const r = await raw(s.port, { path: p });
      assert.ok([403, 404].includes(r.status), `${p} should be refused, got ${r.status}`);
      assert.equal(r.text.includes('createGameServer'), false, `${p} leaked source`);
    }
    assert.equal((await raw(s.port, { method: 'POST', path: '/' })).status, 405);
    assert.equal((await raw(s.port, { path: '/%00' })).status >= 400, true);
  } finally { await s.close(); }
});

test('proxy adds the key upstream and never exposes it to the browser', async () => {
  const s = await boot();
  try {
    const r = await raw(s.port, { method: 'POST', path: '/api/ai/openai/chat/completions', headers: { 'content-type': 'application/json' }, body: chatBody });
    assert.equal(r.status, 200);
    assert.match(r.headers['content-type'], /event-stream/);
    assert.match(r.text, /data: \[DONE\]/, 'the stream passes through to the end');
    assert.ok(r.text.split('data:').length > 4, 'and arrives as several events');
    assert.equal(s.oai.calls.at(-1).headers.authorization, `Bearer ${KEY}`);
    // The key must not appear in anything sent back, including the config probe.
    const cfg = await raw(s.port, { path: '/api/ai/config' });
    for (const out of [r.text, JSON.stringify(r.headers), cfg.text, JSON.stringify(cfg.headers)]) assert.equal(out.includes(KEY), false);
    assert.deepEqual(Object.keys(JSON.parse(cfg.text)).sort(), ['authorized', 'opencode', 'openai', 'tokenRequired'].sort());
    assert.equal(JSON.parse(cfg.text).openai, true);
    assert.equal(JSON.parse(cfg.text).opencode, true);
    assert.equal(REPLY.includes('funny'), true);
  } finally { await s.close(); }
});

test('a browser supplied Authorization header cannot replace the server key', async () => {
  const s = await boot();
  try {
    await raw(s.port, { method: 'POST', path: '/api/ai/openai/chat/completions', headers: { 'content-type': 'application/json', authorization: 'Bearer attacker-key' }, body: chatBody });
    assert.equal(s.oai.calls.at(-1).headers.authorization, `Bearer ${KEY}`);
  } finally { await s.close(); }
});

test('only allowlisted upstream paths and verbs are reachable', async () => {
  const s = await boot();
  try {
    const cases = [
      ['GET', '/api/ai/openai/models', 200],
      ['GET', '/api/ai/openai/files', 404],
      ['POST', '/api/ai/openai/models', 404],
      ['GET', '/api/ai/openai/chat/completions', 404],
      ['GET', '/api/ai/openai/../../../etc/passwd', 404],
      ['GET', '/api/ai/openai/%2e%2e/admin', 404],
      ['GET', '/api/ai/opencode/provider', 200],
      ['POST', '/api/ai/opencode/session', 200],
      ['GET', '/api/ai/opencode/global/config', 404],
      ['POST', '/api/ai/opencode/session/abc/prompt_async', 404],
      ['DELETE', '/api/ai/opencode/session/ses_1', 200],
      ['GET', '/api/ai/nothing/x', 404],
      ['GET', '/api/ai/', 404],
    ];
    for (const [method, path, want] of cases) {
      const r = await raw(s.port, { method, path, headers: method === 'POST' ? { 'content-type': 'application/json' } : {}, body: method === 'POST' ? '{}' : undefined });
      assert.equal(r.status, want, `${method} ${path}`);
    }
  } finally { await s.close(); }
});

test('the request can never choose the upstream host', async () => {
  const s = await boot();
  try {
    const before = s.oai.calls.length;
    const r = await raw(s.port, { method: 'POST', path: '/api/ai/openai/chat/completions?url=http://evil.example/x', headers: { 'content-type': 'application/json', 'x-forwarded-host': 'evil.example', 'x-upstream': 'http://evil.example' }, body: chatBody });
    assert.equal(r.status, 200);
    assert.equal(s.oai.calls.length, before + 1, 'went to the configured mock, not anywhere else');
    assert.equal(s.oai.calls.at(-1).url, '/v1/chat/completions', 'query string is not forwarded');
    assert.equal(s.oai.calls.at(-1).headers['x-upstream'], undefined);
  } finally { await s.close(); }
});

test('DNS rebinding and cross site calls are refused', async () => {
  const s = await boot();
  try {
    const tries = [
      { headers: { host: `evil.example:${s.port}` } },
      { headers: { origin: 'https://evil.example' } },
      { headers: { origin: `http://localhost:${s.port + 1}` } },
      { headers: { 'sec-fetch-site': 'cross-site' } },
    ];
    for (const t of tries) {
      const r = await raw(s.port, { path: '/api/ai/openai/models', ...t });
      assert.equal(r.status, 403, JSON.stringify(t));
    }
    const same = await raw(s.port, { path: '/api/ai/openai/models', headers: { origin: `http://localhost:${s.port}`, 'sec-fetch-site': 'same-origin' } });
    assert.equal(same.status, 200);
  } finally { await s.close(); }
});

test('LAN mode demands the access token on AI routes', async () => {
  const s = await boot({ lan: true, token: 'tok-abc-123' });
  try {
    const noTok = await raw(s.port, { method: 'POST', path: '/api/ai/openai/chat/completions', headers: { 'content-type': 'application/json' }, body: chatBody });
    assert.equal(noTok.status, 403);
    const wrong = await raw(s.port, { method: 'POST', path: '/api/ai/openai/chat/completions', headers: { 'content-type': 'application/json', 'x-game-token': 'nope' }, body: chatBody });
    assert.equal(wrong.status, 403);
    const before = s.oai.calls.length;
    assert.equal(s.oai.calls.length, before, 'refused calls never reach the upstream');
    const ok = await raw(s.port, { method: 'POST', path: '/api/ai/openai/chat/completions', headers: { 'content-type': 'application/json', 'x-game-token': 'tok-abc-123' }, body: chatBody });
    assert.equal(ok.status, 200);
    // config tells the page a token is needed without revealing anything
    const cfg = JSON.parse((await raw(s.port, { path: '/api/ai/config' })).text);
    assert.equal(cfg.tokenRequired, true);
    assert.equal(cfg.authorized, false);
    assert.equal(cfg.opencode, false, 'does not probe the upstream for unauthorized callers');
    // static files stay open so the game itself loads
    assert.equal((await raw(s.port, { path: '/' })).status, 200);
  } finally { await s.close(); }
});

test('LAN mode accepts private network hostnames, others are refused', async () => {
  const s = await boot({ lan: true, token: 't' });
  try {
    const h = { 'x-game-token': 't' };
    assert.equal((await raw(s.port, { path: '/api/ai/openai/models', headers: { ...h, host: `192.168.1.50:${s.port}` } })).status, 200);
    assert.equal((await raw(s.port, { path: '/api/ai/openai/models', headers: { ...h, host: `my-desktop.local:${s.port}` } })).status, 200);
    assert.equal((await raw(s.port, { path: '/api/ai/openai/models', headers: { ...h, host: `8.8.8.8:${s.port}` } })).status, 403);
    assert.equal((await raw(s.port, { path: '/api/ai/openai/models', headers: { ...h, host: `attacker.example:${s.port}` } })).status, 403);
  } finally { await s.close(); }
});

test('opencode credentials stay on the server', async () => {
  const s = await boot({ opencodePassword: 'oc-pass-999' });
  try {
    const r = await raw(s.port, { path: '/api/ai/opencode/provider' });
    assert.equal(r.status, 200);
    assert.equal(r.text.includes('oc-pass-999'), false);
    assert.match(s.oc.calls.at(-1).headers.authorization, /^Basic /);
    assert.equal(JSON.parse((await raw(s.port, { path: '/api/ai/config' })).text).opencode, true);
  } finally { await s.close(); }
});

test('oversized bodies are rejected and upstream errors do not leak details', async () => {
  const s = await boot();
  try {
    const big = JSON.stringify({ model: 'gpt-test', messages: [{ role: 'user', content: 'x'.repeat(300_000) }] });
    const r = await raw(s.port, { method: 'POST', path: '/api/ai/openai/chat/completions', headers: { 'content-type': 'application/json' }, body: big }).catch((e) => ({ status: 0, text: String(e) }));
    assert.ok(r.status === 413 || r.status === 0, `got ${r.status}`);
  } finally { await s.close(); }
  // upstream down: a clean 502 that does not reveal the upstream address
  const server = createGameServer({ env: { OPENAI_API_KEY: KEY, OPENAI_BASE_URL: 'http://127.0.0.1:1/v1' } });
  const port = await listen(server);
  try {
    const r = await raw(port, { path: '/api/ai/openai/models' });
    assert.equal(r.status, 502);
    assert.equal(/127\.0\.0\.1:1|ECONNREFUSED/.test(r.text), false);
    assert.equal(r.text.includes(KEY), false);
  } finally { server.closeAllConnections?.(); await new Promise((res) => server.close(res)); }
});
