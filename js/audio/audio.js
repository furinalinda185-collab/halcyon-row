// Synthesized sound: small effects and an optional quiet ambient bed. No audio files.
// Browsers only allow audio after a tap, so init() is called from the first gesture.

let ctx = null;
let master = null;
let enabled = true;
let ambientOn = false;
let ambientNodes = null;

const NOTE = (n) => 440 * 2 ** ((n - 69) / 12);

function tone({ freq, type = 'sine', dur = 0.12, gain = 0.08, at = 0, slideTo, attack = 0.005 }) {
  if (!ctx || !enabled) return;
  const t0 = ctx.currentTime + at;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(master);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

const SFX = {
  tap: () => tone({ freq: 880, dur: 0.04, gain: 0.03, type: 'triangle' }),
  select: () => { tone({ freq: 660, dur: 0.07, gain: 0.05, type: 'triangle' }); tone({ freq: 990, dur: 0.09, gain: 0.04, type: 'triangle', at: 0.05 }); },
  confirm: () => { tone({ freq: NOTE(72), dur: 0.1, gain: 0.05 }); tone({ freq: NOTE(79), dur: 0.16, gain: 0.05, at: 0.08 }); },
  text: () => tone({ freq: 1200, slideTo: 800, dur: 0.09, gain: 0.04, type: 'sine' }),
  coin: () => { tone({ freq: 988, dur: 0.07, gain: 0.05, type: 'square' }); tone({ freq: 1319, dur: 0.14, gain: 0.05, type: 'square', at: 0.07 }); },
  bell: () => { tone({ freq: 1568, dur: 0.9, gain: 0.05 }); tone({ freq: 2349, dur: 0.7, gain: 0.025, at: 0.01 }); },
  levelup: () => [60, 64, 67, 72].forEach((n, i) => tone({ freq: NOTE(n), dur: 0.18, gain: 0.05, type: 'triangle', at: i * 0.08 })),
  rankup: () => [64, 67, 71, 76, 79].forEach((n, i) => tone({ freq: NOTE(n), dur: 0.35, gain: 0.05, type: 'sine', at: i * 0.11 })),
};

export const audio = {
  init() {
    if (ctx) return;
    const AC = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!AC) return;
    try {
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.9;
      master.connect(ctx.destination);
    } catch {
      ctx = null;
    }
  },
  resume() {
    if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
  },
  setEnabled(on) {
    enabled = on;
    if (!on) this.ambient(false);
  },
  play(name) {
    if (!ctx || !enabled) return;
    this.resume();
    SFX[name]?.();
  },
  /** A quiet chord bed with sparse notes. Rain adds filtered noise. */
  ambient(on, { rain = false } = {}) {
    if (!ctx) return;
    if (!on || !enabled) {
      if (ambientNodes) {
        const { gain, timer, extra } = ambientNodes;
        gain.gain.cancelScheduledValues(ctx.currentTime);
        gain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.6);
        clearInterval(timer);
        setTimeout(() => { try { extra.forEach((n) => n.stop?.()); gain.disconnect(); } catch { /* already stopped */ } }, 2500);
        ambientNodes = null;
      }
      ambientOn = false;
      return;
    }
    if (ambientOn) return;
    ambientOn = true;
    this.resume();
    const gain = ctx.createGain();
    gain.gain.value = 0.0001;
    gain.gain.setTargetAtTime(0.5, ctx.currentTime, 1.5);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 900;
    lp.connect(gain).connect(master);
    const chords = [[57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 65], [52, 55, 59, 62]];
    const extra = [];
    const pad = chords[0].map((n) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'triangle';
      o.frequency.value = NOTE(n);
      g.gain.value = 0.018;
      o.connect(g).connect(lp);
      o.start();
      extra.push(o);
      return o;
    });
    if (rain) {
      const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 3200;
      const rg = ctx.createGain();
      rg.gain.value = 0.02;
      src.connect(bp).connect(rg).connect(gain);
      src.start();
      extra.push(src);
    }
    let step = 0;
    const timer = setInterval(() => {
      if (!ctx || !enabled) return;
      const chord = chords[Math.floor(step / 4) % chords.length];
      if (step % 4 === 0) {
        pad.forEach((o, i) => o.frequency.setTargetAtTime(NOTE(chord[i]), ctx.currentTime, 1.2));
      }
      if (Math.random() < 0.65) {
        const n = chord[Math.floor(Math.random() * chord.length)] + 12 + (Math.random() < 0.3 ? 12 : 0);
        const t0 = ctx.currentTime;
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.value = NOTE(n);
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(0.03, t0 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.8);
        o.connect(g).connect(lp);
        o.start(t0);
        o.stop(t0 + 2);
      }
      step += 1;
    }, 2000);
    ambientNodes = { gain, timer, extra };
  },
};
