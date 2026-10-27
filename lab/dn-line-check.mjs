/* Day and Night Care on phones (TJ, 12 Oct 2026): the shorter scrub, the Day to Night line,
   taps, the title growing with the night, no ball. W=390 node lab/dn-line-check.mjs <outdir> */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const out = process.argv[2], W = +(process.env.W || 390), H = +(process.env.H || 844);
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: W, height: H }, hasTouch: true, isMobile: true });
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(pathToFileURL(process.cwd() + '/index/what-we-do.html').href);
await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(2000);
const info = await p.evaluate(() => { const w = document.querySelector('.dn-wrap').getBoundingClientRect(); return { top: Math.round(w.top + scrollY), h: Math.round(w.height) }; });
console.log('wrap height', info.h, '(was 3460 at 390x844)');
const st = () => p.evaluate(() => {
  const w = document.querySelector('.dn-wrap'), cs = getComputedStyle(w), dnl = document.querySelector('.dnl'), clock = document.querySelector('[data-peak-clock]');
  const night = document.querySelector('.act--peak .dissolve__night'), t = document.querySelector('.dn-title--ink').getBoundingClientRect();
  const nb = document.querySelector('.dnl__end[data-dnl="1"]').getBoundingClientRect();
  const hit = document.elementFromPoint(nb.left + nb.width / 2, nb.top + nb.height / 2);
  return { y: Math.round(scrollY), clock: (+clock.style.opacity || 0).toFixed(2), t: dnl ? (+getComputedStyle(dnl).getPropertyValue('--dnl-t') || 0).toFixed(2) : null, night: (+getComputedStyle(night).opacity).toFixed(2), ts: cs.getPropertyValue('--dn-ts').trim(), titleW: Math.round(t.width), titleCx: Math.round(t.left + t.width / 2), g: cs.getPropertyValue('--dn-g').trim(), nightHit: hit && hit.matches('.dnl__end') ? 'button' : (hit ? hit.className : 'none'), ball: !!(document.querySelector('.ty-sun') && document.querySelector('.ty-sun').style.display === 'block'), lifted: !!document.querySelector('.ty .is-lifted') };
});
// walk through
let i = 0;
for (let y = info.top - 500; y < info.top + info.h; y += 220) {
  await p.evaluate(v => scrollTo(0, v), y); await p.waitForTimeout(800);
  const m = await st(); console.log('walk', i, JSON.stringify(m));
  await p.screenshot({ path: `${out}/W-${W}-${String(i++).padStart(2, '0')}.png` });
}
// tap Night from the start of the line
await p.evaluate(v => scrollTo(0, v), info.top + 40); await p.waitForTimeout(1200);
console.log('before Night tap', JSON.stringify(await st()));
await p.tap('.dnl__end[data-dnl="1"]');
for (const t of [600, 1300, 2000, 3200]) { await p.waitForTimeout(t === 600 ? 600 : 700); console.log('  after', t, 'ms', JSON.stringify(await st())); }
await p.screenshot({ path: `${out}/W-${W}-night.png` });
await p.tap('.dnl__end[data-dnl="0"]'); await p.waitForTimeout(3400);
console.log('after Day tap', JSON.stringify(await st()));
console.log('overflowX', await p.evaluate(() => document.documentElement.scrollWidth > innerWidth), 'errors', JSON.stringify(errs));
await b.close();
