// About page traditions band: screenshot at 1440 and 390 with the band in view.
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
  await p.goto(pathToFileURL(path.join(ROOT, 'index/about.html')).href, { waitUntil: 'load' });
  await p.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
  const y = await p.evaluate(() => document.querySelector('.os-trad__band').getBoundingClientRect().top + scrollY);
  for (let s = Math.max(0, y - 2500); s <= y - 80; s += 300) { await p.evaluate(v => scrollTo(0, v), s); await p.waitForTimeout(40); }
  await p.evaluate(v => scrollTo(0, v), y - 80); await p.waitForTimeout(1800);
  const ok = await p.evaluate(() => { const i = document.querySelector('.os-trad__img'); return i.complete && i.naturalWidth > 0 && /bath-steam-original/.test(i.src); });
  await p.screenshot({ path: path.join(OUT, `about-trad-${w}.png`) });
  console.log(w, 'loaded', ok, errors.length ? errors : 'no errors');
  await p.close();
}
await b.close();
