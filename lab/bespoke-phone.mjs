/* Build 10 phone check: the ticker band and the steps at 390x844. node lab/bespoke-phone.mjs <outdir> */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const out = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(pathToFileURL(process.cwd() + '/index/build-your-programme.html').href);
await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1200);
// Ported to the deck (restyle chat 1, 12 Oct 2026): each step is a deck page,
// reached by swiping the deck (instant), not by scrolling the window.
for (const [id, tag] of [['step-02', 'len'], ['step-05', 'treat'], ['step-06', 'rhythm']]) {
  await p.evaluate(i => { const d = document.querySelector('[data-deck]'), pg = document.getElementById(i).closest('.dk-page'); d.scrollTo({ left: pg.offsetLeft, behavior: 'instant' }); }, id);
  await p.waitForTimeout(900);
  await p.screenshot({ path: `${out}/ph-${tag}.png` });
}
await p.evaluate(() => document.querySelector('input[name="massage"]').click()); await p.waitForTimeout(250);
await p.screenshot({ path: `${out}/ph-rolling.png` });
await p.waitForTimeout(900);
const fee = await p.evaluate(() => ({ band: document.querySelector('.dk-fee__amount').textContent, live: document.querySelector('[data-fee]').textContent, bandShown: getComputedStyle(document.querySelector('.dk-fee')).display, overflow: document.documentElement.scrollWidth - innerWidth, windowScroll: scrollY }));
console.log(JSON.stringify(fee), 'errors', JSON.stringify(errs));
await b.close();
