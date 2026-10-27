/* Tailored For You on a phone: the section as it settles, closed and with Read more open.
   node lab/ty-phone-shot.mjs <outdir> */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const out = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
await p.goto(pathToFileURL(process.cwd() + '/index/what-we-do.html').href);
await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
const top = await p.evaluate(() => document.querySelector('[data-ty]').getBoundingClientRect().top + scrollY);
for (const [n, dy] of [['a', 0], ['b', 500], ['c', 900]]) {
  await p.evaluate(y => scrollTo(0, y), top + dy); await p.waitForTimeout(1200);
  await p.screenshot({ path: `${out}/ty-${n}.png` });
}
await p.evaluate(y => scrollTo(0, y), top + 500); await p.waitForTimeout(800);
await p.click('[data-ty] .tl-readmore__toggle'); await p.waitForTimeout(900);
await p.screenshot({ path: `${out}/ty-open.png` });
console.log(await p.evaluate(() => { const c = document.querySelector('[data-ty] .ty__card'), h = document.querySelector('[data-ty] .ty__hero'); const r = c.getBoundingClientRect(), q = h.getBoundingClientRect(); return JSON.stringify({ card: [Math.round(r.top), Math.round(r.bottom), Math.round(r.left), Math.round(r.right)], hero: [Math.round(q.top), Math.round(q.bottom), Math.round(q.left), Math.round(q.right)] }); }));
await b.close();
