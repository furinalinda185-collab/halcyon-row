// The AI facade the UI talks to. It picks the provider, builds the prompt, enforces the
// daily message cap, retries once on flaky networks, and parses the reply.

import { aiReady } from '../core/prefs.js';
import { buildSystemPrompt } from './prompt.js';
import { parseReply } from './reply.js';
import * as openai from './providers/openai.js';
import * as opencode from './providers/opencode.js';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function createAI(app, { fetchFn } = {}) {
  let serverInfo;

  function cfg() {
    const a = app.prefs.ai;
    if (a.provider === 'opencode') {
      return { via: a.via, baseUrl: a.opencodeBase, username: a.username, password: a.password, providerID: a.providerID, modelID: a.modelID, agent: a.agent, token: a.token };
    }
    return { via: a.via, baseUrl: a.openaiBase, apiKey: a.apiKey, model: a.model, token: a.token };
  }

  const provider = () => (app.prefs.ai.provider === 'opencode' ? opencode : openai);

  async function withRetry(fn) {
    try {
      return await fn();
    } catch (err) {
      if (!err?.retryable || err.name === 'AbortError') throw err;
      await sleep(700);
      return fn();
    }
  }

  const ai = {
    ready: () => aiReady(app.prefs),

    /** AI messages left today under the wallet cap. */
    remaining() {
      const cap = app.prefs.ai.dailyCap;
      const { state } = app;
      const used = state.ai.day === state.time.day ? state.ai.used : 0;
      return Math.max(0, cap - used);
    },

    /**
     * @param opts { charId, userText, history, mode: 'phone'|'talk', convoId, signal, onToken }
     * @returns { bubbles, mood, bond, note }
     */
    async chat({ charId, userText, history = [], mode = 'phone', convoId, signal, onToken }) {
      if (!ai.ready()) throw new Error('AI text mode is not set up yet.');
      if (ai.remaining() <= 0) throw new Error('You have used today\'s AI message allowance. Story mode still works, and it resets tomorrow.');
      const system = buildSystemPrompt({ state: app.state, prefs: app.prefs, charId, mode });
      const c = cfg();
      const raw = await withRetry(() =>
        provider().chat(c, { system, history, userText, convoId: convoId ?? `${mode}:${charId}`, signal, onToken, fetchFn }));
      const parsed = parseReply(raw, { mode });
      const { state } = app;
      if (state.ai.day !== state.time.day) state.ai = { day: state.time.day, used: 0 };
      state.ai.used += 1;
      return parsed;
    },

    /** Model choices for the settings screen. */
    async listModels(signal) {
      return provider().listModels(cfg(), { signal, fetchFn });
    },

    /** A tiny real request so the player knows the whole chain works. */
    async test(signal) {
      const c = cfg();
      const sys = 'You are a test. Reply with exactly one short friendly sentence and nothing else.';
      const raw = await provider().chat(c, { system: sys, history: [], userText: 'Say hello.', convoId: 'test', signal, fetchFn, maxTokens: 60 });
      if (app.prefs.ai.provider === 'opencode') await opencode.closeSession(c, 'test', { fetchFn });
      return raw.trim().slice(0, 140);
    },

    /** Is the local game server (server/serve.mjs) serving this page? */
    async detectServer(force = false) {
      if (serverInfo !== undefined && !force) return serverInfo;
      if (!/^https?:$/.test(globalThis.location?.protocol ?? '')) return (serverInfo = null);
      try {
        const headers = app.prefs.ai.token ? { 'x-game-token': app.prefs.ai.token } : {};
        const res = await (fetchFn ?? fetch)('/api/ai/config', { headers, cache: 'no-store' });
        const type = res.headers.get('content-type') || '';
        serverInfo = res.ok && type.includes('json') ? await res.json() : null;
      } catch {
        serverInfo = null;
      }
      return serverInfo;
    },
  };
  return ai;
}
