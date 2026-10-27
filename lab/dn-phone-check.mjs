/* MOBILE-PLAN item 5 check: Day and Night on a phone. node lab/dn-phone-check.mjs <outdir> */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const out = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(pathToFileURL(process.cwd() + '/index/what-we-do.html').href);
await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(2500);
const info = await p.evaluate(() => { const s = document.querySelector('[data-section-name="Day and Night Care"]'); const r = s.getBoundingClientRect(); return { top: Math.round(r.top + scrollY), h: Math.round(r.height), screens: +(r.height / innerHeight).toFixed(2), page: +(document.documentElement.scrollHeight / innerHeight).toFixed(1) }; });
console.log(JSON.stringify(info));
const n = 12; let i = 0;
for (let k = 0; k <= n; k++) {
  const y = Math.round(info.top + (info.h - 844) * k / n);
  await p.evaluate(y => scrollTo(0, y), y); await p.waitForTimeout(1200);
  await p.screenshot({ path: `${out}/dn-${String(i).padStart(2, '0')}.png` }); i++;
}
console.log('errors', JSON.stringify(errs));
await b.close();
