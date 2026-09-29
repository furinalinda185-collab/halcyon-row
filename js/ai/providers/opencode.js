// OpenCode server adapter (https://opencode.ai). Start it with:  opencode serve
// OpenCode can be signed in to a ChatGPT Plus/Pro plan or many other providers, so this
// is also the route to use a ChatGPT subscription rather than an API key.
//
// cfg: { via: 'direct' | 'server', baseUrl, username, password, providerID, modelID, agent, token }
//
// API used (from the OpenCode server docs):
//   GET  /provider                    -> { all, default, connected }
//   POST /session                     -> Session { id }
//   POST /session/:id/message         { model:{providerID,modelID}, agent?, system?, tools?, parts:[{type:'text',text}] }
//                                     -> { info, parts }

import { cleanBase, withTimeout, netError, httpError } from '../net.js';

const TIMEOUT_MS = 120_000;
// OpenCode is a coding agent. These switch its tools off so it just talks.
const NO_TOOLS = Object.fromEntries(['bash', 'edit', 'write', 'read', 'grep', 'glob', 'list', 'patch', 'todowrite', 'todoread', 'webfetch', 'task'].map((t) => [t, false]));

/** convoId -> session id, kept for the life of the page. */
const sessions = new Map();

function base(cfg) {
  return cfg.via === 'server' ? '/api/ai/opencode' : cleanBase(cfg.baseUrl);
}

function headers(cfg, json = true) {
  const h = { accept: 'application/json' };
  if (json) h['content-type'] = 'application/json';
  if (cfg.via === 'server') {
    if (cfg.token) h['x-game-token'] = cfg.token;
  } else if (cfg.password) {
    h.authorization = `Basic ${btoa(`${cfg.username || 'opencode'}:${cfg.password}`)}`;
  }
  return h;
}

async function call(cfg, method, path, { body, signal, fetchFn = fetch, timeout = TIMEOUT_MS } = {}) {
  const url = `${base(cfg)}${path}`;
  const t = withTimeout(signal, timeout);
  try {
    const res = await fetchFn(url, { method, headers: headers(cfg, body !== undefined), body: body !== undefined ? JSON.stringify(body) : undefined, signal: t.signal });
    if (!res.ok) throw await httpError(res);
    return await res.json();
  } catch (err) {
    throw err.status ? err : netError(err, url, t);
  } finally {
    t.cleanup();
  }
}

/** Connected providers and their models as [{ providerID, modelID, label }]. */
export async function listModels(cfg, { fetchFn, signal } = {}) {
  const data = await call(cfg, 'GET', '/provider', { fetchFn, signal, timeout: 15_000 });
  const all = data.all ?? [];
  const connected = new Set(data.connected ?? []);
  const use = connected.size ? all.filter((p) => connected.has(p.id)) : all;
  const out = [];
  for (const p of use) {
    for (const [modelID, m] of Object.entries(p.models ?? {})) {
      out.push({ providerID: p.id, modelID, label: `${p.name ?? p.id}: ${m?.name ?? modelID}` });
    }
  }
  return out.sort((a, b) => a.label.localeCompare(b.label));
}

export function forgetSession(convoId) {
  sessions.delete(convoId);
}

async function ensureSession(cfg, convoId, opts) {
  const existing = sessions.get(convoId);
  if (existing) return { id: existing, fresh: false };
  const s = await call(cfg, 'POST', '/session', { body: { title: `Halcyon Row: ${convoId}` }, ...opts });
  if (!s?.id) throw new Error('OpenCode did not return a session id.');
  sessions.set(convoId, s.id);
  return { id: s.id, fresh: true };
}

function transcript(history) {
  if (!history.length) return '';
  const lines = history.map((m) => `${m.role === 'user' ? 'Player' : 'You'}: ${m.content}`);
  return `The conversation so far (for context only, do not repeat it):\n${lines.join('\n')}\n\nThe player now says:\n`;
}

/**
 * Sends one message and returns the reply text. A session is kept per conversation so
 * OpenCode remembers earlier turns; a fresh session is seeded from our own history.
 */
export async function chat(cfg, { system, history = [], userText, convoId, signal, fetchFn }) {
  if (!cfg.providerID || !cfg.modelID) throw new Error('Pick a model in Menu, AI first.');
  const opts = { signal, fetchFn };
  for (let attempt = 0; attempt < 2; attempt++) {
    const { id, fresh } = await ensureSession(cfg, convoId, opts);
    const text = (fresh ? transcript(history) : '') + userText;
    const body = {
      model: { providerID: cfg.providerID, modelID: cfg.modelID },
      system,
      tools: NO_TOOLS,
      parts: [{ type: 'text', text }],
    };
    if (cfg.agent) body.agent = cfg.agent;
    try {
      const res = await call(cfg, 'POST', `/session/${encodeURIComponent(id)}/message`, { body, ...opts });
      const err = res?.info?.error;
      if (err) throw new Error(err.data?.message || err.message || `OpenCode reported ${err.name || 'an error'}.`);
      const out = (res?.parts ?? []).filter((p) => p.type === 'text').map((p) => p.text ?? '').join('').trim();
      if (!out) throw new Error('OpenCode returned an empty reply.');
      return out;
    } catch (e) {
      // The session may have been deleted on the server. Start over once.
      if (e.status === 404 && attempt === 0) { sessions.delete(convoId); continue; }
      throw e;
    }
  }
  throw new Error('OpenCode session could not be created.');
}

/** Removes a session on the server. Best effort. */
export async function closeSession(cfg, convoId, { fetchFn } = {}) {
  const id = sessions.get(convoId);
  if (!id) return;
  sessions.delete(convoId);
  try { await call(cfg, 'DELETE', `/session/${encodeURIComponent(id)}`, { fetchFn, timeout: 8000 }); } catch { /* ignore */ }
}
