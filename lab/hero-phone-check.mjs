/* MOBILE-PLAN item 3 check: the phone hero at three widths through its scroll.
   node lab/hero-phone-check.mjs <outdir> */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const out = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
for (const [w, h] of [[390, 844], [360, 640], [430, 932]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(pathToFileURL(process.cwd() + '/index/what-we-do.html').href);
  await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(2600);
  const m = await p.evaluate(() => {
    const r = s => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return { t: Math.round(b.top), b: Math.round(b.bottom), w: Math.round(b.width), h: Math.round(b.height) }; };
    const k = document.querySelector('.op__copy:not(.op__copy--light) .op__kinds');
    return { frame: r('[data-op-frame]'), copy: r('[data-op-copy]'), kindsFs: getComputedStyle(k).fontSize, kindsH: Math.round(k.getBoundingClientRect().height), tight: document.querySelector('.op').classList.contains('op--tight'), vh: innerHeight };
  });
  for (const f of [0, 0.4, 0.8, 1.2, 1.6]) {
    await p.evaluate(y => scrollTo(0, y), Math.round(f * h)); await p.waitForTimeout(1100);
    await p.screenshot({ path: `${out}/hp-${w}-${f}.png` });
  }
  const dup = await p.evaluate(() => [...document.querySelectorAll('.op__who, .op__ask')].map(e => { const c = getComputedStyle(e); const r = e.getBoundingClientRect(); return e.className + ' ' + c.opacity + ' ' + Math.round(r.width) + 'x' + Math.round(r.height); }));
  console.log(w, h, JSON.stringify(m), 'questions', JSON.stringify(dup), 'errors', JSON.stringify(errs));
  await p.close();
}
await b.close();
