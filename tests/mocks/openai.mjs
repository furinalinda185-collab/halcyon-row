// A stand in for an OpenAI compatible server. It reproduces the awkward real world
// behaviors the adapter has to survive. Model names pick the behavior:
//   strict-*   rejects `temperature`
//   reason-*   rejects `max_tokens` (wants max_completion_tokens) and burns small budgets
//   plain-*    rejects `max_completion_tokens`
//   json-*     ignores stream:true and answers with plain JSON
//   err500-*   always answers 500
//   anything else behaves normally

import http from 'node:http';

export const REPLY = 'ha, okay wait\n\nthat is genuinely funny\n\n<state mood="laugh" bond="2" note="likes puns"/>';

export function startMockOpenAI({ key = 'testkey', reply = REPLY } = {}) {
  const calls = [];
  const server = http.createServer(async (req, res) => {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const raw = Buffer.concat(chunks).toString();
    const body = raw ? JSON.parse(raw) : null;
    calls.push({ method: req.method, url: req.url, headers: req.headers, body });
    const send = (status, obj) => { res.writeHead(status, { 'content-type': 'application/json' }); res.end(JSON.stringify(obj)); };
    const err = (status, message) => send(status, { error: { message, type: 'invalid_request_error' } });

    if (key && req.headers.authorization !== `Bearer ${key}`) return err(401, 'Incorrect API key provided.');

    if (req.method === 'GET' && req.url === '/v1/models') {
      return send(200, { data: ['gpt-test', 'strict-a', 'text-embedding-3-small', 'whisper-1', 'tts-1', 'dall-e-3', 'reason-b'].map((id) => ({ id })) });
    }
    if (req.method === 'POST' && req.url === '/v1/chat/completions') {
      const m = body.model || '';
      if (m.startsWith('err500-')) return err(500, 'upstream exploded');
      if (m === 'missing') return err(404, 'The model `missing` does not exist');
      if (m === 'busy') return err(429, 'You exceeded your current quota.');
      if (m.startsWith('strict-') && 'temperature' in body) return err(400, "Unsupported value: 'temperature' does not support 0.9 with this model. Only the default (1) value is supported.");
      if (m.startsWith('reason-') && 'max_tokens' in body) return err(400, "Unsupported parameter: 'max_tokens' is not supported with this model. Use 'max_completion_tokens' instead.");
      if (m.startsWith('plain-') && 'max_completion_tokens' in body) return err(400, "Unknown parameter: 'max_completion_tokens'. Please use max_tokens.");
      const budget = body.max_completion_tokens ?? body.max_tokens ?? 0;
      const starved = m.startsWith('reason-') && budget < 1000;
      const text = starved ? '' : reply;
      if (m.startsWith('json-') || body.stream !== true) {
        return send(200, { choices: [{ message: { role: 'assistant', content: text }, finish_reason: starved ? 'length' : 'stop' }] });
      }
      res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-cache' });
      const parts = text ? text.match(/[\s\S]{1,9}/g) : [];
      for (const p of parts) res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: p } }] })}\n\n`);
      res.write(`data: ${JSON.stringify({ choices: [{ delta: {}, finish_reason: starved ? 'length' : 'stop' }] })}\n\n`);
      res.write('data: [DONE]\n\n');
      return res.end();
    }
    return err(404, 'not found');
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      resolve({ url: `http://127.0.0.1:${port}/v1`, origin: `http://127.0.0.1:${port}`, calls, close: () => new Promise((r) => { server.closeAllConnections?.(); server.close(r); }) });
    });
  });
}
