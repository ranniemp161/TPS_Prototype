// Phone bath scene: screenshots of the figures and the copy, and the measured centre of "Your recovery / Well deserved" as one block.
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = process.argv[2] || path.join(ROOT, 'lab');
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p => existsSync(p));
const b = await chromium.launch(exe ? { executablePath: exe } : { channel: 'chrome' });
const w = +(process.argv[3] || 390), h = +(process.argv[4] || 844);
const p = await b.newPage({ viewport: { width: w, height: h } });
const errors = [];
p.on('pageerror', e => errors.push(String(e)));
await p.goto(pathToFileURL(path.join(ROOT, 'index/index.html')).href, { waitUntil: 'load' });
await p.evaluate(() => document.fonts.ready);
await p.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
await p.waitForTimeout(800);
const top = await p.evaluate(() => document.querySelector('.act--bath').getBoundingClientRect().top + scrollY);
const measure = () => p.evaluate(() => {
  const k = document.querySelector('.bath__kicker').getBoundingClientRect();
  const s = document.querySelector('.bath__lines .script');
  const r = document.createRange(); r.selectNodeContents(s); const sr = r.getBoundingClientRect();
  const left = Math.min(k.left, sr.left), right = Math.max(k.right, sr.right);
  const figs = document.querySelector('.bath__figures').getBoundingClientRect();
  return { blockCentre: Math.round((left + right) / 2), screenCentre: Math.round(innerWidth / 2), blockW: Math.round(right - left), figureRowsTop: [...document.querySelectorAll('.bath__stat')].map(e => Math.round(e.getBoundingClientRect().top)), statCols: getComputedStyle(document.querySelector('.bath__stats')).gridTemplateColumns, figuresTop: Math.round(figs.top), overflow: document.documentElement.scrollWidth > innerWidth };
});
const results = [];
for (const [name, off] of [['figures', 0.05], ['copy', 0.38]]) {
  await p.evaluate(v => scrollTo(0, v), top + off * h * 6.5);
  await p.waitForTimeout(1200);
  results.push({ at: name, ...(await measure()) });
  await p.screenshot({ path: path.join(OUT, `bath-${w}-${name}.png`) });
}
console.log(JSON.stringify(results), errors.length ? errors : 'no errors');
await b.close();
