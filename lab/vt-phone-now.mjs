/* A Day With Us on a phone: the section at points through its scroll, as it stands.
   node lab/vt-phone-now.mjs <outdir> */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const out = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
await p.goto(pathToFileURL(process.cwd() + '/index/what-we-do.html').href);
await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1800);
const r = await p.evaluate(() => { const s = document.querySelector('.dn-wrap').nextElementSibling; let e = s; while (e && !(e.matches && e.matches('section'))) e = e.nextElementSibling; const x = document.querySelector('[data-section*="day"]:not(.dn-wrap)') ; const vt = [...document.querySelectorAll('section')].find(q => /A Day With Us/i.test(q.textContent)); const b = vt.getBoundingClientRect(); return { cls: vt.className, sec: vt.dataset.section, top: Math.round(b.top + scrollY), h: Math.round(b.height) }; });
console.log(JSON.stringify(r));
let i = 0;
for (let y = r.top - 600; y < r.top + r.h; y += 380) { await p.evaluate(v => scrollTo(0, v), y); await p.waitForTimeout(800); await p.screenshot({ path: `${out}/v-${String(i++).padStart(2, '0')}.png` }); }
console.log('shots', i);
await b.close();
