// "Chat freely": an in person hangout where you type and your friend answers in character.
// It costs one time slot if you actually talk. Bond points are earned only through real
// back and forth, and are capped, so a model cannot inflate friendship on its own.

import { h, clear } from './dom.js';
import { icon } from './icons.js';
import { portraitSVG } from '../art/portrait.js';
import { backdropSVG } from '../art/backdrop.js';
import { CHAR_BY_ID } from '../data/characters/index.js';
import { LOCATION_BY_ID } from '../data/locations.js';
import { weatherFor } from '../core/clock.js';
import { addPoints } from '../core/bond.js';
import { remember } from '../core/script.js';

const MAX_TURNS = 14;
const MIN_TURNS_FOR_BOND = 3;
const OPENERS = ['How has your day been?', 'What is on your mind lately?', 'Tell me something good.'];

export function startTalk(app, charId) {
  return new Promise((resolve) => {
    const { state } = app;
    const c = CHAR_BY_ID[charId];
    const weather = weatherFor(state.time.day);
    const history = [];
    let turns = 0;
    let bondSum = 0;
    let sending = false;
    let abort = null;
    let mood = 'neutral';

    const bg = h('div', { class: 'talk-bg backdrop' });
    bg.innerHTML = backdropSVG(state.loc, { slot: state.time.slot, weather });
    const portrait = h('div', { class: 'portrait talk-portrait' });
    const setMood = (m) => { mood = m; portrait.innerHTML = portraitSVG(c.look, m); };
    setMood('happy');
    const log = h('div', { class: 'talk-log selectable', role: 'log', 'aria-live': 'polite' });
    const chips = h('div', { class: 'quick' });
    const ta = h('textarea', { rows: 1, maxlength: 600, placeholder: `Say something to ${c.first}`, 'aria-label': `Say something to ${c.first}`, enterkeyhint: 'send' });
    const send = h('button', { class: 'send', type: 'button', 'aria-label': 'Send', onclick: () => submit(ta.value) }, icon('send', 20));
    const meter = h('div', { class: 'faint tiny' });
    const endBtn = h('button', { class: 'btn small ghost', type: 'button', onclick: () => end() }, icon('back', 16), 'Head out');
    const head = h('div', { class: 'talk-head' }, endBtn, h('span', { class: 'chip', style: { background: c.color, color: '#1b1524' } }, c.name), h('span', { class: 'chip' }, LOCATION_BY_ID[state.loc].short));
    const panel = h('div', { class: 'talk-panel' }, log, chips, h('div', { class: 'compose-row' }, ta, send), meter);
    const layer = h('div', { class: 'layer talk' }, bg, h('div', { class: 'talk-stage' }, portrait), head, panel);
    const remove = app.layer(layer);

    const grow = () => { ta.style.height = 'auto'; ta.style.height = `${Math.min(ta.scrollHeight, 110)}px`; };
    ta.addEventListener('input', grow);
    ta.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); submit(ta.value); }
    });

    function paintMeter() {
      const left = app.ai.remaining();
      meter.textContent = turns >= MAX_TURNS
        ? 'This chat has run its course. Head out when you are ready.'
        : `${left} AI messages left today`;
      ta.disabled = sending || turns >= MAX_TURNS || left <= 0;
      send.disabled = ta.disabled;
    }

    function add(kind, text) {
      const el = h('div', { class: `tmsg ${kind}` }, kind === 'them' ? h('b', { style: { color: c.color } }, c.first) : null, h('p', null, text));
      log.append(el);
      log.scrollTop = log.scrollHeight;
      return el;
    }

    function chipsFor() {
      clear(chips);
      if (turns > 0) return;
      chips.append(...OPENERS.map((t) => h('button', { class: 'qr', type: 'button', onclick: () => submit(t) }, t)));
    }

    async function submit(raw) {
      const text = (raw || '').trim();
      if (!text || sending || turns >= MAX_TURNS || app.ai.remaining() <= 0) return;
      ta.value = '';
      grow();
      sending = true;
      clear(chips);
      add('you', text);
      const wait = add('them typing', '...');
      paintMeter();
      abort = new AbortController();
      try {
        const res = await app.ai.chat({ charId, userText: text, history: history.slice(-16), mode: 'talk', convoId: `talk:${charId}:${state.time.day}:${state.time.slot}`, signal: abort.signal });
        wait.remove();
        history.push({ role: 'user', content: text }, { role: 'assistant', content: res.bubbles.join(' ') });
        turns += 1;
        bondSum += res.bond;
        setMood(res.mood);
        portrait.classList.add('talking');
        add('them', res.bubbles.join(' '));
        app.audio.play('text');
        setTimeout(() => portrait.classList.remove('talking'), Math.min(3500, 500 + res.bubbles.join(' ').length * 30));
        if (res.note) remember(state, charId, res.note);
      } catch (err) {
        wait.remove();
        if (err?.name !== 'AbortError') {
          log.append(h('div', { class: 'tmsg err', role: 'alert' }, h('p', null, `Could not get a reply: ${err.message || 'unknown error'}`)));
          log.scrollTop = log.scrollHeight;
        }
      } finally {
        sending = false;
        abort = null;
        paintMeter();
        if (!ta.disabled) ta.focus({ preventScroll: true });
      }
    }

    function end() {
      abort?.abort();
      document.removeEventListener('keydown', onKey);
      let gained = 0;
      if (turns >= MIN_TURNS_FOR_BOND) gained = addPoints(state, charId, Math.min(3, bondSum), 'ai');
      if (turns > 0) state.log.entries.push({ slot: state.time.slot, text: `Talked with ${c.first}, just talking.` });
      app.save();
      if (gained > 0) app.toast(`${c.first} +${gained}`, { ico: 'heart', kind: 'love' });
      layer.classList.add('leaving');
      setTimeout(() => { remove(); resolve({ spentSlot: turns > 0 }); }, 260);
    }

    const onKey = (e) => { if (e.key === 'Escape' && !app.hasSheet()) end(); };
    document.addEventListener('keydown', onKey);

    add('narr', `You settle in with ${c.first} at ${LOCATION_BY_ID[state.loc].name}. Say whatever you would say to a friend.`);
    chipsFor();
    paintMeter();
    ta.focus({ preventScroll: true });
  });
}
