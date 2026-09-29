// The main screen: HUD, city map, and the panel for wherever you are.
// It is also the game's traffic controller: every action that spends time goes through
// perform(), which plays the scene, moves the clock, then checks for story beats.

import { h, clear } from './dom.js';
import { icon, WEATHER_ICON, SLOT_ICON } from './icons.js';
import { createMap } from './map.js';
import { playScript } from './scene.js';
import { openPhone } from './phone.js';
import { openJournal } from './journal.js';
import { openYou } from './you.js';
import { openSettings } from './settings.js';
import { showDayEnd } from './dayend.js';
import { portraitSVG } from '../art/portrait.js';
import { backdropSVG } from '../art/backdrop.js';
import { SLOTS, weekdayName, weatherFor, daysUntilFestival, FESTIVAL_DAY } from '../core/clock.js';
import {
  whoIsAt, goTo, canGo, passSlots, sleep, dueBeat, beginBeat, finishBeat, availableScene, startRankScene, startHangout,
  startGift, canGift, buyItem, activitiesHere, startActivity, makeEnv,
} from '../core/game.js';
import { rankName, bondProgress, nextSceneNumber, pointsForNext, DAILY_CAPS } from '../core/bond.js';
import { unreadCount, friendName } from '../core/phone.js';
import { LOCATION_BY_ID } from '../data/locations.js';
import { CHAR_BY_ID } from '../data/characters/index.js';
import { ITEMS, ITEM_BY_ID } from '../data/items.js';
import { narr, bg } from '../core/dsl.js';
import { aiReady } from '../core/prefs.js';

const WEATHER_LABEL = { clear: 'Clear', cloudy: 'Cloudy', rain: 'Rain', fog: 'Fog' };

function hoursLabel(open) {
  if (open.length === 4) return 'Always open';
  return `Open ${open.map((s) => SLOTS[s].toLowerCase()).join(', ')}`;
}

export function mountHub(app) {
  let busy = false;
  const { state } = app;

  // ---- static shell
  const dayEl = h('div', { class: 'hud-day' });
  const slotEl = h('div', { class: 'hud-slot' });
  const festEl = h('div', { class: 'hud-fest' });
  const moneyEl = h('span', { class: 'chip gold' });
  const phoneBadge = h('span', { class: 'badge', hidden: true });

  const btn = (label, ico, onclick, extra) =>
    h('button', { class: 'nav-btn', type: 'button', 'aria-label': label, onclick: () => { app.audio.play('tap'); onclick(); } }, icon(ico, 22), h('span', null, label), extra);

  const navPhone = btn('Phone', 'phone', () => openPhone(app, { onChange: refresh }), phoneBadge);
  const nav = h('nav', { class: 'nav', 'aria-label': 'Menu' },
    btn('Map', 'map', () => { placeEl.scrollTo?.({ top: 0 }); mainEl.scrollTo?.({ top: 0, behavior: 'smooth' }); }),
    navPhone,
    btn('Friends', 'heart', () => openJournal(app)),
    btn('You', 'user', () => openYou(app)),
    btn('Menu', 'gear', () => openSettings(app, { onChange: refresh, onQuit: () => app.quitToTitle?.() })));

  const hud = h('header', { class: 'hud' },
    h('div', { class: 'hud-time' }, dayEl, slotEl),
    festEl,
    h('div', { class: 'hud-right' }, moneyEl));

  const map = createMap(app, (loc) => go(loc));
  const placeEl = h('section', { class: 'place', 'aria-live': 'polite' });
  const mainEl = h('main', { class: 'hub-main' }, h('div', { class: 'map-card' }, map.el), placeEl);
  const root = h('div', { class: 'layer hub' }, hud, mainEl, nav);
  app.root.insertBefore(root, app.root.firstChild);

  // ---- rendering
  function refresh() {
    const t = state.time;
    const w = weatherFor(t.day);
    dayEl.textContent = `Day ${t.day} · ${weekdayName(t.day).slice(0, 3)}`;
    slotEl.replaceChildren(icon(SLOT_ICON[t.slot], 16), ` ${SLOTS[t.slot]} `, icon(WEATHER_ICON[w], 16), ` ${WEATHER_LABEL[w]}`);
    const left = daysUntilFestival(t.day);
    festEl.textContent = state.done ? 'Story complete. Keep going.' : t.day > FESTIVAL_DAY ? '' : left === 0 ? 'The Lantern Festival is tonight' : `${left} day${left === 1 ? '' : 's'} to the Lantern Festival`;
    moneyEl.replaceChildren(icon('coin', 16), ` $${state.player.money}`);
    const unread = unreadCount(state);
    phoneBadge.hidden = unread === 0;
    phoneBadge.textContent = String(unread);
    map.update();
    renderPlace();
  }

  function avatar(id) {
    const c = CHAR_BY_ID[id];
    const el = h('div', { class: 'avatar portrait', style: { '--c': c.color } });
    el.innerHTML = portraitSVG(c.look, state.bonds[id].rank >= 1 ? 'happy' : 'neutral', { crop: true });
    if (state.bonds[id].rank < 1) el.classList.add('unmet');
    return el;
  }

  function friendCard(id, env) {
    const c = CHAR_BY_ID[id];
    const b = state.bonds[id];
    const met = b.rank >= 1;
    const scene = availableScene(state, id, env);
    const n = nextSceneNumber(state, id);
    const need = n ? pointsForNext(state, id) - b.pts : 0;
    let status;
    if (!met) status = scene ? 'You have not met yet. They look interesting.' : 'Someone you have not met. Try again at another time.';
    else if (scene) status = 'Ready to talk. Something is on their mind.';
    else if (n && need > 0) status = `${need} more to go until a deeper talk`;
    else if (n) status = 'Talk here, in their usual spot, at another time';
    else status = 'A friend for the long haul';

    const actions = [];
    if (!met) {
      if (scene) actions.push(h('button', { class: 'btn primary small', type: 'button', onclick: () => hangout(id) }, icon('sparkle', 16), 'Say hello'));
    } else {
      actions.push(h('button', { class: `btn small ${scene ? 'primary' : 'amber'}`, type: 'button', onclick: () => hangout(id) }, icon(scene ? 'heart' : 'chat', 16), scene ? 'Talk' : 'Hang out'));
      if (app.prefs.ai.enabled) actions.push(h('button', { class: 'btn small teal', type: 'button', onclick: () => openTalk(id) }, icon('chat', 16), 'Chat freely'));
      if (canGift(state, id)) actions.push(h('button', { class: 'btn small ghost', type: 'button', onclick: () => openGift(id) }, icon('gift', 16), 'Gift'));
    }

    return h('div', { class: `friend${scene ? ' ready' : ''}${met ? '' : ' unmet'}` },
      avatar(id),
      h('div', { class: 'f-main' },
        h('div', { class: 'f-name' }, met ? c.name : 'Someone new', met ? h('span', { class: 'chip' }, rankName(b.rank)) : null),
        h('div', { class: 'f-status faint' }, status),
        met && n ? h('div', { class: 'bar', role: 'progressbar', 'aria-valuenow': Math.round(bondProgress(state, id) * 100), 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-label': `${c.first} bond progress` }, h('i', { style: { '--p': `${Math.round(bondProgress(state, id) * 100)}%` } })) : null,
        actions.length ? h('div', { class: 'f-actions' }, actions) : null));
  }

  function renderPlace() {
    const loc = LOCATION_BY_ID[state.loc];
    const env = makeEnv(state, app.prefs);
    const w = weatherFor(state.time.day);
    const banner = h('div', { class: 'place-banner backdrop' });
    banner.innerHTML = backdropSVG(loc.id, { slot: state.time.slot, weather: w });
    banner.append(h('div', { class: 'place-title' }, h('h2', null, loc.name), h('span', { class: 'chip' }, hoursLabel(loc.open))));

    const here = whoIsAt(state, loc.id);
    const sections = [banner, h('p', { class: 'blurb muted' }, loc.blurb)];

    if (!state.flags.tut_hub && state.beats.includes('arrival')) {
      sections.push(h('div', { class: 'note' },
        h('b', null, 'How this works: '),
        'Tap a place on the map (free), then choose something to do. Each activity or hangout takes a time slot: morning, afternoon, evening, night. Friends keep their own routines, so check the map for who is around. ',
        h('div', { style: { marginTop: '0.6rem' } }, h('button', { class: 'btn small amber', type: 'button', onclick: () => { state.flags.tut_hub = true; app.save(); renderPlace(); } }, 'Got it'))));
    }

    sections.push(h('h3', null, 'Here now'));
    if (here.length) sections.push(...here.map((id) => friendCard(id, env)));
    else sections.push(h('p', { class: 'faint' }, 'Nobody you know right now. It is still worth being here.'));

    // things to do
    const things = [];
    for (const a of activitiesHere(state, env)) {
      things.push(h('button', { class: 'thing', type: 'button', disabled: Boolean(a.reason), onclick: () => doActivity(a.id) },
        h('span', { class: 'th-main' }, h('b', null, a.label), h('small', null, a.reason || a.desc)),
        h('span', { class: 'chip' }, '1 slot')));
    }
    for (const item of ITEMS.filter((i) => i.shop === loc.id)) {
      const have = state.inv[item.id] || 0;
      things.push(h('button', { class: 'thing shop', type: 'button', disabled: state.player.money < item.price, onclick: () => buy(item.id) },
        h('span', { class: 'th-main' }, h('b', null, item.name), h('small', null, item.blurb + (have ? `  (you have ${have})` : ''))),
        h('span', { class: 'chip gold' }, icon('coin', 14), ` $${item.price}`)));
    }
    if (loc.id === 'home') {
      things.push(h('button', { class: 'thing', type: 'button', onclick: () => rest() },
        h('span', { class: 'th-main' }, h('b', null, 'Take it easy'), h('small', null, 'Let an hour or three slide past.')), h('span', { class: 'chip' }, '1 slot')));
      things.push(h('button', { class: 'thing', type: 'button', onclick: () => sleepNow() },
        h('span', { class: 'th-main' }, h('b', null, 'Sleep until morning'), h('small', null, state.time.slot === 3 ? 'End the day.' : 'Skip the rest of today.')), icon('moon', 18)));
    }
    if (things.length) sections.push(h('h3', null, 'Things to do'), h('div', { class: 'things' }, things));
    else if (!here.length) sections.push(h('p', { class: 'faint' }, 'Nothing to do here right now. Try the map.'));

    clear(placeEl);
    placeEl.append(...sections);
  }

  // ---- movement and actions
  function go(locId) {
    if (busy) return;
    if (!canGo(state, locId)) {
      app.toast(`${LOCATION_BY_ID[locId].name} is closed right now.`, { ico: 'lock' });
      return;
    }
    app.audio.play('select');
    goTo(state, locId);
    app.save();
    refresh();
    placeEl.scrollIntoView?.({ block: 'start', behavior: 'smooth' });
  }

  async function perform({ nodes, cost = 1, pointKind = 'hangout' }) {
    if (busy) return;
    busy = true;
    root.classList.add('busy');
    try {
      await playScript(app, nodes, { pointKind });
      const r = passSlots(state, cost);
      app.save();
      await afterTime(r);
    } catch (err) {
      console.error(err);
      app.toast('Something went wrong. Your game is safe.', { kind: 'bad' });
    } finally {
      busy = false;
      root.classList.remove('busy');
      refresh();
    }
  }

  async function afterTime(r) {
    if (r.newDay) await showDayEnd(app, r);
    if (r.bounced) app.toast('That place has closed for now. You head home.', { ico: 'home' });
    notifyTexts(r.texted);
    await runBeats();
  }

  function notifyTexts(ids) {
    const unique = [...new Set(ids)];
    if (!unique.length) return;
    const names = unique.slice(0, 2).map(friendName).join(' and ');
    app.toast(`${names}${unique.length > 2 ? ' and others' : ''} texted you`, { ico: 'chat' });
    app.audio.play('bell');
  }

  async function runBeats() {
    for (let beat = dueBeat(state); beat; beat = dueBeat(state)) {
      const env = makeEnv(state, app.prefs, 'scene');
      const nodes = beginBeat(state, beat, env);
      app.save();
      await playScript(app, nodes, { pointKind: 'scene', initialBg: 'home' });
      const r = finishBeat(state, beat);
      app.save();
      if (r.newDay) await showDayEnd(app, r);
      notifyTexts(r.texted);
      refresh();
    }
  }

  function hangout(id) {
    const env = makeEnv(state, app.prefs);
    const sceneAct = startRankScene(state, id, env);
    if (sceneAct) return perform({ nodes: sceneAct.nodes, cost: 1, pointKind: 'scene' });
    const act = startHangout(state, id);
    return perform({ nodes: act.nodes, cost: 1, pointKind: 'hangout' });
  }

  function doActivity(id) {
    const act = startActivity(state, id, makeEnv(state, app.prefs));
    if (act) perform({ nodes: act.nodes, cost: 1, pointKind: 'hangout' });
  }

  function rest() {
    const lines = [
      'You put on a record you half remember, and watch the light move across the ceiling.',
      'You stare out of the window at the street. It is a good window.',
      'You drink a glass of water and do nothing on purpose. It is harder than it sounds.',
    ];
    perform({ nodes: [bg('home'), narr(lines[(state.time.day + state.time.slot) % lines.length])], cost: 1 });
  }

  async function sleepNow() {
    if (busy) return;
    busy = true;
    try {
      await playScript(app, [bg('home'), narr('You turn the lamp off. The laundromat hums below you like a very large cat.')], {});
      const r = sleep(state);
      app.save();
      await afterTime(r);
    } finally {
      busy = false;
      refresh();
    }
  }

  function buy(itemId) {
    const r = buyItem(state, itemId);
    if (!r.ok) { app.toast(r.reason, { kind: 'bad' }); return; }
    app.audio.play('coin');
    app.toast(`Bought ${ITEM_BY_ID[itemId].name}`, { ico: 'gift' });
    app.save();
    refresh();
  }

  function openGift(id) {
    const b = state.bonds[id];
    if ((b.daily.day === state.time.day ? b.daily.gift : 0) >= DAILY_CAPS.gift) {
      app.toast(`${CHAR_BY_ID[id].first} has had enough surprises for today.`, { ico: 'gift' });
      return;
    }
    app.sheet({
      title: `Give ${CHAR_BY_ID[id].first} something`,
      ico: 'gift',
      short: true,
      build(body, ctl) {
        const items = Object.entries(state.inv).filter(([, n]) => n > 0);
        if (!items.length) body.append(h('p', { class: 'muted' }, 'You have nothing to give. Shops sell small things.'));
        const known = b.known.map((k) => k.replace(':', ' '));
        if (known.length) body.append(h('p', { class: 'faint' }, `You have noticed: ${known.join(', ')}.`));
        for (const [itemId, count] of items) {
          const item = ITEM_BY_ID[itemId];
          body.append(h('button', {
            class: 'thing', type: 'button',
            onclick: async () => {
              const act = startGift(state, id, itemId);
              ctl.close();
              if (!act) return;
              busy = true;
              try {
                await playScript(app, act.nodes, { pointKind: 'gift' });
                app.save();
              } finally { busy = false; refresh(); }
            },
          }, h('span', { class: 'th-main' }, h('b', null, item.name), h('small', null, item.blurb)), h('span', { class: 'chip' }, `x${count}`)));
        }
      },
    });
  }

  function openTalk(id) {
    if (!aiReady(app.prefs)) {
      app.toast('Finish the AI setup first (Menu, AI).', { ico: 'gear' });
      openSettings(app, { tab: 'ai', onChange: refresh });
      return;
    }
    if (app.startTalk) {
      busy = true;
      app.startTalk(id).then(async (result) => {
        if (result?.spentSlot) {
          const r = passSlots(state, 1);
          app.save();
          await afterTime(r);
        }
      }).finally(() => { busy = false; refresh(); });
    }
  }

  app.hub = { refresh, runBeats, perform: (...a) => perform(...a), destroy: () => root.remove() };
  refresh();
  return app.hub;
}
