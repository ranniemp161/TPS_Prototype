/* Tailored For You on a desktop width but a short window (read only): how the card and the open
   Read more text fit. W=1835 H=605 node lab/ty-short-window.mjs <outdir> */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const out = process.argv[2], W = +(process.env.W || 1835), H = +(process.env.H || 605);
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: W, height: H } });
await p.goto(pathToFileURL(process.cwd() + '/index/what-we-do.html').href);
await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(2000);
const top = await p.evaluate(() => document.querySelector('[data-ty]').getBoundingClientRect().top + scrollY);
await p.evaluate(y => scrollTo(0, y + innerHeight * 1.6), top); await p.waitForTimeout(1500);
await p.evaluate(() => document.querySelector('[data-ty] .tl-readmore__toggle').click()); await p.waitForTimeout(1500);
console.log(JSON.stringify(await p.evaluate(() => {
  const t = document.querySelector('[data-ty]'), c = t.querySelector('.ty__card'), r = c.getBoundingClientRect(), copy = t.querySelector('.tl-readmore__copy').getBoundingClientRect();
  const head = t.querySelector('.ty__head').getBoundingClientRect(), tr = t.querySelector('.ty__track');
  return { viewport: [innerWidth, innerHeight], cardH: Math.round(r.height), cardW: Math.round(r.width), textH: Math.round(copy.height), textBottomMinusCardBottom: Math.round(copy.bottom - r.bottom), trackMaxWidth: getComputedStyle(tr).maxWidth, isLive: t.classList.contains('is-live'), isWide: t.classList.contains('is-wide'), cardOverflow: getComputedStyle(c).overflow };
})));
await p.screenshot({ path: `${out}/short-${W}x${H}.png` });
await b.close();
