/* Day and Night Care on a phone: the section at points through its pin, as it stands.
   node lab/dn-phone-states.mjs <outdir> */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const out = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
await p.goto(pathToFileURL(process.cwd() + '/index/what-we-do.html').href);
await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1800);
const top = await p.evaluate(() => document.querySelector('.dn-wrap').getBoundingClientRect().top + scrollY);
const end = await p.evaluate(() => { const w = document.querySelector('.dn-wrap'); return w.getBoundingClientRect().bottom + scrollY; });
console.log('wrap top', Math.round(top), 'bottom', Math.round(end), 'height', Math.round(end - top));
let i = 0;
for (let y = top - 400; y < end; y += 420) { await p.evaluate(v => scrollTo(0, v), y); await p.waitForTimeout(700); await p.screenshot({ path: `${out}/s-${String(i++).padStart(2, '0')}.png` }); }
console.log('shots', i);
await b.close();
