// The phone: a list of friends you have met, and a chat thread with each.
//
// Story mode: friends text you and you pick a quick reply.
// AI text mode: you can also type anything and the friend answers in character.

import { h, clear, wait } from './dom.js';
import { icon } from './icons.js';
import { portraitSVG } from '../art/portrait.js';
import { CHARACTERS, CHAR_BY_ID } from '../data/characters/index.js';
import { SLOTS, weekdayName } from '../core/clock.js';
import { addMessage, sendQuickReply, markRead, hasPending, lastMessage, unreadCount } from '../core/phone.js';
import { addPoints } from '../core/bond.js';
import { remember } from '../core/script.js';
import { aiReady } from '../core/prefs.js';
import { openSettings } from './settings.js';

const HISTORY_TURNS = 16;

function avatar(c, size = 44) {
  const el = h('div', { class: 'avatar portrait', style: { '--c': c.color, width: `${size}px`, height: `${Math.round(size * 1.29)}px` } });
  el.innerHTML = portraitSVG(c.look, 'happy', { crop: true });
  return el;
}

function whenLabel(m) {
  return `Day ${m.day} · ${weekdayName(m.day).slice(0, 3)} · ${SLOTS[m.slot]}`;
}

export function openPhone(app, { charId = null, onChange } = {}) {
  const { state } = app;
  let current = charId;
  let ctl;
  let abort = null;
  let sending = false;

  ctl = app.sheet({
    title: 'Phone',
    ico: 'phone',
    flush: true,
    onClose: () => { abort?.abort(); app.save(); onChange?.(); },
    build(body, c) {
      ctl = c; // build runs before app.sheet() returns, so take the controller from here
      body.classList.add('phone-body');
      render();
    },
  });

  function render() {
    if (current) renderThread(current);
    else renderList();
  }

  // ------------------------------------------------------------ list view
  function renderList() {
    ctl.setTitle('Phone');
    const body = ctl.body;
    clear(body);
    body.classList.remove('thread-body');
    const met = CHARACTERS.filter((c) => state.bonds[c.id].rank >= 1);
    if (!met.length) {
      body.append(h('div', { class: 'empty' }, h('p', null, 'No contacts yet.'), h('p', { class: 'faint' }, 'Go out and meet someone. They will text you.')));
      return;
    }
    const rows = met
      .map((c) => ({ c, last: lastMessage(state, c.id) }))
      .sort((a, b) => ((b.last?.day ?? 0) * 4 + (b.last?.slot ?? 0)) - ((a.last?.day ?? 0) * 4 + (a.last?.slot ?? 0)));
    body.append(h('ul', { class: 'threads' }, rows.map(({ c, last }) => {
      const unread = unreadCount(state, c.id);
      return h('li', null, h('button', { class: `thread-row${unread ? ' unread' : ''}`, type: 'button', onclick: () => { app.audio.play('tap'); current = c.id; render(); } },
        avatar(c),
        h('span', { class: 'tr-main' },
          h('b', null, c.name),
          h('small', { class: 'faint' }, last ? `${last.from === 'you' ? 'You: ' : ''}${last.text}` : 'Say hi')),
        unread ? h('span', { class: 'chip hot' }, String(unread)) : hasPending(state, c.id) ? h('span', { class: 'chip gold' }, 'reply') : null));
    })));
    body.append(h('p', { class: 'faint center pad' }, 'Friends text when they think of you. Nobody minds if you take a while.'));
  }

  // ---------------------------------------------------------- thread view
  function renderThread(id) {
    const c = CHAR_BY_ID[id];
    const body = ctl.body;
    ctl.setTitle(c.name);
    clear(body);
    body.classList.add('thread-body');
    markRead(state, id);

    const msgs = h('div', { class: 'msgs selectable', role: 'log', 'aria-live': 'polite' });
    const quick = h('div', { class: 'quick' });
    const inputRow = h('div', { class: 'compose' });
    const back = h('button', { class: 'thread-back', type: 'button', onclick: () => { abort?.abort(); current = null; render(); } }, icon('back', 18), ' All messages');
    body.append(back, msgs, quick, inputRow);

    function paintMessages() {
      clear(msgs);
      let lastLabel = '';
      for (const m of state.inbox[id]) {
        const label = whenLabel(m);
        if (label !== lastLabel) { msgs.append(h('div', { class: 'daysep' }, label)); lastLabel = label; }
        msgs.append(h('div', { class: `bubble ${m.from === 'you' ? 'you' : 'them'}` }, m.text));
      }
      if (!state.inbox[id].length) msgs.append(h('p', { class: 'faint center pad' }, `No messages yet. Say hi to ${c.first}.`));
      msgs.scrollTop = msgs.scrollHeight;
    }

    function paintQuick() {
      clear(quick);
      const pending = state.texts.pending[id];
      if (!pending?.replies.length) return;
      quick.append(...pending.replies.map((r, i) =>
        h('button', { class: 'qr', type: 'button', disabled: sending, onclick: () => pickQuick(i) }, r.text)));
    }

    function paintCompose() {
      clear(inputRow);
      const ai = app.ai;
      if (!app.prefs.ai.enabled) {
        inputRow.append(h('div', { class: 'ai-off' },
          h('span', { class: 'faint' }, 'Want to type your own messages? Turn on AI text mode.'),
          h('button', { class: 'btn small teal', type: 'button', onclick: () => openSettings(app, { tab: 'ai', onChange: paintCompose }) }, icon('chat', 16), 'Set up')));
        return;
      }
      if (!aiReady(app.prefs) || !ai) {
        inputRow.append(h('div', { class: 'ai-off' },
          h('span', { class: 'faint' }, 'AI text mode is on but not finished setting up.'),
          h('button', { class: 'btn small teal', type: 'button', onclick: () => openSettings(app, { tab: 'ai', onChange: paintCompose }) }, icon('gear', 16), 'Finish setup')));
        return;
      }
      const left = ai.remaining();
      const ta = h('textarea', { rows: 1, maxlength: 600, placeholder: `Message ${c.first}`, 'aria-label': `Message ${c.first}`, enterkeyhint: 'send' });
      const send = h('button', { class: 'send', type: 'button', 'aria-label': 'Send', disabled: sending || left <= 0, onclick: () => sendTyped() }, icon('send', 20));
      const grow = () => { ta.style.height = 'auto'; ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`; };
      ta.addEventListener('input', grow);
      ta.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); sendTyped(); }
      });
      ta.addEventListener('focus', () => setTimeout(() => { msgs.scrollTop = msgs.scrollHeight; }, 250));
      inputRow.append(
        h('div', { class: 'compose-row' }, ta, send),
        h('div', { class: 'faint tiny' }, left > 0 ? `${left} AI messages left today` : 'AI message limit reached for today. Quick replies still work.'));
      inputRow._ta = ta;

      async function sendTyped() {
        const text = ta.value.trim();
        if (!text || sending || left <= 0) return;
        ta.value = '';
        grow();
        await chatTurn(text);
      }
    }

    async function pickQuick(i) {
      const before = state.bonds[id].pts;
      const got = sendQuickReply(state, id, i);
      app.audio.play('select');
      paintMessages();
      paintQuick();
      if (got > 0) app.toast(`${c.first} +${got}`, { ico: 'heart', kind: 'love', ms: 1600 });
      void before;
      app.save();
    }

    function typing() {
      const dots = h('div', { class: 'bubble them typing', 'aria-label': `${c.first} is typing` }, h('i'), h('i'), h('i'));
      msgs.append(dots);
      msgs.scrollTop = msgs.scrollHeight;
      return dots;
    }

    async function chatTurn(text) {
      sending = true;
      paintQuick();
      addMessage(state, id, 'you', text);
      paintMessages();
      const dots = typing();
      const history = state.inbox[id].slice(-HISTORY_TURNS - 1, -1).map((m) => ({ role: m.from === 'you' ? 'user' : 'assistant', content: m.text }));
      abort = new AbortController();
      try {
        const res = await app.ai.chat({ charId: id, userText: text, history, mode: 'phone', convoId: `phone:${id}`, signal: abort.signal });
        dots.remove();
        for (let i = 0; i < res.bubbles.length; i++) {
          const d = i === 0 ? null : typing();
          if (d) { await wait(Math.min(1400, 350 + res.bubbles[i].length * 18)); d.remove(); }
          addMessage(state, id, 'them', res.bubbles[i], true);
          paintMessages();
          app.audio.play('bell');
        }
        const got = addPoints(state, id, Math.min(1, res.bond), 'ai');
        if (got > 0) app.toast(`${c.first} +${got}`, { ico: 'heart', kind: 'love', ms: 1600 });
        if (res.note) remember(state, id, res.note);
      } catch (err) {
        dots.remove();
        if (err?.name !== 'AbortError') {
          msgs.append(h('div', { class: 'bubble err', role: 'alert' }, `Message not delivered: ${err.message || 'unknown error'}. Check Menu, AI, then try again.`));
          msgs.scrollTop = msgs.scrollHeight;
          app.toast('The AI request failed.', { kind: 'bad', ico: 'wifi' });
        }
      } finally {
        sending = false;
        abort = null;
        app.save();
        paintQuick();
        paintCompose();
        inputRow._ta?.focus({ preventScroll: true });
      }
    }

    paintMessages();
    paintQuick();
    paintCompose();
  }
}
