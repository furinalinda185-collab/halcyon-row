import junie from './junie.js';
import dez from './dez.js';
import priya from './priya.js';
import tomek from './tomek.js';
import sable from './sable.js';
import amara from './amara.js';

export const CHARACTERS = [junie, dez, priya, tomek, sable, amara];
export const CHARACTER_IDS = CHARACTERS.map((c) => c.id);
export const CHAR_BY_ID = Object.fromEntries(CHARACTERS.map((c) => [c.id, c]));
export { MOODS } from './util.js';
