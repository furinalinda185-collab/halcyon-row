// Lints all authored content: references, style rules, reachability, and random playthroughs.

import test from 'node:test';
import assert from 'node:assert/strict';

import { CHARACTERS, CHARACTER_IDS, MOODS } from '../js/data/characters/index.js';
import { NPCS, NPC_IDS } from '../js/data/npcs.js';
import { LOCATIONS, LOCATION_IDS, BACKDROP_IDS, LOCATION_BY_ID } from '../js/data/locations.js';
import { ITEMS, ITEM_BY_ID } from '../js/data/items.js';
import { ACTIVITIES } from '../js/data/activities.js';
import { SFX_NAMES } from '../js/data/sfx.js';
import { STORY_BEATS } from '../js/data/story.js';
import { STAT_NAMES } from '../js/core/stats.js';
import { Runner, test as cond } from '../js/core/script.js';
import { sceneNodes } from '../js/core/scenes.js';
import { newState } from '../js/core/state.js';
import { makeEnv } from '../js/core/game.js';
import { seeded } from '../js/core/clock.js';

const SPEAKERS = new Set([...CHARACTER_IDS, ...NPC_IDS, 'you']);
const NODE_TYPES = new Set(['say', 'narr', 'title', 'show', 'hide', 'bg', 'sfx', 'choice', 'if', 'set', 'pts', 'stat', 'money', 'item', 'remember', 'romance', 'complete', 'log', 'end']);

/** Every node in a script, including inside choices and if branches. */
function* walk(nodes) {
  for (const n of nodes) {
    yield n;
    if (n.t === 'choice') {
      for (const o of n.options) {
        yield { t: '_option', o };
        yield* walk(o.then || []);
      }
    }
    if (n.t === 'if') {
      yield* walk(n.then || []);
      yield* walk(n.else || []);
    }
  }
}

function allScripts() {
  const out = [];
  for (const c of CHARACTERS) {
    for (const s of c.scenes) out.push({ name: `${c.id}/scene${s.n}`, char: c, nodes: s.nodes, scene: s });
    for (const h of c.hangouts) out.push({ name: `${c.id}/${h.id}`, char: c, nodes: h.nodes, hangout: h });
    const env = { state: newState() };
    out.push({ name: `${c.id}/finale`, char: c, nodes: c.finale(env) });
  }
  const env = { state: newState() };
  for (const b of STORY_BEATS) out.push({ name: `story/${b.id}`, nodes: b.nodes(env), beat: b });
  return out;
}

const condOk = (c, name) => {
  const s = newState();
  try {
    cond(c, { state: s, prefs: {}, eligible: () => true });
  } catch (e) {
    assert.fail(`${name}: bad condition ${JSON.stringify(c)} (${e.message})`);
  }
};

test('characters are complete and consistent', () => {
  assert.equal(CHARACTERS.length, 6);
  for (const c of CHARACTERS) {
    assert.match(c.color, /^#[0-9a-f]{6}$/i, `${c.id} color`);
    assert.ok(c.scenes.length === 4, `${c.id} needs 4 rank scenes`);
    assert.deepEqual(c.scenes.map((s) => s.n), [1, 2, 3, 4], `${c.id} scene numbers`);
    assert.ok(c.hangouts.length >= 7, `${c.id} needs at least 7 hangouts`);
    assert.ok(c.texts.length >= 3, `${c.id} needs scripted texts`);
    assert.ok(c.pings.length >= 5, `${c.id} needs pings`);
    assert.equal(typeof c.finale, 'function');
    assert.ok(c.ai.bible.length > 200 && c.ai.speech && c.ai.texting, `${c.id} needs an AI voice bible`);
    assert.equal(c.ai.secrets.length, 3, `${c.id} secrets`);
    assert.equal(c.bio.length, 4);
    assert.ok(c.likes.length >= 2 && c.dislikes.length >= 1);
    assert.ok(c.gifts.like.length >= 2 && c.gifts.ok.length >= 1 && c.gifts.dislike.length >= 1);
    for (const other of CHARACTER_IDS.filter((x) => x !== c.id)) assert.ok(c.ai.knowsOthers[other], `${c.id} should know ${other}`);
    const ids = c.hangouts.map((h) => h.id);
    assert.equal(new Set(ids).size, ids.length, `${c.id} duplicate hangout ids`);
    const tids = c.texts.map((t) => t.id);
    assert.equal(new Set(tids).size, tids.length, `${c.id} duplicate text ids`);
  }
  assert.equal(CHARACTERS.filter((c) => c.romance).length, 4);
  assert.equal(CHARACTERS.find((c) => c.id === 'sable').romance, false, 'Sable is friendship only');
  assert.equal(CHARACTERS.find((c) => c.id === 'tomek').romance, false, 'Tomek is friendship only');
});

test('friendship only characters never offer romance options', () => {
  for (const c of CHARACTERS.filter((x) => !x.romance)) {
    for (const s of allScripts().filter((x) => x.char === c)) {
      for (const n of walk(s.nodes)) {
        if (n.t === 'romance') assert.fail(`${s.name} sets romance for a friendship only character`);
        if (n.t === '_option' && n.o.req && JSON.stringify(n.o.req).includes('romance')) assert.fail(`${s.name} has a romance option`);
      }
    }
  }
});

test('every romance option is hidden unless the player opted in', () => {
  for (const s of allScripts()) {
    for (const n of walk(s.nodes)) {
      if (n.t === '_option' && n.o.req && JSON.stringify(n.o.req).includes('romanceOn')) {
        assert.equal(n.o.hide, true, `${s.name}: romance option must use hide:true`);
      }
      if (n.t === 'romance' && n.value === 'open') {
        // any scene that can set 'open' must be guarded by romanceOn somewhere above it
        assert.ok(s.nodes.some((m) => JSON.stringify(m).includes('romanceOn')), `${s.name} opens romance without a romanceOn guard`);
      }
    }
  }
});

test('all script nodes reference things that exist', () => {
  for (const s of allScripts()) {
    for (const n of walk(s.nodes)) {
      if (n.t === '_option') {
        assert.ok(typeof n.o.text === 'string' && n.o.text.length > 0, `${s.name}: option without text`);
        assert.ok(n.o.text.length <= 220, `${s.name}: option too long: ${n.o.text}`);
        if (n.o.req) condOk(n.o.req, s.name);
        if (n.o.pts) {
          assert.ok(CHARACTER_IDS.includes(n.o.pts[0]), `${s.name}: pts target`);
          assert.ok(n.o.pts[1] >= 0 && n.o.pts[1] <= 6, `${s.name}: option pts ${n.o.pts[1]}`);
        }
        if (n.o.stat) assert.ok(STAT_NAMES.includes(n.o.stat[0]), `${s.name}: stat`);
        continue;
      }
      assert.ok(NODE_TYPES.has(n.t), `${s.name}: unknown node type ${n.t}`);
      switch (n.t) {
        case 'say':
          assert.ok(SPEAKERS.has(n.who), `${s.name}: unknown speaker ${n.who}`);
          if (n.who !== 'you') assert.ok(MOODS.includes(n.mood), `${s.name}: bad mood ${n.mood} for ${n.who}: ${n.text}`);
          assert.ok(n.text && n.text.length <= 520, `${s.name}: line length ${n.text?.length}`);
          break;
        case 'narr':
          assert.ok(n.text && n.text.length <= 600, `${s.name}: narration length`);
          break;
        case 'show':
          assert.ok(SPEAKERS.has(n.who) && n.who !== 'you', `${s.name}: show ${n.who}`);
          assert.ok(MOODS.includes(n.mood), `${s.name}: show mood ${n.mood}`);
          assert.ok(['left', 'center', 'right'].includes(n.side), `${s.name}: show side`);
          break;
        case 'hide':
          assert.ok(SPEAKERS.has(n.who), `${s.name}: hide ${n.who}`);
          break;
        case 'bg':
          assert.ok(BACKDROP_IDS.includes(n.loc), `${s.name}: unknown backdrop ${n.loc}`);
          break;
        case 'sfx':
          assert.ok(SFX_NAMES.includes(n.name), `${s.name}: unknown sfx ${n.name}`);
          break;
        case 'if':
          condOk(n.cond, s.name);
          break;
        case 'pts':
        case 'remember':
        case 'romance':
        case 'complete':
          assert.ok(CHARACTER_IDS.includes(n.id), `${s.name}: ${n.t} target ${n.id}`);
          break;
        case 'stat':
          assert.ok(STAT_NAMES.includes(n.name), `${s.name}: stat ${n.name}`);
          break;
        case 'item':
          assert.ok(ITEM_BY_ID[n.id], `${s.name}: item ${n.id}`);
          break;
        default:
      }
    }
  }
});

test('writing style: no em dashes, en dashes or spaced hyphens in any dialogue', () => {
  const bad = /[—–]| - | -- /;
  for (const s of allScripts()) {
    for (const n of walk(s.nodes)) {
      const texts = n.t === '_option' ? [n.o.text] : [n.text, n.sub].filter(Boolean);
      for (const t of texts) assert.ok(!bad.test(t), `${s.name}: dash in "${t}"`);
    }
  }
  for (const c of CHARACTERS) {
    for (const t of c.texts) for (const m of [...t.msgs, ...t.replies.flatMap((r) => [r.text, ...r.back])]) assert.ok(!bad.test(m), `${c.id} text: ${m}`);
    for (const p of c.pings) for (const m of [...p.msgs, ...p.replies.flatMap((r) => [r.text, ...r.back])]) assert.ok(!bad.test(m), `${c.id} ping: ${m}`);
    for (const t of [c.ai.bible, c.ai.speech, c.ai.texting, ...c.bio.map((b) => b.text)]) assert.ok(!bad.test(t), `${c.id} bio/ai: ${t.slice(0, 40)}`);
  }
});

test('texts and pings are well formed', () => {
  for (const c of CHARACTERS) {
    for (const entry of [...c.texts, ...c.pings]) {
      assert.ok(entry.msgs.length >= 1 && entry.msgs.length <= 4);
      assert.ok(entry.replies.length >= 1 && entry.replies.length <= 4);
      for (const r of entry.replies) {
        assert.ok(r.text.length <= 120 && r.text.length > 0);
        assert.ok(r.pts >= 0 && r.pts <= 3);
        assert.ok(r.back.length >= 1 && r.back.length <= 3);
      }
      for (const m of entry.msgs) assert.ok(m.length <= 300);
    }
    for (const t of c.texts) assert.ok(t.minRank >= 1 && t.minRank <= 4 && t.minDay >= 1 && t.minDay <= 27, `${t.id}`);
    for (const p of c.pings) {
      if (p.when?.weather) for (const w of p.when.weather) assert.ok(['clear', 'cloudy', 'rain', 'fog'].includes(w));
      if (p.when?.slot) for (const w of p.when.slot) assert.ok(w >= 0 && w <= 3);
      if (p.when?.weekday) for (const w of p.when.weekday) assert.ok(w >= 0 && w <= 6);
    }
  }
});

test('schedules use real, open places', () => {
  for (const c of CHARACTERS) {
    assert.ok(LOCATION_BY_ID[c.home], `${c.id} home`);
    c.schedule.forEach((row, wd) =>
      row.forEach((loc, slot) => {
        if (loc === null) return;
        assert.ok(LOCATION_IDS.includes(loc), `${c.id} wd${wd} slot${slot}: ${loc}`);
        assert.ok(LOCATION_BY_ID[loc].open.includes(slot), `${c.id} is scheduled at ${loc} on weekday ${wd} slot ${slot}, when it is closed`);
      }));
  }
});

test('every rank scene can actually be reached before the festival', () => {
  for (const c of CHARACTERS) {
    for (const s of c.scenes) {
      const at = s.at || LOCATION_IDS;
      const days = [];
      for (let day = Math.max(1, s.minDay || 1); day <= 27; day++) {
        const wd = (day - 1) % 7;
        for (let slot = 0; slot < 4; slot++) {
          const loc = c.schedule[wd][slot];
          if (loc && at.includes(loc) && (!s.slots || s.slots.includes(slot))) days.push(`${day}.${slot}`);
        }
      }
      assert.ok(days.length >= 6, `${c.id} scene ${s.n} ("${s.title}") is reachable in only ${days.length} time slots`);
    }
  }
});

test('every place a friend visits has a hangout they can have there at rank 1', () => {
  for (const c of CHARACTERS) {
    const places = new Set(c.schedule.flat().filter(Boolean));
    for (const loc of places) {
      const ok = c.hangouts.some((h) => (h.minRank ?? 1) <= 1 && (h.at === 'any' || h.at.includes(loc)));
      if (!ok) console.warn(`  note: ${c.id} has no rank 1 hangout at ${loc}; the generic one will play`);
    }
  }
});

test('every hangout and scene gives points somewhere', () => {
  for (const s of allScripts().filter((x) => x.hangout || x.scene)) {
    let found = false;
    for (const n of walk(s.nodes)) {
      if (n.t === 'pts' || (n.t === '_option' && n.o.pts)) found = true;
    }
    assert.ok(found, `${s.name} never awards points`);
  }
});

test('scenes award enough points to matter, and thresholds are reachable', () => {
  for (const c of CHARACTERS) {
    for (const s of c.scenes) {
      // best case points through a scene
      const best = (nodes) => {
        let total = 0;
        for (const n of nodes) {
          if (n.t === 'choice') {
            total += Math.max(...n.options.map((o) => (o.pts ? o.pts[1] : 0) + best(o.then || [])));
          } else if (n.t === 'if') total += Math.max(best(n.then || []), best(n.else || []));
          else if (n.t === 'pts') total += n.n;
        }
        return total;
      };
      assert.ok(best(s.nodes) >= 5, `${c.id} scene ${s.n} tops out at ${best(s.nodes)} points`);
    }
  }
});

test('random playthroughs of every script never throw', () => {
  const rng = seeded(1234);
  for (const s of allScripts()) {
    for (let run = 0; run < 60; run++) {
      const state = newState('Tester');
      // vary the state so branches on stats, rank and flags get exercised
      for (const k of STAT_NAMES) state.player.stats[k] = Math.floor(rng() * 20);
      for (const id of CHARACTER_IDS) {
        state.bonds[id].rank = Math.floor(rng() * 5);
        if (s.char) state.bonds[s.char.id].rank = Math.max(state.bonds[s.char.id].rank, (s.scene?.n ?? 1) - 1 + (s.hangout ? 1 : 0));
      }
      state.flags.junie_path = ['stay', 'study', 'time'][run % 3];
      state.flags.dez_path = ['play', 'dj', 'unsure'][run % 3];
      state.flags.priya_path = ['talk', 'poster', 'later'][run % 3];
      const romance = run % 2 === 0;
      const env = { state, prefs: { romanceEnabled: romance }, eligible: (id) => CHARACTERS.find((c) => c.id === id).romance, pointKind: s.hangout ? 'hangout' : 'scene' };
      const nodes = s.beat ? s.beat.nodes(env) : s.scene ? sceneNodes(s.char, s.scene) : s.nodes;
      const r = new Runner(nodes, env);
      let steps = 0;
      for (let st = r.next(); st.t !== 'end'; st = r.next()) {
        assert.ok(++steps < 2000, `${s.name} ran too long`);
        if (st.t === 'choice') {
          const open = st.options.filter((o) => !o.locked);
          assert.ok(open.length > 0, `${s.name}: a choice with no available option`);
          r.choose(open[Math.floor(rng() * open.length)].idx);
        }
      }
    }
  }
});

test('locations, items and activities are consistent', () => {
  assert.equal(LOCATIONS.length, 8);
  for (const l of LOCATIONS) {
    assert.ok(l.map.x >= 0 && l.map.x <= 400 && l.map.y >= 0 && l.map.y <= 300);
    assert.ok(l.open.every((s) => s >= 0 && s <= 3));
  }
  for (const i of ITEMS) {
    assert.ok(LOCATION_IDS.includes(i.shop), i.id);
    assert.ok(i.price > 0 && i.tags.length >= 1);
  }
  // Every gift tag should matter to somebody, otherwise the item is a dead end.
  for (const i of ITEMS) {
    const wanted = CHARACTERS.some((c) => i.tags.some((t) => c.likes.includes(t)));
    assert.ok(wanted, `nobody likes ${i.id}`);
  }
  for (const a of ACTIVITIES) {
    assert.ok(LOCATION_IDS.includes(a.loc));
    assert.ok(a.slots.every((s) => LOCATION_BY_ID[a.loc].open.includes(s)), `${a.id} runs when ${a.loc} is closed`);
    assert.ok(a.scenes.length >= 2);
  }
});

test('story beats are ordered and the festival is on the last Sunday', () => {
  const key = (b) => b.day * 4 + b.slot;
  for (let i = 1; i < STORY_BEATS.length; i++) assert.ok(key(STORY_BEATS[i]) > key(STORY_BEATS[i - 1]), `${STORY_BEATS[i].id} out of order`);
  assert.deepEqual(STORY_BEATS.map((b) => b.id), ['arrival', 'notice', 'gathering', 'eve', 'festival', 'epilogue']);
  for (const b of STORY_BEATS) assert.ok(LOCATION_IDS.includes(b.loc));
});

test('npcs have looks', () => {
  for (const n of Object.values(NPCS)) {
    assert.ok(n.look.hair && n.look.outfit && n.look.skin, n.id);
  }
});
