// House route: samples the route opacity and fill as the page scrolls through the film,
// and checks the picker has no progression line. Reports errors.
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p => existsSync(p));
const b = await chromium.launch(exe ? { executablePath: exe } : { channel: 'chrome' });
const w = +(process.argv[2] || 1440), h = +(process.argv[3] || 900);
const p = await b.newPage({ viewport: { width: w, height: h } });
const errors = [];
p.on('pageerror', e => errors.push(String(e)));
p.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
await p.goto(pathToFileURL(path.join(ROOT, 'index/index.html')).href, { waitUntil: 'load' });
await p.evaluate(() => document.fonts.ready);
await p.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
await p.waitForTimeout(800);
const top = await p.evaluate(() => { const r = document.querySelector('[data-route]'); return r.getBoundingClientRect().top + scrollY; });
const rows = [];
for (let y = top - h * 0.5; y < top + h * 30; y += 300) {
  await p.evaluate(v => scrollTo(0, v), y);
  await p.waitForTimeout(60);
  const s = await p.evaluate(() => {
    const r = document.querySelector('[data-route]');
    const f = document.querySelector('.route__fill');
    return { op: +getComputedStyle(r).opacity, fill: f ? f.style.transform : '', dots: [...document.querySelectorAll('.route__dot')].length, end: !!document.querySelector('[data-route-end]') };
  });
  rows.push({ y: Math.round(y), ...s });
}
const pickerLine = await p.evaluate(() => !!document.querySelector('.gal-line'));
console.log(JSON.stringify({ w, h, pickerLine, errors: errors.length ? errors.slice(0, 5) : 'none' }));
for (const r of rows.filter((_, i) => i % 2 === 0 || i > rows.length - 6)) console.log(JSON.stringify(r));
await b.close();
