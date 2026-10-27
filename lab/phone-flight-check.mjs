// Phone house film: steps through the film and screenshots each room once its words are fully in,
// with the film frame, line and words block measured. Args: outdir width height.
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = process.argv[2] || path.join(ROOT, 'lab');
const w = +(process.argv[3] || 390), h = +(process.argv[4] || 844);
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p => existsSync(p));
const b = await chromium.launch(exe ? { executablePath: exe } : { channel: 'chrome' });
const p = await b.newPage({ viewport: { width: w, height: h } });
const errors = [];
p.on('pageerror', e => errors.push(String(e)));
await p.goto(pathToFileURL(path.join(ROOT, 'index/index.html')).href, { waitUntil: 'load' });
await p.evaluate(() => document.fonts.ready);
await p.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
await p.waitForTimeout(800);
const shot = new Set();
for (let y = 2500; y < 16000; y += 150) {
  await p.evaluate(v => scrollTo(0, v), y);
  await p.waitForTimeout(50);
  const s = await p.evaluate(() => {
    const cur = document.querySelector('.route__stop.is-current');
    if (!cur) return null;
    const more = cur.querySelector('.route__more .route__in');
    const pw = more ? parseFloat(getComputedStyle(cur).getPropertyValue('--pw')) || 0 : 1;
    const film = document.querySelector('.flight__film').getBoundingClientRect();
    const line = document.querySelector('.route__line').getBoundingClientRect();
    const text = cur.querySelector('.route__text').getBoundingClientRect();
    const op = +getComputedStyle(document.querySelector('[data-route]')).opacity;
    return { stop: cur.dataset.stop, pw, op, filmTop: Math.round(film.top), filmBottom: Math.round(film.bottom), lineY: Math.round(line.top), textTop: Math.round(text.top), textBottom: Math.round(text.bottom), textLeft: Math.round(text.left), textRight: Math.round(text.right) };
  });
  if (s && s.pw > 0.98 && s.op > 0.98 && !shot.has(s.stop)) {
    shot.add(s.stop);
    await p.waitForTimeout(700);
    await p.screenshot({ path: path.join(OUT, `pflight-${w}-${s.stop}.png`) });
    console.log(JSON.stringify({ y, ...s }));
  }
}
console.log('rooms', [...shot].join(','), 'overflow', await p.evaluate(() => document.documentElement.scrollWidth > innerWidth), errors.length ? errors : 'no errors');
await b.close();
