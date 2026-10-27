// Who Comes Into Your Home: the top of the page and the hero to statement join, 1440 and 390.
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = process.argv[2];
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p => existsSync(p));
const b = await chromium.launch(exe ? { executablePath: exe } : { channel: 'chrome' });
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  const errors = []; p.on('pageerror', e => errors.push(String(e)));
  await p.goto(pathToFileURL(path.join(ROOT, 'index/who-comes-into-your-home.html')).href, { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(2500);
  await p.screenshot({ path: path.join(OUT, `who-top-${w}-0.png`) });
  const y = await p.evaluate(() => document.querySelector('.wc-st').getBoundingClientRect().top + scrollY);
  await p.mouse.move(w / 2, h / 2);
  for (let i = 0; i < 400 && (await p.evaluate(() => scrollY)) < y - h / 2; i++) { await p.mouse.wheel(0, 120); await p.waitForTimeout(25); }
  await p.waitForTimeout(1800);
  const a = await p.evaluate(() => { const r = document.querySelector('.wc-top__aurora').getBoundingClientRect(); return [Math.round(r.top + scrollY), Math.round(r.bottom + scrollY)]; });
  await p.screenshot({ path: path.join(OUT, `who-top-${w}-join.png`) });
  console.log(w, 'aurora', JSON.stringify(a), 'overflow', await p.evaluate(() => document.documentElement.scrollWidth > innerWidth), errors.length ? errors : 'no errors');
  await p.close();
}
await b.close();
