// Illustrated SVG portraits shared by scenes, the title screen and small avatars.
// Validate user-authored colors and style names before they reach the markup.
export const HAIR_STYLES = ['bob', 'curly', 'long', 'buzz', 'choppy', 'puff', 'bun'];
export const OUTFITS = ['apron', 'hoodie', 'jacket', 'cardigan', 'flannel', 'knit'];
export const FACES = ['oval', 'round', 'square'];
export const EXTRAS = ['hoops', 'hoops_big', 'studs', 'glasses', 'stubble', 'beard', 'headphones', 'headphones_neck', 'smudge', 'towel', 'freckles'];
const HEX = /^#[0-9a-f]{6}$/i;
const hex = (v, d) => typeof v === 'string' && HEX.test(v) ? v : d;
let nextPortrait = 0;

export function mix(a, b, t) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const ch = s => Math.round(((pa >> s) & 255) * (1 - t) + ((pb >> s) & 255) * t);
  return '#' + [ch(16), ch(8), ch(0)].map(v => v.toString(16).padStart(2, '0')).join('');
}
export function shade(h, amt) {
  const n = parseInt(h.slice(1), 16);
  const f = c => Math.max(0, Math.min(255, Math.round(amt < 0 ? c * (1 + amt) : c + (255 - c) * amt)));
  return '#' + [n >> 16, (n >> 8) & 255, n & 255].map(c => f(c).toString(16).padStart(2, '0')).join('');
}
const path = (d, fill, attrs = '') => `<path d="${d}" fill="${fill}" ${attrs}/>`;
const line = (d, color, width = 2, opacity = 1) => path(d, 'none', `stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" opacity="${opacity}"`);

// Expression changes stay small enough to preserve the person's face.
const EXPR = {
  neutral:   { eye: 'open', brow: [0, 0, 0], mouth: 'neutral', blush: .07 },
  happy:     { eye: 'soft', brow: [-2, -2, 0], mouth: 'smile', blush: .14 },
  laugh:     { eye: 'closed', brow: [-3, -3, 0], mouth: 'laugh', blush: .2 },
  smirk:     { eye: 'soft', brow: [0, -4, 0], mouth: 'smirk', blush: .08 },
  sad:       { eye: 'soft', brow: [1, 1, 1], mouth: 'frown', blush: .04 },
  worried:   { eye: 'open', brow: [-1, -1, 1], mouth: 'uneasy', look: [0, 1], blush: .04 },
  surprised: { eye: 'wide', brow: [-6, -6, 0], mouth: 'oh', blush: .08 },
  annoyed:   { eye: 'half', brow: [1, 1, -1], mouth: 'flat', blush: .03 },
  blush:     { eye: 'soft', brow: [-1, -1, .3], mouth: 'small', look: [1, 2], blush: .3 },
  thinking:  { eye: 'open', brow: [0, -4, 0], mouth: 'side', look: [3, -1], blush: .04 },
  sleepy:    { eye: 'half', brow: [1, 1, 0], mouth: 'small', blush: .07 },
  serious:   { eye: 'open', brow: [0, 0, -.5], mouth: 'flat', blush: .03 },
};
const HEAD = {
  oval: 'M127 192 C125 142 150 112 198 112 C248 112 276 145 273 195 L269 238 C266 272 236 307 204 311 C173 312 140 278 132 246 Z',
  round: 'M124 193 C122 145 152 116 199 116 C247 116 277 146 276 193 L272 236 C268 274 238 304 203 307 C166 307 133 273 128 238 Z',
  square: 'M125 189 C124 142 153 113 199 113 C247 113 276 143 275 192 L272 242 C268 270 258 284 239 299 Q201 322 164 300 C141 287 132 270 128 242 Z',
};

function eyes(e, c, id) {
  return [-1, 1].map((side, i) => {
    const x = 200 + side * 34;
    const lid = e.eye === 'half' ? 3.5 : e.eye === 'soft' ? 8 : e.eye === 'wide' ? 14 : 10.5;
    const low = e.eye === 'wide' ? 10 : 7;
    const shape = `M-17 0 C-9 ${-lid} 7 ${-lid} 17 0 C8 ${low} -8 ${low} -17 0 Z`;
    if (e.eye === 'closed') return `<g transform="translate(${x} 211)">${line('M-16 1 Q0 -10 16 1', c.feature, 2.5)}${line('M-13 5 Q0 9 12 5', c.shadow, 1, .35)}</g>`;
    const [dx, dy] = e.look || [0, 0];
    const eyeId = `${id}-eye-${i}`;
    return `<g transform="translate(${x} 211)"><defs><clipPath id="${eyeId}">${path(shape, '#fff')}</clipPath></defs>` + path(shape, '#f7f1e9') +
      `<g clip-path="url(#${eyeId})"><circle cx="${dx}" cy="${dy}" r="7.6" fill="${c.eyes}"/><circle cx="${dx}" cy="${dy}" r="3.6" fill="#24212a"/><circle cx="${dx - 2}" cy="${dy - 2.8}" r="1.7" fill="#fffaf0"/><path d="M-17 -5 H17" stroke="${c.feature}" stroke-width="3" opacity=".12"/></g>` +
      line(`M-17 0 C-9 ${-lid} 7 ${-lid} 17 0`, c.feature, 2.3) + line(`M-16 1 C-7 ${low} 8 ${low} 16 1`, c.shadow, 1.15, .6) + line(`M${side * 17} 0 L${side * 20} -2`, c.feature, 1.6) + '</g>';
  }).join('');
}
function brows(e, c) {
  const [l, r, tilt] = e.brow;
  return [-1, 1].map((s, i) => {
    const y = 188 + (i ? r : l);
    return line(`M${200 + s * 52} ${y + tilt * 3} Q${200 + s * 36} ${y - 5} ${200 + s * 18} ${y - tilt * 4}`, c.brow, 3.7, .9);
  }).join('');
}
function mouth(type, c) {
  const lip = c.lip;
  let d = 'M182 272 C190 274 195 271 200 272 Q210 275 218 270';
  if (type === 'smile') d = 'M179 270 Q200 283 221 269';
  if (type === 'smirk') d = 'M181 273 Q204 280 222 268';
  if (type === 'frown') d = 'M183 277 Q200 269 217 277';
  if (type === 'uneasy') d = 'M184 275 Q195 271 203 274 L217 275';
  if (type === 'flat') d = 'M182 274 Q200 276 218 273';
  if (type === 'small') d = 'M187 273 Q200 279 214 271';
  if (type === 'side') d = 'M187 274 Q201 270 215 274';
  if (type === 'laugh') return path('M180 268 Q200 276 221 267 Q218 287 201 288 Q185 287 180 268 Z', '#5a2230', `stroke="${lip}" stroke-width="1.3"`) + path('M184 271 Q200 276 217 270 L214 277 Q199 282 186 277 Z', '#fcf4e8') + line('M193 291 Q201 293 209 290', lip, 1.3, .35);
  if (type === 'oh') return `<ellipse cx="201" cy="275" rx="5.5" ry="7" fill="#5a2230"/>` + line('M195 285 Q201 288 207 284', lip, 1, .3);
  return line(d, lip, 2.1) + line('M192 281 Q201 284 210 280', lip, 1.7, .23);
}

function hairParts(h, c) {
  const col = c.hair, hi = shade(col, .18), edge = shade(col, -.22);
  const p = (d, fill = col) => path(d, fill, `stroke="${edge}" stroke-width="1.5" stroke-linejoin="round"`);
  const strand = d => line(d, hi, 2, .48);
  switch (h.style) {
    case 'bob': return {
      back: p('M116 202 C100 154 119 105 158 91 Q205 70 245 99 C283 118 293 158 287 204 L287 296 Q286 321 265 334 L240 325 L149 328 Q122 323 113 302 Z'),
      front: p('M119 214 C102 152 132 99 180 92 Q239 72 270 124 C288 151 286 180 276 211 L260 189 Q258 151 237 134 C215 163 183 177 140 167 Q137 196 128 214 Z') + p('M126 184 Q126 241 139 289 L153 313 Q126 309 118 288 Q111 231 117 197 Z') + strand('M183 103 Q152 121 141 153 M239 118 Q208 150 165 157') + (h.streak ? line('M148 116 Q130 149 133 180', h.streak, 4.5, .75) : ''),
    };
    case 'curly': return {
      back: p('M120 215 Q105 204 111 185 Q98 169 110 155 Q105 132 126 127 Q127 105 151 107 Q161 85 181 97 Q201 79 220 96 Q243 85 255 109 Q278 107 280 132 Q299 145 287 163 Q298 184 282 198 L274 222 L261 190 L137 189 L129 218 Z'),
      front: p('M118 181 Q111 163 127 151 Q120 135 141 128 Q143 111 163 121 Q172 103 191 116 Q209 101 224 118 Q249 111 253 132 Q278 131 277 153 Q290 171 274 190 Q262 183 257 164 Q246 175 235 158 Q222 172 208 157 Q192 172 178 158 Q163 175 148 163 Q142 189 128 193 Z') + strand('M134 148 Q129 134 145 137 M163 134 Q155 122 169 121 M193 127 Q194 116 207 123 M226 139 Q237 129 243 140 M259 157 Q273 152 270 166'),
    };
    case 'long': return {
      back: p('M113 188 C107 129 141 88 194 87 Q262 80 284 145 Q298 187 286 232 C282 281 297 336 312 404 Q284 426 251 405 L148 407 Q113 427 87 404 C107 340 110 276 112 234 Z'),
      mid: p('M119 183 Q117 245 106 290 Q90 346 106 407 L153 416 Q134 351 145 302 Q134 248 141 186 Z') + p('M260 176 Q275 239 263 286 Q270 353 252 413 L294 406 Q313 357 290 300 Q278 249 283 201 Z') + strand('M127 265 Q111 340 127 399 M279 282 Q296 347 278 396'),
      front: p('M120 206 C101 141 144 91 196 91 Q253 80 279 132 Q292 163 278 214 L263 182 Q253 140 215 120 C198 141 172 159 140 176 Q137 195 129 215 Z') + strand('M207 102 Q178 139 143 153 M221 104 Q255 113 269 151'),
    };
    case 'buzz': return {
      back: '',
      front: p('M126 198 L122 161 Q121 121 157 104 Q190 86 226 100 Q270 106 278 149 L274 202 L263 190 L260 160 Q241 146 218 150 Q190 157 164 146 Q140 155 138 188 Z') + strand('M144 134 Q172 112 198 120 M155 128 Q187 105 219 119 M216 135 Q246 123 261 145') + line('M132 172 L133 193 M269 171 L268 195', shade(col, .3), 2, .5),
    };
    case 'choppy': {
      const under = hex(h.under, '#302b31'), dye = mix(col, '#637967', .55);
      return {
        back: p('M121 202 Q108 166 125 133 Q145 99 194 97 Q250 94 274 137 Q286 166 275 207 L264 225 L256 164 L140 172 L134 223 Z', under),
        front: p('M117 180 Q112 145 131 126 L155 117 Q160 99 182 97 L177 108 Q204 85 236 100 L232 107 Q259 107 272 129 L262 135 Q281 145 281 165 Q257 154 240 157 Q221 178 197 173 L211 159 Q179 177 152 167 L129 188 Z', dye) + line('M154 146 Q196 143 224 116 M202 150 Q235 136 250 125', shade(dye, .24), 3, .6) + line('M129 194 L132 213 M272 190 L269 213', shade(under, .25), 2, .65),
      };
    }
    case 'puff': return {
      back: p('M135 135 Q114 123 121 103 Q108 86 124 74 Q120 52 143 49 Q153 29 174 40 Q193 23 211 37 Q235 25 246 46 Q268 45 272 65 Q291 75 279 95 Q289 116 269 133 Z') + p('M120 198 Q108 152 131 125 Q157 102 198 104 Q247 99 271 135 Q286 159 279 199 L266 220 L252 163 L146 164 L134 219 Z'),
      front: p('M127 194 Q117 151 146 128 Q180 110 208 118 Q251 110 271 153 L274 195 L261 178 Q251 150 233 151 Q215 139 200 148 Q175 139 154 158 L138 185 Z') + strand('M141 81 Q131 65 148 62 M170 59 Q176 43 191 51 M215 57 Q232 45 240 64 M255 88 Q271 79 270 97'),
    };
    case 'bun': return {
      back: p('M168 102 Q148 82 168 64 Q193 43 221 61 Q247 79 228 102 Z') + p('M117 199 Q108 145 135 117 Q159 94 199 95 Q244 92 271 127 Q288 153 280 201 L266 219 L135 220 Z'),
      front: p('M125 200 Q117 141 157 119 Q189 99 225 115 Q270 129 277 200 L263 183 Q245 148 206 137 Q169 143 140 179 L136 202 Z') + strand('M171 79 Q195 60 219 79 M134 154 Q162 123 193 122 M212 120 Q245 124 266 153'),
    };
    default: return { back: '', front: '' };
  }
}

const TORSO = 'M23 520 L32 422 Q38 386 94 367 L154 345 Q198 333 246 345 L303 367 Q359 386 368 422 L378 520 Z';
function outfit(o, broad, id) {
  const b = o.color, dark = shade(b, -.2), ink = shade(b, -.4), a = o.accent;
  const p = (d, fill = b) => path(d, fill, `stroke="${ink}" stroke-width="1.7" stroke-linejoin="round"`);
  const seams = line('M82 393 Q99 441 91 520 M318 393 Q302 441 310 520', dark, 2.2, .65);
  let details = '', collar = '', back = '';
  if (o.type === 'apron') {
    details = p('M146 381 Q200 396 254 381 L269 520 L129 520 Z', a) + line('M154 349 L149 391 M246 349 L251 391', a, 10) + p('M165 451 L234 451 L231 491 Q200 504 168 491 Z', shade(a, -.08)) + line('M171 458 H227', o.trim, 1.2, .65);
    collar = line('M154 347 Q200 380 246 347', shade(b, -.14), 3);
  } else if (o.type === 'jacket') {
    details = p('M165 346 Q200 372 235 346 L239 520 L160 520 Z', a) + p('M154 345 L171 336 L186 405 L159 390 L167 408 L145 450 Z', shade(b, .08)) + p('M246 345 L229 336 L215 405 L241 390 L232 408 L255 450 Z', shade(b, .04)) + line('M116 431 L147 429 M255 429 L286 431', ink, 2, .65) + `<circle cx="145" cy="394" r="4.5" fill="${o.trim}"/><circle cx="256" cy="476" r="2.4" fill="${o.trim}"/>`;
    collar = line('M172 352 Q200 366 228 352', shade(a, -.16), 3);
  } else if (o.type === 'cardigan') {
    details = p('M165 345 Q199 364 235 345 L226 520 L172 520 Z', a) + line('M158 349 Q180 399 182 520 M242 349 Q220 399 218 520', shade(b, .12), 6) + [415, 452, 489].map(y => `<circle cx="219" cy="${y}" r="2.8" fill="${o.trim}"/>`).join('');
    collar = line('M169 351 Q200 376 232 351', shade(a, -.16), 3);
  } else if (o.type === 'hoodie') {
    back = p('M126 359 Q114 305 168 304 L232 304 Q284 305 275 359 L249 383 L150 383 Z', dark);
    details = line('M117 520 L132 468 Q200 454 268 468 L283 520', shade(b, .12), 2) + line('M179 379 L172 438 M221 379 L228 434', o.trim, 2.5, .85) + line('M172 436 L172 445 M228 432 L228 441', ink, 3);
    collar = p('M150 346 Q165 362 200 369 Q234 362 250 346 L241 374 Q224 390 200 391 Q176 390 159 374 Z', dark) + line('M163 354 Q200 382 237 354', shade(b, .2), 2);
  } else if (o.type === 'flannel') {
    let plaid = '';
    for (let x = 45; x < 370; x += 38) plaid += line(`M${x} 345 V520`, dark, 8, .4);
    for (let y = 380; y < 520; y += 35) plaid += line(`M20 ${y} H380`, shade(b, .25), 5, .3);
    details = `<g clip-path="url(#${id}-shirt)">${plaid}</g>` + p('M167 345 Q200 366 233 345 L215 414 L185 414 Z', a) + p('M154 345 L171 336 L194 400 L165 383 Z', shade(b, .1)) + p('M246 345 L229 336 L206 400 L235 383 Z', shade(b, .07)) + line('M200 403 V520', ink, 2) + [425, 462, 499].map(y => `<circle cx="205" cy="${y}" r="2.3" fill="${o.trim}"/>`).join('');
  } else {
    let ribs = '';
    for (let x = 63; x < 355; x += 14) ribs += line(`M${x} 370 V520`, dark, 1.2, .35);
    details = `<g clip-path="url(#${id}-shirt)">${ribs}</g>`;
    collar = p('M149 346 Q200 380 251 346 L245 363 Q200 399 155 363 Z', shade(b, .07)) + line('M158 352 Q200 382 242 352', dark, 2, .6);
  }
  const wrap = s => `<g${broad ? ' transform="translate(200 0) scale(1.07 1) translate(-200 0)"' : ''}>${s}</g>`;
  return { back: wrap(back), body: wrap(p(TORSO) + seams + details), collar: wrap(collar) };
}

function accessories(ex, c) {
  let face = '', front = '', body = '';
  const beard = 'M132 244 Q140 262 152 268 Q164 283 181 285 Q200 294 219 284 Q244 280 269 242 Q267 277 246 298 Q224 314 202 314 Q174 310 154 294 Q136 277 132 244 Z';
  if (ex.includes('beard') || ex.includes('stubble')) {
    const full = ex.includes('beard');
    face += path(beard, c.hair, `opacity="${full ? .76 : .18}"`) + path('M181 260 Q192 255 201 259 Q211 255 221 260 L223 266 Q210 263 201 264 Q190 263 179 267 Z', c.hair, `opacity="${full ? .8 : .22}"`);
    if (full) face += line('M161 286 L168 296 M181 299 L185 307 M215 301 L214 307 M240 284 L235 294', shade(c.hair, .3), 1.3, .55);
  }
  if (ex.includes('freckles')) for (const [x,y] of [[149,237],[159,241],[170,237],[232,237],[242,241],[251,235]]) face += `<circle cx="${x}" cy="${y}" r="1.2" fill="${c.shadow}" opacity=".5"/>`;
  if (ex.includes('smudge')) face += line('M246 241 L256 237', '#c98194', 3, .6);
  if (ex.includes('glasses')) {
    const gold = mix(c.trim, '#785e42', .3);
    front += path('M142 197 Q166 190 190 198 L188 216 Q185 228 167 230 Q146 229 143 216 Z M210 198 Q234 190 258 197 L257 216 Q254 229 235 230 Q215 228 212 216 Z', '#ffffff', `fill-opacity=".04" stroke="${gold}" stroke-width="2.5"`) + line('M191 205 Q200 201 209 205 M142 202 L129 198 M258 202 L271 198', gold, 2.2) + line('M148 201 L155 198 M219 200 L228 197', '#fff8ea', 1.8, .45);
  }
  if (ex.includes('hoops') || ex.includes('hoops_big')) {
    const ry = ex.includes('hoops_big') ? 13 : 8;
    front += [-1,1].map(s => `<ellipse cx="${200+s*76}" cy="${247+ry}" rx="${ry*.65}" ry="${ry}" fill="none" stroke="#d7ae62" stroke-width="2.5"/>`).join('');
  }
  if (ex.includes('studs')) front += '<circle cx="124" cy="236" r="2.2" fill="#e3dbce"/><circle cx="125" cy="244" r="2.2" fill="#e3dbce"/><circle cx="277" cy="241" r="2.2" fill="#e3dbce"/>';
  if (ex.includes('towel')) body += path('M89 369 L125 354 Q117 410 135 477 L103 488 Q88 433 89 369 Z', '#ece1ce', 'stroke="#c4b7a3" stroke-width="1.5"') + line('M100 434 L126 429 M102 444 L128 439', '#bb6658', 2.4, .7);
  if (ex.includes('headphones_neck')) body += line('M138 343 Q140 397 200 403 Q260 397 263 343', '#353440', 8) + '<rect x="131" y="342" width="21" height="42" rx="9" fill="#3d3b43" transform="rotate(-14 141 362)"/><rect x="249" y="342" width="21" height="42" rx="9" fill="#3d3b43" transform="rotate(14 259 362)"/>' + line('M142 352 L145 371 M258 352 L255 371', '#bf7763', 7);
  if (ex.includes('headphones')) front += line('M116 211 C108 57 287 57 284 211', '#292830', 9) + line('M116 189 C115 70 287 70 284 190', '#55515c', 3, .7) + '<rect x="108" y="202" width="19" height="48" rx="8" fill="#3c3944"/><rect x="274" y="202" width="19" height="48" rx="8" fill="#3c3944"/>' + '<rect x="112" y="211" width="8" height="30" rx="4" fill="#bca06c"/><rect x="281" y="211" width="8" height="30" rx="4" fill="#bca06c"/>';
  return { face, front, body };
}

/** Return a full bust, or a close crop for phone and journal avatars. */
export function portraitSVG(look = {}, mood = 'neutral', { crop = false } = {}) {
  const id = `portrait-${++nextPortrait}`; // Keep SVG paint servers unique across characters.
  const ex = Array.isArray(look.extras) ? look.extras.filter(e => EXTRAS.includes(e)) : [];
  const face = FACES.includes(look.face) ? look.face : 'oval';
  const e = EXPR[mood] || EXPR.neutral;
  const skin = hex(look.skin, '#e8c4a0'), hairColor = hex(look.hair?.color, '#2a2028');
  const rgb = [1, 3, 5].map(i => parseInt(skin.slice(i, i + 2), 16));
  const darkSkin = rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722 < 100;
  const c = { skin, hair: hairColor, eyes: hex(look.eyes, '#3a2a20'), brow: hex(look.brow, hairColor), shadow: darkSkin ? mix(skin, '#332328', .32) : mix(skin, '#744c43', .36), feature: mix(hairColor, '#382b30', .65), lip: mix(skin, darkSkin ? '#cb8d83' : '#844c50', .65), trim: hex(look.outfit?.trim, '#d8a24a') };
  const hair = hairParts({ style: HAIR_STYLES.includes(look.hair?.style) ? look.hair.style : 'bob', streak: hex(look.hair?.streak, ''), under: hex(look.hair?.under, '#302b31') }, c);
  const of = look.outfit || {};
  const out = outfit({ type: OUTFITS.includes(of.type) ? of.type : 'cardigan', color: hex(of.color, '#6a5d8a'), accent: hex(of.accent, '#efe6da'), trim: c.trim }, look.build === 'broad', id);
  const extra = accessories(ex, c);
  return `<svg class="portrait-svg" viewBox="${crop ? '96 78 208 270' : '0 0 400 520'}" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true" focusable="false">` +
    `<defs><linearGradient id="${id}-skin" x1="0" y1="0" x2="1" y2=".85"><stop stop-color="${shade(skin, .08)}"/><stop offset=".6" stop-color="${skin}"/><stop offset="1" stop-color="${mix(skin, c.shadow, .28)}"/></linearGradient><clipPath id="${id}-face">${path(HEAD[face], '#fff')}</clipPath><clipPath id="${id}-shirt">${path(TORSO, '#fff')}</clipPath></defs>` +
    `<g class="p-body">${hair.back}${out.back}${out.body}` +
    path('M170 282 L170 332 Q167 341 154 346 Q200 378 246 346 Q234 341 230 332 L230 282 Z', skin, `stroke="${c.shadow}" stroke-width="1.5"`) + path('M170 286 L230 286 L231 326 Q198 341 170 312 Z', c.shadow, 'opacity=".5"') + out.collar + (hair.mid || '') + extra.body +
    `<ellipse cx="126" cy="222" rx="10" ry="21" fill="${skin}"/><ellipse cx="275" cy="222" rx="10" ry="21" fill="${skin}"/>` + line('M122 218 Q131 215 128 232 M279 216 Q271 215 273 232', c.shadow, 1.7, .75) +
    path(HEAD[face], `url(#${id}-skin)`, `stroke="${c.shadow}" stroke-width="1.6"`) + `<g clip-path="url(#${id}-face)">` + path('M128 213 Q138 272 174 294 Q198 309 216 307 Q181 325 155 293 Q129 268 128 213 Z', c.shadow, 'opacity=".14"') + `<ellipse cx="151" cy="239" rx="18" ry="8" fill="#c87573" opacity="${e.blush}"/><ellipse cx="249" cy="239" rx="18" ry="8" fill="#c87573" opacity="${e.blush}"/>` + extra.face + '</g>' +
    path('M201 226 Q198 240 195 247 Q201 251 206 247 Q201 242 204 235 Z', c.shadow, 'opacity=".23"') + line('M192 248 Q195 250 198 249 M204 249 Q208 250 210 247', c.shadow, 1.3, .65) +
    `<g class="p-eyes">${eyes(e, c, id)}</g>${brows(e, c)}<g class="p-mouth"><g class="p-mouth-base">${mouth(e.mouth, c)}</g><ellipse class="p-mouth-talk" cx="201" cy="275" rx="7" ry="4.5" fill="#5a2230"/></g>` + hair.front + extra.front + '</g></svg>';
}
export function portraitElement(look, mood = 'neutral') {
  const el = document.createElement('div'); el.className = 'portrait'; el.innerHTML = portraitSVG(look, mood); return el;
}
export function setMood(el, look, mood) { el.innerHTML = portraitSVG(look, mood); }
export const MOOD_NAMES = Object.keys(EXPR);
