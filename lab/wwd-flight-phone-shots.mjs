/* What We Do phones: screenshots through the fly through. node lab/wwd-flight-phone-shots.mjs <outdir> <tag> */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const [out, tag = 'f'] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: +(process.env.VW || 390), height: +(process.env.VH || 844) } });
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(pathToFileURL(process.cwd() + '/index/what-we-do.html').href);
await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(2500);
const sec = await p.evaluate(() => { const s = document.querySelector('.flight') || document.querySelector('[data-flight]'); const r = s.getBoundingClientRect(); return { top: Math.round(r.top + scrollY), h: Math.round(r.height), cls: s.className }; });
console.log(JSON.stringify(sec));
let i = 0;
for (const f of [-0.3, 0, 0.04, 0.1, 0.3, 0.6, 0.9]) {
  await p.evaluate(y => scrollTo(0, y), Math.round(sec.top + f * sec.h)); await p.waitForTimeout(1600);
  const r = await p.evaluate(() => { const q = s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return Math.round(r.top) + '..' + Math.round(r.bottom) + ' op ' + (+getComputedStyle(e).opacity).toFixed(2); }; return 'intro ' + q('[data-flight-intro]') + ' | video ' + q('.flight video, [data-flight] video'); });
  console.log(f, r);
  await p.screenshot({ path: `${out}/${tag}-${i++}.png` });
}
console.log('errors', JSON.stringify(errs));
await b.close();
