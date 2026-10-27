/* MOBILE-PLAN item 6 check: Tailored For You into Day and Night on a phone.
   node lab/ty-phone-check.mjs <outdir> */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const out = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(pathToFileURL(process.cwd() + '/index/what-we-do.html').href);
await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(2500);
const top = await p.evaluate(() => Math.round(document.querySelector('.ty__sum').getBoundingClientRect().top + scrollY));
let i = 0;
for (let k = 0; k < 10; k++) {
  const y = top - 700 + k * 300;
  await p.evaluate(y => scrollTo(0, y), y); await p.waitForTimeout(1100);
  const m = await p.evaluate(() => ({ sum: document.querySelector('.ty__sum').textContent.replace(/\s+/g, ' ').trim(), figs: [...document.querySelectorAll('.ty__out b')].map(e => e.textContent).join(','), sumTop: Math.round(document.querySelector('.ty__sum').getBoundingClientRect().top) }));
  console.log('y', y, JSON.stringify(m));
  await p.screenshot({ path: `${out}/ty-${String(i).padStart(2, '0')}.png` }); i++;
}
console.log('errors', JSON.stringify(errs));
await b.close();
