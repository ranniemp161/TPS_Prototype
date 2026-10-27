/* What We Do phones: from Mother and Baby Care, one swipe back up should land on the last room. node lab/wwd-tap-return-check.mjs */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const b = await chromium.launch({ channel: 'chrome' });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
const p = await ctx.newPage();
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(pathToFileURL(process.cwd() + '/index/what-we-do.html').href);
await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(2500);
const cdp = await ctx.newCDPSession(p);
const st = () => p.evaluate(() => { const c = document.querySelector('.route__stop.is-current'); const n = document.querySelector('.flight').nextElementSibling.getBoundingClientRect().top; return 'y ' + Math.round(scrollY) + ' t ' + window.__flight.state().target.toFixed(2) + ' cur ' + (c ? c.dataset.stop : '-') + ' nextTop ' + Math.round(n); });
const top = await p.evaluate(() => window.__flight.state().top);
await p.evaluate(y => scrollTo(0, y), Math.round(top + 0.3 * 844)); await p.waitForTimeout(2500);
for (let i = 0; i < 5; i++) { await p.tap('[data-step="1"]'); await p.waitForTimeout(i < 4 ? 3200 : 6000); }
console.log('landed', await st());
for (const [label, dist] of [['short swipe', 120], ['long swipe', 400]]) {
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 200, y: 300 }] });
  for (let k = 1; k <= 10; k++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 200, y: 300 + k * dist / 10 }] }); await p.waitForTimeout(16); }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  console.log(label, 'just after', await st());
  await p.waitForTimeout(4000);
  console.log(label, await st());
  // back to the landing for the next try
  await p.tap('[data-step="1"]').catch(() => {}); await p.waitForTimeout(6000);
}
// swipe up from inside the hold still leaves downward
console.log('errors', JSON.stringify(errs));
await b.close();
