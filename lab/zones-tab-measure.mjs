/* Housekeeping zones tabs in tap mode: widths of the tabs, the gap, the marker.
   node lab/zones-tab-measure.mjs */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const b = await chromium.launch({ channel: 'chrome' });
for (const w of [360, 390, 430, 768, 1024]) {
  const p = await b.newPage({ viewport: { width: w, height: 844 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(pathToFileURL(process.cwd() + '/index/what-we-do.html').href);
  await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
  console.log(w, JSON.stringify(await p.evaluate(() => {
    const tl = document.querySelector('.zones__tabs'); if (!tl) return 'no tabs';
    const L = tl.getBoundingClientRect().left;
    return { list: Math.round(tl.getBoundingClientRect().width), tabs: [...tl.querySelectorAll('.zones__tab')].map(t => { const r = t.getBoundingClientRect(); return [Math.round(r.left - L), Math.round(r.width), t.scrollWidth > t.clientWidth + 1 ? 'OVERFLOW' : '']; }), mc: getComputedStyle(tl).getPropertyValue('--mc').trim(), marker: Math.round(tl.querySelector('.zones__marker').getBoundingClientRect().width), wrap: [...tl.querySelectorAll('.zones__tab')].some(t => t.getBoundingClientRect().height > 50) };
  })), 'errors', JSON.stringify(errs));
  await p.close();
}
await b.close();
