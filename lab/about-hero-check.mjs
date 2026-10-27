// About page split hero at 1440, 390 and 360: picture and words placement, overflow, errors.
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = process.argv[2];
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p => existsSync(p));
const b = await chromium.launch(exe ? { executablePath: exe } : { channel: 'chrome' });
for (const [w, h] of [[1440, 900], [390, 844], [360, 780]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  const errors = []; p.on('pageerror', e => errors.push(String(e)));
  await p.goto(pathToFileURL(path.join(ROOT, 'index/about.html')).href, { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(2200);
  const m = await p.evaluate(() => {
    const R = s => { const r = document.querySelector(s).getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)]; };
    return { pic: R('.os-open__pic'), title: R('.os-open__h'), lede: R('.os-open__lede'), loaded: document.querySelector('.os-open__pic img').naturalWidth > 0, overflow: document.documentElement.scrollWidth > innerWidth };
  });
  await p.screenshot({ path: path.join(OUT, `about-hero-${w}.png`) });
  console.log(w, h, JSON.stringify(m), errors.length ? errors : 'no errors');
  await p.close();
}
await b.close();
