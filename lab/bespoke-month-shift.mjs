/* Does the due screen move when the month arrows change the calendar?
   Steps forward twelve months and back, logging where the title, the month
   name, the arrows and the baby toggles sit each time.
   node lab/bespoke-month-shift.mjs [width] [height] */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const [w = '1440', h = '900'] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: +w, height: +h } });
await p.goto(pathToFileURL(process.cwd() + '/index/build-your-programme.html').href);
await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
await p.click('.dk-next'); await p.waitForTimeout(1100);
const snap = () => p.evaluate(() => {
  const q = s => { const e = document.querySelector(s); return e ? Math.round(e.getBoundingClientRect().top) : null; };
  return { title: q('#step-due .dk-step'), month: q('[data-due-month]'), arrow: q('[data-due-step="1"]'), first: q('label:has(#dkd-child-1)'), third: q('label:has(#dkd-child-3)'), rows: Math.ceil(document.querySelectorAll('[data-due-grid] > *').length / 7), name: document.querySelector('[data-due-month]').textContent };
});
const base = await snap();
let moved = 0;
for (const dir of [1, -1]) {
  for (let i = 0; i < 12; i++) {
    await p.click(`[data-due-step="${dir}"]`); await p.waitForTimeout(500);
    const s = await snap();
    const d = ['title', 'month', 'arrow', 'first', 'third'].filter(k => s[k] !== base[k]);
    if (d.length) { moved++; console.log(`${s.name.padEnd(16)} rows ${s.rows}: moved ${d.map(k => `${k} ${base[k]}->${s[k]}`).join(', ')}`); }
  }
}
console.log(moved ? `${moved} month changes moved something` : 'nothing moved on any month change', `(base: ${base.name}, ${base.rows} rows)`);
await b.close();
