// Shared networking helpers for the AI providers.

/** Validates and normalizes a base URL. Only http and https are allowed. */
export function cleanBase(url) {
  let u;
  try {
    u = new URL(String(url ?? '').trim());
  } catch {
    throw new Error('That address is not a valid URL. Example: https://api.openai.com/v1');
  }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') throw new Error('The address must start with http:// or https://');
  if (u.username || u.password) throw new Error('Put credentials in the key or password field, not in the address.');
  return u.origin + u.pathname.replace(/\/+$/, '');
}

/** Combines an optional caller signal with a timeout. Call cleanup() when done. */
export function withTimeout(signal, ms) {
  const ctrl = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => { timedOut = true; ctrl.abort(); }, ms);
  const onAbort = () => ctrl.abort();
  if (signal) {
    if (signal.aborted) ctrl.abort();
    else signal.addEventListener('abort', onAbort, { once: true });
  }
  return {
    signal: ctrl.signal,
    get timedOut() { return timedOut; },
    cleanup() { clearTimeout(timer); signal?.removeEventListener('abort', onAbort); },
  };
}

const isLocalHost = (host) => /^(localhost|127\.\d+\.\d+\.\d+|\[::1\])$/i.test(host);

/** Turns a fetch failure into something a person can act on. */
export function netError(err, url, timeout) {
  if (err?.name === 'AbortError') {
    if (timeout?.timedOut) return Object.assign(new Error('The request timed out.'), { retryable: true });
    return err;
  }
  let host = 'the server';
  let mixed = false;
  try {
    const u = new URL(url, globalThis.location?.href);
    host = u.host;
    mixed = globalThis.location?.protocol === 'https:' && u.protocol === 'http:' && !isLocalHost(u.hostname);
  } catch { /* keep defaults */ }
  const hint = mixed
    ? ' This page is https, and browsers block calls to plain http addresses on your network. Run the game with the local game server (node server/serve.mjs) and choose "Via game server", or use an https address.'
    : ' Check that it is running, that the address is right, and that it allows requests from this page (CORS).';
  return Object.assign(new Error(`Could not reach ${host}.${hint}`), { retryable: true });
}

/** Reads an error response body and produces a friendly message. */
export async function httpError(res) {
  let detail = '';
  try {
    const text = await res.text();
    try {
      const j = JSON.parse(text);
      detail = j?.error?.message || j?.error || j?.message || j?.data?.message || '';
      if (typeof detail !== 'string') detail = JSON.stringify(detail);
    } catch {
      detail = text.slice(0, 200);
    }
  } catch { /* no body */ }
  const base = {
    400: 'The request was rejected (400).',
    401: 'Not authorized (401). Check the API key or password.',
    403: 'Forbidden (403). The key may not have access to that model or the server refused this page.',
    404: 'Not found (404). Check the model name and the address.',
    408: 'The request timed out (408).',
    429: 'Rate limited or out of quota (429).',
    502: 'The game server could not reach the AI service (502).',
    503: 'The AI service is unavailable right now (503).',
  }[res.status] || `The server answered ${res.status}.`;
  const err = new Error(detail ? `${base} ${detail}`.slice(0, 320) : base);
  err.status = res.status;
  err.detail = detail;
  err.retryable = res.status >= 500 || res.status === 408;
  return err;
}
