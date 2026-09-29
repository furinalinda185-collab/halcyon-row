// Text messages between you and your friends. Pure state changes, no DOM.
//
// Friends text you on their own. Nothing punishes you for not replying: a thread
// simply waits, and they do not send follow ups asking where you went.

import { CHARACTERS, CHAR_BY_ID } from '../data/characters/index.js';
import { hashString, seeded, weatherFor, weekdayIndex } from './clock.js';
import { addPoints } from './bond.js';

const SLOT_CHANCE = [0.55, 0.12, 0.3, 0.22];
const MAX_INBOX = 80;

export function addMessage(state, id, from, text, read = from === 'you') {
  const list = state.inbox[id];
  const n = list.length;
  list.push({
    id: `${state.time.day}.${state.time.slot}.${n}.${from}`,
    from,
    text: String(text).slice(0, 600),
    day: state.time.day,
    slot: state.time.slot,
    read,
  });
  while (list.length > MAX_INBOX) list.shift();
}

export function unreadCount(state, id) {
  const boxes = id ? [state.inbox[id]] : Object.values(state.inbox);
  return boxes.reduce((sum, list) => sum + list.filter((m) => !m.read).length, 0);
}

export function markRead(state, id) {
  for (const m of state.inbox[id]) m.read = true;
}

function pingMatches(ping, state) {
  const w = ping.when;
  if (!w) return true;
  if (w.weather && !w.weather.includes(weatherFor(state.time.day))) return false;
  if (w.weekday && !w.weekday.includes(weekdayIndex(state.time.day))) return false;
  if (w.slot && !w.slot.includes(state.time.slot)) return false;
  return true;
}

function deliver(state, id, entry, key) {
  for (const msg of entry.msgs) addMessage(state, id, 'them', msg, false);
  state.texts.pending[id] = {
    replies: (entry.replies || []).slice(0, 4).map((r) => ({ text: r.text, back: [...(r.back || [])], pts: r.pts || 0 })),
  };
  state.texts.seen.push(key);
  while (state.texts.seen.length > 400) state.texts.seen.shift();
}

/**
 * Called whenever time moves to a new slot. Returns the ids of friends who texted.
 * Deterministic for a given day and slot so reloading does not reroll messages.
 */
export function deliverTexts(state) {
  const got = [];
  for (const c of CHARACTERS) {
    const b = state.bonds[c.id];
    if (b.rank < 1 || state.texts.pending[c.id]) continue;
    const rng = seeded(hashString(`text:${c.id}:${state.time.day}:${state.time.slot}`));
    const scripted = c.texts.find(
      (t) => !state.texts.seen.includes(t.id) && b.rank >= t.minRank && state.time.day >= (t.minDay ?? 1),
    );
    const chance = scripted ? Math.min(1, SLOT_CHANCE[state.time.slot] * 1.7) : SLOT_CHANCE[state.time.slot];
    if (rng() > chance) continue;
    if (scripted) {
      deliver(state, c.id, scripted, scripted.id);
      got.push(c.id);
      continue;
    }
    const recent = new Set(state.texts.seen.slice(-40));
    const eligible = c.pings
      .map((p, i) => ({ p, key: `ping:${c.id}:${i}` }))
      .filter(({ p, key }) => b.rank >= (p.minRank ?? 1) && pingMatches(p, state) && !recent.has(key));
    if (!eligible.length) continue;
    const targeted = eligible.filter(({ p }) => p.when);
    const pool = targeted.length && rng() < 0.7 ? targeted : eligible;
    const pick = pool[Math.floor(rng() * pool.length)];
    deliver(state, c.id, pick.p, pick.key);
    got.push(c.id);
  }
  return got;
}

/** Sends one of the pending quick replies. Returns bond points earned. */
export function sendQuickReply(state, id, index) {
  const pending = state.texts.pending[id];
  const reply = pending?.replies[index];
  if (!reply) return 0;
  delete state.texts.pending[id];
  addMessage(state, id, 'you', reply.text);
  for (const line of reply.back) addMessage(state, id, 'them', line, true);
  return addPoints(state, id, reply.pts, 'text');
}

export function hasPending(state, id) {
  return Boolean(state.texts.pending[id]?.replies.length);
}

export function lastMessage(state, id) {
  const list = state.inbox[id];
  return list[list.length - 1] ?? null;
}

export function friendName(id) {
  return CHAR_BY_ID[id].first;
}
