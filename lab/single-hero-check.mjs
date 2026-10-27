// Single treatments: the top of the page at 1440 and 390; strip edges, logo gone, title position, errors.
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
  await p.goto(pathToFileURL(path.join(ROOT, 'index/single-treatments.html')).href, { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
  const m = await p.evaluate(() => {
    const s = document.querySelector('.bk-hero__strip').getBoundingClientRect();
    const h1 = document.querySelector('h1'); const t = h1 ? h1.getBoundingClientRect() : null;
    return { strip: [Math.round(s.top), Math.round(s.bottom)], logo: !!document.querySelector('.bk-hero__lockup'), mask: getComputedStyle(document.querySelector('.bk-hero__strip')).maskImage, fade: getComputedStyle(document.querySelector('.bk-hero__strip'), '::after').display, title: h1 && h1.textContent.trim(), titleTop: t && Math.round(t.top), overflow: document.documentElement.scrollWidth > innerWidth };
  });
  await p.screenshot({ path: path.join(OUT, `single-hero-${w}.png`) });
  console.log(w, JSON.stringify(m), errors.length ? errors : 'no errors');
  await p.close();
}
await b.close();
