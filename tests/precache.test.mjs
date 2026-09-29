import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildPrecache } from '../tools/gen-precache.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('precache.json matches the files on disk (run `npm run precache` after editing the game)', async () => {
  const committed = JSON.parse(await readFile(path.join(ROOT, 'precache.json'), 'utf8'));
  const fresh = await buildPrecache();
  assert.equal(committed.version, fresh.version, 'precache.json is stale, so offline players would get old files');
  assert.deepEqual(committed.files, fresh.files);
});

test('everything the page needs is precached and exists', async () => {
  const { files } = JSON.parse(await readFile(path.join(ROOT, 'precache.json'), 'utf8'));
  for (const f of ['./', 'index.html', 'manifest.webmanifest', 'js/main.js', 'css/base.css', 'icons/icon.svg', 'icons/icon-192.png', 'icons/apple-touch-icon.png']) {
    assert.ok(files.includes(f), `${f} should be precached`);
  }
  for (const f of files.filter((x) => x !== './')) await access(path.join(ROOT, f));
  assert.equal(files.some((f) => /^(server|tests|tools|dev)\//.test(f)), false, 'dev and server files are not shipped to players');
});

test('every module imported by the page is in the precache list', async () => {
  const { files } = JSON.parse(await readFile(path.join(ROOT, 'precache.json'), 'utf8'));
  const seen = new Set();
  const walk = async (rel) => {
    if (seen.has(rel)) return;
    seen.add(rel);
    const src = await readFile(path.join(ROOT, rel), 'utf8');
    for (const m of src.matchAll(/(?:from|import\()\s*['"](\.[^'"]+)['"]/g)) {
      await walk(path.posix.normalize(path.posix.join(path.posix.dirname(rel), m[1])));
    }
  };
  await walk('js/main.js');
  await walk('js/ui/hub.js'); // imported dynamically by tests, statically by main
  for (const rel of seen) assert.ok(files.includes(rel), `${rel} is imported but not precached`);
});

test('index.html only loads local scripts and a strict content security policy', async () => {
  const html = await readFile(path.join(ROOT, 'index.html'), 'utf8');
  assert.match(html, /Content-Security-Policy/);
  assert.match(html, /script-src 'self'/);
  assert.match(html, /object-src 'none'/);
  assert.equal(/<script(?![^>]*\bsrc=)[^>]*>[^<]/.test(html), false, 'no inline scripts');
  assert.equal(/https?:\/\/(?!localhost)/.test(html.replace(/Content-Security-Policy[^>]*>/, '')), false, 'no third party resources');
});
