// The card shown when a day ends: what you did, then the start of the next one.

import { h } from './dom.js';
import { icon, WEATHER_ICON } from './icons.js';
import { SLOTS, weekdayName, weatherFor } from '../core/clock.js';

const WEATHER_TEXT = {
  clear: 'Clear skies.',
  cloudy: 'Grey and soft.',
  rain: 'Rain on the windows.',
  fog: 'Fog off the harbor.',
};

/** Resolves when the player taps continue. r = the passSlots result. */
export function showDayEnd(app, r) {
  return new Promise((resolve) => {
    const { state } = app;
    const done = () => { remove(); resolve(); };
    const entries = r.recap?.entries ?? [];
    const w = weatherFor(state.time.day);
    const card = h('div', { class: 'daycard', role: 'dialog', 'aria-label': 'Day summary' },
      h('small', { class: 'dc-kicker' }, `Day ${r.recap?.day ?? state.time.day - 1} ends`),
      entries.length
        ? h('ul', { class: 'dc-list selectable' }, entries.map((e) => h('li', null, h('small', null, SLOTS[e.slot]), h('span', null, e.text))))
        : h('p', { class: 'muted' }, 'A quiet one. Those count too.'),
      h('div', { class: 'dc-next' },
        h('small', null, 'Tomorrow'),
        h('h2', null, `Day ${state.time.day} · ${weekdayName(state.time.day)}`),
        h('p', null, icon(WEATHER_ICON[w], 18), ' ', WEATHER_TEXT[w])),
      h('button', { class: 'btn primary block', type: 'button', onclick: done }, 'Begin the day'));
    const layer = h('div', { class: 'layer dayend' }, card);
    const remove = app.layer(layer);
    app.audio.play('bell');
    card.querySelector('button').focus({ preventScroll: true });
  });
}
