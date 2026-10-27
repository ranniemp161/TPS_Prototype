/* Tailored For You on phones: the line across (TJ, 12 Oct 2026). Walks the page down through
   the line and out into Day and Night, sampling the line, the figures and the falling circle.
   W=390 node lab/ty-line-check.mjs <outdir> */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const out = process.argv[2], W = +(process.env.W || 390), H = +(process.env.H || 844);
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: W, height: H }, hasTouch: true, isMobile: true });
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(pathToFileURL(process.cwd() + '/index/what-we-do.html').href);
await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1800);
const days = () => p.evaluate(() => { const d = document.querySelector('[data-ty] .ty__days'); const r = d.getBoundingClientRect(); return r.top + scrollY; });
const snap = async (tag) => {
  const m = await p.evaluate(() => {
    const t = document.querySelector('[data-ty]'), tr = t.querySelector('.ty__track'), tip = t.querySelector('.ty__tip').getBoundingClientRect(), rail = t.querySelector('.ty__rail').getBoundingClientRect(), d = t.querySelector('.ty__days').getBoundingClientRect();
    const twin = document.querySelector('.ty-sun'), tw = twin && twin.style.display === 'block' ? twin.getBoundingClientRect() : null;
    return { daysTop: Math.round(d.top), sel: getComputedStyle(tr).getPropertyValue('--sel').trim(), tipX: Math.round(tip.left + tip.width / 2 - rail.left), railW: Math.round(rail.width),
      figs: [...t.querySelectorAll('[data-out]')].map(e => e.textContent).join('/'), checked: [...t.querySelectorAll('.ty__day')].filter(x => x.getAttribute('aria-checked') === 'true').map(x => x.dataset.days).join(),
      twin: tw ? [Math.round(tw.left + tw.width / 2), Math.round(tw.top + tw.height / 2), Math.round(tw.width)] : null, lifted: !!t.querySelector('.ty__stop.is-lifted') };
  });
  console.log(tag, JSON.stringify(m));
};
const top = await days();
const vh = H;
// line positions: days.top at these fractions of the screen
for (const f of [0.95, 0.88, 0.84, 0.78, 0.70, 0.62, 0.55, 0.48, 0.42, 0.36, 0.25, 0.1]) {
  await p.evaluate(y => scrollTo(0, y), top - f * vh); await p.waitForTimeout(900);
  await snap('days.top ' + f);
  if ([0.84, 0.55, 0.42, 0.25].includes(f)) await p.screenshot({ path: `${out}/L-${W}-${f}.png` });
}
// tap each day
for (const d of [14, 7, 30, 5]) {
  await p.evaluate(y => scrollTo(0, y), top - 0.9 * vh); await p.waitForTimeout(500);
  await p.tap(`[data-ty] .ty__day[data-days="${d}"]`); await p.waitForTimeout(2200);
  await snap('tap ' + d);
}
// overlap of the day labels
console.log('labels', JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('[data-ty] .ty__day')].map(x => { const r = x.getBoundingClientRect(); const g = document.createRange(); g.selectNodeContents(x); const q = g.getBoundingClientRect(); return [x.dataset.days, Math.round(r.left), Math.round(r.right), Math.round(q.left), Math.round(q.right), Math.round(r.height)]; }))));
console.log('overflowX', await p.evaluate(() => document.documentElement.scrollWidth > innerWidth), 'errors', JSON.stringify(errs));
await b.close();
