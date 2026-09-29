// Runs sw.js in a sandbox with a fake service worker environment, so both of its
// strategies (cache first for players, network first for local development) are tested
// without needing a browser or a secure origin.

import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SRC = await readFile(path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'sw.js'), 'utf8');

function makeEnv(hostname) {
  const listeners = {};
  const store = new Map(); // cacheName -> Map(url -> body)
  const network = { online: true, calls: [] };
  const origin = `https://${hostname}`;

  class FakeRequest {
    constructor(url, init = {}) { this.url = new URL(url, `${origin}/`).href; this.method = init.method || 'GET'; this.mode = init.mode || 'no-cors'; }
  }
  class FakeResponse {
    constructor(body, init = {}) { this.body = body; this.ok = init.ok ?? true; }
    static error() { return new FakeResponse('ERR', { ok: false }); }
  }
  const caches = {
    async open(name) {
      if (!store.has(name)) store.set(name, new Map());
      const c = store.get(name);
      return {
        async addAll(reqs) { for (const r of reqs) c.set(new URL(r.url).pathname, `cached:${new URL(r.url).pathname}`); },
      };
    },
    async keys() { return [...store.keys()]; },
    async delete(name) { return store.delete(name); },
    async match(req) {
      const url = typeof req === 'string' ? new URL(req, `${origin}/`) : new URL(req.url);
      for (const c of store.values()) {
        const hit = c.get(url.pathname) ?? c.get(`/${String(req).replace(/^\//, '')}`);
        if (hit) return new FakeResponse(hit);
      }
      return undefined;
    },
  };
  const fetchFn = async (req) => {
    const url = typeof req === 'string' ? new URL(req, `${origin}/`).href : req.url;
    network.calls.push(url);
    if (!network.online) throw new TypeError('offline');
    if (url.endsWith('precache.json')) return { ok: true, json: async () => ({ version: 'v1', files: ['./', 'index.html', 'js/main.js'] }) };
    return new FakeResponse(`net:${new URL(url).pathname}`);
  };
  const self = {
    location: { origin, hostname },
    clients: { claim: async () => {} },
    skipWaiting: async () => {},
    addEventListener: (type, fn) => { listeners[type] = fn; },
  };
  vm.runInNewContext(SRC, { self, caches, fetch: fetchFn, Request: FakeRequest, Response: FakeResponse, URL, console });

  const run = async (type, event) => {
    let pending;
    listeners[type]({ ...event, waitUntil: (p) => { pending = p; }, respondWith: (p) => { pending = p; } });
    return pending === undefined ? undefined : pending;
  };
  return { run, network, store, FakeRequest };
}

test('install precaches the listed files under a versioned cache name', async () => {
  const env = makeEnv('play.example.com');
  await env.run('install', {});
  assert.deepEqual([...env.store.keys()], ['halcyon-v1']);
  assert.equal(env.store.get('halcyon-v1').size, 3);
});

test('activate removes old cache versions but keeps the current one', async () => {
  const env = makeEnv('play.example.com');
  await env.run('install', {});
  env.store.set('halcyon-old', new Map());
  env.store.set('unrelated-cache', new Map());
  await env.run('activate', {});
  assert.deepEqual([...env.store.keys()].sort(), ['halcyon-v1', 'unrelated-cache']);
});

test('players get cache first: works offline and does not hit the network for cached files', async () => {
  const env = makeEnv('play.example.com');
  await env.run('install', {});
  env.network.calls.length = 0;
  env.network.online = false;
  const res = await env.run('fetch', { request: new env.FakeRequest('/js/main.js') });
  assert.equal(res.body, 'cached:/js/main.js');
  assert.equal(env.network.calls.length, 0);
  // an uncached page while offline falls back to the shell, an uncached asset just fails
  const nav = await env.run('fetch', { request: new env.FakeRequest('/anything', { mode: 'navigate' }) });
  assert.equal(nav.body, 'cached:/index.html');
  const asset = await env.run('fetch', { request: new env.FakeRequest('/missing.png') });
  assert.equal(asset.ok, false);
});

test('AI calls, other origins and non GET requests are never touched', async () => {
  const env = makeEnv('play.example.com');
  await env.run('install', {});
  for (const req of [
    new env.FakeRequest('/api/ai/openai/chat/completions', { method: 'GET' }),
    new env.FakeRequest('https://api.openai.com/v1/chat/completions'),
    new env.FakeRequest('/js/main.js', { method: 'POST' }),
  ]) {
    let handled = false;
    env.run('fetch', { request: req }).then(() => {}).catch(() => {});
    // respondWith is only called when the worker takes over; check by inspecting the promise result
    const result = await Promise.race([env.run('fetch', { request: req }), new Promise((r) => setTimeout(() => r('untouched'), 10))]);
    handled = result !== 'untouched' && result !== undefined;
    assert.equal(handled, false, `${req.url} should pass straight through`);
  }
});

test('local development is network first so edits show up', async () => {
  const env = makeEnv('localhost');
  await env.run('install', {});
  const fresh = await env.run('fetch', { request: new env.FakeRequest('/js/main.js') });
  assert.equal(fresh.body, 'net:/js/main.js', 'network wins when online');
  env.network.online = false;
  const offline = await env.run('fetch', { request: new env.FakeRequest('/js/main.js') });
  assert.equal(offline.body, 'cached:/js/main.js', 'cache is the fallback offline');
});
