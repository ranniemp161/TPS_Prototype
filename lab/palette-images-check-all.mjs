// Checks the image swap for every palette on the homepage (Opus, 27 Oct 2026).
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PALS = ['cognac', 'plum', 'sage', 'bronze', 'oxblood', 'navy', 'dustyteal'];
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync);
const b = await chromium.launch({ executablePath: exe });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(pathToFileURL(path.join(ROOT, 'index', 'index.html')).href, { waitUntil: 'domcontentloaded', timeout: 60000 });
const srcs = () => p.evaluate(() => [...document.querySelectorAll('img')].map(i => i.getAttribute('src')).filter(s => /assets\/img\//.test(s)));
for (const pal of [...PALS, 'coral']) {
  await p.evaluate(v => document.documentElement.setAttribute('data-palette', v), pal);
  await p.waitForTimeout(200);
  const s = await srcs();
  const swapped = s.filter(x => x.includes('/' + pal + '/'));
  const bad = await p.evaluate(list => Promise.all(list.map(u => new Promise(r => { const i = new Image(); i.onload = () => r(null); i.onerror = () => r(u); i.src = new URL(u, location.href).href; }))).then(a => a.filter(Boolean)), swapped);
  console.log(pal.padEnd(10), 'swapped', swapped.length, 'of', s.length, 'broken', bad.length, bad.join(' '));
}
await b.close();
