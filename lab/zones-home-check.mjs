/* Housekeeping zones, tap mode: the start circle returns to no room (TJ, 11 Oct 2026).
   W=390 node lab/zones-home-check.mjs <outdir> */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const out = process.argv[2], W = +(process.env.W || 390);
const b = await chromium.launch({ channel: 'chrome', args: ['--autoplay-policy=no-user-gesture-required'] });
const p = await b.newPage({ viewport: { width: W, height: 844 }, hasTouch: true, isMobile: true });
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(pathToFileURL(process.cwd() + '/index/what-we-do.html').href);
await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(2000);
await p.evaluate(() => document.querySelector('[data-zones-stage]').scrollIntoView({ block: 'start' }));
await p.waitForTimeout(6500);
const st = () => p.evaluate(() => {
  const tl = document.querySelector('.zones__tabs'), h = document.querySelector('.zones__home').getBoundingClientRect(), L = tl.getBoundingClientRect().left;
  return { marker: Math.round(document.querySelector('.zones__marker').getBoundingClientRect().width), home: Math.round(h.left + h.width / 2 - L) + 'x' + Math.round(h.width),
    selected: [...document.querySelectorAll('.zones__tab')].filter(t => t.getAttribute('aria-selected') === 'true').map(t => t.dataset.key),
    past: document.querySelectorAll('.zones__tab.is-past').length, stillOn: [...document.querySelectorAll('.zones__still.is-on')].map(s => s.dataset.zstill), panelH: document.querySelector('.zones__panels').style.height };
});
console.log('arrived ', JSON.stringify(await st()));
await p.tap('#zt-kitchen'); await p.waitForTimeout(1200);
console.log('kitchen ', JSON.stringify(await st()));
await p.screenshot({ path: `${out}/h-kitchen.png` });
await p.tap('.zones__home'); await p.waitForTimeout(1200);
console.log('home    ', JSON.stringify(await st()));
await p.screenshot({ path: `${out}/h-home.png` });
await p.tap('#zt-nursery'); await p.waitForTimeout(1200);
console.log('nursery ', JSON.stringify(await st()));
console.log('errors', JSON.stringify(errs));
await b.close();
