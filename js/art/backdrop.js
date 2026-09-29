// Procedural SVG backdrops for every place on the Row.
//
// backdropSVG(locId, { slot, weather }) returns a full scene as an SVG string. Time of
// day (slot 0 to 3) changes the sky, the light and which windows are lit. Weather adds
// rain, cloud or fog. Everything is generated from fixed numbers, so scenes look the
// same every time you visit.

import { seeded, hashString } from '../core/clock.js';
import { mix, shade } from './portrait.js';

const W = 800;
const H = 450;
let uid = 0;

// slot 0 Morning, 1 Afternoon, 2 Evening, 3 Night
const PALETTE = [
  { top: '#f4bf9a', bot: '#ffe8cc', lamp: 0.2, night: 0, tint: 'rgba(255,200,150,0.10)', sun: [610, 150, '#fff2c8'] },
  { top: '#74b9ee', bot: '#d8eeff', lamp: 0.05, night: 0, tint: 'rgba(255,255,255,0)', sun: [560, 90, '#fffbe6'] },
  { top: '#3a2a68', bot: '#ff8d58', lamp: 0.8, night: 0.35, tint: 'rgba(70,28,90,0.16)', sun: [200, 300, '#ffd9a0'] },
  { top: '#0b0c22', bot: '#2b2058', lamp: 1, night: 1, tint: 'rgba(8,8,48,0.34)', sun: null },
];

function palette(slot, weather) {
  const p = { ...PALETTE[slot] };
  if (weather === 'rain') {
    p.top = mix(p.top, '#59627a', 0.55);
    p.bot = mix(p.bot, '#8e97ab', 0.55);
    p.lamp = Math.min(1, p.lamp + 0.25);
    p.sun = null;
  } else if (weather === 'cloudy') {
    p.top = mix(p.top, '#8b93a8', 0.3);
    p.bot = mix(p.bot, '#c3c8d4', 0.3);
    p.sun = null;
  } else if (weather === 'fog') {
    p.top = mix(p.top, '#cfd4de', 0.45);
    p.bot = mix(p.bot, '#e6e9ef', 0.45);
    p.sun = null;
  }
  return p;
}

// ---------------------------------------------------------------- primitives

const R = (x, y, w, h, fill, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${extra}/>`;
const C = (cx, cy, r, fill, extra = '') => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" ${extra}/>`;
const P = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`;
const T = (x, y, s, size, fill, extra = '') => `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" font-family="system-ui, sans-serif" font-weight="800" ${extra}>${s}</text>`;

let gseq = 0;

/** Soft light without filters (cheap on phones): a radial gradient that fades to nothing. */
function glow(cx, cy, r, color, strength) {
  if (strength <= 0.02) return '';
  const id = `gl${uid}_${gseq++}`;
  return `<radialGradient id="${id}"><stop offset="0" stop-color="${color}" stop-opacity="${Math.min(0.9, 0.62 * strength).toFixed(2)}"/>` +
    `<stop offset="0.4" stop-color="${color}" stop-opacity="${(0.22 * strength).toFixed(2)}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>` +
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${id})"/>`;
}

function skyRect(id, p, x = 0, y = 0, w = W, h = H) {
  return `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.top}"/><stop offset="1" stop-color="${p.bot}"/></linearGradient>` +
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${id})"/>`;
}

function stars(seed, p, count = 40, maxY = 200) {
  if (p.night < 0.5) return '';
  const rng = seeded(seed);
  let s = '';
  for (let i = 0; i < count; i++) {
    s += C((rng() * W).toFixed(0), (rng() * maxY).toFixed(0), (0.6 + rng() * 1.1).toFixed(1), '#fff', `opacity="${(0.4 + rng() * 0.5).toFixed(2)}" class="twinkle" style="animation-delay:${(rng() * 3).toFixed(1)}s"`);
  }
  return s;
}

function celestial(p) {
  if (!p.sun) return p.night >= 1 ? C(650, 90, 26, '#f4f0dc') + C(662, 84, 24, '#0e0f2a', 'opacity="0.0"') : '';
  const [x, y, col] = p.sun;
  return glow(x, y, 120, col, 0.9) + C(x, y, 30, col);
}

/** A row of building silhouettes with windows that light up after dark. */
function skyline(seed, base, minH, maxH, color, p, { windows = true, x0 = 0, x1 = W } = {}) {
  const rng = seeded(seed);
  let s = '';
  let x = x0 - 10;
  while (x < x1) {
    const w = 38 + Math.floor(rng() * 56);
    const h = minH + Math.floor(rng() * (maxH - minH));
    s += R(x, base - h, w, h + 400, color);
    if (windows) {
      for (let wy = base - h + 10; wy < base - 8; wy += 15) {
        for (let wx = x + 7; wx < x + w - 9; wx += 13) {
          const lit = p.night > 0.3 ? rng() < 0.42 * Math.min(1, p.night + 0.3) : rng() < 0.07;
          if (lit) s += R(wx, wy, 6, 8, p.night > 0.3 ? '#ffd88a' : '#fff1c0', `opacity="${p.night > 0.3 ? 0.95 : 0.35}"`);
        }
      }
    }
    x += w + (rng() < 0.3 ? 4 : 0);
  }
  return s;
}

function cloudPuffs(seed, count, color, opacity) {
  const rng = seeded(seed);
  let s = '';
  for (let i = 0; i < count; i++) {
    const x = rng() * W;
    const y = 30 + rng() * 150;
    const w = 90 + rng() * 120;
    s += `<g class="drift" style="animation-delay:${(-rng() * 40).toFixed(1)}s" opacity="${opacity}">` +
      `<ellipse cx="${x}" cy="${y}" rx="${w / 2}" ry="${w / 8}" fill="${color}"/><ellipse cx="${x + w * 0.15}" cy="${y - w * 0.07}" rx="${w / 3.2}" ry="${w / 8}" fill="${color}"/></g>`;
  }
  return s;
}

/** Everything drawn in front: weather, tint, vignette. */
function overlays(p, weather, seed) {
  let s = '';
  if (weather === 'rain') {
    const rng = seeded(seed + 7);
    s += '<g class="rain" stroke="#dfe8ff" stroke-width="1.4" opacity="0.5">';
    for (let i = 0; i < 70; i++) {
      const x = (rng() * (W + 60)).toFixed(0);
      s += `<line x1="${x}" y1="-30" x2="${x - 10}" y2="4" style="animation-delay:${(-rng() * 1.2).toFixed(2)}s;animation-duration:${(0.7 + rng() * 0.5).toFixed(2)}s"/>`;
    }
    s += '</g>' + R(0, 0, W, H, '#37415a', 'opacity="0.16"');
  } else if (weather === 'fog') {
    s += R(0, 0, W, H, '#e9edf3', 'opacity="0.28"') + R(0, 250, W, 200, '#f4f6fa', 'opacity="0.22"');
  }
  s += R(0, 0, W, H, p.tint);
  s += `<radialGradient id="vg${uid}" cx="0.5" cy="0.5" r="0.75"><stop offset="0.55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#0a0616" stop-opacity="0.5"/></radialGradient>` +
    `<rect width="${W}" height="${H}" fill="url(#vg${uid})"/>`;
  return s;
}

/** A window that looks out on the sky and city. Uses a nested svg to clip the view. */
function windowView(x, y, w, h, p, seed, weather, frame = '#3a2a40') {
  const id = `wv${uid}_${x}`;
  return `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice">` +
    skyRect(id, p, 0, 0, w, h) +
    (p.sun ? glow(w * 0.7, h * 0.35, 60, p.sun[2], 0.8) : '') +
    (weather === 'cloudy' || weather === 'rain' ? `<ellipse cx="${w * 0.3}" cy="${h * 0.25}" rx="${w * 0.3}" ry="${h * 0.08}" fill="#b6bccb" opacity="0.7"/>` : '') +
    `<g transform="scale(${w / 400} ${w / 400})">${skyline(seed, h * (400 / w) * 0.98, 40, 110, p.night > 0.3 ? '#151233' : shade(p.bot, -0.35), p, { windows: true, x0: 0, x1: 420 })}</g>` +
    `</svg>` +
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${frame}" stroke-width="8"/>` +
    `<path d="M${x + w / 2} ${y} V${y + h} M${x} ${y + h * 0.5} H${x + w}" stroke="${frame}" stroke-width="5"/>` +
    (weather === 'rain' ? `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#9fb2d8" opacity="0.14"/>` : '');
}

function pendant(x, len, p, color = '#ffcf7a') {
  return `<path d="M${x} 0 V${len}" stroke="#2a2030" stroke-width="2"/>` +
    P(`M${x - 16} ${len + 14} Q${x} ${len - 8} ${x + 16} ${len + 14} Z`, '#3b2c46') +
    glow(x, len + 16, 60, color, p.lamp) + C(x, len + 15, 5, color, `opacity="${0.4 + 0.6 * p.lamp}"`);
}

// ------------------------------------------------------------------- scenes

const SCENES = {
  home(p, weather) {
    const wall = mix('#c9a4c4', '#6b4f86', p.night * 0.7);
    return R(0, 0, W, 340, wall) + R(0, 340, W, 110, mix('#a5764a', '#3f2a20', p.night * 0.6)) +
      R(0, 336, W, 8, mix('#7f5a3a', '#2b1c14', p.night * 0.6)) +
      windowView(470, 60, 250, 230, p, 11, weather) +
      R(452, 44, 30, 264, '#e6d7e2', 'opacity="0.9"') + R(710, 44, 30, 264, '#e6d7e2', 'opacity="0.9"') +
      R(460, 290, 270, 22, '#d8d0d8') + R(478, 300, 234, 8, '#b6aab8') +
      // radiator
      [0, 1, 2, 3, 4, 5, 6, 7].map((i) => R(486 + i * 28, 312, 20, 44, '#cfc6cf', 'stroke="#8f8592" stroke-width="2"')).join('') +
      // bed
      R(40, 250, 300, 100, '#4b3a66') + R(40, 230, 300, 40, '#e8dcec') + R(50, 236, 90, 30, '#fff', 'rx="12" opacity="0.9"') +
      P('M40 280 H340 V350 H40 Z', mix('#e07a5f', '#7a3f38', p.night * 0.5)) +
      // boxes
      R(560, 330, 110, 90, '#c89a63', 'stroke="#8a6238" stroke-width="3"') + R(600, 330, 26, 90, '#e2c58f', 'opacity="0.7"') +
      R(640, 290, 90, 60, '#d3a86f', 'stroke="#8a6238" stroke-width="3"') + R(610, 250, 80, 44, '#b98a55', 'stroke="#8a6238" stroke-width="3"') +
      R(420, 360, 90, 60, '#c89a63', 'stroke="#8a6238" stroke-width="3"') +
      // lamp + plant
      R(370, 200, 6, 150, '#3b2c46') + P('M348 200 L398 200 L386 165 L360 165 Z', '#ffd68a', `opacity="${0.5 + 0.5 * p.lamp}"`) + glow(373, 190, 90, '#ffd68a', p.lamp) +
      R(20, 340, 44, 40, '#c46b4e') + P('M42 340 C10 300 20 270 42 300 C50 268 78 290 60 340 Z', '#3f8f57') +
      // poster
      R(120, 90, 90, 120, '#f3e4d0', 'stroke="#3b2c46" stroke-width="4"') + P('M132 190 L160 140 L176 165 L190 150 L202 190 Z', '#6c8ebf') + C(184, 116, 10, '#f4b942');
  },

  cafe(p, weather) {
    const wall = mix('#e8c9a0', '#6a4a52', p.night * 0.6);
    let s = R(0, 0, W, 330, wall) + R(0, 330, W, 120, mix('#8b5a3c', '#33211c', p.night * 0.6));
    for (let i = 0; i < 16; i++) s += R(i * 50, 330, 2, 120, '#6b4229', 'opacity="0.35"');
    // window to the street
    s += windowView(520, 70, 230, 210, p, 21, weather, '#5a3a2e');
    s += T(545, 60, 'KETTLE &amp; CRUMB', 22, '#5a3a2e', 'transform="scale(1 1)" opacity="0.0"');
    // chalkboard
    s += R(80, 34, 260, 140, '#2b3a36', 'stroke="#8b5a3c" stroke-width="8"') +
      T(102, 72, 'TODAY', 22, '#f3efe0', 'opacity="0.9"') +
      ['cortado  4', 'flat white  5', 'melon pan  4', 'gerald  ???'].map((t, i) => T(102, 100 + i * 20, t, 15, '#e9e3cf', 'font-weight="500" opacity="0.85"')).join('') +
      P('M290 60 q12 -10 24 0 q12 10 -6 24', 'none', 'stroke="#f2a65a" stroke-width="3"');
    // pendant lamps
    s += pendant(200, 250, p) + pendant(420, 230, p);
    // counter
    s += R(0, 290, 470, 160, '#a8724a') + R(0, 284, 480, 20, '#d7a06b') + R(0, 304, 470, 6, '#7b4f30', 'opacity="0.5"');
    // pastry case
    s += R(250, 220, 190, 70, '#cfe6ea', 'opacity="0.55" stroke="#5a3a2e" stroke-width="4"') + R(258, 274, 174, 8, '#b98a63') +
      [0, 1, 2, 3, 4].map((i) => P(`M${270 + i * 34} 274 q10 -26 24 0 z`, i % 2 ? '#e3a35c' : '#f0c27a')).join('');
    // espresso machine (Gerald)
    s += R(60, 216, 150, 70, '#b9bcc6', 'stroke="#4a4d58" stroke-width="4"') + R(70, 200, 130, 22, '#d5d8e0', 'stroke="#4a4d58" stroke-width="4"') +
      R(88, 262, 24, 22, '#4a4d58') + R(148, 262, 24, 22, '#4a4d58') + C(110, 236, 8, '#e2a83c') + C(160, 236, 8, '#5a8f5d') +
      `<g class="steam" opacity="0.55"><path d="M96 190 q-8 -18 0 -34 q8 -16 0 -32" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M160 190 q-8 -16 0 -30 q8 -14 0 -28" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/></g>`;
    // tables
    s += R(540, 360, 190, 14, '#7b4f30') + R(628, 374, 14, 60, '#5b3a24') + R(590, 430, 90, 8, '#5b3a24') +
      R(520, 310, 30, 70, '#5b3a24') + R(720, 310, 30, 70, '#5b3a24') + C(600, 350, 12, '#f4f0dc') + R(596, 338, 8, 12, '#5a3a2e');
    // fairy light string
    s += `<path d="M0 30 Q200 70 400 30 T800 30" stroke="#3b2c46" stroke-width="2" fill="none"/>` +
      Array.from({ length: 12 }, (_, i) => C(i * 70 + 20, 40 + Math.sin(i * 0.9) * 14, 4, '#ffdc8a', `opacity="${0.4 + 0.6 * p.lamp}"`)).join('');
    return s;
  },

  library(p, weather) {
    let s = R(0, 0, W, 340, mix('#9c8b73', '#3e3550', p.night * 0.7)) + R(0, 340, W, 110, mix('#6b4a32', '#241a22', p.night * 0.6));
    // tall arched windows
    for (const x of [300, 470]) {
      s += `<svg x="${x}" y="30" width="130" height="270" viewBox="0 0 130 270" preserveAspectRatio="xMidYMid slice">` +
        skyRect(`lw${uid}_${x}`, p, 0, 0, 130, 270) + `<g transform="scale(0.5)">${skyline(x, 540, 60, 200, p.night > 0.3 ? '#151233' : shade(p.bot, -0.35), p, { x0: 0, x1: 300 })}</g></svg>` +
        P(`M${x} 300 V90 A65 65 0 0 1 ${x + 130} 90 V300 Z`, 'none', 'stroke="#4a3626" stroke-width="10"') +
        `<path d="M${x + 65} 25 V300 M${x} 130 H${x + 130} M${x} 200 H${x + 130}" stroke="#4a3626" stroke-width="5"/>`;
    }
    // shelves
    const rng = seeded(31);
    const shelf = (x, w) => {
      let t = R(x, 40, w, 300, '#5a3d28', 'stroke="#2b1c14" stroke-width="3"');
      for (let row = 0; row < 5; row++) {
        const y = 52 + row * 58;
        t += R(x + 6, y + 44, w - 12, 8, '#3d2818');
        let bx = x + 8;
        while (bx < x + w - 14) {
          const bw = 8 + Math.floor(rng() * 12);
          const bh = 28 + Math.floor(rng() * 16);
          t += R(bx, y + 44 - bh, bw, bh, ['#a8453f', '#3f6f8f', '#c9a13f', '#4c8a5b', '#7a5b9a', '#d9d0bd'][Math.floor(rng() * 6)]);
          bx += bw + 1;
        }
      }
      return t;
    };
    s += shelf(20, 230) + shelf(620, 170);
    // reading table + lamp
    s += R(230, 350, 340, 14, '#8a5d3a') + R(250, 364, 16, 70, '#5b3a24') + R(534, 364, 16, 70, '#5b3a24') +
      R(300, 336, 110, 14, '#c8b58a') + R(420, 340, 60, 10, '#c4553f') +
      R(500, 310, 6, 40, '#2b3a36') + P('M480 310 L530 310 L520 288 L490 288 Z', '#2f6b4f') + glow(505, 320, 80, '#ffe9a8', Math.max(0.35, p.lamp)) +
      // cart
      R(100, 360, 120, 60, '#7b5a3a', 'stroke="#2b1c14" stroke-width="3"') + C(120, 428, 10, '#2b1c14') + C(200, 428, 10, '#2b1c14');
    return s;
  },

  records(p, weather) {
    let s = R(0, 0, W, 330, mix('#3f3a5c', '#1c1730', p.night * 0.6)) + R(0, 330, W, 120, mix('#5a3d38', '#221820', p.night * 0.5));
    // posters
    const cols = ['#e26a5b', '#f2c14e', '#5aa9c9', '#8f6bc9', '#5fb87a', '#f08fb0'];
    for (let i = 0; i < 6; i++) {
      s += R(30 + i * 120, 40 + (i % 2) * 30, 90, 120, cols[i], 'stroke="#efe6d0" stroke-width="5"') +
        C(75 + i * 120, 100 + (i % 2) * 30, 24, '#1b1524', 'opacity="0.35"') + R(46 + i * 120, 140 + (i % 2) * 30, 58, 8, '#efe6d0', 'opacity="0.8"');
    }
    // wall of sleeves
    const rng = seeded(41);
    s += R(0, 200, W, 12, '#2b2138');
    for (let i = 0; i < 34; i++) s += R(6 + i * 23.5, 160, 20, 40, ['#d9c9a8', '#a8453f', '#3f6f8f', '#c9a13f', '#2b2138', '#7a5b9a'][Math.floor(rng() * 6)]);
    // neon sign
    s += `<rect x="600" y="230" width="150" height="54" rx="10" fill="none" stroke="#ff5f8f" stroke-width="5" opacity="${0.5 + 0.5 * Math.max(0.6, p.lamp)}"/>` +
      T(626, 268, 'OPEN', 32, '#ff8fb0') + glow(675, 258, 110, '#ff5f8f', 0.9);
    // counter + turntable
    s += R(0, 300, 420, 150, '#7a4f32') + R(0, 294, 430, 16, '#c8935e') +
      R(40, 262, 170, 34, '#2b2532', 'stroke="#111" stroke-width="3"') + C(100, 279, 26, '#111') + C(100, 279, 9, '#d95a4a') + P('M150 268 L188 276', 'none', 'stroke="#d0d0d8" stroke-width="4"') +
      // crates in front
      [0, 1, 2].map((i) => R(450 + i * 110, 350, 100, 70, '#a8794a', 'stroke="#5b3a24" stroke-width="3"') + [0, 1, 2, 3, 4, 5].map((j) => R(460 + i * 110 + j * 14, 330, 10, 40, ['#d9c9a8', '#a8453f', '#3f6f8f', '#c9a13f'][(i + j) % 4])).join('')).join('') +
      pendant(280, 160, p, '#ffb36b');
    return s;
  },

  arcade(p) {
    let s = R(0, 0, W, 450, '#150f2a') + R(0, 300, W, 150, '#231a3f');
    // carpet pattern
    const rng = seeded(51);
    for (let i = 0; i < 46; i++) {
      s += C((rng() * W).toFixed(0), (310 + rng() * 140).toFixed(0), 4 + rng() * 6, ['#3a2a66', '#5b2a6e', '#1f3a66'][i % 3], 'opacity="0.55"');
    }
    // ceiling strips
    s += R(0, 30, W, 6, '#ff3fa4', 'opacity="0.9"') + R(0, 46, W, 4, '#3fd0ff', 'opacity="0.8"') + glow(400, 40, 380, '#a64bff', 0.5);
    // cabinets
    const cab = (x, w, screen) =>
      R(x, 110, w, 260, '#2a2145', 'stroke="#0d0819" stroke-width="4"') + R(x + 10, 130, w - 20, 100, '#0d0819') + R(x + 14, 134, w - 28, 92, screen, 'opacity="0.9"') +
      R(x + 8, 250, w - 16, 26, '#3c2f66') + C(x + w * 0.3, 263, 6, '#ff5f8f') + C(x + w * 0.5, 263, 6, '#ffe066') + C(x + w * 0.7, 263, 6, '#5fe0ff') +
      glow(x + w / 2, 180, w * 1.1, screen, 0.8) + R(x + 10, 30, w - 20, 70, '#1c1533') + T(x + 16, 82, 'GAME', 22, screen, 'opacity="0.9"');
    s += cab(30, 150, '#4de1ff') + cab(200, 150, '#ff5fa2') + cab(370, 150, '#ffe066') + cab(540, 150, '#8f6bff');
    // racing cabinet seats
    s += R(650, 290, 130, 30, '#2a2145') + R(690, 320, 50, 90, '#1c1533') + C(680, 300, 22, '#ff3fa4', 'opacity="0.0"');
    // token machine
    s += R(710, 150, 70, 120, '#c4453f', 'stroke="#0d0819" stroke-width="4"') + T(716, 186, 'TOKENS', 14, '#ffe9b0') + R(726, 210, 38, 12, '#0d0819');
    return s;
  },

  market(p, weather) {
    const sky = skyRect(`sk${uid}`, p, 0, 0, W, 270) + stars(61, p) + celestial(p);
    let s = sky + skyline(62, 240, 70, 170, p.night > 0.3 ? '#171236' : shade(p.bot, -0.3), p) +
      R(0, 270, W, 180, mix('#4a4a5c', '#1f1e30', p.night * 0.5)) + R(0, 268, W, 6, '#2b2a3a');
    // puddle reflections
    s += `<ellipse cx="200" cy="410" rx="150" ry="14" fill="#ffb36b" opacity="${0.12 + 0.1 * p.lamp}"/><ellipse cx="560" cy="425" rx="190" ry="14" fill="#7ad0ff" opacity="0.1"/>`;
    // stalls
    const stall = (x, w, col) =>
      R(x, 210, w, 130, '#2f2a44') + P(`M${x - 8} 210 L${x + w + 8} 210 L${x + w - 6} 170 L${x + 6} 170 Z`, col, 'stroke="#1b1524" stroke-width="3"') +
      Array.from({ length: 6 }, (_, i) => P(`M${x + 6 + (i * (w - 12)) / 6} 170 L${x + 6 + ((i + 1) * (w - 12)) / 6} 170 L${x + 6 + ((i + 1) * (w - 12)) / 6} 210 L${x + 6 + (i * (w - 12)) / 6} 210 Z`, i % 2 ? '#f3ead8' : col, 'opacity="0.95"')).join('') +
      R(x + 12, 260, w - 24, 80, '#1b1524', 'opacity="0.35"') + glow(x + w / 2, 240, w * 0.7, '#ffcf7a', p.lamp);
    s += stall(30, 190, '#d94f43') + stall(250, 170, '#3f7fc9');
    // noodle cart, right
    s += R(520, 250, 250, 120, '#5a3a2e', 'stroke="#1b1524" stroke-width="3"') + R(510, 240, 270, 16, '#a8724a') +
      P('M500 240 L790 240 L770 180 L520 180 Z', '#f3ead8', 'stroke="#1b1524" stroke-width="3"') +
      T(548, 224, 'BOWL &amp; ANCHOR', 26, '#c4453f') +
      R(560, 190, 4, 40, '#1b1524', 'opacity="0.0"') +
      `<g class="steam" opacity="0.6"><path d="M600 240 q-10 -22 0 -44 q10 -22 0 -44" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M660 240 q-10 -22 0 -44 q10 -22 0 -44" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round"/></g>` +
      C(590, 280, 24, '#e8e0d0', 'stroke="#1b1524" stroke-width="3"') + C(660, 280, 24, '#e8e0d0', 'stroke="#1b1524" stroke-width="3"') + glow(640, 280, 160, '#ffcf7a', p.lamp);
    // string lights + lanterns
    s += `<path d="M0 60 Q200 130 400 70 T800 70" stroke="#241c30" stroke-width="2" fill="none"/>`;
    for (let i = 0; i < 14; i++) {
      const x = 20 + i * 58;
      const y = 68 + Math.sin(i * 0.8) * 22;
      s += C(x, y, 5, '#ffe6a3', `opacity="${0.5 + 0.5 * Math.max(0.5, p.lamp)}"`) + glow(x, y, 26, '#ffcf7a', Math.max(0.5, p.lamp));
    }
    for (const [x, y] of [[120, 120], [330, 110], [470, 100], [700, 110]]) {
      s += `<g class="sway"><path d="M${x} ${y - 30} V${y}" stroke="#241c30" stroke-width="2"/>` + `<ellipse cx="${x}" cy="${y + 16}" rx="14" ry="18" fill="#e8553f"/><path d="M${x - 14} ${y + 16} H${x + 14}" stroke="#7a1f16" stroke-width="2"/>` + glow(x, y + 16, 50, '#ff8a4f', Math.max(0.5, p.lamp)) + '</g>';
    }
    return s;
  },

  radio(p, weather) {
    const sky = skyRect(`sk${uid}`, p, 0, 0, W, 300) + stars(71, p, 60, 260) + celestial(p);
    let s = sky + (weather === 'cloudy' || weather === 'rain' ? cloudPuffs(72, 6, '#aab0c2', 0.8) : '') +
      skyline(73, 300, 60, 170, p.night > 0.3 ? '#171236' : shade(p.bot, -0.32), p) +
      skyline(74, 340, 40, 110, p.night > 0.3 ? '#0e0a24' : shade(p.bot, -0.5), p, { windows: true });
    // rooftop
    s += R(0, 340, W, 110, mix('#5a5a6a', '#26243a', p.night * 0.6)) + R(0, 330, W, 16, '#7b7a8c') + R(0, 346, W, 5, '#2b2a3a');
    // parapet bricks
    for (let i = 0; i < 20; i++) s += R(i * 42, 332, 38, 12, '#8b8a9c', 'opacity="0.5"');
    // station hut with on air sign
    s += R(470, 190, 240, 150, '#4b3f63', 'stroke="#1b1524" stroke-width="4"') + R(455, 178, 270, 20, '#2f2646') +
      R(500, 230, 90, 110, '#231a35') + R(610, 216, 80, 60, '#ffd88a', `opacity="${0.35 + 0.6 * Math.max(p.lamp, 0.4)}"`) +
      `<rect x="560" y="196" width="100" height="26" rx="6" fill="#c4453f" class="onair"/>` + T(574, 216, 'ON AIR', 18, '#fff') + glow(610, 210, 90, '#ff5f4f', 0.8) +
      // couch silhouette
      R(80, 290, 190, 46, '#6a4a6e', 'stroke="#1b1524" stroke-width="4"') + R(80, 262, 190, 34, '#7d5a82', 'stroke="#1b1524" stroke-width="4"') + R(70, 274, 24, 62, '#6a4a6e', 'stroke="#1b1524" stroke-width="4"') + R(256, 274, 24, 62, '#6a4a6e', 'stroke="#1b1524" stroke-width="4"') +
      // tower
      P('M745 340 L775 60 L805 340', 'none', 'stroke="#2f2646" stroke-width="6"') + P('M755 260 H795 M760 200 H790 M765 140 H785', 'none', 'stroke="#2f2646" stroke-width="4"') +
      C(775, 58, 7, '#ff3f3f', 'class="blink"') + glow(775, 58, 60, '#ff3f3f', 0.6) +
      // bulbs
      `<path d="M0 120 Q200 170 400 130 T800 110" stroke="#241c30" stroke-width="2" fill="none"/>` + Array.from({ length: 12 }, (_, i) => C(i * 70 + 10, 128 + Math.sin(i * 0.9) * 18, 5, '#ffe6a3', `opacity="${0.4 + 0.6 * Math.max(0.5, p.lamp)}"`) + glow(i * 70 + 10, 128 + Math.sin(i * 0.9) * 18, 26, '#ffcf7a', Math.max(0.4, p.lamp))).join('');
    return s;
  },

  pier(p, weather) {
    const horizon = 250;
    let s = skyRect(`sk${uid}`, p, 0, 0, W, horizon) + stars(81, p) + celestial(p) +
      (weather !== 'clear' ? cloudPuffs(82, 5, weather === 'rain' ? '#6f778b' : '#e8ecf4', 0.85) : cloudPuffs(83, 2, '#ffffff', 0.5));
    // sea
    s += `<linearGradient id="sea${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${mix(p.bot, '#3b78a8', 0.6)}"/><stop offset="1" stop-color="${mix('#1f4f7a', '#0b1030', p.night * 0.8)}"/></linearGradient>` +
      `<rect x="0" y="${horizon}" width="${W}" height="200" fill="url(#sea${uid})"/>`;
    // sun / moon reflection
    if (p.sun) s += `<rect x="${p.sun[0] - 20}" y="${horizon}" width="40" height="120" fill="${p.sun[2]}" opacity="0.28" class="shimmer"/>`;
    for (let i = 0; i < 14; i++) s += `<path d="M${(i * 71) % W} ${horizon + 20 + (i % 5) * 26} q20 -6 40 0" stroke="#ffffff" stroke-width="2" fill="none" opacity="0.28" class="shimmer" style="animation-delay:${i * 0.3}s"/>`;
    // far skyline & lighthouse
    s += skyline(84, horizon, 20, 60, p.night > 0.3 ? '#141033' : shade(p.bot, -0.28), p, { windows: true, x0: 0, x1: 300 }) +
      R(690, 150, 16, 100, '#f2eee6') + P('M684 150 L712 150 L698 128 Z', '#c4453f') + R(692, 128, 12, 8, '#ffe066') + glow(698, 132, 70, '#ffe066', p.night > 0.3 ? 1 : 0.2) +
      // ferry
      R(480, 232, 150, 26, '#f4f1e8', 'stroke="#1b1524" stroke-width="3"') + R(500, 214, 96, 20, '#d8d2c4', 'stroke="#1b1524" stroke-width="3"') + Array.from({ length: 6 }, (_, i) => R(508 + i * 14, 220, 8, 8, '#ffd88a', `opacity="${0.5 + 0.5 * p.night}"`)).join('') + R(480, 250, 150, 8, '#3f6f8f');
    // the wall
    s += R(0, 250, 330, 120, '#8a8794', 'stroke="#1b1524" stroke-width="4"') + R(0, 240, 335, 14, '#a4a1ae');
    const mural = ['#e26a5b', '#f2c14e', '#5aa9c9', '#8f6bc9', '#5fb87a', '#f08fb0', '#ff9a4d'];
    const rng = seeded(85);
    for (let i = 0; i < 9; i++) s += C(20 + i * 36, 290 + (rng() * 40 - 20), 12 + rng() * 14, mural[i % mural.length], 'opacity="0.9"');
    s += P('M20 350 Q80 300 140 340 T260 320', 'none', 'stroke="#1b1524" stroke-width="5" opacity="0.5"') + T(30, 276, 'HALCYON', 20, '#f5f0e0', 'opacity="0.55"');
    // boards
    s += R(0, 370, W, 80, mix('#9a6a44', '#3a2a24', p.night * 0.6));
    for (let i = 0; i < 20; i++) s += R(i * 42, 370, 3, 80, '#5b3a24', 'opacity="0.55"');
    s += R(0, 366, W, 8, '#6b4229') + Array.from({ length: 9 }, (_, i) => R(60 + i * 90, 346, 10, 34, '#4a3020')).join('') + P('M0 350 H800', 'none', 'stroke="#4a3020" stroke-width="5"');
    // gulls
    if (p.night < 0.7) s += `<g class="gull" fill="none" stroke="#fff" stroke-width="3"><path d="M420 90 q12 -12 24 0 q12 -12 24 0"/><path d="M500 120 q9 -9 18 0 q9 -9 18 0"/></g>`;
    return s;
  },

  festival(p) {
    // The pier at night, always lit, always full of lanterns.
    const night = { ...PALETTE[3], lamp: 1 };
    const horizon = 260;
    let s = skyRect(`sk${uid}`, night, 0, 0, W, horizon) + stars(91, night, 70, 220) + C(650, 90, 24, '#f4f0dc') +
      `<rect x="0" y="${horizon}" width="${W}" height="200" fill="#131437"/>`;
    for (let i = 0; i < 18; i++) s += `<path d="M${(i * 47) % W} ${horizon + 16 + (i % 6) * 24} q18 -5 36 0" stroke="#ffb36b" stroke-width="2" fill="none" opacity="0.35" class="shimmer" style="animation-delay:${i * 0.2}s"/>`;
    s += skyline(92, horizon, 30, 80, '#141033', night);
    // wall with mural glow
    s += R(0, 270, 340, 100, '#4a4560', 'stroke="#1b1524" stroke-width="4"');
    const rng = seeded(93);
    for (let i = 0; i < 9; i++) s += C(20 + i * 36, 305 + (rng() * 30 - 15), 12 + rng() * 14, ['#e26a5b', '#f2c14e', '#5aa9c9', '#8f6bc9', '#5fb87a', '#f08fb0'][i % 6], 'opacity="0.95"');
    // boards + crowd silhouettes
    s += R(0, 370, W, 80, '#2a1f2e') + Array.from({ length: 20 }, (_, i) => R(i * 42, 370, 3, 80, '#150f18', 'opacity="0.7"')).join('');
    const crowd = seeded(94);
    for (let i = 0; i < 22; i++) {
      const x = 20 + i * 36 + crowd() * 14;
      const h = 44 + crowd() * 24;
      s += C(x, 384 - h, 9, '#0b0813') + R(x - 11, 384 - h + 8, 22, h, '#0b0813', 'rx="8"');
    }
    // stage
    s += R(560, 300, 220, 70, '#3b2c46', 'stroke="#1b1524" stroke-width="3"') + R(560, 292, 220, 10, '#e2a83c') + glow(670, 300, 190, '#ffb36b', 0.8) + glow(600, 290, 90, '#ff5f8f', 0.5) + glow(740, 290, 90, '#5fd0ff', 0.5);
    // lanterns overhead
    const lrng = seeded(95);
    s += `<path d="M0 50 Q200 110 400 60 T800 70" stroke="#241c30" stroke-width="2" fill="none"/><path d="M0 130 Q200 190 400 140 T800 150" stroke="#241c30" stroke-width="2" fill="none"/>`;
    for (let i = 0; i < 28; i++) {
      const x = lrng() * W;
      const y = 36 + lrng() * 170;
      const r = 7 + lrng() * 8;
      const col = ['#ff8a4f', '#ffb347', '#ff6f61', '#ffd166'][i % 4];
      s += `<g class="sway" style="animation-delay:${(-lrng() * 4).toFixed(1)}s">${glow(x, y, r * 3.6, col, 0.8)}<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="${r}" ry="${(r * 1.25).toFixed(1)}" fill="${col}"/><path d="M${(x - r).toFixed(0)} ${y.toFixed(0)} H${(x + r).toFixed(0)}" stroke="#7a1f16" stroke-width="1.5" opacity="0.6"/></g>`;
    }
    return s;
  },
};

export const BACKDROP_LOOK = Object.keys(SCENES);

/** Full scene markup for a location id. Unknown ids fall back to the pier. */
export function backdropSVG(locId, { slot = 1, weather = 'clear' } = {}) {
  uid += 1;
  const p = palette(slot, weather);
  const make = SCENES[locId] || SCENES.pier;
  const interior = ['home', 'cafe', 'library', 'records', 'arcade'].includes(locId);
  const body = make(p, weather);
  const seed = hashString(`${locId}${slot}${weather}`);
  return `<svg class="backdrop-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">` +
    body +
    // Interiors get the tint and weather on the window only, but a light vignette overall.
    overlays(interior || locId === 'festival' ? { ...p, tint: 'rgba(0,0,0,0)' } : p, interior || locId === 'festival' ? 'clear' : weather, seed) +
    `</svg>`;
}
