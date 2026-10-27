/* The deck rests exactly on a screen (TJ, 14 Oct 2026). Forces a stop part way, then checks the snap back. */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const b = await chromium.launch({ channel: 'chrome' });
let bad = 0;
const p = await b.newPage({ viewport: { width: 1864, height: 984 } });
await p.goto(pathToFileURL(process.cwd() + '/index/build-your-programme.html').href);
await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
const off = () => p.evaluate(() => { const c = document.querySelector('.due-cal').getBoundingClientRect(); return Math.round(c.left + c.width / 2 - innerWidth / 2); });
// 1. a slide interrupted part way: Begin, then immediately jump the deck 182px short
await p.click('[data-next]'); await p.evaluate(() => { const d = document.querySelector('[data-deck]'); d.scrollTo({ left: d.clientWidth - 182, behavior: 'auto' }); });
await p.waitForTimeout(2500); let o = await off(); console.log('interrupted slide, off by', o); if (Math.abs(o) > 1) bad++;
// 2. a stray offset while resting
await p.evaluate(() => { const d = document.querySelector('[data-deck]'); d.scrollLeft = d.scrollLeft + 182; }); await p.waitForTimeout(1200);
o = await off(); console.log('stray offset at rest, off by', o); if (Math.abs(o) > 1) bad++;
// 3. a side panel opening (resize) mid rest
await p.setViewportSize({ width: 1500, height: 984 }); await p.waitForTimeout(800); await p.setViewportSize({ width: 1864, height: 984 }); await p.waitForTimeout(1200);
o = await off(); console.log('after resizes, off by', o); if (Math.abs(o) > 1) bad++;
await b.close();
console.log(bad ? bad + ' failed' : 'all passed');
