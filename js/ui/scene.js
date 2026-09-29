// The dialogue player. Runs a script (see core/script.js) as a visual novel scene:
// backdrop, portraits, typewriter text, choices, and the little rewards that pop up.

import { Runner } from '../core/script.js';
import { makeEnv } from '../core/game.js';
import { weatherFor } from '../core/clock.js';
import { CHAR_BY_ID } from '../data/characters/index.js';
import { NPCS } from '../data/npcs.js';
import { STAT_INFO } from '../core/stats.js';
import { rankName } from '../core/bond.js';
import { ITEM_BY_ID } from '../data/items.js';
import { portraitSVG } from '../art/portrait.js';
import { backdropSVG } from '../art/backdrop.js';
import { h, wait } from './dom.js';
import { icon } from './icons.js';

const SPEED_MS = { slow: 42, normal: 20, fast: 8, instant: 0 };

const lookOf = (who) => CHAR_BY_ID[who]?.look ?? NPCS[who]?.look ?? null;
const nameOf = (who, state) => (who === 'you' ? state.player.name : CHAR_BY_ID[who]?.first ?? NPCS[who]?.name ?? '');
const colorOf = (who) => CHAR_BY_ID[who]?.color ?? NPCS[who]?.color ?? '#b7abc9';

/**
 * Plays nodes as a scene. Resolves when it ends.
 * opts: { pointKind, initialBg }
 */
export function playScript(app, nodes, opts = {}) {
  return new Promise((resolve) => {
    const { state, prefs } = app;
    const env = makeEnv(state, prefs, opts.pointKind);
    const runner = new Runner(nodes, env);
    const weather = weatherFor(state.time.day);
    const reduced = prefs.reduceMotion === true || matchMedia('(prefers-reduced-motion: reduce)').matches;

    // --- layout
    const bgHost = h('div', { class: 'scene-bg' });
    const actors = h('div', { class: 'actors' });
    const nameEl = h('div', { class: 'nametag' });
    const textEl = h('p', { class: 'dlg-text selectable' });
    const more = h('span', { class: 'more', 'aria-hidden': 'true' }, '▼');
    const live = h('div', { class: 'sr', 'aria-live': 'polite' });
    const dlg = h('div', { class: 'dlg', role: 'button', tabindex: '0', 'aria-label': 'Continue' }, nameEl, textEl, more);
    const choicesEl = h('div', { class: 'choices' });
    const fxEl = h('div', { class: 'fxlist', 'aria-hidden': 'true' });
    const titleEl = h('div', { class: 'titlecard', hidden: true });
    const logBtn = h('button', { class: 'icon-btn small', type: 'button', 'aria-label': 'Show conversation log' }, icon('list', 18));
    const skipBtn = h('button', { class: 'chip skip', type: 'button', 'aria-pressed': 'false' }, 'Skip ▸▸');
    const top = h('div', { class: 'scene-top' }, logBtn, skipBtn);
    const layer = h('div', { class: 'layer scene', dataset: { mood: 'idle' } }, bgHost, actors, dlg, choicesEl, fxEl, top, titleEl, live);
    const remove = app.layer(layer);

    // --- state
    const log = [];
    const stage = new Map(); // who -> { el, wrap, side, mood }
    let advanceResolve = null;
    let typing = null;
    let skipping = false;
    let done = false;
    let currentBg = null;

    function setBg(loc) {
      if (!loc || loc === currentBg) return;
      currentBg = loc;
      const el = h('div', { class: 'bg backdrop' });
      el.innerHTML = backdropSVG(loc, { slot: state.time.slot, weather });
      el.style.opacity = '0';
      bgHost.append(el);
      requestAnimationFrame(() => { el.style.opacity = '1'; });
      setTimeout(() => { while (bgHost.children.length > 1) bgHost.firstChild.remove(); }, 650);
    }

    function place(who, mood, side) {
      const look = lookOf(who);
      if (!look) return null;
      let a = stage.get(who);
      if (!a) {
        const others = [...stage.values()];
        const chosen = side || (others.length === 0 ? 'center' : others.some((o) => o.side === 'left') ? 'right' : 'left');
        const p = h('div', { class: 'portrait' });
        const wrap = h('div', { class: `actor ${chosen}`, dataset: { who } }, p);
        actors.append(wrap);
        a = { el: p, wrap, side: chosen, mood: '' };
        stage.set(who, a);
        requestAnimationFrame(() => wrap.classList.add('in'));
      } else if (side && side !== a.side) {
        a.wrap.classList.remove(a.side);
        a.wrap.classList.add(side);
        a.side = side;
      }
      if (mood && mood !== a.mood) {
        a.mood = mood;
        a.el.innerHTML = portraitSVG(look, mood);
      }
      actors.classList.toggle('duo', stage.size > 1);
      return a;
    }

    function unplace(who) {
      const a = stage.get(who);
      if (!a) return;
      a.wrap.classList.remove('in');
      stage.delete(who);
      setTimeout(() => a.wrap.remove(), 350);
      actors.classList.toggle('duo', stage.size > 1);
    }

    function highlight(who) {
      for (const [id, a] of stage) {
        a.wrap.classList.toggle('speaking', id === who);
        a.wrap.classList.toggle('dim', who && id !== who);
        a.el.classList.remove('talking');
      }
    }

    // --- input
    function advance() {
      if (typing) { typing.finish(); return; }
      if (advanceResolve) { const r = advanceResolve; advanceResolve = null; app.audio.play('tap'); r(); }
    }
    const onKey = (e) => {
      if (done || app.hasSheet()) return;
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight') {
        if (choicesEl.childElementCount) return;
        e.preventDefault();
        advance();
      } else if (/^[1-9]$/.test(e.key)) {
        const btn = choicesEl.querySelectorAll('button')[Number(e.key) - 1];
        if (btn && !btn.disabled) btn.click();
      } else if (e.key === 'l' || e.key === 'L') {
        openLog();
      }
    };
    document.addEventListener('keydown', onKey);
    dlg.addEventListener('click', advance);
    dlg.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); advance(); } });
    actors.addEventListener('click', advance);
    skipBtn.addEventListener('click', () => {
      skipping = !skipping;
      skipBtn.setAttribute('aria-pressed', String(skipping));
      skipBtn.classList.toggle('on', skipping);
      if (skipping) advance();
    });
    logBtn.addEventListener('click', openLog);

    function openLog() {
      app.sheet({
        title: 'Conversation log',
        ico: 'list',
        build(body) {
          if (!log.length) body.append(h('p', { class: 'muted' }, 'Nothing yet.'));
          for (const l of log) {
            body.append(h('div', { class: `logline${l.who === 'you' ? ' me' : ''}` },
              l.who ? h('b', { style: { color: colorOf(l.who) } }, nameOf(l.who, state)) : null,
              h('p', { class: 'selectable' }, l.text)));
          }
          requestAnimationFrame(() => { body.scrollTop = body.scrollHeight; });
        },
      });
    }

    // --- presentation
    function typeText(text) {
      return new Promise((res) => {
        const speed = reduced ? 0 : SPEED_MS[prefs.textSpeed] ?? 20;
        textEl.textContent = '';
        if (speed === 0 || skipping) {
          textEl.textContent = text;
          typing = null;
          res();
          return;
        }
        let i = 0;
        let last = performance.now();
        let raf = 0;
        const step = (now) => {
          const n = Math.floor((now - last) / speed);
          if (n > 0) {
            last = now;
            i = Math.min(text.length, i + n);
            textEl.textContent = text.slice(0, i);
            if (i % 3 === 0) app.audio.play('text');
          }
          if (i >= text.length) { typing = null; res(); } else raf = requestAnimationFrame(step);
        };
        typing = { finish: () => { cancelAnimationFrame(raf); textEl.textContent = text; typing = null; res(); } };
        raf = requestAnimationFrame(step);
      });
    }

    async function line(who, text, { mood, narr = false } = {}) {
      log.push({ who: narr ? '' : who, text });
      live.textContent = narr ? text : `${nameOf(who, state)}: ${text}`;
      dlg.classList.toggle('narr', narr);
      dlg.classList.toggle('me', who === 'you');
      more.style.visibility = 'hidden';
      if (narr) {
        nameEl.textContent = '';
        nameEl.style.display = 'none';
        highlight(null);
      } else {
        nameEl.style.display = '';
        nameEl.textContent = nameOf(who, state);
        nameEl.style.setProperty('--c', colorOf(who));
        nameEl.classList.toggle('right', who === 'you');
        if (who === 'you') {
          highlight(null);
        } else {
          const a = place(who, mood);
          highlight(a ? who : null);
          a?.el.classList.add('talking');
        }
      }
      await typeText(text);
      for (const a of stage.values()) a.el.classList.remove('talking');
      more.style.visibility = 'visible';
      if (skipping) { await wait(90); return; }
      await new Promise((r) => { advanceResolve = r; });
    }

    async function titleCard(text, sub) {
      titleEl.hidden = false;
      titleEl.replaceChildren(h('h1', null, text), sub ? h('p', null, sub) : null);
      titleEl.classList.add('show');
      app.audio.play('bell');
      await Promise.race([new Promise((r) => { advanceResolve = r; titleEl.onclick = () => advance(); }), wait(reduced ? 1400 : 3200)]);
      advanceResolve = null;
      titleEl.classList.remove('show');
      await wait(reduced ? 0 : 450);
      titleEl.hidden = true;
    }

    function chooseOption(step) {
      return new Promise((res) => {
        more.style.visibility = 'hidden';
        layer.classList.add('choosing');
        skipping = false;
        skipBtn.classList.remove('on');
        skipBtn.setAttribute('aria-pressed', 'false');
        if (step.prompt) { textEl.textContent = step.prompt; nameEl.style.display = 'none'; }
        choicesEl.replaceChildren(
          ...step.options.map((o, n) =>
            h('button',
              {
                class: `choice${o.locked ? ' locked' : ''}`,
                type: 'button',
                disabled: o.locked,
                onclick: () => {
                  app.audio.play('select');
                  choicesEl.replaceChildren();
                  layer.classList.remove('choosing');
                  res(o.idx);
                },
              },
              h('span', { class: 'n' }, String(n + 1)),
              h('span', { class: 't' }, o.text),
              o.locked ? h('span', { class: 'lockhint' }, icon('lock', 14), ' ', o.hint) : null)),
        );
        choicesEl.querySelector('button:not([disabled])')?.focus({ preventScroll: true });
      });
    }

    function floater(html, kind) {
      const el = h('div', { class: `fx ${kind}` }, ...html);
      fxEl.append(el);
      setTimeout(() => el.remove(), 2600);
    }

    async function showFx(step) {
      if (step.kind === 'pts') {
        floater([icon('heart', 16), ` ${nameOf(step.id, state)} `, h('b', null, `+${step.n}`)], 'love');
        app.audio.play('select');
      } else if (step.kind === 'stat') {
        floater([icon('sparkle', 16), ` ${STAT_INFO[step.name].label} `, h('b', null, `+${step.n}`), step.levelUp ? ` Lv ${step.level}!` : ''], step.levelUp ? 'up' : 'stat');
        app.audio.play(step.levelUp ? 'levelup' : 'select');
      } else if (step.kind === 'money') {
        floater([icon('coin', 16), h('b', null, ` ${step.n > 0 ? '+' : '-'}$${Math.abs(step.n)}`)], 'money');
        app.audio.play('coin');
      } else if (step.kind === 'item') {
        if (step.n !== 0) floater([icon('gift', 16), ` ${ITEM_BY_ID[step.id]?.name ?? step.id}`], 'stat');
      } else if (step.kind === 'rank') {
        const c = CHAR_BY_ID[step.id];
        if (!c) return;
        app.audio.play('rankup');
        const card = h('div', { class: 'rankup', role: 'dialog', 'aria-label': `${c.first} rank up`, tabindex: '0' },
          h('div', { class: 'ru-inner' },
            h('small', null, 'BOND DEEPENED'),
            h('div', { class: 'ru-face portrait', style: { '--c': c.color } }),
            h('h2', null, c.name),
            h('p', null, `Rank ${step.rank}: ${rankName(step.rank)}`),
            h('span', { class: 'hint' }, 'Tap to continue')));
        card.querySelector('.ru-face').innerHTML = portraitSVG(c.look, 'happy', { crop: true });
        layer.append(card);
        card.focus({ preventScroll: true });
        await new Promise((r) => {
          card.addEventListener('click', r, { once: true });
          card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') r(); }, { once: true });
          if (skipping) setTimeout(r, 400);
        });
        card.remove();
      }
    }

    async function run() {
      setBg(opts.initialBg || state.loc);
      await wait(reduced ? 0 : 250);
      try {
        for (;;) {
          const step = runner.next();
          if (step.t === 'end') break;
          switch (step.t) {
            case 'bg': setBg(step.loc); if (!skipping) await wait(reduced ? 0 : 450); break;
            case 'show': place(step.who, step.mood, step.side); break;
            case 'hide': unplace(step.who); break;
            case 'clear': for (const id of [...stage.keys()]) unplace(id); break;
            case 'sfx': app.audio.play(step.name); break;
            case 'title': await titleCard(step.text, step.sub); break;
            case 'fx': await showFx(step); break;
            case 'narr': await line('', step.text, { narr: true }); break;
            case 'say': await line(step.who, step.text, { mood: step.mood }); break;
            case 'choice': runner.choose(await chooseOption(step)); break;
            default: break;
          }
        }
      } catch (err) {
        console.error(err);
        app.toast('Something went wrong in that scene. Your progress is saved.', { kind: 'bad' });
      }
      finish();
    }

    function finish() {
      if (done) return;
      done = true;
      document.removeEventListener('keydown', onKey);
      layer.classList.add('leaving');
      setTimeout(() => { remove(); resolve({ log }); }, reduced ? 0 : 320);
    }

    run();
  });
}
