/* MOBILE-PLAN item 4 check: A Day With Us on a phone, unpinned.
   node lab/vt-phone-check.mjs <outdir> */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const out = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(pathToFileURL(process.cwd() + '/index/what-we-do.html').href);
await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(2500);
const info = await p.evaluate(() => {
  const s = document.querySelector('.vt'); const r = s.getBoundingClientRect();
  return { top: Math.round(r.top + scrollY), h: Math.round(r.height), screens: +(r.height / innerHeight).toFixed(2), flow: s.classList.contains('is-flow'), page: document.documentElement.scrollHeight, pageScreens: +(document.documentElement.scrollHeight / innerHeight).toFixed(1) };
});
console.log(JSON.stringify(info));
const pts = [-0.9, -0.5, -0.2, 0, 0.6, 1.3, 2, 2.7, 3.4, Math.max(0, info.screens - 0.9)];
let i = 0;
for (const f of pts) {
  await p.evaluate(y => scrollTo(0, y), Math.round(info.top + f * 844)); await p.waitForTimeout(900);
  const m = await p.evaluate(() => [...document.querySelectorAll('[data-vt-item]')].map(it => {
    const r = it.getBoundingClientRect(); const ln = it.querySelector('.vt-line > span');
    const y = ln ? new DOMMatrix(getComputedStyle(ln).transform).m42 : 0;
    return { c: Math.round(r.top + 20), risen: Math.abs(y) < 2 };
  }).filter(o => o.c > 80 && o.c < innerHeight));
  const bad = m.filter(o => o.c < 422 && !o.risen);
  console.log('at', f, 'hours on screen', m.length, 'not risen above the middle', bad.length);
  await p.screenshot({ path: `${out}/vt-${String(i).padStart(2, '0')}.png` }); i++;
}
console.log('errors', JSON.stringify(errs));
await b.close();
