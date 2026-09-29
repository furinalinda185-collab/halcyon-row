// Device level preferences, including AI provider settings.
//
// Stored under its own key, apart from the save, because it can hold an API key.
// The key never leaves this device except in requests to the provider you chose.

import { getStorage } from './state.js';

export const PREFS_KEY = 'halcyon.prefs.v1';

export const DEFAULT_OPENAI_BASE = 'https://api.openai.com/v1';
export const DEFAULT_OPENCODE_BASE = 'http://127.0.0.1:4096';

export const DEFAULT_PREFS = {
  textSpeed: 'normal',          // slow | normal | fast | instant
  textSize: 1,                  // 0.9 to 1.35
  sound: true,
  ambient: false,
  reduceMotion: null,           // null follows the OS setting
  gentleNudges: true,           // friends occasionally suggest real world things
  romanceEnabled: false,        // opt in, needs adultConfirmed
  adultConfirmed: false,
  ai: {
    enabled: false,
    provider: 'openai',         // openai (any OpenAI compatible endpoint) | opencode
    via: 'direct',              // direct from this browser | server (the local game server proxy)
    openaiBase: DEFAULT_OPENAI_BASE,
    apiKey: '',
    model: '',
    opencodeBase: DEFAULT_OPENCODE_BASE,
    username: 'opencode',
    password: '',
    providerID: '',
    modelID: '',
    agent: '',
    token: '',                  // game server access token for LAN play
    dailyCap: 60,               // AI messages per in game day, protects your wallet
  },
};

const clamp = (v, lo, hi, d) => (Number.isFinite(v) ? Math.max(lo, Math.min(hi, v)) : d);
const oneOf = (v, list, d) => (list.includes(v) ? v : d);
const s = (v, max, d = '') => (typeof v === 'string' ? v.trim().slice(0, max) : d);

export function sanitizePrefs(raw) {
  const p = structuredClone(DEFAULT_PREFS);
  if (!raw || typeof raw !== 'object') return p;
  p.textSpeed = oneOf(raw.textSpeed, ['slow', 'normal', 'fast', 'instant'], p.textSpeed);
  p.textSize = clamp(raw.textSize, 0.9, 1.35, 1);
  p.sound = raw.sound !== false;
  p.ambient = raw.ambient === true;
  p.reduceMotion = raw.reduceMotion === true || raw.reduceMotion === false ? raw.reduceMotion : null;
  p.gentleNudges = raw.gentleNudges !== false;
  p.adultConfirmed = raw.adultConfirmed === true;
  p.romanceEnabled = raw.romanceEnabled === true && p.adultConfirmed;
  const a = raw.ai && typeof raw.ai === 'object' ? raw.ai : {};
  p.ai = {
    enabled: a.enabled === true,
    provider: oneOf(a.provider, ['openai', 'opencode'], 'openai'),
    via: oneOf(a.via, ['direct', 'server'], 'direct'),
    openaiBase: s(a.openaiBase, 300, DEFAULT_OPENAI_BASE) || DEFAULT_OPENAI_BASE,
    apiKey: s(a.apiKey, 400),
    model: s(a.model, 120),
    opencodeBase: s(a.opencodeBase, 300, DEFAULT_OPENCODE_BASE) || DEFAULT_OPENCODE_BASE,
    username: s(a.username, 80, 'opencode') || 'opencode',
    password: s(a.password, 200),
    providerID: s(a.providerID, 80),
    modelID: s(a.modelID, 120),
    agent: s(a.agent, 80),
    token: s(a.token, 100),
    dailyCap: clamp(Math.trunc(a.dailyCap), 5, 500, 60),
  };
  return p;
}

export function loadPrefs(storage = getStorage()) {
  try {
    return sanitizePrefs(JSON.parse(storage.getItem(PREFS_KEY) || 'null'));
  } catch {
    return sanitizePrefs(null);
  }
}

export function savePrefs(prefs, storage = getStorage()) {
  storage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

/** True when the AI settings are complete enough to try a request. */
export function aiReady(prefs) {
  const a = prefs.ai;
  if (!a.enabled) return false;
  if (a.provider === 'openai') {
    if (a.via === 'server') return true;
    return Boolean(a.model) && (Boolean(a.apiKey) || !/^https:\/\/api\.openai\.com/i.test(a.openaiBase));
  }
  return Boolean(a.providerID && a.modelID);
}
