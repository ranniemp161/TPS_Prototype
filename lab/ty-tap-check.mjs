/* Tailored For You on phones: the line is tapped (TJ, 12 Oct 2026). Taps, the circle's slide,
   the figures, nothing moving under the thumb, the fall into the sun.
   W=390 node lab/ty-tap-check.mjs <outdir> */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const out = process.argv[2], W = +(process.env.W || 390), H = +(process.env.H || 844);
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: W, height: H }, hasTouch: true, isMobile: true });
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(pathToFileURL(process.cwd() + '/index/what-we-do.html').href);
await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1800);
const top = await p.evaluate(() => document.querySelector('[data-ty] .ty__days').getBoundingClientRect().top + scrollY);
await p.evaluate(y => scrollTo(0, y), top - 0.6 * H); await p.waitForTimeout(1200);
const st = () => p.evaluate(() => {
  const t = document.querySelector('[data-ty]'), tr = t.querySelector('.ty__track'), tip = t.querySelector('.ty__tip').getBoundingClientRect(), rail = t.querySelector('.ty__rail').getBoundingClientRect(), d = t.querySelector('.ty__days').getBoundingClientRect(), sum = t.querySelector('.ty__sum').getBoundingClientRect();
  return { daysTop: Math.round(d.top), sumH: Math.round(sum.height), sumFs: getComputedStyle(t.querySelector('.ty__sum')).fontSize, sel: (+getComputedStyle(tr).getPropertyValue('--sel')).toFixed(2), tipX: Math.round(tip.left + tip.width / 2 - rail.left), figs: [...t.querySelectorAll('[data-out]')].map(e => e.textContent).join('/'), checked: [...t.querySelectorAll('.ty__day')].filter(x => x.getAttribute('aria-checked') === 'true').map(x => x.dataset.days).join(), stops: [...t.querySelectorAll('.ty__stop')].map(x => (+getComputedStyle(x).opacity).toFixed(2)).join(' ') };
});
console.log('start   ', JSON.stringify(await st()));
await p.screenshot({ path: `${out}/T-${W}-start.png` });
for (const d of [14, 30, 7, 5]) {
  await p.tap(`[data-ty] .ty__day[data-days="${d}"]`); await p.waitForTimeout(300);
  const mid = await st();
  await p.waitForTimeout(1100);
  console.log('tap', String(d).padEnd(3), 'mid tipX', mid.tipX, 'figs', mid.figs, '| settled', JSON.stringify(await st()));
  if (d === 14) await p.screenshot({ path: `${out}/T-${W}-14.png` });
}
// tap the line itself, between 7 and 14, nearest wins
const r = await p.evaluate(() => { const q = document.querySelector('[data-ty] .ty__rail').getBoundingClientRect(); return { x: q.left, y: q.top + q.height / 2, w: q.width }; });
await p.touchscreen.tap(r.x + r.w * 0.44, r.y); await p.waitForTimeout(1400);
console.log('line tap at 44 percent', JSON.stringify(await st()));
// the fall: leave the line on 7, scroll on; the 14 drops
await p.tap('[data-ty] .ty__day[data-days="7"]'); await p.waitForTimeout(1000);
for (const f of [0.34, 0.2, 0.0]) {
  await p.evaluate(([y, f, H]) => scrollTo(0, y - f * H), [top, f, H]); await p.waitForTimeout(1000);
  console.log('scrolled to days.top', f, JSON.stringify(await p.evaluate(() => { const tw = document.querySelector('.ty-sun'); const q = tw && tw.style.display === 'block' ? tw.getBoundingClientRect() : null; return { twin: q ? [Math.round(q.left + q.width / 2), Math.round(q.top + q.height / 2), Math.round(q.width)] : null, lifted: !!document.querySelector('.ty__stop.is-lifted') }; })));
}
console.log('overflowX', await p.evaluate(() => document.documentElement.scrollWidth > innerWidth), 'errors', JSON.stringify(errs));
await b.close();
