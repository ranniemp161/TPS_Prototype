// Phone care section: the vertical line beside the narrowed cards. Steps through the section,
// records which dots are filled, the line's x against the cards' right edge, and screenshots
// when each card's photo is at the middle of the screen. Args: outdir width height.
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = process.argv[2];
const w = +(process.argv[3] || 390), h = +(process.argv[4] || 844);
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p => existsSync(p));
const b = await chromium.launch(exe ? { executablePath: exe } : { channel: 'chrome' });
const p = await b.newPage({ viewport: { width: w, height: h } });
const errors = []; p.on('pageerror', e => errors.push(String(e)));
await p.goto(pathToFileURL(path.join(ROOT, 'index/index.html')).href, { waitUntil: 'load' });
await p.evaluate(() => document.fonts.ready);
await p.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
await p.waitForTimeout(1000);
const top = await p.evaluate(() => document.querySelector('#care').getBoundingClientRect().top + scrollY);
const cardsY = await p.evaluate(() => [...document.querySelectorAll('#care .card .card__media')].map(m => { const r = m.getBoundingClientRect(); return r.top + r.height / 2 + scrollY; }));
// walk down so scroll triggers fire in order
for (let y = top - h; y < cardsY[0] - h / 2; y += 200) { await p.evaluate(v => scrollTo(0, v), y); await p.waitForTimeout(40); }
for (let i = 0; i < cardsY.length; i++) {
  const target = (await p.evaluate(k => { const m = document.querySelectorAll('#care .card .card__media')[k].getBoundingClientRect(); return m.top + m.height / 2 + scrollY; }, i)) - h / 2;
  await p.evaluate(v => scrollTo(0, v), target);
  await p.waitForTimeout(1200);
  const s = await p.evaluate(() => {
    const line = document.querySelector('.care-vline');
    if (!line) return { line: false };
    const lr = line.getBoundingClientRect();
    const card = document.querySelector('#care .card').getBoundingClientRect();
    const tip = document.querySelector('.care-vline__tip').getBoundingClientRect();
    return {
      dots: [...document.querySelectorAll('.care-vline__dot')].map(d => d.classList.contains('is-past') ? 1 : 0).join(''),
      lineX: Math.round(lr.left), cardRight: Math.round(card.right), cardW: Math.round(card.width), lane: Math.round(lr.left - card.right),
      tipY: Math.round(tip.top + tip.height / 2), screenMid: Math.round(innerHeight / 2),
      overflow: document.documentElement.scrollWidth > innerWidth
    };
  });
  console.log(w, 'card', i + 1, JSON.stringify(s));
  await p.screenshot({ path: path.join(OUT, `care-vline-${w}-${i + 1}.png`) });
}
console.log(errors.length ? errors : 'no errors');
await b.close();
