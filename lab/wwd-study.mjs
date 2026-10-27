import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(pathToFileURL(process.cwd() + '/index/what-we-do.html').href);
await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
const H = await p.evaluate(() => document.documentElement.scrollHeight);
const secs = await p.evaluate(() => [...document.querySelectorAll('[data-section]')].map(s => ({ n: s.getAttribute('data-section'), y: Math.round(s.getBoundingClientRect().top + scrollY), h: Math.round(s.getBoundingClientRect().height) })));
console.log(H, JSON.stringify(secs));
let i = 0;
for (let y = 0; y < H; y += 900) {
  await p.evaluate(y => window.scrollTo(0, y), y); await p.waitForTimeout(700);
  await p.screenshot({ path: `lab/wwd-study/s${String(i++).padStart(2, '0')}.png` });
}
await b.close();
