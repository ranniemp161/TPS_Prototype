/* Housekeeping zones in tap mode (TJ, 11 Oct 2026): nothing chosen on arrival, the
   film stopping before any room lights, the line at the far left; then taps.
   node lab/zones-unlit-check.mjs <outdir> */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const out = process.argv[2];
const b = await chromium.launch({ channel: 'chrome', args: ['--autoplay-policy=no-user-gesture-required'] });
const p = await b.newPage({ viewport: { width: +(process.env.W || 390), height: 844 } });
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(pathToFileURL(process.cwd() + '/index/what-we-do.html').href);
await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(2000);
await p.evaluate(() => document.querySelector('[data-zones-stage]').scrollIntoView({ block: 'start' }));
const st = () => p.evaluate(() => {
  const v = document.querySelector('[data-zvideo]'), tl = document.querySelector('.zones__tabs');
  return { film: v.currentTime.toFixed(2), paused: v.paused, mc: getComputedStyle(tl).getPropertyValue('--mc').trim(), marker: Math.round(document.querySelector('.zones__marker').getBoundingClientRect().width),
    selected: [...document.querySelectorAll('.zones__tab')].filter(t => t.getAttribute('aria-selected') === 'true').map(t => t.dataset.key),
    past: [...document.querySelectorAll('.zones__tab.is-past')].map(t => t.dataset.key),
    stillOn: [...document.querySelectorAll('.zones__still.is-on')].map(s => s.dataset.zstill), panelH: document.querySelector('.zones__panels').style.height };
});
await p.waitForTimeout(6500);
console.log('arrived', JSON.stringify(await st()));
await p.screenshot({ path: `${out}/z-arrived.png` });
for (const k of ['kitchen', 'living', 'nursery']) {
  await p.click(`#zt-${k}`); await p.waitForTimeout(250);
  const mid = await st();
  await p.waitForTimeout(900);
  console.log('tap', k, 'mid marker', mid.marker, 'settled', JSON.stringify(await st()));
  await p.screenshot({ path: `${out}/z-${k}.png` });
}
console.log('errors', JSON.stringify(errs));
await b.close();
