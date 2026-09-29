// Menu: game options, AI text mode setup, and save management.

import { h, clear } from './dom.js';
import { icon } from './icons.js';
import { exportGame, importGame, deleteSave } from '../core/state.js';
import { DEFAULT_OPENAI_BASE, DEFAULT_OPENCODE_BASE, aiReady } from '../core/prefs.js';

const PRESETS = [
  ['OpenAI', DEFAULT_OPENAI_BASE],
  ['OpenRouter', 'https://openrouter.ai/api/v1'],
  ['Ollama (this computer)', 'http://localhost:11434/v1'],
  ['LM Studio (this computer)', 'http://localhost:1234/v1'],
];

function switchRow(label, sub, checked, onchange) {
  const input = h('input', { type: 'checkbox', role: 'switch' });
  input.checked = checked;
  input.addEventListener('change', () => onchange(input.checked, input));
  return h('label', { class: 'switch' }, h('span', { class: 'txt' }, h('b', null, label), sub ? h('span', null, sub) : null), input, h('span', { class: 'track' }));
}

function segRow(label, options, value, onchange) {
  const seg = h('div', { class: 'seg', role: 'group', 'aria-label': label });
  const draw = (v) => {
    clear(seg);
    seg.append(...options.map(([id, text]) => h('button', { type: 'button', 'aria-pressed': String(id === v), onclick: () => { onchange(id); draw(id); } }, text)));
  };
  draw(value);
  return h('div', { class: 'field' }, h('span', { class: 'label' }, label), seg);
}

export function openSettings(app, { tab = 'game', onChange, onQuit } = {}) {
  const p = app.prefs;
  let current = tab;
  const change = () => { app.savePrefs(); onChange?.(); };

  app.sheet({
    title: 'Menu',
    ico: 'gear',
    onClose: () => { app.save(); onChange?.(); },
    build(body) {
      const tabs = h('div', { class: 'seg tabs', role: 'tablist' });
      const pane = h('div', { class: 'pane' });
      body.append(tabs, pane);
      const draw = () => {
        clear(tabs);
        tabs.append(...[['game', 'Game'], ['ai', 'AI text mode'], ['data', 'Saves']].map(([id, text]) =>
          h('button', { type: 'button', role: 'tab', 'aria-selected': String(id === current), onclick: () => { current = id; draw(); } }, text)));
        clear(pane);
        if (current === 'game') renderGame(pane);
        else if (current === 'ai') renderAI(pane);
        else renderData(pane);
      };
      draw();
    },
  });

  // ------------------------------------------------------------ game tab
  function renderGame(pane) {
    pane.append(
      segRow('Text speed', [['slow', 'Slow'], ['normal', 'Normal'], ['fast', 'Fast'], ['instant', 'Instant']], p.textSpeed, (v) => { p.textSpeed = v; change(); }),
      h('div', { class: 'field' },
        h('label', { for: 'ts' }, `Text size (${Math.round(p.textSize * 100)}%)`),
        (() => {
          const r = h('input', { id: 'ts', type: 'range', min: '0.9', max: '1.35', step: '0.05', value: String(p.textSize) });
          r.addEventListener('input', () => { p.textSize = Number(r.value); change(); r.previousSibling.textContent = `Text size (${Math.round(p.textSize * 100)}%)`; });
          return r;
        })()),
      switchRow('Sound effects', 'Soft blips, chimes and bells.', p.sound, (v) => { p.sound = v; change(); if (v) { app.audio.init(); app.audio.play('confirm'); } }),
      switchRow('Ambient music', 'A quiet generated bed. Off by default.', p.ambient, (v) => {
        p.ambient = v; change(); app.audio.init(); app.audio.ambient(v && p.sound);
      }),
      switchRow('Reduce motion', 'Turns off blinking, swaying and screen transitions.', p.reduceMotion === true, (v) => { p.reduceMotion = v; change(); }),
      switchRow('Gentle nudges', 'Friends occasionally suggest sleep, water or seeing other people.', p.gentleNudges, (v) => { p.gentleNudges = v; change(); }),
      h('h3', null, 'Romance'),
      h('p', { class: 'muted small' }, 'Every friendship stands on its own. If you turn this on, four of the six friends can also grow into something romantic, as an option, never a requirement. Content stays gentle and non explicit. For adults only.'),
      switchRow('Enable romance storylines', 'Off by default. You can change your mind later.', p.romanceEnabled, (v, input) => {
        if (v && !p.adultConfirmed) {
          input.checked = false;
          confirmAdult(() => { p.adultConfirmed = true; p.romanceEnabled = true; change(); input.checked = true; });
          return;
        }
        p.romanceEnabled = v;
        change();
      }),
    );
  }

  function confirmAdult(onYes) {
    app.sheet({
      title: 'Adults only',
      ico: 'heart',
      short: true,
      build(body, ctl) {
        const box = h('input', { type: 'checkbox', id: 'adult' });
        const go = h('button', { class: 'btn primary block', type: 'button', disabled: true, onclick: () => { ctl.close(); onYes(); } }, 'Turn on romance');
        box.addEventListener('change', () => { go.disabled = !box.checked; });
        body.append(
          h('p', null, 'Romance storylines are written for adults. Please confirm you are 18 or older.'),
          h('label', { class: 'switch' }, h('span', { class: 'txt' }, h('b', null, 'I am 18 or older')), box, h('span', { class: 'track' })),
          go);
      },
    });
  }

  // -------------------------------------------------------------- AI tab
  function renderAI(pane) {
    const a = p.ai;
    const rerender = () => { clear(pane); renderAI(pane); };
    const status = h('div', { class: 'note', role: 'status' }, 'Checking for the local game server...');
    const testOut = h('div', { class: 'aiout', role: 'status', 'aria-live': 'polite' });

    pane.append(
      h('div', { class: 'note' },
        h('b', null, 'What this does. '),
        'Story mode is fully scripted and works offline. AI text mode lets you type anything to a friend and get an in character reply. Your messages, plus a short description of the friend and your history with them, are sent to the provider you choose. Nothing else leaves your device.'),
      switchRow('Turn on AI text mode', 'Adds "Chat freely" to hangouts and a typing box to the phone.', a.enabled, (v) => { a.enabled = v; change(); rerender(); }),
    );
    if (!a.enabled) return;

    pane.append(
      segRow('Provider', [['openai', 'ChatGPT models (OpenAI)'], ['opencode', 'OpenCode']], a.provider, (v) => { a.provider = v; change(); rerender(); }),
      h('div', { class: 'note' },
        a.provider === 'openai'
          ? [h('b', null, 'About ChatGPT. '), 'The ChatGPT app itself has no public connection. To use ChatGPT models here you need an OpenAI API key, which is billed separately from a ChatGPT subscription. The same option also works with any service that speaks the same protocol, such as OpenRouter, Ollama or LM Studio.']
          : [h('b', null, 'About OpenCode. '), 'Run "opencode serve" on your computer. OpenCode can be signed in to a ChatGPT Plus or Pro plan (choose ChatGPT Plus/Pro in its /connect menu) or to many other providers, so this is the way to use a ChatGPT subscription rather than an API key. Start it with --cors <this page\'s address> if you connect directly. See the README for the tool free "halcyon" agent that gives the best roleplay.']),
      status,
      segRow('How to connect', [['direct', 'Directly from this browser'], ['server', 'Through the game server']], a.via, (v) => { a.via = v; change(); rerender(); }),
    );

    // ---- provider specific fields
    const modelPick = h('select', { 'aria-label': 'Loaded models', hidden: true });
    const loadBtn = h('button', { class: 'btn small ghost', type: 'button' }, icon('list', 16), 'Load models');
    const field = (label, control, hint) => h('div', { class: 'field' }, h('label', null, label), control, hint ? h('span', { class: 'hint' }, hint) : null);
    const text = (key, ph, type = 'text') => {
      const i = h('input', { type, value: a[key], placeholder: ph, autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false' });
      i.addEventListener('change', () => { a[key] = i.value.trim(); change(); });
      return i;
    };

    if (a.provider === 'openai') {
      if (a.via === 'direct') {
        const base = text('openaiBase', DEFAULT_OPENAI_BASE, 'url');
        const preset = h('select', { 'aria-label': 'Preset' }, h('option', { value: '' }, 'Choose a preset...'), PRESETS.map(([n, u]) => h('option', { value: u }, n)));
        preset.addEventListener('change', () => { if (preset.value) { base.value = preset.value; a.openaiBase = preset.value; change(); } });
        const key = text('apiKey', 'sk-...', 'password');
        const show = h('button', { class: 'btn small ghost', type: 'button', onclick: () => { key.type = key.type === 'password' ? 'text' : 'password'; } }, 'Show / hide');
        pane.append(field('Service', preset), field('Base URL', base), field('API key', h('div', { class: 'inline' }, key, show), 'Stored on this device only, in your browser\'s local storage. Use the game server option to keep the key off the browser entirely.'));
      } else {
        pane.append(h('p', { class: 'muted small' }, 'The game server (node server/serve.mjs) holds your key in its environment (OPENAI_API_KEY). The key never reaches this page.'));
      }
      const model = text('model', 'model id, for example the one shown after Load models');
      pane.append(field('Model', h('div', { class: 'stack' }, model, h('div', { class: 'inline' }, loadBtn, modelPick)), 'The list comes from the service, so it is always current.'));
      modelPick.addEventListener('change', () => { model.value = modelPick.value; a.model = modelPick.value; change(); });
      loadBtn.addEventListener('click', async () => {
        loadBtn.disabled = true;
        testOut.className = 'aiout'; testOut.textContent = 'Loading models...';
        try {
          const ids = await app.ai.listModels();
          clear(modelPick);
          modelPick.append(h('option', { value: '' }, `${ids.length} models. Pick one...`), ids.map((id) => h('option', { value: id }, id)));
          modelPick.hidden = false;
          testOut.textContent = ids.length ? 'Pick a model from the list.' : 'The service returned no chat models.';
        } catch (e) { fail(testOut, e); } finally { loadBtn.disabled = false; }
      });
    } else {
      if (a.via === 'direct') {
        pane.append(
          field('OpenCode address', text('opencodeBase', DEFAULT_OPENCODE_BASE, 'url'), 'Default: http://127.0.0.1:4096. From an https page only localhost works; otherwise use the game server.'),
          field('Username', text('username', 'opencode'), 'Only needed if you set OPENCODE_SERVER_PASSWORD.'),
          field('Password', text('password', '(none)', 'password')));
      } else {
        pane.append(h('p', { class: 'muted small' }, 'The game server forwards to OpenCode using OPENCODE_URL and OPENCODE_SERVER_PASSWORD from its environment.'));
      }
      const current = a.providerID && a.modelID ? `${a.providerID} / ${a.modelID}` : 'None chosen';
      const chosen = h('div', { class: 'chosen' }, h('b', null, 'Model: '), current);
      pane.append(
        field('Model', h('div', { class: 'stack' }, chosen, h('div', { class: 'inline' }, loadBtn, modelPick))),
        field('Agent (optional)', text('agent', 'halcyon'), 'The name of an agent from opencode.json. Use the tool free "halcyon" agent from the README for the most natural chat.'));
      let models = [];
      modelPick.addEventListener('change', () => {
        const m = models[Number(modelPick.value)];
        if (m) { a.providerID = m.providerID; a.modelID = m.modelID; chosen.replaceChildren(h('b', null, 'Model: '), `${m.providerID} / ${m.modelID}`); change(); }
      });
      loadBtn.addEventListener('click', async () => {
        loadBtn.disabled = true;
        testOut.className = 'aiout'; testOut.textContent = 'Asking OpenCode for its models...';
        try {
          models = await app.ai.listModels();
          clear(modelPick);
          modelPick.append(h('option', { value: '' }, `${models.length} models. Pick one...`), models.map((m, i) => h('option', { value: String(i) }, m.label)));
          modelPick.hidden = false;
          testOut.textContent = models.length ? 'Pick a model from the list.' : 'OpenCode has no connected providers. Run /connect inside OpenCode first.';
        } catch (e) { fail(testOut, e); } finally { loadBtn.disabled = false; }
      });
    }

    const token = text('token', '(if the server printed one)', 'password');
    const tokenField = field('Game server access token', token, 'Needed only when the server was started with --lan. It is in the link the server printed.');
    tokenField.hidden = true;

    const cap = h('input', { type: 'range', min: '10', max: '300', step: '5', value: String(a.dailyCap), id: 'cap' });
    const capLabel = h('label', { for: 'cap' }, `AI messages per in game day: ${a.dailyCap}`);
    cap.addEventListener('input', () => { a.dailyCap = Number(cap.value); capLabel.textContent = `AI messages per in game day: ${a.dailyCap}`; change(); });

    const testBtn = h('button', { class: 'btn teal block', type: 'button' }, icon('play', 16), 'Test the connection');
    testBtn.addEventListener('click', async () => {
      if (!aiReady(p)) { testOut.className = 'aiout bad'; testOut.textContent = 'Fill in the missing details first (a model is required).'; return; }
      testBtn.disabled = true;
      testOut.className = 'aiout'; testOut.textContent = 'Sending a tiny test message...';
      try {
        const reply = await app.ai.test();
        testOut.className = 'aiout good';
        testOut.textContent = `Connected. The model said: "${reply}"`;
      } catch (e) { fail(testOut, e); } finally { testBtn.disabled = false; }
    });

    pane.append(
      tokenField,
      h('div', { class: 'field' }, capLabel, cap, h('span', { class: 'hint' }, 'A cap on how many AI replies you can trigger per in game day, so a long session cannot run up a surprise bill.')),
      testBtn,
      testOut,
      h('p', { class: 'faint small' }, 'Friends are written to answer honestly if you sincerely ask whether they are an AI, never to guilt you for leaving, and to point to real people if you ever say you are in trouble.'));

    // ---- server detection
    app.ai?.detectServer(true).then((info) => {
      if (!info) {
        status.className = 'note';
        status.textContent = a.via === 'server'
          ? 'No game server found. This page is not being served by server/serve.mjs, so "Through the game server" will not work here.'
          : 'No local game server detected. That is fine for direct connections.';
        return;
      }
      tokenField.hidden = !(info.tokenRequired && !info.authorized);
      const bits = [info.openai ? 'OpenAI key found' : 'no OpenAI key set', info.opencode ? 'OpenCode is running' : 'OpenCode not detected'];
      status.className = 'note good';
      status.textContent = `Game server found: ${bits.join(', ')}.`;
    });
  }

  function fail(out, e) {
    out.className = 'aiout bad';
    out.textContent = e?.message || 'Something went wrong.';
  }

  // ------------------------------------------------------------ data tab
  function renderData(pane) {
    if (app.storage.memory) {
      pane.append(h('div', { class: 'note bad' }, h('b', null, 'Saving is blocked. '), 'Your browser is not allowing local storage (private mode?). Export your save below before you close this tab.'));
    }
    const fileIn = h('input', { type: 'file', accept: 'application/json,.json', hidden: true });
    fileIn.addEventListener('change', async () => {
      const f = fileIn.files?.[0];
      if (!f) return;
      try {
        const imported = importGame(await f.text());
        confirmSheet('Replace your current game?', `This loads "${imported.player.name}", day ${imported.time.day}. Your current progress will be overwritten.`, 'Load save', () => {
          for (const k of Object.keys(app.state)) delete app.state[k];
          Object.assign(app.state, imported);
          app.save();
          app.closeSheets();
          app.hub?.refresh();
          app.toast('Save loaded.', { kind: 'good' });
        });
      } catch (e) {
        app.toast(e.message || 'That file could not be read.', { kind: 'bad' });
      } finally { fileIn.value = ''; }
    });
    pane.append(
      h('p', { class: 'muted small' }, 'Your game saves automatically on this device. Exported files never include AI keys.'),
      h('button', { class: 'btn block', type: 'button', onclick: () => {
        const blob = new Blob([exportGame(app.state)], { type: 'application/json' });
        const a = h('a', { href: URL.createObjectURL(blob), download: `halcyon-row-day${app.state.time.day}.json` });
        document.body.append(a);
        a.click();
        setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
      } }, icon('gift', 16), 'Export save file'),
      h('div', { style: { height: '10px' } }),
      h('button', { class: 'btn block ghost', type: 'button', onclick: () => fileIn.click() }, icon('list', 16), 'Import save file'),
      fileIn,
      h('div', { style: { height: '10px' } }),
      onQuit ? h('button', { class: 'btn block ghost', type: 'button', onclick: () => { app.closeSheets(); onQuit(); } }, icon('home', 16), 'Back to title') : null,
      h('h3', null, 'Start over'),
      h('button', { class: 'btn block', style: { '--c': '#5a2030' }, type: 'button', onclick: () => confirmSheet('Erase this game?', 'This deletes your saved progress on this device. Export first if you want a copy.', 'Erase', () => {
        deleteSave(app.storage);
        app.closeSheets();
        onQuit?.();
      }) }, 'Erase saved game'),
      h('p', { class: 'faint small center', style: { marginTop: '1.4rem' } }, 'Halcyon Row. A placeholder story about a real kind of friendship.'));
  }

  function confirmSheet(title, text, label, onYes) {
    app.sheet({
      title,
      short: true,
      build(body, ctl) {
        body.append(h('p', null, text), h('div', { class: 'row2' },
          h('button', { class: 'btn ghost', type: 'button', onclick: () => ctl.close() }, 'Cancel'),
          h('button', { class: 'btn primary', type: 'button', onclick: () => { ctl.close(); onYes(); } }, label)));
      },
    });
  }
}
