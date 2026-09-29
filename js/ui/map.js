// The city map: an SVG of the Row with a pin per place. Pins show whether a place is
// open, where you are, and which friends are around (a dot each, in their color).

import { LOCATIONS } from '../data/locations.js';
import { CHAR_BY_ID } from '../data/characters/index.js';
import { isOpen } from '../data/locations.js';
import { whoIsAt, availableScene, makeEnv } from '../core/game.js';
import { iconMarkup } from './icons.js';
import { svgEl } from './dom.js';

const ROADS = 'M0 88H400M0 165H400M70 0V225M172 0V245M285 0V215M20 245Q120 265 230 240';
const TINT = ['rgba(255,190,140,0.10)', 'rgba(255,255,255,0)', 'rgba(90,40,110,0.20)', 'rgba(8,8,50,0.40)'];

function pinMarkup(loc, state, env) {
  const open = isOpen(loc.id, state.time.slot);
  const here = state.loc === loc.id;
  const people = whoIsAt(state, loc.id);
  let ready = false;
  const dots = people.map((id, i) => {
    const met = state.bonds[id].rank >= 1;
    const cx = loc.map.x + (i - (people.length - 1) / 2) * 13;
    const sc = state.loc === loc.id ? availableScene(state, id, env) : null;
    if (sc && met) ready = true;
    return `<circle cx="${cx}" cy="${loc.map.y + 30}" r="5.5" fill="${met ? CHAR_BY_ID[id].color : '#7d7391'}" stroke="#14111f" stroke-width="2"/>` +
      (met ? '' : `<text x="${cx}" y="${loc.map.y + 33.5}" text-anchor="middle" font-size="8" font-weight="900" fill="#14111f">?</text>`);
  }).join('');
  const fill = here ? '#ff6b6b' : open ? '#5a4a9a' : '#3a3450';
  const stroke = here ? '#fff' : open ? '#c9bdf5' : '#6d6488';
  return `<g class="pin${here ? ' here' : ''}${open ? '' : ' closed'}" data-loc="${loc.id}" tabindex="0" role="button" aria-label="${loc.name}${open ? '' : ', closed right now'}${here ? ', you are here' : ''}${people.length ? `, ${people.length} ${people.length === 1 ? 'person' : 'people'} here` : ''}">` +
    `<circle class="halo" cx="${loc.map.x}" cy="${loc.map.y}" r="24" fill="${here ? '#ff6b6b' : '#9a7bff'}" opacity="${here ? 0.28 : 0}"/>` +
    `<circle cx="${loc.map.x}" cy="${loc.map.y}" r="18" fill="${fill}" stroke="${stroke}" stroke-width="3"/>` +
    `<g transform="translate(${loc.map.x - 10.5} ${loc.map.y - 10.5}) scale(0.875)" fill="none" stroke="${open ? '#fff' : '#9a91b4'}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${iconMarkup(loc.id)}</g>` +
    (open ? '' : `<circle cx="${loc.map.x + 13}" cy="${loc.map.y - 13}" r="7" fill="#14111f" stroke="#6d6488" stroke-width="1.5"/><g transform="translate(${loc.map.x + 8} ${loc.map.y - 18}) scale(0.42)" fill="none" stroke="#c9bdf5" stroke-width="3">${iconMarkup('lock')}</g>`) +
    (ready ? `<g transform="translate(${loc.map.x + 8} ${loc.map.y - 30}) scale(0.7)" fill="#ffb454" stroke="#14111f" stroke-width="2">${iconMarkup('heart')}</g>` : '') +
    dots +
    `<text x="${loc.map.x}" y="${loc.map.y + (people.length ? 47 : 36)}" text-anchor="middle" font-size="11" font-weight="800" fill="${open ? '#f7f0e4' : '#8a7fa0'}" stroke="#14111f" stroke-width="3" paint-order="stroke">${loc.short}</text>` +
    `</g>`;
}

/** Builds the map element. Call update() after any change to state. */
export function createMap(app, onPick) {
  const wrap = svgEl(
    `<svg class="citymap" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" role="group" aria-label="Map of Halcyon Row">` +
    `<defs><linearGradient id="seaG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#20456e"/><stop offset="1" stop-color="#132c4a"/></linearGradient></defs>` +
    `<rect width="400" height="300" fill="url(#seaG)"/>` +
    `<path d="M0 0H400V214C350 236 310 224 262 232C232 238 218 252 212 268H196C192 252 176 246 150 244C100 240 50 252 0 238Z" fill="#2b2346"/>` +
    `<path d="M196 236H212V286H196Z" fill="#6b4a32" stroke="#14111f" stroke-width="2"/>` +
    `<path d="${ROADS}" stroke="#463c70" stroke-width="9" fill="none" stroke-linecap="round"/>` +
    `<path d="${ROADS}" stroke="#5a4e8a" stroke-width="1.5" fill="none" stroke-dasharray="8 8" opacity="0.7"/>` +
    `<rect x="84" y="20" width="76" height="58" rx="8" fill="#372d58"/><rect x="186" y="20" width="86" height="58" rx="8" fill="#372d58"/><rect x="300" y="20" width="84" height="58" rx="8" fill="#372d58"/>` +
    `<rect x="14" y="20" width="44" height="58" rx="8" fill="#372d58"/><rect x="14" y="100" width="44" height="54" rx="8" fill="#284a45"/><rect x="84" y="100" width="76" height="54" rx="8" fill="#372d58"/>` +
    `<rect x="186" y="100" width="86" height="54" rx="8" fill="#372d58"/><rect x="300" y="100" width="84" height="54" rx="8" fill="#372d58"/><rect x="300" y="176" width="84" height="34" rx="8" fill="#372d58"/>` +
    `<rect x="14" y="176" width="44" height="40" rx="8" fill="#372d58"/><rect x="84" y="176" width="76" height="46" rx="8" fill="#372d58"/><rect x="186" y="176" width="86" height="30" rx="8" fill="#372d58"/>` +
    `<path d="M0 262q30-8 60 0t60 0 60 0M220 284q30-8 60 0t60 0t60 0M24 282q30-8 60 0t60 0" stroke="#7fb0e0" stroke-width="2" fill="none" opacity="0.25"/>` +
    `<g class="pins"></g><rect class="tint" width="400" height="300" fill="rgba(0,0,0,0)" pointer-events="none"/></svg>`,
  );
  const pins = wrap.querySelector('.pins');
  const tint = wrap.querySelector('.tint');

  const pick = (e) => {
    const g = e.target.closest?.('[data-loc]');
    if (g) onPick(g.dataset.loc);
  };
  wrap.addEventListener('click', pick);
  wrap.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(e); }
  });

  function update() {
    const env = makeEnv(app.state, app.prefs);
    // Keep keyboard focus on the same pin across a redraw.
    const focused = document.activeElement?.closest?.('[data-loc]')?.dataset.loc;
    pins.innerHTML = LOCATIONS.map((l) => pinMarkup(l, app.state, env)).join('');
    tint.setAttribute('fill', TINT[app.state.time.slot]);
    if (focused) wrap.querySelector(`[data-loc="${focused}"]`)?.focus({ preventScroll: true });
  }
  return { el: wrap, update };
}

