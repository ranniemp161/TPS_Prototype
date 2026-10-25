/* What We Do hero part sizes as the page scrolls. node lab/wwd-hero-scroll.mjs [w] [h] */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const [w = '1440', h = '900'] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: +w, height: +h } });
await p.goto(pathToFileURL(process.cwd() + '/index/what-we-do.html').href);
await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(2500);
for (const y of [0, 200, 400, 700, 1000]) {
  await p.mouse.wheel(0, y === 0 ? 0 : (y - (await p.evaluate(() => scrollY)))); await p.waitForTimeout(1200);
  console.log(`scroll ${String(Math.round(await p.evaluate(() => scrollY))).padStart(5)}:`, await p.evaluate(() => ['.op__kicker', '.op__hl', '.op__rows li:nth-child(2)'].map(s => {
    const e = document.querySelector(s); const r = e.getBoundingClientRect();
    return `${parseFloat(getComputedStyle(e).fontSize).toFixed(1)}px on screen ${Math.round(r.height)}px tall`;
  }).join(' | ')));
}
await p.screenshot({ path: 'lab/shots/b4/wwd-hero-top.png' });
await b.close();
