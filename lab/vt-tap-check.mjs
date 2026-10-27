/* A Day With Us on phones (TJ, 12 Oct 2026): settled photograph, merged glass, the next dot to tap.
   W=390 H=844 node lab/vt-tap-check.mjs <outdir> */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const out = process.argv[2], W = +(process.env.W || 390), H = +(process.env.H || 844);
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: W, height: H }, hasTouch: true, isMobile: true });
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(pathToFileURL(process.cwd() + '/index/what-we-do.html').href);
await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(2200);
const top = await p.evaluate(() => document.querySelector('[data-vt]').getBoundingClientRect().top + scrollY);
const st = () => p.evaluate(() => {
  const s = document.querySelector('[data-vt]'), ph = s.querySelector('.vt__photo').getBoundingClientRect(), c = s.querySelector('.vt__card').getBoundingClientRect(), sr = s.getBoundingClientRect();
  const next = [...s.querySelectorAll('.vt__go')].map((b, i) => b.classList.contains('is-next') ? i : -1).filter(i => i >= 0);
  const g = next.length ? s.querySelectorAll('.vt__go')[next[0]].getBoundingClientRect() : null;
  const shown = [...s.querySelectorAll('.vt__item')].filter(it => { const l = it.querySelector('.vt-line > span'); return l && new DOMMatrix(getComputedStyle(l).transform).m42 < 5; }).length;
  return { secTop: Math.round(sr.top), photo: [Math.round(ph.left), Math.round(ph.top), Math.round(ph.width), Math.round(ph.height)], cardTop: Math.round(c.top), overlap: Math.round(ph.bottom - c.top), next, nextDot: g ? [Math.round(g.left + g.width / 2), Math.round(g.top + g.height / 2)] : null, hoursShown: shown, y: Math.round(scrollY) };
});
// the section as it arrives, then with the line start in view
for (const [tag, dy] of [['arrive', -300], ['settled', 0], ['card', 250]]) {
  await p.evaluate(v => scrollTo(0, v), top + dy); await p.waitForTimeout(900);
  console.log(tag.padEnd(8), JSON.stringify(await st()));
  await p.screenshot({ path: `${out}/V-${W}-${tag}.png` });
}
// tap the next dot repeatedly
for (let i = 0; i < 4; i++) {
  const before = await st();
  await p.tap('.vt__go.is-next'); await p.waitForTimeout(2000);
  const after = await st();
  console.log('tap', i + 1, 'next', before.next, '->', after.next, 'hours shown', before.hoursShown, '->', after.hoursShown, 'y', before.y, '->', after.y, 'nextDot', JSON.stringify(after.nextDot));
  if (i === 1) await p.screenshot({ path: `${out}/V-${W}-tap2.png` });
}
// keep tapping to the end
let guard = 0;
while (guard++ < 12) { const s0 = await st(); if (!s0.next.length) break; await p.tap('.vt__go.is-next'); await p.waitForTimeout(1700); }
const end = await st(); console.log('after all taps', JSON.stringify(end));
await p.screenshot({ path: `${out}/V-${W}-end.png` });
console.log('overflowX', await p.evaluate(() => document.documentElement.scrollWidth > innerWidth), 'errors', JSON.stringify(errs));
await b.close();
