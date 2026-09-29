// The four player stats. Points are raised by activities; levels gate dialogue.

export const STAT_NAMES = ['charm', 'wit', 'grit', 'empathy'];

export const STAT_INFO = {
  charm: { label: 'Charm', blurb: 'Easy conversation, good timing, a decent joke.' },
  wit: { label: 'Wit', blurb: 'Noticing things. Knowing things. Connecting them.' },
  grit: { label: 'Grit', blurb: 'Showing up tired. Finishing what you start.' },
  empathy: { label: 'Empathy', blurb: 'Hearing what is under what people say.' },
};

const LEVEL_AT = [0, 3, 7, 12, 18];
export const MAX_LEVEL = LEVEL_AT.length - 1;

export function levelOf(points) {
  let lvl = 0;
  for (let i = 0; i < LEVEL_AT.length; i++) if (points >= LEVEL_AT[i]) lvl = i;
  return lvl;
}

/** Progress inside the current level, 0..1 (1 at max). */
export function levelProgress(points) {
  const lvl = levelOf(points);
  if (lvl >= MAX_LEVEL) return 1;
  const lo = LEVEL_AT[lvl];
  const hi = LEVEL_AT[lvl + 1];
  return (points - lo) / (hi - lo);
}

/** Adds points to a stat. Returns { from, to } levels so the UI can celebrate. */
export function addStat(state, name, amount = 1) {
  if (!STAT_NAMES.includes(name)) throw new Error(`Unknown stat: ${name}`);
  const before = levelOf(state.player.stats[name]);
  state.player.stats[name] = Math.max(0, Math.min(99, state.player.stats[name] + amount));
  return { from: before, to: levelOf(state.player.stats[name]) };
}

export function statLevel(state, name) {
  return levelOf(state.player.stats[name] ?? 0);
}
