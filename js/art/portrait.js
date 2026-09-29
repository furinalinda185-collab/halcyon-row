// Parametric SVG portraits. One function turns a `look` (see data/characters) and a
// mood into a self contained SVG string. Every value that reaches the markup is
// validated (colors against a hex pattern, styles against fixed lists), so the string
// is safe to assign to innerHTML.

export const HAIR_STYLES = ['bob', 'curly', 'long', 'buzz', 'choppy', 'puff', 'bun'];
export const OUTFITS = ['apron', 'hoodie', 'jacket', 'cardigan', 'flannel', 'knit'];
export const FACES = ['oval', 'round', 'square'];
export const EXTRAS = [
  'hoops', 'hoops_big', 'studs', 'glasses', 'stubble', 'beard', 'headphones',
  'headphones_neck', 'smudge', 'towel', 'freckles',
];

const INK = '#1b1524';
const HEX = /^#[0-9a-f]{6}$/i;
const hex = (v, d) => (typeof v === 'string' && HEX.test(v) ? v : d);

/** Blend two hex colors. t = 0 gives a, t = 1 gives b. */
export function mix(a, b, t) {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (s) => Math.round(((pa >> s) & 255) * (1 - t) + ((pb >> s) & 255) * t);
  return '#' + [ch(16), ch(8), ch(0)].map((v) => v.toString(16).padStart(2, '0')).join('');
}

function luminance(h) {
  const n = parseInt(h.slice(1), 16);
  return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
}

/** Lighten (amt > 0) or darken (amt < 0) a hex color. */
export function shade(h, amt) {
  const n = parseInt(h.slice(1), 16);
  const f = (c) => Math.max(0, Math.min(255, Math.round(amt < 0 ? c * (1 + amt) : c + (255 - c) * amt)));
  return '#' + [n >> 16, (n >> 8) & 255, n & 255].map((c) => f(c).toString(16).padStart(2, '0')).join('');
}

// ---------------------------------------------------------------- expressions

const EXPR = {
  neutral: { eyes: 'open', brow: [0, 0, 0], mouth: 'neutral', blush: 0.18 },
  happy: { eyes: 'open', brow: [-4, -4, 0], mouth: 'smile', blush: 0.28 },
  laugh: { eyes: 'arc', brow: [-6, -6, 0], mouth: 'laugh', blush: 0.4 },
  smirk: { eyes: 'open', brow: [0, -8, 0], mouth: 'smirk', blush: 0.15 },
  sad: { eyes: 'droop', brow: [2, 2, 1], mouth: 'frown', blush: 0.1 },
  worried: { eyes: 'open', look: [0, 3], brow: [-3, -3, 1], mouth: 'wobble', blush: 0.12 },
  surprised: { eyes: 'wide', brow: [-12, -12, 0], mouth: 'oh', blush: 0.2 },
  annoyed: { eyes: 'lid', brow: [2, 2, -1], mouth: 'flat', blush: 0.08 },
  blush: { eyes: 'down', brow: [-2, -2, 0], mouth: 'tiny', blush: 0.6 },
  thinking: { eyes: 'open', look: [8, -6], brow: [0, -9, 0], mouth: 'side', blush: 0.12 },
  sleepy: { eyes: 'half', brow: [3, 3, 0], mouth: 'tiny', blush: 0.15 },
  serious: { eyes: 'open', brow: [1, 1, -0.6], mouth: 'flat', blush: 0.1 },
};

// -------------------------------------------------------------------- faces

const HEAD = {
  oval: 'M125 225 C125 165 158 128 200 128 C242 128 275 165 275 225 C275 285 245 345 200 350 C155 345 125 285 125 225 Z',
  round: 'M120 232 C120 170 155 130 200 130 C245 130 280 170 280 232 C280 292 245 342 200 346 C155 342 120 292 120 232 Z',
  square: 'M126 210 C126 160 158 130 200 130 C242 130 274 160 274 210 L270 290 C268 322 240 348 200 350 C160 348 132 322 130 290 Z',
};

const JAW_SHADOW = {
  oval: 'M136 300 C150 336 175 352 200 352 C225 352 250 336 264 300 C250 322 228 334 200 334 C172 334 150 322 136 300 Z',
  round: 'M132 296 C146 332 172 348 200 348 C228 348 254 332 268 296 C254 318 228 330 200 330 C172 330 146 318 132 296 Z',
  square: 'M132 296 C138 326 165 350 200 352 C235 350 262 326 268 296 C256 318 230 332 200 332 C170 332 144 318 132 296 Z',
};

// --------------------------------------------------------------------- eyes

function eye(cx, cy, side, type, look, c) {
  const [lx, ly] = look || [0, 0];
  const line = c.brow;
  const sclera = `<ellipse rx="15" ry="17" fill="#fbf7f2" stroke="${INK}" stroke-width="2"/>`;
  const iris = (dx, dy, r = 10.5, pr = 5.4) =>
    `<circle cx="${dx}" cy="${dy}" r="${r}" fill="${c.eyes}"/><circle cx="${dx}" cy="${dy}" r="${pr}" fill="#120c10"/>` +
    `<circle cx="${dx - 3.2}" cy="${dy - 4}" r="3.2" fill="#fff"/><circle cx="${dx + 3.5}" cy="${dy + 3.5}" r="1.4" fill="#fff" opacity="0.7"/>`;
  const lid = (d, w = 4.6) => `<path d="${d}" fill="none" stroke="${line}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  let inner;
  switch (type) {
    case 'arc':
      inner = lid('M-15 5 Q0 -14 15 5', 5.4);
      break;
    case 'wide':
      inner = `<ellipse rx="16.5" ry="20.5" fill="#fbf7f2" stroke="${INK}" stroke-width="2"/>${iris(lx, ly, 8.5, 4)}` + lid('M-17 -12 Q0 -30 17 -12', 4);
      break;
    case 'half':
      inner = `${sclera}${iris(lx, ly + 3)}<path d="M-16 -18 H16 V-1 Q0 3 -16 -1 Z" fill="${c.skin}"/>` + lid('M-16 -1 Q0 4 16 -1', 4.6);
      break;
    case 'lid': {
      const s = side; // slanted lid so it reads as annoyed, not sleepy
      inner = `${sclera}${iris(lx, ly + 1)}<path d="M-16 -18 H16 V${-3 - 5 * s} L-16 ${-3 + 5 * s} Z" fill="${c.skin}"/>` + lid(`M-16 ${-3 + 5 * s} L16 ${-3 - 5 * s}`, 4.8);
      break;
    }
    case 'droop':
      inner = `${sclera}${iris(lx, ly + 2)}` + lid(`M-17 ${-4 - 3 * side} Q0 -22 17 ${-2 + 6 * side}`);
      break;
    case 'down':
      inner = `${sclera}${iris(lx, ly + 6, 10, 5)}<path d="M-16 -18 H16 V-4 Q0 4 -16 -4 Z" fill="${c.skin}"/>` + lid('M-16 -4 Q0 4 16 -4', 4.4);
      break;
    default:
      inner = `${sclera}${iris(lx, ly)}` + lid('M-17 -7 Q0 -25 17 -7');
  }
  return `<g transform="translate(${cx} ${cy})">${inner}</g>`;
}

function brows(o, c) {
  const [raiseL, raiseR, tilt] = o;
  const one = (side, raise) => {
    // side -1 left, +1 right. Points run from outer to inner.
    const ox = 200 + side * 54;
    const ix = 200 + side * 16;
    // tilt > 0 lifts the inner end (worried, sad); tilt < 0 drops it (annoyed, serious).
    const by = 213 + raise;
    const outer = by + tilt * 6;
    const inner = by - tilt * 9;
    const arch = by - 7 + (tilt < 0 ? 2 : 0);
    return `<path d="M${ox} ${outer} Q${(ox + ix) / 2} ${arch} ${ix} ${inner}" fill="none" stroke="${c.brow}" stroke-width="6.5" stroke-linecap="round"/>`;
  };
  return one(-1, raiseL) + one(1, raiseR);
}

// -------------------------------------------------------------------- mouths

function mouth(type, c) {
  const ink = c.lipInk;
  const line = (d, w = 4) => `<path d="${d}" fill="none" stroke="${ink}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  let shape;
  switch (type) {
    case 'smile': shape = line('M181 299 Q200 322 219 299', 4.6); break;
    case 'laugh':
      shape = `<path d="M177 296 Q200 338 223 296 Q200 302 177 296 Z" fill="#5a2230" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/>` +
        '<path d="M185 302 Q200 314 215 302 Q200 307 185 302 Z" fill="#fbf7f2"/>';
      break;
    case 'smirk': shape = line('M184 306 Q204 314 221 296', 4.6); break;
    case 'frown': shape = line('M185 315 Q200 301 215 315', 4.4); break;
    case 'wobble': shape = line('M184 311 Q192 303 200 311 T216 311', 4); break;
    case 'oh': shape = `<ellipse cx="200" cy="309" rx="8.5" ry="11.5" fill="#5a2230" stroke="${ink}" stroke-width="3"/>`; break;
    case 'flat': shape = line('M185 309 L215 308', 4.6); break;
    case 'tiny': shape = line('M189 306 Q200 314 211 306', 4.2); break;
    case 'side': shape = line('M189 309 Q203 304 214 311', 4.4); break;
    default: shape = line('M186 306 Q200 313 214 306', 4.4);
  }
  return `<g transform="translate(200 306) scale(1.22) translate(-200 -306)">${shape}</g>`;
}

// --------------------------------------------------------------------- hair

const outline = `stroke="${INK}" stroke-width="3" stroke-linejoin="round"`;

function hairParts(h, c) {
  const col = c.hair;
  const hi = shade(col, 0.16);
  const P = (d, fill = col, extra = '') => `<path d="${d}" fill="${fill}" ${outline} ${extra}/>`;
  const streak = h.streak
    ? `<path d="M156 136 C146 152 142 168 144 186" fill="none" stroke="${hex(h.streak, '#3fd0c0')}" stroke-width="9" stroke-linecap="round"/>`
    : '';
  switch (h.style) {
    case 'bob':
      return {
        back: P('M110 232 C104 158 146 104 200 104 C254 104 296 158 290 232 C290 292 282 336 262 354 L138 354 C118 336 110 292 110 232 Z'),
        front: P('M116 214 C112 146 152 108 200 108 C248 108 288 146 284 214 C274 190 262 170 240 160 C226 182 192 190 152 176 C138 186 126 198 116 214 Z') + streak +
          `<path d="M170 122 C186 116 214 116 232 124" fill="none" stroke="${hi}" stroke-width="6" stroke-linecap="round" opacity="0.5"/>`,
      };
    case 'curly': {
      const blobs = (list, fill) => list.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${outline}/>`).join('');
      return {
        back: blobs([[124, 200, 28], [276, 200, 28], [120, 156, 30], [280, 156, 30], [150, 118, 34], [200, 106, 36], [250, 118, 34]], col),
        front: blobs([[146, 150, 24], [182, 138, 26], [222, 138, 26], [258, 152, 24], [128, 178, 18], [272, 178, 18]], col) +
          `<circle cx="192" cy="128" r="6" fill="${hi}" opacity="0.5"/>`,
      };
    }
    case 'long':
      return {
        back: P('M106 232 C100 150 148 100 200 100 C252 100 300 150 294 232 L304 440 L96 440 Z'),
        mid: P('M112 236 C108 300 100 370 92 450 L152 450 C148 390 140 322 140 270 Z') + P('M288 236 C292 300 300 370 308 450 L248 450 C252 390 260 322 260 270 Z'),
        front: P('M116 218 C114 150 154 108 200 108 C246 108 286 150 284 218 C272 186 246 162 214 146 L200 142 L186 146 C154 162 128 186 116 218 Z') +
          `<path d="M200 108 L200 142" stroke="${INK}" stroke-width="2.5" opacity="0.6"/>`,
      };
    case 'buzz':
      return {
        back: '',
        front: `<path d="M126 198 C124 152 158 126 200 126 C242 126 276 152 274 198 C262 172 238 158 200 156 C162 158 138 172 126 198 Z" fill="${col}" ${outline} opacity="0.92"/>`,
      };
    case 'choppy': {
      const under = hex(h.under, '#231f2b');
      return {
        back: `<path d="M120 214 C114 150 148 104 200 100 C252 104 286 150 280 214 L272 250 L128 250 Z" fill="${under}" ${outline}/>`,
        front: P('M118 196 L112 146 L146 120 L154 88 L186 110 L212 78 L236 108 L266 92 L274 132 L288 196 C268 170 244 154 204 152 C162 154 136 170 118 196 Z') +
          `<path d="M178 104 L196 122 M224 100 L232 118" stroke="${hi}" stroke-width="5" stroke-linecap="round" opacity="0.6"/>`,
      };
    }
    case 'puff':
      return {
        back: `<ellipse cx="200" cy="112" rx="104" ry="92" fill="${col}" ${outline}/>` +
          `<ellipse cx="200" cy="96" rx="70" ry="52" fill="${hi}" opacity="0.12"/>`,
        front: `<path d="M124 200 C122 150 158 126 200 126 C242 126 278 150 276 200 C262 172 238 158 200 156 C162 158 138 172 124 200 Z" fill="${col}" ${outline}/>`,
      };
    case 'bun':
      return {
        back: `<circle cx="200" cy="84" r="34" fill="${col}" ${outline}/><path d="M112 232 C108 160 146 112 200 112 C254 112 292 160 288 232 L280 250 L120 250 Z" fill="${col}" ${outline}/>`,
        front: `<path d="M124 204 C122 154 158 124 200 124 C242 124 278 154 276 204 C264 176 238 158 200 156 C162 158 136 176 124 204 Z" fill="${col}" ${outline}/>`,
      };
    default:
      return { back: '', front: '' };
  }
}

// ------------------------------------------------------------------ outfits

const TORSO = 'M45 520 C45 452 84 408 156 396 L244 396 C316 408 355 452 355 520 Z';

function outfit(o, c, broad) {
  const base = o.color;
  const dark = shade(base, -0.2);
  const acc = o.accent;
  const trim = o.trim;
  const wrap = (inner) => `<g${broad ? ' transform="translate(200 0) scale(1.12 1) translate(-200 0)"' : ''}>${inner}</g>`;
  const torso = `<path d="${TORSO}" fill="${base}" ${outline}/>`;
  switch (o.type) {
    case 'apron':
      return {
        back: '',
        body: wrap(
          torso +
          `<path d="M160 398 L240 398 L268 520 L132 520 Z" fill="${acc}" ${outline}/>` +
          `<rect x="172" y="466" width="56" height="34" rx="5" fill="${shade(acc, -0.12)}" ${outline}/>` +
          `<path d="M176 474 H224" stroke="${trim}" stroke-width="3" stroke-dasharray="6 4"/>`,
        ),
        collar: wrap(`<path d="M160 400 Q200 366 240 400" fill="none" stroke="${acc}" stroke-width="10" stroke-linecap="round"/>` +
          `<path d="M160 400 Q200 370 240 400" fill="none" stroke="${INK}" stroke-width="2" opacity="0.5"/>`),
      };
    case 'hoodie':
      return {
        back: wrap(`<path d="M108 396 C104 340 146 318 200 318 C254 318 296 340 292 396 Z" fill="${dark}" ${outline}/>`),
        body: wrap(
          torso +
          `<path d="M45 500 H355" stroke="${acc}" stroke-width="10"/>` +
          `<path d="M150 400 Q200 448 250 400 Q236 372 200 372 Q164 372 150 400 Z" fill="${dark}" ${outline}/>` +
          `<path d="M188 424 L186 478 M212 424 L214 478" stroke="${trim}" stroke-width="4" stroke-linecap="round"/>`,
        ),
        collar: '',
      };
    case 'jacket':
      return {
        back: '',
        body: wrap(
          torso +
          `<path d="M166 398 L200 486 L234 398 Z" fill="${acc}" ${outline}/>` +
          `<path d="M156 396 L184 384 L178 440 Z M244 396 L216 384 L222 440 Z" fill="${shade(base, -0.14)}" ${outline}/>` +
          `<path d="M200 486 V520" stroke="${INK}" stroke-width="3"/>` +
          `<circle cx="132" cy="470" r="6" fill="${trim}" stroke="${INK}" stroke-width="2"/><circle cx="146" cy="492" r="5" fill="${shade(trim, -0.2)}" stroke="${INK}" stroke-width="2"/>`,
        ),
        collar: '',
      };
    case 'cardigan':
      return {
        back: '',
        body: wrap(
          torso +
          `<path d="M170 398 L200 452 L230 398 Z" fill="${acc}" ${outline}/>` +
          `<path d="M200 452 V520" stroke="${dark}" stroke-width="3"/>` +
          `<circle cx="200" cy="468" r="5" fill="${trim}" stroke="${INK}" stroke-width="2"/><circle cx="200" cy="498" r="5" fill="${trim}" stroke="${INK}" stroke-width="2"/>`,
        ),
        collar: '',
      };
    case 'flannel': {
      let plaid = '';
      for (let x = 70; x < 340; x += 30) plaid += `<path d="M${x} 400 V520" stroke="${dark}" stroke-width="5" opacity="0.5"/>`;
      for (let y = 420; y < 520; y += 28) plaid += `<path d="M50 ${y} H350" stroke="${shade(base, 0.18)}" stroke-width="4" opacity="0.4"/>`;
      return {
        back: '',
        body: wrap(
          torso +
          `<clipPath id="flannelclip"><path d="${TORSO}"/></clipPath>` +
          `<g clip-path="url(#flannelclip)">${plaid}</g>` +
          `<path d="${TORSO}" fill="none" ${outline}/>` +
          `<path d="M164 398 L200 446 L236 398 Z" fill="${acc}" ${outline}/>` +
          `<path d="M156 396 L184 384 L172 428 Z M244 396 L216 384 L228 428 Z" fill="${shade(base, -0.12)}" ${outline}/>`,
        ),
        collar: '',
      };
    }
    case 'knit': {
      let ribs = '';
      for (let x = 92; x < 320; x += 24) ribs += `<path d="M${x} 430 L${x - (x - 200) * 0.08} 520" stroke="${dark}" stroke-width="3" opacity="0.35"/>`;
      return {
        back: '',
        body: wrap(torso + ribs),
        collar: wrap(
          `<ellipse cx="200" cy="394" rx="60" ry="22" fill="${shade(base, 0.06)}" ${outline}/>` +
          `<ellipse cx="200" cy="390" rx="42" ry="13" fill="${shade(base, -0.4)}"/>`,
        ),
      };
    }
    default:
      return { back: '', body: `<path d="${TORSO}" fill="${base}" ${outline}/>`, collar: '' };
  }
}

// ------------------------------------------------------------------ extras

function extrasBefore(ex, c) {
  let s = '';
  if (ex.includes('towel')) {
    s += `<path d="M66 414 L124 396 L136 520 L74 520 Z" fill="#f2efe8" ${outline}/><path d="M76 440 L132 424 M78 470 L134 454" stroke="#c74b3b" stroke-width="5" opacity="0.7"/>`;
  }
  if (ex.includes('headphones_neck')) {
    s += `<path d="M132 388 Q200 452 268 388" fill="none" stroke="${INK}" stroke-width="12" stroke-linecap="round"/>` +
      `<rect x="118" y="374" width="30" height="42" rx="12" fill="#2a2532" ${outline}/><rect x="252" y="374" width="30" height="42" rx="12" fill="#2a2532" ${outline}/>` +
      '<rect x="124" y="384" width="18" height="22" rx="8" fill="#d95a4a"/><rect x="258" y="384" width="18" height="22" rx="8" fill="#d95a4a"/>';
  }
  return s;
}

function extrasFace(ex, c, face) {
  let s = '';
  if (ex.includes('beard')) {
    s += `<path d="M126 258 C126 320 160 354 200 356 C240 354 274 320 274 258 C268 292 250 320 200 324 C150 320 132 292 126 258 Z" fill="${c.hair}" ${outline} opacity="0.95"/>` +
      `<path d="M170 292 Q186 282 200 290 Q214 282 230 292 Q214 300 200 296 Q186 300 170 292 Z" fill="${c.hair}" ${outline}/>`;
  } else if (ex.includes('stubble')) {
    s += `<path d="${JAW_SHADOW[face]}" fill="${c.hair}" opacity="0.32"/>` +
      `<path d="M172 290 Q186 284 200 289 Q214 284 228 290 Q214 297 200 294 Q186 297 172 290 Z" fill="${c.hair}" opacity="0.3"/>`;
  }
  if (ex.includes('freckles')) {
    for (const [x, y] of [[152, 280], [162, 286], [170, 278], [230, 278], [238, 286], [248, 280]]) s += `<circle cx="${x}" cy="${y}" r="2" fill="${shade(c.skin, -0.3)}" opacity="0.6"/>`;
  }
  if (ex.includes('smudge')) {
    s += '<path d="M228 268 L252 262" stroke="#ff4f9a" stroke-width="7" stroke-linecap="round" opacity="0.85"/><path d="M236 280 L248 277" stroke="#ff4f9a" stroke-width="4" stroke-linecap="round" opacity="0.7"/>';
  }
  return s;
}

function extrasFront(ex, c) {
  let s = '';
  if (ex.includes('glasses')) {
    const fr = c.trim || '#d8a24a';
    s += `<circle cx="163" cy="246" r="26" fill="#ffffff" fill-opacity="0.14" stroke="${fr}" stroke-width="5"/><circle cx="237" cy="246" r="26" fill="#ffffff" fill-opacity="0.14" stroke="${fr}" stroke-width="5"/>` +
      `<path d="M189 244 Q200 236 211 244" fill="none" stroke="${fr}" stroke-width="5"/><path d="M137 240 L124 236 M263 240 L276 236" stroke="${fr}" stroke-width="4" stroke-linecap="round"/>` +
      '<path d="M148 232 L160 226 M222 232 L234 226" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity="0.5"/>';
  }
  if (ex.includes('hoops')) s += '<circle cx="126" cy="276" r="9" fill="none" stroke="#f2c14e" stroke-width="3.5"/><circle cx="274" cy="276" r="9" fill="none" stroke="#f2c14e" stroke-width="3.5"/>';
  if (ex.includes('hoops_big')) s += '<circle cx="124" cy="288" r="17" fill="none" stroke="#f2c14e" stroke-width="4.5"/><circle cx="276" cy="288" r="17" fill="none" stroke="#f2c14e" stroke-width="4.5"/>';
  if (ex.includes('studs')) s += '<circle cx="124" cy="252" r="3.6" fill="#e8e8f0" stroke="#1b1524" stroke-width="1.5"/><circle cx="124" cy="264" r="3.6" fill="#e8e8f0" stroke="#1b1524" stroke-width="1.5"/><circle cx="276" cy="256" r="3.6" fill="#e8e8f0" stroke="#1b1524" stroke-width="1.5"/>';
  return s;
}

function headphones() {
  return `<path d="M108 236 C104 98 296 98 292 236" fill="none" stroke="${INK}" stroke-width="15" stroke-linecap="round"/>` +
    '<path d="M108 236 C104 98 296 98 292 236" fill="none" stroke="#3b3346" stroke-width="9" stroke-linecap="round"/>' +
    `<rect x="94" y="214" width="34" height="74" rx="15" fill="#2a2532" ${outline}/><rect x="272" y="214" width="34" height="74" rx="15" fill="#2a2532" ${outline}/>` +
    '<rect x="101" y="228" width="20" height="46" rx="9" fill="#e2a83c"/><rect x="279" y="228" width="20" height="46" rx="9" fill="#e2a83c"/>';
}

// -------------------------------------------------------------------- main

/**
 * @param crop  true crops to the head, for small avatars
 * @param look  { face, skin, eyes, brow, hair:{style,color,streak?,under?}, outfit:{type,color,accent,trim}, extras[], build? }
 * @param mood  one of the keys of EXPR
 */
export function portraitSVG(look, mood = 'neutral', { crop = false } = {}) {
  const ex = Array.isArray(look.extras) ? look.extras.filter((e) => EXTRAS.includes(e)) : [];
  const face = FACES.includes(look.face) ? look.face : 'oval';
  const e = EXPR[mood] || EXPR.neutral;
  const skin = hex(look.skin, '#e8c4a0');
  const hairColor = hex(look.hair?.color, '#2a2028');
  const c = {
    skin,
    eyes: hex(look.eyes, '#3a2a20'),
    brow: hex(look.brow, hairColor),
    hair: hairColor,
    lipInk: luminance(skin) > 0.5 ? mix(skin, '#8a2f3c', 0.72) : mix(skin, '#f0a0a8', 0.55),
    trim: hex(look.outfit?.trim, '#d8a24a'),
  };
  const hairSpec = { ...(look.hair || {}), style: HAIR_STYLES.includes(look.hair?.style) ? look.hair.style : 'bob' };
  hairSpec.streak = hairSpec.streak ? hex(hairSpec.streak, '') : '';
  hairSpec.under = hairSpec.under ? hex(hairSpec.under, '') : '';
  const of = look.outfit || {};
  const oSpec = {
    type: OUTFITS.includes(of.type) ? of.type : 'cardigan',
    color: hex(of.color, '#6a5d8a'),
    accent: hex(of.accent, '#efe6da'),
    trim: hex(of.trim, '#d8a24a'),
  };
  const hair = hairParts(hairSpec, c);
  const out = outfit(oSpec, c, look.build === 'broad');
  const skinDark = shade(skin, -0.14);
  const cheek = Math.max(0, Math.min(0.7, e.blush));

  return `<svg class="portrait-svg" viewBox="${crop ? '84 78 232 300' : '0 0 400 520'}" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true" focusable="false">` +
    `<g class="p-body">` +
    hair.back + (out.back || '') +
    out.body +
    `<path d="M177 318 L177 400 Q200 416 223 400 L223 318 Z" fill="${skinDark}" ${outline}/>` +
    `<path d="M177 330 Q200 372 223 330 L223 318 L177 318 Z" fill="${shade(skin, -0.34)}" opacity="0.55"/>` +
    (out.collar || '') +
    (hair.mid || '') +
    extrasBefore(ex, c) +
    `<ellipse cx="123" cy="248" rx="13" ry="22" fill="${skin}" ${outline}/><ellipse cx="277" cy="248" rx="13" ry="22" fill="${skin}" ${outline}/>` +
    `<path d="${HEAD[face]}" fill="${skin}" ${outline}/>` +
    `<path d="${JAW_SHADOW[face]}" fill="${skinDark}" opacity="0.35"/>` +
    `<ellipse cx="146" cy="286" rx="17" ry="10" fill="#ff6f86" opacity="${cheek}"/><ellipse cx="254" cy="286" rx="17" ry="10" fill="#ff6f86" opacity="${cheek}"/>` +
    `<path d="M199 268 Q206 280 197 282" fill="none" stroke="${shade(skin, -0.36)}" stroke-width="3" stroke-linecap="round"/>` +
    extrasFace(ex, c, face) +
    `<g class="p-eyes">${eye(163, 246, -1, e.eyes, e.look, c)}${eye(237, 246, 1, e.eyes, e.look, c)}</g>` +
    brows(e.brow, c) +
    `<g class="p-mouth"><g class="p-mouth-base">${mouth(e.mouth, c)}</g><ellipse class="p-mouth-talk" cx="200" cy="309" rx="10" ry="7" fill="#5a2230" stroke="${c.lipInk}" stroke-width="2.5"/></g>` +
    extrasFront(ex, c) +
    hair.front +
    (ex.includes('headphones') ? headphones() : '') +
    `</g></svg>`;
}

/** Wraps a portrait in a div you can drop into the page and update with setMood(). */
export function portraitElement(look, mood = 'neutral') {
  const el = document.createElement('div');
  el.className = 'portrait';
  el.innerHTML = portraitSVG(look, mood);
  return el;
}

export function setMood(el, look, mood) {
  el.innerHTML = portraitSVG(look, mood);
}

export const MOOD_NAMES = Object.keys(EXPR);
