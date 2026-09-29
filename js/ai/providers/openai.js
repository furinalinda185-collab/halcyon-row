// OpenAI and anything that speaks the same Chat Completions protocol
// (OpenRouter, Ollama, LM Studio, Groq and so on).
//
// cfg: { via: 'direct' | 'server', baseUrl, apiKey, model, token }
//   direct: the browser calls baseUrl itself with your key.
//   server: the local game server (server/serve.mjs) adds the key from its environment.

import { cleanBase, withTimeout, netError, httpError } from '../net.js';
import { readSSE } from '../sse.js';

const TIMEOUT_MS = 60_000;
/** An error we raise on purpose, so the catch block does not mistake it for a network failure. */
const fail = (msg) => Object.assign(new Error(msg), { explicit: true });
const NOT_CHAT = /(embed|whisper|tts|dall-e|moderation|image|audio|realtime|transcribe|davinci|babbage|search|similarity|instruct$)/i;

function endpoint(cfg, path) {
  if (cfg.via === 'server') return `/api/ai/openai/${path}`;
  return `${cleanBase(cfg.baseUrl)}/${path}`;
}

function headers(cfg, json = true) {
  const h = { accept: 'application/json, text/event-stream' };
  if (json) h['content-type'] = 'application/json';
  if (cfg.via === 'server') {
    if (cfg.token) h['x-game-token'] = cfg.token;
  } else if (cfg.apiKey) {
    h.authorization = `Bearer ${cfg.apiKey}`;
  }
  return h;
}

const isOfficial = (cfg) => cfg.via === 'server' ? false : /^https:\/\/api\.openai\.com\b/i.test(cfg.baseUrl || '');

/** Lists chat capable model ids. */
export async function listModels(cfg, { fetchFn = fetch, signal } = {}) {
  const url = endpoint(cfg, 'models');
  const t = withTimeout(signal, 15_000);
  try {
    const res = await fetchFn(url, { headers: headers(cfg, false), signal: t.signal });
    if (!res.ok) throw await httpError(res);
    const data = await res.json();
    const ids = (data.data ?? data.models ?? []).map((m) => m.id ?? m.name).filter((x) => typeof x === 'string');
    return [...new Set(ids)].filter((id) => !NOT_CHAT.test(id)).sort();
  } catch (err) {
    throw err.status ? err : netError(err, url, t);
  } finally {
    t.cleanup();
  }
}

/**
 * One chat completion. Streams when the server supports it.
 * Adjusts to model quirks: some reject temperature, some want max_completion_tokens.
 * Returns the full text.
 */
export async function chat(cfg, { system, history = [], userText, signal, onToken, fetchFn = fetch, maxTokens = 320 }) {
  const url = endpoint(cfg, 'chat/completions');
  const messages = [{ role: 'system', content: system }, ...history, { role: 'user', content: userText }];
  const params = {
    temperature: 0.9,
    tokenKey: isOfficial(cfg) ? 'max_completion_tokens' : 'max_tokens',
    tokens: maxTokens,
  };
  let lastErr;
  for (let attempt = 0; attempt < 4; attempt++) {
    const body = { model: cfg.model, messages, stream: true, [params.tokenKey]: params.tokens };
    if (params.temperature != null) body.temperature = params.temperature;
    const t = withTimeout(signal, TIMEOUT_MS);
    try {
      const res = await fetchFn(url, { method: 'POST', headers: headers(cfg), body: JSON.stringify(body), signal: t.signal });
      if (!res.ok) {
        const err = await httpError(res);
        const msg = (err.detail || '').toLowerCase();
        if (res.status === 400) {
          // Newer models reject some parameters. Adjust once each, then retry.
          if (params.temperature != null && msg.includes('temperature')) { params.temperature = null; lastErr = err; continue; }
          if (params.tokenKey === 'max_tokens' && msg.includes('max_completion_tokens')) { params.tokenKey = 'max_completion_tokens'; lastErr = err; continue; }
          if (params.tokenKey === 'max_completion_tokens' && msg.includes('max_tokens') && !msg.includes('max_completion_tokens is')) { params.tokenKey = 'max_tokens'; lastErr = err; continue; }
        }
        throw err;
      }
      const type = res.headers.get('content-type') || '';
      let text = '';
      let finish = '';
      if (type.includes('text/event-stream') && res.body) {
        for await (const data of readSSE(res)) {
          if (data.trim() === '[DONE]') break;
          let j;
          try { j = JSON.parse(data); } catch { continue; }
          if (j.error) throw fail(j.error.message || 'The provider reported an error.');
          const choice = j.choices?.[0];
          const piece = choice?.delta?.content;
          if (piece) { text += piece; onToken?.(piece, text); }
          if (choice?.finish_reason) finish = choice.finish_reason;
        }
      } else {
        const j = await res.json();
        const choice = j.choices?.[0];
        text = choice?.message?.content ?? '';
        finish = choice?.finish_reason ?? '';
        if (text) onToken?.(text, text);
      }
      if (!text.trim() && finish === 'length' && params.tokens < 2000) {
        // Reasoning models can spend the whole budget thinking. Give them more room once.
        params.tokens = 1600;
        lastErr = fail('The model ran out of room before answering.');
        continue;
      }
      if (!text.trim()) throw fail('The model returned an empty reply.');
      return text;
    } catch (err) {
      if (err.status || err.explicit) throw err;
      throw netError(err, url, t);
    } finally {
      t.cleanup();
    }
  }
  throw lastErr ?? fail('The provider rejected the request.');
}
