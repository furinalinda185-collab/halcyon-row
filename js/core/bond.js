// Friendship math. Ranks 0 to 5, points, and the rules that stop grinding.
//
// Rank 0 is a stranger. Scenes 1 to 4 each raise the rank by one. Rank 5 comes from the
// festival finale for anyone already at rank 4, or from a short epilogue scene afterwards.

export const RANKS = ['Stranger', 'Acquaintance', 'Friend', 'Good friend', 'Close friend', 'Best friend'];
export const MAX_SCENE = 5;

/** Points needed before scene N can be played. Scene 1 (meeting) needs none. */
export const SCENE_PTS = { 1: 0, 2: 22, 3: 46, 4: 74, 5: 88 };

/** Per friend, per day. Hangouts and scene choices are limited by time slots instead. */
export const DAILY_CAPS = { text: 1, ai: 3, gift: 2 };

const OVERFLOW = 3;      // how far past the next threshold points can bank
const FINAL_CAP = 90;    // display cap once all four scenes are done

export function rankName(rank) {
  return RANKS[Math.max(0, Math.min(RANKS.length - 1, rank))];
}

/** Scene 5 is the "some weeks later" scene. It only exists once the festival is behind you. */
export function nextSceneNumber(state, id) {
  const n = state.bonds[id].rank + 1;
  if (n > MAX_SCENE) return null;
  if (n === 5 && !state.done) return null;
  return n;
}

export function pointsForNext(state, id) {
  const n = nextSceneNumber(state, id);
  return n ? SCENE_PTS[n] : null;
}

export function sceneUnlocked(state, id) {
  const n = nextSceneNumber(state, id);
  if (!n) return false;
  return state.bonds[id].pts >= SCENE_PTS[n];
}

/** 0..1 toward the next scene, for the progress ring. 1 when maxed or ready. */
export function bondProgress(state, id) {
  const b = state.bonds[id];
  const n = nextSceneNumber(state, id);
  if (!n) return 1;
  const lo = n > 1 ? SCENE_PTS[n - 1] : 0;
  const hi = SCENE_PTS[n];
  if (hi <= lo) return 1;
  return Math.max(0, Math.min(1, (b.pts - lo) / (hi - lo)));
}

function ceilingFor(state, id) {
  const n = nextSceneNumber(state, id);
  return n ? SCENE_PTS[n] + OVERFLOW : FINAL_CAP;
}

/**
 * Adds bond points and returns how many actually landed.
 * kind: 'scene' | 'hangout' | 'gift' | 'text' | 'ai'
 * Strangers gain nothing except through their first scene.
 */
export function addPoints(state, id, amount, kind = 'hangout') {
  const b = state.bonds[id];
  if (!b || !(amount > 0)) return 0;
  if (b.rank < 1 && kind !== 'scene') return 0;
  let grant = Math.floor(amount);
  const cap = DAILY_CAPS[kind];
  if (cap) {
    if (b.daily.day !== state.time.day) b.daily = { day: state.time.day, text: 0, ai: 0, gift: 0 };
    const room = Math.max(0, cap - (b.daily[kind] || 0));
    grant = Math.min(grant, room);
    b.daily[kind] = (b.daily[kind] || 0) + grant;
  }
  const ceiling = kind === 'scene' ? Number.POSITIVE_INFINITY : ceilingFor(state, id);
  grant = Math.max(0, Math.min(grant, ceiling - b.pts));
  b.pts += grant;
  return grant;
}

/** Called when a rank scene finishes. */
export function completeScene(state, id, n) {
  const b = state.bonds[id];
  b.met = true;
  b.rank = Math.max(b.rank, n);
  if (!b.scenes.includes(n)) b.scenes.push(n);
}
