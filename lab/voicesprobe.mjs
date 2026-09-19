import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import { existsSync } from 'node:fs';
import path from 'node:path';
const ROOT = "G:/My Drive/Rannie and Tj's Projects/The Post Partum Suit/postpartum-prototype";
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p => existsSync(p));
const b = await chromium.launch(exe ? { executablePath: exe } : { channel: 'chrome' });
for (const [w, h] of [[1600, 900], [1440, 900], [1024, 800], [820, 900], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(pathToFileURL(path.join(ROOT, 'v1.html')).href, { waitUntil: 'load' });
  await p.waitForFunction(() => document.documentElement.classList.contains('sc-ready'), { timeout: 20000 });
  await p.waitForTimeout(500);
  // park the section's own top at the top of the window
  const top = await p.evaluate(() => {
    const a = document.querySelector('.act--voices');
    return a.getBoundingClientRect().top + window.scrollY;
  });
  await p.evaluate(y => window.scrollTo(0, y), top);
  await p.waitForTimeout(900);
  const r = await p.evaluate(() => {
    const box = s => { const e = document.querySelector(s); if (!e) return null;
      const b = e.getBoundingClientRect();
      return { t: Math.round(b.top), b: Math.round(b.bottom), l: Math.round(b.left), r: Math.round(b.right) }; };
    const chip = box('.voices__chip'), mark = box('.nav__mark') || box('.nav__logo') || box('.nav__lockup');
    const cols = [...document.querySelectorAll('[data-voices-col]')].map(c =>
      getComputedStyle(c).display);
    return { chip, mark, cols,
      navH: Math.round((document.querySelector('[data-nav] .nav__inner') || document.querySelector('[data-nav]')).getBoundingClientRect().bottom),
      cardW: Math.round((document.querySelector('.voices__card') || {getBoundingClientRect:()=>({width:0})}).getBoundingClientRect().width),
      wall: Math.round(document.querySelector('.voices__wall').getBoundingClientRect().width) };
  });
  const overlap = r.chip && r.mark && !(r.chip.b < r.mark.t || r.chip.t > r.mark.b) && !(r.chip.r < r.mark.l || r.chip.l > r.mark.r);
  console.log(`${w}x${h}  nav bottom ${r.navH}  chip ${JSON.stringify(r.chip)}  mark ${JSON.stringify(r.mark)}  OVERLAP=${overlap}  cols=${r.cols.join(',')}  card=${r.cardW}px wall=${r.wall}px`);
  await p.close();
}
await b.close();
