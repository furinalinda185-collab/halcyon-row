// Turns raw model output into something safe to show: message bubbles, a mood,
// a bond score, and an optional memory note. The model can be sloppy, so this is
// forgiving about the tag and strict about what reaches the screen.

import { MOODS } from '../data/characters/index.js';

// Attribute values may be quoted and contain ">", so match quotes as units.
const TAG = /<state\b((?:[^>"']|"[^"]*"|'[^']*')*?)\/?>/gi;
const TAIL = /<state\b[^>]*$/i; // an unfinished tag at the very end

function attrs(str) {
  const out = {};
  for (const m of str.matchAll(/(\w+)\s*=\s*("([^"]*)"|'([^']*)')/g)) out[m[1].toLowerCase()] = m[3] ?? m[4] ?? '';
  return out;
}

/** House style: no dashes as punctuation, no markdown, no stray quotes around the whole reply. */
export function tidy(text) {
  return text
    .replace(/\s*[—–]\s*/g, ', ')
    .replace(/(\s)-{1,2}(\s)/g, ', ')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/,\s*,/g, ',')
    .replace(/,\s*([.!?])/g, '$1')
    .trim();
}

/**
 * @param raw   model output
 * @param mode  'phone' splits into up to 3 bubbles; 'talk' returns one
 */
export function parseReply(raw, { mode = 'phone' } = {}) {
  let text = String(raw ?? '');
  let meta = {};
  for (const m of text.matchAll(TAG)) meta = attrs(m[1]);
  text = text.replace(TAG, '').replace(TAIL, '');
  if (mode === 'phone') text = text.replace(/\*([^*\n]+)\*/g, '$1');
  text = tidy(text);
  if (!text) throw new Error('The reply came back empty. Try again.');

  let bubbles;
  if (mode === 'talk') {
    bubbles = [text.replace(/\n{2,}/g, ' ').replace(/\n/g, ' ')];
  } else {
    bubbles = text.split(/\n{2,}/).map((b) => b.replace(/\n/g, ' ').trim()).filter(Boolean);
    if (bubbles.length > 3) bubbles = [...bubbles.slice(0, 2), bubbles.slice(2).join(' ')];
  }
  bubbles = bubbles.map((b) => b.slice(0, 600));

  const mood = MOODS.includes((meta.mood || '').toLowerCase()) ? meta.mood.toLowerCase() : 'neutral';
  const bondRaw = Number.parseInt(meta.bond, 10);
  const bond = Number.isFinite(bondRaw) ? Math.max(0, Math.min(3, bondRaw)) : 0;
  const note = meta.note ? tidy(meta.note).replace(/[<>]/g, '').slice(0, 140) : '';
  return { bubbles, mood, bond, note: note || null };
}

/** Removes the hidden tag from streamed text so it never flashes on screen. */
export function stripForDisplay(partial) {
  return partial.replace(TAG, '').replace(TAIL, '');
}
