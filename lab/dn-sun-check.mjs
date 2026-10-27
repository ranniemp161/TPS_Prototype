/* Day and Night Care on phones: the sun on the line starts half way between the title and
   the line, and sets fully into it. W=390 H=844 node lab/dn-sun-check.mjs <outdir> */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const out = process.argv[2], W = +(process.env.W || 390), H = +(process.env.H || 844);
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: W, height: H }, hasTouch: true, isMobile: true });
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(pathToFileURL(process.cwd() + '/index/what-we-do.html').href);
await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(2000);
const top = await p.evaluate(() => document.querySelector('.dn-wrap').getBoundingClientRect().top + scrollY);
const m = () => p.evaluate(() => {
  const t = document.querySelector('.dn-title--ink').getBoundingClientRect(), r = document.querySelector('.dnl__rail').getBoundingClientRect(), s = document.querySelector('.dnl__sun').getBoundingClientRect(), k = document.querySelector('.dnl__sky').getBoundingClientRect();
  const lineY = r.top + r.height / 2;
  return { titleBottom: Math.round(t.bottom), lineY: Math.round(lineY), mid: Math.round((t.bottom + lineY) / 2), sunCy: Math.round(s.top + s.height / 2), sunW: +s.width.toFixed(1), visible: Math.max(0, Math.round(Math.min(s.bottom, k.bottom) - s.top)), t: (+getComputedStyle(document.querySelector('.dnl')).getPropertyValue('--dnl-t') || 0).toFixed(2) };
});
for (const [tag, dy] of [['day', 40], ['quarter', 160], ['half', 280], ['three quarters', 400], ['night', 560]]) {
  await p.evaluate(v => scrollTo(0, v), top + dy); await p.waitForTimeout(1000);
  console.log(tag.padEnd(15), JSON.stringify(await m()));
  await p.screenshot({ path: `${out}/S-${W}-${tag.replace(' ', '')}.png` });
}
console.log('errors', JSON.stringify(errs));
await b.close();
