// Turns authored scene data into runnable node lists, and picks casual hangouts.
// Pure functions, no DOM.

import { seeded, hashString } from './clock.js';
import { voice } from './dsl.js';
import { ITEM_BY_ID } from '../data/items.js';

/** Full node list for a rank scene, including the bookkeeping at the end. */
export function sceneNodes(char, scene) {
  return [
    ...scene.nodes,
    { t: 'remember', id: char.id, text: scene.recap },
    { t: 'complete', id: char.id, n: scene.n },
    { t: 'log', text: `${scene.title}, with ${char.first}.` },
  ];
}

const GENERIC = (char) => [
  { t: 'show', who: char.id, mood: 'happy', side: 'center' },
  voice(char.id)('happy', 'Hey. Good timing. I was hoping you would turn up.'),
  { t: 'choice', prompt: '', options: [
    { text: 'Me too. What are you up to?', then: [voice(char.id)('neutral', 'Honestly? Nothing much. That is why it is nice to have company.')], pts: [char.id, 2] },
    { text: 'Just passing through. Want to walk with me?', then: [voice(char.id)('happy', 'Sure. Let us go slow.')], pts: [char.id, 1] },
  ] },
];

/**
 * Chooses a casual hangout for this friend, here and now. Prefers ones written
 * for this place, avoids repeats until the pool is used up, and is stable for a
 * given day and slot so reloading the page does not change what you get.
 */
export function pickHangout(state, id, char) {
  const b = state.bonds[id];
  const loc = state.loc;
  const eligible = char.hangouts.filter((h) => b.rank >= (h.minRank ?? 1) && (h.at === 'any' || h.at.includes(loc)));
  if (!eligible.length) return { id: `${id}_generic`, nodes: GENERIC(char) };
  let fresh = eligible.filter((h) => !b.hangs.includes(h.id));
  if (!fresh.length) {
    b.hangs = b.hangs.filter((h) => !eligible.some((e) => e.id === h));
    fresh = eligible;
  }
  const specific = fresh.filter((h) => h.at !== 'any');
  const pool = specific.length ? specific : fresh;
  const rng = seeded(hashString(`${id}:${state.time.day}:${state.time.slot}:${loc}`));
  return pool[Math.floor(rng() * pool.length)];
}

export function markHangout(state, id, hangoutId) {
  const b = state.bonds[id];
  if (!b.hangs.includes(hangoutId)) b.hangs.push(hangoutId);
  while (b.hangs.length > 200) b.hangs.shift();
}

/** like | ok | dislike */
export function giftReaction(char, item) {
  const like = item.tags.some((t) => char.likes.includes(t));
  const dislike = item.tags.some((t) => char.dislikes.includes(t));
  if (like && !dislike) return 'like';
  if (dislike && !like) return 'dislike';
  return 'ok';
}

/** Nodes for handing over a gift. Also reveals a tag preference in the journal. */
export function giftNodes(state, char, itemId) {
  const item = ITEM_BY_ID[itemId];
  const reaction = giftReaction(char, item);
  const lines = char.gifts[reaction];
  const rng = seeded(hashString(`gift:${char.id}:${itemId}:${state.time.day}:${state.bonds[char.id].gifts}`));
  const line = lines[Math.floor(rng() * lines.length)];
  const mood = reaction === 'like' ? 'happy' : reaction === 'ok' ? 'neutral' : 'worried';
  const amount = reaction === 'like' ? 3 : reaction === 'ok' ? 1 : 0;
  return {
    reaction,
    nodes: [
      { t: 'show', who: char.id, mood, side: 'center' },
      { t: 'narr', text: `You give ${char.first} the ${item.name.toLowerCase()}.` },
      voice(char.id)(mood, line),
      { t: 'pts', id: char.id, n: amount, kind: 'gift' },
    ],
    learned: reaction === 'ok' ? [] : item.tags.filter((t) => (reaction === 'like' ? char.likes : char.dislikes).includes(t)).map((t) => `${reaction}:${t}`),
  };
}
