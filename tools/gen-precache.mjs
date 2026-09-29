#!/usr/bin/env node
// Builds precache.json: the list of shell files the service worker stores for
// offline play, plus a content hash used as the cache version. Run after
// changing any game file (CI also runs it before deploying).
import { readdir, readFile, writeFile } from 'node:fs/promises';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TOP_FILES = ['index.html', 'manifest.webmanifest'];
const DIRS = ['css', 'js', 'icons'];

async function walk(dir) {
  const out = [];
  for (const e of await readdir(path.join(ROOT, dir), { withFileTypes: true })) {
    const rel = path.posix.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(rel)));
    else if (!e.name.startsWith('.')) out.push(rel);
  }
  return out;
}

export async function buildPrecache() {
  const files = [...TOP_FILES];
  for (const d of DIRS) files.push(...(await walk(d)));
  files.sort();
  const hash = crypto.createHash('sha256');
  for (const f of files) {
    hash.update(f);
    hash.update(await readFile(path.join(ROOT, f)));
  }
  return { version: hash.digest('hex').slice(0, 12), files: ['./', ...files] };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const data = await buildPrecache();
  await writeFile(path.join(ROOT, 'precache.json'), JSON.stringify(data, null, 2) + '\n');
  console.log(`precache.json: ${data.files.length} files, version ${data.version}`);
}
