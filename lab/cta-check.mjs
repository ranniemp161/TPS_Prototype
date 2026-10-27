// The main call to action at the end of the programmes act, and the page end
// (single treatments into the footer), at 1440 and 390. Reports errors and overflow.
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = process.argv[2] || path.join(ROOT, 'lab');
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p => existsSync(p));
const b = await chromium.launch(exe ? { executablePath: exe } : { channel: 'chrome' });
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  const errors = [];
  p.on('pageerror', e => errors.push(String(e)));
  await p.goto(pathToFileURL(path.join(ROOT, 'index/index.html')).href, { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready);
  await p.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
  await p.waitForTimeout(800);
  const y = await p.evaluate(() => document.querySelector('.cta').getBoundingClientRect().top + scrollY);
  await p.mouse.move(w / 2, h / 2);
  await p.evaluate(v => scrollTo(0, v), y - 400);
  for (let i = 0; i < 6; i++) { await p.mouse.wheel(0, 60); await p.waitForTimeout(80); }
  await p.waitForTimeout(1500);
  await p.screenshot({ path: path.join(OUT, `cta-${w}.png`) });
  await p.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
  await p.waitForTimeout(1500);
  await p.screenshot({ path: path.join(OUT, `cta-end-${w}.png`) });
  const info = await p.evaluate(() => ({
    close: !!document.querySelector('.act--close'),
    order: [...document.querySelectorAll('[data-section-name]')].map(e => e.dataset.sectionName).slice(-4),
    overflow: document.documentElement.scrollWidth > innerWidth
  }));
  console.log(w, JSON.stringify(info), errors.length ? errors : 'no errors');
  await p.close();
}
await b.close();
