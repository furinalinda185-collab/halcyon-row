// The app context: shared state, preferences, layers, sheets and toasts.
// Screens receive `app` and never reach for globals.

import { loadPrefs, savePrefs } from '../core/prefs.js';
import { saveGame, getStorage } from '../core/state.js';
import { audio } from '../audio/audio.js';
import { h, clear } from './dom.js';
import { icon } from './icons.js';

export function createApp(root) {
  const storage = getStorage();
  const sheets = [];
  const toasts = h('div', { class: 'toasts', 'aria-live': 'polite' });
  root.append(toasts);

  const app = {
    root,
    storage,
    prefs: loadPrefs(storage),
    state: null,
    audio,
    ai: null, // set by main.js once the AI client is built

    save() {
      if (!app.state) return;
      try {
        saveGame(app.state, storage);
      } catch {
        app.toast('Could not save. Storage may be full or blocked.', { kind: 'bad' });
      }
    },

    savePrefs() {
      try {
        savePrefs(app.prefs, storage);
      } catch {
        app.toast('Could not save settings.', { kind: 'bad' });
      }
      applyPrefs(app);
    },

    toast(text, { kind = '', ico = '', ms = 2600 } = {}) {
      const el = h('div', { class: `toast ${kind}`, role: 'status' }, ico ? icon(ico, 18) : null, h('span', null, text));
      toasts.append(el);
      while (toasts.children.length > 4) toasts.firstChild.remove();
      setTimeout(() => {
        el.classList.add('leaving');
        setTimeout(() => el.remove(), 260);
      }, ms);
      return el;
    },

    /** Adds a full screen layer above whatever is showing. Returns a remover. */
    layer(el) {
      root.insertBefore(el, toasts);
      return () => el.remove();
    },

    /**
     * Opens a bottom sheet (a centered dialog on big screens).
     * build(body, ctl) fills it. Returns a controller with close().
     */
    sheet({ title, ico = '', build, onClose, short = false, flush = false }) {
      const body = h('div', { class: `body${flush ? ' flush' : ''}` });
      const titleEl = h('h2', null, title);
      const ctl = {
        body,
        setTitle: (t) => { titleEl.textContent = t; },
        close: () => {
          if (!wrap.isConnected) return;
          wrap.remove();
          const i = sheets.indexOf(ctl);
          if (i >= 0) sheets.splice(i, 1);
          onClose?.();
        },
      };
      const closeBtn = h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Close', onclick: () => { audio.play('tap'); ctl.close(); } }, icon('close'));
      const wrap = h(
        'div',
        { class: 'sheet-wrap', role: 'dialog', 'aria-modal': 'true', 'aria-label': title, onclick: (e) => { if (e.target === wrap) ctl.close(); } },
        h('div', { class: `sheet${short ? ' short' : ''}` }, h('header', null, ico ? icon(ico, 22) : null, titleEl, closeBtn), body),
      );
      sheets.push(ctl);
      root.insertBefore(wrap, toasts);
      build(body, ctl);
      closeBtn.focus({ preventScroll: true });
      return ctl;
    },

    closeSheets() {
      for (const s of [...sheets]) s.close();
    },
    hasSheet: () => sheets.length > 0,
  };

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sheets.length) sheets[sheets.length - 1].close();
  });

  // First tap unlocks audio (browsers require a gesture).
  const unlock = () => {
    audio.init();
    audio.resume();
    audio.setEnabled(app.prefs.sound);
  };
  document.addEventListener('pointerdown', unlock, { once: true });
  document.addEventListener('keydown', unlock, { once: true });

  trackViewport();
  applyPrefs(app);
  return app;
}

export function applyPrefs(app) {
  const p = app.prefs;
  document.documentElement.style.setProperty('--text-scale', String(p.textSize));
  document.body.classList.toggle('reduce-motion', p.reduceMotion === true);
  app.audio.setEnabled(p.sound);
}

/** Keeps --vvh / --vvt in step with the visual viewport (on screen keyboards, browser bars). */
function trackViewport() {
  const vv = globalThis.visualViewport;
  const root = document.documentElement;
  const update = () => {
    const height = vv ? vv.height : window.innerHeight;
    root.style.setProperty('--vvh', `${Math.round(height)}px`);
    root.style.setProperty('--vvt', `${Math.round(vv ? vv.offsetTop : 0)}px`);
  };
  update();
  vv?.addEventListener('resize', update);
  vv?.addEventListener('scroll', update);
  window.addEventListener('resize', update);
}

export function emptyState(text, sub = '') {
  return h('div', { class: 'empty' }, h('p', null, text), sub ? h('p', { class: 'faint' }, sub) : null);
}

export { clear };
