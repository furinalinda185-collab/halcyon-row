// Game actions: the things the player can do. Each one changes state and returns
// a plain result for the UI to present. No DOM in here.

import { CHARACTERS, CHAR_BY_ID } from '../data/characters/index.js';
import { LOCATIONS, LOCATION_BY_ID, isOpen } from '../data/locations.js';
import { ACTIVITIES, ACTIVITY_BY_ID } from '../data/activities.js';
import { ITEM_BY_ID } from '../data/items.js';
import { STORY_BEATS } from '../data/story.js';
import { advanceSlot, seeded, hashString, weekdayIndex, FESTIVAL_DAY } from './clock.js';
import { nextSceneNumber, sceneUnlocked } from './bond.js';
import { deliverTexts } from './phone.js';
import { test } from './script.js';
import { pickHangout, markHangout, sceneNodes, giftNodes } from './scenes.js';
import { bg, narr, money, stat, log } from './dsl.js';

/** The env every Runner needs. */
export function makeEnv(state, prefs, pointKind) {
  return { state, prefs, pointKind, eligible: (id) => Boolean(CHAR_BY_ID[id]?.romance) };
}

// ---- Where is everyone ---------------------------------------------------

export function whereIs(state, id) {
  return CHAR_BY_ID[id].schedule[weekdayIndex(state.time.day)][state.time.slot] ?? null;
}

export function whoIsAt(state, locId) {
  return CHARACTERS.filter((c) => whereIs(state, c.id) === locId).map((c) => c.id);
}

export function openLocations(state) {
  return LOCATIONS.filter((l) => isOpen(l.id, state.time.slot));
}

// ---- Time ----------------------------------------------------------------

/**
 * Moves time forward. Handles the new day bookkeeping, delivers texts, and sends
 * you home if the place you are in has closed.
 * Returns { newDay, recap, bounced, texted }. `recap` is the log of the day that
 * just ended, so the UI can show it before the new day begins.
 */
export function passSlots(state, n = 1) {
  let newDay = false;
  let recap = null;
  const texted = [];
  for (let i = 0; i < n; i++) {
    if (advanceSlot(state.time)) {
      newDay = true;
      recap = state.log;
      state.log = { day: state.time.day, entries: [] };
    }
    texted.push(...deliverTexts(state));
  }
  let bounced = false;
  if (!isOpen(state.loc, state.time.slot)) {
    state.loc = 'home';
    bounced = true;
  }
  return { newDay, recap, bounced, texted };
}

/** Ends the day early from your room. Only at night. */
export function sleep(state) {
  const steps = 4 - state.time.slot;
  return passSlots(state, steps);
}

// ---- Movement ------------------------------------------------------------

export function canGo(state, locId) {
  return Boolean(LOCATION_BY_ID[locId]) && isOpen(locId, state.time.slot);
}

export function goTo(state, locId) {
  if (!canGo(state, locId)) return false;
  state.loc = locId;
  return true;
}

// ---- Story ---------------------------------------------------------------

/** The next story beat that has come due, or null. Beats play in order. */
export function dueBeat(state) {
  for (const beat of STORY_BEATS) {
    if (state.beats.includes(beat.id)) continue;
    const due = state.time.day > beat.day || (state.time.day === beat.day && state.time.slot >= beat.slot);
    return due ? beat : null;
  }
  return null;
}

export function beginBeat(state, beat, env) {
  state.beats.push(beat.id);
  return beat.nodes(env);
}

export function finishBeat(state, beat) {
  state.loc = beat.loc;
  const r = passSlots(state, beat.advance);
  state.loc = isOpen(beat.loc, state.time.slot) ? beat.loc : 'home';
  if (beat.id === 'epilogue') state.done = true;
  return r;
}

// ---- Friends -------------------------------------------------------------

/** The rank scene you could play with this friend right now, or null. */
export function availableScene(state, id, env) {
  const c = CHAR_BY_ID[id];
  const n = nextSceneNumber(state, id);
  if (!n || !sceneUnlocked(state, id)) return null;
  const s = c.scenes.find((x) => x.n === n);
  if (!s) return null;
  if (s.at && !s.at.includes(state.loc)) return null;
  if (s.slots && !s.slots.includes(state.time.slot)) return null;
  if (s.minDay && state.time.day < s.minDay) return null;
  if (s.need && !test(s.need, env)) return null;
  return s;
}

/** What the map should say about a friend who is here. */
export function friendStatus(state, id, env) {
  const b = state.bonds[id];
  const scene = availableScene(state, id, env);
  if (b.rank < 1) return scene ? 'new' : 'unmet';
  return scene ? 'ready' : 'chat';
}

export function startRankScene(state, id, env) {
  const c = CHAR_BY_ID[id];
  const scene = availableScene(state, id, env);
  if (!scene) return null;
  return { kind: 'scene', charId: id, title: scene.title, nodes: sceneNodes(c, scene) };
}

export function startHangout(state, id) {
  const c = CHAR_BY_ID[id];
  const h = pickHangout(state, id, c);
  markHangout(state, id, h.id);
  return {
    kind: 'hangout',
    charId: id,
    nodes: [
      { t: 'show', who: id, mood: 'neutral', side: 'center' },
      ...h.nodes,
      { t: 'log', text: `Hung out with ${c.first}.` },
    ],
  };
}

export function canGift(state, id) {
  const b = state.bonds[id];
  return b.rank >= 1 && Object.values(state.inv).some((n) => n > 0);
}

export function startGift(state, id, itemId) {
  if ((state.inv[itemId] || 0) < 1) return null;
  const c = CHAR_BY_ID[id];
  const g = giftNodes(state, c, itemId);
  state.inv[itemId] -= 1;
  if (!state.inv[itemId]) delete state.inv[itemId];
  const b = state.bonds[id];
  b.gifts += 1;
  for (const k of g.learned) if (!b.known.includes(k)) b.known.push(k);
  return { kind: 'gift', charId: id, reaction: g.reaction, nodes: [...g.nodes, { t: 'log', text: `Gave ${c.first} a gift.` }] };
}

// ---- Shopping and activities --------------------------------------------

export function buyItem(state, itemId) {
  const item = ITEM_BY_ID[itemId];
  if (!item || item.shop !== state.loc) return { ok: false, reason: 'Not sold here' };
  if (state.player.money < item.price) return { ok: false, reason: 'Not enough money' };
  state.player.money -= item.price;
  state.inv[itemId] = Math.min(99, (state.inv[itemId] || 0) + 1);
  return { ok: true };
}

export function activitiesHere(state, env) {
  return ACTIVITIES.filter((a) => a.loc === state.loc).map((a) => {
    let reason = '';
    if (!a.slots.includes(state.time.slot)) reason = 'Not now';
    else if (a.needFlag && !state.flags[a.needFlag]) reason = 'Ask around first';
    else if (a.cost && state.player.money < a.cost) reason = `Needs $${a.cost}`;
    return { ...a, reason };
  });
}

export function startActivity(state, actId, env) {
  const a = ACTIVITY_BY_ID[actId];
  if (!a || a.loc !== state.loc) return null;
  const blocked = activitiesHere(state, env).find((x) => x.id === actId)?.reason;
  if (blocked) return null;
  const rng = seeded(hashString(`act:${actId}:${state.time.day}:${state.time.slot}`));
  const text = a.scenes[Math.floor(rng() * a.scenes.length)];
  const nodes = [bg(a.loc), narr(text)];
  if (a.cost) nodes.push(money(-a.cost));
  if (a.gain.money) nodes.push(money(a.gain.money));
  if (a.gain.stat) nodes.push(stat(a.gain.stat[0], a.gain.stat[1]));
  nodes.push(log(`${a.label}.`));
  return { kind: 'activity', activityId: actId, nodes };
}

// ---- Convenience for the UI ---------------------------------------------

export function daysLeft(state) {
  return Math.max(0, FESTIVAL_DAY - state.time.day);
}

export function friendsMet(state) {
  return CHARACTERS.filter((c) => state.bonds[c.id].rank >= 1);
}
