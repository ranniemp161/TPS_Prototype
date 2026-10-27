// Length picker: choose 30 days and screenshot the large frame and thumbnail at 1440 and 390.
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
  await p.goto(pathToFileURL(path.join(ROOT, 'index/index.html')).href, { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready);
  await p.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
  await p.waitForTimeout(800);
  const y = await p.evaluate(() => document.querySelector('#programmes .gal').getBoundingClientRect().top + scrollY);
  for (let s = y - 2000; s <= y - 120; s += 250) { await p.evaluate(v => scrollTo(0, v), s); await p.waitForTimeout(40); }
  await p.evaluate(v => scrollTo(0, v), y - 120); await p.waitForTimeout(1000);
  await p.locator('.gal__thumb').nth(3).click(); await p.waitForTimeout(1800);
  const ok = await p.evaluate(() => [...document.querySelectorAll('[data-gal-img]')].some(i => /tungku-stones/.test(i.src) && getComputedStyle(i).opacity === '1' && i.naturalWidth > 0));
  await p.screenshot({ path: path.join(OUT, `tungku-${w}.png`) });
  console.log(w, 'shown', ok, errors.length ? errors : 'no errors');
  await p.close();
}
await b.close();
