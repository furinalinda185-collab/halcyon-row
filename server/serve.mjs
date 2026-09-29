#!/usr/bin/env node
// Halcyon Row local server: static files plus an optional AI proxy.
//
// The proxy exists for two reasons:
//   1. API keys stay in environment variables on this machine instead of in
//      the browser's localStorage.
//   2. A phone on your LAN can reach an OpenCode server on your desktop. An
//      HTTPS hosted page cannot call http://192.168.x.x (mixed content), but a
//      page served from here can call this server on the same origin.
//
// Upstreams come from environment variables only. The request never chooses
// the destination, so this is not an open proxy.
//
//   OPENAI_API_KEY            key for api.openai.com (or your compatible host)
//   OPENAI_BASE_URL           default https://api.openai.com/v1 (Ollama, LM Studio, OpenRouter...)
//   OPENCODE_URL              default http://127.0.0.1:4096
//   OPENCODE_SERVER_USERNAME  default "opencode"
//   OPENCODE_SERVER_PASSWORD  if your opencode server has a password
//   GAME_TOKEN                optional shared secret required on /api/ai/*
//
// Usage: node server/serve.mjs [--port 8080] [--lan]

import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { stat } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { Readable } from 'node:stream';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DEFAULT = path.resolve(HERE, '..');
const DENY_TOP = new Set(['server', 'tests', 'node_modules']);
const MAX_BODY = 256 * 1024;
const UPSTREAM_TIMEOUT_MS = 120_000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.woff2': 'font/woff2',
};

const OPENAI_ALLOW = [
  ['POST', /^chat\/completions$/],
  ['GET', /^models$/],
];
const OPENCODE_ALLOW = [
  ['GET', /^provider$/],
  ['POST', /^session$/],
  ['POST', /^session\/[A-Za-z0-9_-]+\/message$/],
  ['DELETE', /^session\/[A-Za-z0-9_-]+$/],
];

const PRIVATE_HOST = /^(10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+|169\.254\.\d+\.\d+|[a-z0-9-]+\.(local|lan))$/;

function json(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
  });
  res.end(body);
}

function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

function hostname(hostHeader) {
  const h = String(hostHeader || '').toLowerCase();
  return h.startsWith('[') ? h.slice(0, h.indexOf(']') + 1) : h.split(':')[0];
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (c) => {
      size += c.length;
      if (size > MAX_BODY) {
        reject(Object.assign(new Error('body too large'), { status: 413 }));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export function createGameServer({ root = ROOT_DEFAULT, env = process.env, lan = false, token = '' } = {}) {
  const rootAbs = path.resolve(root);
  const openaiKey = env.OPENAI_API_KEY || '';
  const openaiBase = (env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '');
  const openaiConfigured = Boolean(env.OPENAI_API_KEY || env.OPENAI_BASE_URL);
  const opencodeBase = (env.OPENCODE_URL || 'http://127.0.0.1:4096').replace(/\/+$/, '');
  const opencodeAuth = env.OPENCODE_SERVER_PASSWORD
    ? 'Basic ' + Buffer.from(`${env.OPENCODE_SERVER_USERNAME || 'opencode'}:${env.OPENCODE_SERVER_PASSWORD}`).toString('base64')
    : '';
  const requireToken = Boolean(token);

  // Blocks DNS rebinding and cross site calls to a proxy that holds your key.
  function guard(req) {
    const name = hostname(req.headers.host);
    const localName = name === 'localhost' || name === '127.0.0.1' || name === '[::1]';
    if (!localName && !(lan && PRIVATE_HOST.test(name))) return 'bad host';
    const origin = req.headers.origin;
    if (origin) {
      let originHost = '';
      try { originHost = new URL(origin).host.toLowerCase(); } catch { return 'bad origin'; }
      if (originHost !== String(req.headers.host || '').toLowerCase()) return 'bad origin';
    }
    const site = req.headers['sec-fetch-site'];
    if (site && site !== 'same-origin' && site !== 'none') return 'cross site';
    if (requireToken) {
      const given = req.headers['x-game-token'];
      if (typeof given !== 'string' || !safeEqual(given, token)) return 'token required';
    }
    return '';
  }

  async function probeOpencode() {
    try {
      const r = await fetch(opencodeBase + '/provider', {
        headers: opencodeAuth ? { authorization: opencodeAuth } : {},
        signal: AbortSignal.timeout(900),
      });
      return r.ok || r.status === 401;
    } catch {
      return false;
    }
  }

  async function forward(req, res, method, url, headers) {
    const ctrl = new AbortController();
    res.on('close', () => ctrl.abort());
    let body;
    if (method !== 'GET' && method !== 'HEAD' && method !== 'DELETE') body = await readBody(req);
    let up;
    try {
      up = await fetch(url, {
        method,
        headers,
        body,
        signal: AbortSignal.any([ctrl.signal, AbortSignal.timeout(UPSTREAM_TIMEOUT_MS)]),
      });
    } catch {
      if (!res.headersSent) json(res, 502, { error: 'upstream unreachable' });
      return;
    }
    res.writeHead(up.status, {
      'content-type': up.headers.get('content-type') || 'application/json',
      'cache-control': 'no-store',
      'x-accel-buffering': 'no',
      'x-content-type-options': 'nosniff',
    });
    if (!up.body) return void res.end();
    const stream = Readable.fromWeb(up.body);
    stream.on('error', () => res.destroy());
    stream.pipe(res);
  }

  async function handleAi(req, res, url) {
    const denied = guard(req);
    if (url.pathname === '/api/ai/config') {
      // Reveal nothing secret: booleans only. Still behind the host/origin guard.
      if (denied && denied !== 'token required') return json(res, 403, { error: denied });
      return json(res, 200, {
        tokenRequired: requireToken,
        authorized: !denied,
        openai: openaiConfigured,
        opencode: denied ? false : await probeOpencode(),
      });
    }
    if (denied) return json(res, 403, { error: denied });

    const m = /^\/api\/ai\/(openai|opencode)\/(.+)$/.exec(url.pathname);
    if (!m) return json(res, 404, { error: 'not found' });
    const [, target, rest] = m;
    let sub;
    try { sub = decodeURIComponent(rest); } catch { return json(res, 400, { error: 'bad path' }); }
    const allow = target === 'openai' ? OPENAI_ALLOW : OPENCODE_ALLOW;
    if (!allow.some(([verb, re]) => verb === req.method && re.test(sub))) {
      return json(res, 404, { error: 'not allowed' });
    }
    const headers = { accept: req.headers.accept || 'application/json' };
    if (req.method === 'POST') headers['content-type'] = 'application/json';
    if (target === 'openai') {
      if (openaiKey) headers.authorization = `Bearer ${openaiKey}`;
      return forward(req, res, req.method, `${openaiBase}/${sub}`, headers);
    }
    if (opencodeAuth) headers.authorization = opencodeAuth;
    return forward(req, res, req.method, `${opencodeBase}/${sub}`, headers);
  }

  async function handleStatic(req, res, url) {
    if (req.method !== 'GET' && req.method !== 'HEAD') return json(res, 405, { error: 'method not allowed' });
    let rel;
    try { rel = decodeURIComponent(url.pathname); } catch { return json(res, 400, { error: 'bad path' }); }
    if (rel.includes('\0')) return json(res, 400, { error: 'bad path' });
    if (rel.endsWith('/')) rel += 'index.html';
    const abs = path.resolve(rootAbs, '.' + rel);
    if (abs !== rootAbs && !abs.startsWith(rootAbs + path.sep)) return json(res, 403, { error: 'forbidden' });
    const segments = path.relative(rootAbs, abs).split(path.sep);
    if (segments.some((s) => s.startsWith('.')) || DENY_TOP.has(segments[0])) return json(res, 404, { error: 'not found' });
    let info;
    try { info = await stat(abs); } catch { return json(res, 404, { error: 'not found' }); }
    if (!info.isFile()) return json(res, 404, { error: 'not found' });
    res.writeHead(200, {
      'content-type': MIME[path.extname(abs).toLowerCase()] || 'application/octet-stream',
      'content-length': info.size,
      'cache-control': 'no-cache',
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'no-referrer',
    });
    if (req.method === 'HEAD') return void res.end();
    createReadStream(abs).pipe(res);
  }

  return http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://placeholder');
      if (url.pathname.startsWith('/api/ai/')) return await handleAi(req, res, url);
      return await handleStatic(req, res, url);
    } catch (err) {
      if (!res.headersSent) json(res, err.status || 500, { error: err.status ? err.message : 'server error' });
      else res.destroy();
    }
  });
}

function lanAddresses() {
  const out = [];
  for (const list of Object.values(os.networkInterfaces())) {
    for (const i of list || []) if (i.family === 'IPv4' && !i.internal) out.push(i.address);
  }
  return out;
}

async function main() {
  const args = process.argv.slice(2);
  const lan = args.includes('--lan');
  const pi = args.indexOf('--port');
  const port = pi >= 0 ? Number(args[pi + 1]) : Number(process.env.PORT || 8080);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    console.error('Invalid --port');
    process.exit(1);
  }
  // Anything reachable from other devices spends real money, so it gets a token.
  const token = process.env.GAME_TOKEN || (lan ? crypto.randomBytes(12).toString('base64url') : '');
  const server = createGameServer({ lan, token });
  const bindHost = lan ? '0.0.0.0' : '127.0.0.1';
  server.listen(port, bindHost, () => {
    console.log(`\nHalcyon Row is running.\n`);
    console.log(`  This computer:  http://localhost:${port}/`);
    if (lan) {
      for (const ip of lanAddresses()) console.log(`  On your phone:  http://${ip}:${port}/#token=${token}`);
      console.log(`\n  LAN mode is on. Anyone with that link can use your AI keys, so keep it to your own network.`);
    } else {
      console.log(`  (Add --lan to play on your phone over Wi-Fi.)`);
    }
    const ai = [];
    if (process.env.OPENAI_API_KEY || process.env.OPENAI_BASE_URL) ai.push('OpenAI compatible');
    ai.push(`OpenCode at ${process.env.OPENCODE_URL || 'http://127.0.0.1:4096'} (if running)`);
    console.log(`\n  AI proxy upstreams: ${ai.join(', ')}\n`);
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
