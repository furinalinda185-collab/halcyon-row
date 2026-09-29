// Scene script interpreter. Scenes are arrays of plain node objects (see dsl.js).
// The Runner walks them one presentable step at a time and applies effects to
// the game state as it goes. It never touches the DOM.

import { addPoints, completeScene } from './bond.js';
import { addStat, statLevel, STAT_INFO } from './stats.js';

const MAX_STEPS = 10000;
const MAX_NOTES = 24;

/** Replace {name} with the player's name. */
export function format(text, state) {
  return String(text ?? '').replaceAll('{name}', state.player.name);
}

/**
 * Evaluate a condition. Unknown keys throw on purpose so content typos fail in
 * tests instead of silently evaluating false.
 *
 *   {flag:'x'} {noflag:'x'} {rank:['junie',2]} {stat:['charm',2]} {money:20} {loc:'cafe'}
 *   {romance:'junie'}   they are open to more or together
 *   {romanceOn:'junie'} the player enabled romance and this friend supports it
 *   {day:['>=',5]} {item:'coffee'} {all:[...]} {any:[...]} {not:c}, or an array (AND)
 */
export function test(cond, env) {
  const { state } = env;
  if (cond == null || cond === true) return true;
  if (cond === false) return false;
  if (Array.isArray(cond)) return cond.every((c) => test(c, env));
  if ('all' in cond) return cond.all.every((c) => test(c, env));
  if ('any' in cond) return cond.any.some((c) => test(c, env));
  if ('not' in cond) return !test(cond.not, env);
  if ('flag' in cond) return Boolean(state.flags[cond.flag]);
  if ('noflag' in cond) return !state.flags[cond.noflag];
  if ('rank' in cond) return (state.bonds[cond.rank[0]]?.rank ?? 0) >= cond.rank[1];
  if ('stat' in cond) return statLevel(state, cond.stat[0]) >= cond.stat[1];
  if ('loc' in cond) return state.loc === cond.loc;
  if ('money' in cond) return state.player.money >= cond.money;
  if ('item' in cond) return (state.inv[cond.item] || 0) > 0;
  if ('romance' in cond) {
    const r = state.bonds[cond.romance]?.romance;
    return r === 'open' || r === 'together';
  }
  if ('romanceOn' in cond) return Boolean(env.prefs?.romanceEnabled) && Boolean(env.eligible?.(cond.romanceOn));
  if ('day' in cond) {
    const [op, n] = cond.day;
    const d = state.time.day;
    if (op === '>=') return d >= n;
    if (op === '<=') return d <= n;
    if (op === '==') return d === n;
    if (op === '<') return d < n;
    if (op === '>') return d > n;
  }
  throw new Error(`Unknown condition: ${JSON.stringify(cond)}`);
}

function hintFor(req) {
  if (req && !Array.isArray(req) && 'stat' in req) {
    const [name, min] = req.stat;
    return `Needs ${STAT_INFO[name]?.label ?? name} ${min}`;
  }
  if (req && !Array.isArray(req) && 'money' in req) return `Needs $${req.money}`;
  return 'Not yet';
}

export class Runner {
  /**
   * @param nodes  script nodes
   * @param env    { state, prefs?, eligible?(id), pointKind? }
   */
  constructor(nodes, env) {
    this.env = env;
    this.stack = [{ nodes, i: 0 }];
    this.pending = null;
    this.queue = [];
    this.steps = 0;
  }

  get state() {
    return this.env.state;
  }

  /** Next presentable step, or { t: 'end' }. Throws if a choice is waiting. */
  next() {
    if (this.pending) throw new Error('A choice is pending; call choose() first');
    if (this.queue.length) return this.queue.shift();
    for (;;) {
      if (++this.steps > MAX_STEPS) throw new Error('Script exceeded step limit');
      const top = this.stack[this.stack.length - 1];
      if (!top) return { t: 'end' };
      if (top.i >= top.nodes.length) {
        this.stack.pop();
        continue;
      }
      const out = this.exec(top.nodes[top.i++]);
      if (out) return out;
    }
  }

  /** Pick an option by index. The chosen line is echoed as a player line. */
  choose(idx) {
    const node = this.pending;
    if (!node) throw new Error('No choice pending');
    const opt = node.options[idx];
    if (!opt) throw new Error(`No option ${idx}`);
    if (!test(opt.req, this.env)) throw new Error('Option is locked');
    this.pending = null;
    const branch = [];
    if (!opt.silent) {
      // "(Grab a towel.)" reads as an action, so it is narrated rather than spoken.
      const action = /^\((.*)\)$/s.exec(opt.text);
      branch.push(action ? { t: 'narr', text: action[1] } : { t: 'say', who: 'you', mood: '', text: opt.text });
    }
    if (opt.pts) branch.push({ t: 'pts', id: opt.pts[0], n: opt.pts[1] });
    if (opt.stat) branch.push({ t: 'stat', name: opt.stat[0], n: opt.stat[1] });
    if (opt.set) branch.push({ t: 'set', k: opt.set[0], v: opt.set[1] ?? true });
    branch.push(...(opt.then || []));
    this.stack.push({ nodes: branch, i: 0 });
    return opt;
  }

  exec(n) {
    const { state } = this;
    switch (n.t) {
      case 'say':
        return { t: 'say', who: n.who, mood: n.mood || 'neutral', text: format(n.text, state) };
      case 'narr':
        return { t: 'narr', text: format(n.text, state) };
      case 'title':
        return { t: 'title', text: format(n.text, state), sub: n.sub ? format(n.sub, state) : '' };
      case 'show':
      case 'hide':
      case 'bg':
      case 'sfx':
        return { ...n };
      case 'choice': {
        // idx always refers to the original position, even when hidden options are skipped.
        const options = [];
        n.options.forEach((o, idx) => {
          const ok = test(o.req, this.env);
          if (!ok && o.hide) return;
          options.push({ idx, text: format(o.text, state), locked: !ok, hint: ok ? '' : hintFor(o.req) });
        });
        this.pending = n;
        return { t: 'choice', prompt: n.prompt ? format(n.prompt, state) : '', options };
      }
      case 'if':
        this.stack.push({ nodes: test(n.cond, this.env) ? n.then : n.else || [], i: 0 });
        return undefined;
      case 'set':
        state.flags[n.k] = n.v;
        return undefined;
      case 'pts': {
        const got = addPoints(state, n.id, n.n, n.kind || this.env.pointKind || 'scene');
        return got > 0 ? { t: 'fx', kind: 'pts', id: n.id, n: got } : undefined;
      }
      case 'stat': {
        const { from, to } = addStat(state, n.name, n.n);
        return { t: 'fx', kind: 'stat', name: n.name, n: n.n, levelUp: to > from, level: to };
      }
      case 'money': {
        state.player.money = Math.max(0, state.player.money + n.n);
        return { t: 'fx', kind: 'money', n: n.n };
      }
      case 'item': {
        state.inv[n.id] = Math.max(0, (state.inv[n.id] || 0) + (n.n ?? 1));
        return { t: 'fx', kind: 'item', id: n.id, n: n.n ?? 1 };
      }
      case 'remember': {
        remember(state, n.id, format(n.text, state));
        return undefined;
      }
      case 'romance':
        state.bonds[n.id].romance = n.value;
        return undefined;
      case 'complete':
        completeScene(state, n.id, n.n);
        return { t: 'fx', kind: 'rank', id: n.id, rank: n.n };
      case 'log':
        state.log.entries.push({ slot: state.time.slot, text: format(n.text, state) });
        return undefined;
      case 'end':
        this.stack.length = 0;
        return { t: 'end' };
      default:
        throw new Error(`Unknown node type: ${n.t}`);
    }
  }
}

/** Adds a memory note the AI (and the journal) can refer to later. */
export function remember(state, id, text) {
  const notes = state.memory[id]?.notes;
  if (!notes || !text) return;
  const clean = String(text).slice(0, 300);
  if (notes.some((x) => x.text === clean)) return;
  notes.push({ day: state.time.day, text: clean });
  while (notes.length > MAX_NOTES) notes.shift();
}
