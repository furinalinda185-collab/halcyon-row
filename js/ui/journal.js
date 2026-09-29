// The Friends journal: how close you are, what you have learned about each person,
// and the memories the game (and AI mode) remembers.

import { h } from './dom.js';
import { icon } from './icons.js';
import { portraitSVG } from '../art/portrait.js';
import { CHARACTERS } from '../data/characters/index.js';
import { LOCATION_BY_ID } from '../data/locations.js';
import { RANKS, rankName, bondProgress, nextSceneNumber, pointsForNext } from '../core/bond.js';
import { daysUntilFestival, FESTIVAL_DAY } from '../core/clock.js';

const TAG_WORDS = {
  sweet: 'sweet things', cute: 'cute things', plant: 'plants', tool: 'practical tools', music: 'music', paper: 'paper goods',
  art: 'art supplies', book: 'books', tea: 'tea', drink: 'caffeinated drinks', food: 'good food', warm: 'warm things',
  silly: 'silly things', cozy: 'cozy things', festival: 'festival things',
};

function pips(rank) {
  return h('span', { class: 'pips', 'aria-label': `Rank ${rank} of 5` },
    RANKS.slice(1).map((_, i) => h('i', { class: i < rank ? 'on' : '' })));
}

export function openJournal(app) {
  const { state } = app;
  app.sheet({
    title: 'Friends',
    ico: 'heart',
    build(body) {
      const left = daysUntilFestival(state.time.day);
      body.append(h('div', { class: 'story-card' },
        h('b', null, 'The Lantern Festival'),
        h('span', { class: 'faint' }, state.done ? 'Done. The Row goes on.' : state.time.day > FESTIVAL_DAY ? 'It has passed.' : left === 0 ? 'It is tonight.' : `${left} day${left === 1 ? '' : 's'} away. Everyone you befriend will show up.`)));

      for (const c of CHARACTERS) {
        const b = state.bonds[c.id];
        const met = b.rank >= 1;
        const el = h('details', { class: `jcard${met ? '' : ' unmet'}` });
        const av = h('div', { class: 'avatar portrait', style: { '--c': c.color } });
        av.innerHTML = portraitSVG(c.look, met ? 'happy' : 'neutral', { crop: true });
        const n = nextSceneNumber(state, c.id);
        el.append(h('summary', null,
          av,
          h('span', { class: 'j-main' },
            h('b', null, met ? c.name : '???'),
            h('small', { class: 'faint' }, met ? c.title : 'You have not met this person yet'),
            met ? h('span', { class: 'j-rank' }, pips(b.rank), h('span', null, rankName(b.rank))) : null),
          met && n && b.pts >= pointsForNext(state, c.id) ? h('span', { class: 'chip hot' }, icon('heart', 12), ' ready') : null));

        if (!met) {
          el.append(h('div', { class: 'jbody' }, h('p', { class: 'muted' }, `Someone you might find around ${LOCATION_BY_ID[c.home].name}, at the right time.`)));
        } else {
          const jb = h('div', { class: 'jbody' });
          if (n) {
            const pct = Math.round(bondProgress(state, c.id) * 100);
            jb.append(h('div', { class: 'bar', role: 'progressbar', 'aria-valuenow': pct, 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-label': `${c.first} bond progress` }, h('i', { style: { '--p': `${pct}%` } })));
          }
          for (const entry of c.bio.filter((e) => b.rank >= e.rank)) jb.append(h('p', { class: 'selectable' }, entry.text));
          const likes = b.known.filter((k) => k.startsWith('like:')).map((k) => TAG_WORDS[k.slice(5)] ?? k.slice(5));
          const dislikes = b.known.filter((k) => k.startsWith('dislike:')).map((k) => TAG_WORDS[k.slice(8)] ?? k.slice(8));
          jb.append(h('div', { class: 'likes' },
            h('span', null, icon('gift', 14), ' Likes: ', likes.length ? likes.join(', ') : 'not sure yet'),
            h('span', null, 'Not into: ', dislikes.length ? dislikes.join(', ') : 'not sure yet')));
          if (app.prefs.romanceEnabled && c.romance && (b.romance === 'open' || b.romance === 'together')) {
            jb.append(h('p', { class: 'chip hot' }, icon('heart', 12), b.romance === 'together' ? ' Together' : ' Something is growing'));
          }
          const notes = state.memory[c.id].notes.slice(-5).reverse();
          if (notes.length) {
            jb.append(h('h4', null, 'Things you remember'), h('ul', { class: 'memories selectable' }, notes.map((m) => h('li', null, h('small', { class: 'faint' }, `Day ${m.day}`), ' ', m.text))));
          }
          el.append(jb);
        }
        body.append(el);
      }
    },
  });
}
