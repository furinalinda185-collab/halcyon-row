// Browser end to end check of the parts unit tests cannot see: the real UI talking to
// the real local server, which talks to mock AI providers. Not part of `npm test`
// because it needs a browser.
//
//   NODE_PATH=$(npm root -g) node tests/e2e/smoke.mjs
//
// Needs Playwright with Chromium installed (PLAYWRIGHT_BROWSERS_PATH if not default).

import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import { createGameServer } from '../../server/serve.mjs';
import { startMockOpenAI } from '../mocks/openai.mjs';
import { startMockOpenCode } from '../mocks/opencode.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const KEY = 'sk-e2e-key';
const results = [];
const ok = (name) => { results.push(name); console.log(`  ok  ${name}`); };

async function boot({ reply } = {}) {
  const oai = await startMockOpenAI({ key: KEY, reply });
  const oc = await startMockOpenCode({});
  const server = createGameServer({ env: { OPENAI_API_KEY: KEY, OPENAI_BASE_URL: oai.url, OPENCODE_URL: oc.url } });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;
  return {
    url: `http://localhost:${port}/`, oai, oc,
    close: async () => { server.closeAllConnections?.(); await new Promise((r) => server.close(r)); await oai.close(); await oc.close(); },
  };
}

async function newPage(browser, url, aiPrefs) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(`console: ${m.text()}`); });
  await page.addInitScript((ai) => {
    localStorage.setItem('halcyon.prefs.v1', JSON.stringify({ textSpeed: 'instant', sound: false, ai: { enabled: true, via: 'server', dailyCap: 20, ...ai } }));
  }, aiPrefs);
  await page.goto(url, { waitUntil: 'networkidle' });
  // Skip the title and drop into a mid game state at the café.
  await page.evaluate(async () => {
    const { app, newState } = globalThis.__halcyon;
    const s = newState('Robin');
    s.beats.push('arrival', 'notice'); s.flags.tut_hub = true; s.time = { day: 9, slot: 1 }; s.loc = 'cafe';
    for (const [id, rank, pts] of [['junie', 2, 24], ['dez', 1, 5]]) { s.bonds[id].rank = rank; s.bonds[id].pts = pts; s.bonds[id].met = true; }
    document.querySelector('.title')?.remove();
    app.state = s;
    const hub = await import('/js/ui/hub.js');
    hub.mountHub(app);
  });
  await page.waitForSelector('.hub');
  return { page, errors, ctx };
}

const state = (page) => page.evaluate(() => JSON.parse(JSON.stringify(globalThis.__halcyon.app.state)));

async function main() {
  const browser = await chromium.launch();
  const env = await boot();
  try {
    // ---------------------------------------------------------- phone chat
    let { page, errors, ctx } = await newPage(browser, env.url, { provider: 'openai', model: 'gpt-test' });
    await page.click('.nav-btn:has-text("Phone")');
    await page.click('.thread-row:has-text("Junie")');
    await page.fill('.compose textarea', 'tell me a pun');
    await page.click('.compose .send');
    await page.waitForSelector('.bubble.them:has-text("that is genuinely funny")', { timeout: 15000 });
    const shown = await page.textContent('.msgs');
    assert.ok(shown.includes('ha, okay wait'), 'first bubble shown');
    assert.equal(shown.includes('<state'), false, 'the hidden tag never reaches the screen');
    assert.equal(shown.includes('mood='), false);
    assert.equal(await page.locator('.bubble.them').count() >= 2, true, 'split into separate bubbles');
    const afterChat = await state(page);
    assert.equal(afterChat.ai.used, 1, 'usage counted');
    assert.equal(afterChat.inbox.junie.at(-1).text, 'that is genuinely funny');
    assert.ok(afterChat.memory.junie.notes.some((n) => n.text === 'likes puns'), 'the model note became a memory');
    assert.ok(afterChat.bonds.junie.pts > 24, 'a meaningful exchange earned a point');
    assert.ok(env.oai.calls.at(-1).headers.authorization === `Bearer ${KEY}`, 'server added the key');
    assert.equal(JSON.stringify(await page.evaluate(() => localStorage.getItem('halcyon.prefs.v1'))).includes(KEY), false, 'the key never reached the browser');
    ok('phone chat: streams, splits bubbles, hides tag, counts, remembers, keeps key server side');

    // -------------------------------------------------------- in person chat
    await page.keyboard.press('Escape');
    const slotBefore = (await state(page)).time.slot;
    await page.click('.friend:has-text("Junie") button:has-text("Chat freely")');
    await page.waitForSelector('.talk');
    await page.fill('.talk textarea', 'how are you really?');
    await page.click('.talk .send');
    await page.waitForSelector('.tmsg.them:not(.typing)', { timeout: 15000 });
    assert.equal((await page.textContent('.talk-log')).includes('<state'), false);
    const mouthOpen = await page.evaluate(() => document.querySelector('.talk-portrait svg')?.innerHTML.includes('#5a2230'));
    assert.equal(mouthOpen, true, 'the portrait changed to the laugh expression from the tag');
    for (let i = 0; i < 2; i++) {
      await page.fill('.talk textarea', `and another thing ${i}`);
      await page.click('.talk .send');
      await page.waitForFunction((n) => document.querySelectorAll('.tmsg.them:not(.typing)').length >= n, i + 2, { timeout: 15000 });
    }
    await page.click('.talk-head button:has-text("Head out")');
    await page.waitForSelector('.talk', { state: 'detached' });
    await page.waitForFunction((b) => globalThis.__halcyon.app.state.time.slot > b, slotBefore, { timeout: 8000 });
    ok('in person chat: portrait mood follows the reply, leaving spends a time slot');

    // ------------------------------------------------- settings: models + test
    await page.click('.nav-btn:has-text("Menu")');
    await page.click('.tabs button:has-text("AI text mode")');
    await page.waitForSelector('.note.good:has-text("Game server found")');
    await page.click('button:has-text("Load models")');
    await page.waitForSelector('select[aria-label="Loaded models"]:not([hidden])');
    const opts = await page.$$eval('select[aria-label="Loaded models"] option', (o) => o.map((x) => x.textContent));
    assert.ok(opts.some((t) => t === 'gpt-test'), `options were: ${JSON.stringify(opts)}`);
    assert.equal(opts.some((t) => /embed|whisper|tts|dall/.test(t)), false, 'non chat models are filtered');
    await page.click('button:has-text("Test the connection")');
    await page.waitForSelector('.aiout.good', { timeout: 15000 });
    ok('settings: game server detected, models load and filter, connection test passes');

    // provider switch to OpenCode through the server
    await page.click('.seg button:has-text("OpenCode")');
    await page.click('button:has-text("Load models")');
    await page.waitForSelector('select[aria-label="Loaded models"]:not([hidden])');
    await page.selectOption('select[aria-label="Loaded models"]', { index: 1 });
    await page.click('button:has-text("Test the connection")');
    await page.waitForSelector('.aiout.good', { timeout: 15000 });
    assert.ok(env.oc.calls.some((c) => c.method === 'POST' && /\/message$/.test(c.url)), 'the OpenCode message endpoint was called');
    const ocMsg = env.oc.calls.filter((c) => /\/message$/.test(c.url)).at(-1).body;
    assert.equal(ocMsg.tools.bash, false);
    ok('opencode via the server: models load, test passes, tools are disabled');
    assert.deepEqual(errors, [], `browser errors: ${errors.join(' | ')}`);
    await ctx.close();

    // ------------------------------------------------------------- failure
    ({ page, errors, ctx } = await newPage(browser, env.url, { provider: 'openai', model: 'missing' }));
    await page.click('.nav-btn:has-text("Phone")');
    await page.click('.thread-row:has-text("Junie")');
    await page.fill('.compose textarea', 'hello?');
    await page.click('.compose .send');
    await page.waitForSelector('.bubble.err', { timeout: 15000 });
    assert.match(await page.textContent('.bubble.err'), /404|does not exist/);
    assert.equal((await state(page)).inbox.junie.filter((m) => m.from === 'them').length, 0, 'no fake reply is invented on failure');
    ok('failure: a clear error is shown and no reply is faked');
    await ctx.close();

    // -------------------------------------------- hostile output is inert text
    const evil = await boot({ reply: 'hi <img src=x onerror="window.__pwned=1"> <script>window.__pwned=2</script>\n<state mood="happy" bond="1"/>' });
    try {
      ({ page, errors, ctx } = await newPage(browser, evil.url, { provider: 'openai', model: 'gpt-test' }));
      await page.click('.nav-btn:has-text("Phone")');
      await page.click('.thread-row:has-text("Junie")');
      await page.fill('.compose textarea', 'hey');
      await page.click('.compose .send');
      await page.waitForSelector('.bubble.them', { timeout: 15000 });
      await page.waitForTimeout(300);
      assert.equal(await page.evaluate(() => globalThis.__pwned), undefined, 'no script ran');
      assert.equal(await page.locator('.msgs img, .msgs script').count(), 0, 'no elements were created from model output');
      assert.match(await page.textContent('.msgs'), /<img src=x/, 'the markup is shown as harmless text');
      ok('hostile model output is rendered as text, never as markup');
      await ctx.close();
    } finally { await evil.close(); }

    // ------------------------------------------------- daily cap is enforced
    ({ page, errors, ctx } = await newPage(browser, env.url, { provider: 'openai', model: 'gpt-test', dailyCap: 5 }));
    await page.evaluate(() => { globalThis.__halcyon.app.state.ai = { day: 9, used: 5 }; });
    await page.click('.nav-btn:has-text("Phone")');
    await page.click('.thread-row:has-text("Junie")');
    assert.match(await page.textContent('.compose'), /limit reached/);
    assert.equal(await page.locator('.compose .send[disabled]').count(), 1);
    ok('the daily AI cap disables sending');
    await ctx.close();
  } finally {
    await browser.close();
    await env.close();
  }
  console.log(`\n${results.length} end to end checks passed`);
}

main().catch((err) => {
  console.error('\nE2E FAILED:', err.message);
  process.exit(1);
});
