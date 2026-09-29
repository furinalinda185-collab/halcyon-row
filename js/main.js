// Boot: build the app, register the service worker, show the title, then the hub.

import { createApp } from './ui/app.js';
import { showTitle } from './ui/title.js';
import { mountHub } from './ui/hub.js';
import { startTalk } from './ui/talk.js';
import { createAI } from './ai/client.js';
import { newState } from './core/state.js';

const root = document.getElementById('app');
root.replaceChildren();
root.dataset.screen = 'title';

const app = createApp(root);
app.ai = createAI(app);
app.startTalk = (id) => startTalk(app, id);

// A link from the LAN game server carries its access token in the hash. Keep it, hide it.
const hashToken = /[#&]token=([\w-]+)/.exec(location.hash)?.[1];
if (hashToken) {
  app.prefs.ai.token = hashToken;
  app.prefs.ai.via = 'server';
  app.savePrefs();
  history.replaceState(null, '', location.pathname + location.search);
}

function begin(state) {
  app.state = state;
  root.dataset.screen = 'hub';
  const hub = mountHub(app);
  applyAmbient();
  hub.runBeats().then(() => hub.refresh());
}

function applyAmbient() {
  if (app.prefs.ambient && app.prefs.sound) {
    app.audio.init();
    app.audio.ambient(true);
  }
}

app.quitToTitle = () => {
  app.hub?.destroy();
  app.hub = null;
  app.audio.ambient(false);
  app.closeSheets();
  root.dataset.screen = 'title';
  showTitle(app, begin);
};

showTitle(app, begin);

// Offline support. Only over http(s); file:// cannot register workers.
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => { /* offline mode is a bonus, not a requirement */ });
  });
}

// Handy for debugging and tests. Not part of the game.
globalThis.__halcyon = { app, newState };
