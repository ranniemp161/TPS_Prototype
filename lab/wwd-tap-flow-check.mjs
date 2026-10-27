/* What We Do phones: the tapped flight. Arrive by scroll, tap through, swipe out. node lab/wwd-tap-flow-check.mjs <outdir> */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const out = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 });
const p = await ctx.newPage();
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(pathToFileURL(process.cwd() + '/index/what-we-do.html').href);
await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(2500);
const cdp = await ctx.newCDPSession(p);
const state = () => p.evaluate(() => {
  const s = window.__flight.state();
  const cur = document.querySelector('.route__stop.is-current');
  const born = document.querySelectorAll('.route__stop.is-born').length;
  const back = document.querySelector('[data-step="-1"]');
  const tip = document.querySelector('.route__tip').getBoundingClientRect();
  const dots = [...document.querySelectorAll('.route__dot')].map(d => { const r = d.getBoundingClientRect(); return Math.round(r.left + r.width / 2); });
  return 'tipX ' + Math.round(tip.left + tip.width / 2) + ' dots ' + dots.join(',') + ' | y ' + Math.round(scrollY) + ' t ' + s.target.toFixed(2) + ' cur ' + (cur ? cur.dataset.stop : '-') + ' born ' + born + ' backDisabled ' + back.disabled;
});
const top = await p.evaluate(() => window.__flight.state().top);
// arrive: scroll to just past the film's start, as momentum would leave it
await p.evaluate(y => scrollTo(0, y), Math.round(top + 0.3 * 844)); await p.waitForTimeout(2500);
console.log('arrive', await state());
await p.screenshot({ path: `${out}/tap-0.png` });
for (let i = 1; i <= 4; i++) {
  await p.tap('[data-step="1"]'); await p.waitForTimeout(3200);
  console.log('next', i, await state());
  await p.screenshot({ path: `${out}/tap-${i}.png` });
}
await p.tap('[data-step="-1"]'); await p.waitForTimeout(3200);
console.log('back', await state());
await p.tap('[data-step="1"]'); await p.waitForTimeout(3200);
console.log('next', await state());
await p.tap('[data-step="1"]'); await p.waitForTimeout(6000);
console.log('after last', await p.evaluate(() => { const h = document.querySelector('.flight').nextElementSibling; const r = h.getBoundingClientRect(); const intro = document.querySelector('[data-flight-intro]').getBoundingClientRect(); return 'next section top ' + Math.round(r.top) + ' (' + h.className + ') flight intro bottom ' + Math.round(intro.bottom); }));
await p.screenshot({ path: `${out}/tap-after.png` });
await p.tap('[data-step="-1"]').catch(() => {}); await p.evaluate(y => scrollTo(0, y), Math.round(top + 6 * 844)); await p.waitForTimeout(2500);
// a drag inside the hold must not scrub the film
const before = await p.evaluate(() => scrollY);
await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 200, y: 400 }] });
for (let k = 1; k <= 3; k++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 200, y: 400 - k * 10 }] });
await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await p.waitForTimeout(800);
console.log('small drag moved', Math.round((await p.evaluate(() => scrollY)) - before));
// a clear swipe up leaves the film downward
await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 200, y: 600 }] });
for (let k = 1; k <= 6; k++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 200, y: 600 - k * 30 }] });
await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await p.waitForTimeout(4500);
const endY = await p.evaluate(() => scrollY), sec = await p.evaluate(() => { const r = document.querySelector('.flight').getBoundingClientRect(); return Math.round(r.bottom + scrollY); });
console.log('swipe out: y', Math.round(endY), 'flight track end', Math.round(top + (await p.evaluate(() => window.__flight.T)) * 844), 'section bottom', sec);
console.log('errors', JSON.stringify(errs));
await b.close();
