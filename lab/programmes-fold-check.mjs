/* The Programmes card above the fold on any laptop window, and its four
   care rows (TJ, 26 Oct 2026). node lab/programmes-fold-check.mjs */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const url = pathToFileURL(path.resolve('index/programmes.html')).href;
const b = await chromium.launch({ channel: 'chrome' });
const sizes = [[1280, 720], [1366, 768], [1440, 900], [1536, 864], [1920, 1080], [1024, 768], [390, 844]];
let ok = true;
for (const [w, h] of sizes) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(url); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(600);
  const r = await p.evaluate(() => {
    const c = document.querySelector('[data-pg-card]').getBoundingClientRect();
    const rows = [...document.querySelectorAll('.pg-care__row')].map(x => Math.round(x.querySelector('dd').getBoundingClientRect().height));
    return { bottom: Math.round(c.bottom), fit: getComputedStyle(document.querySelector('[data-pg]')).getPropertyValue('--pg-fit'), rows,
      text: [...document.querySelectorAll('.pg-care dd')].map(x => x.textContent.trim()).join(' | '),
      over: document.documentElement.scrollWidth - document.documentElement.clientWidth };
  });
  const fits = w <= 860 || r.bottom <= h;
  if (!fits || r.over || errs.length) ok = false;
  console.log(`${w}x${h} card bottom ${r.bottom} ${fits ? 'FITS' : 'CUT'} fit=${r.fit || '-'} dd heights ${r.rows} over ${r.over} ${errs.join(';')}`);
  if (w === 1440 || w === 1366 || w === 1280 || w === 390) await p.screenshot({ path: `lab/shots/b6/pg-fold-${w}.png` });
  if (w === 1440) {
    await p.click('[data-pg-next]'); await p.waitForTimeout(800);
    console.log('  after next:', await p.evaluate(() => [...document.querySelectorAll('.pg-care dd')].map(x => x.textContent.trim()).join(' | ')));
    await p.click('[data-pg-next]'); await p.waitForTimeout(800);
    console.log('  after next:', await p.evaluate(() => [...document.querySelectorAll('.pg-care dd')].map(x => x.textContent.trim()).join(' | ')));
  }
  if (w === 1440) console.log('  start:', r.text);
  await p.close();
}
console.log(ok ? 'ALL PASS' : 'SOME FAIL');
await b.close();
