import test from 'node:test';
import assert from 'node:assert/strict';

import { weekdayIndex, weekdayName, weatherFor, advanceSlot, FESTIVAL_DAY, seeded } from '../js/core/clock.js';
import { levelOf, addStat, statLevel } from '../js/core/stats.js';
import { addPoints, sceneUnlocked, nextSceneNumber, completeScene, SCENE_PTS, DAILY_CAPS, bondProgress } from '../js/core/bond.js';
import { Runner, test as cond, format } from '../js/core/script.js';
import { narr, choice, opt, iff, set, stat, money, end, voice, remember } from '../js/core/dsl.js';
import { newState, sanitizeState, exportGame, importGame, saveGame, loadGame, memoryStorage, SAVE_VERSION } from '../js/core/state.js';
import { sanitizePrefs, aiReady, DEFAULT_PREFS } from '../js/core/prefs.js';
import { passSlots, sleep, whereIs, whoIsAt, dueBeat, makeEnv, buyItem, startActivity, goTo } from '../js/core/game.js';
import { deliverTexts, sendQuickReply, unreadCount } from '../js/core/phone.js';

const env = (state, extra = {}) => ({ state, prefs: { romanceEnabled: false }, eligible: () => true, ...extra });

// ------------------------------------------------------------------ clock
test('day 1 is Monday and weeks wrap', () => {
  assert.equal(weekdayName(1), 'Monday');
  assert.equal(weekdayName(7), 'Sunday');
  assert.equal(weekdayName(8), 'Monday');
  assert.equal(weekdayIndex(FESTIVAL_DAY), 6, 'festival is a Sunday');
});

test('weather is deterministic and the festival is clear', () => {
  for (let d = 1; d < 60; d++) assert.equal(weatherFor(d), weatherFor(d));
  assert.equal(weatherFor(FESTIVAL_DAY), 'clear');
  assert.equal(weatherFor(FESTIVAL_DAY - 1), 'clear');
  const seen = new Set();
  for (let d = 2; d < 200; d++) seen.add(weatherFor(d));
  assert.deepEqual([...seen].sort(), ['clear', 'cloudy', 'fog', 'rain']);
});

test('advanceSlot rolls the day after night', () => {
  const t = { day: 1, slot: 2 };
  assert.equal(advanceSlot(t), false);
  assert.deepEqual(t, { day: 1, slot: 3 });
  assert.equal(advanceSlot(t), true);
  assert.deepEqual(t, { day: 2, slot: 0 });
});

test('seeded rng is repeatable', () => {
  const a = seeded(42);
  const b = seeded(42);
  for (let i = 0; i < 5; i++) assert.equal(a(), b());
});

// ------------------------------------------------------------------ stats
test('stat levels and gain', () => {
  assert.equal(levelOf(0), 0);
  assert.equal(levelOf(3), 1);
  assert.equal(levelOf(18), 4);
  assert.equal(levelOf(500), 4);
  const s = newState('Sam');
  assert.deepEqual(addStat(s, 'charm', 3), { from: 0, to: 1 });
  assert.equal(statLevel(s, 'charm'), 1);
  assert.throws(() => addStat(s, 'luck', 1));
});

// ------------------------------------------------------------------ bond
test('strangers gain nothing except through scenes', () => {
  const s = newState();
  assert.equal(addPoints(s, 'junie', 5, 'hangout'), 0);
  assert.equal(addPoints(s, 'junie', 5, 'scene'), 5);
  assert.equal(s.bonds.junie.pts, 5);
});

test('points bank only slightly past the next scene threshold', () => {
  const s = newState();
  completeScene(s, 'junie', 1);
  assert.equal(nextSceneNumber(s, 'junie'), 2);
  addPoints(s, 'junie', 100, 'hangout');
  assert.equal(s.bonds.junie.pts, SCENE_PTS[2] + 3);
  assert.ok(sceneUnlocked(s, 'junie'));
});

test('daily caps for texts and gifts reset each day', () => {
  const s = newState();
  completeScene(s, 'junie', 1);
  assert.equal(addPoints(s, 'junie', 1, 'text'), 1);
  assert.equal(addPoints(s, 'junie', 5, 'text'), DAILY_CAPS.text - 1);
  assert.equal(addPoints(s, 'junie', 1, 'text'), 0);
  s.time.day = 2;
  assert.equal(addPoints(s, 'junie', 1, 'text'), 1);
});

test('completing all four scenes maxes the ladder', () => {
  const s = newState();
  for (let n = 1; n <= 4; n++) completeScene(s, 'dez', n);
  assert.equal(nextSceneNumber(s, 'dez'), null);
  assert.equal(bondProgress(s, 'dez'), 1);
  assert.equal(sceneUnlocked(s, 'dez'), false);
});

// ----------------------------------------------------------------- script
test('runner steps through lines, choices and effects', () => {
  const s = newState('Robin');
  completeScene(s, 'junie', 1);
  const J = voice('junie');
  const r = new Runner([
    J('happy', 'Hi {name}!'),
    choice([
      opt('Hello', [J('neutral', 'Nice.')], { pts: ['junie', 2] }),
      opt('(Wave)', [], { pts: ['junie', 1] }),
    ]),
    set('met', true),
    iff({ flag: 'met' }, [narr('flag was set')], [narr('flag missing')]),
  ], env(s, { pointKind: 'hangout' }));

  assert.deepEqual(r.next(), { t: 'say', who: 'junie', mood: 'happy', text: 'Hi Robin!' });
  const c = r.next();
  assert.equal(c.t, 'choice');
  assert.equal(c.options.length, 2);
  assert.throws(() => r.next(), /choice is pending/);
  r.choose(0);
  assert.deepEqual(r.next(), { t: 'say', who: 'you', mood: 'neutral', text: 'Hello' });
  assert.deepEqual(r.next(), { t: 'fx', kind: 'pts', id: 'junie', n: 2 });
  assert.deepEqual(r.next(), { t: 'say', who: 'junie', mood: 'neutral', text: 'Nice.' });
  assert.deepEqual(r.next(), { t: 'narr', text: 'flag was set' });
  assert.deepEqual(r.next(), { t: 'end' });
  assert.equal(s.bonds.junie.pts, 2);
});

test('parenthesised options are narrated, not spoken', () => {
  const s = newState();
  const r = new Runner([choice([opt('(Grab a towel.)', [])])], env(s));
  r.next();
  r.choose(0);
  assert.deepEqual(r.next(), { t: 'narr', text: 'Grab a towel.' });
});

test('locked options cannot be chosen and hidden options are omitted', () => {
  const s = newState();
  const r = new Runner([
    choice([
      opt('Needs wit', [], { req: { stat: ['wit', 2] } }),
      opt('Hidden', [], { req: { romanceOn: 'junie' }, hide: true }),
      opt('Always', []),
    ]),
  ], env(s));
  const c = r.next();
  assert.equal(c.options.length, 2);
  assert.equal(c.options[0].locked, true);
  assert.equal(c.options[0].hint, 'Needs Wit 2');
  assert.equal(c.options[1].idx, 2, 'idx keeps original position');
  assert.throws(() => r.choose(0), /locked/);
  r.choose(2);
});

test('romance options only appear when the player opted in', () => {
  const s = newState();
  const nodes = [choice([opt('More', [], { req: { romanceOn: 'junie' }, hide: true }), opt('Friends', [])])];
  const off = new Runner(nodes, env(s, { prefs: { romanceEnabled: false } })).next();
  const on = new Runner(nodes, env(s, { prefs: { romanceEnabled: true } })).next();
  assert.equal(off.options.length, 1);
  assert.equal(on.options.length, 2);
  const tomek = new Runner([choice([opt('x', [], { req: { romanceOn: 'tomek' }, hide: true }), opt('y', [])])],
    env(s, { prefs: { romanceEnabled: true }, eligible: (id) => id !== 'tomek' })).next();
  assert.equal(tomek.options.length, 1, 'friendship only characters never show it');
});

test('conditions evaluate and unknown ones throw', () => {
  const s = newState();
  s.flags.x = true;
  s.time.day = 5;
  assert.equal(cond({ flag: 'x' }, env(s)), true);
  assert.equal(cond({ noflag: 'x' }, env(s)), false);
  assert.equal(cond({ day: ['>=', 5] }, env(s)), true);
  assert.equal(cond({ day: ['<', 5] }, env(s)), false);
  assert.equal(cond([{ flag: 'x' }, { money: 40 }], env(s)), true);
  assert.equal(cond({ any: [{ flag: 'nope' }, { flag: 'x' }] }, env(s)), true);
  assert.equal(cond({ not: { flag: 'x' } }, env(s)), false);
  assert.throws(() => cond({ bogus: 1 }, env(s)), /Unknown condition/);
});

test('effects: money never goes negative, items, stats, remember dedupes', () => {
  const s = newState();
  const r = new Runner([money(-9999), stat('grit', 3), remember('junie', 'a fact'), remember('junie', 'a fact'), end(), narr('unreachable')], env(s));
  const out = [];
  for (let st = r.next(); st.t !== 'end'; st = r.next()) out.push(st);
  assert.equal(s.player.money, 0);
  assert.equal(statLevel(s, 'grit'), 1);
  assert.equal(s.memory.junie.notes.length, 1);
  assert.equal(out.length, 2);
});

test('format substitutes the player name', () => {
  assert.equal(format('Hi {name}, {name}.', newState('Ash')), 'Hi Ash, Ash.');
});

// ------------------------------------------------------------------ state
test('new state has every friend and sane defaults', () => {
  const s = newState('  <b>Kit</b>  ');
  assert.equal(s.player.name, 'bKit/b', 'angle brackets stripped');
  assert.equal(Object.keys(s.bonds).length, 6);
  assert.equal(s.time.day, 1);
  assert.equal(s.loc, 'home');
});

test('save and load round trip through storage', () => {
  const st = memoryStorage();
  const s = newState('Kit');
  s.player.money = 77;
  s.bonds.dez.pts = 12;
  saveGame(s, st);
  const back = loadGame(st);
  assert.equal(back.player.money, 77);
  assert.equal(back.bonds.dez.pts, 12);
});

test('corrupt saves load as null instead of crashing', () => {
  const st = memoryStorage();
  st.setItem('halcyon.save.v1', '{not json');
  assert.equal(loadGame(st), null);
  st.setItem('halcyon.save.v1', JSON.stringify({ v: 999 }));
  assert.equal(loadGame(st), null);
});

test('import sanitises hostile input', () => {
  const evil = {
    v: SAVE_VERSION,
    player: { name: '<img src=x onerror=alert(1)>', money: 1e12, stats: { charm: -50, wit: 9999 } },
    time: { day: -3, slot: 99 },
    loc: 'the moon',
    bonds: { junie: { rank: 77, pts: -5, romance: 'hacked', scenes: ['x', 2, 2, 9], known: ['like:sweet', '<script>'] }, notafriend: { rank: 5 } },
    flags: { ok_flag: true, '__proto__': 1, 'bad key!': 1, long: 'x'.repeat(500) },
    inbox: { junie: [{ from: 'them', text: 'hi', day: 2, slot: 1 }, { text: '' }, 'junk'] },
    beats: ['arrival', 5],
    extra: { anything: true },
  };
  const s = sanitizeState(JSON.parse(JSON.stringify(evil)));
  assert.equal(s.player.name.includes('<'), false);
  assert.equal(s.player.money, 99999);
  assert.equal(s.player.stats.charm, 0);
  assert.equal(s.player.stats.wit, 99);
  assert.equal(s.time.day, 1);
  assert.equal(s.time.slot, 3);
  assert.equal(s.loc, 'home');
  assert.equal(s.bonds.junie.rank, 5);
  assert.equal(s.bonds.junie.pts, 0);
  assert.equal(s.bonds.junie.romance, 'off');
  assert.deepEqual(s.bonds.junie.scenes, [2]);
  assert.deepEqual(s.bonds.junie.known, ['like:sweet']);
  assert.equal('notafriend' in s.bonds, false);
  assert.equal(s.flags.ok_flag, true);
  assert.equal(Object.hasOwn(s.flags, '__proto__'), false);
  assert.equal(s.flags['bad key!'], undefined);
  assert.equal(s.flags.long.length, 60);
  assert.equal(s.inbox.junie.length, 1);
  assert.deepEqual(s.beats, ['arrival']);
  assert.equal('extra' in s, false);
});

test('importGame rejects non saves and oversize files', () => {
  assert.throws(() => importGame('nope'), /not valid JSON/);
  assert.throws(() => importGame('[]'), /not an object/);
  assert.throws(() => importGame('x'.repeat(2_000_000)), /too large/);
  assert.ok(importGame(exportGame(newState('Ok'))).player.name === 'Ok');
});

test('exported saves never contain AI keys', () => {
  const s = newState();
  const text = exportGame(s);
  assert.equal(/apiKey|password|token/i.test(text), false);
});

// ------------------------------------------------------------------ prefs
test('prefs default off, clamp, and require the adult confirmation for romance', () => {
  const p = sanitizePrefs(null);
  assert.equal(p.ai.enabled, false);
  assert.equal(p.romanceEnabled, false);
  const q = sanitizePrefs({ romanceEnabled: true, adultConfirmed: false, textSize: 99, ai: { dailyCap: 100000, provider: 'evil' } });
  assert.equal(q.romanceEnabled, false, 'no adult confirmation, no romance');
  assert.equal(q.textSize, 1.35);
  assert.equal(q.ai.dailyCap, 500);
  assert.equal(q.ai.provider, 'openai');
  const r = sanitizePrefs({ romanceEnabled: true, adultConfirmed: true });
  assert.equal(r.romanceEnabled, true);
});

test('aiReady needs the right pieces per provider', () => {
  const p = structuredClone(DEFAULT_PREFS);
  assert.equal(aiReady(p), false);
  p.ai.enabled = true;
  assert.equal(aiReady(p), false, 'openai needs a key and model');
  p.ai.apiKey = 'sk-test';
  p.ai.model = 'some-model';
  assert.equal(aiReady(p), true);
  p.ai.openaiBase = 'http://localhost:11434/v1';
  p.ai.apiKey = '';
  assert.equal(aiReady(p), true, 'local endpoints need no key');
  p.ai.provider = 'opencode';
  assert.equal(aiReady(p), false);
  p.ai.providerID = 'openai';
  p.ai.modelID = 'x';
  assert.equal(aiReady(p), true);
});

// ------------------------------------------------------------------- game
test('passing slots rolls days, returns the recap, and delivers texts', () => {
  const s = newState();
  s.log.entries.push({ slot: 0, text: 'did a thing' });
  s.loc = 'cafe';
  s.time.slot = 2;
  const r = passSlots(s, 2);
  assert.equal(r.newDay, true);
  assert.equal(r.recap.entries[0].text, 'did a thing');
  assert.equal(s.time.day, 2);
  assert.equal(s.time.slot, 0);
  assert.equal(s.log.day, 2);
});

test('you are sent home when the place closes', () => {
  const s = newState();
  s.loc = 'cafe';
  s.time.slot = 2;
  const r = passSlots(s, 1);
  assert.equal(r.bounced, true);
  assert.equal(s.loc, 'home');
});

test('sleep ends the day from any slot', () => {
  const s = newState();
  s.time.slot = 1;
  sleep(s);
  assert.deepEqual(s.time, { day: 2, slot: 0 });
});

test('schedules put friends in open places', () => {
  const s = newState();
  for (let day = 1; day <= 7; day++) {
    for (let slot = 0; slot < 4; slot++) {
      s.time = { day, slot };
      for (const id of Object.keys(s.bonds)) {
        const loc = whereIs(s, id);
        if (loc) assert.ok(whoIsAt(s, loc).includes(id));
      }
    }
  }
});

test('story beats come due in order and the first is the arrival', () => {
  const s = newState();
  assert.equal(dueBeat(s).id, 'arrival');
  s.beats.push('arrival');
  assert.equal(dueBeat(s), null);
  s.time.day = 7;
  s.time.slot = 1;
  assert.equal(dueBeat(s), null);
  s.time.slot = 2;
  assert.equal(dueBeat(s).id, 'notice');
  s.time.day = 40;
  assert.equal(dueBeat(s).id, 'notice', 'beats never get skipped, they queue');
});

test('shopping checks the shop, the price and the wallet', () => {
  const s = newState();
  s.loc = 'cafe';
  assert.deepEqual(buyItem(s, 'latte'), { ok: true });
  assert.equal(s.player.money, 35);
  assert.equal(buyItem(s, 'cassette').ok, false, 'sold at the records shop');
  s.player.money = 1;
  assert.equal(buyItem(s, 'latte').ok, false);
});

test('activities respect place, time and flags', () => {
  const s = newState();
  s.loc = 'library';
  s.time.slot = 0;
  const e = makeEnv(s, { romanceEnabled: false });
  assert.ok(startActivity(s, 'study', e));
  s.loc = 'cafe';
  assert.equal(startActivity(s, 'shift', e), null, 'needs the job flag');
  s.flags.job_cafe = true;
  assert.ok(startActivity(s, 'shift', e));
  s.time.slot = 3;
  assert.equal(startActivity(s, 'shift', e), null, 'wrong time');
});

// ------------------------------------------------------------------ phone
test('friends only text once you have met them, and never pile up', () => {
  const s = newState();
  for (let d = 1; d < 15; d++) {
    s.time = { day: d, slot: 0 };
    assert.deepEqual(deliverTexts(s), []);
  }
  completeScene(s, 'junie', 1);
  let got = 0;
  for (let d = 2; d < 40; d++) {
    s.time = { day: d, slot: 0 };
    got += deliverTexts(s).length;
    delete s.texts.pending.junie;
  }
  assert.ok(got > 5, `expected regular texts, got ${got}`);
  s.texts.pending.junie = { replies: [] };
  s.time = { day: 99, slot: 0 };
  assert.deepEqual(deliverTexts(s), [], 'an unanswered thread blocks more texts');
});

test('delivery is stable for a given day and slot', () => {
  const a = newState();
  const b = newState();
  completeScene(a, 'dez', 1);
  completeScene(b, 'dez', 1);
  a.time = { day: 9, slot: 2 };
  b.time = { day: 9, slot: 2 };
  assert.deepEqual(deliverTexts(a), deliverTexts(b));
  assert.deepEqual(a.inbox.dez.map((m) => m.text), b.inbox.dez.map((m) => m.text));
});

test('quick replies add the reply, the answer, and capped points', () => {
  const s = newState();
  completeScene(s, 'junie', 1);
  s.time = { day: 2, slot: 0 };
  s.texts.pending.junie = { replies: [{ text: 'hello', back: ['hi back'], pts: 2 }] };
  assert.equal(unreadCount(s, 'junie'), 0);
  const got = sendQuickReply(s, 'junie', 0);
  assert.equal(got, 2);
  assert.deepEqual(s.inbox.junie.map((m) => m.text), ['hello', 'hi back']);
  assert.equal(s.texts.pending.junie, undefined);
  assert.equal(sendQuickReply(s, 'junie', 0), 0, 'nothing pending');
});

test('goTo only opens places that are open', () => {
  const s = newState();
  s.time.slot = 0;
  assert.equal(goTo(s, 'market'), false);
  assert.equal(goTo(s, 'cafe'), true);
  assert.equal(s.loc, 'cafe');
});
