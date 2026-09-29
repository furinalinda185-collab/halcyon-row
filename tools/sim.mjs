#!/usr/bin/env node
// Plays the whole month with a greedy bot using the real game functions, to check pacing.
// Usage: node tools/sim.mjs [--verbose] [--skill 0.7] [--seed 1]
//   skill is the chance the bot picks the best dialogue option (otherwise a random one).

import { newState } from '../js/core/state.js';
import { Runner } from '../js/core/script.js';
import {
  whoIsAt, goTo, canGo, passSlots, dueBeat, beginBeat, finishBeat, availableScene, startRankScene,
  startHangout, startActivity, makeEnv, activitiesHere,
} from '../js/core/game.js';
import { sendQuickReply, hasPending } from '../js/core/phone.js';
import { LOCATIONS } from '../js/data/locations.js';
import { CHARACTERS } from '../js/data/characters/index.js';
import { seeded } from '../js/core/clock.js';
import { nextSceneNumber, pointsForNext } from '../js/core/bond.js';

export function bestPts(opt) {
  let n = opt.pts ? opt.pts[1] : 0;
  for (const t of opt.then || []) if (t.t === 'pts') n += t.n;
  return n;
}

/** Runs a script to the end choosing options with the given skill. */
export function autoPlay(nodes, env, rng, skill = 1) {
  const runner = new Runner(nodes, env);
  for (let step = runner.next(); step.t !== 'end'; step = runner.next()) {
    if (step.t !== 'choice') continue;
    const open = step.options.filter((o) => !o.locked);
    const node = runner.pending;
    const scored = open.map((o) => ({ o, s: bestPts(node.options[o.idx]) }));
    const best = scored.sort((a, b) => b.s - a.s)[0];
    const pick = rng() < skill ? best.o : open[Math.floor(rng() * open.length)];
    runner.choose(pick.idx);
  }
}

export function simulate({ skill = 1, seed = 1, verbose = false, romance = false } = {}) {
  const rng = seeded(seed);
  const state = newState('Bot');
  const prefs = { romanceEnabled: romance };
  const env = () => makeEnv(state, prefs, 'hangout');
  const log = [];
  let slots = 0;
  const snap = {};

  const runBeats = () => {
    for (let beat = dueBeat(state); beat; beat = dueBeat(state)) {
      const nodes = beginBeat(state, beat, makeEnv(state, prefs, 'scene'));
      autoPlay(nodes, makeEnv(state, prefs, 'scene'), rng, skill);
      finishBeat(state, beat);
    }
  };

  runBeats();
  while (state.time.day <= 28) {
    if (state.time.day === 27 && state.time.slot === 0 && !snap[27]) snap[27] = ranks(state);
    // answer any waiting texts for a little free bond
    for (const c of CHARACTERS) if (hasPending(state, c.id)) sendQuickReply(state, c.id, 0);

    // pick the best (place, friend) for this slot
    let best = null;
    for (const loc of LOCATIONS) {
      if (!canGo(state, loc.id)) continue;
      const before = state.loc;
      state.loc = loc.id;
      for (const id of whoIsAt(state, loc.id)) {
        const b = state.bonds[id];
        const sc = availableScene(state, id, env());
        let value = 0;
        let kind = '';
        if (sc) { value = b.rank === 0 ? 120 : 100; kind = 'scene'; }
        else if (b.rank >= 1) {
          const n = nextSceneNumber(state, id);
          const need = n ? Math.max(0, pointsForNext(state, id) - b.pts) : 0;
          // Prefer friends who are close to a scene, then those furthest behind.
          value = n ? 20 + Math.min(need, 20) * (need <= 6 ? 1.5 : 0.6) : 2;
          kind = 'hangout';
        }
        if (value > (best?.value ?? 0)) best = { loc: loc.id, id, value, kind };
      }
      state.loc = before;
    }
    if (best) {
      state.loc = best.loc;
      const act = best.kind === 'scene' ? startRankScene(state, best.id, env()) : startHangout(state, best.id);
      autoPlay(act.nodes, makeEnv(state, prefs, best.kind === 'scene' ? 'scene' : 'hangout'), rng, skill);
      if (verbose) log.push(`day ${state.time.day}.${state.time.slot} ${best.kind} ${best.id}@${best.loc}`);
    } else {
      // nothing social available: build a stat
      const spot = LOCATIONS.find((l) => canGo(state, l.id) && (state.loc = l.id) && activitiesHere(state, env()).some((a) => !a.reason));
      if (spot) {
        state.loc = spot.id;
        const a = activitiesHere(state, env()).find((x) => !x.reason);
        const act = startActivity(state, a.id, env());
        autoPlay(act.nodes, env(), rng, skill);
      }
    }
    slots += 1;
    passSlots(state, 1);
    runBeats();
    if (state.time.day > 28) break;
  }
  return { state, ranks: ranks(state), day27: snap[27], slots, log };
}

function ranks(state) {
  return Object.fromEntries(CHARACTERS.map((c) => [c.id, state.bonds[c.id].rank]));
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  const arg = (name, d) => { const i = process.argv.indexOf(name); return i >= 0 ? Number(process.argv[i + 1]) : d; };
  const skill = arg('--skill', 1);
  const runs = arg('--runs', 5);
  const verbose = process.argv.includes('--verbose');
  const tally = { r3: [], r4: [], r5: [], total: [] };
  for (let seed = 1; seed <= runs; seed++) {
    const r = simulate({ skill, seed, verbose });
    const v = Object.values(r.ranks);
    tally.r3.push(v.filter((x) => x >= 3).length);
    tally.r4.push(v.filter((x) => x >= 4).length);
    tally.r5.push(v.filter((x) => x >= 5).length);
    console.log(`seed ${seed}: ranks ${JSON.stringify(r.ranks)}  day27 ${JSON.stringify(r.day27)}  money ${r.state.player.money}`);
    if (verbose && seed === 1) console.log(r.log.join('\n'));
  }
  const avg = (a) => (a.reduce((x, y) => x + y, 0) / a.length).toFixed(1);
  console.log(`skill ${skill}: friends at rank>=3 avg ${avg(tally.r3)}, rank>=4 avg ${avg(tally.r4)}, finale rank 5 avg ${avg(tally.r5)}`);
}
