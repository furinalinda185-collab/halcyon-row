// The title screen: continue, new game, and a way to set things up before you start.

import { h } from './dom.js';
import { icon } from './icons.js';
import { backdropSVG } from '../art/backdrop.js';
import { portraitSVG } from '../art/portrait.js';
import { CHARACTERS } from '../data/characters/index.js';
import { hasSave, loadGame, newState, deleteSave } from '../core/state.js';
import { openSettings } from './settings.js';

let installEvent = null;
globalThis.addEventListener?.('beforeinstallprompt', (e) => { e.preventDefault(); installEvent = e; });

/**
 * onStart(state) is called with a loaded or fresh state.
 */
export function showTitle(app, onStart) {
  const bg = h('div', { class: 'title-bg backdrop' });
  bg.innerHTML = backdropSVG('pier', { slot: 2, weather: 'clear' });
  const cast = h('div', { class: 'title-cast', 'aria-hidden': 'true' },
    CHARACTERS.slice(0, 5).map((c, i) => {
      const p = h('div', { class: `tc tc${i} portrait` });
      p.innerHTML = portraitSVG(c.look, ['happy', 'smirk', 'happy', 'neutral', 'smirk'][i]);
      return p;
    }));

  const saved = hasSave(app.storage) ? loadGame(app.storage) : null;
  const buttons = h('div', { class: 'title-btns' });
  if (saved) {
    buttons.append(h('button', { class: 'btn primary block', type: 'button', onclick: () => { app.audio.play('confirm'); done(saved); } },
      icon('play', 18), `Continue · ${saved.player.name}, day ${saved.time.day}`));
  }
  buttons.append(
    h('button', { class: `btn block ${saved ? 'ghost' : 'primary'}`, type: 'button', onclick: () => { app.audio.play('select'); newGame(); } }, icon('sparkle', 18), 'New game'),
    h('button', { class: 'btn block ghost', type: 'button', onclick: () => { app.audio.play('select'); openSettings(app, { onQuit: () => {} }); } }, icon('gear', 18), 'Settings and AI text mode'));
  if (installEvent) {
    buttons.append(h('button', { class: 'btn block ghost install', type: 'button', onclick: async () => { installEvent.prompt(); await installEvent.userChoice; installEvent = null; layer.querySelector('.install')?.remove(); } }, icon('phone', 18), 'Install on this device'));
  }

  const layer = h('div', { class: 'layer title' },
    bg, cast,
    h('div', { class: 'title-card' },
      h('small', { class: 'kicker' }, 'a slow little story about friends'),
      h('h1', null, h('span', null, 'HALCYON'), h('span', { class: 'row' }, 'ROW')),
      h('p', { class: 'tag' }, 'One month. Six friends. A lantern festival. No need to leave the house to have a place to belong.'),
      buttons,
      h('p', { class: 'fine faint' }, 'Friendship stories with optional romance. AI text mode is optional and off by default.')));
  const remove = app.layer(layer);

  function done(state) {
    app.state = state;
    layer.classList.add('leaving');
    setTimeout(() => { remove(); onStart(state); }, 250);
  }

  function newGame() {
    const start = () => {
      app.sheet({
        title: 'Before you move in',
        ico: 'home',
        short: true,
        build(body, ctl) {
          const name = h('input', { type: 'text', maxlength: '20', placeholder: 'Your name', autocomplete: 'off', 'aria-label': 'Your name' });
          const go = h('button', { class: 'btn primary block', type: 'button' }, 'Move in');
          const finish = () => {
            const n = name.value.trim();
            if (!n) { name.focus(); return; }
            ctl.close();
            deleteSave(app.storage);
            app.audio.play('confirm');
            done(newState(n));
          };
          go.addEventListener('click', finish);
          name.addEventListener('keydown', (e) => { if (e.key === 'Enter') finish(); });
          body.append(
            h('p', { class: 'muted' }, 'It is the first day of a new life in a small harbor neighborhood. What should people call you?'),
            h('div', { class: 'field' }, name),
            go);
          setTimeout(() => name.focus(), 60);
        },
      });
    };
    if (saved) {
      app.sheet({
        title: 'Start a new game?',
        short: true,
        build(body, ctl) {
          body.append(
            h('p', null, `This replaces your saved game (${saved.player.name}, day ${saved.time.day}). You can export it first from Settings, under Saves.`),
            h('div', { class: 'row2' },
              h('button', { class: 'btn ghost', type: 'button', onclick: () => ctl.close() }, 'Keep it'),
              h('button', { class: 'btn primary', type: 'button', onclick: () => { ctl.close(); start(); } }, 'Start over')));
        },
      });
    } else {
      start();
    }
  }

  return { remove };
}
