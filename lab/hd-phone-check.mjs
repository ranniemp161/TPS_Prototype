/* MOBILE-PLAN item 7 check: the four kinds' pictures on a phone, and the gap above them.
   node lab/hd-phone-check.mjs <outdir> */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const out = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(pathToFileURL(process.cwd() + '/index/what-we-do.html').href);
await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(2500);
const m = await p.evaluate(() => {
  const ck = document.querySelector('.spec__checks').getBoundingClientRect();
  const sc = [...document.querySelectorAll('.hd__scene')];
  const first = sc[0].getBoundingClientRect();
  return { gap: Math.round(first.top - ck.bottom), scenes: sc.map(s => { const r = s.getBoundingClientRect(); return { top: Math.round(r.top + scrollY), h: Math.round(r.height) }; }) };
});
console.log(JSON.stringify(m));
for (let i = 0; i < m.scenes.length; i++) {
  await p.evaluate(y => scrollTo(0, y), m.scenes[i].top - 120); await p.waitForTimeout(900);
  await p.screenshot({ path: `${out}/hd-${i}.png`, clip: { x: 0, y: 120, width: 390, height: m.scenes[i].h } });
}
console.log('errors', JSON.stringify(errs));
await b.close();
