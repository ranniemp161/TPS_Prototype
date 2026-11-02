// Text to text gaps (TJ, 2 Nov 2026; Opus): the testimonials' names under the
// dots to the Book a consultation heading, and the bespoke line to Try a
// signature treatment. Only visible text in view counts.
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const b = await chromium.launch({ channel: 'chrome' });
for (const [w, h] of [[1440, 900], [1680, 850], [1280, 720], [1920, 1080], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(pathToFileURL(path.join(process.cwd(), 'index', 'index.html')).href);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(500);
  console.log(w + 'x' + h, await p.evaluate(() => {
    const vis = e => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return r.height > 0 && r.width > 0 && s.visibility !== 'hidden' && +s.opacity > 0.05 && r.right > 0 && r.left < innerWidth; };
    const stops = [...document.querySelectorAll('.voices .tv2__stop')].filter(vis);
    const namesBottom = Math.max(...stops.map(e => e.getBoundingClientRect().bottom));
    const arrows = [...document.querySelectorAll('.voices button')].filter(vis).map(e => Math.round(e.getBoundingClientRect().bottom));
    const ctaH = document.querySelector('.act--cta .display').getBoundingClientRect().top;
    const alt = document.querySelector('.act--cta .cta__alt--out').getBoundingClientRect().bottom;
    const tH = document.querySelector('.act--treatments-b .display, .act--treatments-b h2').getBoundingClientRect().top;
    return JSON.stringify({ namesToCta: Math.round(ctaH - namesBottom), bespokeToTreat: Math.round(tH - alt), arrowsBottom: arrows, namesBottom: Math.round(namesBottom) });
  }));
  await p.close();
}
await b.close();
