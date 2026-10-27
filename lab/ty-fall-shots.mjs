/* Tailored to Day and Night on phones: the 14 day circle's fall past the larger title.
   W=390 node lab/ty-fall-shots.mjs <outdir> */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const out = process.argv[2], W = +(process.env.W || 390), H = +(process.env.H || 844);
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: W, height: H }, hasTouch: true, isMobile: true });
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(pathToFileURL(process.cwd() + '/index/what-we-do.html').href);
await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1800);
const top = await p.evaluate(() => document.querySelector('[data-ty] .ty__days').getBoundingClientRect().top + scrollY);
let i = 0;
for (const f of [0.5, 0.2, 0, -0.2, -0.4, -0.6, -0.8, -1.0, -1.2]) {
  await p.evaluate(y => scrollTo(0, y), top - f * H + 0); await p.waitForTimeout(1100);
  const m = await p.evaluate(() => { const tw = document.querySelector('.ty-sun'), t = document.querySelector('.dn-title:not(.dn-title--ink)'); const r = t.getBoundingClientRect(); const tr = tw && tw.style.display === 'block' ? tw.getBoundingClientRect() : null; return { title: [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)], twin: tr ? [Math.round(tr.left + tr.width / 2), Math.round(tr.top + tr.height / 2)] : null, tx: getComputedStyle(document.querySelector('.dn-wrap')).getPropertyValue('--dn-tx').trim() }; });
  console.log('days.top at', f, JSON.stringify(m));
  await p.screenshot({ path: `${out}/F-${W}-${i++}.png` });
}
console.log('overflowX', await p.evaluate(() => document.documentElement.scrollWidth > innerWidth), 'errors', JSON.stringify(errs));
await b.close();
