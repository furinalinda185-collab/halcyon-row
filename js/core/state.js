// Game state, saving, and strict import sanitizing. No DOM access.
//
// API keys are NOT in here. They live in prefs.js under a different storage key,
// so an exported save file can be shared without leaking credentials.

import { CHARACTER_IDS } from '../data/characters/index.js';
import { LOCATION_IDS } from '../data/locations.js';
import { STAT_NAMES } from './stats.js';

export const SAVE_KEY = 'halcyon.save.v1';
export const SAVE_VERSION = 1;
export const MAX_IMPORT_BYTES = 1_000_000;
export const START_MONEY = 40;

const ROMANCE_STATES = ['off', 'open', 'together', 'friends'];

export function newBond() {
  return {
    rank: 0,
    pts: 0,
    romance: 'off',
    met: false,
    gifts: 0,
    scenes: [],
    daily: { day: 0, text: 0, ai: 0, gift: 0 },
    hangs: [],
    known: [],     // discovered gift preferences, e.g. "like:sweet"
  };
}

export function newState(name = 'You') {
  const bonds = {};
  const inbox = {};
  const memory = {};
  for (const id of CHARACTER_IDS) {
    bonds[id] = newBond();
    inbox[id] = [];
    memory[id] = { notes: [] };
  }
  return {
    v: SAVE_VERSION,
    savedAt: 0,
    player: { name: cleanName(name), stats: Object.fromEntries(STAT_NAMES.map((s) => [s, 0])), money: START_MONEY },
    time: { day: 1, slot: 0 },
    loc: 'home',
    bonds,
    flags: {},
    beats: [],
    inv: {},
    inbox,
    texts: { seen: [], pending: {} },
    memory,
    log: { day: 1, entries: [] },
    ai: { day: 0, used: 0 },
    done: false,
  };
}

function cleanName(name) {
  const n = String(name ?? '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 20);
  return n || 'You';
}

const int = (v, lo, hi, dflt) => (Number.isFinite(v) ? Math.max(lo, Math.min(hi, Math.trunc(v))) : dflt);
const str = (v, max, dflt = '') => (typeof v === 'string' ? v.slice(0, max) : dflt);
const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const strList = (v, maxLen, maxItems) =>
  Array.isArray(v) ? v.filter((x) => typeof x === 'string').slice(-maxItems).map((x) => x.slice(0, maxLen)) : [];

/**
 * Turns untrusted data (a save file someone shared, or an old save) into a valid
 * state. Unknown keys are dropped and every value is clamped.
 */
export function sanitizeState(raw) {
  if (!isObj(raw)) throw new Error('Save is not an object');
  if (!Number.isInteger(raw.v) || raw.v < 1 || raw.v > SAVE_VERSION) throw new Error('Unsupported save version');
  const s = newState(isObj(raw.player) ? raw.player.name : 'You');
  s.savedAt = int(raw.savedAt, 0, Number.MAX_SAFE_INTEGER, 0);

  if (isObj(raw.player)) {
    for (const k of STAT_NAMES) s.player.stats[k] = int(raw.player.stats?.[k], 0, 99, 0);
    s.player.money = int(raw.player.money, 0, 99999, START_MONEY);
  }
  if (isObj(raw.time)) {
    s.time.day = int(raw.time.day, 1, 9999, 1);
    s.time.slot = int(raw.time.slot, 0, 3, 0);
  }
  s.loc = LOCATION_IDS.includes(raw.loc) ? raw.loc : 'home';

  for (const id of CHARACTER_IDS) {
    const b = raw.bonds?.[id];
    if (isObj(b)) {
      const d = isObj(b.daily) ? b.daily : {};
      s.bonds[id] = {
        rank: int(b.rank, 0, 5, 0),
        pts: int(b.pts, 0, 999, 0),
        romance: ROMANCE_STATES.includes(b.romance) ? b.romance : 'off',
        met: Boolean(b.met),
        gifts: int(b.gifts, 0, 9999, 0),
        // Only rank scenes 1 to 5 exist. Anything else is dropped, not clamped.
        scenes: Array.isArray(b.scenes) ? [...new Set(b.scenes.filter((x) => Number.isInteger(x) && x >= 1 && x <= 5))] : [],
        daily: { day: int(d.day, 0, 9999, 0), text: int(d.text, 0, 99, 0), ai: int(d.ai, 0, 99, 0), gift: int(d.gift, 0, 99, 0) },
        hangs: strList(b.hangs, 60, 200),
        known: strList(b.known, 40, 30).filter((k) => /^(like|dislike):[a-z]+$/.test(k)),
      };
    }
    const msgs = raw.inbox?.[id];
    if (Array.isArray(msgs)) {
      s.inbox[id] = msgs
        .filter(isObj)
        .slice(-80)
        .map((m, i) => ({
          id: str(m.id, 60, `m${i}`),
          from: m.from === 'you' ? 'you' : 'them',
          text: str(m.text, 600),
          day: int(m.day, 1, 9999, 1),
          slot: int(m.slot, 0, 3, 0),
          read: m.read !== false,
        }))
        .filter((m) => m.text);
    }
    const notes = raw.memory?.[id]?.notes;
    if (Array.isArray(notes)) {
      s.memory[id].notes = notes
        .filter(isObj)
        .slice(-24)
        .map((n) => ({ day: int(n.day, 1, 9999, 1), text: str(n.text, 300) }))
        .filter((n) => n.text);
    }
  }

  if (isObj(raw.flags)) {
    let count = 0;
    for (const [k, v] of Object.entries(raw.flags)) {
      if (count >= 300) break;
      if (!/^[a-z0-9_:.-]{1,60}$/i.test(k)) continue;
      if (typeof v === 'boolean' || (typeof v === 'number' && Number.isFinite(v))) s.flags[k] = v;
      else if (typeof v === 'string') s.flags[k] = v.slice(0, 60);
      else continue;
      count++;
    }
  }
  s.beats = strList(raw.beats, 60, 100);
  if (isObj(raw.inv)) {
    for (const [k, v] of Object.entries(raw.inv)) {
      if (/^[a-z0-9_]{1,40}$/.test(k)) {
        const n = int(v, 0, 99, 0);
        if (n) s.inv[k] = n;
      }
    }
  }
  if (isObj(raw.texts)) {
    s.texts.seen = strList(raw.texts.seen, 80, 400);
    if (isObj(raw.texts.pending)) {
      for (const id of CHARACTER_IDS) {
        const p = raw.texts.pending[id];
        if (isObj(p) && Array.isArray(p.replies)) {
          s.texts.pending[id] = {
            replies: p.replies
              .filter(isObj)
              .slice(0, 4)
              .map((r) => ({
                text: str(r.text, 200),
                back: strList(r.back, 400, 4),
                pts: int(r.pts, 0, 3, 0),
              }))
              .filter((r) => r.text),
          };
        }
      }
    }
  }
  if (isObj(raw.log)) {
    s.log.day = int(raw.log.day, 1, 9999, 1);
    if (Array.isArray(raw.log.entries)) {
      s.log.entries = raw.log.entries
        .filter(isObj)
        .slice(-40)
        .map((e) => ({ slot: int(e.slot, 0, 3, 0), text: str(e.text, 300) }))
        .filter((e) => e.text);
    }
  }
  if (isObj(raw.ai)) s.ai = { day: int(raw.ai.day, 0, 9999, 0), used: int(raw.ai.used, 0, 99999, 0) };
  s.done = Boolean(raw.done);
  return s;
}

// ---- Storage ------------------------------------------------------------

/** localStorage when it works, otherwise an in memory stand in (private mode, blocked storage). */
export function getStorage() {
  try {
    const ls = globalThis.localStorage;
    const probe = '__halcyon_probe__';
    ls.setItem(probe, '1');
    ls.removeItem(probe);
    return ls;
  } catch {
    return memoryStorage();
  }
}

export function memoryStorage() {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => void m.set(k, String(v)),
    removeItem: (k) => void m.delete(k),
    memory: true,
  };
}

export function saveGame(state, storage = getStorage()) {
  state.savedAt = Date.now();
  storage.setItem(SAVE_KEY, JSON.stringify(state));
}

export function hasSave(storage = getStorage()) {
  return storage.getItem(SAVE_KEY) != null;
}

/** Returns a state, or null if there is no usable save. */
export function loadGame(storage = getStorage()) {
  const text = storage.getItem(SAVE_KEY);
  if (!text) return null;
  try {
    return sanitizeState(JSON.parse(text));
  } catch {
    return null;
  }
}

export function deleteSave(storage = getStorage()) {
  storage.removeItem(SAVE_KEY);
}

export function exportGame(state) {
  return JSON.stringify({ ...state, savedAt: Date.now() }, null, 2);
}

/** Parse and validate a save file's text. Throws a readable Error when it is not one of ours. */
export function importGame(text) {
  if (typeof text !== 'string' || text.length > MAX_IMPORT_BYTES) throw new Error('That file is too large to be a save');
  let raw;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error('That file is not valid JSON');
  }
  return sanitizeState(raw);
}
