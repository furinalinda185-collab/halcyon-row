// Tiny builders for writing scenes. Everything returns plain objects, so a
// scene file reads like a script and stays easy to lint.
//
//   const J = voice('junie');
//   export const nodes = [
//     bg('cafe'),
//     J('happy', 'You came back.'),
//     choice([
//       opt('Obviously.', [J('smirk', 'Good answer.')], { pts: ['junie', 2] }),
//       opt('Is that a problem?', [J('surprised', 'No! God, no.')], { pts: ['junie', 1] }),
//     ]),
//   ];

/** J('happy', 'text') or J('text') for a neutral line. */
export const voice = (who) => (a, b) => ({ t: 'say', who, mood: b === undefined ? 'neutral' : a, text: b === undefined ? a : b });

/** The player speaking. */
export const me = (text) => ({ t: 'say', who: 'you', mood: '', text });

export const narr = (text) => ({ t: 'narr', text });
export const title = (text, sub = '') => ({ t: 'title', text, sub });

/**
 * A player option. extra: { req, hide, pts:[id,n], stat:[name,n], set:[k,v], silent }
 * `hide` removes the option entirely when `req` fails, instead of showing it locked.
 */
export const opt = (text, then = [], extra = {}) => ({ text, then, ...extra });
export const choice = (options, prompt = '') => ({ t: 'choice', options, prompt });

export const iff = (cond, then, otherwise = []) => ({ t: 'if', cond, then, else: otherwise });

export const pts = (id, n, kind) => ({ t: 'pts', id, n, kind });
export const stat = (name, n = 1) => ({ t: 'stat', name, n });
export const money = (n) => ({ t: 'money', n });
export const item = (id, n = 1) => ({ t: 'item', id, n });
export const set = (k, v = true) => ({ t: 'set', k, v });
export const remember = (id, text) => ({ t: 'remember', id, text });
export const romance = (id, value) => ({ t: 'romance', id, value });
export const complete = (id, n) => ({ t: 'complete', id, n });
export const log = (text) => ({ t: 'log', text });

export const bg = (loc) => ({ t: 'bg', loc });
export const show = (who, mood = 'neutral', side = 'center') => ({ t: 'show', who, mood, side });
export const hide = (who) => ({ t: 'hide', who });
/** Removes every portrait from the stage, for when a new group of people takes over. */
export const clearStage = () => ({ t: 'clear' });
export const sfx = (name) => ({ t: 'sfx', name });
export const end = () => ({ t: 'end' });
