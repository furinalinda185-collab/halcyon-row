// The You sheet: stats, wallet, what you are carrying, and what you did today.

import { h } from './dom.js';
import { icon } from './icons.js';
import { STAT_NAMES, STAT_INFO, levelOf, levelProgress, MAX_LEVEL } from '../core/stats.js';
import { ITEM_BY_ID } from '../data/items.js';
import { SLOTS, dayLabel } from '../core/clock.js';

export function openYou(app) {
  const { state } = app;
  app.sheet({
    title: state.player.name,
    ico: 'user',
    build(body) {
      body.append(
        h('div', { class: 'you-head' },
          h('span', { class: 'chip' }, dayLabel(state.time.day)),
          h('span', { class: 'chip gold' }, icon('coin', 14), ` $${state.player.money}`)),
        h('h3', null, 'Stats'),
        ...STAT_NAMES.map((name) => {
          const pts = state.player.stats[name];
          const lvl = levelOf(pts);
          return h('div', { class: 'stat' },
            h('div', { class: 'stat-top' }, h('b', null, STAT_INFO[name].label), h('span', { class: 'pips' }, Array.from({ length: MAX_LEVEL }, (_, i) => h('i', { class: i < lvl ? 'on' : '' }))), h('small', { class: 'faint' }, lvl >= MAX_LEVEL ? 'Max' : `Lv ${lvl}`)),
            h('div', { class: 'bar', role: 'progressbar', 'aria-label': `${STAT_INFO[name].label} progress`, 'aria-valuenow': Math.round(levelProgress(pts) * 100), 'aria-valuemin': 0, 'aria-valuemax': 100 }, h('i', { style: { '--p': `${Math.round(levelProgress(pts) * 100)}%` } })),
            h('small', { class: 'faint' }, STAT_INFO[name].blurb));
        }),
        h('h3', null, 'Carrying'),
      );
      const inv = Object.entries(state.inv).filter(([, n]) => n > 0);
      body.append(inv.length
        ? h('ul', { class: 'inv' }, inv.map(([id, n]) => h('li', null, h('b', null, ITEM_BY_ID[id]?.name ?? id), h('span', { class: 'chip' }, `x${n}`))))
        : h('p', { class: 'faint' }, 'Nothing. Shops sell small gifts for friends.'));

      body.append(h('h3', null, 'Today'));
      const entries = state.log.entries;
      body.append(entries.length
        ? h('ul', { class: 'today selectable' }, entries.map((e) => h('li', null, h('small', { class: 'faint' }, SLOTS[e.slot]), ' ', e.text)))
        : h('p', { class: 'faint' }, 'Nothing yet today.'));
    },
  });
}
