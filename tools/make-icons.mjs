#!/usr/bin/env node
// Renders icons/icon.svg into the PNG sizes phones and browsers want.
//   NODE_PATH=$(npm root -g) node tools/make-icons.mjs
// Needs Playwright with Chromium. The PNGs are committed, so you only run this if you
// change the icon.

import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const svg = await readFile(path.join(ROOT, 'icons/icon.svg'), 'utf8');
const dataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;

const jobs = [
  // name, size, scale of the artwork inside the canvas (maskable icons need a safe zone)
  ['icon-192.png', 192, 1],
  ['icon-512.png', 512, 1],
  ['apple-touch-icon.png', 180, 1],
  ['icon-maskable-512.png', 512, 0.72],
];

const browser = await chromium.launch();
try {
  for (const [name, size, scale] of jobs) {
    const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
    const inner = Math.round(size * scale);
    await page.setContent(
      `<body style="margin:0;background:#2a1f4d;display:grid;place-items:center;width:${size}px;height:${size}px;overflow:hidden">` +
      `<img src="${dataUrl}" width="${inner}" height="${inner}" style="display:block"></body>`,
    );
    await page.waitForFunction(() => document.querySelector('img').complete);
    await page.screenshot({ path: path.join(ROOT, 'icons', name), omitBackground: false });
    await page.close();
    console.log(`icons/${name} ${size}x${size}`);
  }
} finally {
  await browser.close();
}
