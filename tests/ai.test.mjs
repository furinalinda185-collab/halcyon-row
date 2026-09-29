import test from 'node:test';
import assert from 'node:assert/strict';

import { parseReply, tidy, stripForDisplay } from '../js/ai/reply.js';
import { readSSE } from '../js/ai/sse.js';
import { buildSystemPrompt } from '../js/ai/prompt.js';
import { cleanBase } from '../js/ai/net.js';
import * as openai from '../js/ai/providers/openai.js';
import * as opencode from '../js/ai/providers/opencode.js';
import { createAI } from '../js/ai/client.js';
import { newState } from '../js/core/state.js';
import { sanitizePrefs } from '../js/core/prefs.js';
import { CHARACTERS } from '../js/data/characters/index.js';
import { startMockOpenAI, REPLY } from './mocks/openai.mjs';
import { startMockOpenCode } from './mocks/opencode.mjs';

// ------------------------------------------------------------ reply parsing
test('parseReply splits bubbles and reads the hidden tag', () => {
  const r = parseReply(REPLY);
  assert.deepEqual(r.bubbles, ['ha, okay wait', 'that is genuinely funny']);
  assert.equal(r.mood, 'laugh');
  assert.equal(r.bond, 2);
  assert.equal(r.note, 'likes puns');
});

test('parseReply survives a missing, partial or malformed tag', () => {
  assert.equal(parseReply('hello there').mood, 'neutral');
  assert.equal(parseReply('hello there').bond, 0);
  assert.deepEqual(parseReply('hi\n\n<state mood="happy" bo').bubbles, ['hi']);
  const weird = parseReply('hey\n<state mood="ecstatic" bond="99" note="<script>x</script>"/>');
  assert.equal(weird.mood, 'neutral', 'unknown moods fall back');
  assert.equal(weird.bond, 3, 'bond is clamped');
  assert.equal(weird.note.includes('<'), false, 'angle brackets never survive in notes');
  assert.throws(() => parseReply('   <state mood="happy"/>'), /empty/);
});

test('house style: dashes become commas, markdown goes away', () => {
  assert.equal(tidy('well — that is odd'), 'well, that is odd');
  assert.equal(tidy('one – two'), 'one, two');
  assert.equal(tidy('this - that'), 'this, that');
  assert.equal(tidy('**bold** move'), 'bold move');
  assert.equal(tidy('# Heading\ntext'), 'Heading\ntext');
  assert.equal(parseReply('ok — fine').bubbles[0], 'ok, fine');
});

test('talk mode returns one bubble, phone caps at three', () => {
  assert.equal(parseReply('a\n\nb\n\nc', { mode: 'talk' }).bubbles.length, 1);
  assert.equal(parseReply('a\n\nb\n\nc\n\nd\n\ne').bubbles.length, 3);
  assert.equal(parseReply('*waves* hi', { mode: 'phone' }).bubbles[0], 'waves hi');
  assert.match(parseReply('*waves* hi', { mode: 'talk' }).bubbles[0], /\*waves\*/);
});

test('stripForDisplay hides a tag while it streams in', () => {
  assert.equal(stripForDisplay('hello <state mood="ha'), 'hello ');
  assert.equal(stripForDisplay('hello <state mood="happy" bond="1"/>'), 'hello ');
});

// --------------------------------------------------------------------- SSE
test('SSE reader handles events split across chunks and CRLF', async () => {
  const enc = new TextEncoder();
  const pieces = ['data: {"a":1}\r\n\r\nda', 'ta: {"a":2}\n\n', 'data: [DONE]\n\n'];
  const stream = new ReadableStream({ start(c) { pieces.forEach((p) => c.enqueue(enc.encode(p))); c.close(); } });
  const got = [];
  for await (const d of readSSE({ body: stream })) got.push(d);
  assert.deepEqual(got, ['{"a":1}', '{"a":2}', '[DONE]']);
});

// ------------------------------------------------------------------ prompt
function promptFor(id, { rank = 1, romanceEnabled = false, romance = 'off', mode = 'phone', nudges = true } = {}) {
  const state = newState('Robin');
  state.bonds[id].rank = rank;
  state.bonds[id].romance = romance;
  state.time = { day: 9, slot: 3 };
  state.loc = 'cafe';
  return buildSystemPrompt({ state, prefs: { romanceEnabled, gentleNudges: nudges }, charId: id, mode });
}

test('prompt carries the voice bible, honesty rules and output contract', () => {
  for (const c of CHARACTERS) {
    const p = promptFor(c.id, { rank: 2 });
    assert.ok(p.includes(c.ai.bible.slice(0, 60)), `${c.id} bible`);
    assert.ok(p.includes('Robin'));
    assert.match(p, /sincerely asks whether you are real, human, or an AI/);
    assert.match(p, /Never guilt, pressure/);
    assert.match(p, /self harm, suicide, abuse/);
    assert.match(p, /No sexual content/);
    assert.match(p, /<state mood="MOOD" bond="N" note="TEXT"\/>/);
    assert.match(p, /Never use em dashes/);
  }
});

test('prompt itself follows the no dashes house style', () => {
  for (const c of CHARACTERS) {
    const p = promptFor(c.id, { rank: 4, romanceEnabled: true, romance: 'open' });
    assert.equal(/[—–]| - /.test(p), false, `${c.id} prompt has a dash`);
  }
});

test('secrets are gated by rank and never leak early', () => {
  for (const c of CHARACTERS) {
    const early = promptFor(c.id, { rank: 1 });
    for (const s of c.ai.secrets) assert.equal(early.includes(s.text), false, `${c.id} leaked a rank ${s.rank} secret at rank 1`);
    assert.match(early, /private things about your life you have not shared yet/);
    const mid = promptFor(c.id, { rank: 2 });
    assert.ok(mid.includes(c.ai.secrets[0].text));
    assert.equal(mid.includes(c.ai.secrets[1].text), false);
    const late = promptFor(c.id, { rank: 4 });
    for (const s of c.ai.secrets) assert.ok(late.includes(s.text));
  }
});

test('romance is friendship only unless enabled, eligible and opened', () => {
  const off = promptFor('junie', { rank: 4, romanceEnabled: false, romance: 'open' });
  assert.match(off, /friendship/);
  assert.equal(/taking it slowly|together, gently/.test(off), false);
  const on = promptFor('junie', { rank: 4, romanceEnabled: true, romance: 'open' });
  assert.match(on, /taking it slowly/);
  assert.match(on, /PG-13 and never sexual/);
  const notOpened = promptFor('junie', { rank: 4, romanceEnabled: true, romance: 'friends' });
  assert.equal(/taking it slowly/.test(notOpened), false);
  const tomek = promptFor('tomek', { rank: 4, romanceEnabled: true, romance: 'open' });
  assert.equal(/taking it slowly|together, gently/.test(tomek), false, 'friendship only characters ignore the flag');
});

test('modes change the writing instructions, and nudges can be turned off', () => {
  assert.match(promptFor('dez', { mode: 'phone' }), /You are texting/);
  assert.match(promptFor('dez', { mode: 'talk' }), /face to face/);
  assert.match(promptFor('dez', { nudges: true }), /nudge Robin toward the real world/);
  assert.equal(/nudge Robin toward the real world/.test(promptFor('dez', { nudges: false })), false);
});

// ---------------------------------------------------------------------- net
test('cleanBase accepts only plain http(s) addresses', () => {
  assert.equal(cleanBase('https://api.openai.com/v1/'), 'https://api.openai.com/v1');
  assert.equal(cleanBase(' http://localhost:11434/v1 '), 'http://localhost:11434/v1');
  for (const bad of ['javascript:alert(1)', 'file:///etc/passwd', 'not a url', 'ftp://x', 'https://user:pw@host/v1', '']) {
    assert.throws(() => cleanBase(bad), undefined, bad);
  }
});

// ------------------------------------------------------------ OpenAI adapter
test('openai adapter streams tokens and sends the key', async () => {
  const mock = await startMockOpenAI();
  try {
    const cfg = { via: 'direct', baseUrl: mock.url, apiKey: 'testkey', model: 'gpt-test' };
    const seen = [];
    const text = await openai.chat(cfg, { system: 'SYS', history: [{ role: 'user', content: 'hi' }, { role: 'assistant', content: 'yo' }], userText: 'joke?', onToken: (p) => seen.push(p) });
    assert.equal(text, REPLY);
    assert.ok(seen.length > 3, 'arrived in several pieces');
    const call = mock.calls.find((c) => c.method === 'POST');
    assert.equal(call.headers.authorization, 'Bearer testkey');
    assert.deepEqual(call.body.messages.map((m) => m.role), ['system', 'user', 'assistant', 'user']);
    assert.equal(call.body.messages[0].content, 'SYS');
    assert.equal(call.body.stream, true);
    assert.equal(call.body.max_tokens, 320, 'non OpenAI hosts use max_tokens');
  } finally { await mock.close(); }
});

test('openai adapter adapts when a model rejects temperature', async () => {
  const mock = await startMockOpenAI();
  try {
    const cfg = { via: 'direct', baseUrl: mock.url, apiKey: 'testkey', model: 'strict-a' };
    assert.equal(await openai.chat(cfg, { system: 's', userText: 'x' }), REPLY);
    const posts = mock.calls.filter((c) => c.method === 'POST');
    assert.equal(posts.length, 2);
    assert.ok('temperature' in posts[0].body);
    assert.equal('temperature' in posts[1].body, false);
  } finally { await mock.close(); }
});

test('openai adapter swaps token parameter both ways', async () => {
  const mock = await startMockOpenAI();
  try {
    let cfg = { via: 'direct', baseUrl: mock.url, apiKey: 'testkey', model: 'reason-b' };
    assert.equal(await openai.chat(cfg, { system: 's', userText: 'x' }), REPLY);
    const last = mock.calls.filter((c) => c.method === 'POST').at(-1).body;
    assert.ok('max_completion_tokens' in last && !('max_tokens' in last));
    assert.ok(last.max_completion_tokens >= 1000, 'a starved reasoning model gets more room');
    mock.calls.length = 0;
    cfg = { via: 'direct', baseUrl: mock.url, apiKey: 'testkey', model: 'plain-c' };
    assert.equal(await openai.chat(cfg, { system: 's', userText: 'x' }), REPLY);
  } finally { await mock.close(); }
});

test('openai adapter also accepts plain JSON answers', async () => {
  const mock = await startMockOpenAI();
  try {
    const cfg = { via: 'direct', baseUrl: mock.url, apiKey: 'testkey', model: 'json-x' };
    assert.equal(await openai.chat(cfg, { system: 's', userText: 'x' }), REPLY);
  } finally { await mock.close(); }
});

test('openai adapter gives readable errors', async () => {
  const mock = await startMockOpenAI();
  try {
    const base = { via: 'direct', baseUrl: mock.url, apiKey: 'testkey' };
    await assert.rejects(openai.chat({ ...base, apiKey: 'wrong', model: 'gpt-test' }, { system: 's', userText: 'x' }), /401.*API key/s);
    await assert.rejects(openai.chat({ ...base, model: 'missing' }, { system: 's', userText: 'x' }), /404.*does not exist/s);
    await assert.rejects(openai.chat({ ...base, model: 'busy' }, { system: 's', userText: 'x' }), /429.*quota/s);
    await assert.rejects(openai.chat({ ...base, model: 'err500-z' }, { system: 's', userText: 'x' }), (e) => e.status === 500 && e.retryable === true);
    await assert.rejects(openai.chat({ ...base, baseUrl: 'http://127.0.0.1:1/v1', model: 'gpt-test' }, { system: 's', userText: 'x' }), /Could not reach 127.0.0.1:1/);
    await assert.rejects(openai.chat({ ...base, baseUrl: 'javascript:alert(1)', model: 'gpt-test' }, { system: 's', userText: 'x' }), /http/);
  } finally { await mock.close(); }
});

test('openai adapter lists only chat models, and can be aborted', async () => {
  const mock = await startMockOpenAI();
  try {
    const cfg = { via: 'direct', baseUrl: mock.url, apiKey: 'testkey' };
    assert.deepEqual(await openai.listModels(cfg), ['gpt-test', 'reason-b', 'strict-a']);
    const ctrl = new AbortController();
    ctrl.abort();
    await assert.rejects(openai.chat({ ...cfg, model: 'gpt-test' }, { system: 's', userText: 'x', signal: ctrl.signal }), (e) => e.name === 'AbortError');
  } finally { await mock.close(); }
});

test('server mode sends no key from the browser, only the game token', async () => {
  const mock = await startMockOpenAI({ key: '' });
  try {
    const cfg = { via: 'server', apiKey: 'should-not-be-sent', model: 'gpt-test', token: 'tok123' };
    const fetchFn = (url, init) => fetch(new URL(url, mock.origin).href.replace('/api/ai/openai', '/v1'), init);
    await openai.chat(cfg, { system: 's', userText: 'x', fetchFn });
    const call = mock.calls.find((c) => c.method === 'POST');
    assert.equal(call.headers.authorization, undefined);
    assert.equal(call.headers['x-game-token'], 'tok123');
  } finally { await mock.close(); }
});

// ----------------------------------------------------------- OpenCode adapter
test('opencode adapter lists connected providers only', async () => {
  const mock = await startMockOpenCode();
  try {
    const models = await opencode.listModels({ via: 'direct', baseUrl: mock.url });
    assert.deepEqual(models.map((m) => `${m.providerID}/${m.modelID}`), ['anthropic/claude-x', 'openai/gpt-a', 'openai/gpt-b']);
    assert.ok(models.every((m) => m.label.includes(':')));
  } finally { await mock.close(); }
});

test('opencode adapter follows the documented message shape', async () => {
  const mock = await startMockOpenCode();
  try {
    const cfg = { via: 'direct', baseUrl: mock.url, providerID: 'openai', modelID: 'gpt-a', agent: 'halcyon' };
    const history = [{ role: 'user', content: 'earlier question' }, { role: 'assistant', content: 'earlier answer' }];
    const out = await opencode.chat(cfg, { system: 'SYS', history, userText: 'hello', convoId: 't1' });
    assert.match(out, /tell me more/);
    const [create, msg] = mock.calls.filter((c) => c.method === 'POST');
    assert.equal(create.url, '/session');
    assert.equal(msg.url, '/session/ses_1/message');
    assert.deepEqual(msg.body.model, { providerID: 'openai', modelID: 'gpt-a' });
    assert.equal(msg.body.system, 'SYS');
    assert.equal(msg.body.agent, 'halcyon');
    assert.equal(msg.body.tools.bash, false);
    assert.equal(msg.body.tools.edit, false);
    assert.equal(msg.body.parts[0].type, 'text');
    assert.match(msg.body.parts[0].text, /earlier question/, 'a fresh session is seeded with our history');
    assert.match(msg.body.parts[0].text, /hello$/);

    await opencode.chat(cfg, { system: 'SYS', history, userText: 'second', convoId: 't1' });
    const second = mock.calls.filter((c) => c.method === 'POST').at(-1);
    assert.equal(second.url, '/session/ses_1/message', 'the session is reused');
    assert.equal(second.body.parts[0].text, 'second', 'and not re seeded');
  } finally { await mock.close(); }
});

test('opencode adapter recovers from a lost session and surfaces errors', async () => {
  const mock = await startMockOpenCode();
  try {
    const cfg = { via: 'direct', baseUrl: mock.url, providerID: 'openai', modelID: 'gpt-a' };
    await opencode.chat(cfg, { system: 's', userText: 'a', convoId: 'lost' });
    mock.sessions.clear();
    const out = await opencode.chat(cfg, { system: 's', userText: 'b', convoId: 'lost' });
    assert.match(out, /tell me more/);
    assert.equal(mock.calls.filter((c) => c.url === '/session' && c.method === 'POST').length, 2);

    mock.state.failNext = { name: 'ProviderAuthError', data: { message: 'Not signed in to OpenAI' } };
    await assert.rejects(opencode.chat(cfg, { system: 's', userText: 'c', convoId: 'lost' }), /Not signed in to OpenAI/);
    await assert.rejects(opencode.chat({ ...cfg, modelID: '' }, { system: 's', userText: 'c', convoId: 'x' }), /Pick a model/);
  } finally { await mock.close(); }
});

test('opencode adapter uses basic auth when a password is set', async () => {
  const mock = await startMockOpenCode({ password: 's3cret' });
  try {
    const bad = { via: 'direct', baseUrl: mock.url, providerID: 'openai', modelID: 'gpt-a', password: 'nope' };
    await assert.rejects(opencode.chat(bad, { system: 's', userText: 'a', convoId: 'auth' }), /401/);
    const good = { ...bad, password: 's3cret' };
    assert.match(await opencode.chat(good, { system: 's', userText: 'a', convoId: 'auth2' }), /tell me more/);
    assert.equal(mock.calls.at(-1).headers.authorization, `Basic ${Buffer.from('opencode:s3cret').toString('base64')}`);
  } finally { await mock.close(); }
});

// -------------------------------------------------------------- client facade
function fakeApp(aiPrefs) {
  const prefs = sanitizePrefs({ ai: { enabled: true, ...aiPrefs } });
  const state = newState('Robin');
  state.bonds.junie.rank = 2;
  return { prefs, state };
}

test('client returns parsed replies, counts messages and enforces the daily cap', async () => {
  const mock = await startMockOpenAI();
  try {
    const app = fakeApp({ provider: 'openai', openaiBase: mock.url, apiKey: 'testkey', model: 'gpt-test', dailyCap: 5 });
    const ai = createAI(app);
    assert.equal(ai.ready(), true);
    assert.equal(ai.remaining(), 5);
    const r = await ai.chat({ charId: 'junie', userText: 'tell me a pun', mode: 'phone' });
    assert.deepEqual(r.bubbles, ['ha, okay wait', 'that is genuinely funny']);
    assert.equal(r.mood, 'laugh');
    assert.equal(ai.remaining(), 4);
    const sent = mock.calls.find((c) => c.method === 'POST').body;
    assert.match(sent.messages[0].content, /Junie Park/);
    assert.equal(sent.messages.at(-1).content, 'tell me a pun');
    for (let i = 0; i < 4; i++) await ai.chat({ charId: 'junie', userText: 'again', mode: 'phone' });
    await assert.rejects(ai.chat({ charId: 'junie', userText: 'one more', mode: 'phone' }), /allowance/);
    app.state.time.day += 1;
    assert.equal(ai.remaining(), 5, 'the cap resets each in game day');
  } finally { await mock.close(); }
});

test('client refuses to run when setup is incomplete', async () => {
  const app = fakeApp({ provider: 'openai', model: '' });
  const ai = createAI(app);
  assert.equal(ai.ready(), false);
  await assert.rejects(ai.chat({ charId: 'junie', userText: 'hi' }), /not set up/);
});

test('client works end to end with OpenCode and cleans up after a test', async () => {
  const mock = await startMockOpenCode();
  try {
    const app = fakeApp({ provider: 'opencode', opencodeBase: mock.url, providerID: 'openai', modelID: 'gpt-a' });
    const ai = createAI(app);
    const r = await ai.chat({ charId: 'junie', userText: 'hey', mode: 'talk', convoId: 'talk:junie:1:1' });
    assert.equal(r.mood, 'thinking');
    assert.equal(r.bubbles.length, 1);
    assert.match(await ai.test(), /tell me more/);
    assert.ok(mock.calls.some((c) => c.method === 'DELETE'), 'the test session is deleted');
    assert.equal((await ai.listModels()).length, 3);
  } finally { await mock.close(); }
});

test('client retries once on a flaky 500 but not on a 401', async () => {
  const mock = await startMockOpenAI();
  try {
    const app = fakeApp({ provider: 'openai', openaiBase: mock.url, apiKey: 'testkey', model: 'err500-z' });
    const ai = createAI(app);
    await assert.rejects(ai.chat({ charId: 'junie', userText: 'x' }), /500/);
    assert.equal(mock.calls.filter((c) => c.method === 'POST').length, 2, 'one retry');
    mock.calls.length = 0;
    app.prefs.ai.apiKey = 'wrong';
    app.prefs.ai.model = 'gpt-test';
    await assert.rejects(ai.chat({ charId: 'junie', userText: 'x' }), /401/);
    assert.equal(mock.calls.filter((c) => c.method === 'POST').length, 1, 'no retry on auth errors');
  } finally { await mock.close(); }
});
