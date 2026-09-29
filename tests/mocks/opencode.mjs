// A stand in for `opencode serve`, following the documented HTTP API:
//   GET  /provider              -> { all, default, connected }
//   POST /session               -> { id, title }
//   POST /session/:id/message   -> { info, parts }
//   DELETE /session/:id

import http from 'node:http';

export function startMockOpenCode({ password = '', username = 'opencode', reply = 'mm. tell me more\n\n<state mood="thinking" bond="1"/>' } = {}) {
  const calls = [];
  const sessions = new Set();
  let n = 0;
  const state = { failNext: null, forgetSessions: false };
  const server = http.createServer(async (req, res) => {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const raw = Buffer.concat(chunks).toString();
    const body = raw ? JSON.parse(raw) : null;
    calls.push({ method: req.method, url: req.url, headers: req.headers, body });
    const send = (status, obj) => { res.writeHead(status, { 'content-type': 'application/json' }); res.end(JSON.stringify(obj)); };

    if (password) {
      const want = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
      if (req.headers.authorization !== want) return send(401, { error: 'unauthorized' });
    }
    if (req.method === 'GET' && req.url === '/provider') {
      return send(200, {
        all: [
          { id: 'openai', name: 'OpenAI', models: { 'gpt-a': { name: 'GPT A' }, 'gpt-b': { name: 'GPT B' } } },
          { id: 'anthropic', name: 'Anthropic', models: { 'claude-x': { name: 'Claude X' } } },
          { id: 'unused', name: 'Unused', models: { 'u-1': { name: 'U1' } } },
        ],
        default: { openai: 'gpt-a' },
        connected: ['openai', 'anthropic'],
      });
    }
    if (req.method === 'POST' && req.url === '/session') {
      const id = `ses_${++n}`;
      sessions.add(id);
      return send(200, { id, title: body?.title });
    }
    const msg = /^\/session\/([\w-]+)\/message$/.exec(req.url);
    if (req.method === 'POST' && msg) {
      const id = msg[1];
      if (state.forgetSessions && n === 1) { sessions.delete(id); state.forgetSessions = false; }
      if (!sessions.has(id)) return send(404, { name: 'NotFound', data: { message: 'session not found' } });
      if (state.failNext) { const e = state.failNext; state.failNext = null; return send(200, { info: { role: 'assistant', error: e }, parts: [] }); }
      return send(200, { info: { id: 'msg_1', role: 'assistant' }, parts: [{ type: 'step-start' }, { type: 'text', text: reply }] });
    }
    const del = /^\/session\/([\w-]+)$/.exec(req.url);
    if (req.method === 'DELETE' && del) { sessions.delete(del[1]); return send(200, true); }
    return send(404, { error: 'not found' });
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      resolve({ url: `http://127.0.0.1:${port}`, calls, sessions, state, close: () => new Promise((r) => { server.closeAllConnections?.(); server.close(r); }) });
    });
  });
}
