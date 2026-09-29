// Tiny DOM helper. Text always goes in as text nodes, never as HTML, so nothing
// that comes from an AI reply, a save file or a friend's message can inject markup.

export function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'style' && typeof v === 'object') {
        // Custom properties (--p, --c) only work through setProperty.
        for (const [prop, val] of Object.entries(v)) {
          if (prop.startsWith('--')) el.style.setProperty(prop, String(val));
          else el.style[prop] = val;
        }
      }
      else if (k === 'dataset') Object.assign(el.dataset, v);
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
      else el.setAttribute(k, v === true ? '' : String(v));
    }
  }
  append(el, kids);
  return el;
}

export function append(el, kids) {
  for (const k of kids.flat(Infinity)) {
    if (k == null || k === false) continue;
    el.append(k.nodeType ? k : document.createTextNode(String(k)));
  }
  return el;
}

export function clear(el) {
  el.replaceChildren();
  return el;
}

export const $ = (sel, root = document) => root.querySelector(sel);

/** Wait for a number of milliseconds (resolves immediately if reduced motion asks for it). */
export const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/** Trusted static SVG markup only (icons, art we generate ourselves). */
export function svgEl(markup, className = '') {
  const t = document.createElement('template');
  t.innerHTML = markup.trim();
  const el = t.content.firstElementChild;
  if (className) el.setAttribute('class', className);
  return el;
}

export function fmtMoney(n) {
  return `$${n}`;
}
